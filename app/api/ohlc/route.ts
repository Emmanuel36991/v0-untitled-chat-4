import { NextResponse } from "next/server"

// --- Helper: Map UI intervals to API intervals ---
function mapInterval(interval: string, provider: "yahoo" | "finnhub"): string {
  if (provider === "finnhub") {
    // Finnhub supports: 1, 5, 15, 30, 60, D, W, M
    const map: Record<string, string> = {
      "1m": "1", "5m": "5", "15m": "15", "30m": "30",
      "1h": "60", "4h": "60", "1d": "D", "1w": "W"
    }
    return map[interval.toLowerCase()] || "D"
  } else {
    // Yahoo
    const map: Record<string, string> = {
      "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
      "1h": "1h", "4h": "1h", "1d": "1d", "1w": "1wk"
    }
    return map[interval.toLowerCase()] || "1d"
  }
}

// --- Helper: Calculate Start Period for Historical Data ---
function getStartTime(interval: string): number {
  const now = Math.floor(Date.now() / 1000)
  const daysInSeconds = 24 * 60 * 60

  const map: Record<string, number> = {
    "1m": 4 * daysInSeconds,       // Last 4 days
    "5m": 30 * daysInSeconds,      // Last 30 days
    "15m": 30 * daysInSeconds,
    "30m": 55 * daysInSeconds,
    "1h": 365 * daysInSeconds,     // Last 1 year
    "1d": 2 * 365 * daysInSeconds, // Last 2 years
    "1w": 5 * 365 * daysInSeconds  // Last 5 years
  }
  return now - (map[interval] || map["1d"])
}

// --- Helper: Map Symbols to Provider Formats ---
function getSymbolForProvider(symbol: string, provider: "yahoo" | "finnhub"): string {
  const s = symbol.toUpperCase()

  // Futures Mapping
  if (["NQ", "MNQ", "ES", "MES", "YM", "MYM", "RTY", "M2K", "GC", "MGC", "SI", "SILVER", "CL", "MCL", "NG", "ZB", "ZN"].includes(s)) {
    // Yahoo supports delayed futures well (e.g. NQ=F)
    if (provider === "yahoo") {
      const map: Record<string, string> = {
        "MNQ": "MNQ=F", "MES": "MES=F", "MYM": "MYM=F", "M2K": "M2K=F",
        "NQ": "NQ=F", "ES": "ES=F", "YM": "YM=F", "RTY": "RTY=F",
        "GC": "GC=F", "MGC": "MGC=F", "SI": "SI=F", "SILVER": "SI=F",
        "CL": "CL=F", "MCL": "MCL=F", "NG": "NG=F"
      }
      return map[s] || `${s}=F`
    }
    // Finnhub free tier often lacks futures or requires specific exchange (e.g. CME_MINI:MNQ)
    // We'll stick to Yahoo for futures to be safe
    return ""
  }

  // Forex Mapping
  if (s.length === 6 && !s.includes("BTC") && !s.includes("ETH")) {
    if (provider === "finnhub") {
      // Finnhub format: OANDA:EUR_USD
      return `OANDA:${s.substring(0, 3)}_${s.substring(3)}`
    } else {
      // Yahoo format: EURUSD=X
      return `${s}=X`
    }
  }

  // Crypto Mapping
  if (["BTC", "ETH", "BTCUSD", "ETHUSD", "ADAUSD", "SOLUSD"].includes(s)) {
    const coin = s.replace("USD", "")
    if (provider === "finnhub") {
      return `BINANCE:${coin}USDT`
    } else {
      return `${coin}-USD`
    }
  }

  // Stocks / ETFs / Options
  return s // AAPL, MSFT, SPY, QQQ work as-is
}

