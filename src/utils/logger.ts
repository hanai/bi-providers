import debug from 'debug'
import { Logger } from '../types'

let _creator = (name: string, label?: string): Logger => {
  const logger = debug(`${name}${typeof label === 'string' ? `:${label}` : ''}`)
  return {
    error: logger.bind(null, 'error'),
    info: logger.bind(null, 'info'),
    warn: logger.bind(null, 'warn'),
  }
}

export const createLogger: (name: string, label?: string) => Logger = (
  name,
  label
) => {
  return _creator(name, label)
}

export const registerLoggerCreator = (
  creator: (name: string, label?: string) => Logger
) => {
  _creator = creator
}
