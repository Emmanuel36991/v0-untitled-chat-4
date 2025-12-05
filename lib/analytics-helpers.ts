import type { Trade } from "@/types"

export interface AdvancedAnalytics {
  confluenceScore: number
  consistencyIndex: number
  riskAdjustedReturn: number
  sharpeRatio: number
  calmarRatio: number
  sortino: number
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  averageWinDuration: number
  averageLossDuration: number
  profitabilityByTimeOfDay: Record<string, number>
  seasonalPerformance: Record<string, number>
}

export function calculateAdvancedAnalytics(trades: Trade[]): AdvancedAnalytics {
  if (!trades.length) {
    return {
      confluenceScore: 0,
      consistencyIndex: 0,
      riskAdjustedReturn: 0,
      sharpeRatio: 0,
      calmarRatio: 0,
      sortino: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      averageWinDuration: 0,
      averageLossDuration: 0,
      profitabilityByTimeOfDay: {},
      seasonalPerformance: {},
    }
  }

  // Calculate confluence score
  const confluenceScore = calculateConfluenceScore(trades)

  // Calculate consistency index
  const consistencyIndex = calculateConsistencyIndex(trades)

  // Calculate risk-adjusted metrics
  const returns = trades.map((t) => t.pnl)
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
  const riskAdjustedReturn = stdDev > 0 ? avgReturn / stdDev : 0

  // Calculate Sharpe ratio (assuming risk-free rate of 2%)
  const riskFreeRate = 0.02 / 252 // Daily risk-free rate
  const sharpeRatio = stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0

  // Calculate maximum drawdown for Calmar ratio
  const maxDrawdown = calculateMaxDrawdown(trades)
  const calmarRatio = maxDrawdown > 0 ? (avgReturn * 252) / maxDrawdown : 0

  // Calculate Sortino ratio (downside deviation)
  const negativeReturns = returns.filter((r) => r < 0)
  const downsideDeviation =
    negativeReturns.length > 0
      ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length)
      : 0
  const sortino = downsideDeviation > 0 ? avgReturn / downsideDeviation : 0

  // Calculate consecutive wins/losses
  const { maxConsecutiveWins, maxConsecutiveLosses } = calculateConsecutiveStreaks(trades)

  // Calculate average durations
  const winTrades = trades.filter((t) => t.outcome === "win")
  const lossTrades = trades.filter((t) => t.outcome === "loss")
  const averageWinDuration =
    winTrades.length > 0 ? winTrades.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / winTrades.length : 0
  const averageLossDuration =
    lossTrades.length > 0 ? lossTrades.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / lossTrades.length : 0

  // Calculate profitability by time of day
  const profitabilityByTimeOfDay = calculateProfitabilityByTimeOfDay(trades)

  // Calculate seasonal performance
  const seasonalPerformance = calculateSeasonalPerformance(trades)

  return {
    confluenceScore,
    consistencyIndex,
    riskAdjustedReturn,
    sharpeRatio,
    calmarRatio,
    sortino,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    averageWinDuration,
    averageLossDuration,
    profitabilityByTimeOfDay,
    seasonalPerformance,
  }
}

function calculateConfluenceScore(trades: Trade[]): number {
  const totalConcepts = trades.reduce((sum, trade) => {
    const concepts = [
      ...(trade.smc_market_structure || []),
      ...(trade.ict_market_structure_shift || []),
      ...(trade.wyckoff_phases || []),
      ...(trade.support_resistance_used || []),
      ...(trade.psychology_factors || []),
    ]
    return sum + concepts.length
  }, 0)

  return trades.length > 0 ? totalConcepts / trades.length : 0
}

function calculateConsistencyIndex(trades: Trade[]): number {
  if (trades.length < 2) return 0

  const returns = trades.map((t) => t.pnl)
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)

  // Consistency index: higher values indicate more consistent performance
  return stdDev > 0 ? Math.max(0, 100 - (stdDev / Math.abs(avgReturn)) * 100) : 0
}

