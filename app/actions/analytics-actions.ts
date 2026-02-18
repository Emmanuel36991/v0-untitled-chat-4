"use server"

import { createClient } from "@/lib/supabase/server"
import { isSameDay, isSameWeek, isSameMonth, isSameYear } from "date-fns"

export interface ConfluenceStat {
  id: string
  text: string
  category: string
  count: number
  wins: number
  pnl: number
  winRate: number
}

export async function getAnalyticsData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { stats: {}, equityCurve: [], hourlyStats: [], instrumentStats: [], confluenceStats: [] }

  // 1. Fetch Trades with cap for scale (e.g. 5k+ trades)
  const TRADES_CAP = 20000
  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true })
    .limit(TRADES_CAP)

  if (!trades) return { stats: {}, equityCurve: [], hourlyStats: [], instrumentStats: [], confluenceStats: [] }

  // 2. Fetch User Strategies & Rules to decode Confluences
  const { data: strategies } = await supabase
    .from("playbook_strategies")
    .select("id")
    .eq("user_id", user.id)

  const strategyIds = strategies?.map(s => s.id) || []

  const { data: rules } = await supabase
    .from("strategy_rules")
    .select("id, text, category")
    .in("strategy_id", strategyIds)

  // O(1) rule lookup instead of O(trades * rules) with .find()
  const ruleById = new Map<string, { id: string; text: string; category: string | null }>()
  if (rules) {
    for (const r of rules) {
      ruleById.set(r.id, { id: r.id, text: r.text, category: r.category ?? null })
    }
  }

  // 3. Process Confluence Statistics
  const confluenceMap = new Map<string, ConfluenceStat>()

  if (trades) {
    for (const trade of trades) {
      const tradeRules = trade.executed_rules || []
      if (!Array.isArray(tradeRules)) continue

      const pnl = Number(trade.pnl) || 0
      const isWin = pnl > 0

      for (const ruleId of tradeRules) {
        const ruleDef = ruleById.get(ruleId)
        if (!ruleDef) continue

        let current = confluenceMap.get(ruleId)
        if (!current) {
          current = {
            id: ruleId,
            text: ruleDef.text,
            category: ruleDef.category || "price",
            count: 0,
            wins: 0,
            pnl: 0,
            winRate: 0,
          }
          confluenceMap.set(ruleId, current)
        }
        current.count++
        current.pnl += pnl
        if (isWin) current.wins++
      }
    }
  }

  const confluenceStats = Array.from(confluenceMap.values())
    .map(c => ({
      ...c,
      winRate: c.count > 0 ? (c.wins / c.count) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)

  // -- Standard Analytics --
  const totalPnl = trades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
  const wins = trades.filter((t) => (Number(t.pnl) || 0) > 0).length
  const losses = trades.filter((t) => (Number(t.pnl) || 0) <= 0).length
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0

  let runningPnl = 0
  const equityCurve = trades.map((t) => {
    runningPnl += Number(t.pnl) || 0
    // Fixed: Using 't.date' instead of 't.entry_date'
    return { date: t.date, value: runningPnl }
  })

  return {
    stats: {
      totalPnl,
      winRate,
      totalTrades: trades.length,
      winningTrades: wins,
      losingTrades: losses,
    },
    equityCurve,
    hourlyStats: [], 
    instrumentStats: [],
    confluenceStats
  }
}

// --- Period Statistics for AI Summary ---
export async function getPeriodStatistics() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
  
    const { data: trades } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10000)

    if (!trades) return { daily: null, weekly: null, monthly: null, yearly: null }
  
    const now = new Date()
  
    const calculateStats = (subset: any[]) => {
      if (!subset || subset.length === 0) return null
      const totalPnl = subset.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
      const winTrades = subset.filter((t) => (Number(t.pnl) || 0) > 0).length
      const totalTrades = subset.length
      const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0
      
      let peak = 0
      let maxDrawdown = 0
      let runningPnl = 0
      // Fixed: sort using 't.date'
      const chronoTrades = [...subset].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      chronoTrades.forEach(t => {
        runningPnl += (Number(t.pnl) || 0)
        if (runningPnl > peak) peak = runningPnl
        const dd = peak - runningPnl
        if (dd > maxDrawdown) maxDrawdown = dd
      })
  
      const grossProfit = subset.reduce((sum, t) => sum + (Number(t.pnl) > 0 ? Number(t.pnl) : 0), 0)
      const grossLoss = Math.abs(subset.reduce((sum, t) => sum + (Number(t.pnl) < 0 ? Number(t.pnl) : 0), 0))
      const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss
  
      return { totalPnl, winRate, totalTrades, maxDrawdown, profitFactor }
    }
  
    // Fixed: Using 't.date' for date-fns comparisons
    const dailyTrades = trades.filter((t) => isSameDay(new Date(t.date), now))
    const weeklyTrades = trades.filter((t) => isSameWeek(new Date(t.date), now))
    const monthlyTrades = trades.filter((t) => isSameMonth(new Date(t.date), now))
    const yearlyTrades = trades.filter((t) => isSameYear(new Date(t.date), now))
  
    return {
      daily: calculateStats(dailyTrades),
      weekly: calculateStats(weeklyTrades),
      monthly: calculateStats(monthlyTrades),
      yearly: calculateStats(yearlyTrades),
    }
}
