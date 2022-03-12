import _ from 'lodash'
import retryWhen from 'retry-when'
import rateLimiter from '@hanai/promise-rate-limiter'
import { ApiError, FtxApiConfig, Order, OrderSide, OrderType } from '../types'
import { createClient, FtxApiClient } from '../utils/axios'
import { PLACE_ORDER_LIMIT_TIMEOUT } from '../constants'

const canRetryPlaceOrder = (err: any) =>
  err instanceof ApiError && [429, 503].includes(err.status as number)

const MAX_RETRY_COUNT = 3

class OrdersClient {
  axiosClient: FtxApiClient

  constructor(ftxConfig: FtxApiConfig) {
    this.axiosClient = createClient(
      {
        baseURL: 'https://ftx.com/api',
      },
      ftxConfig
    )

    this._placeOrder = rateLimiter(
      this._placeOrder.bind(this),
      PLACE_ORDER_LIMIT_TIMEOUT
    )
  }

  private _placeOrder(params: {
    market: string
    side: OrderSide
    price: number
    type: OrderType
    size: number
    reduceOnly?: boolean
    ioc?: boolean
    postOnly?: boolean
    clientId?: string
    rejectOnPriceBand?: boolean
  }) {
    return this.axiosClient.post<Order>('/orders', {
      ...params,
    })
  }

  async batchPlaceOrder(
    orders: {
      market: string
      side: OrderSide
      price: number
      type: OrderType
      size: number
      reduceOnly?: boolean
      ioc?: boolean
      postOnly?: boolean
      clientId?: string
      rejectOnPriceBand?: boolean
    }[],
    opts?: {
      autoRetry?: boolean
    }
  ): Promise<Order[]> {
    const { autoRetry = false } = opts || {}
    if (orders.length) {
      const resList = []
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i]
        try {
          const res = await this._placeOrder(order)
          resList.push(res)
        } catch (err) {
          if (err instanceof ApiError) {
            resList.push(err)
          } else {
            resList.push(
              new ApiError({
                data: {
                  success: false,
                  error: JSON.stringify(err),
                },
              })
            )
          }
        }
      }

      if (autoRetry) {
        for (let retryCount = 0; retryCount < MAX_RETRY_COUNT; retryCount++) {
          for (let i = 0; i < resList.length; i++) {
            const item = resList[i]
            if (canRetryPlaceOrder(item)) {
              const order = orders[i]
              try {
                const res = await this._placeOrder(order)
                resList[i] = res
              } catch (err) {
                if (err instanceof ApiError) {
                  resList[i] = err
                } else {
                  throw err
                }
              }
            }
          }
        }
      }

      if (resList.filter((e) => _.isError(e)).length) {
        throw resList
      } else {
        return resList as Order[]
      }
    } else {
      return []
    }
  }

  async placeOrder(
    params: {
      market: string
      side: OrderSide
      price: number
      type: OrderType
      size: number
      reduceOnly?: boolean
      ioc?: boolean
      postOnly?: boolean
      clientId?: string
      rejectOnPriceBand?: boolean
    },
    opts?: {
      autoRetry?: boolean
    }
  ) {
    const { autoRetry = false } = opts || {}
    return retryWhen({
      func: this._placeOrder.bind(this),
      when: (err, res, { retryCount }) =>
        autoRetry &&
        err != null &&
        canRetryPlaceOrder(err) &&
        retryCount <= MAX_RETRY_COUNT,
      delayGenerator: () => 0,
    })(params)
  }

  getOrderHistory(params: {
    market?: string
    side?: OrderSide
    orderType?: OrderType
    startTime?: number
    endTime?: number
  }) {
    const { startTime, endTime, ...otherParams } = params
    return this.axiosClient.get<Order>('/orders/history', {
      params: {
        start_time: startTime,
        end_time: endTime,
        ...otherParams,
      },
    })
  }

  getOpenOrders(params?: { market?: string }) {
    return this.axiosClient.get<Order[]>('/orders', {
      params,
    })
  }

  cancelAllOrders(params?: {
    market?: string
    side?: OrderSide
    conditionalOrdersOnly?: boolean
    limitOrdersOnly?: boolean
  }) {
    return this.axiosClient.delete('/orders', {
      data: params,
    })
  }

  cancelOrderByClientId(clientId: string) {
    if (clientId.indexOf('/') > -1) {
      throw new Error('clientId cannot contain char /')
    }
    return this.axiosClient.delete(`/orders/by_client_id/${clientId}`)
  }
}

export default OrdersClient
