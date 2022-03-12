import { createLogger, registerLoggerCreator } from '../logger'
import debug from 'debug'

jest.mock('debug', () => jest.fn())

const mockDebug = debug as jest.MockedFunction<typeof debug>

test('createLogger', async () => {
  const testName = 'test_name'
  const testLabel = 'test_label'
  const errorMsg = 'error_message'
  const infoMsg = 'info_message'
  const warnMsg = 'warn_message'

  const loggerFunc = jest.fn()
  mockDebug.mockReturnValue(
    loggerFunc as unknown as jest.MockedFunction<debug.Debugger>
  )

  const logger = createLogger(testName, testLabel)

  expect(debug).toBeCalledWith(`${testName}:${testLabel}`)

  logger.error(errorMsg)
  expect(loggerFunc).toBeCalledWith('error', errorMsg)
  logger.info(infoMsg)
  expect(loggerFunc).toBeCalledWith('info', infoMsg)
  logger.warn(warnMsg)
  expect(loggerFunc).toBeCalledWith('warn', warnMsg)
})
