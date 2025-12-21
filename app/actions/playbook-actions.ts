"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { PlaybookStrategy } from "@/types"

export { type PlaybookStrategy }

export async function getStrategies() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("playbook_strategies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching strategies:", error)
    return []
  }

  return data as PlaybookStrategy[]
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
    win_rate: strategy.win_rate ?? 0,
    profit_factor: strategy.profit_factor ?? 0,
    trades_count: strategy.trades_count ?? 0,
    pnl: strategy.pnl ?? 0
  }

  if (strategy.id) {
    await supabase.from("playbook_strategies").update(payload).eq('id', strategy.id)
  } else {
    await supabase.from("playbook_strategies").insert(payload)
  }

  revalidatePath("/playbook")
  revalidatePath("/trades") // Updates trade form
}

export async function deleteStrategy(id: string) {
  const supabase = await createClient()
  await supabase.from("playbook_strategies").delete().eq("id", id)
  revalidatePath("/playbook")
}
