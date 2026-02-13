"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { TradingAccount, CreateAccountInput } from "@/types/accounts"
import { createAccountSchema } from "@/lib/validators/account"

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
  const result = createAccountSchema.safeParse(input)

  if (!result.success) {
    return { success: false, error: result.error.errors[0].message }
  }

  const { name, type, initial_balance } = result.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "User not authenticated" }
  }

  try {
    const { data, error } = await supabase
      .from('trading_accounts')
      .insert({
        user_id: user.id,
        name,
        type,
        initial_balance,
        currency: 'USD', // Default currency
        is_default: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating account:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/trades')
    revalidatePath('/dashboard')

    return { success: true, account: data as TradingAccount }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
