import type { Trade } from "@/types"

export interface TradingContext {
  performance: {
    totalTrades: number
    winRate: number
    totalPnl: number
    avgPnlPerTrade: number
    profitFactor: number
    maxDrawdown: number
    sharpeRatio: number
  }
  patterns: {
    bestSetups: Array<{ name: string; winRate: number; avgPnl: number; trades: number }>
    worstSetups: Array<{ name: string; winRate: number; avgPnl: number; trades: number }>
    instrumentPerformance: Array<{ instrument: string; winRate: number; avgPnl: number; trades: number }>
    timePatterns: Array<{ session: string; winRate: number; avgPnl: number; trades: number }>
  }
  riskMetrics: {
    stopLossUsage: number
    avgRiskPerTrade: number
    riskRewardRatio: number
    maxConsecutiveLosses: number
    riskScore: number
  }
  recentTrends: {
    last10Trades: {
      winRate: number
      totalPnl: number
      trend: "improving" | "declining" | "stable"
    }
    last30Days: {
      winRate: number
      totalPnl: number
      tradeFrequency: number
    }
  }
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export function buildTradingContext(trades: Trade[]): TradingContext {
  if (trades.length === 0) {
    return {
      performance: {
        totalTrades: 0,
        winRate: 0,
        totalPnl: 0,
        avgPnlPerTrade: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
      },
      patterns: {
        bestSetups: [],
        worstSetups: [],
        instrumentPerformance: [],
        timePatterns: [],
      },
      riskMetrics: {
        stopLossUsage: 0,
        avgRiskPerTrade: 0,
        riskRewardRatio: 0,
        maxConsecutiveLosses: 0,
        riskScore: 0,
      },
      recentTrends: {
        last10Trades: {
          winRate: 0,
          totalPnl: 0,
          trend: "stable",
        },
        last30Days: {
          winRate: 0,
          totalPnl: 0,
          tradeFrequency: 0,
        },
      },
      strengths: [],
      weaknesses: [],
      recommendations: ["Start by logging your first trade to begin analysis"],
    }
  }

  // Calculate basic performance metrics
  const totalTrades = trades.length
  const winningTrades = trades.filter((t) => t.outcome === "win").length
  const winRate = (winningTrades / totalTrades) * 100
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0)
  const avgPnlPerTrade = totalPnl / totalTrades

  // Calculate profit factor
  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
  const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0

  // Calculate max drawdown
  let runningTotal = 0
  let peak = 0
  let maxDrawdown = 0
  trades.forEach((trade) => {
    runningTotal += trade.pnl
    if (runningTotal > peak) peak = runningTotal
    const drawdown = peak - runningTotal
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  })

  // Calculate Sharpe ratio (simplified)
  const returns = trades.map((t) => t.pnl)
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0

  // Analyze setup performance
  const setupPerformance = analyzeSetupPerformance(trades)
  const instrumentPerformance = analyzeInstrumentPerformance(trades)
  const timePatterns = analyzeTimePatterns(trades)

  // Calculate risk metrics
  const riskMetrics = calculateRiskMetrics(trades)

  // Analyze recent trends
  const recentTrends = analyzeRecentTrends(trades)

  // Identify strengths and weaknesses
  const { strengths, weaknesses, recommendations } = identifyStrengthsAndWeaknesses({
    performance: { totalTrades, winRate, totalPnl, avgPnlPerTrade, profitFactor, maxDrawdown, sharpeRatio },
    patterns: {
      bestSetups: setupPerformance.best,
      worstSetups: setupPerformance.worst,
      instrumentPerformance,
      timePatterns,
    },
    riskMetrics,
    recentTrends,
  })

  return {
    performance: {
      totalTrades,
      winRate,
      totalPnl,
      avgPnlPerTrade,
      profitFactor,
      maxDrawdown,
      sharpeRatio,
    },
    patterns: {
      bestSetups: setupPerformance.best,
      worstSetups: setupPerformance.worst,
      instrumentPerformance,
      timePatterns,
    },
    riskMetrics,
    recentTrends,
    strengths,
    weaknesses,
    recommendations,
  }
}

function analyzeSetupPerformance(trades: Trade[]) {
  const setupStats = trades.reduce(
    (acc, trade) => {
      const setup = trade.setup_name || "Unknown"
      if (!acc[setup]) {
        acc[setup] = { trades: 0, wins: 0, totalPnl: 0 }
      }
      acc[setup].trades++
      acc[setup].totalPnl += trade.pnl
      if (trade.outcome === "win") acc[setup].wins++
      return acc
    },
    {} as Record<string, { trades: number; wins: number; totalPnl: number }>,
  )

  const setups = Object.entries(setupStats)
    .filter(([_, data]) => data.trades >= 3) // Only consider setups with 3+ trades
    .map(([name, data]) => ({
      name,
      winRate: (data.wins / data.trades) * 100,
      avgPnl: data.totalPnl / data.trades,
      trades: data.trades,
    }))
    .sort((a, b) => b.avgPnl - a.avgPnl)

  return {
    best: setups.slice(0, 3),
    worst: setups.slice(-3).reverse(),
  }
}

