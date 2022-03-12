import { FtxApiConfig } from '../types'
import { createClient, FtxApiClient } from '../utils/axios'

class WalletClient {
  axiosClient: FtxApiClient

  constructor(ftxConfig: FtxApiConfig) {
    this.axiosClient = createClient(
      {
        baseURL: 'https://ftx.com/api',
      },
      ftxConfig
    )
  }

  getBalance = () => {
    return this.axiosClient.get<
      {
        coin: string
        free: number
        spotBorrow: number
        total: number
        usdValue: number
        availableWithoutBorrow: number
      }[]
    >('/wallet/balances')
  }
}

export default WalletClient
