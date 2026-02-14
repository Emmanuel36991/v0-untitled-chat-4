"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { TradovateSession, ProcessedTradovateTrade } from "@/types/tradovate"
import { TradovateAPI } from "@/lib/tradovate/api"
import { addMultipleTrades } from "./trade-actions"
import type { NewTradeInput } from "@/types"

const SESSION_COOKIE_NAME = "tradovate_session"
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24, // 24 hours
}

export async function authenticateTradovate(
  username: string,
  password: string,
  isDemo = false, // Changed default to false for live
): Promise<{ success: boolean; error?: string; session?: TradovateSession }> {

  try {
    // Create new API instance for the specified environment
    const api = new TradovateAPI(isDemo)
    const session = await api.authenticate(username, password)


    // Store session in secure cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), SESSION_COOKIE_OPTIONS)

    return { success: true, session }
  } catch (error: any) {
    console.error("Tradovate authentication failed:", error)
    return {
      success: false,
      error: error.message || "Authentication failed. Please check your credentials.",
    }
  }
}

export async function getTradovateSession(): Promise<TradovateSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) {
      return null
    }

    const session: TradovateSession = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (session.expirationTime) {
      const expirationTime = new Date(session.expirationTime)
      if (expirationTime < new Date()) {
        await logoutTradovate()
        return null
      }
    }

    return session
  } catch (error) {
    console.error("Error getting Tradovate session:", error)
    return null
  }
}

export async function logoutTradovate(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function syncTradovateData(): Promise<{
  success: boolean
  error?: string
  tradesImported?: number
}> {
  try {
    const session = await getTradovateSession()
    if (!session) {
      return { success: false, error: "Not authenticated with Tradovate" }
    }


    // Set up API with session tokens
    const api = new TradovateAPI(session.isDemo)
    api.setTokens(session.accessToken, session.mdAccessToken)

    // Get trades from all accounts
    let allTrades: ProcessedTradovateTrade[] = []

    for (const account of session.accounts) {
      try {
        const accountTrades = await api.processTradesFromOrders(account.id)
        allTrades = [...allTrades, ...accountTrades]
      } catch (error) {
        console.error(`Error processing account ${account.id}:`, error)
        // Continue with other accounts
      }
    }

    if (allTrades.length === 0) {
      return { success: true, tradesImported: 0 }
    }


    // Convert to our trade format
    const tradesToImport: NewTradeInput[] = allTrades.map((trade) => ({
      date: trade.date,
      instrument: trade.instrument,
      direction: trade.direction,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      stop_loss: trade.stop_loss,
      take_profit: trade.take_profit,
      size: trade.size,
      setupName: "Tradovate Import",
      notes: trade.notes,
      screenshotBeforeUrl: null,
      screenshotAfterUrl: null,
    }))

    // Import trades
    const result = await addMultipleTrades(tradesToImport)


    return {
      success: true,
      tradesImported: result.successCount,
    }
  } catch (error: any) {
    console.error("Error syncing Tradovate data:", error)
    return {
      success: false,
      error: error.message || "Failed to sync data from Tradovate",
    }
  }
}

export async function getTradovateAccountInfo(): Promise<{
  success: boolean
  error?: string
  accounts?: any[]
  user?: any
}> {
  try {
    const session = await getTradovateSession()
    if (!session) {
      return { success: false, error: "Not authenticated with Tradovate" }
    }

    const api = new TradovateAPI(session.isDemo)
    api.setTokens(session.accessToken, session.mdAccessToken)

    const [user, accounts] = await Promise.all([api.getUser().catch(() => null), api.getAccounts().catch(() => [])])

    return {
      success: true,
      user,
      accounts: accounts.length > 0 ? accounts : session.accounts,
    }
  } catch (error: any) {
    console.error("Error getting Tradovate account info:", error)
    return {
      success: false,
      error: error.message || "Failed to get account information",
    }
  }
}

export async function requireTradovateAuth() {
  const session = await getTradovateSession()
  if (!session) {
    redirect("/tradovate/login")
  }
  return session
}
