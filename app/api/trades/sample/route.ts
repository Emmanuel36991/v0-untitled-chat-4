import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const SAMPLE_TRADES = [
  {
    date: "2024-01-15",
    instrument: "EURUSD",
    direction: "long",
    entry_price: 1.085,
    exit_price: 1.092,
    stop_loss: 1.08,
    take_profit: 1.095,
    size: 10000,
    outcome: "win",
    pnl: 700,
    setup_name: "Morning Breakout",
    notes: "Clean break above resistance",
    duration_minutes: 45,
    trade_start_time: "08:30",
    trade_end_time: "09:15",
  },
  {
    date: "2024-01-16",
    instrument: "GBPUSD",
    direction: "short",
    entry_price: 1.265,
    exit_price: 1.26,
    stop_loss: 1.27,
    size: 8000,
    outcome: "win",
    pnl: 400,
    setup_name: "Reversal Pattern",
    notes: "Double top formation",
    duration_minutes: 120,
    trade_start_time: "14:00",
    trade_end_time: "16:00",
  },
  {
    date: "2024-01-17",
    instrument: "USDJPY",
    direction: "long",
    entry_price: 148.5,
    exit_price: 148.2,
    stop_loss: 148.0,
    size: 5000,
    outcome: "loss",
    pnl: -150,
    setup_name: "Trend Following",
    notes: "False breakout",
    duration_minutes: 30,
    trade_start_time: "10:00",
    trade_end_time: "10:30",
  },
  {
    date: "2024-01-18",
    instrument: "BTCUSD",
    direction: "long",
    entry_price: 42000,
    exit_price: 43500,
    stop_loss: 41000,
    size: 0.1,
    outcome: "win",
    pnl: 150,
    setup_name: "Support Bounce",
    notes: "Strong support level hold",
    duration_minutes: 180,
    trade_start_time: "12:00",
    trade_end_time: "15:00",
  },
  {
    date: "2024-01-19",
    instrument: "EURUSD",
    direction: "short",
    entry_price: 1.088,
    exit_price: 1.083,
    stop_loss: 1.092,
    size: 12000,
    outcome: "win",
    pnl: 600,
    setup_name: "Resistance Rejection",
    notes: "Perfect rejection at key level",
    duration_minutes: 90,
    trade_start_time: "09:00",
    trade_end_time: "10:30",
  },
]

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Add user_id to each sample trade
    const tradesWithUserId = SAMPLE_TRADES.map((trade) => ({
      ...trade,
      user_id: user.id,
    }))

    const { data, error } = await supabase.from("trades").insert(tradesWithUserId).select()

    if (error) {
      console.error("Error creating sample trades:", error)
      return NextResponse.json({ error: "Failed to create sample trades", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Created ${data.length} sample trades`,
      trades: data,
    })
  } catch (error) {
    console.error("Unexpected error creating sample trades:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
