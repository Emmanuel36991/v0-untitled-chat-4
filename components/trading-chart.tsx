"use client"

import { memo, useEffect, useRef, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import type { Trade } from "@/types"
import { Loader2, AlertTriangle, RefreshCw, BarChart3, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

// Configuration for instruments
const INSTRUMENT_CONFIGS: Record<string, InstrumentConfig> = {
  NQ: { name: "NASDAQ-100 E-mini", category: "Futures", currency: "USD", tickSize: 0.25 },
  MNQ: { name: "Micro NASDAQ-100", category: "Futures", currency: "USD", tickSize: 0.25 },
  ES: { name: "S&P 500 E-mini", category: "Futures", currency: "USD", tickSize: 0.25 },
  MES: { name: "Micro S&P 500", category: "Futures", currency: "USD", tickSize: 0.25 },
  // ... other configs (omitted for brevity, keep your existing ones)
}

// Expanded Timeframes like TradingView
const TIMEFRAMES = [
  { label: "1m", interval: "1m" },
  { label: "5m", interval: "5m" },
  { label: "15m", interval: "15m" },
  { label: "1h", interval: "1h" },
  { label: "4h", interval: "4h" },
  { label: "D", interval: "1d" },
  { label: "W", interval: "1w" },
]

function TradingChart({
  instrument: propInstrument,
  trades: propTrades,
  tradeDate,
  timeframe = "1D", // This prop might come as "1D", we'll default our internal state to "5m" usually
  className,
}: TradingChartProps) {
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candleSeriesRef = useRef<any>(null)
  const volumeSeriesRef = useRef<any>(null)
  const lineSeriesRef = useRef<any>(null) // For Moving Average
  
  // Default to 15m for better detail view, unless 1D is passed
  const [activeTimeframe, setActiveTimeframe] = useState(
     TIMEFRAMES.find(t => t.label === timeframe) || TIMEFRAMES[2] // Default to 15m
  )
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ohlcData, setOhlcData] = useState<any[]>([])
  const [isChartReady, setIsChartReady] = useState(false)
  const [dataSource, setDataSource] = useState<string>("")
  
  const instrument = searchParams.get("symbol") || propInstrument || "ES"
  const config = INSTRUMENT_CONFIGS[instrument] || { name: instrument, category: "Asset", currency: "USD", tickSize: 0.01 }

  // --- Utility: Moving Average Calculation ---
  const calculateSMA = (data: any[], period: number) => {
    const smaData = []
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) continue
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close
      }
      smaData.push({ time: data[i].time, value: sum / period })
    }
    return smaData
  }

  // --- Fetch Data ---
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ohlc?symbol=${instrument}&interval=${activeTimeframe.interval}`)
      const json = await res.json()
      
      if (!res.ok || json.error) throw new Error(json.error || "Failed to load data")

      // Convert time to seconds (Unix) for Lightweight Charts
      const processed = json.map((d: any) => ({
        ...d,
        time: Math.floor(new Date(d.time).getTime() / 1000) 
      })).sort((a: any, b: any) => a.time - b.time)

      // Deduplicate by time to prevent chart errors
      const uniqueData = processed.filter((item: any, index: number, self: any[]) => 
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

  // --- Chart Initialization ---
  useEffect(() => {
    if (!containerRef.current) return

    const script = document.createElement("script")
    script.src = "https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js"
    script.async = true
    
    script.onload = () => {
      if (!(window as any).LightweightCharts) return
      
      const { createChart, CrosshairMode } = (window as any).LightweightCharts
      
      if (chartRef.current) {
        chartRef.current.remove()
      }

      const chart = createChart(containerRef.current, {
        width: containerRef.current?.clientWidth,
        height: containerRef.current?.clientHeight,
        layout: {
          background: { color: 'transparent' },
          textColor: '#94a3b8',
          fontFamily: "'Inter', sans-serif",
        },
        grid: {
          vertLines: { color: '#1e293b', style: 2 },
          horzLines: { color: '#1e293b', style: 2 },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { labelBackgroundColor: '#6366f1' },
          horzLine: { labelBackgroundColor: '#6366f1' },
        },
        rightPriceScale: {
          borderColor: '#334155',
        },
        timeScale: {
          borderColor: '#334155',
          timeVisible: true,
          secondsVisible: false,
        },
      })

      // 1. Candlestick Series
      const candles = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      })

      // 2. Volume Series (Overlay)
      const volume = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: '', // Overlay on main chart
        scaleMargins: { top: 0.85, bottom: 0 },
      })

      // 3. Moving Average Series (20 SMA) - Adds "Detail"
      const maLine = chart.addLineSeries({
        color: '#f59e0b', // Amber/Yellow
        lineWidth: 1,
        crosshairMarkerVisible: false,
      })

      chartRef.current = chart
      candleSeriesRef.current = candles
      volumeSeriesRef.current = volume
      lineSeriesRef.current = maLine
      setIsChartReady(true)

      const resize = () => {
        if(chartRef.current && containerRef.current) {
           chartRef.current.applyOptions({ 
              width: containerRef.current.clientWidth,
              height: containerRef.current.clientHeight
           })
        }
      }
      window.addEventListener('resize', resize)
      return () => window.removeEventListener('resize', resize)
    }
    
    document.body.appendChild(script)

    return () => {
       if (chartRef.current) chartRef.current.remove()
       if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [])

  // --- Update Chart Data ---
  useEffect(() => {
    if (!isChartReady || !chartRef.current || ohlcData.length === 0) return

    // Update Candles
    candleSeriesRef.current.setData(ohlcData)

    // Update Volume
    volumeSeriesRef.current.setData(ohlcData.map((d: any) => ({
      time: d.time,
      value: d.volume || 0,
      color: d.close >= d.open ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'
    })))

    // Update MA Line
    const smaData = calculateSMA(ohlcData, 20)
    lineSeriesRef.current.setData(smaData)

    // Update Markers - use trade_start_time (proper UTC ISO timestamp) for positioning
    if (propTrades && propTrades.length > 0) {
      const markers = propTrades
        .filter(t => t.instrument === instrument)
        .map(t => {
           // Prefer trade_start_time (full UTC timestamp), fallback to date
           const timeSource = t.trade_start_time || t.date
           // trade_start_time is stored as proper UTC in the DB.
           // The OHLC candle data timestamps are also UTC seconds.
           // Use the UTC timestamp directly so markers align with candle data.
           const utcSeconds = Math.floor(new Date(timeSource).getTime() / 1000)
           return {
             time: utcSeconds,
             position: t.direction === 'long' ? 'belowBar' : 'aboveBar',
             color: t.direction === 'long' ? '#10b981' : '#ef4444',
             shape: t.direction === 'long' ? 'arrowUp' : 'arrowDown',
             text: t.direction === 'long' ? 'BUY' : 'SELL',
             size: 2,
           }
        })
        .sort((a: any, b: any) => a.time - b.time)
      
      candleSeriesRef.current.setMarkers(markers)
    }

    // Auto-fit content
    chartRef.current.timeScale().fitContent()

  }, [isChartReady, ohlcData, propTrades, instrument])

  return (
    <div className={cn("flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden", className)}>
      
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        
        {/* Left: Info */}
        <div className="flex items-center gap-3">
           <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-wide">{instrument}</span>
              <span className="text-[10px] text-slate-500 font-mono">{config.name}</span>
           </div>
           
           {/* Interval Selectors - TradingView Style */}
           <div className="hidden sm:flex items-center gap-0.5 ml-4 bg-slate-900 p-0.5 rounded-md border border-slate-800">
              {TIMEFRAMES.map(tf => (
                 <button
                    key={tf.label}
                    onClick={() => setActiveTimeframe(tf)}
                    className={cn(
                       "px-2 py-0.5 text-[10px] font-medium rounded transition-colors min-w-[28px]",
                       activeTimeframe.label === tf.label 
                         ? "bg-slate-800 text-indigo-400" 
                         : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                    )}
                 >
                    {tf.label}
                 </button>
              ))}
           </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
           <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${dataSource === 'Real Market Data' ? 'border-emerald-900/50 bg-emerald-950/20 text-emerald-500' : 'border-amber-900/50 bg-amber-950/20 text-amber-500'}`}>
              {dataSource || 'Connecting...'}
           </span>
           <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={loadData}>
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <RefreshCw className="h-3.5 w-3.5"/>}
           </Button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full relative">
         {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-10">
               <AlertTriangle className="h-8 w-8 text-rose-500 mb-2" />
               <p className="text-slate-400 text-xs">{error}</p>
               <Button variant="link" onClick={loadData} className="text-indigo-400 mt-2 h-auto p-0">Retry</Button>
            </div>
         ) : null}

         <div ref={containerRef} className="w-full h-full" />
         
         {/* Floating Legend for MA */}
         <div className="absolute top-2 left-3 z-10 pointer-events-none flex gap-3 text-[10px] font-mono">
            <span className="text-emerald-400">Vol</span>
            <span className="text-amber-400">MA 20</span>
         </div>
      </div>
    </div>
  )
}

export default memo(TradingChart)
