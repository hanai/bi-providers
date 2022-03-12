import EventEmitter from 'events'
import WebSocket from 'ws'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { createLogger } from '../../../utils/logger'
import { generateWebSocketSign } from '../utils/sign'
import { FtxStreamConfig, FtxStreamError, StreamErrorCode } from '../types'

const debug = require('debug')('ftx:stream')

const DEFAULT_ENDPOINT = 'wss://ftx.com/ws/'
const DEFAULT_MAX_RETRY_COUNT = 5
const DEFAULT_PING_INTERVAL = 12000
const DEFAULT_RECONNECT_TIMEOUT = 5000

export default class Stream extends EventEmitter {
  private subs: {
    subMsg: () => any
    unsubMsg?: () => any
    filter?: (value: any) => boolean
    cb?: (message: any) => any
  }[] = []
  private config: FtxStreamConfig
  private keepAliveTimer?: NodeJS.Timeout
  private reconnectTimer?: NodeJS.Timeout
  private ws?: WebSocket
  private logger = createLogger('ftx')
  private retryCount = 0

  constructor(config: FtxStreamConfig) {
    super()
    this.config = Object.assign(
      {},
      {
        maxRetryCount: DEFAULT_MAX_RETRY_COUNT,
        endpoint: DEFAULT_ENDPOINT,
        pingInterval: DEFAULT_PING_INTERVAL,
        reconnectTimeout: DEFAULT_RECONNECT_TIMEOUT,
      },
      config
    )
  }

  private send(message: any) {
    try {
      const msg =
        typeof message === 'string' ? message : JSON.stringify(message)
      this.ws?.send(msg)
    } catch (err) {
      this.logger.error({
        tag: 'WebSocket send error',
        error: err,
      })
    }
  }

  private sendPing() {
    this.send({
      op: 'ping',
    })
  }

  private startKeepAlive() {
    const { pingInterval } = this.config
    if (this.keepAliveTimer != null) return
    this.sendPing()
    this.keepAliveTimer = setInterval(() => {
      this.sendPing()
    }, pingInterval)
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer != null) {
      clearInterval(this.keepAliveTimer)
      this.keepAliveTimer = undefined
    }
  }

  private buildAuthMsg = () => {
    const ts = Date.now()
    const sign = generateWebSocketSign({
      timestamp: ts,
      token: this.config.ftxToken,
    })
    return {
      op: 'login',
      args: {
        key: this.config.ftxKey,
        sign: sign,
        time: ts,
        subaccount: this.config.ftxSubAccount,
      },
    }
  }

  private reset() {
    this.subs = []
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer)
      this.keepAliveTimer = undefined
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
    this.ws = undefined
    this.retryCount = 0
  }

  auth() {
    this.subs.push({
      subMsg: this.buildAuthMsg,
    })
    this.send(this.buildAuthMsg())
  }

  subscribeChannel(
    channel: string,
    data: any,
    filter: (message: any) => boolean,
    cb: (message: any) => any
  ) {
    const msg = {
      op: 'subscribe',
      channel: channel,
      ...data,
    }
    this.subs.push({
      subMsg: () => msg,
      cb: cb,
      filter,
    })
    this.send(msg)
  }

  connect() {
    const { httpProxy, endpoint } = this.config

    return new Promise<void>((resolve, reject) => {
      const ws = (this.ws = new WebSocket(endpoint!, {
        perMessageDeflate: false,
        agent:
          httpProxy != null && httpProxy !== ''
            ? new HttpsProxyAgent(httpProxy)
            : undefined,
      }))

      let opened = false
      ws.on('open', () => {
        opened = true
        this.onWSOpen()
        resolve()
      })
      ws.on('error', (err) => {
        if (!opened) {
          reject(err)
        }
        this.onWSError(err)
      })
      ws.on('close', this.onWSClose.bind(this))
      ws.on('message', this.onWSMessage.bind(this))
    })
  }

  disconnect() {
    this.ws?.close(1000)
    this.reset()
  }

  private onWSOpen() {
    debug('onWSOpen')
    this.startKeepAlive()
  }

  private onWSClose(code: number, reason: Buffer) {
    debug('onWSClose', code, reason?.toString())
    const { reconnectTimeout } = this.config
    this.stopKeepAlive()

    if (code === 1000) {
      this.logger.info({
        tag: 'WebSocket closed normally',
        code: code,
        reason: reason,
      })
    } else {
      this.logger.error({
        tag: 'WebSocket closed abnormally',
        code: code,
        reason: reason,
      })
      this.reconnectTimer = setTimeout(() => {
        this.tryReconnect(code)
      }, reconnectTimeout)
    }
  }

  private onWSError(err: Error) {
    debug('onWSError', err)
    this.logger.error({
      tag: 'WebSocket error',
      error: err,
    })
  }

  private async tryReconnect(e?: any) {
    debug('tryReconnect', e)
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
    const { maxRetryCount } = this.config
    if (this.retryCount < maxRetryCount!) {
      this.retryCount++
      await this.reconnect(e)
    } else {
      this.logger.error({
        tag: 'WebSocket exceeded max retry count',
        error: e,
      })
      this.emit(
        'error',
        new FtxStreamError({
          code: StreamErrorCode.EXCEEDED_MAX_RETRY_COUNT,
          error: e,
        })
      )
    }
  }

  private async reconnect(e?: any) {
    debug('reconnect', e)
    const { reconnectTimeout } = this.config

    try {
      await this.connect()

      this.subs.forEach((item) => {
        const msg = item.subMsg()
        this.send(msg)
      })

      this.retryCount = 0
    } catch (err) {
      this.logger.error({
        tag: 'WebSocket reconnect failed',
        error: err,
      })
      this.reconnectTimer = setTimeout(() => {
        this.tryReconnect(err)
      }, reconnectTimeout)
    }
  }

  private onWSMessage(data: WebSocket.RawData) {
    try {
      const json = JSON.parse(data.toString())
      this.subs.forEach((item) => {
        if (item.filter && item.cb && item.filter(json)) {
          item.cb(json)
        }
      })
    } catch (err) {
      this.logger.error({
        tag: 'WebSocket onmessage error',
        error: err,
      })
    }
  }
}
