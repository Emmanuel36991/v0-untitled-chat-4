export interface InstrumentConfig {
  symbol: string
  name: string
  category: string
  multiplier: number // P&L multiplier (e.g., 20 for Nasdaq Mini)
  tickSize: number // Minimum price movement
  tickValue: number // Value per tick
  currency: string
  displayDecimals: number
}

export type PnLDisplayFormat = "dollars" | "points" | "pips" | "percentage"

export interface PnLCalculationResult {
  rawPnL: number // Basic price difference * size
  adjustedPnL: number // Instrument-specific calculation
  points: number // Price difference in points
  pips: number // Price difference in pips (for forex)
  percentage: number // P&L as percentage of entry value
}

export const INSTRUMENT_CONFIGS: Record<string, InstrumentConfig> = {
  // Futures - Index
  NQ: {
    symbol: "NQ",
    name: "E-mini NASDAQ-100",
    category: "futures",
    multiplier: 20,
    tickSize: 0.25,
    tickValue: 5,
    currency: "USD",
    displayDecimals: 2,
  },
  MNQ: {
    symbol: "MNQ",
    name: "Micro E-mini NASDAQ-100",
    category: "futures",
    multiplier: 2,
    tickSize: 0.25,
    tickValue: 0.5,
    currency: "USD",
    displayDecimals: 2,
  },
  ES: {
    symbol: "ES",
    name: "E-mini S&P 500",
    category: "futures",
    multiplier: 50,
    tickSize: 0.25,
    tickValue: 12.5,
    currency: "USD",
    displayDecimals: 2,
  },
  MES: {
    symbol: "MES",
    name: "Micro E-mini S&P 500",
    category: "futures",
    multiplier: 5,
    tickSize: 0.25,
    tickValue: 1.25,
    currency: "USD",
    displayDecimals: 2,
  },
  YM: {
    symbol: "YM",
    name: "E-mini Dow Jones",
    category: "futures",
    multiplier: 5,
    tickSize: 1,
    tickValue: 5,
    currency: "USD",
    displayDecimals: 0,
  },
  MYM: {
    symbol: "MYM",
    name: "Micro E-mini Dow Jones",
    category: "futures",
    multiplier: 0.5,
    tickSize: 1,
    tickValue: 0.5,
    currency: "USD",
    displayDecimals: 0,
  },
  RTY: {
    symbol: "RTY",
    name: "E-mini Russell 2000",
    category: "futures",
    multiplier: 50,
    tickSize: 0.1,
    tickValue: 5,
    currency: "USD",
    displayDecimals: 1,
  },
  M2K: {
    symbol: "M2K",
    name: "Micro E-mini Russell 2000",
    category: "futures",
    multiplier: 5,
    tickSize: 0.1,
    tickValue: 0.5,
    currency: "USD",
    displayDecimals: 1,
  },

  // Futures - Energy
  CL: {
    symbol: "CL",
    name: "Crude Oil",
    category: "futures",
    multiplier: 1000,
    tickSize: 0.01,
    tickValue: 10,
    currency: "USD",
    displayDecimals: 2,
  },
  MCL: {
    symbol: "MCL",
    name: "Micro Crude Oil",
    category: "futures",
    multiplier: 100,
    tickSize: 0.01,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 2,
  },
  NG: {
    symbol: "NG",
    name: "Natural Gas",
    category: "futures",
    multiplier: 10000,
    tickSize: 0.001,
    tickValue: 10,
    currency: "USD",
    displayDecimals: 3,
  },

  // Futures - Metals
  GC: {
    symbol: "GC",
    name: "Gold",
    category: "futures",
    multiplier: 100,
    tickSize: 0.1,
    tickValue: 10,
    currency: "USD",
    displayDecimals: 1,
  },
  MGC: {
    symbol: "MGC",
    name: "Micro Gold",
    category: "futures",
    multiplier: 10,
    tickSize: 0.1,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 1,
  },
  SI: {
    symbol: "SI",
    name: "Silver",
    category: "futures",
    multiplier: 5000,
    tickSize: 0.005,
    tickValue: 25,
    currency: "USD",
    displayDecimals: 3,
  },

  // Forex pairs - Major
  EURUSD: {
    symbol: "EURUSD",
    name: "Euro/US Dollar",
    category: "forex",
    multiplier: 100000, // Standard lot
    tickSize: 0.00001,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 5,
  },
  GBPUSD: {
    symbol: "GBPUSD",
    name: "British Pound/US Dollar",
    category: "forex",
    multiplier: 100000,
    tickSize: 0.00001,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 5,
  },
  USDJPY: {
    symbol: "USDJPY",
    name: "US Dollar/Japanese Yen",
    category: "forex",
    multiplier: 100000,
    tickSize: 0.001,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 3,
  },
  USDCHF: {
    symbol: "USDCHF",
    name: "US Dollar/Swiss Franc",
    category: "forex",
    multiplier: 100000,
    tickSize: 0.00001,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 5,
  },
  AUDUSD: {
    symbol: "AUDUSD",
    name: "Australian Dollar/US Dollar",
    category: "forex",
    multiplier: 100000,
    tickSize: 0.00001,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 5,
  },
  USDCAD: {
    symbol: "USDCAD",
    name: "US Dollar/Canadian Dollar",
    category: "forex",
    multiplier: 100000,
    tickSize: 0.00001,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 5,
  },
  NZDUSD: {
    symbol: "NZDUSD",
    name: "New Zealand Dollar/US Dollar",
    category: "forex",
    multiplier: 100000,
    tickSize: 0.00001,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 5,
  },

  // Forex pairs - Cross
  EURJPY: {
    symbol: "EURJPY",
    name: "Euro/Japanese Yen",
    category: "forex",
    multiplier: 100000,
    tickSize: 0.001,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 3,
  },
  GBPJPY: {
    symbol: "GBPJPY",
    name: "British Pound/Japanese Yen",
    category: "forex",
    multiplier: 100000,
    tickSize: 0.001,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 3,
  },
  EURGBP: {
    symbol: "EURGBP",
    name: "Euro/British Pound",
    category: "forex",
    multiplier: 100000,
    tickSize: 0.00001,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 5,
  },

  // Stocks
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "stocks",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    category: "stocks",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    category: "stocks",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },
  AMZN: {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    category: "stocks",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    category: "stocks",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla Inc.",
    category: "stocks",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },
  JPM: {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    category: "stocks",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },
  BAC: {
    symbol: "BAC",
    name: "Bank of America Corp.",
    category: "stocks",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },

  // Crypto
  BTCUSD: {
    symbol: "BTCUSD",
    name: "Bitcoin/US Dollar",
    category: "crypto",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },
  ETHUSD: {
    symbol: "ETHUSD",
    name: "Ethereum/US Dollar",
    category: "crypto",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },
  ADAUSD: {
    symbol: "ADAUSD",
    name: "Cardano/US Dollar",
    category: "crypto",
    multiplier: 1,
    tickSize: 0.0001,
    tickValue: 0.0001,
    currency: "USD",
    displayDecimals: 4,
  },
  SOLUSD: {
    symbol: "SOLUSD",
    name: "Solana/US Dollar",
    category: "crypto",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },

  // Commodities
  GOLD: {
    symbol: "GOLD",
    name: "Gold Spot",
    category: "commodities",
    multiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    currency: "USD",
    displayDecimals: 2,
  },
  SILVER: {
    symbol: "SILVER",
    name: "Silver Spot",
    category: "commodities",
    multiplier: 1,
    tickSize: 0.001,
    tickValue: 0.001,
    currency: "USD",
    displayDecimals: 3,
  },

  // Options
  SPY: {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Options",
    category: "options",
    multiplier: 100,
    tickSize: 0.01,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 2,
  },
  QQQ: {
    symbol: "QQQ",
    name: "Invesco QQQ ETF Options",
    category: "options",
    multiplier: 100,
    tickSize: 0.01,
    tickValue: 1,
    currency: "USD",
    displayDecimals: 2,
  },
}

