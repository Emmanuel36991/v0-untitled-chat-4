"use server"

import { createClient } from "@/lib/supabase/server"
import type { Trade, NewTradeInput, DurationAnalytics, SessionAnalytics } from "@/types"
import { revalidatePath } from "next/cache"

// Helper to map Supabase row to Trade type
function mapRowToTrade(row: any): Trade {
  return {
    id: row.id,
    user_id: row.user_id,
    date: typeof row.date === "string" ? row.date : new Date(row.date).toISOString().split("T")[0],
    instrument: row.instrument,
    direction: row.direction,
    entry_price: Number(row.entry_price),
    exit_price: Number(row.exit_price),
    stop_loss: Number(row.stop_loss),
    take_profit: row.take_profit ? Number(row.take_profit) : null,
    size: Number(row.size),
    outcome: row.outcome,
    pnl: Number(row.pnl),
    risk_reward_ratio: row.risk_reward_ratio,
    setup_name: row.setup_name,
    notes: row.notes,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    screenshot_before_url: row.screenshot_before_url,
    screenshot_after_url: row.screenshot_after_url,

    // Enhanced timing fields
    duration_minutes: row.duration_minutes ? Number(row.duration_minutes) : null,
    trade_session: row.trade_session,
    trade_start_time: row.trade_start_time,
    trade_end_time: row.trade_end_time,
    precise_duration_minutes: row.precise_duration_minutes ? Number(row.precise_duration_minutes) : null,

    smc_market_structure: row.smc_market_structure || [],
    smc_order_blocks: row.smc_order_blocks || [],
    smc_fvg: row.smc_fvg || [],
    smc_fvg_classic: row.smc_fvg_classic || [],
    smc_fvg_ifvg: row.smc_fvg_ifvg || [],
    smc_liquidity_concepts: row.smc_liquidity_concepts || [],
    smc_breaker_mitigation_blocks: row.smc_breaker_mitigation_blocks || [],
    smc_mitigation_fill_zones: row.smc_mitigation_fill_zones || [],
    smc_wyckoff_overlaps: row.smc_wyckoff_overlaps || [],

    ict_market_structure_shift: row.ict_market_structure_shift || [],
    ict_order_flow_blocks: row.ict_order_flow_blocks || [],
    ict_liquidity_pools_stops: row.ict_liquidity_pools_stops || [],
    ict_kill_zones: row.ict_kill_zones || [],
    ict_ote: row.ict_ote || [],
    ict_fibonacci_clusters: row.ict_fibonacci_clusters || [],
    ict_power_of_three: row.ict_power_of_three || [],
    ict_smt_divergence: row.ict_smt_divergence || [],
    ict_daily_bias_session_dynamics: row.ict_daily_bias_session_dynamics || [],
    ict_entry_model: row.ict_entry_model || [],
    ict_liquidity_concepts: row.ict_liquidity_concepts || [],
    ict_market_structure: row.ict_market_structure || [],
    ict_time_and_price: row.ict_time_and_price || [],
    ict_bias_context: row.ict_bias_context || [],
    ict_liquidity_events: row.ict_liquidity_events || [],
    ict_fibonacci_levels: row.ict_fibonacci_levels || [],
    ict_price_action_patterns: row.ict_price_action_patterns || [],
    ict_confluence: row.ict_confluence || [],

    wyckoff_price_volume: row.wyckoff_price_volume || [],
    wyckoff_phases: row.wyckoff_phases || [],
    wyckoff_composite_man: row.wyckoff_composite_man || [],
    wyckoff_spring_upthrust: row.wyckoff_spring_upthrust || [],
    wyckoff_cause_effect: row.wyckoff_cause_effect || [],
    wyckoff_sr: row.wyckoff_sr || [],
    wyckoff_effort_result: row.wyckoff_effort_result || [],

    volume_spikes_clusters: row.volume_spikes_clusters || [],
    volume_profile_market_profile: row.volume_profile_market_profile || [],
    volume_trends: row.volume_trends || [],
    volume_obv_ad: row.volume_obv_ad || [],
    volume_imbalance: row.volume_imbalance || [],

    sr_horizontal_levels: row.sr_horizontal_levels || [],
    sr_dynamic: row.sr_dynamic || [],
    sr_supply_demand_zones: row.sr_supply_demand_zones || [],
    sr_flip: row.sr_flip || [],
    sr_confluence_zones: row.sr_confluence_zones || [],
    sr_micro_macro: row.sr_micro_macro || [],
    sr_order_flow: row.sr_order_flow || [],
    support_resistance_used: row.support_resistance_used || [],

    psychology_factors: row.psychology_factors || [],
  }
}

