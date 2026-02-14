import { type NextRequest, NextResponse } from "next/server"
import {
  EnhancedTradovateAPI,
  TradovateAuthError,
  TradovateNetworkError,
  TradovateRateLimitError,
} from "@/lib/tradovate/enhanced-api"
import { logger } from "@/lib/logger"
import { handleApiError } from "@/lib/error-handler"

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
    return handleApiError("POST /api/tradovate/auth", error)
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
