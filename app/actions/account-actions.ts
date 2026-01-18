"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { TradingAccount, CreateAccountInput } from "@/types/accounts"

export async function getTradingAccounts(): Promise<TradingAccount[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching accounts:', error)
    return []
  }

  return data as TradingAccount[]
}

export async function createTradingAccount(input: CreateAccountInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  // If this is the first account, make it default
  const { count } = await supabase.from('trading_accounts').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const isFirst = count === 0

  const { data, error } = await supabase
    .from('trading_accounts')
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
      initial_balance: input.initial_balance,
      currency: input.currency || 'USD',
      is_default: isFirst || input.is_default
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/trades')
  return { success: true, account: data as TradingAccount }
}