// Convert camelCase to snake_case for database fields
function camelToSnake(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase()
    .replace(/_f_v_g$/, "_fvg")
    .replace(/_s_m_t$/, "_smt")
    .replace(/_o_t_e$/, "_ote")
}

// Build database payload from form data
function toDbPayload(trade: Partial<NewTradeInput>): Record<string, any> {
  const payload: Record<string, any> = {}

  Object.entries(trade).forEach(([key, value]) => {
    if (value === undefined) return // skip undefined values
    if (Array.isArray(value) && value.length === 0) return // skip empty arrays

    const snakeKey = camelToSnake(key)
    payload[snakeKey] = value
  })

  return payload
}

// Define SubmitTradeResult type for consistent return values
type SubmitTradeResult = {
  success: boolean
  message?: string
  trade?: Trade
  tradeId?: string
  error?: string
}

export async function getTrades(): Promise<Trade[]> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })

    if (error) {
      console.error("Error fetching trades:", error)
      return []
    }

    return data?.map(mapRowToTrade) || []
  } catch (error) {
    console.error("Exception in getTrades:", error)
    return []
  }
}

export async function getTradeById(id: string): Promise<Trade | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase.from("trades").select("*").eq("id", id).eq("user_id", user.id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Error fetching trade:", error)
      throw new Error(`Failed to fetch trade: ${error.message}`)
    }

    return mapRowToTrade(data)
  } catch (error) {
    console.error("Exception in getTradeById:", error)
    throw error
  }
}

export async function getDurationAnalytics(): Promise<DurationAnalytics[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    // Get all trades and calculate duration analytics client-side for better reliability
    const trades = await getTrades()

    if (!trades.length) return []

    // Group trades by duration ranges
    const durationGroups: Record<string, { trades: Trade[]; wins: number; losses: number }> = {
      "< 5 min": { trades: [], wins: 0, losses: 0 },
      "5-15 min": { trades: [], wins: 0, losses: 0 },
      "15-60 min": { trades: [], wins: 0, losses: 0 },
      "1-4 hours": { trades: [], wins: 0, losses: 0 },
      "> 4 hours": { trades: [], wins: 0, losses: 0 },
    }

    trades.forEach((trade) => {
      const duration = trade.duration_minutes || trade.precise_duration_minutes || 0
      let category = "< 5 min"

      if (duration >= 240) category = "> 4 hours"
      else if (duration >= 60) category = "1-4 hours"
      else if (duration >= 15) category = "15-60 min"
      else if (duration >= 5) category = "5-15 min"

      durationGroups[category].trades.push(trade)
      if (trade.outcome === "win") durationGroups[category].wins++
      else if (trade.outcome === "loss") durationGroups[category].losses++
    })

    return Object.entries(durationGroups)
      .filter(([_, group]) => group.trades.length > 0)
      .map(([category, group]) => ({
        durationCategory: category,
        totalTrades: group.trades.length,
        winCount: group.wins,
        lossCount: group.losses,
        winRate: group.trades.length > 0 ? (group.wins / (group.wins + group.losses || 1)) * 100 : 0,
        avgPnl: group.trades.reduce((sum, t) => sum + t.pnl, 0) / group.trades.length,
      }))
  } catch (error) {
    console.error("Exception in getDurationAnalytics:", error)
    return []
  }
}

export async function getSessionAnalytics(): Promise<SessionAnalytics[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    // Get all trades and calculate session analytics client-side
    const trades = await getTrades()

    if (!trades.length) return []

    // Group trades by time of day based on trade_start_time
    const sessionGroups: Record<string, { trades: Trade[]; wins: number; losses: number }> = {
      "Night (00-06)": { trades: [], wins: 0, losses: 0 },
      "Morning (06-12)": { trades: [], wins: 0, losses: 0 },
      "Afternoon (12-18)": { trades: [], wins: 0, losses: 0 },
      "Evening (18-24)": { trades: [], wins: 0, losses: 0 },
    }

    trades.forEach((trade) => {
      let category = "Morning (06-12)" // default

      if (trade.trade_start_time) {
        const hour = Number.parseInt(trade.trade_start_time.split(":")[0])
        if (hour >= 0 && hour < 6) category = "Night (00-06)"
        else if (hour >= 6 && hour < 12) category = "Morning (06-12)"
        else if (hour >= 12 && hour < 18) category = "Afternoon (12-18)"
        else if (hour >= 18 && hour < 24) category = "Evening (18-24)"
      }

      sessionGroups[category].trades.push(trade)
      if (trade.outcome === "win") sessionGroups[category].wins++
      else if (trade.outcome === "loss") sessionGroups[category].losses++
    })

    return Object.entries(sessionGroups)
      .filter(([_, group]) => group.trades.length > 0)
      .map(([category, group]) => ({
        sessionName: category,
        totalTrades: group.trades.length,
        winCount: group.wins,
        lossCount: group.losses,
        winRate: group.trades.length > 0 ? (group.wins / (group.wins + group.losses || 1)) * 100 : 0,
        avgPnl: group.trades.reduce((sum, t) => sum + t.pnl, 0) / group.trades.length,
      }))
  } catch (error) {
    console.error("Exception in getSessionAnalytics:", error)
    return []
  }
}

