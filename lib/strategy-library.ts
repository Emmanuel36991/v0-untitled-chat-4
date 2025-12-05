import type { CandlestickData } from "@/types"

// --- Technical Indicators ---
export function calculateSMA(data: number[], period: number): (number | null)[] {
  if (period <= 0 || data.length < period) {
    return Array(data.length).fill(null)
  }
  const sma: (number | null)[] = Array(period - 1).fill(null)
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0)
    sma.push(sum / period)
  }
  return sma
}

export function calculateEMA(data: number[], period: number): (number | null)[] {
  if (period <= 0 || data.length < period) {
    return Array(data.length).fill(null)
  }
  const ema: (number | null)[] = Array(period - 1).fill(null)
  const multiplier = 2 / (period + 1)
  let currentEMA: number | null = null

  // Calculate initial SMA for the first EMA value
  const initialSlice = data.slice(0, period)
  const initialSum = initialSlice.reduce((acc, val) => acc + val, 0)
  currentEMA = initialSum / period
  ema.push(currentEMA)

  for (let i = period; i < data.length; i++) {
    if (currentEMA === null) {
      // Should not happen if data.length >= period
      ema.push(null)
      continue
    }
    currentEMA = (data[i] - currentEMA) * multiplier + currentEMA
    ema.push(currentEMA)
  }
  return ema
}

export function calculateStdDev(data: number[], period: number): (number | null)[] {
  if (period <= 0 || data.length < period) {
    return Array(data.length).fill(null)
  }
  const stdDevs: (number | null)[] = Array(period - 1).fill(null)
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const mean = slice.reduce((acc, val) => acc + val, 0) / period
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period
    stdDevs.push(Math.sqrt(variance))
  }
  return stdDevs
}

export function calculateRSI(data: number[], period: number): (number | null)[] {
  if (period <= 0 || data.length < period + 1) {
    // RSI needs at least period + 1 data points to calculate the first value
    return Array(data.length).fill(null)
  }

  const rsi: (number | null)[] = Array(period).fill(null) // RSI is undefined for the first 'period' data points
  const changes: number[] = []
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1])
  }

  if (changes.length < period) {
    return Array(data.length).fill(null)
  }

  let avgGain = 0
  let avgLoss = 0

  // Calculate initial average gain and loss
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i]
    } else {
      avgLoss += Math.abs(changes[i])
    }
  }
  avgGain /= period
  avgLoss /= period

  if (avgLoss === 0) {
    rsi.push(100)
  } else {
    const rs = avgGain / avgLoss
    rsi.push(100 - 100 / (1 + rs))
  }

  // Calculate subsequent RSI values
  for (let i = period; i < changes.length; i++) {
    const currentChange = changes[i]
    let currentGain = 0
    let currentLoss = 0

    if (currentChange > 0) {
      currentGain = currentChange
    } else {
      currentLoss = Math.abs(currentChange)
    }

    avgGain = (avgGain * (period - 1) + currentGain) / period
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period

    if (avgLoss === 0) {
      rsi.push(100)
    } else {
      const rs = avgGain / avgLoss
      rsi.push(100 - 100 / (1 + rs))
    }
  }
  return rsi
}

// --- Strategy Signal Types ---
export interface StrategySignal {
  type: "buy" | "sell" | "hold"
  price?: number // Price at which signal occurred (e.g., close of the signal candle)
}

// --- SMA Crossover Strategy Logic ---
export function smaCrossoverStrategy(
  candles: CandlestickData[],
  shortPeriod: number,
  longPeriod: number,
): StrategySignal[] {
  const closePrices = candles.map((c) => c.close)
  const shortSMA = calculateSMA(closePrices, shortPeriod)
  const longSMA = calculateSMA(closePrices, longPeriod)
  const signals: StrategySignal[] = []

  for (let i = 1; i < candles.length; i++) {
    const currentShort = shortSMA[i]
    const currentLong = longSMA[i]
    const prevShort = shortSMA[i - 1]
    const prevLong = longSMA[i - 1]

    if (currentShort === null || currentLong === null || prevShort === null || prevLong === null) {
      signals.push({ type: "hold" })
      continue
    }

    if (prevShort <= prevLong && currentShort > currentLong) {
      signals.push({ type: "buy", price: candles[i].close })
    } else if (prevShort >= prevLong && currentShort < currentLong) {
      signals.push({ type: "sell", price: candles[i].close })
    } else {
      signals.push({ type: "hold" })
    }
  }
  return signals
}

