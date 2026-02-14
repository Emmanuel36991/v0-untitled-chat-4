"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { TradovateSession } from "@/types/tradovate"
import {
  EnhancedTradovateAPI,
  TradovateAuthError,
  TradovateNetworkError,
  TradovateRateLimitError,
} from "@/lib/tradovate/enhanced-api"
import { logger } from "@/lib/logger"

const SESSION_COOKIE_NAME = "tradovate_session"
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24, // 24 hours
}

export async function authenticateTradovateEnhanced(
  username: string,
  password: string,
  isDemo = false,
): Promise<{
  success: boolean
  error?: string
  session?: TradovateSession
  errorCode?: string
}> {
  logger.info(`Enhanced auth: Authenticating ${username} on ${isDemo ? "DEMO" : "LIVE"} environment`)

  try {
    // Validate inputs
    if (!username?.trim()) {
      return { success: false, error: "Username is required", errorCode: "VALIDATION_ERROR" }
    }

    if (!password?.trim()) {
      return { success: false, error: "Password is required", errorCode: "VALIDATION_ERROR" }
    }

    // Create API instance for the specified environment
    const api = new EnhancedTradovateAPI(isDemo)
    const session = await api.authenticate(username.trim(), password)

    logger.info("Enhanced auth: Authentication successful, storing session")

    // Store session in secure cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), SESSION_COOKIE_OPTIONS)

    return { success: true, session }
  } catch (error: any) {
    logger.error("Enhanced auth: Authentication failed:", error)

    // Handle specific error types
    if (error instanceof TradovateAuthError) {
      return {
        success: false,
        error: error.message,
        errorCode: "AUTH_ERROR",
      }
    }

    if (error instanceof TradovateRateLimitError) {
      return {
        success: false,
        error: error.message,
        errorCode: "RATE_LIMIT",
      }
    }

    if (error instanceof TradovateNetworkError) {
      return {
        success: false,
        error: `Network error: ${error.message}`,
        errorCode: "NETWORK_ERROR",
      }
    }

    // Generic error
    return {
      success: false,
      error: error.message || "Authentication failed. Please try again.",
      errorCode: "UNKNOWN_ERROR",
    }
  }
}

export async function syncTradovateDataEnhanced(): Promise<{
  success: boolean
  error?: string
  tradesImported?: number
  details?: any
}> {
  try {
    const session = await getTradovateSessionEnhanced()
    if (!session) {
      return { success: false, error: "No active Tradovate session", tradesImported: 0 }
    }

    logger.info(`Syncing data for user: ${session.userName}`)

    // Create API instance and set tokens
    const api = new EnhancedTradovateAPI(session.isDemo)
    api.setTokens(session.accessToken, session.mdAccessToken)

    // Get the first account (or let user choose later)
    if (!session.accounts || session.accounts.length === 0) {
      return { success: false, error: "No trading accounts found", tradesImported: 0 }
    }

    const account = session.accounts[0]
    logger.info(`Using account: ${account.name} (ID: ${account.id})`)

    // Fetch and process trades
    const processedTrades = await api.processTradesFromOrders(account.id)
    logger.info(`Processed ${processedTrades.length} trades`)

    // Here you would save the trades to your database
    // For now, we'll just return the count
    return {
      success: true,
      tradesImported: processedTrades.length,
      details: {
        account: account.name,
        trades: processedTrades.slice(0, 5), // Return first 5 trades as sample
      },
    }
  } catch (error: any) {
    logger.error("Data sync failed:", error)
    return {
      success: false,
      error: error.message || "Data sync failed",
      tradesImported: 0,
    }
  }
}

export async function testTradovateConnection(): Promise<{
  success: boolean
  error?: string
  details?: any
}> {
  try {
    // Test both demo and live environments
    const demoApi = new EnhancedTradovateAPI(true)
    const liveApi = new EnhancedTradovateAPI(false)

    const [demoHealth, liveHealth] = await Promise.all([
      demoApi.healthCheck().catch((e) => ({ success: false, latency: 0, environment: "DEMO", error: e.message })),
      liveApi.healthCheck().catch((e) => ({ success: false, latency: 0, environment: "LIVE", error: e.message })),
    ])

    const overallSuccess = demoHealth.success || liveHealth.success

    return {
      success: overallSuccess,
      details: {
        demo: demoHealth,
        live: liveHealth,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error: any) {
    logger.error("Connection test failed:", error)
    return {
      success: false,
      error: error.message || "Connection test failed",
    }
  }
}

export async function getTradovateSessionEnhanced(): Promise<TradovateSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) {
      logger.debug("No session cookie found")
      return null
    }

    const session: TradovateSession = JSON.parse(sessionCookie.value)
    logger.debug(`Retrieved session for user: ${session.userName} (${session.isDemo ? "DEMO" : "LIVE"})`)

    // Check if session is expired
    if (session.expirationTime) {
      const expirationTime = new Date(session.expirationTime)
      if (expirationTime < new Date()) {
        logger.info("Session expired, logging out")
        await logoutTradovateEnhanced()
        return null
      }
    }

    return session
  } catch (error) {
    logger.error("Error getting Tradovate session:", error)
    return null
  }
}

export async function logoutTradovateEnhanced(): Promise<void> {
  logger.info("Logging out of Tradovate")
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireTradovateAuthEnhanced() {
  const session = await getTradovateSessionEnhanced()
  if (!session) {
    redirect("/tradovate/login")
  }
  return session
}
