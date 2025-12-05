"use server"

import { createClient } from "@/lib/supabase/server"
import type { DurationBasedAnalytics, TimeBasedAnalytics } from "@/types"

export async function getDurationBasedAnalytics(): Promise<DurationBasedAnalytics[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  try {
    const { data, error } = await supabase.rpc("get_duration_based_analytics", {
      user_id_param: user.id,
    })

    if (error) {
      console.error("Error fetching duration-based analytics:", error)
      return []
    }

    return data.map((item: any) => ({
      durationRange: item.duration_range,
      totalTrades: item.total_trades,
      winCount: item.win_count,
      lossCount: item.loss_count,
      winRate: item.win_rate,
      avgPnl: item.avg_pnl,
    }))
  } catch (error) {
    console.error("Exception in getDurationBasedAnalytics:", error)
    return []
  }
}

export async function getTimeBasedAnalytics(): Promise<TimeBasedAnalytics[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  try {
    const { data, error } = await supabase.rpc("get_time_based_analytics", {
      user_id_param: user.id,
    })

    if (error) {
      console.error("Error fetching time-based analytics:", error)
      return []
    }

    return data.map((item: any) => ({
      timeCategory: item.time_category,
      totalTrades: item.total_trades,
      winCount: item.win_count,
      lossCount: item.loss_count,
      winRate: item.win_rate,
      avgPnl: item.avg_pnl,
      avgDuration: item.avg_duration,
    }))
  } catch (error) {
    console.error("Exception in getTimeBasedAnalytics:", error)
    return []
  }
}
