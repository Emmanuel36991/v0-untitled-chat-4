"use client"

import { memo, useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts"
import type { Trade } from "@/types"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// --- Theme Colors (resolved from CSS variables at runtime) ---
function getChartColors() {
  const style = getComputedStyle(document.documentElement)
  const get = (name: string) => style.getPropertyValue(name).trim()
  return {
    background: get("--background") ? `oklch(${get("--background")})` : "#09090b",
    toolbar: get("--card") ? `color-mix(in oklch, oklch(${get("--card")}) 50%, transparent)` : "rgba(9, 9, 11, 0.5)",
    text: get("--muted-foreground") ? `oklch(${get("--muted-foreground")})` : "#71717a",
    grid: get("--border") ? `oklch(${get("--border")})` : "#18181b",
    border: get("--border") ? `oklch(${get("--border")})` : "#27272a",
    crosshairLabel: get("--primary") ? `oklch(${get("--primary")})` : "#6366f1",
    bullish: get("--profit") ? `oklch(${get("--profit")})` : "#22c55e",
    bearish: get("--loss") ? `oklch(${get("--loss")})` : "#ef4444",
    volumeBullish: get("--profit") ? `color-mix(in oklch, oklch(${get("--profit")}) 15%, transparent)` : "rgba(34, 197, 94, 0.15)",
    volumeBearish: get("--loss") ? `color-mix(in oklch, oklch(${get("--loss")}) 15%, transparent)` : "rgba(239, 68, 68, 0.15)",
    maLine: get("--warning") ? `oklch(${get("--warning")})` : "#f59e0b",
  }
}

interface TradingChartProps {
  instrument?: string
  trades?: Trade[]
  tradeDate?: string
  timeframe?: string
  className?: string
}

interface InstrumentConfig {
  name: string
  category: string
  currency: string
  tickSize: number
}

const INSTRUMENT_CONFIGS: Record<string, InstrumentConfig> = {
  NQ: { name: "NASDAQ-100 E-mini", category: "Futures", currency: "USD", tickSize: 0.25 },
  MNQ: { name: "Micro NASDAQ-100", category: "Futures", currency: "USD", tickSize: 0.25 },
  ES: { name: "S&P 500 E-mini", category: "Futures", currency: "USD", tickSize: 0.25 },
  MES: { name: "Micro S&P 500", category: "Futures", currency: "USD", tickSize: 0.25 },
}

const TIMEFRAMES = [
  { label: "1m", interval: "1m" },
  { label: "5m", interval: "5m" },
  { label: "15m", interval: "15m" },
  { label: "1h", interval: "1h" },
  { label: "4h", interval: "4h" },
  { label: "D", interval: "1d" },
  { label: "W", interval: "1w" },
]

function calculateSMA(data: any[], period: number) {
  const result = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push({ time: data[i].time, value: sum / period })
  }
  return result
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
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)

  const [activeTimeframe, setActiveTimeframe] = useState(
    TIMEFRAMES.find((t) => t.label === timeframe) || TIMEFRAMES[2]
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ohlcData, setOhlcData] = useState<any[]>([])
  const [dataSource, setDataSource] = useState<string>("")

  const colorsRef = useRef(typeof document !== "undefined" ? getChartColors() : null)

  const instrument = searchParams.get("symbol") || propInstrument || "ES"
  const config = INSTRUMENT_CONFIGS[instrument] || {
    name: instrument,
    category: "Asset",
    currency: "USD",
    tickSize: 0.01,
  }

  // --- Fetch Data ---
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/ohlc?symbol=${instrument}&interval=${activeTimeframe.interval}`
      )
      const json = await res.json()

      if (!res.ok || json.error) throw new Error(json.error || "Failed to load data")

      const processed = json
        .map((d: any) => ({
          ...d,
          time: Math.floor(new Date(d.time).getTime() / 1000),
        }))
        .sort((a: any, b: any) => a.time - b.time)

      // Deduplicate by time
      const uniqueData = processed.filter(
        (item: any, index: number, self: any[]) =>
          index === self.findIndex((t: any) => t.time === item.time)
      )

      if (uniqueData.length === 0) throw new Error("No data returned")

      setOhlcData(uniqueData)
      setDataSource(uniqueData.length > 200 ? "Real Market Data" : "Fallback Data")
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [instrument, activeTimeframe])

  useEffect(() => {
    loadData()
  }, [loadData])

  // --- Chart Initialization (npm import, no CDN) ---
  useEffect(() => {
    if (!containerRef.current) return

    // Resolve CSS variable colors at chart init time
    const COLORS = getChartColors()
    colorsRef.current = COLORS

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { color: COLORS.background },
        textColor: COLORS.text,
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: COLORS.grid, style: 2 },
        horzLines: { color: COLORS.grid, style: 2 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { labelBackgroundColor: COLORS.crosshairLabel },
        horzLine: { labelBackgroundColor: COLORS.crosshairLabel },
      },
      rightPriceScale: {
        borderColor: COLORS.border,
      },
      timeScale: {
        borderColor: COLORS.border,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const candles = chart.addCandlestickSeries({
      upColor: COLORS.bullish,
      downColor: COLORS.bearish,
      borderVisible: false,
      wickUpColor: COLORS.bullish,
      wickDownColor: COLORS.bearish,
    })

    const volume = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    })
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    const maLine = chart.addLineSeries({
      color: COLORS.maLine,
      lineWidth: 1,
      crosshairMarkerVisible: false,
    })

    chartRef.current = chart
    candleSeriesRef.current = candles
    volumeSeriesRef.current = volume
    lineSeriesRef.current = maLine

    // Use ResizeObserver for responsive behavior
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        chart.applyOptions({ width, height })
      }
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
      lineSeriesRef.current = null
    }
  }, [])

  // --- Update Chart Data ---
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || ohlcData.length === 0) return
    const COLORS = colorsRef.current || getChartColors()

    candleSeriesRef.current.setData(ohlcData)

    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(
        ohlcData.map((d: any) => ({
          time: d.time,
          value: d.volume || 0,
          color: d.close >= d.open ? COLORS.volumeBullish : COLORS.volumeBearish,
        }))
      )
    }

    if (lineSeriesRef.current) {
      const smaData = calculateSMA(ohlcData, 20)
      lineSeriesRef.current.setData(smaData)
    }

    // Trade markers
    if (propTrades && propTrades.length > 0 && candleSeriesRef.current) {
      const markers = propTrades
        .filter((t) => t.instrument === instrument)
        .map((t) => {
          const timeSource = t.trade_start_time || t.date
          const utcSeconds = Math.floor(new Date(timeSource).getTime() / 1000)
          return {
            time: utcSeconds as UTCTimestamp,
            position:
              t.direction === "long"
                ? ("belowBar" as const)
                : ("aboveBar" as const),
            color: t.direction === "long" ? COLORS.bullish : COLORS.bearish,
            shape:
              t.direction === "long"
                ? ("arrowUp" as const)
                : ("arrowDown" as const),
            text: t.direction === "long" ? "BUY" : "SELL",
            size: 2,
          }
        })
        .sort((a, b) => (a.time as number) - (b.time as number))

      candleSeriesRef.current.setMarkers(markers)
    }

    chartRef.current.timeScale().fitContent()
  }, [ohlcData, propTrades, instrument])

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-xl border border-border overflow-hidden bg-background",
        className
      )}
    >
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground tracking-wide">
              {instrument}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {config.name}
            </span>
          </div>

          {/* Timeframe selectors */}
          <div className="hidden sm:flex items-center gap-0.5 ml-4 p-0.5 rounded-md border border-border bg-background">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setActiveTimeframe(tf)}
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded transition-colors min-w-[28px]",
                  activeTimeframe.label === tf.label
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-mono px-2 py-0.5 rounded-full border",
              dataSource === "Real Market Data"
                ? "border-profit/50 bg-profit/10 text-profit"
                : "border-warning/50 bg-warning/10 text-warning"
            )}
          >
            {dataSource || "Connecting..."}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={loadData}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full relative">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/80 backdrop-blur-sm">
            <AlertTriangle className="h-8 w-8 text-loss mb-2" />
            <p className="text-muted-foreground text-xs">{error}</p>
            <Button
              variant="link"
              onClick={loadData}
              className="text-primary mt-2 h-auto p-0"
            >
              Retry
            </Button>
          </div>
        ) : null}

        <div ref={containerRef} className="w-full h-full" />

        {/* Floating Legend */}
        <div className="absolute top-2 left-3 z-10 pointer-events-none flex gap-3 text-xs font-mono">
          <span className="text-profit">Vol</span>
          <span className="text-warning">MA 20</span>
        </div>
      </div>
    </div>
  )
}

export default memo(TradingChart)
