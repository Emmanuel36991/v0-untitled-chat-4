"use server"

import { createClient } from "@/lib/supabase/server"
import type { MergedStrategy, StrategyRelationship, PlaybookStrategy } from "@/types"

export async function createStrategyRelationship(
  parentStrategyId: string,
  childStrategyId: string,
  relationshipType: 'merged' | 'derived' | 'complements' = 'merged',
  relationshipStrength: number = 80
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("strategy_relationships")
    .insert({
      user_id: user.id,
      parent_strategy_id: parentStrategyId,
      child_strategy_id: childStrategyId,
      relationship_type: relationshipType,
      relationship_strength: relationshipStrength,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating strategy relationship:", error)
    return { error: error.message }
  }

  return { data }
}

export async function deleteStrategyRelationship(relationshipId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("strategy_relationships")
    .delete()
    .eq("id", relationshipId)
    .eq("user_id", user.id)

  if (error) {
    console.error("[v0] Error deleting strategy relationship:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function getStrategyRelationships(strategyId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: [] }
  }

  let query = supabase
    .from("strategy_relationships")
    .select("*")
    .eq("user_id", user.id)

  if (strategyId) {
    query = query.or(`parent_strategy_id.eq.${strategyId},child_strategy_id.eq.${strategyId}`)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching strategy relationships:", error)
    return { error: error.message, data: [] }
  }

  return { data: data as StrategyRelationship[] }
}

export async function createMergedStrategy(
  name: string,
  description: string | null,
  strategyIds: string[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Fetch all strategies to merge
  const { data: strategies, error: fetchError } = await supabase
    .from("playbook_strategies")
    .select("*")
    .in("id", strategyIds)
    .eq("user_id", user.id)

  if (fetchError || !strategies) {
    console.error("[v0] Error fetching strategies:", fetchError)
    return { error: fetchError?.message || "Could not fetch strategies" }
  }

  // Fetch trades for these strategies to analyze good habits
  const { data: trades, error: tradesError } = await supabase
    .from("trades")
    .select("good_habits, outcome")
    .in("playbook_strategy_id", strategyIds)
    .eq("user_id", user.id)

  const goodHabitsMap = new Map<string, number>()
  
  if (trades) {
    trades.forEach(trade => {
      if (trade.good_habits && trade.outcome === 'win') {
        trade.good_habits.forEach((habit: string) => {
          goodHabitsMap.set(habit, (goodHabitsMap.get(habit) || 0) + 1)
        })
      }
    })
  }

  // Find common good habits (appear in at least 30% of winning trades)
  const totalWinningTrades = trades?.filter(t => t.outcome === 'win').length || 0
  const commonGoodHabits = Array.from(goodHabitsMap.entries())
    .filter(([_, count]) => count >= totalWinningTrades * 0.3)
    .map(([habit]) => habit)

  // Calculate combined metrics
  const combinedWinRate = strategies.reduce((sum, s) => sum + s.win_rate, 0) / strategies.length
  const combinedProfitFactor = strategies.reduce((sum, s) => sum + s.profit_factor, 0) / strategies.length
  const combinedTradesCount = strategies.reduce((sum, s) => sum + s.trades_count, 0)
  const combinedPnl = strategies.reduce((sum, s) => sum + s.pnl, 0)

  const { data, error } = await supabase
    .from("merged_strategies")
    .insert({
      user_id: user.id,
      name,
      description,
      strategy_ids: strategyIds,
      combined_win_rate: combinedWinRate,
      combined_profit_factor: combinedProfitFactor,
      combined_trades_count: combinedTradesCount,
      combined_pnl: combinedPnl,
      common_good_habits: commonGoodHabits,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating merged strategy:", error)
    return { error: error.message }
  }

  // Create relationships between strategies
  for (let i = 0; i < strategyIds.length; i++) {
    for (let j = i + 1; j < strategyIds.length; j++) {
      await createStrategyRelationship(strategyIds[i], strategyIds[j], 'merged', 100)
    }
  }

  return { data }
}

export async function getMergedStrategies() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: [] }
  }

  const { data, error } = await supabase
    .from("merged_strategies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching merged strategies:", error)
    return { error: error.message, data: [] }
  }

  // Fetch full strategy details for each merged strategy
  const mergedWithDetails = await Promise.all(
    (data || []).map(async (merged) => {
      const { data: strategies } = await supabase
        .from("playbook_strategies")
        .select("*")
        .in("id", merged.strategy_ids)

      return {
        ...merged,
        strategies: strategies || []
      } as MergedStrategy
    })
  )

  return { data: mergedWithDetails }
}

export async function deleteMergedStrategy(mergedStrategyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("merged_strategies")
    .delete()
    .eq("id", mergedStrategyId)
    .eq("user_id", user.id)

  if (error) {
    console.error("[v0] Error deleting merged strategy:", error)
    return { error: error.message }
  }

  return { success: true }
}