export async function addTrade(trade: NewTradeInput): Promise<SubmitTradeResult> {
  try {
    console.log("[v0] addTrade called with trade data:", JSON.stringify(trade, null, 2))

    const supabase = await createClient()
    console.log("[v0] Supabase client created")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] User authentication check:", {
      authenticated: !!user,
      userId: user?.id,
    })

    if (!user) {
      console.log("[v0] Authentication failed - no user found")
      return { success: false, error: "User not authenticated" }
    }

    const dbPayload = {
      ...toDbPayload(trade),
      user_id: user.id,
    }

    console.log("[v0] Database payload prepared:", JSON.stringify(dbPayload, null, 2))

    const { data, error } = await supabase.from("trades").insert(dbPayload).select().single()

    if (error) {
      console.error("[v0] Database insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return { success: false, error: `Failed to add trade: ${error.message}` }
    }

    console.log("[v0] Trade successfully inserted:", data?.id)

    revalidatePath("/trades")
    return {
      success: true,
      trade: mapRowToTrade(data),
      tradeId: data.id,
      message: "Trade logged successfully!",
    }
  } catch (error: any) {
    console.error("[v0] Exception in addTrade:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return { success: false, error: `An unexpected error occurred: ${error.message || "Unknown error"}` }
  }
}

export async function updateTrade(id: string, trade: Partial<NewTradeInput>): Promise<SubmitTradeResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const dbPayload = toDbPayload(trade)

    const { data, error } = await supabase
      .from("trades")
      .update(dbPayload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating trade:", error)
      return { success: false, error: `Failed to update trade: ${error.message}` }
    }

    revalidatePath("/trades")
    return { success: true, trade: mapRowToTrade(data), message: "Trade updated successfully!" }
  } catch (error: any) {
    console.error("Exception in updateTrade:", error)
    return { success: false, error: `An unexpected error occurred: ${error.message || "Unknown error"}` }
  }
}

export async function deleteTrade(id: string): Promise<SubmitTradeResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase.from("trades").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting trade:", error)
      return { success: false, error: `Failed to delete trade: ${error.message}` }
    }

    revalidatePath("/trades")
    return { success: true, message: "Trade deleted successfully!" }
  } catch (error: any) {
    console.error("Exception in deleteTrade:", error)
    return { success: false, error: `An unexpected error occurred: ${error.message || "Unknown error"}` }
  }
}

export async function deleteAllTrades(): Promise<SubmitTradeResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase.from("trades").delete().eq("user_id", user.id)

    if (error) {
      console.error("Error deleting all trades:", error)
      return { success: false, error: `Failed to delete all trades: ${error.message}` }
    }

    revalidatePath("/trades")
    return { success: true, message: "All trades deleted successfully!" }
  } catch (error: any) {
    console.error("Exception in deleteAllTrades:", error)
    return {
      success: false,
      error: `An unexpected error occurred: ${error.message || "Unknown error"}`,
    }
  }
}

export async function addMultipleTrades(
  trades: NewTradeInput[],
): Promise<{ successCount: number; errorCount: number; error?: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { successCount: 0, errorCount: trades.length, error: "User not authenticated" }
    }

    const tradesWithUserId = trades.map((trade) => ({
      ...toDbPayload(trade),
      user_id: user.id,
    }))

    const { data, error } = await supabase.from("trades").insert(tradesWithUserId).select()

    if (error) {
      console.error("Error adding multiple trades:", error)
      return { successCount: 0, errorCount: trades.length, error: `Failed to add trades: ${error.message}` }
    }

    revalidatePath("/trades")
    return {
      successCount: data?.length || 0,
      errorCount: trades.length - (data?.length || 0),
    }
  } catch (error: any) {
    console.error("Exception in addMultipleTrades:", error)
    return {
      successCount: 0,
      errorCount: trades.length,
      error: `An unexpected error occurred: ${error.message || "Unknown error"}`,
    }
  }
}
