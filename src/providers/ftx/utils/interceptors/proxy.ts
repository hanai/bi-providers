import { AxiosRequestConfig } from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { FtxApiConfig } from '../../types'

const ClientCache = new Map()

export default (ftxConfig: FtxApiConfig, axiosConfig: AxiosRequestConfig) => {
  if (typeof ftxConfig.httpProxy === 'string') {
    let client = ClientCache.get(ftxConfig.httpProxy)
    if (client == null) {
      client = new HttpsProxyAgent(ftxConfig.httpProxy)
      ClientCache.set(ftxConfig.httpProxy, client)
    }
    axiosConfig.httpsAgent = client
  }
  return axiosConfig
}
