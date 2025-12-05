import type { CandlestickData } from "@/types"

// Helper to generate a somewhat realistic price walk
function generatePriceWalk(
  startDate: Date,
  numPoints: number,
  initialPrice: number,
  volatility: number,
  timeframeMinutes: number,
): CandlestickData[] {
  const data: CandlestickData[] = []
  let currentDate = new Date(startDate)
  let lastClose = initialPrice

  for (let i = 0; i < numPoints; i++) {
    const open = lastClose
    const change = (Math.random() - 0.5) * 2 * volatility * open // Percentage change
    let close = open + change
    if (close <= 0) close = open * 0.1 // Prevent negative or zero prices

    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5)
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5)

    data.push({
      time: Math.floor(currentDate.getTime() / 1000), // UNIX timestamp in seconds
      open,
      high,
      low,
      close,
    })

    lastClose = close
    currentDate = new Date(currentDate.getTime() + timeframeMinutes * 60 * 1000)
  }
  return data
}

const oneYearAgo = new Date()
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

const mockDataStore: Record<string, Record<string, CandlestickData[]>> = {
  EURUSD: {
    "1H": generatePriceWalk(oneYearAgo, 24 * 365, 1.1, 0.001, 60), // 1 year of 1H data
    "4H": generatePriceWalk(oneYearAgo, 6 * 365, 1.1, 0.002, 240), // 1 year of 4H data
    "1D": generatePriceWalk(oneYearAgo, 365, 1.1, 0.005, 1440), // 1 year of 1D data
  },
  BTCUSD: {
    "1H": generatePriceWalk(oneYearAgo, 24 * 365, 30000, 0.01, 60),
    "4H": generatePriceWalk(oneYearAgo, 6 * 365, 30000, 0.02, 240),
    "1D": generatePriceWalk(oneYearAgo, 365, 30000, 0.05, 1440),
  },
  AAPL: {
    "1H": generatePriceWalk(oneYearAgo, 24 * 252, 170, 0.005, 60), // Approx 252 trading days
    "4H": generatePriceWalk(oneYearAgo, 6 * 252, 170, 0.01, 240),
    "1D": generatePriceWalk(oneYearAgo, 252, 170, 0.02, 1440),
  },
}

export function getMockHistoricalData(
  instrument: string,
  timeframe: string, // "1H", "4H", "1D"
  startDate: Date,
  endDate: Date,
): CandlestickData[] {
  const instrumentData = mockDataStore[instrument]
  if (!instrumentData) {
    console.warn(`No mock data for instrument: ${instrument}`)
    return []
  }
  const timeframeData = instrumentData[timeframe]
  if (!timeframeData) {
    console.warn(`No mock data for instrument: ${instrument}, timeframe: ${timeframe}`)
    return []
  }

  const startTime = Math.floor(startDate.getTime() / 1000)
  const endTime = Math.floor(endDate.getTime() / 1000)

  return timeframeData.filter((candle) => candle.time >= startTime && candle.time <= endTime)
}
