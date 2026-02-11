import type { Trade } from "@/types"
import { BAD_HABITS, GOOD_HABITS } from "@/types"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PsychFactorStat {
  id: string
  label: string
  type: "good" | "bad"
  tradeCount: number
  wins: number
  losses: number
  winRate: number
  avgPnl: number
  totalPnl: number
}

export interface PsychologyCorrelationResult {
  factors: PsychFactorStat[]
  topPositiveFactors: PsychFactorStat[]
  topNegativeFactors: PsychFactorStat[]
  tradesWithFactors: number
  tradesWithoutFactors: number
  overallWithFactorsWinRate: number
  overallWithoutFactorsWinRate: number
  recommendation: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const allHabitsMap = new Map<string, { name: string; type: "good" | "bad" }>()
for (const h of GOOD_HABITS) allHabitsMap.set(h.id, { name: h.name, type: "good" })
for (const h of BAD_HABITS) allHabitsMap.set(h.id, { name: h.name, type: "bad" })

// ── Main Analysis ──────────────────────────────────────────────────────────────

export function analyzePsychologyCorrelation(trades: Trade[]): PsychologyCorrelationResult {
  const empty: PsychologyCorrelationResult = {
    factors: [],
    topPositiveFactors: [],
    topNegativeFactors: [],
    tradesWithFactors: 0,
    tradesWithoutFactors: trades.length,
    overallWithFactorsWinRate: 0,
    overallWithoutFactorsWinRate: 0,
    recommendation: "Start tagging psychology factors on your trades to discover correlations between mindset and performance.",
  }

  if (!trades.length) return empty

  // Collect all psychology_factors and good_habits from trades
  const factorMap = new Map<string, { wins: number; losses: number; pnls: number[] }>()

  let tradesWithFactors = 0
  let tradesWithoutFactors = 0
  let winsWithFactors = 0
  let winsWithoutFactors = 0

  for (const trade of trades) {
    const factors = [
      ...(trade.psychology_factors || []),
      ...(trade.good_habits || []),
    ]

    if (factors.length > 0) {
      tradesWithFactors++
      if (trade.pnl > 0) winsWithFactors++
    } else {
      tradesWithoutFactors++
      if (trade.pnl > 0) winsWithoutFactors++
    }

    for (const factorId of factors) {
      const entry = factorMap.get(factorId) || { wins: 0, losses: 0, pnls: [] }
      entry.pnls.push(trade.pnl || 0)
      if (trade.pnl > 0) entry.wins++
      else entry.losses++
      factorMap.set(factorId, entry)
    }
  }

  // Build factor stats
  const factors: PsychFactorStat[] = Array.from(factorMap.entries())
    .map(([id, data]) => {
      const habit = allHabitsMap.get(id)
      const totalPnl = data.pnls.reduce((a, b) => a + b, 0)
      const tradeCount = data.wins + data.losses
      return {
        id,
        label: habit?.name || id,
        type: (habit?.type || (GOOD_HABITS.some(h => h.id === id) ? "good" : "bad")) as "good" | "bad",
        tradeCount,
        wins: data.wins,
        losses: data.losses,
        winRate: tradeCount > 0 ? data.wins / tradeCount : 0,
        avgPnl: tradeCount > 0 ? totalPnl / tradeCount : 0,
        totalPnl,
      }
    })
    .filter(f => f.tradeCount >= 1)
    .sort((a, b) => b.tradeCount - a.tradeCount)

  // Top positive (good habits with highest win rate)
  const topPositiveFactors = factors
    .filter(f => f.type === "good" && f.tradeCount >= 1)
    .sort((a, b) => b.winRate - a.winRate || b.totalPnl - a.totalPnl)
    .slice(0, 5)

  // Top negative (bad habits with lowest win rate)
  const topNegativeFactors = factors
    .filter(f => f.type === "bad" && f.tradeCount >= 1)
    .sort((a, b) => a.winRate - b.winRate || a.totalPnl - b.totalPnl)
    .slice(0, 5)

  const overallWithFactorsWinRate = tradesWithFactors > 0 ? winsWithFactors / tradesWithFactors : 0
  const overallWithoutFactorsWinRate = tradesWithoutFactors > 0 ? winsWithoutFactors / tradesWithoutFactors : 0

  // Generate recommendation
  let recommendation = ""
  if (tradesWithFactors < 5) {
    recommendation = `Only ${tradesWithFactors} trades have psychology factors tagged. Tag more trades for reliable mindset-performance correlations.`
  } else if (topPositiveFactors.length > 0 && topNegativeFactors.length > 0) {
    const bestFactor = topPositiveFactors[0]
    const worstFactor = topNegativeFactors[0]
    recommendation = `"${bestFactor.label}" correlates with ${(bestFactor.winRate * 100).toFixed(0)}% win rate, while "${worstFactor.label}" drops to ${(worstFactor.winRate * 100).toFixed(0)}%. Prioritize positive mental states before entering trades.`
  } else if (topPositiveFactors.length > 0) {
    const best = topPositiveFactors[0]
    recommendation = `When you're "${best.label}", your win rate is ${(best.winRate * 100).toFixed(0)}%. Maintain these conditions for best results.`
  } else {
    recommendation = "Continue tagging psychology factors to build a reliable dataset for mindset analysis."
  }

  return {
    factors,
    topPositiveFactors,
    topNegativeFactors,
    tradesWithFactors,
    tradesWithoutFactors,
    overallWithFactorsWinRate,
    overallWithoutFactorsWinRate,
    recommendation,
  }
}
