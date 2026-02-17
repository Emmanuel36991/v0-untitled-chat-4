"use server"

import { createClient } from "@/lib/supabase/server"
import type { Trade, NewTradeInput } from "@/types"
import { revalidatePath } from "next/cache"
import { tradeSchema } from "@/lib/validators/trade"
import { logger } from "@/lib/logger"
import { createErrorResponse } from "@/lib/error-handler"

// 1. MAP DB ROW TO TRADE OBJECT
function mapRowToTrade(row: any): Trade {
  return {
    id: row.id,
    user_id: row.user_id,
    account_id: row.account_id,
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

    // Playbook
    playbook_strategy_id: row.playbook_strategy_id,
    executed_rules: row.executed_rules || [],

    // Timing
    duration_minutes: row.duration_minutes ? Number(row.duration_minutes) : null,
    trade_session: row.trade_session,
    trade_start_time: row.trade_start_time,
    trade_end_time: row.trade_end_time,
    precise_duration_minutes: row.precise_duration_minutes ? Number(row.precise_duration_minutes) : null,

    // Arrays (Ensure defaults to avoid null errors)
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

// Helper: Ensure a datetime string is stored as a proper UTC ISO string.
// The client now sends pre-converted UTC ISO strings (e.g. "2026-02-10T14:30:00.000Z").
// This function validates and normalizes, handling both:
//   - Already-UTC strings with "Z" or offset (from the client fix)
//   - Legacy datetime-local strings without timezone (passes through as-is since
//     on the server "local" = UTC, which is correct for already-UTC values)
function localDatetimeToUTC(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

// 2. CONVERT FORM DATA TO DB PAYLOAD
function toDbPayload(trade: Partial<NewTradeInput>): Record<string, any> {
  const payload: Record<string, any> = {}

  Object.entries(trade).forEach(([key, value]) => {
    if (value === undefined) return
    if (Array.isArray(value) && value.length === 0) return

    // Handle direct mappings
    if (key === 'playbook_strategy_id') {
      payload['playbook_strategy_id'] = value
    } else if (key === 'account_id') {
      payload['account_id'] = value
    } else if (key === 'date') {
      // DB column is DATE. Accept both YYYY-MM-DD and ISO datetimes; always store YYYY-MM-DD.
      if (typeof value === "string") {
        const trimmed = value.trim()
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          payload['date'] = trimmed
        } else if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
          payload['date'] = trimmed.slice(0, 10)
        } else {
          const d = new Date(trimmed)
          payload['date'] = isNaN(d.getTime()) ? trimmed : d.toISOString().slice(0, 10)
        }
      } else if (value instanceof Date) {
        payload['date'] = value.toISOString().slice(0, 10)
      } else {
        payload['date'] = value
      }
    } else if (key === 'executed_rules') {
      payload['executed_rules'] = value
    } else if (key === 'setupName') {
      payload['setup_name'] = value
    } else if (key === 'screenshotBeforeUrl') {
      payload['screenshot_before_url'] = value
    } else if (key === 'screenshotAfterUrl') {
      payload['screenshot_after_url'] = value
    } else if (key === 'entry_time') {
      // Convert local datetime-local to proper UTC before storing in timestamptz column
      payload['trade_start_time'] = localDatetimeToUTC(value as string)
    } else if (key === 'exit_time') {
      payload['trade_end_time'] = localDatetimeToUTC(value as string)
    } else {
      // Snake Case Conversion for standard fields
      const snakeKey = key
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
        .toLowerCase()
        .replace(/fvg_classic/, "fvg_classic")

      payload[snakeKey] = value
    }
  })
  return payload
}

type SubmitTradeResult = {
  success: boolean
  message?: string
  trade?: Trade
  tradeId?: string
  error?: string
}

// 3. GET TRADES
export async function getTrades(): Promise<Trade[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })

    if (error) {
      logger.error("Error fetching trades:", error)
      return []
    }

    return data?.map(mapRowToTrade) || []
  } catch (error) {
    logger.error("Exception in getTrades:", error)
    return []
  }
}

// 4. ADD TRADE
export async function addTrade(trade: NewTradeInput): Promise<SubmitTradeResult> {
  logger.info("[SERVER ACTION] addTrade called")
  logger.debug("[SERVER ACTION] Input:", JSON.stringify(trade, null, 2))

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.error("[SERVER ACTION] Error: User not authenticated")
      return { success: false, error: "User not authenticated" }
    }
    logger.info("[SERVER ACTION] User authenticated:", user.id)

    // Validate input with Zod
    const validationResult = tradeSchema.safeParse(trade)
    if (!validationResult.success) {
      logger.error("[SERVER ACTION] Validation error:", JSON.stringify(validationResult.error, null, 2))
      return { success: false, error: "Invalid trade data: " + validationResult.error.issues.map(i => i.message).join(", ") }
    }

    // Use validated data
    const validTrade = validationResult.data
    logger.info("[SERVER ACTION] Validation successful")

    const calculatedOutcome = (validTrade.pnl || 0) > 0 ? 'win' : (validTrade.pnl || 0) < 0 ? 'loss' : 'breakeven'

    const dbPayload = {
      ...toDbPayload(validTrade),
      user_id: user.id,
      outcome: validTrade.outcome || calculatedOutcome,
      pnl: validTrade.pnl || 0
    }
    logger.debug("[SERVER ACTION] DB Payload:", JSON.stringify(dbPayload, null, 2))

    const { data, error } = await supabase.from("trades").insert(dbPayload).select().single()

    if (error) {
      logger.error("[SERVER ACTION] Database insert error:", JSON.stringify(error, null, 2))
      return { success: false, error: `Failed to add trade: ${error.message} (Code: ${error.code})` }
    }

    logger.info("[SERVER ACTION] Trade added successfully:", data.id)

    revalidatePath("/trades")
    revalidatePath("/dashboard")
    revalidatePath("/playbook")
    revalidatePath("/analytics")

    return {
      success: true,
      trade: mapRowToTrade(data),
      tradeId: data.id,
      message: "Trade logged successfully!"
    }
  } catch (error: any) {
    return createErrorResponse("addTrade", error)
  }
}

