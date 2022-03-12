import { AddressInfo } from 'net'
import { WebSocketServer } from 'ws'
import { FtxStreamError, StreamErrorCode } from '../../types'
import Stream from '../index'

const TEST_KEY = 'test_key'
const TEST_TOKEN = 'test_token'
const ENDPOINT = 'ws://localhost'

describe('Stream', () => {
  it('can connect to server', (done) => {
    const wss = new WebSocketServer({ port: 0 })
    const { port } = wss.address() as AddressInfo
    const onConnection = jest.fn()
    wss.on('connection', onConnection)

    const stream = new Stream({
      ftxKey: TEST_KEY,
      ftxToken: TEST_TOKEN,
      endpoint: `${ENDPOINT}:${port}`,
    })

    stream
      .connect()
      .then(() => {
        stream.disconnect()
        expect(onConnection).toBeCalled()
        wss.close(done)
      })
      .catch(done)
  })

  it('can keep alive', (done) => {
    const wss = new WebSocketServer({ port: 0 })
    const { port } = wss.address() as AddressInfo
    let pingCount = 0

    wss.on('connection', (socket) => {
      socket.on('message', (buf) => {
        const data = JSON.parse(buf.toString())
        if (data.op === 'ping') {
          pingCount++
        }
      })
    })

    const stream = new Stream({
      ftxKey: TEST_KEY,
      ftxToken: TEST_TOKEN,
      endpoint: `${ENDPOINT}:${port}`,
      pingInterval: 200,
    })

    stream
      .connect()
      .then(() => {
        setTimeout(() => {
          stream.disconnect()
          expect(pingCount).not.toBeLessThan(10)
          wss.close(done)
        }, 2000)
      })
      .catch(done)
  })

  it('can auth', (done) => {
    const wss = new WebSocketServer({ port: 0 })
    const { port } = wss.address() as AddressInfo
    const onMessage = jest.fn()

    wss.on('connection', (socket) => {
      socket.on('message', (buf) => {
        const data = JSON.parse(buf.toString())
        onMessage(data)
      })
    })

    const stream = new Stream({
      ftxKey: TEST_KEY,
      ftxToken: TEST_TOKEN,
      endpoint: `${ENDPOINT}:${port}`,
    })

    stream
      .connect()
      .then(() => {
        stream.auth()
        stream.disconnect()
        setTimeout(() => {
          expect(
            onMessage.mock.calls.findIndex(
              ([data]) => data.op === 'login' && data.args.key === TEST_KEY
            )
          ).toBeGreaterThan(-1)
          wss.close(done)
        }, 1000)
      })
      .catch(done)
  })

  it('can reconnect after connection close', (done) => {
    const wss = new WebSocketServer({ port: 0 })
    const { port } = wss.address() as AddressInfo
    const onConnection = jest.fn()
    let closeCount = 0
    wss.on('connection', (socket) => {
      onConnection()
      if (closeCount < 3) {
        socket.close()
      }
      closeCount++
    })

    const stream = new Stream({
      ftxKey: TEST_KEY,
      ftxToken: TEST_TOKEN,
      endpoint: `${ENDPOINT}:${port}`,
      reconnectTimeout: 300,
    })

    stream
      .connect()
      .then(() => {
        setTimeout(() => {
          stream.disconnect()
          expect(onConnection).toBeCalledTimes(4)
          wss.close(done)
        }, 2000)
      })
      .catch(() => {
        wss.close(done)
      })
  })

  it('will throw error after reconnect failed 4 times', (done) => {
    const stream = new Stream({
      ftxKey: TEST_KEY,
      ftxToken: TEST_TOKEN,
      endpoint: `${ENDPOINT}:0`,
      reconnectTimeout: 300,
      maxRetryCount: 4,
    })

    const reconnectSpy = jest.spyOn(stream as any, 'reconnect')

    const onError = jest.fn()
    stream.on('error', onError)

    stream.connect().catch((err) => {
      setTimeout(() => {
        stream.disconnect()
        expect(reconnectSpy).toBeCalledTimes(4)
        expect(onError).toBeCalledTimes(1)
        expect(onError.mock.calls[0][0].code).toBe(
          StreamErrorCode.EXCEEDED_MAX_RETRY_COUNT
        )
        done()
      }, 2000)
    })
  })
})
