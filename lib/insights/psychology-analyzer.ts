import type { Trade } from "@/types"

export interface PsychologyFactor {
  factor: string
  tradeCount: number
  winCount: number
  lossCount: number
  breakevenCount: number
  winRate: number
  avgPnL: number
  totalPnL: number
  impact: number
}

export interface PsychologyAnalysisResult {
  allFactors: PsychologyFactor[]
  positiveFactors: PsychologyFactor[]
  negativeFactors: PsychologyFactor[]
  topKillers: PsychologyFactor[]
  topEnablers: PsychologyFactor[]
  insights: string[]
}

export function analyzePsychologyPatterns(trades: Trade[]): PsychologyAnalysisResult {
  if (!trades.length) {
    return {
      allFactors: [],
      positiveFactors: [],
      negativeFactors: [],
      topKillers: [],
      topEnablers: [],
      insights: [],
    }
  }

  const factorMap = new Map<string, Trade[]>()

  trades.forEach((trade) => {
    if (!trade.psychology_factors || trade.psychology_factors.length === 0) return

    trade.psychology_factors.forEach((factor) => {
      if (!factorMap.has(factor)) {
        factorMap.set(factor, [])
      }
      factorMap.get(factor)!.push(trade)
    })
  })

  const allFactors: PsychologyFactor[] = Array.from(factorMap.entries()).map(([factor, factorTrades]) => {
    const wins = factorTrades.filter((t) => t.outcome === "win").length
    const losses = factorTrades.filter((t) => t.outcome === "loss").length
    const breakeven = factorTrades.filter((t) => t.outcome === "breakeven").length
    const tradeCount = factorTrades.length
    const winRate = tradeCount > 0 ? wins / tradeCount : 0

    const totalPnL = factorTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const avgPnL = tradeCount > 0 ? totalPnL / tradeCount : 0

    const baselineWinRate = trades.filter((t) => t.outcome === "win").length / trades.length
    const impact = (winRate - baselineWinRate) * 100

    return {
      factor,
      tradeCount,
      winCount: wins,
      lossCount: losses,
      breakevenCount: breakeven,
      winRate,
      avgPnL,
      totalPnL,
      impact,
    }
  })

  const positiveFactors = allFactors.filter((f) => f.impact > 0).sort((a, b) => b.impact - a.impact)
  const negativeFactors = allFactors.filter((f) => f.impact < 0).sort((a, b) => a.impact - b.impact)

  const topEnablers = positiveFactors.slice(0, 3)
  const topKillers = negativeFactors.slice(0, 3)

  const insights = generatePsychologyInsights(allFactors, topEnablers, topKillers, trades)

  return {
    allFactors,
    positiveFactors,
    negativeFactors,
    topKillers,
    topEnablers,
    insights,
  }
}

function generatePsychologyInsights(
  allFactors: PsychologyFactor[],
  topEnablers: PsychologyFactor[],
  topKillers: PsychologyFactor[],
  trades: Trade[],
): string[] {
  const insights: string[] = []

  if (topEnablers.length > 0) {
    insights.push(
      `Your top edge-enabler is "${topEnablers[0].factor}" with +${topEnablers[0].impact.toFixed(1)}% win rate improvement.`,
    )
  }

  if (topKillers.length > 0) {
    insights.push(
      `Your biggest edge-killer is "${topKillers[0].factor}" with ${topKillers[0].impact.toFixed(1)}% win rate reduction.`,
    )
  }

  const allPsychFactors = allFactors.map((f) => f.factor)
  if (allPsychFactors.length === 0) {
    insights.push("No psychology factors recorded yet. Start logging psychological states with your trades.")
  }

  const streaks = detectStreaks(trades)
  if (streaks.maxLossStreak >= 3) {
    insights.push(
      `Longest losing streak: ${streaks.maxLossStreak} trades. This is statistically normal—don't abandon strategy.`,
    )
  }

  if (streaks.maxWinStreak >= 3) {
    insights.push(`Longest winning streak: ${streaks.maxWinStreak} trades. Maintain consistency during hot periods.`)
  }

  return insights
}

function detectStreaks(trades: Trade[]): { maxWinStreak: number; maxLossStreak: number } {
  let maxWinStreak = 0
  let maxLossStreak = 0
  let currentStreak = 0
  let lastOutcome: string | null = null

  for (const trade of trades) {
    if (trade.outcome === lastOutcome) {
      currentStreak++
    } else {
      if (lastOutcome === "win") {
        maxWinStreak = Math.max(maxWinStreak, currentStreak)
      } else if (lastOutcome === "loss") {
        maxLossStreak = Math.max(maxLossStreak, currentStreak)
      }
      currentStreak = 1
      lastOutcome = trade.outcome
    }
  }

  if (lastOutcome === "win") {
    maxWinStreak = Math.max(maxWinStreak, currentStreak)
  } else if (lastOutcome === "loss") {
    maxLossStreak = Math.max(maxLossStreak, currentStreak)
  }

  return { maxWinStreak, maxLossStreak }
}
