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

// --- Theme ---
const CHART_COLORS = {
  background: "#09090b",
  textColor: "#71717a",
  gridColor: "#18181b",
  borderColor: "#27272a",
  crosshairLabelBg: "#6366f1",
  bullish: "#22c55e",
  bearish: "#ef4444",
  volumeBullish: "rgba(34, 197, 94, 0.15)",
  volumeBearish: "rgba(239, 68, 68, 0.15)",
  maLine: "#f59e0b",
} as const

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
  showMA?: boolean
  maPeriod?: number
  className?: string
}

// --- Helpers ---
function calculateSMA(data: OHLCDataPoint[], period: number) {
  const result: { time: UTCTimestamp; value: number }[] = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push({ time: data[i].time as UTCTimestamp, value: sum / period })
  }
  return result
}

function buildTradeMarkers(trades: Trade[], instrument: string) {
  return trades
    .filter((t) => t.instrument === instrument)
    .map((t) => {
      const timeSource = t.trade_start_time || t.date
      const utcSeconds = Math.floor(new Date(timeSource).getTime() / 1000)
      return {
        time: utcSeconds as UTCTimestamp,
        position: t.direction === "long" ? ("belowBar" as const) : ("aboveBar" as const),
        color: t.direction === "long" ? CHART_COLORS.bullish : CHART_COLORS.bearish,
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
  showMA = true,
  maPeriod = 20,
  className,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const maSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { color: CHART_COLORS.background },
        textColor: CHART_COLORS.textColor,
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: CHART_COLORS.gridColor, style: 2 },
        horzLines: { color: CHART_COLORS.gridColor, style: 2 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { labelBackgroundColor: CHART_COLORS.crosshairLabelBg },
        horzLine: { labelBackgroundColor: CHART_COLORS.crosshairLabelBg },
      },
      rightPriceScale: {
        borderColor: CHART_COLORS.borderColor,
      },
      timeScale: {
        borderColor: CHART_COLORS.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Candlestick series
    const candles = chart.addCandlestickSeries({
      upColor: CHART_COLORS.bullish,
      downColor: CHART_COLORS.bearish,
      borderVisible: false,
      wickUpColor: CHART_COLORS.bullish,
      wickDownColor: CHART_COLORS.bearish,
    })

    // Volume histogram (overlay)
    const volume = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    })
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    // Moving average line
    const maLine = chart.addLineSeries({
      color: CHART_COLORS.maLine,
      lineWidth: 1,
      crosshairMarkerVisible: false,
    })

    chartRef.current = chart
    candleSeriesRef.current = candles
    volumeSeriesRef.current = volume
    maSeriesRef.current = maLine

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
      maSeriesRef.current = null
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
        color: d.close >= d.open ? CHART_COLORS.volumeBullish : CHART_COLORS.volumeBearish,
      }))
      volumeSeriesRef.current.setData(volumeData)
    }

    // Set MA data
    if (showMA && maSeriesRef.current) {
      const smaData = calculateSMA(data, maPeriod)
      maSeriesRef.current.setData(smaData)
    }

    // Set trade markers
    if (trades && trades.length > 0) {
      const markers = buildTradeMarkers(trades, instrument)
      candleSeriesRef.current.setMarkers(markers)
    }

    // Fit content to view
    chartRef.current.timeScale().fitContent()
  }, [data, trades, instrument, showVolume, showMA, maPeriod])

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex justify-center items-center w-full min-h-[300px] text-muted-foreground rounded-lg",
          className,
        )}
        style={{ backgroundColor: CHART_COLORS.background }}
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
      style={{ backgroundColor: CHART_COLORS.background }}
      role="img"
      aria-label={`${instrument} candlestick trading chart`}
    />
  )
}

export default memo(TradingViewChart)