function analyzeInstrumentPerformance(trades: Trade[]) {
  const instrumentStats = trades.reduce(
    (acc, trade) => {
      const instrument = trade.instrument
      if (!acc[instrument]) {
        acc[instrument] = { trades: 0, wins: 0, totalPnl: 0 }
      }
      acc[instrument].trades++
      acc[instrument].totalPnl += trade.pnl
      if (trade.outcome === "win") acc[instrument].wins++
      return acc
    },
    {} as Record<string, { trades: number; wins: number; totalPnl: number }>,
  )

  return Object.entries(instrumentStats)
    .map(([instrument, data]) => ({
      instrument,
      winRate: (data.wins / data.trades) * 100,
      avgPnl: data.totalPnl / data.trades,
      trades: data.trades,
    }))
    .sort((a, b) => b.avgPnl - a.avgPnl)
}

function analyzeTimePatterns(trades: Trade[]) {
  const sessionStats = trades.reduce(
    (acc, trade) => {
      const session = trade.trade_session || "Unknown"
      if (!acc[session]) {
        acc[session] = { trades: 0, wins: 0, totalPnl: 0 }
      }
      acc[session].trades++
      acc[session].totalPnl += trade.pnl
      if (trade.outcome === "win") acc[session].wins++
      return acc
    },
    {} as Record<string, { trades: number; wins: number; totalPnl: number }>,
  )

  return Object.entries(sessionStats)
    .map(([session, data]) => ({
      session,
      winRate: (data.wins / data.trades) * 100,
      avgPnl: data.totalPnl / data.trades,
      trades: data.trades,
    }))
    .sort((a, b) => b.avgPnl - a.avgPnl)
}

function calculateRiskMetrics(trades: Trade[]) {
  const tradesWithStopLoss = trades.filter((t) => t.stop_loss && t.stop_loss !== 0)
  const stopLossUsage = (tradesWithStopLoss.length / trades.length) * 100

  const avgRiskPerTrade =
    tradesWithStopLoss.length > 0
      ? tradesWithStopLoss.reduce((sum, t) => sum + Math.abs(t.entry_price - t.stop_loss) / t.entry_price, 0) /
        tradesWithStopLoss.length
      : 0

  // Calculate risk-reward ratio
  const riskRewardRatios = tradesWithStopLoss.map((t) => {
    const risk = Math.abs(t.entry_price - t.stop_loss)
    const reward = Math.abs(t.exit_price - t.entry_price)
    return risk > 0 ? reward / risk : 0
  })
  const avgRiskRewardRatio =
    riskRewardRatios.length > 0 ? riskRewardRatios.reduce((sum, r) => sum + r, 0) / riskRewardRatios.length : 0

  // Calculate max consecutive losses
  let maxConsecutiveLosses = 0
  let currentLossStreak = 0
  trades.forEach((trade) => {
    if (trade.outcome === "loss") {
      currentLossStreak++
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak)
    } else {
      currentLossStreak = 0
    }
  })

  // Calculate overall risk score
  const riskScore = Math.min(
    100,
    stopLossUsage * 0.4 +
      (avgRiskRewardRatio > 1 ? 30 : avgRiskRewardRatio * 30) +
      (maxConsecutiveLosses < 5 ? 30 : Math.max(0, 30 - (maxConsecutiveLosses - 5) * 5)),
  )

  return {
    stopLossUsage,
    avgRiskPerTrade,
    riskRewardRatio: avgRiskRewardRatio,
    maxConsecutiveLosses,
    riskScore,
  }
}

