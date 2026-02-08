import type { Trade } from "@/types"

export interface KellyCriterionResult {
  kellyPercent: number
  recommendedRiskPercent: number
  halfKellyPercent: number
  positionSizeGuide: {
    riskPercent: number
    accountSize: number
    riskAmount: number
    suggestedPositionSize: number
  }[]
  advice: string
}

export interface RiskAnalysis {
  currentWinRate: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  currentAvgRiskPercent: number
  currentAvgRiskReward: number
  expectancy: number
  kellyCriterion: KellyCriterionResult
  drawdownMetrics: {
    maxDrawdown: number
    currentDrawdown: number
    recoveryTrades: number
  }
  recommendations: string[]
}

export function analyzeAndCalculateRisk(trades: Trade[]): RiskAnalysis {
  if (!trades.length) {
    return {
      currentWinRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 1,
      currentAvgRiskPercent: 0,
      currentAvgRiskReward: 1,
      expectancy: 0,
      kellyCriterion: calculateKellyCriterion(0, 0, 0),
      drawdownMetrics: { maxDrawdown: 0, currentDrawdown: 0, recoveryTrades: 0 },
      recommendations: [],
    }
  }

  const wins = trades.filter((t) => t.outcome === "win").length
  const losses = trades.filter((t) => t.outcome === "loss").length
  const totalTrades = trades.length

  const currentWinRate = totalTrades > 0 ? wins / totalTrades : 0

  const winPnLs = trades.filter((t) => t.outcome === "win").map((t) => t.pnl || 0)
  const lossPnLs = trades.filter((t) => t.outcome === "loss").map((t) => Math.abs(t.pnl || 0))

  const avgWin = winPnLs.length > 0 ? winPnLs.reduce((a, b) => a + b, 0) / winPnLs.length : 0
  const avgLoss = lossPnLs.length > 0 ? lossPnLs.reduce((a, b) => a + b, 0) / lossPnLs.length : 0

  const profitFactor = avgLoss !== 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 1

  const currentAvgRiskPercent = calculateAverageRiskPercent(trades)
  const currentAvgRiskReward = avgLoss !== 0 ? avgWin / avgLoss : 1

  // Expectancy = (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
  const lossRate = 1 - currentWinRate
  const expectancy = (currentWinRate * avgWin) - (lossRate * avgLoss)

  const kellyCriterion = calculateKellyCriterion(currentWinRate, avgWin, avgLoss)
  const drawdownMetrics = calculateDrawdownMetrics(trades)

  const recommendations = generateRiskRecommendations(currentWinRate, profitFactor, kellyCriterion, drawdownMetrics)

  return {
    currentWinRate,
    avgWin,
    avgLoss,
    profitFactor,
    currentAvgRiskPercent,
    currentAvgRiskReward,
    expectancy,
    kellyCriterion,
    drawdownMetrics,
    recommendations,
  }
}

export function calculateKellyCriterion(winRate: number, avgWin: number, avgLoss: number): KellyCriterionResult {
  if (avgWin === 0 || avgLoss === 0 || winRate === 0) {
    return {
      kellyPercent: 0,
      recommendedRiskPercent: 1,
      halfKellyPercent: 0.5,
      positionSizeGuide: [],
      advice: "Insufficient data for Kelly Criterion calculation. Use 1-2% risk per trade.",
    }
  }

  const winProb = winRate
  const lossProb = 1 - winRate
  const winLossRatio = avgWin / avgLoss

  const kellyPercent = (winProb * winLossRatio - lossProb) / winLossRatio

  const safeKelly = Math.max(0, Math.min(kellyPercent, 0.25))
  const halfKelly = safeKelly / 2

  const recommendedRiskPercent = Math.max(0.5, Math.min(halfKelly * 100, 5))

  const accountSizes = [1000, 5000, 10000, 25000, 50000, 100000]
  const positionSizeGuide = accountSizes.map((accountSize) => ({
    riskPercent: recommendedRiskPercent,
    accountSize,
    riskAmount: (accountSize * recommendedRiskPercent) / 100,
    suggestedPositionSize: ((accountSize * recommendedRiskPercent) / 100 / avgLoss) * avgWin,
  }))

  const advice = generateKellyAdvice(kellyPercent, recommendedRiskPercent, winRate)

  return {
    kellyPercent: Math.round(kellyPercent * 1000) / 10,
    recommendedRiskPercent: Math.round(recommendedRiskPercent * 10) / 10,
    halfKellyPercent: Math.round(halfKelly * 1000) / 10,
    positionSizeGuide,
    advice,
  }
}

