import _ from 'lodash'
import axios, { AxiosResponse } from 'axios'
import { Logger } from '../../../../types'
import { createLogger } from '../../../../utils/logger'
import { ApiError } from '../../types'

let logger: Logger

export const onResponseFulfilled = (res: AxiosResponse) => {
  const data = res.data
  return data.result
}

export const onResponseRejected = (err: any) => {
  if (!logger) {
    logger = createLogger('ftx')
  }
  if (axios.isAxiosError(err)) {
    const {
      config: { baseURL, data: reqData, headers, method, url, params },
      response: { status, data: resData, headers: resHeaders } = {},
    } = err
    logger.error({
      req: {
        url: `${baseURL}${url}`,
        data: reqData,
        params: params,
        headers: _.pick(headers, ['FTX-SUBACCOUNT', 'method', 'url']),
        method,
      },
      res: {
        status,
        data: resData,
        headers: _.pick(resHeaders, [
          'account-id',
          'connection',
          'content-length',
          'content-type',
        ]),
      },
    })
  } else {
    logger.error({
      error: err,
    })
  }

  throw new ApiError({
    data: err.response?.data,
    status: err.response?.status,
    error: err,
  })
}
