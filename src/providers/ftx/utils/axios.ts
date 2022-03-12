import _ from 'lodash'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import auth from './interceptors/auth'
import * as res from './interceptors/res'
import proxy from './interceptors/proxy'
import { FtxApiConfig } from '../types'

const oldCreate = axios.create

export interface FtxApiClient extends AxiosInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T>
}

export const createClient = (
  axiosConfig: AxiosRequestConfig,
  ftxConfig: FtxApiConfig
) => {
  const client = oldCreate({
    timeout: 15000,
    ...axiosConfig,
  }) as FtxApiClient
  client.interceptors.request.use(auth.bind(null, ftxConfig))
  client.interceptors.request.use(proxy.bind(null, ftxConfig))
  client.interceptors.response.use(
    res.onResponseFulfilled,
    res.onResponseRejected
  )

  if (ftxConfig.dryRun) {
    client.post = <T>(...args: any[]) =>
      Promise.resolve() as unknown as Promise<T>
    client.delete = <T>(...args: any[]) =>
      Promise.resolve() as unknown as Promise<T>
  }

  return client
}

export default axios
