"use client"

import { memo, useEffect, useRef, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import type { Trade } from "@/types"

interface TradingChartProps {
  instrument?: string
  trades?: Trade[]
  tradeDate?: string
  timeframe?: string // Added timeframe prop
  className?: string
}

interface OHLCData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface TradeData {
  price: number
  side: "buy" | "sell"
  id?: string
  quantity?: number
  time?: string
}

interface ChartDataPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface InstrumentConfig {
  name: string
  category: string
  currency: string
  tickSize: number
}

const INSTRUMENT_CONFIGS: Record<string, InstrumentConfig> = {
  // Futures
  NQ: {
    name: "NASDAQ-100 E-mini",
    category: "Futures",
    currency: "USD",
    tickSize: 0.25,
  },
  ES: {
    name: "S&P 500 E-mini",
    category: "Futures",
    currency: "USD",
    tickSize: 0.25,
  },
  YM: {
    name: "Dow Jones E-mini",
    category: "Futures",
    currency: "USD",
    tickSize: 1.0,
  },
  RTY: {
    name: "Russell 2000 E-mini",
    category: "Futures",
    currency: "USD",
    tickSize: 0.1,
  },

  // Stocks
  AAPL: {
    name: "Apple Inc.",
    category: "Stocks",
    currency: "USD",
    tickSize: 0.01,
  },
  TSLA: {
    name: "Tesla Inc.",
    category: "Stocks",
    currency: "USD",
    tickSize: 0.01,
  },
  MSFT: {
    name: "Microsoft Corp.",
    category: "Stocks",
    currency: "USD",
    tickSize: 0.01,
  },
  GOOGL: {
    name: "Alphabet Inc.",
    category: "Stocks",
    currency: "USD",
    tickSize: 0.01,
  },
  NVDA: {
    name: "NVIDIA Corp.",
    category: "Stocks",
    currency: "USD",
    tickSize: 0.01,
  },
  META: {
    name: "Meta Platforms",
    category: "Stocks",
    currency: "USD",
    tickSize: 0.01,
  },

  // Forex
  EURUSD: {
    name: "Euro vs US Dollar",
    category: "Forex",
    currency: "USD",
    tickSize: 0.00001,
  },
  GBPUSD: {
    name: "British Pound vs US Dollar",
    category: "Forex",
    currency: "USD",
    tickSize: 0.00001,
  },
  USDJPY: {
    name: "US Dollar vs Japanese Yen",
    category: "Forex",
    currency: "JPY",
    tickSize: 0.001,
  },
  AUDUSD: {
    name: "Australian Dollar vs US Dollar",
    category: "Forex",
    currency: "USD",
    tickSize: 0.00001,
  },

  // Crypto
  BTCUSD: {
    name: "Bitcoin",
    category: "Crypto",
    currency: "USD",
    tickSize: 0.01,
  },
  ETHUSD: {
    name: "Ethereum",
    category: "Crypto",
    currency: "USD",
    tickSize: 0.01,
  },

  // Commodities
  GC: {
    name: "Gold",
    category: "Commodities",
    currency: "USD",
    tickSize: 0.1,
  },
  SI: {
    name: "Silver",
    category: "Commodities",
    currency: "USD",
    tickSize: 0.005,
  },
  CL: {
    name: "Crude Oil",
    category: "Commodities",
    currency: "USD",
    tickSize: 0.01,
  },
  NG: {
    name: "Natural Gas",
    category: "Commodities",
    currency: "USD",
    tickSize: 0.001,
  },
}

function TradingChart({
  instrument: propInstrument,
  trades: propTrades,
  tradeDate,
  timeframe = "1D",
  className,
}: TradingChartProps) {
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candleSeriesRef = useRef<any>(null)
  const priceLineRefs = useRef<any[]>([])
  const markerRefs = useRef<any[]>([])

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ohlcData, setOhlcData] = useState<ChartDataPoint[]>([])
  const [tradeData, setTradeData] = useState<TradeData[]>([])
  const [isChartReady, setIsChartReady] = useState(false)
  const [priceChange, setPriceChange] = useState<{ value: number; percentage: number } | null>(null)
  const [dataSource, setDataSource] = useState<string>("")

  // Get instrument from URL params or props
  const instrument = searchParams.get("symbol") || propInstrument || "ES"
  const config = INSTRUMENT_CONFIGS[instrument] || INSTRUMENT_CONFIGS["ES"]

  // Utility functions
  const parseTimestamp = useCallback((timestamp: string): number => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid timestamp: ${timestamp}`)
      }
      return Math.floor(date.getTime() / 1000)
    } catch (err) {
      console.error("Error parsing timestamp:", err)
      return Math.floor(Date.now() / 1000)
    }
  }, [])

  const formatPrice = useCallback(
    (price: number): string => {
      const decimals = config.tickSize < 0.01 ? 5 : config.tickSize < 1 ? 2 : 0
      return price.toFixed(decimals)
    },
    [config.tickSize],
  )

  // Fetch real OHLC data
  const fetchOHLCData = useCallback(async (symbol: string, tf = "1D"): Promise<OHLCData[]> => {
    try {
      console.log(`Fetching REAL market data for ${symbol} with ${tf} timeframe...`)
      setDataSource("Loading...")

      const response = await fetch(`/api/ohlc?symbol=${symbol}&timeframe=${tf}&t=${Date.now()}`, {
        cache: "no-store", // Ensure we get fresh data
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid OHLC data format: expected array")
      }

      const validatedData = data.filter((item: any) => {
        return (
          item &&
          typeof item.time === "string" &&
          typeof item.open === "number" &&
          typeof item.high === "number" &&
          typeof item.low === "number" &&
          typeof item.close === "number" &&
          !isNaN(item.open) &&
          !isNaN(item.high) &&
          !isNaN(item.low) &&
          !isNaN(item.close) &&
          item.open > 0 &&
          item.high > 0 &&
          item.low > 0 &&
          item.close > 0
        )
      })

      if (validatedData.length === 0) {
        throw new Error("No valid market data received")
      }

      // Determine data source based on response characteristics
      const isRealData =
        validatedData.length > 50 &&
        validatedData.some((item: any) => new Date(item.time).getTime() > Date.now() - 24 * 60 * 60 * 1000)

      setDataSource(isRealData ? "Real Market Data" : "Fallback Data")

      console.log(`Fetched ${validatedData.length} REAL market data points for ${symbol} (${tf})`)
      return validatedData
    } catch (err) {
      console.error(`Error fetching REAL market data for ${symbol} (${tf}):`, err)
      setDataSource("Error")
      throw err
    }
  }, [])

  // Process trade data from props
  const processTradeData = useCallback((): TradeData[] => {
    if (!propTrades || propTrades.length === 0) {
      return []
    }

    const filteredTrades = propTrades
      .filter((trade) => trade.instrument === instrument)
      .map((trade) => ({
        price: trade.entry_price,
        side: trade.direction === "long" ? ("buy" as const) : ("sell" as const),
        id: trade.id,
        quantity: trade.quantity || 1,
        time: trade.entry_time,
      }))

    console.log(`Processed ${filteredTrades.length} trades for ${instrument}`)
    return filteredTrades
  }, [propTrades, instrument])

  // Convert OHLC data to chart format
  const convertOHLCToChartData = useCallback(
    (data: OHLCData[]): ChartDataPoint[] => {
      const chartData = data
        .map((item) => {
          const timestamp = parseTimestamp(item.time)

          return {
            time: timestamp,
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close),
            volume: item.volume || 0,
          }
        })
        .sort((a, b) => a.time - b.time)

      // Calculate price change
      if (chartData.length >= 2) {
        const firstPrice = chartData[0].open
        const lastPrice = chartData[chartData.length - 1].close
        const change = lastPrice - firstPrice
        const percentage = (change / firstPrice) * 100
        setPriceChange({ value: change, percentage })
      }

      return chartData
    },
    [parseTimestamp],
  )

  // Add trade markers to chart
  const addTradeMarkers = useCallback(() => {
    if (!candleSeriesRef.current || tradeData.length === 0 || ohlcData.length === 0) {
      return
    }

    try {
      // Clear existing markers and price lines
      priceLineRefs.current.forEach((line) => {
        try {
          candleSeriesRef.current.removePriceLine(line)
        } catch (e) {
          console.warn("Error removing price line:", e)
        }
      })
      priceLineRefs.current = []

      // Create markers for trades
      const markers = tradeData.map((trade) => {
        const tradeTime = trade.time ? parseTimestamp(trade.time) : null

        // Find the closest candle time if we have a trade time
        let markerTime = tradeTime
        if (tradeTime) {
          const closestCandle = ohlcData.reduce((prev, curr) =>
            Math.abs(curr.time - tradeTime) < Math.abs(prev.time - tradeTime) ? curr : prev,
          )
          markerTime = closestCandle.time
        } else {
          // Use the last candle if no trade time
          markerTime = ohlcData[ohlcData.length - 1].time
        }

        return {
          time: markerTime,
          position: trade.side === "buy" ? "belowBar" : "aboveBar",
          color: trade.side === "buy" ? "#10b981" : "#ef4444",
          shape: trade.side === "buy" ? "arrowUp" : "arrowDown",
          text: `${trade.side.toUpperCase()}: ${formatPrice(trade.price)}`,
          size: 1,
        }
      })

      // Set markers on the series
      candleSeriesRef.current.setMarkers(markers)

      // Add price lines for each trade
      tradeData.forEach((trade, index) => {
        try {
          const priceLine = candleSeriesRef.current.createPriceLine({
            price: trade.price,
            color: trade.side === "buy" ? "#10b981" : "#ef4444",
            lineWidth: 2,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: `${trade.side.toUpperCase()}: ${formatPrice(trade.price)}`,
          })
          priceLineRefs.current.push(priceLine)
        } catch (err) {
          console.error(`Error creating price line for trade ${index}:`, err)
        }
      })

      console.log(`Added ${markers.length} trade markers and ${priceLineRefs.current.length} price lines`)
    } catch (err) {
      console.error("Error adding trade markers:", err)
    }
  }, [tradeData, ohlcData, formatPrice, parseTimestamp])

  // Load data for instrument
  const loadData = useCallback(
    async (symbol: string, tf = "1D") => {
      try {
        setIsLoading(true)
        setError(null)
        console.log(`Loading REAL market data for instrument: ${symbol} (${tf})`)

        const ohlcResponse = await fetchOHLCData(symbol, tf)
        const chartData = convertOHLCToChartData(ohlcResponse)
        const trades = processTradeData()

        setOhlcData(chartData)
        setTradeData(trades)

        console.log(`Loaded ${chartData.length} REAL OHLC points and ${trades.length} trades for ${tf}`)
      } catch (err) {
        console.error(`Error loading REAL data for ${symbol} (${tf}):`, err)
        setError(err instanceof Error ? err.message : "Failed to load real market data")
      } finally {
        setIsLoading(false)
      }
    },
    [fetchOHLCData, convertOHLCToChartData, processTradeData],
  )

  // Initialize Lightweight Charts
  useEffect(() => {
    if (typeof window === "undefined") return

    const initChart = async () => {
      try {
        console.log("Initializing Lightweight Charts for REAL data...")

        const waitForContainer = (): Promise<void> => {
          return new Promise((resolve) => {
            const checkContainer = () => {
              if (containerRef.current && containerRef.current.clientWidth > 0) {
                resolve()
              } else {
                setTimeout(checkContainer, 50)
              }
            }
            checkContainer()
          })
        }

        await waitForContainer()

        if (!(window as any).LightweightCharts) {
          console.log("Loading Lightweight Charts library...")
          const script = document.createElement("script")
          script.src = "https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js"
          script.async = true

          await new Promise<void>((resolve, reject) => {
            script.onload = () => {
              if ((window as any).LightweightCharts) {
                console.log("Lightweight Charts loaded successfully")
                resolve()
              } else {
                reject(new Error("Lightweight Charts not available after load"))
              }
            }
            script.onerror = () => reject(new Error("Failed to load Lightweight Charts"))
            document.head.appendChild(script)
          })
        }

        if (!chartRef.current && containerRef.current) {
          const LightweightCharts = (window as any).LightweightCharts

          chartRef.current = LightweightCharts.createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            layout: {
              background: { color: "transparent" },
              textColor: "#e2e8f0",
            },
            grid: {
              vertLines: { color: "#334155" },
              horzLines: { color: "#334155" },
            },
            crosshair: {
              mode: LightweightCharts.CrosshairMode.Normal,
            },
            timeScale: {
              borderColor: "#475569",
              timeVisible: true,
              secondsVisible: false,
              rightOffset: 12,
              barSpacing: 6,
              fixLeftEdge: false,
              lockVisibleTimeRangeOnResize: true,
            },
            rightPriceScale: {
              borderColor: "#475569",
              autoScale: true,
              scaleMargins: {
                top: 0.1,
                bottom: 0.1,
              },
            },
            handleScroll: {
              mouseWheel: true,
              pressedMouseMove: true,
            },
            handleScale: {
              axisPressedMouseMove: true,
              mouseWheel: true,
              pinch: true,
            },
          })

          candleSeriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: "#10b981",
            downColor: "#ef4444",
            borderVisible: false,
            wickUpColor: "#10b981",
            wickDownColor: "#ef4444",
            priceFormat: {
              type: "price",
              precision: config.tickSize < 0.01 ? 5 : config.tickSize < 1 ? 2 : 0,
              minMove: config.tickSize,
            },
          })

          const handleResize = () => {
            if (chartRef.current && containerRef.current) {
              chartRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight)
            }
          }
          window.addEventListener("resize", handleResize)

          setIsChartReady(true)
          console.log("Chart initialized successfully for REAL data")
        }
      } catch (err) {
        console.error("Chart initialization error:", err)
        setError(err instanceof Error ? err.message : "Failed to initialize chart")
      }
    }

    initChart()

    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.remove()
        } catch (e) {
          console.warn("Error removing chart:", e)
        }
        chartRef.current = null
        candleSeriesRef.current = null
        priceLineRefs.current = []
        markerRefs.current = []
        setIsChartReady(false)
      }
    }
  }, [config.tickSize])

  // Load data when instrument or timeframe changes
  useEffect(() => {
    if (instrument) {
      loadData(instrument, timeframe)
    }
  }, [instrument, timeframe, loadData])

  // Update chart data when OHLC data changes
  useEffect(() => {
    if (isChartReady && candleSeriesRef.current && ohlcData.length > 0) {
      try {
        console.log(`Updating chart with ${ohlcData.length} REAL data points`)
        candleSeriesRef.current.setData(ohlcData)

        // Focus on trade date if provided
        setTimeout(() => {
          if (chartRef.current && ohlcData.length > 0) {
            if (tradeDate) {
              // Find the index closest to the trade date
              const tradeTimestamp = Math.floor(new Date(tradeDate).getTime() / 1000)
              const closestIndex = ohlcData.findIndex((item) => item.time >= tradeTimestamp)

              if (closestIndex >= 0) {
                const startIndex = Math.max(0, closestIndex - 25)
                const endIndex = Math.min(ohlcData.length - 1, closestIndex + 25)

                chartRef.current.timeScale().setVisibleLogicalRange({
                  from: startIndex,
                  to: endIndex,
                })
              }
            } else {
              // Show recent data
              const visibleRange = Math.min(50, ohlcData.length)
              chartRef.current.timeScale().setVisibleLogicalRange({
                from: Math.max(0, ohlcData.length - visibleRange),
                to: ohlcData.length - 1,
              })
            }
          }
        }, 100)
      } catch (err) {
        console.error("Error updating chart data:", err)
        setError("Failed to display chart data")
      }
    }
  }, [isChartReady, ohlcData, tradeDate])

  // Add trade markers when trade data changes
  useEffect(() => {
    if (isChartReady && candleSeriesRef.current && ohlcData.length > 0) {
      setTimeout(() => {
        addTradeMarkers()
      }, 200)
    }
  }, [isChartReady, ohlcData, addTradeMarkers])

  // Get current price and stats
  const currentPrice = ohlcData.length > 0 ? ohlcData[ohlcData.length - 1].close : 0
  const highPrice = ohlcData.length > 0 ? Math.max(...ohlcData.map((d) => d.high)) : 0
  const lowPrice = ohlcData.length > 0 ? Math.min(...ohlcData.map((d) => d.low)) : 0

  return (
    <div
      className={`w-full h-[420px] sm:h-[540px] bg-slate-900 rounded-lg relative overflow-hidden border border-slate-700/50 ${
        className || ""
      }`}
    >
      {/* Chart Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm text-red-400 z-10">
          <div className="text-xl font-semibold mb-2">Chart Error</div>
          <div className="text-sm opacity-75 max-w-md text-center mb-4">{error}</div>
          <button
            onClick={() => {
              setError(null)
              loadData(instrument, timeframe)
            }}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm text-slate-400 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mb-4" />
          <div className="text-xl font-semibold mb-2">Loading Real Market Data</div>
          <div className="text-sm opacity-75">Fetching {instrument} from financial APIs...</div>
        </div>
      )}

      {/* Instrument Header */}
      {!isLoading && !error && isChartReady && (
        <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-lg px-4 py-3 text-sm pointer-events-none border border-slate-600/50 shadow-lg">
          <div className="text-cyan-400 font-bold text-2xl">{instrument}</div>
          <div className="text-slate-200 text-sm font-medium">{config.name}</div>
          <div className="text-slate-400 text-xs mt-1">
            {config.category} • {config.currency} • {timeframe}
          </div>
        </div>
      )}

      {/* Price Display */}
      {!isLoading && !error && isChartReady && currentPrice > 0 && (
        <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-sm rounded-lg px-4 py-3 text-sm pointer-events-none border border-slate-600/50 shadow-lg">
          <div className="text-slate-400 text-xs uppercase tracking-wide">Current Price</div>
          <div className="text-white font-bold text-xl">
            {config.currency === "USD" ? "$" : ""}
            {formatPrice(currentPrice)}
            {config.currency !== "USD" ? ` ${config.currency}` : ""}
          </div>
          {priceChange && (
            <div className={`text-sm font-medium ${priceChange.value >= 0 ? "text-green-400" : "text-red-400"}`}>
              {priceChange.value >= 0 ? "+" : ""}
              {formatPrice(priceChange.value)} ({priceChange.percentage.toFixed(2)}%)
            </div>
          )}
        </div>
      )}

      {/* Data Source Indicator */}
      {!isLoading && !error && isChartReady && dataSource && (
        <div className="absolute top-20 left-4 bg-blue-500/20 backdrop-blur-sm rounded-lg px-3 py-2 text-xs pointer-events-none border border-blue-500/30">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${dataSource === "Real Market Data" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`}
            />
            <span className={`font-medium ${dataSource === "Real Market Data" ? "text-green-400" : "text-yellow-400"}`}>
              {dataSource}
            </span>
          </div>
        </div>
      )}

      {/* Price Statistics */}
      {!isLoading && !error && isChartReady && ohlcData.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-lg px-4 py-3 text-xs pointer-events-none border border-slate-600/50 shadow-lg">
          <div className="text-slate-200 font-medium mb-2">Session Stats</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">High:</span>
              <span className="text-green-400 font-medium">{formatPrice(highPrice)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Low:</span>
              <span className="text-red-400 font-medium">{formatPrice(lowPrice)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Range:</span>
              <span className="text-slate-300 font-medium">{formatPrice(highPrice - lowPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trade Markers Info */}
      {!isLoading && !error && isChartReady && tradeData.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-slate-800/95 backdrop-blur-sm rounded-lg px-4 py-3 text-xs pointer-events-none border border-slate-600/50 shadow-lg">
          <div className="text-slate-200 font-medium mb-2">Trade Positions ({tradeData.length})</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span className="text-slate-300">Buy Levels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span className="text-slate-300">Sell Levels</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(TradingChart)
