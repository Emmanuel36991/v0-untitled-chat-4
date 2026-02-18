"use client"

import { memo, useEffect, useRef, useCallback } from "react"
import {
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData as LWCandlestickData,
  type HistogramData,
  type UTCTimestamp,
} from "lightweight-charts"
import type { Trade } from "@/types"
import { cn } from "@/lib/utils"

// --- Theme (reads CSS variables at runtime for light/dark mode awareness) ---
function hslToHex(hslStr: string): string {
  // Parse "H S% L%" or "H S L" format from CSS custom properties
  const parts = hslStr.replace(/%/g, '').trim().split(/\s+/).map(Number)
  if (parts.length < 3 || parts.some(isNaN)) return ''
  const [h, s, l] = [parts[0], parts[1] / 100, parts[2] / 100]
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function getChartColors(el: HTMLElement) {
  const s = getComputedStyle(el)
  const cssVar = (v: string) => s.getPropertyValue(v).trim()
  const toHex = (v: string) => hslToHex(cssVar(v))

  return {
    background: toHex('--background') || '#09090b',
    textColor: toHex('--muted-foreground') || '#71717a',
    gridColor: toHex('--border') || '#18181b',
    borderColor: toHex('--border') || '#27272a',
    crosshairLabelBg: toHex('--primary') || '#6366f1',
    bullish: toHex('--profit') || '#22c55e',
    bearish: toHex('--loss') || '#ef4444',
    volumeBullish: `${toHex('--profit') || '#22c55e'}26`,
    volumeBearish: `${toHex('--loss') || '#ef4444'}26`,
  }
}

// --- Types ---
export interface OHLCDataPoint {
  time: number // Unix seconds (UTC)
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface TradingViewChartProps {
  data: OHLCDataPoint[]
  trades?: Trade[]
  instrument?: string
  showVolume?: boolean
  className?: string
}

// --- Helpers ---
function buildTradeMarkers(trades: Trade[], instrument: string, colors: { bullish: string; bearish: string }) {
  return trades
    .filter((t) => t.instrument === instrument)
    .map((t) => {
      const timeSource = t.trade_start_time || t.date
      const utcSeconds = Math.floor(new Date(timeSource).getTime() / 1000)
      return {
        time: utcSeconds as UTCTimestamp,
        position: t.direction === "long" ? ("belowBar" as const) : ("aboveBar" as const),
        color: t.direction === "long" ? colors.bullish : colors.bearish,
        shape: t.direction === "long" ? ("arrowUp" as const) : ("arrowDown" as const),
        text: t.direction === "long" ? "BUY" : "SELL",
        size: 2,
      }
    })
    .sort((a, b) => (a.time as number) - (b.time as number))
}

// --- Component ---
function TradingViewChart({
  data,
  trades,
  instrument = "ES",
  showVolume = true,
  className,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const colorsRef = useRef<ReturnType<typeof getChartColors> | null>(null)

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return

    const colors = getChartColors(containerRef.current)
    colorsRef.current = colors

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { color: colors.background },
        textColor: colors.textColor,
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: colors.gridColor, style: 2 },
        horzLines: { color: colors.gridColor, style: 2 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { labelBackgroundColor: colors.crosshairLabelBg },
        horzLine: { labelBackgroundColor: colors.crosshairLabelBg },
      },
      rightPriceScale: {
        borderColor: colors.borderColor,
      },
      timeScale: {
        borderColor: colors.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Candlestick series
    const candles = chart.addCandlestickSeries({
      upColor: colors.bullish,
      downColor: colors.bearish,
      borderVisible: false,
      wickUpColor: colors.bullish,
      wickDownColor: colors.bearish,
    })

    // Volume histogram (overlay)
    const volume = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    })
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    chartRef.current = chart
    candleSeriesRef.current = candles
    volumeSeriesRef.current = volume

    // Resize observer for responsiveness
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
    }
  }, [])

  // Update data when it changes
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || data.length === 0) return

    // Set candlestick data
    const candleData: LWCandlestickData[] = data.map((d) => ({
      time: d.time as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))
    candleSeriesRef.current.setData(candleData)

    // Set volume data
    if (showVolume && volumeSeriesRef.current) {
      const volumeData: HistogramData[] = data.map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.volume || 0,
        color: d.close >= d.open ? (colorsRef.current?.volumeBullish ?? '#22c55e26') : (colorsRef.current?.volumeBearish ?? '#ef444426'),
      }))
      volumeSeriesRef.current.setData(volumeData)
    }

    // Set trade markers
    if (trades && trades.length > 0) {
      const c = colorsRef.current ?? { bullish: '#22c55e', bearish: '#ef4444' }
      const markers = buildTradeMarkers(trades, instrument, c)
      candleSeriesRef.current.setMarkers(markers)
    }

    // Fit content to view
    chartRef.current.timeScale().fitContent()
  }, [data, trades, instrument, showVolume])

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex justify-center items-center w-full min-h-[300px] text-muted-foreground rounded-lg",
          className,
        )}
        style={{ backgroundColor: 'var(--background)' }}
        role="img"
        aria-label="Trading chart - no data available"
      >
        No chart data available.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full min-h-[300px]", className)}
      style={{ backgroundColor: 'var(--background)' }}
      role="img"
      aria-label={`${instrument} candlestick trading chart`}
    />
  )
}

export default memo(TradingViewChart)
