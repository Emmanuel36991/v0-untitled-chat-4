"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { TradingAccount, CreateAccountInput } from "@/types/accounts"
import { createAccountSchema } from "@/lib/validators/account"
import { z } from "zod"

const updateAccountSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  initial_balance: z.number().positive().optional(),
})

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

export async function updateTradingAccount(
  id: string,
  data: { name?: string; initial_balance?: number }
) {
  const result = updateAccountSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "User not authenticated" }

  try {
    const { data: updated, error } = await supabase
      .from('trading_accounts')
      .update(result.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating account:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/trades')
    revalidatePath('/dashboard')
    return { success: true, account: updated as TradingAccount }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteTradingAccount(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "User not authenticated" }

  try {
    // Delete associated trades first
    const { error: tradesError } = await supabase
      .from('trades')
      .delete()
      .eq('account_id', id)
      .eq('user_id', user.id)

    if (tradesError) {
      console.error('Error deleting trades for account:', tradesError)
      return { success: false, error: tradesError.message }
    }

    // Delete the account
    const { error } = await supabase
      .from('trading_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting account:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/trades')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
