export interface TradovateTestResult {
  endpoint: string
  method: string
  success: boolean
  error?: string
  details?: {
    status?: number
    statusText?: string
    data?: any
    baseUrl?: string
  }
}

export class TradovateTestUtils {
  static async testEndpoint(
    baseUrl: string,
    endpoint: string,
    method = "GET",
    payload?: any,
  ): Promise<TradovateTestResult> {
    const url = `${baseUrl}${endpoint}`

    try {
      console.log(`Testing endpoint: ${method} ${url}`)

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "TradingTracker/1.0.0",
        },
        signal: AbortSignal.timeout(10000),
      }

      if (payload && (method === "POST" || method === "PUT")) {
        options.body = JSON.stringify(payload)
      }

      const response = await fetch(url, options)

      let data: any = null
      try {
        const text = await response.text()
        if (text) {
          data = JSON.parse(text)
        }
      } catch (e) {
        // Response might not be JSON
      }

      return {
        endpoint,
        method,
        success: response.ok,
        details: {
          status: response.status,
          statusText: response.statusText,
          data,
          baseUrl,
        },
      }
    } catch (error: any) {
      return {
        endpoint,
        method,
        success: false,
        error: error.message,
        details: {
          baseUrl,
        },
      }
    }
  }

  static async generateTestReport(): Promise<{
    connectivity: TradovateTestResult[]
    authEndpoints: TradovateTestResult[]
    summary: {
      connectivitySuccess: number
      authEndpointsFound: number
      recommendedEndpoint?: string
    }
  }> {
    const demoUrl = "https://demo-api-d.tradovate.com/v1"
    const liveUrl = "https://api.tradovate.com/v1"

    // Test basic connectivity endpoints
    const connectivityEndpoints = [
      "/user/syncrequest",
      "/account/list",
      "/contract/list",
      "/masterInstrument/list",
      "/position/list",
      "/order/list",
      "/fill/list",
    ]

    // Test authentication endpoints
    const authEndpoints = [
      "/auth/request",
      "/auth/accesstokenrequest",
      "/auth/login",
      "/auth/authenticate",
      "/oauth/token",
      "/session/request",
      "/login",
      "/authenticate",
    ]

    const connectivity: TradovateTestResult[] = []
    const authEndpointsResults: TradovateTestResult[] = []

    // Test connectivity on both demo and live
    for (const baseUrl of [demoUrl, liveUrl]) {
      for (const endpoint of connectivityEndpoints) {
        const result = await this.testEndpoint(baseUrl, endpoint, "GET")
        connectivity.push(result)
      }
    }

    // Test auth endpoints with sample payload
    const sampleAuthPayload = {
      name: "test_user",
      password: "test_password",
      appId: "TradingTracker",
      appVersion: "1.0.0",
      cid: 1,
      sec: "MainAccount",
    }

    for (const baseUrl of [demoUrl, liveUrl]) {
      for (const endpoint of authEndpoints) {
        const result = await this.testEndpoint(baseUrl, endpoint, "POST", sampleAuthPayload)
        authEndpointsResults.push(result)
      }
    }

    // Find recommended endpoint (one that doesn't return 404)
    const workingAuthEndpoint = authEndpointsResults.find((result) => result.details?.status !== 404)

    const summary = {
      connectivitySuccess: connectivity.filter((r) => r.success).length,
      authEndpointsFound: authEndpointsResults.filter((r) => r.details?.status !== 404).length,
      recommendedEndpoint: workingAuthEndpoint?.endpoint,
    }

    return {
      connectivity,
      authEndpoints: authEndpointsResults,
      summary,
    }
  }

  static generateTestCredentials() {
    return {
      username: process.env.TRADOVATE_TEST_USERNAME || "demo_user",
      password: process.env.TRADOVATE_TEST_PASSWORD || "demo_password",
      isDemo: true,
    }
  }

  static validateTestEnvironment() {
    const required = ["TRADOVATE_TEST_USERNAME", "TRADOVATE_TEST_PASSWORD"]
    const missing = required.filter((key) => !process.env[key])

    return {
      isValid: missing.length === 0,
      missing,
      hasTestCredentials: missing.length === 0,
    }
  }
}

// Mock API for testing
export class MockTradovateAPI {
  async authenticate(username: string, password: string) {
    // Simulate authentication
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (username === "demo_user" && password === "demo_password") {
      return {
        accessToken: "mock_access_token_12345",
        mdAccessToken: "mock_md_token_12345",
        userId: 12345,
        userName: username,
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        accounts: [
          {
            id: 1,
            name: "Demo Account",
            accountType: "Demo",
            balance: 100000,
          },
        ],
        isDemo: true,
      }
    }

    throw new Error("Invalid credentials")
  }
}

// Sample processed trades for testing
export const SAMPLE_PROCESSED_TRADES = [
  {
    id: "sample-1",
    date: "2024-01-15",
    instrument: "ES",
    direction: "long" as const,
    entry_price: 4800.5,
    exit_price: 4825.75,
    stop_loss: 4780.0,
    take_profit: null,
    size: 2,
    pnl: 50.5,
    outcome: "win" as const,
    notes: "Sample ES long trade",
  },
  {
    id: "sample-2",
    date: "2024-01-14",
    instrument: "NQ",
    direction: "short" as const,
    entry_price: 17500.25,
    exit_price: 17485.5,
    stop_loss: 17520.0,
    take_profit: null,
    size: 1,
    pnl: 14.75,
    outcome: "win" as const,
    notes: "Sample NQ short trade",
  },
  {
    id: "sample-3",
    date: "2024-01-13",
    instrument: "YM",
    direction: "long" as const,
    entry_price: 38200.0,
    exit_price: 38150.0,
    stop_loss: 38100.0,
    take_profit: null,
    size: 1,
    pnl: -50.0,
    outcome: "loss" as const,
    notes: "Sample YM long trade - stopped out",
  },
]
