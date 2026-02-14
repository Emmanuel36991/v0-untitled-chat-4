import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/error-handler"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed", details: authError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("Fetching trades for user:", user.id)

    // Fetch trades for the authenticated user
    const { data: trades, error: tradesError } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })

    if (tradesError) {
      console.error("Database error:", tradesError)
      return NextResponse.json({ error: "Failed to fetch trades", details: tradesError.message }, { status: 500 })
    }

    console.log(`Found ${trades?.length || 0} trades for user ${user.id}`)

    return NextResponse.json({
      trades: trades || [],
      userId: user.id,
      totalTradesInDb: trades?.length || 0,
    })
  } catch (error) {
    return handleApiError("GET /api/trades", error)
  }
}
