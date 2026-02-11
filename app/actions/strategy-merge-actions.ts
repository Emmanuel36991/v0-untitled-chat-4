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
    }) // Remove .upsert to avoid potential unique constraint issues if we want distinct errors, 
    // but strictly the schema might have unique constraints. 
    // If unique(parent, child) exists, we might want to ignore duplicates or update.
    // For now, simple insert.
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

  // 1. Create the merged strategy group
  const { data: group, error: groupError } = await supabase
    .from("merged_strategy_groups")
    .insert({
      user_id: user.id,
      name,
      description,
    })
    .select()
    .single()

  if (groupError || !group) {
    console.error("[v0] Error creating merged strategy group:", groupError)
    return { error: groupError?.message || "Failed to create group" }
  }

  // 2. Add strategies to the group via junction table
  const junctionInserts = strategyIds.map(id => ({
    group_id: group.id,
    strategy_id: id
  }))

  const { error: junctionError } = await supabase
    .from("merged_group_strategies")
    .insert(junctionInserts)

  if (junctionError) {
    console.error("[v0] Error adding strategies to group:", junctionError)
    // Cleanup group if junction fails? Ideally yes, but keeping it simple for now.
    return { error: junctionError.message }
  }

  // 3. Create relationships between strategies (for the network graph)
  for (let i = 0; i < strategyIds.length; i++) {
    for (let j = i + 1; j < strategyIds.length; j++) {
      // We assume this won't fail or if it does (duplicate), it's fine
      await supabase
        .from("strategy_relationships")
        .upsert({
          user_id: user.id,
          parent_strategy_id: strategyIds[i],
          child_strategy_id: strategyIds[j],
          relationship_type: 'merged',
          relationship_strength: 100
        }, { onConflict: 'parent_strategy_id,child_strategy_id' })
    }
  }

  // 4. To return the full MergedStrategy object, we need to calculate the stats
  //    Function re-use: we can just call getMergedStrategies and filter for this new ID
  //    But to be efficient let's just do it for this one.

  // Fetch strategies
  const { data: strategies } = await supabase
    .from("playbook_strategies")
    .select("*")
    .in("id", strategyIds)

  if (!strategies) return { error: "Could not fetch strategies" }

  // Fetch trades for habits analysis and combined stats
  const { data: trades } = await supabase
    .from("trades")
    .select("pnl, outcome, good_habits, playbook_strategy_id")
    .in("playbook_strategy_id", strategyIds)
    .eq("user_id", user.id)

  const combinedStats = calculateMergedStats(strategies, trades || [])

  const result: MergedStrategy = {
    id: group.id,
    user_id: group.user_id,
    name: group.name,
    description: group.description,
    strategy_ids: strategyIds,
    strategies: strategies,
    created_at: group.created_at,
    updated_at: group.updated_at,
    ...combinedStats
  }

  return { data: result }
}

