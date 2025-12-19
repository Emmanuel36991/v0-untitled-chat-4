"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type StrategyPhase = "setup" | "confirmation" | "execution" | "management"

export interface StrategyRule {
  id: string
  text: string
  phase: StrategyPhase
  required: boolean
}

export interface PlaybookStrategy {
  id: string
  name: string
  description: string | null
  rules: StrategyRule[]
  win_rate: number
  profit_factor: number
  trades_count: number
  pnl: number
  tags: string[]
  equity_curve: number[]
  created_at: string
}

// Pre-defined templates users can choose to instantiate
const TEMPLATES = {
  "ict_silver_bullet": {
    name: "ICT Silver Bullet",
    description: "Time-based liquidity run setup (10am-11am / 3pm-4pm).",
    tags: ["ICT", "Scalping"],
    rules: [
      { id: "1", text: "Time is within 60min window", phase: "setup", required: true },
      { id: "2", text: "Liquidity Sweep (BSL/SSL)", phase: "setup", required: true },
      { id: "3", text: "Market Structure Shift with Displacement", phase: "confirmation", required: true },
      { id: "4", text: "Return to FVG", phase: "execution", required: true }
    ]
  },
  "smc_continuation": {
    name: "SMC Trend Continuation",
    description: "Catching pullbacks into Order Blocks during a strong trend.",
    tags: ["SMC", "Trend"],
    rules: [
      { id: "1", text: "HTF Trend is aligned", phase: "setup", required: true },
      { id: "2", text: "Valid Break of Structure (BOS)", phase: "setup", required: true },
      { id: "3", text: "Pullback to Discount/Premium", phase: "confirmation", required: true },
      { id: "4", text: "Rejection from OB/FVG", phase: "execution", required: true }
    ]
  }
}

export async function getStrategies() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("playbook_strategies")
    .select("*")
    .eq("user_id", user.id) // ONLY fetch user's own strategies
    .order("trades_count", { ascending: false }) // Most used first

  if (error) console.error("Playbook Fetch Error:", error)
  return (data as PlaybookStrategy[]) || []
}

export async function upsertStrategy(strategy: Partial<PlaybookStrategy>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const payload = {
    user_id: user.id,
    name: strategy.name,
    description: strategy.description,
    rules: strategy.rules || [],
    tags: strategy.tags || [],
    equity_curve: strategy.equity_curve || [0],
    win_rate: strategy.win_rate || 0,
    pnl: strategy.pnl || 0
  }

  if (strategy.id) {
    await supabase.from("playbook_strategies").update(payload).eq('id', strategy.id)
  } else {
    await supabase.from("playbook_strategies").insert(payload)
  }
  revalidatePath("/playbook")
}

export async function createFromTemplate(templateKey: keyof typeof TEMPLATES) {
  const tmpl = TEMPLATES[templateKey]
  if (!tmpl) return
  
  await upsertStrategy({
    name: tmpl.name,
    description: tmpl.description,
    rules: tmpl.rules as StrategyRule[],
    tags: tmpl.tags
  })
}

export async function deleteStrategy(id: string) {
  const supabase = await createClient()
  await supabase.from("playbook_strategies").delete().eq("id", id)
  revalidatePath("/playbook")
}
