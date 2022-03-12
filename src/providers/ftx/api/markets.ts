import { FtxApiConfig } from '../types'
import { createClient, FtxApiClient } from '../utils/axios'
class MarketsClient {
  axiosClient: FtxApiClient

  constructor(ftxConfig: FtxApiConfig) {
    this.axiosClient = createClient(
      {
        baseURL: 'https://ftx.com/api',
      },
      ftxConfig
    )
  }

  getMarkets = () => {
    return this.axiosClient.get<
      {
        name: string
        baseCurrency: string
        quoteCurrency: string
        quoteVolume24h: number
        change1h: number
        change24h: number
        changeBod: number
        highLeverageFeeExempt: boolean
        minProvideSize: number
        type: 'future' | 'spot'
        underlying?: string
        enabled: boolean
        ask: number
        bid: number
        last: number
        postOnly: boolean
        price: number
        priceIncrement: number
        sizeIncrement: number
        restricted: boolean
        volumeUsd24h: number
      }[]
    >('/markets')
  }

  getSingleMarket = (params: { name: string }) => {
    const { name } = params
    const url = `/markets/${name}`
    return this.axiosClient.get<{
      name: string
      enabled: boolean
      postOnly: boolean
      priceIncrement: number
      sizeIncrement: number
      minProvideSize: number
      last: number
      bid: number
      ask: number
      price: number
      type: 'spot'
      baseCurrency: string
      quoteCurrency: string
      restricted: boolean
      highLeverageFeeExempt: boolean
      change1h: number
      change24h: number
      changeBod: number
      quoteVolume24h: number
      volumeUsd24h: number
    }>(url)
  }

  getOrderBook = (params: { name: string; depth?: number }) => {
    const { name, depth = 20 } = params
    const url = `/markets/${name}/orderbook?depth=${depth}`
    return this.axiosClient.get<{
      asks: [number, number][]
      bids: [number, number][]
    }>(url)
  }
}

export default MarketsClient