// --- RSI Threshold Strategy Logic ---
export function rsiThresholdStrategy(
  candles: CandlestickData[],
  rsiPeriod: number,
  oversoldLevel: number,
  overboughtLevel: number,
): StrategySignal[] {
  const closePrices = candles.map((c) => c.close)
  const rsiValues = calculateRSI(closePrices, rsiPeriod)
  const signals: StrategySignal[] = []

  for (let i = 1; i < candles.length; i++) {
    // Ensure rsiValues[i] and rsiValues[i-1] are valid for comparison
    // rsiValues array might be shorter if not enough data for initial RSI calculations
    if (i < rsiValues.length && i - 1 < rsiValues.length) {
      const currentRSI = rsiValues[i]
      const prevRSI = rsiValues[i - 1]

      if (currentRSI === null || prevRSI === null) {
        signals.push({ type: "hold" })
        continue
      }

      if (prevRSI <= oversoldLevel && currentRSI > oversoldLevel) {
        signals.push({ type: "buy", price: candles[i].close })
      } else if (prevRSI >= overboughtLevel && currentRSI < overboughtLevel) {
        signals.push({ type: "sell", price: candles[i].close })
      } else {
        signals.push({ type: "hold" })
      }
    } else {
      signals.push({ type: "hold" }) // Not enough RSI data yet for this candle
    }
  }
  // Pad signals array to match candles length if necessary
  while (signals.length < candles.length) {
    signals.unshift({ type: "hold" }) // Add "hold" for initial candles where RSI wasn't calculable
  }
  return signals.slice(0, candles.length) // Ensure signals array is not longer than candles
}

// --- Bollinger Band Breakout/Reversal Strategy Logic ---
export function bollingerBandBreakoutStrategy(
  candles: CandlestickData[],
  period: number,
  stdDevMultiplier: number,
): StrategySignal[] {
  const closePrices = candles.map((c) => c.close)
  const sma = calculateSMA(closePrices, period)
  const stdDev = calculateStdDev(closePrices, period)
  const signals: StrategySignal[] = []

  for (let i = 0; i < candles.length; i++) {
    if (sma[i] === null || stdDev[i] === null) {
      signals.push({ type: "hold" })
      continue
    }

    const upperBand = sma[i]! + stdDev[i]! * stdDevMultiplier
    const lowerBand = sma[i]! - stdDev[i]! * stdDevMultiplier
    const currentClose = candles[i].close

    // For crossover detection, we need previous candle's close relative to bands
    const prevClose = i > 0 ? candles[i - 1].close : null
    const prevUpperBand =
      i > 0 && sma[i - 1] !== null && stdDev[i - 1] !== null ? sma[i - 1]! + stdDev[i - 1]! * stdDevMultiplier : null
    const prevLowerBand =
      i > 0 && sma[i - 1] !== null && stdDev[i - 1] !== null ? sma[i - 1]! - stdDev[i - 1]! * stdDevMultiplier : null

    if (prevClose !== null && prevUpperBand !== null && prevClose <= prevUpperBand && currentClose > upperBand) {
      signals.push({ type: "buy", price: currentClose }) // Breakout above upper band
    } else if (prevClose !== null && prevLowerBand !== null && prevClose >= prevLowerBand && currentClose < lowerBand) {
      signals.push({ type: "sell", price: currentClose }) // Breakout below lower band
    } else {
      signals.push({ type: "hold" })
    }
  }
  return signals
}

// --- MACD Crossover Strategy Logic ---
export function macdCrossoverStrategy(
  candles: CandlestickData[],
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number,
): StrategySignal[] {
  const closePrices = candles.map((c) => c.close)
  const fastEMA = calculateEMA(closePrices, fastPeriod)
  const slowEMA = calculateEMA(closePrices, slowPeriod)
  const signals: StrategySignal[] = []

  const macdLine: (number | null)[] = []
  for (let i = 0; i < candles.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      macdLine.push(fastEMA[i]! - slowEMA[i]!)
    } else {
      macdLine.push(null)
    }
  }

  // Filter out nulls before calculating signal line, then re-align
  const validMacdValues = macdLine.filter((val) => val !== null) as number[]
  let signalLine: (number | null)[] = []
  if (validMacdValues.length >= signalPeriod) {
    signalLine = calculateEMA(validMacdValues, signalPeriod)
  }

  // Align signalLine with macdLine (and original candles array)
  const alignedSignalLine: (number | null)[] = Array(candles.length).fill(null)
  let signalIdx = 0
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== null) {
      if (signalIdx < signalLine.length) {
        // Check if enough data was present for signal line calculation at this point
        const macdPointsForSignal = macdLine.slice(0, i + 1).filter((m) => m !== null).length
        if (macdPointsForSignal >= signalPeriod) {
          alignedSignalLine[i] = signalLine[signalIdx]
          signalIdx++
        }
      }
    }
  }

  for (let i = 1; i < candles.length; i++) {
    const currentMACD = macdLine[i]
    const prevMACD = macdLine[i - 1]
    const currentSignal = alignedSignalLine[i]
    const prevSignal = alignedSignalLine[i - 1]

    if (currentMACD === null || prevMACD === null || currentSignal === null || prevSignal === null) {
      signals.push({ type: "hold" })
      continue
    }

    if (prevMACD <= prevSignal && currentMACD > currentSignal) {
      signals.push({ type: "buy", price: candles[i].close }) // MACD crosses above signal
    } else if (prevMACD >= prevSignal && currentMACD < currentSignal) {
      signals.push({ type: "sell", price: candles[i].close }) // MACD crosses below signal
    } else {
      signals.push({ type: "hold" })
    }
  }
  // Pad signals array to match candles length if necessary
  while (signals.length < candles.length) {
    signals.unshift({ type: "hold" })
  }
  return signals.slice(0, candles.length)
}
