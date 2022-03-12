export class ApiError extends Error {
  // {"data":{"error":"Order already queued for cancellation","success":false},"status":400}
  // {"data":{"error":"Please try again","success":false},"status":503}
  // {"data":{"success":false,"error":"Order not found"},"status":404}
  // {"data":{"error":"Do not send more than 2 orders total per 200ms","success":false},"status":429}
  originalError?: any
  data: { success: boolean; error: string }
  status?: number
  constructor(args: {
    status?: number
    data?: { success: boolean; error: string } | any
    error?: any
  }) {
    const { status, data, error } = args
    const isUnknownError = typeof data?.error !== 'string'
    const errorMessage = isUnknownError ? 'Unknown error' : data.error
    super(errorMessage)
    if (isUnknownError) {
      this.originalError = error
    }
    this.data = data
    this.status = status
  }
}

export class FtxStreamError extends Error {
  code: StreamErrorCode
  originalError?: any
  constructor(args: { code: StreamErrorCode; error?: any }) {
    const { code, error } = args
    super(code)
    this.code = code
    this.originalError = error
  }
}

export interface FtxApiConfig {
  ftxKey: string
  ftxToken: string
  ftxSubAccount?: string
  httpProxy?: string
  dryRun?: boolean
}

export interface FtxStreamConfig {
  httpProxy?: string
  ftxKey: string
  ftxToken: string
  ftxSubAccount?: string
  maxRetryCount?: number
  endpoint?: string
  pingInterval?: number
  reconnectTimeout?: number
}

export type OrderStatus = 'new' | 'open' | 'closed'

export type OrderSide = 'buy' | 'sell'

export type OrderType = 'market' | 'limit'

export enum StreamErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  EXCEEDED_MAX_RETRY_COUNT = 'EXCEEDED_MAX_RETRY_COUNT',
}

export interface Order {
  avgFillPrice: number | null
  clientId: string | null
  createdAt: string
  filledSize: number
  id: number
  market: string
  postOnly: false
  price: number
  reduceOnly: boolean
  remainingSize: number
  side: OrderSide
  size: number
  status: OrderStatus
  type: OrderType
}

export type OrdersStreamData = {
  status: Exclude<OrderStatus, 'open'>
} & Order

export type FillsStreamData = {
  baseCurrency: string
  fee: number
  feeCurrency: string
  feeRate: number
  future: null | string
  id: number
  liquidity: 'maker' | 'taker'
  market: string
  orderId: number
  price: number
  quoteCurrency: string
  side: OrderSide
  size: number
  time: string
  tradeId: number
  type: 'order'
}
