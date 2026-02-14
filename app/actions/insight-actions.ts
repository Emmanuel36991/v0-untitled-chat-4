"use server"

import { createClient } from "@/lib/supabase/server"

export interface SavedInsight {
  id: string
  user_id: string
  insight_text: string
  trades_snapshot: any[] | null
  created_at: string
}

export async function saveInsight(
  insightText: string,
  tradesSnapshot: object[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    const { error } = await supabase.from("ai_insights").insert({
      user_id: user.id,
      insight_text: insightText,
      trades_snapshot: tradesSnapshot,
    })

    if (error) {
      console.error("Failed to save insight:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("saveInsight error:", err)
    return { success: false, error: "Unexpected error" }
  }
}

export async function getInsights(
  limit: number = 50
): Promise<SavedInsight[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return []

    const { data, error } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Failed to fetch insights:", error)
      return []
    }

    return (data as SavedInsight[]) || []
  } catch {
    return []
  }
}

export async function deleteInsight(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    const { error } = await supabase
      .from("ai_insights")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Failed to delete insight:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch {
    return { success: false, error: "Unexpected error" }
  }
}
