import { type NextRequest, NextResponse } from "next/server"
import {
  EnhancedTradovateAPI,
  TradovateAuthError,
  TradovateNetworkError,
  TradovateRateLimitError,
} from "@/lib/tradovate/enhanced-api"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, isDemo = false } = body
    logger.info(`API: Authenticating ${username} on ${isDemo ? "DEMO" : "LIVE"} environment`)

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Username and password are required",
          errorCode: "VALIDATION_ERROR",
        },
        { status: 400 },
      )
    }

    // Create API instance for the specified environment
    const api = new EnhancedTradovateAPI(isDemo)

    // Attempt authentication
    const session = await api.authenticate(username, password)
    logger.info(`API: Authentication successful for ${username}`)

    return NextResponse.json({
      success: true,
      session: {
        userId: session.userId,
        userName: session.userName,
        accounts: session.accounts,
        isDemo: session.isDemo,
        expirationTime: session.expirationTime,
        // Don't send the full access token in the response for security
        hasAccessToken: !!session.accessToken,
      },
    })
  } catch (error: any) {
    logger.error("API: Authentication error:", error)

    // Handle specific error types
    if (error instanceof TradovateAuthError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorCode: "AUTH_ERROR",
        },
        { status: 401 },
      )
    }

    if (error instanceof TradovateRateLimitError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorCode: "RATE_LIMIT",
        },
        { status: 429 },
      )
    }

    if (error instanceof TradovateNetworkError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorCode: "NETWORK_ERROR",
        },
        { status: error.status || 500 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
        errorCode: "UNKNOWN_ERROR",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Tradovate Authentication API",
    endpoints: {
      POST: "Authenticate with username/password",
    },
    timestamp: new Date().toISOString(),
  })
}
