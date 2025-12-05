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
} from "@/types/tradovate"

export class TradovateError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = "TradovateError"
  }
}

// Custom error classes
export class TradovateAuthError extends TradovateError {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message, code, 401)
    this.name = "TradovateAuthError"
  }
}

export class TradovateNetworkError extends TradovateError {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message, undefined, status)
    this.name = "TradovateNetworkError"
  }
}

export class TradovateRateLimitError extends TradovateError {
  constructor(message: string) {
    super(message, "RATE_LIMIT", 429)
    this.name = "TradovateRateLimitError"
  }
}

// CORRECT Tradovate API Configuration
const TRADOVATE_CONFIG = {
  DEMO_URL: "https://demo-api-d.tradovate.com/v1",
  LIVE_URL: "https://api.tradovate.com/v1",
  APP_ID: "TradingTracker",
  APP_VERSION: "1.0.0",
  CID: 1,
  SEC: "MainAccount",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
}

export class EnhancedTradovateAPI {
  private baseUrl: string
  private accessToken: string | null = null
  private mdAccessToken: string | null = null
  private isDemo: boolean
  private requestCount = 0
  private lastRequestTime = 0

  constructor(isDemo = false) {
    this.isDemo = isDemo
    this.baseUrl = isDemo ? TRADOVATE_CONFIG.DEMO_URL : TRADOVATE_CONFIG.LIVE_URL
    console.log(`EnhancedTradovateAPI initialized for ${isDemo ? "DEMO" : "LIVE"} environment: ${this.baseUrl}`)
  }

