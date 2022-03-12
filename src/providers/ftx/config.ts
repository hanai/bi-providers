const authRequired: string[] = [
  'GET:^\\/wallet\\/balances',
  'GET:^\\/orders',
  'POST:^\\/orders',
  'DELETE:^\\/orders',
  'GET:^\\/orders\\/history',
  'DELETE:^\\/orders\\/by_client_id\\/.+',
]

const config = {
  authRequired: authRequired,
}

export default config