// --- Fetch from Finnhub ---
async function fetchFromFinnhub(symbol: string, interval: string): Promise<any[]> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return []

  const hubSymbol = getSymbolForProvider(symbol, "finnhub")
  if (!hubSymbol) return [] // Unsupported on Finnhub (likely futures)

  const hubInterval = mapInterval(interval, "finnhub")
  const from = getStartTime(interval)
  const to = Math.floor(Date.now() / 1000)

  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${hubSymbol}&resolution=${hubInterval}&from=${from}&to=${to}&token=${apiKey}`

  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()

    if (data.s === "ok" && data.t && data.t.length > 0) {
      return data.t.map((timestamp: number, i: number) => ({
        time: timestamp * 1000,
        date: new Date(timestamp * 1000).toISOString(),
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i] || 0
      }))
    }
  } catch (e) {
    console.error("Finnhub fetch error:", e)
  }
  return []
}

// --- Fetch from Yahoo Finance (Fallback) ---
async function fetchFromYahooFinance(symbol: string, interval: string): Promise<any[]> {
  const yahooSymbol = getSymbolForProvider(symbol, "yahoo")
  if (!yahooSymbol) return []

  const yahooInterval = mapInterval(interval, "yahoo")
  const period1 = getStartTime(yahooInterval)
  const period2 = Math.floor(Date.now() / 1000)

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${period1}&period2=${period2}&interval=${yahooInterval}&includePrePost=true`

  try {
    const response = await fetch(url)
    if (!response.ok) return []

    const data = await response.json()
    const result = data.chart?.result?.[0]

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) return []

    const timestamps = result.timestamp
    const quote = result.indicators.quote[0]

    return timestamps.map((time: number, i: number) => ({
      time: time * 1000,
      date: new Date(time * 1000).toISOString(),
      open: quote.open[i] || 0,
      high: quote.high[i] || 0,
      low: quote.low[i] || 0,
      close: quote.close[i] || 0,
      volume: quote.volume[i] || 0,
    })).filter((d: any) => d.open !== null && d.open !== 0)
  } catch (error) {
    console.error("Yahoo fetch error:", error)
    return []
  }
}

// --- Helper: Generate Realistic Mock Data (Last Resort) ---
function generateMockData(symbol: string, interval: string): any[] {
  const now = Date.now()
  const data = []

  let price = 100
  if (symbol.includes("NQ") || symbol.includes("MNQ")) price = 18200
  else if (symbol.includes("ES") || symbol.includes("MES")) price = 5250
  else if (symbol.includes("BTC")) price = 64000
  else if (symbol.includes("ETH")) price = 3400
  else if (symbol.includes("EUR")) price = 1.08

  let count = 200
  let intervalMs = 24 * 60 * 60 * 1000

  if (interval === '1m') { intervalMs = 60 * 1000; count = 1000; }
  else if (interval === '5m') { intervalMs = 5 * 60 * 1000; count = 500; }
  else if (interval === '15m') { intervalMs = 15 * 60 * 1000; count = 200; }
  else if (interval === '1h') { intervalMs = 60 * 60 * 1000; count = 200; }

  for (let i = count; i >= 0; i--) {
    const time = now - (i * intervalMs)
    const volMult = interval.includes('m') ? 0.0002 : 0.002
    const volatility = price * volMult
    const change = (Math.random() - 0.5) * volatility * 3
    let open = price
    let close = price + change
    let high = Math.max(open, close) + Math.random() * volatility
    let low = Math.min(open, close) - Math.random() * volatility

    // Fix precision
    const decimals = price > 1000 ? 2 : price > 1 ? 2 : 5

    data.push({
      time,
      date: new Date(time).toISOString(),
      open: Number(open.toFixed(decimals)),
      high: Number(high.toFixed(decimals)),
      low: Number(low.toFixed(decimals)),
      close: Number(close.toFixed(decimals)),
      volume: Math.floor(Math.random() * 1000 + 100)
    })

    price = close
  }
  return data
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol") || "SPY"
  const interval = searchParams.get("interval") || "1d"

  // 1. Try Finnhub (if key enabled and symbol supported)
  // Stocks, Crypto, Forex prefer Finnhub for reliability
  let data = await fetchFromFinnhub(symbol, interval)

  // 2. Fallback to Yahoo Finance
  // Futures default to Yahoo (since Finnhub free tier lacks them)
  if (!data || data.length === 0) {
    data = await fetchFromYahooFinance(symbol, interval)
  }

  // 3. Fallback to Mock Data
  if (!data || data.length === 0) {
    console.warn(`[OHLC] No data found for ${symbol}, using mock data.`)
    data = generateMockData(symbol, interval)
  }

  return NextResponse.json(data)
}
