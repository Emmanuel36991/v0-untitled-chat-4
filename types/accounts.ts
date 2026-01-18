export type AccountType = 'personal' | 'funded' | 'challenge' | 'demo'

export interface TradingAccount {
  id: string
  user_id: string
  name: string
  type: AccountType
  initial_balance: number
  currency: string
  is_default: boolean
  created_at: string
}

export interface CreateAccountInput {
  name: string
  type: AccountType
  initial_balance: number
  currency?: string
  is_default?: boolean
}
