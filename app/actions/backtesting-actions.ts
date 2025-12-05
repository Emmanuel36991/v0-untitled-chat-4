"use server"

import {
  type BacktestParams,
  type BacktestResults,
  type BacktestTrade,
  type EquityDataPoint,
  type DrawdownPoint,
  type PnlDistributionPoint,
  AVAILABLE_BACKTEST_STRATEGIES,
} from "@/types"
import { getMockHistoricalData } from "@/lib/mock-historical-data"
import {
  smaCrossoverStrategy,
  rsiThresholdStrategy,
  bollingerBandBreakoutStrategy,
  macdCrossoverStrategy,
} from "@/lib/strategy-library"
import { std } from "mathjs" // For Sharpe Ratio

const FIXED_TRADE_SIZE_USD = 10000 // Fixed USD size per trade for simplicity
const COMMISSION_PER_TRADE_USD = 1 // Example commission
const SLIPPAGE_PERCENT = 0.0005 // 0.05% slippage per trade side

function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  return std(values) as number
}

export async function runBacktest(
  params: BacktestParams,
): Promise<{ results: BacktestResults | null; error?: string }> {
  try {
    const {
      instrument,
      strategyId,
      timeframe,
      startDate,
      endDate,
      initialCapital,
      strategyParams = {},
      riskFreeRate = 0.02, // Default 2% annualized
      stopLossPercent,
      takeProfitPercent,
    } = params

    const historicalData = getMockHistoricalData(instrument, timeframe, new Date(startDate), new Date(endDate))

    if (historicalData.length === 0) {
      return { results: null, error: "No historical data found for the selected criteria." }
    }

    const strategyDefinition = AVAILABLE_BACKTEST_STRATEGIES.find((s) => s.id === strategyId)
    if (!strategyDefinition) {
      return { results: null, error: "Invalid strategy selected." }
    }

    const logs: string[] = [`Starting backtest for ${instrument} with strategy ${strategyDefinition.name}`]
    logs.push(`Date range: ${startDate} to ${endDate}, Timeframe: ${timeframe}`)
    logs.push(`Initial capital: $${initialCapital.toFixed(2)}`)
    logs.push(`Strategy params: ${JSON.stringify(strategyParams)}`)
    if (stopLossPercent) logs.push(`Stop Loss: ${stopLossPercent}%`)
    if (takeProfitPercent) logs.push(`Take Profit: ${takeProfitPercent}%`)
    logs.push(`Fetched ${historicalData.length} data points.`)

    let signals
    const closePrices = historicalData.map((c) => c.close) // Used for some indicator checks

    if (strategyId === "sma_crossover") {
      const shortPeriod = strategyParams.shortMAPeriod || 10
      const longPeriod = strategyParams.longMAPeriod || 20
      if (historicalData.length < longPeriod) {
        return {
          results: null,
          error: `Not enough data for MA periods. Need at least ${longPeriod} candles, got ${historicalData.length}.`,
        }
      }
      signals = smaCrossoverStrategy(historicalData, shortPeriod, longPeriod)
    } else if (strategyId === "rsi_threshold") {
      const rsiPeriod = strategyParams.rsiPeriod || 14
      const oversold = strategyParams.oversoldLevel || 30
      const overbought = strategyParams.overboughtLevel || 70
      if (historicalData.length < rsiPeriod + 1) {
        return {
          results: null,
          error: `Not enough data for RSI period. Need at least ${rsiPeriod + 1} candles, got ${historicalData.length}.`,
        }
      }
      signals = rsiThresholdStrategy(historicalData, rsiPeriod, oversold, overbought)
    } else if (strategyId === "bb_breakout") {
      const bbPeriod = strategyParams.bbPeriod || 20
      const bbStdDev = strategyParams.bbStdDev || 2
      if (historicalData.length < bbPeriod) {
        return {
          results: null,
          error: `Not enough data for Bollinger Bands period. Need at least ${bbPeriod} candles, got ${historicalData.length}.`,
        }
      }
      signals = bollingerBandBreakoutStrategy(historicalData, bbPeriod, bbStdDev)
    } else if (strategyId === "macd_crossover") {
      const fastPeriod = strategyParams.macdFastPeriod || 12
      const slowPeriod = strategyParams.macdSlowPeriod || 26
      const signalPeriod = strategyParams.macdSignalPeriod || 9
      // MACD needs enough data for the slow EMA, then enough MACD values for the signal EMA
      if (historicalData.length < slowPeriod + signalPeriod - 1) {
        // Approximation, EMA needs more for stability
        return {
          results: null,
          error: `Not enough data for MACD periods. Need at least ${slowPeriod + signalPeriod - 1} candles, got ${historicalData.length}.`,
        }
      }
      signals = macdCrossoverStrategy(historicalData, fastPeriod, slowPeriod, signalPeriod)
    } else {
      return { results: null, error: "Strategy not implemented." }
    }

    logs.push(`Generated ${signals.length} signals.`)
    if (signals.length !== historicalData.length) {
      logs.push(
        `Warning: Signals array length (${signals.length}) does not match historical data length (${historicalData.length}). This may cause issues.`,
      )
      // Attempt to align, though this is a bandage. The root cause in strategy logic should be fixed.
      if (signals.length < historicalData.length) {
        const diff = historicalData.length - signals.length
        const padding = Array(diff).fill({ type: "hold" })
        signals = [...padding, ...signals] // Pad beginning if shorter
      } else {
        signals = signals.slice(signals.length - historicalData.length) // Truncate beginning if longer
      }
    }

    const trades: BacktestTrade[] = []
    const equityCurve: EquityDataPoint[] = [{ time: historicalData[0].time, equity: initialCapital }]
    const drawdownCurve: DrawdownPoint[] = [{ time: historicalData[0].time, drawdown: 0 }]

    let currentEquity = initialCapital
    let position: "long" | "short" | null = null
    let entryPrice = 0
    let entryTime = 0
    let currentStopLossPrice: number | null = null
    let currentTakeProfitPrice: number | null = null

    let peakEquity = initialCapital
    let maxDrawdownValue = 0
    let currentDrawdown = 0

    for (let i = 0; i < historicalData.length; i++) {
      const candle = historicalData[i]
      // Ensure signal exists for the current candle
      const signal = signals[i] ? signals[i] : { type: "hold" }

      if (!candle) continue // Should not happen if historicalData is fine

      // Update equity curve point for each candle (if not already updated by a trade)
      if (equityCurve[equityCurve.length - 1].time !== candle.time) {
        equityCurve.push({ time: candle.time, equity: currentEquity })
      }

      // Update drawdown
      if (currentEquity > peakEquity) {
        peakEquity = currentEquity
      }
      currentDrawdown = peakEquity > 0 ? (peakEquity - currentEquity) / peakEquity : 0
      if (currentDrawdown > maxDrawdownValue) {
        maxDrawdownValue = currentDrawdown
      }
      if (drawdownCurve.length === 0 || drawdownCurve[drawdownCurve.length - 1].time !== candle.time) {
        drawdownCurve.push({ time: candle.time, drawdown: currentDrawdown })
      } else {
        drawdownCurve[drawdownCurve.length - 1].drawdown = currentDrawdown
      }

      let tradeClosedThisCandle = false

      // Check SL/TP if in a position
      if (position) {
        let exitPriceReason: { price: number; reason: BacktestTrade["exitReason"] } | null = null

        if (position === "long") {
          if (currentStopLossPrice && candle.low <= currentStopLossPrice) {
            exitPriceReason = { price: currentStopLossPrice, reason: "sl" }
          } else if (currentTakeProfitPrice && candle.high >= currentTakeProfitPrice) {
            exitPriceReason = { price: currentTakeProfitPrice, reason: "tp" }
          }
        } else {
          // short
          if (currentStopLossPrice && candle.high >= currentStopLossPrice) {
            exitPriceReason = { price: currentStopLossPrice, reason: "sl" }
          } else if (currentTakeProfitPrice && candle.low <= currentTakeProfitPrice) {
            exitPriceReason = { price: currentTakeProfitPrice, reason: "tp" }
          }
        }

        if (exitPriceReason) {
          const exitPrice = exitPriceReason.price
          const units = FIXED_TRADE_SIZE_USD / entryPrice
          const pnl =
            (position === "long" ? exitPrice - entryPrice : entryPrice - exitPrice) * units -
            COMMISSION_PER_TRADE_USD * 2
          const pnlPercent = (pnl / FIXED_TRADE_SIZE_USD) * 100
          currentEquity += pnl

          trades.push({
            entryTime,
            exitTime: candle.time,
            entryPrice,
            exitPrice,
            direction: position,
            size: FIXED_TRADE_SIZE_USD,
            pnl,
            pnlPercent,
            exitReason: exitPriceReason.reason,
          })
          logs.push(
            `[${new Date(candle.time * 1000).toISOString()}] Closed ${position.toUpperCase()} @ ${exitPrice.toFixed(4)} by ${exitPriceReason.reason.toUpperCase()}. P&L: ${pnl.toFixed(2)}. Equity: ${currentEquity.toFixed(2)}`,
          )
          position = null
          currentStopLossPrice = null
          currentTakeProfitPrice = null
          tradeClosedThisCandle = true
        }
      }

      // Process strategy signals if no SL/TP hit or not in position
      if (!tradeClosedThisCandle) {
        const isReversalStrategy = strategyId === "bb_breakout" || strategyId === "macd_crossover" // Example, adapt as needed

        if (signal.type === "buy" && signal.price) {
          if (position === "short" && isReversalStrategy) {
            // Close short if it's a reversal strategy
            const exitPrice = signal.price * (1 + SLIPPAGE_PERCENT) // Slippage on exit
            const units = FIXED_TRADE_SIZE_USD / entryPrice
            const pnl = (entryPrice - exitPrice) * units - COMMISSION_PER_TRADE_USD * 2
            const pnlPercent = (pnl / FIXED_TRADE_SIZE_USD) * 100
            currentEquity += pnl
            trades.push({
              entryTime,
              exitTime: candle.time,
              entryPrice,
              exitPrice,
              direction: "short",
              size: FIXED_TRADE_SIZE_USD,
              pnl,
              pnlPercent,
              exitReason: "signal",
            })
            logs.push(
              `[${new Date(candle.time * 1000).toISOString()}] Reversed SHORT to LONG @ ${exitPrice.toFixed(4)}. P&L: ${pnl.toFixed(2)}. Equity: ${currentEquity.toFixed(2)}`,
            )
            position = null // Ready to open long
          }
          if (position === null) {
            // Open new long or reversed long
            position = "long"
            entryPrice = signal.price * (1 + SLIPPAGE_PERCENT)
            entryTime = candle.time
            if (stopLossPercent) currentStopLossPrice = entryPrice * (1 - stopLossPercent / 100)
            if (takeProfitPercent) currentTakeProfitPrice = entryPrice * (1 + takeProfitPercent / 100)
            logs.push(`[${new Date(candle.time * 1000).toISOString()}] Opened LONG @ ${entryPrice.toFixed(4)}`)
            tradeClosedThisCandle = true // To update equity curve
          }
        } else if (signal.type === "sell" && signal.price) {
          if (position === "long" && isReversalStrategy) {
            // Close long if it's a reversal strategy
            const exitPrice = signal.price * (1 - SLIPPAGE_PERCENT) // Slippage on exit
            const units = FIXED_TRADE_SIZE_USD / entryPrice
            const pnl = (exitPrice - entryPrice) * units - COMMISSION_PER_TRADE_USD * 2
            const pnlPercent = (pnl / FIXED_TRADE_SIZE_USD) * 100
            currentEquity += pnl
            trades.push({
              entryTime,
              exitTime: candle.time,
              entryPrice,
              exitPrice,
              direction: "long",
              size: FIXED_TRADE_SIZE_USD,
              pnl,
              pnlPercent,
              exitReason: "signal",
            })
            logs.push(
              `[${new Date(candle.time * 1000).toISOString()}] Reversed LONG to SHORT @ ${exitPrice.toFixed(4)}. P&L: ${pnl.toFixed(2)}. Equity: ${currentEquity.toFixed(2)}`,
            )
            position = null // Ready to open short
          }
          if (position === null) {
            // Open new short or reversed short
            position = "short"
            entryPrice = signal.price * (1 - SLIPPAGE_PERCENT)
            entryTime = candle.time
            if (stopLossPercent) currentStopLossPrice = entryPrice * (1 + stopLossPercent / 100)
            if (takeProfitPercent) currentTakeProfitPrice = entryPrice * (1 - takeProfitPercent / 100)
            logs.push(`[${new Date(candle.time * 1000).toISOString()}] Opened SHORT @ ${entryPrice.toFixed(4)}`)
            tradeClosedThisCandle = true // To update equity curve
          }
        }
      }

      // If it's the last candle and a position is still open, close it
      if (i === historicalData.length - 1 && position) {
        const exitPrice = candle.close // Close at the last candle's close
        const units = FIXED_TRADE_SIZE_USD / entryPrice
        const pnl =
          (position === "long" ? exitPrice - entryPrice : entryPrice - exitPrice) * units - COMMISSION_PER_TRADE_USD * 2
        const pnlPercent = (pnl / FIXED_TRADE_SIZE_USD) * 100
        currentEquity += pnl

        trades.push({
          entryTime,
          exitTime: candle.time,
          entryPrice,
          exitPrice,
          direction: position,
          size: FIXED_TRADE_SIZE_USD,
          pnl,
          pnlPercent,
          exitReason: "end_of_data",
        })
        logs.push(
          `[${new Date(candle.time * 1000).toISOString()}] Force closed ${position.toUpperCase()} @ ${exitPrice.toFixed(4)} (end of data). P&L: ${pnl.toFixed(2)}. Equity: ${currentEquity.toFixed(2)}`,
        )
        position = null
        tradeClosedThisCandle = true
      }

      // Update equity curve if a trade was closed or opened/reversed
      if (tradeClosedThisCandle) {
        if (equityCurve[equityCurve.length - 1].time !== candle.time) {
          equityCurve.push({ time: candle.time, equity: currentEquity })
        } else {
          equityCurve[equityCurve.length - 1].equity = currentEquity
        }
      }
    }

    // Final equity point
    const lastCandleTime = historicalData[historicalData.length - 1].time
    if (equityCurve[equityCurve.length - 1].time !== lastCandleTime) {
      equityCurve.push({ time: lastCandleTime, equity: currentEquity })
    } else {
      equityCurve[equityCurve.length - 1].equity = currentEquity
    }
    if (drawdownCurve.length === 0 || drawdownCurve[drawdownCurve.length - 1].time !== lastCandleTime) {
      drawdownCurve.push({ time: lastCandleTime, drawdown: currentDrawdown })
    } else {
      drawdownCurve[drawdownCurve.length - 1].drawdown = currentDrawdown
    }

    // --- Calculate Performance Metrics ---
    const totalPnlValue = currentEquity - initialCapital
    const totalPnlPercent = (totalPnlValue / initialCapital) * 100
    const winningTradesList = trades.filter((t) => t.pnl > 0)
    const losingTradesList = trades.filter((t) => t.pnl < 0)
    const breakevenTradesCount = trades.filter((t) => t.pnl === 0).length

    const winCount = winningTradesList.length
    const lossCount = losingTradesList.length

    const winRate = trades.length > 0 ? winCount / trades.length : 0
    const lossRate = trades.length > 0 ? lossCount / trades.length : 0
    const breakevenRate = trades.length > 0 ? breakevenTradesCount / trades.length : 0

    const grossProfit = winningTradesList.reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(losingTradesList.reduce((sum, t) => sum + t.pnl, 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Number.POSITIVE_INFINITY : 0

    const averageWinPnl = winCount > 0 ? grossProfit / winCount : 0
    const averageLossPnl = lossCount > 0 ? grossLoss / lossCount : 0 // absolute value
    const riskRewardRatio =
      averageLossPnl > 0 ? averageWinPnl / averageLossPnl : averageWinPnl > 0 ? Number.POSITIVE_INFINITY : 0

    const averageWinPnlPercent =
      winCount > 0 ? winningTradesList.reduce((sum, t) => sum + t.pnlPercent, 0) / winCount : 0
    const averageLossPnlPercent =
      lossCount > 0 ? Math.abs(losingTradesList.reduce((sum, t) => sum + t.pnlPercent, 0)) / lossCount : 0

    const expectancy = trades.length > 0 ? totalPnlValue / trades.length : 0
    // Or: (winRate * averageWinPnl) - (lossRate * averageLossPnl)

    // Sharpe Ratio (simplified: daily returns, assuming 252 trading days if data is daily)
    let sharpeRatio: number | undefined = undefined
    if (equityCurve.length > 1) {
      const dailyReturns: number[] = []
      for (let k = 1; k < equityCurve.length; k++) {
        // Ensure equityCurve[k-1].equity is not zero to avoid division by zero
        if (equityCurve[k - 1].equity !== 0) {
          const dailyReturn = (equityCurve[k].equity - equityCurve[k - 1].equity) / equityCurve[k - 1].equity
          dailyReturns.push(dailyReturn)
        } else {
          dailyReturns.push(0) // If previous equity is zero, assume zero return for this period
        }
      }
      if (dailyReturns.length > 1) {
        const avgDailyReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length
        const stdDevDailyReturn = calculateStandardDeviation(dailyReturns)

        const daysInYear = 252 // Standard trading days
        let periodsInYear = daysInYear // Default for daily data
        if (params.timeframe.endsWith("H")) periodsInYear = daysInYear * (24 / Number.parseInt(params.timeframe))
        else if (params.timeframe.endsWith("m"))
          periodsInYear = daysInYear * 24 * (60 / Number.parseInt(params.timeframe))

        const periodRiskFreeRate = riskFreeRate / periodsInYear
        if (stdDevDailyReturn > 0) {
          sharpeRatio = ((avgDailyReturn - periodRiskFreeRate) / stdDevDailyReturn) * Math.sqrt(periodsInYear)
        } else if (avgDailyReturn > periodRiskFreeRate) {
          sharpeRatio = Number.POSITIVE_INFINITY // Positive return with zero volatility
        } else {
          sharpeRatio = 0 // Or undefined, depending on convention for zero volatility
        }
      }
    }

    // Streaks
    let longestWinningStreak = 0
    let currentWinningStreak = 0
    let longestLosingStreak = 0
    let currentLosingStreak = 0
    trades.forEach((trade) => {
      if (trade.pnl > 0) {
        currentWinningStreak++
        currentLosingStreak = 0
        if (currentWinningStreak > longestWinningStreak) longestWinningStreak = currentWinningStreak
      } else if (trade.pnl < 0) {
        currentLosingStreak++
        currentWinningStreak = 0
        if (currentLosingStreak > longestLosingStreak) longestLosingStreak = currentLosingStreak
      } else {
        currentWinningStreak = 0
        currentLosingStreak = 0
      }
    })

    // Average Trade Duration
    const totalDurationSeconds = trades.reduce((sum, t) => sum + (t.exitTime - t.entryTime), 0)
    const averageTradeDuration = trades.length > 0 ? totalDurationSeconds / trades.length : 0

    const winningTradeDurations = winningTradesList.reduce((sum, t) => sum + (t.exitTime - t.entryTime), 0)
    const averageHoldingPeriodWin = winCount > 0 ? winningTradeDurations / winCount : 0

    const losingTradeDurations = losingTradesList.reduce((sum, t) => sum + (t.exitTime - t.entryTime), 0)
    const averageHoldingPeriodLoss = lossCount > 0 ? losingTradeDurations / lossCount : 0

    // P&L Distribution for histogram
    const pnlValues = trades.map((t) => t.pnl)
    const pnlDistribution: PnlDistributionPoint[] = []
    if (pnlValues.length > 0) {
      const sortedPnl = [...pnlValues].sort((a, b) => a - b)
      const minPnl = sortedPnl[0]
      const maxPnl = sortedPnl[sortedPnl.length - 1]
      const numBins = Math.min(20, Math.max(5, Math.floor(Math.sqrt(trades.length)))) // Dynamic bins, capped

      let binSize = (maxPnl - minPnl) / numBins
      if (binSize === 0 && trades.length > 0) {
        // All PnL values are the same
        binSize = Math.abs(minPnl * 0.1) || 1 // Make a small bin around the value or 1 if PnL is 0
      }
      if (binSize === 0 && trades.length === 0) {
        // No trades
        binSize = 1 // Default bin size
      }

      for (let k = 0; k < numBins; k++) {
        const binStart = minPnl + k * binSize
        const binEnd = binStart + binSize
        const count = pnlValues.filter(
          (pnl) => pnl >= binStart && (k === numBins - 1 ? pnl <= binEnd + 0.00001 : pnl < binEnd), // Include max value in last bin
        ).length
        pnlDistribution.push({ pnl: (binStart + binEnd) / 2, count })
      }
    }

    const startTime = historicalData[0].time
    const endTime = historicalData[historicalData.length - 1].time
    const totalDurationDays = (endTime - startTime) / (60 * 60 * 24)

    logs.push(
      `Backtest finished. Total P&L: ${totalPnlValue.toFixed(2)}, Win Rate: ${(winRate * 100).toFixed(2)}%, Trades: ${trades.length}`,
    )

    return {
      results: {
        totalPnl: totalPnlValue,
        totalPnlPercent,
        winRate,
        lossRate,
        breakevenRate,
        totalTrades: trades.length,
        winningTrades: winCount,
        losingTrades: lossCount,
        breakevenTrades: breakevenTradesCount,
        maxDrawdown: maxDrawdownValue,
        sharpeRatio,
        profitFactor,
        averageWinPnl,
        averageLossPnl,
        averageWinPnlPercent,
        averageLossPnlPercent,
        riskRewardRatio,
        expectancy,
        longestWinningStreak,
        longestLosingStreak,
        averageTradeDuration,
        averageHoldingPeriodWin,
        averageHoldingPeriodLoss,
        trades,
        equityCurve,
        drawdownCurve,
        pnlDistribution,
        logs,
        startTime,
        endTime,
        totalDurationDays,
      },
    }
  } catch (error: any) {
    console.error("Backtesting error:", error)
    return { results: null, error: error.message || "An unexpected error occurred during backtesting." }
  }
}