function analyzeRecentTrends(trades: Trade[]) {
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Last 10 trades
  const last10Trades = sortedTrades.slice(-10)
  const last10WinRate =
    last10Trades.length > 0 ? (last10Trades.filter((t) => t.outcome === "win").length / last10Trades.length) * 100 : 0
  const last10Pnl = last10Trades.reduce((sum, t) => sum + t.pnl, 0)

  // Determine trend
  let trend: "improving" | "declining" | "stable" = "stable"
  if (last10Trades.length >= 5) {
    const firstHalf = last10Trades.slice(0, Math.floor(last10Trades.length / 2))
    const secondHalf = last10Trades.slice(Math.floor(last10Trades.length / 2))

    const firstHalfPnl = firstHalf.reduce((sum, t) => sum + t.pnl, 0) / firstHalf.length
    const secondHalfPnl = secondHalf.reduce((sum, t) => sum + t.pnl, 0) / secondHalf.length

    if (secondHalfPnl > firstHalfPnl * 1.2) trend = "improving"
    else if (secondHalfPnl < firstHalfPnl * 0.8) trend = "declining"
  }

  // Last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const last30DaysTrades = sortedTrades.filter((t) => new Date(t.date) >= thirtyDaysAgo)
  const last30DaysWinRate =
    last30DaysTrades.length > 0
      ? (last30DaysTrades.filter((t) => t.outcome === "win").length / last30DaysTrades.length) * 100
      : 0
  const last30DaysPnl = last30DaysTrades.reduce((sum, t) => sum + t.pnl, 0)
  const tradeFrequency = last30DaysTrades.length / 30

  return {
    last10Trades: {
      winRate: last10WinRate,
      totalPnl: last10Pnl,
      trend,
    },
    last30Days: {
      winRate: last30DaysWinRate,
      totalPnl: last30DaysPnl,
      tradeFrequency,
    },
  }
}

function identifyStrengthsAndWeaknesses(context: Partial<TradingContext>) {
  const strengths: string[] = []
  const weaknesses: string[] = []
  const recommendations: string[] = []

  const { performance, patterns, riskMetrics, recentTrends } = context

  // Analyze performance
  if (performance) {
    if (performance.winRate >= 60) {
      strengths.push(`Excellent win rate of ${performance.winRate.toFixed(1)}%`)
    } else if (performance.winRate < 45) {
      weaknesses.push(`Low win rate of ${performance.winRate.toFixed(1)}%`)
      recommendations.push("Focus on improving trade selection and entry timing")
    }

    if (performance.profitFactor >= 1.5) {
      strengths.push(`Strong profit factor of ${performance.profitFactor.toFixed(2)}`)
    } else if (performance.profitFactor < 1.2) {
      weaknesses.push(`Low profit factor of ${performance.profitFactor.toFixed(2)}`)
      recommendations.push("Work on letting winners run longer and cutting losses shorter")
    }

    if (performance.totalPnl > 0) {
      strengths.push("Overall profitable trading")
    } else {
      weaknesses.push("Currently in drawdown")
      recommendations.push("Review and refine your trading strategy")
    }
  }

  // Analyze risk metrics
  if (riskMetrics) {
    if (riskMetrics.stopLossUsage >= 80) {
      strengths.push("Consistent use of stop losses")
    } else if (riskMetrics.stopLossUsage < 60) {
      weaknesses.push("Inconsistent stop loss usage")
      recommendations.push("Always set stop losses before entering trades")
    }

    if (riskMetrics.riskRewardRatio >= 2) {
      strengths.push("Excellent risk-reward ratios")
    } else if (riskMetrics.riskRewardRatio < 1) {
      weaknesses.push("Poor risk-reward ratios")
      recommendations.push("Target higher reward relative to risk on each trade")
    }

    if (riskMetrics.maxConsecutiveLosses > 7) {
      weaknesses.push("Long losing streaks")
      recommendations.push("Consider reducing position size during losing streaks")
    }
  }

  // Analyze recent trends
  if (recentTrends) {
    if (recentTrends.last10Trades.trend === "improving") {
      strengths.push("Recent performance is improving")
    } else if (recentTrends.last10Trades.trend === "declining") {
      weaknesses.push("Recent performance is declining")
      recommendations.push("Take a break and review recent trades for patterns")
    }

    if (recentTrends.last30Days.tradeFrequency > 5) {
      weaknesses.push("Very high trading frequency")
      recommendations.push("Consider reducing trade frequency and focusing on quality setups")
    } else if (recentTrends.last30Days.tradeFrequency < 0.5) {
      recommendations.push("Consider increasing trading activity if opportunities are available")
    }
  }

  // Analyze patterns
  if (patterns?.bestSetups && patterns.bestSetups.length > 0) {
    const bestSetup = patterns.bestSetups[0]
    strengths.push(`Strong performance with ${bestSetup.name} setup`)
    recommendations.push(
      `Focus more on your ${bestSetup.name} setup which has ${bestSetup.winRate.toFixed(1)}% win rate`,
    )
  }

  if (patterns?.worstSetups && patterns.worstSetups.length > 0) {
    const worstSetup = patterns.worstSetups[0]
    if (worstSetup.avgPnl < 0) {
      weaknesses.push(`Poor performance with ${worstSetup.name} setup`)
      recommendations.push(`Avoid or refine your ${worstSetup.name} setup`)
    }
  }

  return { strengths, weaknesses, recommendations }
}
