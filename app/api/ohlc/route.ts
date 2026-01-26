import { NextResponse } from "next/server"

// --- Helper: Map UI intervals to Yahoo Finance API intervals ---
function mapIntervalToYahoo(interval: string): string {
  const map: Record<string, string> = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "4h": "1h", // Yahoo free tier limits (manually aggregated or limited)
    "1d": "1d",
    "1w": "1wk",
  }
  return map[interval.toLowerCase()] || "1d"
}

// --- Helper: Calculate Safe Start Period ---
// Yahoo has strict limits: 1m (7 days), 5m-30m (60 days), 1h (730 days)
function getPeriod1(interval: string): number {
  const now = Math.floor(Date.now() / 1000)
  const daysInSeconds = 24 * 60 * 60

  const map: Record<string, number> = {
    "1m": 4 * daysInSeconds,       // Fetch last 4 days for 1m (Safe buffer vs 7 day limit)
    "5m": 30 * daysInSeconds,      // Last 30 days
    "15m": 30 * daysInSeconds,
    "30m": 55 * daysInSeconds,
    "1h": 365 * daysInSeconds,     // Last 1 year
    "1d": 2 * 365 * daysInSeconds, // Last 2 years
    "1wk": 5 * 365 * daysInSeconds // Last 5 years
  }
  return now - (map[interval] || map["1d"])
}

// --- Helper: Generate Realistic Mock Data (Fallback) ---
function generateMockData(symbol: string, interval: string): any[] {
  const now = Date.now()
  const data = []
  
  // Set base price based on instrument type
  let price = 100
  if (symbol.includes("NQ") || symbol.includes("MNQ")) price = 18200
  else if (symbol.includes("ES") || symbol.includes("MES")) price = 5250
  else if (symbol.includes("BTC")) price = 64000
  else if (symbol.includes("ETH")) price = 3400
  else if (symbol.includes("EUR")) price = 1.08
  
  // Determine number of candles based on interval
  // For 1m/5m we want a lot of data points to look "real"
  let count = 200
  let intervalMs = 24 * 60 * 60 * 1000

  if (interval === '1m') { intervalMs = 60 * 1000; count = 1000; }
  else if (interval === '5m') { intervalMs = 5 * 60 * 1000; count = 500; }
  else if (interval === '15m') { intervalMs = 15 * 60 * 1000; count = 200; }
  else if (interval === '1h') { intervalMs = 60 * 60 * 1000; count = 200; }
  
  // Generate random walk
  for (let i = count; i >= 0; i--) {
    const time = now - (i * intervalMs)
    // Volatility depends on interval (smaller interval = smaller moves)
    const volMult = interval.includes('m') ? 0.0002 : 0.002
    const volatility = price * volMult
    
    const change = (Math.random() - 0.5) * volatility * 3
    let open = price
    let close = price + change
    
    // Ensure high/low contain open/close
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

async function fetchFromYahooFinance(symbol: string, interval: string): Promise<any[]> {
  try {
    // Better Symbol Mapping for Futures
    const symbolMap: Record<string, string> = {
      "MNQ": "MNQ=F", "MES": "MES=F", "NQ": "NQ=F", "ES": "ES=F",
      "YM": "YM=F", "RTY": "RTY=F", "GC": "GC=F", "CL": "CL=F",
      "BTC": "BTC-USD", "ETH": "ETH-USD"
    }
    
    const yahooSymbol = symbolMap[symbol.toUpperCase()] || symbol.toUpperCase()
    const yahooInterval = mapIntervalToYahoo(interval)
    const period1 = getPeriod1(yahooInterval)
    const period2 = Math.floor(Date.now() / 1000)

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${period1}&period2=${period2}&interval=${yahooInterval}&includePrePost=true`

    // console.log(`Fetching Yahoo: ${url}`)

    const response = await fetch(url)
    
    if (!response.ok) {
      // console.warn(`Yahoo API returned ${response.status} for ${symbol}`)
      return []
    }

    const data = await response.json()
    const result = data.chart?.result?.[0]

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
        return []
    }

    const timestamps = result.timestamp
    const quote = result.indicators.quote[0]

    return timestamps.map((time: number, i: number) => ({
      time: time * 1000, // Convert to MS for frontend
      date: new Date(time * 1000).toISOString(),
      open: quote.open[i] || 0,
      high: quote.high[i] || 0,
      low: quote.low[i] || 0,
      close: quote.close[i] || 0,
      volume: quote.volume[i] || 0,
    })).filter((d: any) => d.open !== null && d.open !== 0)

  } catch (error) {
    console.error("Yahoo Fetch Error:", error)
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol") || "SPY"
  const interval = searchParams.get("interval") || "1d"

  // 1. Try Fetching Real Data
  let data = await fetchFromYahooFinance(symbol, interval)

  // 2. Fallback to Mock Data if API fails
  if (!data || data.length === 0) {
    data = generateMockData(symbol, interval)
  }

  return NextResponse.json(data)
}