function calculateAverageRiskPercent(trades: Trade[]): number {
  if (!trades.length) return 0

  const riskPercents = trades
    .map((trade) => {
      const risk = Math.abs(trade.entry_price - trade.stop_loss) * trade.size
      const reward = Math.abs(trade.exit_price - trade.entry_price) * trade.size
      if (reward === 0) return 0
      return (risk / reward) * 100
    })
    .filter((r) => r > 0)

  return riskPercents.length > 0 ? riskPercents.reduce((a, b) => a + b, 0) / riskPercents.length : 0
}

function calculateDrawdownMetrics(trades: Trade[]): { maxDrawdown: number; currentDrawdown: number; recoveryTrades: number } {
  if (!trades.length) return { maxDrawdown: 0, currentDrawdown: 0, recoveryTrades: 0 }

  let runningPnL = 0
  let maxPnL = 0
  let maxDrawdown = 0
  let currentDrawdown = 0
  let recoveryTrades = 0
  let inRecovery = false

  for (const trade of trades) {
    runningPnL += trade.pnl || 0
    if (runningPnL > maxPnL) {
      maxPnL = runningPnL
      if (inRecovery) {
        inRecovery = false
      }
    }

    const drawdown = ((maxPnL - runningPnL) / Math.max(1, maxPnL)) * 100
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
    currentDrawdown = drawdown

    if (drawdown > 0 && !inRecovery) {
      inRecovery = true
      recoveryTrades = 0
    }

    if (inRecovery) {
      recoveryTrades++
    }
  }

  return {
    maxDrawdown: Math.round(maxDrawdown * 10) / 10,
    currentDrawdown: Math.round(currentDrawdown * 10) / 10,
    recoveryTrades,
  }
}

function generateKellyAdvice(kellyPercent: number, recommendedRiskPercent: number, winRate: number): string {
  if (winRate < 0.4) {
    return `With a ${(winRate * 100).toFixed(1)}% win rate, use conservative 1% risk per trade until consistency improves.`
  }

  if (kellyPercent > 0.5) {
    return `Your Kelly Criterion is ${(kellyPercent * 100).toFixed(1)}%, but use ${recommendedRiskPercent.toFixed(1)}% (half-Kelly) for safety.`
  }

  return `Risk ${recommendedRiskPercent.toFixed(1)}% per trade based on your ${(winRate * 100).toFixed(1)}% win rate and ${((recommendedRiskPercent / (1 - winRate)) * winRate).toFixed(1)}x risk-reward ratio.`
}

function generateRiskRecommendations(
  winRate: number,
  profitFactor: number,
  kellyCriterion: KellyCriterionResult,
  drawdown: { maxDrawdown: number; currentDrawdown: number; recoveryTrades: number },
): string[] {
  const recommendations: string[] = []

  if (winRate < 0.4) {
    recommendations.push("Your win rate is below 40%. Focus on improving setup selection before increasing position size.")
  } else if (winRate > 0.6) {
    recommendations.push("Your win rate exceeds 60%. You can safely use the recommended Kelly Criterion position sizing.")
  }

  if (profitFactor < 1.5) {
    recommendations.push("Your profit factor is low. Consider tightening stop losses or improving entry accuracy.")
  } else if (profitFactor > 3) {
    recommendations.push("Exceptional profit factor. Maintain current risk management and avoid over-leveraging.")
  }

  if (drawdown.currentDrawdown > drawdown.maxDrawdown * 0.8) {
    recommendations.push(
      `You're in a significant drawdown (${drawdown.currentDrawdown.toFixed(1)}%). Consider reducing position size temporarily.`,
    )
  }

  if (drawdown.recoveryTrades > 20) {
    recommendations.push(
      `Recovery is taking ${drawdown.recoveryTrades} trades. This is normal—maintain discipline and avoid revenge trading.`,
    )
  }

  return recommendations
}
