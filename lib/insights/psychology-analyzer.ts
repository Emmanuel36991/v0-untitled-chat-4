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
  type?: 'good' | 'bad' // Added to distinguish habit type
}

export interface PsychologyAnalysisResult {
  allFactors: PsychologyFactor[]
  positiveFactors: PsychologyFactor[]
  negativeFactors: PsychologyFactor[]
  topKillers: PsychologyFactor[]
  topEnablers: PsychologyFactor[]
  goodHabits: PsychologyFactor[] // NEW: Good habits from trades
  badHabits: PsychologyFactor[] // NEW: Bad habits from trades
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
      goodHabits: [],
      badHabits: [],
      insights: [],
    }
  }

  const factorMap = new Map<string, Trade[]>()
  const goodHabitMap = new Map<string, Trade[]>()

  trades.forEach((trade) => {
    // Process bad habits (psychology_factors)
    if (trade.psychology_factors && trade.psychology_factors.length > 0) {
      trade.psychology_factors.forEach((factor) => {
        if (!factorMap.has(factor)) {
          factorMap.set(factor, [])
        }
        factorMap.get(factor)!.push(trade)
      })
    }

    // Process good habits
    if (trade.good_habits && trade.good_habits.length > 0) {
      trade.good_habits.forEach((habit) => {
        if (!goodHabitMap.has(habit)) {
          goodHabitMap.set(habit, [])
        }
        goodHabitMap.get(habit)!.push(trade)
      })
    }
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

  // Calculate good habits analytics
  const goodHabits: PsychologyFactor[] = Array.from(goodHabitMap.entries()).map(([habit, habitTrades]) => {
    const wins = habitTrades.filter((t) => t.outcome === "win").length
    const losses = habitTrades.filter((t) => t.outcome === "loss").length
    const breakeven = habitTrades.filter((t) => t.outcome === "breakeven").length
    const tradeCount = habitTrades.length
    const winRate = tradeCount > 0 ? wins / tradeCount : 0

    const totalPnL = habitTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const avgPnL = tradeCount > 0 ? totalPnL / tradeCount : 0

    const baselineWinRate = trades.filter((t) => t.outcome === "win").length / trades.length
    const impact = (winRate - baselineWinRate) * 100

    return {
      factor: habit,
      tradeCount,
      winCount: wins,
      lossCount: losses,
      breakevenCount: breakeven,
      winRate,
      avgPnL,
      totalPnL,
      impact,
      type: 'good' as const
    }
  }).sort((a, b) => b.impact - a.impact)

  // Mark bad habits
  const badHabits = allFactors.map(f => ({ ...f, type: 'bad' as const }))

  const positiveFactors = allFactors.filter((f) => f.impact > 0).sort((a, b) => b.impact - a.impact)
  const negativeFactors = allFactors.filter((f) => f.impact < 0).sort((a, b) => a.impact - b.impact)

  const topEnablers = positiveFactors.slice(0, 3)
  const topKillers = negativeFactors.slice(0, 3)

  const insights = generatePsychologyInsights(allFactors, goodHabits, topEnablers, topKillers, trades)

  return {
    allFactors,
    positiveFactors,
    negativeFactors,
    topKillers,
    topEnablers,
    goodHabits,
    badHabits,
    insights,
  }
}

function generatePsychologyInsights(
  allFactors: PsychologyFactor[],
  goodHabits: PsychologyFactor[],
  topEnablers: PsychologyFactor[],
  topKillers: PsychologyFactor[],
  trades: Trade[],
): string[] {
  const insights: string[] = []

  // Good habits insights
  if (goodHabits.length > 0 && goodHabits[0].impact > 0) {
    insights.push(
      `🌟 Your strongest good habit is "${goodHabits[0].factor}" with +${goodHabits[0].impact.toFixed(1)}% win rate improvement. Keep it up!`,
    )
  }

  // Legacy enablers (from bad habits that somehow improve performance)
  if (topEnablers.length > 0) {
    insights.push(
      `Your top edge-enabler is "${topEnablers[0].factor}" with +${topEnablers[0].impact.toFixed(1)}% win rate improvement.`,
    )
  }

  // Bad habits insights
  if (topKillers.length > 0) {
    insights.push(
      `⚠️ Your biggest edge-killer is "${topKillers[0].factor}" with ${topKillers[0].impact.toFixed(1)}% win rate reduction.`,
    )
  }

  // Balance check
  const goodHabitCount = goodHabits.reduce((sum, h) => sum + h.tradeCount, 0)
  const badHabitCount = allFactors.reduce((sum, f) => sum + f.tradeCount, 0)
  
  if (goodHabitCount > badHabitCount * 2) {
    insights.push("✅ Excellent! You're logging more good habits than bad. Your discipline is showing.")
  } else if (badHabitCount > goodHabitCount * 2) {
    insights.push("⚡ Focus on reinforcing good habits. Try to identify what you do right in winning trades.")
  }

  const allPsychFactors = allFactors.map((f) => f.factor)
  if (allPsychFactors.length === 0 && goodHabits.length === 0) {
    insights.push("No psychology factors recorded yet. Start logging both good and bad habits with your trades.")
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
