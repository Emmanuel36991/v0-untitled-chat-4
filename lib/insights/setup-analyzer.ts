import type { Trade } from "@/types"

export interface SetupPerformance {
  setupName: string
  totalTrades: number
  wins: number
  losses: number
  breakeven: number
  winRate: number
  avgPnL: number
  totalPnL: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  riskRewardRatio: number
  optimalRRR: number
  consistency: number
}

export interface SetupAnalysisResult {
  allSetups: SetupPerformance[]
  topSetups: SetupPerformance[]
  bottomSetups: SetupPerformance[]
  personalEdge: SetupPerformance | null
  recommendations: string[]
}

export function analyzeSetupPatterns(trades: Trade[]): SetupAnalysisResult {
  if (!trades.length) {
    return {
      allSetups: [],
      topSetups: [],
      bottomSetups: [],
      personalEdge: null,
      recommendations: [],
    }
  }

  const setupMap = new Map<string, Trade[]>()

  trades.forEach((trade) => {
    const setupName = trade.setup_name || "Unnamed Setup"
    if (!setupMap.has(setupName)) {
      setupMap.set(setupName, [])
    }
    setupMap.get(setupName)!.push(trade)
  })

  const allSetups: SetupPerformance[] = Array.from(setupMap.entries()).map(([setupName, setupTrades]) => {
    const wins = setupTrades.filter((t) => t.outcome === "win").length
    const losses = setupTrades.filter((t) => t.outcome === "loss").length
    const breakeven = setupTrades.filter((t) => t.outcome === "breakeven").length
    const totalTrades = setupTrades.length
    const winRate = totalTrades > 0 ? wins / totalTrades : 0

    const totalPnL = setupTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0

    const winPnLs = setupTrades.filter((t) => t.outcome === "win").map((t) => t.pnl || 0)
    const lossPnLs = setupTrades.filter((t) => t.outcome === "loss").map((t) => t.pnl || 0)

    const avgWin = winPnLs.length > 0 ? winPnLs.reduce((a, b) => a + b, 0) / winPnLs.length : 0
    const avgLoss = lossPnLs.length > 0 ? Math.abs(lossPnLs.reduce((a, b) => a + b, 0) / lossPnLs.length) : 0

    const profitFactor = avgLoss !== 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 1

    const riskRewardRatio = avgLoss !== 0 ? avgWin / avgLoss : 1

    const optimalRRR = calculateOptimalRRR(winRate, avgWin, avgLoss)

    const consistency = calculateConsistency(setupTrades)

    return {
      setupName,
      totalTrades,
      wins,
      losses,
      breakeven,
      winRate,
      avgPnL,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor,
      riskRewardRatio,
      optimalRRR,
      consistency,
    }
  })

  const topSetups = [...allSetups]
    .sort((a, b) => b.winRate - a.winRate || b.profitFactor - a.profitFactor)
    .slice(0, 3)

  const bottomSetups = [...allSetups]
    .sort((a, b) => a.winRate - b.winRate || a.profitFactor - b.profitFactor)
    .slice(0, 3)

  const personalEdge = allSetups.length > 0 ? topSetups[0] : null

  const recommendations = generateSetupRecommendations(allSetups, personalEdge)

  return {
    allSetups,
    topSetups,
    bottomSetups,
    personalEdge,
    recommendations,
  }
}

function calculateOptimalRRR(winRate: number, avgWin: number, avgLoss: number): number {
  if (avgLoss === 0 || winRate === 0) return 2
  const optimalRRR = (winRate * avgWin) / ((1 - winRate) * avgLoss)
  return Math.max(1, Math.min(10, Math.round(optimalRRR * 10) / 10))
}

function calculateConsistency(trades: Trade[]): number {
  if (trades.length < 2) return 0

  const pnls = trades.map((t) => t.pnl || 0)
  const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length
  const variance = pnls.reduce((sum, pnl) => sum + Math.pow(pnl - mean, 2), 0) / pnls.length
  const stdDev = Math.sqrt(variance)

  if (mean === 0) return stdDev === 0 ? 100 : 0
  const cv = (stdDev / Math.abs(mean)) * 100
  return Math.max(0, 100 - cv)
}

function generateSetupRecommendations(allSetups: SetupPerformance[], personalEdge: SetupPerformance | null): string[] {
  const recommendations: string[] = []

  if (personalEdge) {
    recommendations.push(
      `Your strongest setup is "${personalEdge.setupName}" with ${(personalEdge.winRate * 100).toFixed(1)}% win rate and ${personalEdge.profitFactor.toFixed(2)}x profit factor.`,
    )
    recommendations.push(
      `Focus on optimal risk-reward of 1:${personalEdge.optimalRRR.toFixed(1)} for "${personalEdge.setupName}" trades.`,
    )
  }

  const lowWinRateSetups = allSetups.filter((s) => s.totalTrades >= 3 && s.winRate < 0.4)
  if (lowWinRateSetups.length > 0) {
    recommendations.push(
      `Consider avoiding or refining: ${lowWinRateSetups.map((s) => `"${s.setupName}" (${(s.winRate * 100).toFixed(0)}%)`).join(", ")}`,
    )
  }

  const undertestedSetups = allSetups.filter((s) => s.totalTrades < 3)
  if (undertestedSetups.length > 0) {
    recommendations.push(
      `Collect more data on: ${undertestedSetups.map((s) => `"${s.setupName}" (${s.totalTrades} trades)`).join(", ")}`,
    )
  }

  return recommendations
}
