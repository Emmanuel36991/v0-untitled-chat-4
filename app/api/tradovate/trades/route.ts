import { type NextRequest, NextResponse } from "next/server"
import { EnhancedTradovateAPI, TradovateError } from "@/lib/tradovate/enhanced-api"
import { cookies } from "next/headers"
import type { TradovateSession } from "@/types/tradovate"

export const dynamic = "force-dynamic"

async function getSessionFromCookies(): Promise<TradovateSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("tradovate_session")

    if (!sessionCookie?.value) {
      return null
    }

    const session: TradovateSession = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (session.expirationTime) {
      const expirationTime = new Date(session.expirationTime)
      if (expirationTime < new Date()) {
        return null
      }
    }

    return session
  } catch (error) {
    console.error("Error getting session from cookies:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")
    const page = Number(searchParams.get("page")) || 1
    const pageSize = Number(searchParams.get("pageSize")) || 100
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    if (!accountId) {
      return NextResponse.json({ success: false, error: "Account ID is required" }, { status: 400 })
    }

    const api = new EnhancedTradovateAPI(session.isDemo)
    api.setTokens(session.accessToken, session.mdAccessToken)

    const result = await api.processTradesFromOrdersEnhanced(Number(accountId), {
      page,
      pageSize,
      startDate,
      endDate,
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    })
  } catch (error: any) {
    console.error("Tradovate trades API error:", error)

    if (error instanceof TradovateError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode || 500 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trades",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
