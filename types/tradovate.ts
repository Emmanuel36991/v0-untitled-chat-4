// Tradovate API Types
export interface TradovateCredentials {
  name: string
  password: string
  appId: string
  appVersion: string
  cid: number
  sec: string
}

export interface TradovateAuthResponse {
  errorText?: string
  userId?: number
  userStatus?: string
  name?: string
  hasLive?: boolean
  accessToken?: string
  mdAccessToken?: string
  expirationTime?: string
  refreshToken?: string
}

export interface TradovateAccount {
  id: number
  name: string
  accountType: string
  active: boolean
  clearingHouseId: number
  riskCategoryId: number
  autoLiqProfileId: number
  marginAccountType: string
  legalStatus: string
  archived: boolean
  timestamp: string
}

export interface TradovateUser {
  id: number
  name: string
  email: string
  firstName: string
  lastName: string
  status: string
  professional: boolean
  timestamp: string
}

export interface TradovatePosition {
  id: number
  accountId: number
  contractId: number
  timestamp: string
  tradeDate: {
    year: number
    month: number
    day: number
  }
  netPos: number
  netPrice: number
  bought: number
  boughtValue: number
  sold: number
  soldValue: number
  prevPos: number
  prevPrice: number
}

export interface TradovateFill {
  id: number
  orderId: number
  contractId: number
  timestamp: string
  tradeDate: {
    year: number
    month: number
    day: number
  }
  action: string
  qty: number
  price: number
  active: boolean
}

export interface TradovateOrder {
  id: number
  accountId: number
  clOrdId: string
  contractId: number
  timestamp: string
  orderType: string
  orderQty: number
  action: string
  cancelledQty: number
  filledQty: number
  avgFillPrice: number
  rejectReason?: string
  text?: string
  orderState: string
  fills?: TradovateFill[]
}

export interface TradovateContract {
  id: number
  name: string
  contractMaturityId: number
  status: string
  masterInstrumentId: number
  maturityDate: {
    year: number
    month: number
    day: number
  }
  rollTargetContractId?: number
  rollDate?: {
    year: number
    month: number
    day: number
  }
}

export interface TradovateMasterInstrument {
  id: number
  name: string
  contractType: string
  description: string
  fullName: string
  marketDataExchangeId: number
  productId: number
  tickSize: number
  currency: string
}

// Application specific types
export interface TradovateSession {
  accessToken: string
  mdAccessToken: string
  userId: number
  userName: string
  expirationTime: string
  accounts: TradovateAccount[]
  isDemo: boolean
  refreshToken?: string
}

export interface ProcessedTradovateTrade {
  id: string
  date: string
  instrument: string
  direction: "long" | "short"
  entry_price: number
  exit_price: number
  stop_loss: number
  take_profit?: number | null
  size: number
  pnl: number
  outcome: "win" | "loss" | "breakeven"
  notes: string
  fills: TradovateFill[]
  orders: TradovateOrder[]
}

export interface TradovateApiError {
  errorText: string
  errorCode?: number
}
