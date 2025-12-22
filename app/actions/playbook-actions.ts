"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// --- TYPES ---
export type StrategyRule = {
  id: string
  text: string
  phase: "setup" | "confirmation" | "execution"
  category?: string
  required: boolean
}

export type StrategySetup = {
  id: string
  name: string
  activeConfluences: string[] // List of Rule IDs
}

export type PlaybookStrategy = {
  id: string
  name: string
  description?: string
  tags?: string[]
  rules?: StrategyRule[]
  setups?: StrategySetup[]
  win_rate?: number
  trades_count?: number
  pnl?: number
  equity_curve?: number[]
}

// --- FETCH ACTIONS ---
export async function getStrategies(): Promise<PlaybookStrategy[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // 1. Fetch Parent Strategies
  const { data: strategies, error } = await supabase
    .from("playbook_strategies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error || !strategies) return []

  const strategyIds = strategies.map(s => s.id)

  // 2. Fetch Rules (Ingredients)
  const { data: rules } = await supabase
    .from("strategy_rules")
    .select("*")
    .in("strategy_id", strategyIds)

  // 3. Fetch Setups (Recipes)
  const { data: setups } = await supabase
    .from("strategy_setups")
    .select("*, setup_confluences(rule_id)")
    .in("strategy_id", strategyIds)

  // 4. Assemble the Tree
  return strategies.map(strat => {
    // Filter rules for this strategy
    const stratRules = rules?.filter(r => r.strategy_id === strat.id).map(r => ({
      ...r,
      // Ensure phase is valid
      phase: r.phase || 'setup', 
      category: r.category || 'price'
    })) || []
    
    // Filter setups and map their confluences
    const stratSetups = setups?.filter(s => s.strategy_id === strat.id).map(s => ({
      id: s.id,
      name: s.name,
      // Extract rule IDs from the junction table
      activeConfluences: s.setup_confluences ? s.setup_confluences.map((sc: any) => sc.rule_id) : []
    })) || []

    return {
      ...strat,
      rules: stratRules,
      setups: stratSetups
    }
  })
}

// --- WRITE ACTIONS ---
export async function upsertStrategy(strategy: Partial<PlaybookStrategy>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Clean the description (Remove any old JSON artifacts)
  let cleanDescription = strategy.description || ""
  if (cleanDescription.trim().startsWith("{") || cleanDescription.includes('{"text":')) {
    cleanDescription = "" // Wipe corrupted description
  }

  // 2. Upsert Strategy (Parent)
  const strategyPayload: any = {
    user_id: user.id,
    name: strategy.name,
    description: cleanDescription,
    tags: strategy.tags || [],
    updated_at: new Date().toISOString()
  }
  // Only add ID if it's a real UUID (length > 10 is a simple check)
  if (strategy.id && strategy.id.length > 10) {
    strategyPayload.id = strategy.id
  }

  const { data: stratData, error: stratError } = await supabase
    .from("playbook_strategies")
    .upsert(strategyPayload)
    .select()
    .single()

  if (stratError) throw stratError
  const strategyId = stratData.id

  // 3. Handle Rules (Ingredients)
  const currentRulesMap = new Map<string, string>(); // Map Frontend ID -> Real DB ID

  if (strategy.rules) {
    // A. Delete rules not in the new list
    const validIds = strategy.rules.map(r => r.id).filter(id => id.length > 10)
    if (validIds.length > 0) {
      await supabase.from("strategy_rules").delete().eq("strategy_id", strategyId).not("id", "in", `(${validIds.join(',')})`)
    } else {
      // If we have rules to save but no valid IDs, it might mean we are replacing everything
      // Only delete if we are actually saving new rules
      if (strategy.rules.length > 0 && strategy.id) {
         // Be careful not to wipe if just empty array passed by mistake
         // For now, we trust the frontend state matches intent
      }
    }

    // B. Upsert Rules
    for (const rule of strategy.rules) {
      const rulePayload: any = {
        strategy_id: strategyId,
        text: rule.text,
        phase: rule.phase || 'setup',
        category: (rule as any).category || 'price',
        required: rule.required
      }
      if (rule.id && rule.id.length > 10) {
        rulePayload.id = rule.id
      }

      const { data: savedRule, error: ruleError } = await supabase
        .from("strategy_rules")
        .upsert(rulePayload)
        .select()
        .single()
      
      if (!ruleError && savedRule) {
        // Map the frontend ID (which might be temp) to the real DB ID
        currentRulesMap.set(rule.id, savedRule.id)
      }
    }
  }

  // 4. Handle Setups (Recipes)
  if (strategy.setups) {
    for (const setup of strategy.setups) {
      // Upsert Setup Row
      const setupPayload: any = {
        strategy_id: strategyId,
        name: setup.name,
      }
      if (setup.id && setup.id.length > 10) {
        setupPayload.id = setup.id
      }

      const { data: savedSetup, error: setupError } = await supabase
        .from("strategy_setups")
        .upsert(setupPayload)
        .select()
        .single()

      if (setupError) continue

      // Link Confluences (Junction Table)
      if (setup.activeConfluences) {
        // Clear old links
        await supabase.from("setup_confluences").delete().eq("setup_id", savedSetup.id)
        
        // Create new links
        const junctions = []
        for (const tempRuleId of setup.activeConfluences) {
          // Resolve the Real DB ID for this rule
          // 1. Check our fresh map (for newly created rules)
          // 2. Or assume it's already a real ID if length > 10
          let realRuleId = currentRulesMap.get(tempRuleId)
          if (!realRuleId && tempRuleId.length > 10) {
            realRuleId = tempRuleId
          }

          if (realRuleId) {
            junctions.push({
              setup_id: savedSetup.id,
              rule_id: realRuleId
            })
          }
        }

        if (junctions.length > 0) {
          await supabase.from("setup_confluences").insert(junctions)
        }
      }
    }
  }

  revalidatePath("/playbook")
}

export async function deleteStrategy(id: string) {
  const supabase = await createClient()
  await supabase.from("playbook_strategies").delete().eq("id", id)
  revalidatePath("/playbook")
}
