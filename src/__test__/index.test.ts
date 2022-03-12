import * as Providers from '../index'

test('export ftx', () => {
  expect(Providers.ftx).toHaveProperty('Stream')
  expect(Providers.ftx).toHaveProperty('MarketsClient')
  expect(Providers.ftx).toHaveProperty('OrdersClient')
  expect(Providers.ftx).toHaveProperty('WalletClient')
})

test('export registerLoggerCreator', () => {
  expect(Providers.registerLoggerCreator).toBeDefined()
})
