// Alpaca Trading API v2 Types

/**
 * Alpaca account information returned by GET /v2/account
 */
export interface AlpacaAccount {
  id: string
  account_number: string
  status: "ONBOARDING" | "SUBMISSION_FAILED" | "SUBMITTED" | "ACCOUNT_UPDATED" | "APPROVAL_PENDING" | "ACTIVE" | "REJECTED"
  currency: string
  buying_power: string
  cash: string
  portfolio_value: string
  pattern_day_trader: boolean
  trading_blocked: boolean
  transfers_blocked: boolean
  account_blocked: boolean
  created_at: string
  shorting_enabled: boolean
  equity: string
  last_equity: string
  long_market_value: string
  short_market_value: string
  initial_margin: string
  maintenance_margin: string
  daytrade_count: number
  sma: string
}

/**
 * Alpaca order object returned by GET /v2/orders
 */
export interface AlpacaOrder {
  id: string
  client_order_id: string
  created_at: string
  updated_at: string
  submitted_at: string
  filled_at: string | null
  expired_at: string | null
  canceled_at: string | null
  failed_at: string | null
  replaced_at: string | null
  replaced_by: string | null
  replaces: string | null
  asset_id: string
  symbol: string
  asset_class: "us_equity" | "crypto"
  notional: string | null
  qty: string | null
  filled_qty: string
  filled_avg_price: string | null
  order_class: "" | "simple" | "bracket" | "oco" | "oto"
  order_type: "market" | "limit" | "stop" | "stop_limit" | "trailing_stop"
  type: "market" | "limit" | "stop" | "stop_limit" | "trailing_stop"
  side: "buy" | "sell"
  time_in_force: "day" | "gtc" | "opg" | "cls" | "ioc" | "fok"
  limit_price: string | null
  stop_price: string | null
  status: AlpacaOrderStatus
  extended_hours: boolean
  legs: AlpacaOrder[] | null
  trail_percent: string | null
  trail_price: string | null
  hwm: string | null
}

export type AlpacaOrderStatus =
  | "new"
  | "partially_filled"
  | "filled"
  | "done_for_day"
  | "canceled"
  | "expired"
  | "replaced"
  | "pending_cancel"
  | "pending_replace"
  | "pending_new"
  | "accepted"
  | "stopped"
  | "rejected"
  | "suspended"
  | "calculated"

/**
 * Parameters for fetching orders from Alpaca
 */
export interface AlpacaOrdersParams {
  status?: "open" | "closed" | "all"
  limit?: number
  after?: string
  until?: string
  direction?: "asc" | "desc"
  nested?: boolean
}

/**
 * Credentials stored in broker_connections.credentials JSONB
 */
export interface AlpacaCredentials {
  apiKey: string
  secretKey: string
  isPaper: boolean
}