  private async rateLimitCheck(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    // Simple rate limiting: max 1 request per second
    if (timeSinceLastRequest < 1000) {
      const waitTime = 1000 - timeSinceLastRequest
      console.log(`Rate limiting: waiting ${waitTime}ms`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime = Date.now()
    this.requestCount++
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true,
    retryCount = 0,
  ): Promise<T> {
    await this.rateLimitCheck()

    const url = `${this.baseUrl}${endpoint}`
    console.log(`Making request to: ${url} (attempt ${retryCount + 1})`)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": `${TRADOVATE_CONFIG.APP_ID}/${TRADOVATE_CONFIG.APP_VERSION}`,
      ...((options.headers as Record<string, string>) || {}),
    }

    if (requiresAuth && this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    const requestConfig: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(TRADOVATE_CONFIG.TIMEOUT),
    }

    console.log(`Request config:`, {
      method: options.method || "GET",
      url,
      headers: { ...headers, Authorization: headers.Authorization ? "[PRESENT]" : "[NONE]" },
      body: options.body ? "[PRESENT]" : "[NONE]",
    })

    try {
      const response = await fetch(url, requestConfig)
      console.log(`Response status: ${response.status} ${response.statusText}`)

      // Handle different HTTP status codes
      if (response.status === 429) {
        throw new TradovateRateLimitError("Rate limit exceeded. Please wait before making more requests.")
      }

      if (response.status === 401) {
        throw new TradovateAuthError("Authentication failed. Please check your credentials.")
      }

      if (response.status === 403) {
        throw new TradovateAuthError("Access forbidden. Your account may not have the required permissions.")
      }

      if (response.status === 404) {
        throw new TradovateNetworkError(`API endpoint not found: ${endpoint}`, response.status)
      }

      if (!response.ok) {
        let errorData: any = {}
        try {
          const text = await response.text()
          if (text) {
            errorData = JSON.parse(text)
          }
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }

        console.error("API Error:", errorData)
        throw new TradovateNetworkError(
          errorData.errorText || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        )
      }

      const data = await response.json()
      console.log("Response data received:", Object.keys(data))
      return data
    } catch (error: any) {
      console.error(`Request failed (attempt ${retryCount + 1}):`, error.message)

      // Retry logic for network errors
      if (
        retryCount < TRADOVATE_CONFIG.MAX_RETRIES &&
        (error.name === "AbortError" || error.name === "TypeError" || error instanceof TradovateNetworkError)
      ) {
        const delay = TRADOVATE_CONFIG.RETRY_DELAY * Math.pow(2, retryCount)
        console.log(`Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.makeRequest<T>(endpoint, options, requiresAuth, retryCount + 1)
      }

      throw error
    }
  }

  async authenticate(username: string, password: string): Promise<TradovateSession> {
    console.log(`Authenticating user: ${username} on ${this.isDemo ? "DEMO" : "LIVE"} environment`)

    if (!username || !password) {
      throw new TradovateAuthError("Username and password are required")
    }

    // Try ALL possible authentication methods for Tradovate
    const authMethods = [
      {
        name: "Standard Auth Request",
        endpoint: "/auth/request",
        payload: {
          name: username.trim(),
          password: password,
          appId: TRADOVATE_CONFIG.APP_ID,
          appVersion: TRADOVATE_CONFIG.APP_VERSION,
          cid: TRADOVATE_CONFIG.CID,
          sec: TRADOVATE_CONFIG.SEC,
        },
      },
      {
        name: "Access Token Request",
        endpoint: "/auth/accesstokenrequest",
        payload: {
          name: username.trim(),
          password: password,
          appId: TRADOVATE_CONFIG.APP_ID,
          appVersion: TRADOVATE_CONFIG.APP_VERSION,
          cid: TRADOVATE_CONFIG.CID,
          sec: TRADOVATE_CONFIG.SEC,
        },
      },
      {
        name: "Simple Login",
        endpoint: "/auth/login",
        payload: {
          username: username.trim(),
          password: password,
        },
      },
      {
        name: "OAuth Style",
        endpoint: "/oauth/token",
        payload: {
          grant_type: "password",
          username: username.trim(),
          password: password,
          client_id: TRADOVATE_CONFIG.APP_ID,
        },
      },
      {
        name: "Session Request",
        endpoint: "/session/request",
        payload: {
          name: username.trim(),
          password: password,
        },
      },
    ]

    let lastError: Error | null = null

    for (const method of authMethods) {
      try {
        console.log(`Trying authentication method: ${method.name} at ${method.endpoint}`)
        console.log("Sending payload:", { ...method.payload, password: "[REDACTED]" })

        const authResponse = await this.makeRequest<TradovateAuthResponse>(
          method.endpoint,
          {
            method: "POST",
            body: JSON.stringify(method.payload),
          },
          false,
        )

        console.log("Auth response received:", {
          userId: authResponse.userId,
          name: authResponse.name,
          hasAccessToken: !!authResponse.accessToken,
          hasError: !!authResponse.errorText,
        })

        if (authResponse.errorText) {
          console.log(`Auth method ${method.name} failed:`, authResponse.errorText)
          lastError = new TradovateAuthError(authResponse.errorText)
          continue
        }

        if (!authResponse.accessToken) {
          console.log(`Auth method ${method.name} failed: No access token received`)
          lastError = new TradovateAuthError("No access token received from Tradovate")
          continue
        }

        if (!authResponse.userId) {
          console.log(`Auth method ${method.name} failed: No user ID received`)
          lastError = new TradovateAuthError("No user ID received from Tradovate")
          continue
        }

        // Success!
        console.log(`Authentication successful with method: ${method.name}`)
        this.accessToken = authResponse.accessToken
        this.mdAccessToken = authResponse.mdAccessToken || ""

        console.log("Authentication successful, fetching accounts...")

        // Fetch user accounts
        let accounts: TradovateAccount[] = []
        try {
          accounts = await this.getAccounts()
          console.log(`Found ${accounts.length} accounts`)
        } catch (error) {
          console.warn("Could not fetch accounts:", error)
          // Continue without accounts - some users might not have account access
        }

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
      } catch (error: any) {
        console.log(`Auth method ${method.name} failed:`, error.message)
        lastError = error
        continue
      }
    }

    // All methods failed
    console.error("All authentication methods failed. Last error:", lastError)

    if (
      lastError instanceof TradovateAuthError ||
      lastError instanceof TradovateNetworkError ||
      lastError instanceof TradovateRateLimitError
    ) {
      throw lastError
    }

    throw new TradovateAuthError(`Authentication failed: ${lastError?.message || "Unknown error"}`)
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

  setTokens(accessToken: string, mdAccessToken: string) {
    this.accessToken = accessToken
    this.mdAccessToken = mdAccessToken
  }

  clearTokens() {
    this.accessToken = null
    this.mdAccessToken = null
  }

  // Health check method
  async healthCheck(): Promise<{ success: boolean; latency: number; environment: string }> {
    const startTime = Date.now()
    try {
      // Try to access a simple endpoint that doesn't require auth
      await fetch(`${this.baseUrl}/user/syncrequest`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      })

      const latency = Date.now() - startTime
      return {
        success: true,
        latency,
        environment: this.isDemo ? "DEMO" : "LIVE",
      }
    } catch (error) {
      const latency = Date.now() - startTime
      return {
        success: false,
        latency,
        environment: this.isDemo ? "DEMO" : "LIVE",
      }
    }
  }
}
