// Alpaca Trading API v2 Client

import type {
  AlpacaAccount,
  AlpacaOrder,
  AlpacaOrdersParams,
  AlpacaCredentials,
} from "@/types/alpaca"
import type { NewTradeInput } from "@/types"

const PAPER_BASE_URL = "https://paper-api.alpaca.markets"
const LIVE_BASE_URL = "https://api.alpaca.markets"

export class AlpacaApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = "AlpacaApiError"
  }
}

export class AlpacaClient {
  private baseUrl: string
  private apiKey: string
  private secretKey: string

  constructor(credentials: AlpacaCredentials) {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey
    this.baseUrl = credentials.isPaper ? PAPER_BASE_URL : LIVE_BASE_URL
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, value)
        }
      }
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "APCA-API-KEY-ID": this.apiKey,
        "APCA-API-SECRET-KEY": this.secretKey,
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      let errorMessage = `Alpaca API error: ${response.status} ${response.statusText}`
      try {
        const errorBody = await response.json()
        errorMessage = errorBody.message || errorBody.error || errorMessage
      } catch {
        // Use default error message
      }

      if (response.status === 401 || response.status === 403) {
        throw new AlpacaApiError(
          "Invalid API credentials. Please check your API Key and Secret Key.",
          response.status,
          "AUTH_ERROR"
        )
      }

      if (response.status === 429) {
        throw new AlpacaApiError(
          "Rate limit exceeded. Please wait a moment and try again.",
          response.status,
          "RATE_LIMIT"
        )
      }

      throw new AlpacaApiError(errorMessage, response.status)
    }

    return response.json() as Promise<T>
  }

  /**
   * Verify credentials and get account information.
   * GET /v2/account
   */
  async getAccount(): Promise<AlpacaAccount> {
    return this.request<AlpacaAccount>("/v2/account")
  }

  /**
   * Fetch closed orders from Alpaca with pagination.
   * GET /v2/orders?status=closed
   *
   * Alpaca returns up to 500 orders per request. We paginate by using
   * the `after` parameter with the timestamp of the last order.
   */
  async getClosedOrders(params?: {
    after?: string
    until?: string
    limit?: number
  }): Promise<AlpacaOrder[]> {
    const queryParams: Record<string, string> = {
      status: "closed",
      limit: String(params?.limit ?? 500),
      direction: "asc",
    }

    if (params?.after) queryParams.after = params.after
    if (params?.until) queryParams.until = params.until

    return this.request<AlpacaOrder[]>("/v2/orders", queryParams)
  }

  /**
   * Fetch ALL closed orders by paginating through results.
   * Continues fetching until fewer than `limit` results are returned.
   */
  async getAllClosedOrders(params?: {
    after?: string
    until?: string
  }): Promise<AlpacaOrder[]> {
    const allOrders: AlpacaOrder[] = []
    const PAGE_SIZE = 500
    let afterCursor = params?.after

    // Safety limit: max 20 pages (10,000 orders)
    for (let page = 0; page < 20; page++) {
      const batch = await this.getClosedOrders({
        after: afterCursor,
        until: params?.until,
        limit: PAGE_SIZE,
      })

      if (batch.length === 0) break

      allOrders.push(...batch)

      // If we got fewer than PAGE_SIZE, we've reached the end
      if (batch.length < PAGE_SIZE) break

      // Use the last order's created_at as the cursor for the next page
      const lastOrder = batch[batch.length - 1]
      afterCursor = lastOrder.created_at
    }

    return allOrders
  }
}

/**
 * Map an Alpaca order to a NewTradeInput.
 * Only processes filled orders (status === "filled").
 */
export function mapAlpacaOrderToTrade(order: AlpacaOrder): NewTradeInput | null {
  // Only process filled orders
  if (order.status !== "filled") return null
  if (!order.filled_at || !order.filled_avg_price) return null

  const filledQty = parseFloat(order.filled_qty)
  const filledPrice = parseFloat(order.filled_avg_price)

  if (filledQty <= 0 || filledPrice <= 0) return null

  const direction: "long" | "short" = order.side === "buy" ? "long" : "short"

  // Format date as YYYY-MM-DD from the ISO timestamp
  const filledDate = order.filled_at.slice(0, 10)

  return {
    date: filledDate,
    instrument: order.symbol,
    direction,
    entry_price: filledPrice,
    exit_price: filledPrice,
    stop_loss: filledPrice,
    size: filledQty,
    pnl: 0,
    outcome: "breakeven" as const,
    notes: [
      "Imported from Alpaca",
      `Order ID: ${order.id}`,
      `Type: ${order.order_type || order.type}`,
      `Side: ${order.side}`,
      order.order_class ? `Class: ${order.order_class}` : null,
    ].filter(Boolean).join(" | "),
  }
}