export interface CustomInstrument {
  symbol: string
  name: string
  category: string
  multiplier: number
  tickSize: number
  currency: string
  displayDecimals: number
}

// P&L calculation functions
export function calculateInstrumentPnL(
  instrument: string,
  direction: "long" | "short",
  entryPrice: number,
  exitPrice: number,
  size: number,
  customConfig?: CustomInstrument,
): PnLCalculationResult {
  const config = customConfig || INSTRUMENT_CONFIGS[instrument.toUpperCase()]

  // Basic price difference
  const priceDifference = direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice

  // Raw P&L (basic calculation)
  const rawPnL = priceDifference * size

  // Instrument-specific adjusted P&L
  let adjustedPnL = rawPnL
  if (config) {
    adjustedPnL = priceDifference * size * config.multiplier
  }

  // Points calculation
  const points = Math.abs(priceDifference)

  // Pips calculation (mainly for forex)
  let pips = 0
  if (config?.category === "forex") {
    const pipSize = instrument.toUpperCase().includes("JPY") ? 0.01 : 0.0001
    pips = Math.abs(priceDifference) / pipSize
  }

  // Percentage calculation
  const percentage = entryPrice > 0 ? (priceDifference / entryPrice) * 100 : 0

  return {
    rawPnL,
    adjustedPnL,
    points,
    pips,
    percentage,
  }
}

export function formatPnLDisplay(
  pnlResult: PnLCalculationResult,
  format: PnLDisplayFormat,
  instrument: string,
  customConfig?: CustomInstrument,
): string {
  const config = customConfig || INSTRUMENT_CONFIGS[instrument.toUpperCase()]

  switch (format) {
    case "dollars":
      return `$${pnlResult.adjustedPnL.toFixed(2)}`

    case "points":
      const decimals = config?.displayDecimals ?? 2
      return `${pnlResult.points.toFixed(decimals)} pts`

    case "pips":
      if (config?.category === "forex") {
        return `${pnlResult.pips.toFixed(1)} pips`
      }
      return `${pnlResult.points.toFixed(2)} pts`

    case "percentage":
      return `${pnlResult.percentage.toFixed(2)}%`

    default:
      return `$${pnlResult.adjustedPnL.toFixed(2)}`
  }
}

export function getAllAvailableInstruments(customInstruments: CustomInstrument[] = []): Array<{
  symbol: string
  name: string
  category: string
  isCustom?: boolean
}> {
  const standardInstruments = Object.values(INSTRUMENT_CONFIGS).map((config) => ({
    symbol: config.symbol,
    name: config.name,
    category: config.category,
    isCustom: false,
  }))

  const customInstrumentsList = customInstruments.map((config) => ({
    symbol: config.symbol,
    name: config.name,
    category: config.category,
    isCustom: true,
  }))

  return [...standardInstruments, ...customInstrumentsList]
}