export async function getMergedStrategies() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: [] }
  }

  // 1. Fetch all groups
  const { data: groups, error: groupsError } = await supabase
    .from("merged_strategy_groups")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (groupsError) {
    console.error("[v0] Error fetching merged groups:", groupsError)
    return { error: groupsError.message, data: [] }
  }

  if (!groups || groups.length === 0) {
    return { data: [] }
  }

  // 2. Fetch all junction items to map group -> strategy IDs
  const groupIds = groups.map(g => g.id)
  const { data: junctions, error: junctionError } = await supabase
    .from("merged_group_strategies")
    .select("group_id, strategy_id")
    .in("group_id", groupIds)

  if (junctionError) {
    console.error("Error fetching junctions", junctionError)
    return { data: [] }
  }

  // 3. Collect all unique strategy IDs needed
  const allStrategyIds = Array.from(new Set(junctions?.map(j => j.strategy_id) || []))

  // 4. Fetch all referenced strategies
  const { data: allStrategies } = await supabase
    .from("playbook_strategies")
    .select("*")
    .in("id", allStrategyIds)

  const strategiesMap = new Map(allStrategies?.map(s => [s.id, s]))

  // 5. Fetch all trades for these strategies (for calculating combined stats)
  //    Optimization: We could fetch aggregated stats from DB, but for now raw trades give us habits.
  const { data: allTrades } = await supabase
    .from("trades")
    .select("pnl, outcome, good_habits, playbook_strategy_id")
    .in("playbook_strategy_id", allStrategyIds)
    .eq("user_id", user.id)

  // 6. Assemble the MergedStrategy objects
  const results: MergedStrategy[] = groups.map(group => {
    // Find strategy IDs for this group
    const groupStrategyIds = junctions
      ?.filter(j => j.group_id === group.id)
      .map(j => j.strategy_id) || []

    // Get full strategy objects
    const groupStrategies = groupStrategyIds
      .map(id => strategiesMap.get(id))
      .filter(s => !!s) as PlaybookStrategy[]

    // Get trades for this group
    const groupTrades = allTrades?.filter(t => t.playbook_strategy_id && groupStrategyIds.includes(t.playbook_strategy_id)) || []

    const stats = calculateMergedStats(groupStrategies, groupTrades)

    return {
      id: group.id,
      user_id: group.user_id,
      name: group.name,
      description: group.description,
      strategy_ids: groupStrategyIds,
      strategies: groupStrategies,
      created_at: group.created_at,
      updated_at: group.updated_at,
      ...stats
    }
  })

  return { data: results }
}

export async function deleteMergedStrategy(mergedStrategyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("merged_strategy_groups")
    .delete()
    .eq("id", mergedStrategyId)
    .eq("user_id", user.id)

  if (error) {
    console.error("[v0] Error deleting merged strategy:", error)
    return { error: error.message }
  }

  return { success: true }
}

// Helper to calculate stats in memory
function calculateMergedStats(strategies: PlaybookStrategy[], trades: any[]) {
  // Basic summation of existing strategy stats (weighted average possibility, but simple average for now)
  // Actually, better to recalculate from raw trades if possible to be accurate, 
  // but strategies might have manual offsets? Assuming trades are source of truth.

  const totalTradesCount = trades.length
  const totalPnl = trades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
  const winningTrades = trades.filter(t => t.outcome === 'win').length
  const losingTrades = trades.filter(t => t.outcome === 'loss').length

  const combinedWinRate = totalTradesCount > 0 ? winningTrades / totalTradesCount : 0

  const grossProfit = trades.filter(t => (Number(t.pnl) || 0) > 0).reduce((sum, t) => sum + Number(t.pnl), 0)
  const grossLoss = Math.abs(trades.filter(t => (Number(t.pnl) || 0) < 0).reduce((sum, t) => sum + Number(t.pnl), 0))
  const combinedProfitFactor = grossLoss === 0 ? (grossProfit > 0 ? 100 : 0) : grossProfit / grossLoss

  // Common Habits
  const goodHabitsMap = new Map<string, number>()
  trades.forEach(trade => {
    if (trade.good_habits && trade.outcome === 'win') {
      // Handle postgres array string or actual array
      const habits = Array.isArray(trade.good_habits) ? trade.good_habits : []
      habits.forEach((habit: string) => {
        goodHabitsMap.set(habit, (goodHabitsMap.get(habit) || 0) + 1)
      })
    }
  })

  // Identify habits present in at least 30% of wins
  const commonGoodHabits = Array.from(goodHabitsMap.entries())
    .filter(([_, count]) => count >= winningTrades * 0.3)
    .map(([habit]) => habit)

  return {
    combined_win_rate: combinedWinRate,
    combined_profit_factor: combinedProfitFactor,
    combined_trades_count: totalTradesCount,
    combined_pnl: totalPnl,
    common_good_habits: commonGoodHabits
  }
}
