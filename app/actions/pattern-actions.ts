"use server"

import { createClient } from "@/lib/supabase/server"

export interface StrategyRuleData {
  id: string
  text: string
  phase: string
  category?: string
  required: boolean
}

export interface StrategyWithRulesData {
  id: string
  name: string
  rules: StrategyRuleData[]
}

/**
 * Fetches all playbook strategies with their rules for the current user.
 * Used by the rule compliance analyzer to score trades against their strategies.
 */
export async function getStrategiesWithRules(): Promise<StrategyWithRulesData[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // Fetch strategies
  const { data: strategies, error: stratError } = await supabase
    .from("playbook_strategies")
    .select("id, name")
    .eq("user_id", user.id)

  if (stratError || !strategies || strategies.length === 0) return []

  const strategyIds = strategies.map((s) => s.id)

  // Fetch rules for all strategies
  const { data: rules, error: rulesError } = await supabase
    .from("strategy_rules")
    .select("id, text, phase, category, required, strategy_id")
    .in("strategy_id", strategyIds)

  if (rulesError || !rules) {
    return strategies.map((s) => ({ id: s.id, name: s.name, rules: [] }))
  }

  // Group rules by strategy
  const rulesByStrategy = new Map<string, StrategyRuleData[]>()
  for (const rule of rules) {
    const stratId = (rule as any).strategy_id
    if (!rulesByStrategy.has(stratId)) rulesByStrategy.set(stratId, [])
    rulesByStrategy.get(stratId)!.push({
      id: rule.id,
      text: rule.text,
      phase: rule.phase || "setup",
      category: rule.category,
      required: rule.required,
    })
  }

  return strategies.map((s) => ({
    id: s.id,
    name: s.name,
    rules: rulesByStrategy.get(s.id) || [],
  }))
}