function calculateMaxDrawdown(trades: Trade[]): number {
  let runningTotal = 0
  let peak = 0
  let maxDrawdown = 0

  trades.forEach((trade) => {
    runningTotal += trade.pnl
    if (runningTotal > peak) {
      peak = runningTotal
    }
    const drawdown = peak - runningTotal
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  })

  return maxDrawdown
}

function calculateConsecutiveStreaks(trades: Trade[]): { maxConsecutiveWins: number; maxConsecutiveLosses: number } {
  let maxConsecutiveWins = 0
  let maxConsecutiveLosses = 0
  let currentWinStreak = 0
  let currentLossStreak = 0

  trades.forEach((trade) => {
    if (trade.outcome === "win") {
      currentWinStreak++
      currentLossStreak = 0
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak)
    } else if (trade.outcome === "loss") {
      currentLossStreak++
      currentWinStreak = 0
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak)
    } else {
      currentWinStreak = 0
      currentLossStreak = 0
    }
  })

  return { maxConsecutiveWins, maxConsecutiveLosses }
}

function calculateProfitabilityByTimeOfDay(trades: Trade[]): Record<string, number> {
  const hourlyPnl: Record<string, number[]> = {}

  trades.forEach((trade) => {
    if (trade.trade_start_time) {
      const hour = trade.trade_start_time.split(":")[0]
      if (!hourlyPnl[hour]) {
        hourlyPnl[hour] = []
      }
      hourlyPnl[hour].push(trade.pnl)
    }
  })

  const profitability: Record<string, number> = {}
  Object.entries(hourlyPnl).forEach(([hour, pnls]) => {
    profitability[hour] = pnls.reduce((sum, pnl) => sum + pnl, 0) / pnls.length
  })

  return profitability
}

function calculateSeasonalPerformance(trades: Trade[]): Record<string, number> {
  const seasonalPnl: Record<string, number[]> = {
    Q1: [],
    Q2: [],
    Q3: [],
    Q4: [],
  }

  trades.forEach((trade) => {
    const date = new Date(trade.date)
    const month = date.getMonth() + 1
    const quarter = month <= 3 ? "Q1" : month <= 6 ? "Q2" : month <= 9 ? "Q3" : "Q4"
    seasonalPnl[quarter].push(trade.pnl)
  })

  const performance: Record<string, number> = {}
  Object.entries(seasonalPnl).forEach(([quarter, pnls]) => {
    performance[quarter] = pnls.length > 0 ? pnls.reduce((sum, pnl) => sum + pnl, 0) / pnls.length : 0
  })

  return performance
}

export function generateInsights(trades: Trade[], analytics: AdvancedAnalytics): string[] {
  const insights: string[] = []

  // Confluence insights
  if (analytics.confluenceScore > 3) {
    insights.push("🎯 Excellent strategy confluence! You're effectively combining multiple trading concepts.")
  } else if (analytics.confluenceScore < 1.5) {
    insights.push("⚠️ Consider using more confluent factors in your trade setups for better accuracy.")
  }

  // Consistency insights
  if (analytics.consistencyIndex > 70) {
    insights.push("📈 Your trading shows excellent consistency. Keep up the disciplined approach!")
  } else if (analytics.consistencyIndex < 40) {
    insights.push("📊 Focus on improving consistency by standardizing your trade management.")
  }

  // Risk management insights
  if (analytics.sharpeRatio > 1.5) {
    insights.push("🛡️ Outstanding risk-adjusted returns! Your risk management is working well.")
  } else if (analytics.sharpeRatio < 0.5) {
    insights.push("⚠️ Consider tightening your risk management to improve risk-adjusted returns.")
  }

  // Streak insights
  if (analytics.maxConsecutiveLosses > 5) {
    insights.push("🔴 You've experienced long losing streaks. Consider reviewing your strategy during drawdowns.")
  }

  if (analytics.maxConsecutiveWins > 8) {
    insights.push("🟢 Great winning streaks! Be careful not to become overconfident during hot streaks.")
  }

  // Duration insights
  if (analytics.averageWinDuration < analytics.averageLossDuration) {
    insights.push("⏱️ You're cutting winners short and letting losers run. Consider adjusting your exit strategy.")
  }

  return insights
}
