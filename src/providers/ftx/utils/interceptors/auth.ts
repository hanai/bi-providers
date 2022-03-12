import { AxiosRequestConfig } from 'axios'
import CONFIG from '../../config'
import { FtxApiConfig } from '../../types'
import { generateSign } from '../sign'

export default (ftxConfig: FtxApiConfig, axiosConfig: AxiosRequestConfig) => {
  const { ftxKey, ftxToken, ftxSubAccount } = ftxConfig
  const { method, url = '', headers = {} } = axiosConfig

  const shortUrl = url.replace(/^(https?:)?\/\/[^/]+/, '')

  const needAuth = CONFIG.authRequired.some((e) => {
    const [m, r] = e.split(':')
    if (m === method?.toUpperCase()) {
      const reg = new RegExp(r)
      return reg.test(shortUrl)
    }
    return false
  })

  if (needAuth) {
    const ts = Date.now()
    headers['FTX-KEY'] = ftxKey
    headers['FTX-TS'] = ts.toString()
    headers['FTX-SIGN'] = generateSign(
      Object.assign(
        {
          timestamp: ts,
          method: method!,
          url: shortUrl,
          token: ftxToken,
        },
        ['POST', 'DELETE'].includes(method?.toUpperCase() || '')
          ? {
              body: axiosConfig.data || {},
            }
          : null
      )
    )
    headers['Content-Type'] = 'application/json'
    if (ftxSubAccount != null && ftxSubAccount !== '') {
      headers['FTX-SUBACCOUNT'] = ftxSubAccount
    }
  }

  return axiosConfig
}
