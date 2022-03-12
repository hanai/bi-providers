import crypto from 'crypto'

export const generateSign = (params: {
  timestamp: number
  method: string
  url: string
  body?: { [key: string]: any }
  token: string
}) => {
  const msg = `${params.timestamp}${params.method.toUpperCase()}/api${
    params.url
  }${
    params.body != null && Object.keys(params.body).length
      ? JSON.stringify(params.body)
      : ''
  }`

  const sign = crypto
    .createHmac('sha256', params.token)
    .update(msg)
    .digest('hex')
  return sign
}

export const generateWebSocketSign = (params: {
  timestamp: number
  token: string
}) => {
  const msg = `${params.timestamp}websocket_login`

  const sign = crypto
    .createHmac('sha256', params.token)
    .update(msg)
    .digest('hex')
  return sign
}
