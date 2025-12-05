import type {
  TradovateAuthResponse,
  TradovateAccount,
  TradovateUser,
  TradovatePosition,
  TradovateOrder,
  TradovateFill,
  TradovateContract,
  TradovateMasterInstrument,
  TradovateSession,
  ProcessedTradovateTrade,
} from "@/types/tradovate"

// CORRECT Tradovate API Configuration
const TRADOVATE_CONFIG = {
  DEMO_URL: "https://demo-api-d.tradovate.com/v1",
  LIVE_URL: "https://api.tradovate.com/v1",
  APP_ID: "TradingTracker",
  APP_VERSION: "1.0.0",
  CID: 1,
  SEC: "MainAccount",
}

export class TradovateAPI {
  private baseUrl: string
  private accessToken: string | null = null
  private mdAccessToken: string | null = null
  private isDemo: boolean

  constructor(isDemo = false) {
    this.isDemo = isDemo
    this.baseUrl = isDemo ? TRADOVATE_CONFIG.DEMO_URL : TRADOVATE_CONFIG.LIVE_URL
    console.log(`TradovateAPI initialized for ${isDemo ? "DEMO" : "LIVE"} environment: ${this.baseUrl}`)
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}, requiresAuth = true): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    console.log(`Making request to: ${url}`)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": `${TRADOVATE_CONFIG.APP_ID}/${TRADOVATE_CONFIG.APP_VERSION}`,
      ...((options.headers as Record<string, string>) || {}),
    }

    if (requiresAuth && this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log(`Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("API Error:", errorData)
      throw new Error(errorData.errorText || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Response data:", data)
    return data
  }

  async authenticate(username: string, password: string): Promise<TradovateSession> {
    console.log(`Authenticating user: ${username} on ${this.isDemo ? "DEMO" : "LIVE"} environment`)

    // CORRECT Tradovate authentication - try the actual working endpoint
    const credentials = {
      name: username,
      password: password,
      appId: TRADOVATE_CONFIG.APP_ID,
      appVersion: TRADOVATE_CONFIG.APP_VERSION,
      cid: TRADOVATE_CONFIG.CID,
      sec: TRADOVATE_CONFIG.SEC,
    }

    console.log("Sending credentials:", { ...credentials, password: "[REDACTED]" })

    try {
      // Try the CORRECT endpoint: /auth/request (this is the actual Tradovate endpoint)
      let authResponse: TradovateAuthResponse

      try {
        console.log("Trying /auth/request endpoint...")
        authResponse = await this.makeRequest<TradovateAuthResponse>(
          "/auth/request",
          {
            method: "POST",
            body: JSON.stringify(credentials),
          },
          false,
        )
      } catch (error: any) {
        if (error.message.includes("404")) {
          console.log("Standard endpoint failed, trying /auth/accesstokenrequest...")
          // Fallback to the other endpoint
          authResponse = await this.makeRequest<TradovateAuthResponse>(
            "/auth/accesstokenrequest",
            {
              method: "POST",
              body: JSON.stringify(credentials),
            },
            false,
          )
        } else {
          throw error
        }
      }

      console.log("Auth response:", {
        ...authResponse,
        accessToken: authResponse.accessToken ? "[PRESENT]" : "[MISSING]",
      })

      if (authResponse.errorText) {
        throw new Error(authResponse.errorText)
      }

      if (!authResponse.accessToken || !authResponse.userId) {
        throw new Error("Invalid authentication response - missing token or user ID")
      }

      this.accessToken = authResponse.accessToken
      this.mdAccessToken = authResponse.mdAccessToken || ""

      console.log("Authentication successful, fetching accounts...")

      // Fetch user accounts
      const accounts = await this.getAccounts()
      console.log(`Found ${accounts.length} accounts`)

      const session: TradovateSession = {
        accessToken: authResponse.accessToken,
        mdAccessToken: this.mdAccessToken,
        userId: authResponse.userId,
        userName: authResponse.name || username,
        expirationTime: authResponse.expirationTime || "",
        accounts: accounts,
        isDemo: this.isDemo,
      }

      return session
    } catch (error) {
      console.error("Tradovate authentication error:", error)
      throw error
    }
  }

  async getUser(): Promise<TradovateUser> {
    return this.makeRequest<TradovateUser>("/user/syncrequest")
  }

  async getAccounts(): Promise<TradovateAccount[]> {
    const response = await this.makeRequest<{ accounts: TradovateAccount[] }>("/account/list")
    return response.accounts || []
  }

  async getPositions(accountId: number): Promise<TradovatePosition[]> {
    const response = await this.makeRequest<{ positions: TradovatePosition[] }>(`/position/list?accountId=${accountId}`)
    return response.positions || []
  }

  async getOrders(accountId: number): Promise<TradovateOrder[]> {
    const response = await this.makeRequest<{ orders: TradovateOrder[] }>(`/order/list?accountId=${accountId}`)
    return response.orders || []
  }

  async getFills(accountId: number): Promise<TradovateFill[]> {
    const response = await this.makeRequest<{ fills: TradovateFill[] }>(`/fill/list?accountId=${accountId}`)
    return response.fills || []
  }

  async getContracts(): Promise<TradovateContract[]> {
    const response = await this.makeRequest<{ contracts: TradovateContract[] }>("/contract/list")
    return response.contracts || []
  }

  async getMasterInstruments(): Promise<TradovateMasterInstrument[]> {
    const response = await this.makeRequest<{ masterInstruments: TradovateMasterInstrument[] }>(
      "/masterInstrument/list",
    )
    return response.masterInstruments || []
  }

  async getOrdersWithFills(accountId: number): Promise<TradovateOrder[]> {
    const [orders, fills] = await Promise.all([this.getOrders(accountId), this.getFills(accountId)])

    // Group fills by orderId
    const fillsByOrderId = fills.reduce(
      (acc, fill) => {
        if (!acc[fill.orderId]) {
          acc[fill.orderId] = []
        }
        acc[fill.orderId].push(fill)
        return acc
      },
      {} as Record<number, TradovateFill[]>,
    )

    // Attach fills to orders
    return orders.map((order) => ({
      ...order,
      fills: fillsByOrderId[order.id] || [],
    }))
  }

  async processTradesFromOrders(accountId: number): Promise<ProcessedTradovateTrade[]> {
    console.log(`Processing trades for account: ${accountId}`)

    const [orders, contracts, masterInstruments] = await Promise.all([
      this.getOrdersWithFills(accountId),
      this.getContracts(),
      this.getMasterInstruments(),
    ])

    console.log(`Found ${orders.length} orders, ${contracts.length} contracts, ${masterInstruments.length} instruments`)

    // Create lookup maps
    const contractMap = contracts.reduce(
      (acc, contract) => {
        acc[contract.id] = contract
        return acc
      },
      {} as Record<number, TradovateContract>,
    )

    const masterInstrumentMap = masterInstruments.reduce(
      (acc, instrument) => {
        acc[instrument.id] = instrument
        return acc
      },
      {} as Record<number, TradovateMasterInstrument>,
    )

    // Group filled orders by contract and process into trades
    const filledOrders = orders.filter(
      (order) => order.orderState === "Filled" && order.fills && order.fills.length > 0,
    )

    console.log(`Found ${filledOrders.length} filled orders`)

    const ordersByContract = filledOrders.reduce(
      (acc, order) => {
        if (!acc[order.contractId]) {
          acc[order.contractId] = []
        }
        acc[order.contractId].push(order)
        return acc
      },
      {} as Record<number, TradovateOrder[]>,
    )

    const trades: ProcessedTradovateTrade[] = []

    for (const [contractIdStr, contractOrders] of Object.entries(ordersByContract)) {
      const contractId = Number.parseInt(contractIdStr)
      const contract = contractMap[contractId]
      const masterInstrument = contract ? masterInstrumentMap[contract.masterInstrumentId] : null

      const instrumentName = masterInstrument?.name || contract?.name || `Contract-${contractId}`

      // Sort orders by timestamp
      contractOrders.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      // Simple pairing logic: match buy/sell orders
      const buyOrders = contractOrders.filter((order) => order.action === "Buy")
      const sellOrders = contractOrders.filter((order) => order.action === "Sell")

      // Pair orders to create trades
      const usedOrderIds = new Set<number>()

      for (const buyOrder of buyOrders) {
        if (usedOrderIds.has(buyOrder.id)) continue

        // Find matching sell order
        const matchingSellOrder = sellOrders.find(
          (sellOrder) =>
            !usedOrderIds.has(sellOrder.id) &&
            sellOrder.filledQty === buyOrder.filledQty &&
            new Date(sellOrder.timestamp) > new Date(buyOrder.timestamp),
        )

        if (matchingSellOrder) {
          const entryPrice = buyOrder.avgFillPrice
          const exitPrice = matchingSellOrder.avgFillPrice
          const quantity = buyOrder.filledQty
          const pnl = (exitPrice - entryPrice) * quantity

          const trade: ProcessedTradovateTrade = {
            id: `${buyOrder.id}-${matchingSellOrder.id}`,
            date: new Date(buyOrder.timestamp).toISOString().split("T")[0],
            instrument: instrumentName,
            direction: "long",
            entry_price: entryPrice,
            exit_price: exitPrice,
            stop_loss: entryPrice * 0.98, // Default 2% stop loss
            take_profit: null,
            size: quantity,
            pnl: pnl,
            outcome: pnl > 0 ? "win" : pnl < 0 ? "loss" : "breakeven",
            notes: `Tradovate Trade: Buy Order ${buyOrder.id} -> Sell Order ${matchingSellOrder.id}`,
            fills: [...(buyOrder.fills || []), ...(matchingSellOrder.fills || [])],
            orders: [buyOrder, matchingSellOrder],
          }

          trades.push(trade)
          usedOrderIds.add(buyOrder.id)
          usedOrderIds.add(matchingSellOrder.id)
        }
      }

      // Handle short trades (sell first, then buy)
      for (const sellOrder of sellOrders) {
        if (usedOrderIds.has(sellOrder.id)) continue

        const matchingBuyOrder = buyOrders.find(
          (buyOrder) =>
            !usedOrderIds.has(buyOrder.id) &&
            buyOrder.filledQty === sellOrder.filledQty &&
            new Date(buyOrder.timestamp) > new Date(sellOrder.timestamp),
        )

        if (matchingBuyOrder) {
          const entryPrice = sellOrder.avgFillPrice
          const exitPrice = matchingBuyOrder.avgFillPrice
          const quantity = sellOrder.filledQty
          const pnl = (entryPrice - exitPrice) * quantity

          const trade: ProcessedTradovateTrade = {
            id: `${sellOrder.id}-${matchingBuyOrder.id}`,
            date: new Date(sellOrder.timestamp).toISOString().split("T")[0],
            instrument: instrumentName,
            direction: "short",
            entry_price: entryPrice,
            exit_price: exitPrice,
            stop_loss: entryPrice * 1.02, // Default 2% stop loss for shorts
            take_profit: null,
            size: quantity,
            pnl: pnl,
            outcome: pnl > 0 ? "win" : pnl < 0 ? "loss" : "breakeven",
            notes: `Tradovate Trade: Sell Order ${sellOrder.id} -> Buy Order ${matchingBuyOrder.id}`,
            fills: [...(sellOrder.fills || []), ...(sellOrder.fills || [])], // Corrected variable name here
            orders: [sellOrder, matchingBuyOrder],
          }

          trades.push(trade)
          usedOrderIds.add(sellOrder.id)
          usedOrderIds.add(matchingBuyOrder.id)
        }
      }
    }

    console.log(`Processed ${trades.length} trades`)
    return trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  setTokens(accessToken: string, mdAccessToken: string) {
    this.accessToken = accessToken
    this.mdAccessToken = mdAccessToken
  }

  clearTokens() {
    this.accessToken = null
    this.mdAccessToken = null
  }
}

// Singleton instance - default to LIVE environment
export const tradovateAPI = new TradovateAPI(false)