// 5. UPDATE TRADE
export async function updateTrade(id: string, trade: Partial<NewTradeInput>): Promise<SubmitTradeResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const dbPayload = toDbPayload(trade)

    const { data, error } = await supabase
      .from("trades")
      .update(dbPayload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      logger.error("Error updating trade:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/trades")
    revalidatePath("/playbook")
    revalidatePath("/analytics")
    revalidatePath("/dashboard")

    return { success: true, trade: mapRowToTrade(data), message: "Trade updated successfully!" }
  } catch (error: any) {
    return createErrorResponse("updateTrade", error)
  }
}

// 6. DELETE TRADE
export async function deleteTrade(id: string): Promise<SubmitTradeResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { error } = await supabase.from("trades").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      logger.error("Error deleting trade:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/trades")
    revalidatePath("/playbook")
    revalidatePath("/analytics")
    revalidatePath("/dashboard")

    return { success: true, message: "Trade deleted successfully!" }
  } catch (error: any) {
    return createErrorResponse("deleteTrade", error)
  }
}

// 7. DELETE ALL TRADES
export async function deleteAllTrades(): Promise<SubmitTradeResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { error } = await supabase.from("trades").delete().eq("user_id", user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath("/trades")
    revalidatePath("/playbook")
    revalidatePath("/analytics")
    revalidatePath("/dashboard")
    return { success: true, message: "All trades deleted successfully!" }
  } catch (error: any) {
    return createErrorResponse("deleteAllTrades", error)
  }
}

export async function addMultipleTrades(trades: NewTradeInput[]) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { successCount: 0, errorCount: trades.length, error: "User not authenticated" }

    const tradesWithUserId = trades.map((trade) => ({
      ...toDbPayload(trade),
      user_id: user.id,
    }))

    const { data, error } = await supabase.from("trades").insert(tradesWithUserId).select()

    if (error) {
      logger.error("Error adding multiple trades:", error)
      return { successCount: 0, errorCount: trades.length, error: `Failed to add trades: ${error.message}` }
    }

    revalidatePath("/trades")
    revalidatePath("/playbook")
    revalidatePath("/analytics")
    revalidatePath("/dashboard")

    return {
      successCount: data?.length || 0,
      errorCount: trades.length - (data?.length || 0),
    }
  } catch (error: any) {
    return createErrorResponse("addMultipleTrades", error, { successCount: 0, errorCount: trades.length })
  }
}

export async function getTradeById(id: string): Promise<Trade | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase.from("trades").select("*").eq("id", id).eq("user_id", user.id).single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw new Error(`Failed to fetch trade: ${error.message}`)
    }

    return mapRowToTrade(data)
  } catch (error) {
    logger.error("Exception in getTradeById:", error)
    throw error
  }
}

// 8. LOG TRADE PSYCHOLOGY - FIXED TO CONNECT WITH JOURNAL
export async function logTradePsychology(tradeId: string, data: {
  mood: string
  triggers: string[]
  patterns: string[]
  tags: string[]
  pre_thoughts: string
  post_thoughts: string
  lessons?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "User not authenticated" }

    // Combine all arrays into the single 'emotions' array required by psychology_journal_entries
    const emotions = [
      ...(data.triggers || []),
      ...(data.patterns || []),
      ...(data.tags || [])
    ]

    // Insert into the CORRECT table: psychology_journal_entries
    const { error } = await supabase.from("psychology_journal_entries").insert({
      user_id: user.id,
      trade_id: tradeId, // Link this journal entry to the trade
      entry_date: new Date().toISOString().split("T")[0],
      mood: data.mood || "neutral",
      emotions: emotions,
      pre_trade_thoughts: data.pre_thoughts || "",
      post_trade_thoughts: data.post_thoughts || "",
      lessons_learned: data.lessons || ""
    })

    if (error) {
      logger.error("Error logging psychology:", error)
      return { success: false, error: error.message }
    }

    // Refresh pages to show data immediately
    revalidatePath("/psychology")
    revalidatePath("/dashboard")
    revalidatePath("/trades")

    return { success: true }
  } catch (error: any) {
    return createErrorResponse("logTradePsychology", error)
  }
}

export async function getSessionAnalytics() { return [] }
export async function getDurationAnalytics() { return [] }
