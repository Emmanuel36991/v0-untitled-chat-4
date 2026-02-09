"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  DollarSign,
  Target,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon,
  LayoutDashboard,
  Filter,
  Download,
  Brain,
  Sparkles,
  Check
} from "lucide-react"
import { getTrades } from "@/app/actions/trade-actions"
import { getAnalyticsData } from "@/app/actions/analytics-actions"
import type { Trade } from "@/types"
import { DateRange } from "react-day-picker"
import { format, subDays, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { useAIAdvisor } from "@/hooks/use-ai-advisor"
import { AdvisorPanel } from "@/components/ai/advisor-panel"
import { EnhancedHexagram } from "@/components/charts/enhanced-hexagram"
import { TimingAnalyticsDashboard } from "@/components/charts/timing-analytics-dashboard"
import { InsightsView } from "@/components/analytics/insights-view"
import { RedesignedCalendarHeatmap } from "@/components/analytics/redesigned-calendar-heatmap"


// --- TYPES ---
interface AnalyticsFilters {
  dateRange: DateRange | undefined
  instruments: string[]
  setups: string[]
  outcomes: string[]
  timeframe: "daily" | "weekly" | "monthly"
}

interface ProcessedAnalytics {
  totalTrades: number; wins: number; losses: number; breakeven: number; totalPnL: number; avgPnL: number; winRate: number; profitFactor: number
  maxDrawdown: number; consistencyScore: number; adaptabilityScore: number; executionScore: number; riskManagementScore: number; efficiencyScore: number; overallScore: number
  monthlyData: Array<{ month: string; profit: number; trades: number }>
  dailyData: Array<{ date: string; pnl: number; trades: number; cumulative: number }>
  setupDistribution: Record<string, { count: number; pnl: number; winRate: number }>
  instrumentDistribution: Record<string, { count: number; pnl: number; winRate: number }>
  outcomeDistribution: { wins: number; losses: number; breakeven: number }
  metricsList: Array<{ name: string; value: number }>
  filteredTrades: Trade[]
}

// --- PREMIUM GLASS TOOLTIP ---
const CustomTooltip = ({ active, payload, label, prefix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/60 rounded-lg p-3">
        <p className="text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-[0.12em] font-mono">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}40` }} />
              <span className="text-[11px] text-zinc-400">{entry.name}</span>
            </div>
            <span className="text-sm font-mono font-bold text-white tabular-nums">
              {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// --- DATE PICKER ---
function DatePickerWithRange({ className, date, setDate }: any) {
  const [open, setOpen] = useState(false)
  const presets = [
    { label: "Last 7 Days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "Last 30 Days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: "This Week", getValue: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
    { label: "Year to Date", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  ]

  const isPresetActive = (presetValue: DateRange) => {
    if (!date?.from || !date?.to || !presetValue.from || !presetValue.to) return false
    return isSameDay(date.from, presetValue.from) && isSameDay(date.to, presetValue.to)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"ghost"}
          size="sm"
          className={cn(
            "h-9 w-full justify-start text-left font-normal text-zinc-400 hover:text-zinc-200 hover:bg-white/5 px-3",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
          {date?.from ? (
            date.to ? (
              <span className="text-xs font-mono font-medium">
                {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
              </span>
            ) : (
              format(date.from, "MMM dd, yyyy")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0 shadow-2xl shadow-black/40 rounded-xl overflow-hidden ring-1 ring-zinc-700/50" align="start">
        <div className="flex flex-col sm:flex-row bg-zinc-900">
          <div className="flex flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-zinc-800 bg-zinc-950/50 sm:w-[160px]">
            <div className="px-2 py-1.5 mb-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Quick Select</span>
            </div>
            {presets.map((preset) => {
              const isActive = isPresetActive(preset.getValue())
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    setDate(preset.getValue())
                    setOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between text-left text-xs px-3 py-2 rounded-md transition-all font-medium",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "hover:bg-white/5 text-zinc-400"
                  )}
                >
                  {preset.label}
                  {isActive && <Check className="w-3 h-3" />}
                </button>
              )
            })}
          </div>

          <div className="p-4">
            <CalendarPrimitive
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              className="rounded-md border-0"
              classNames={{
                day_selected: "bg-emerald-500 text-white hover:bg-emerald-500 focus:bg-emerald-500",
                day_today: "bg-zinc-800 text-zinc-100",
                day_range_middle: "aria-selected:bg-emerald-500/10 aria-selected:text-emerald-300",
              }}
            />
            <div className="flex items-center justify-end pt-4 border-t border-zinc-800 mt-2 gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-7 text-xs text-zinc-400 hover:text-white">Cancel</Button>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-7 text-xs font-medium" onClick={() => setOpen(false)}>Apply</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}


// --- MINI SPARKLINE ---
const MiniSparkline = ({ data, color = "#34d399" }: { data: number[]; color?: string }) => {
  if (!data.length) return null
  const points = data.slice(-7)
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const w = 60
  const h = 20
  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${i === 0 ? "M" : "L"}${x},${y}`
    })
    .join(" ")

  return (
    <svg width={w} height={h} className="opacity-60">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// --- HUD METRIC CARD ---
const MetricCard = React.memo(({ title, value, change, trend, icon: Icon, sparkData }: any) => {
  const trendColor = trend === "up"
    ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]"
    : trend === "down"
      ? "text-rose-500"
      : "text-zinc-400"

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl p-5",
      "bg-white dark:bg-white/[0.04] backdrop-blur-md",
      "border border-slate-200 dark:border-white/[0.08]",
      "hover:dark:border-white/[0.15] hover:border-slate-300",
      "transition-all duration-300"
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-[0.12em] mb-3 font-mono">{title}</p>
          <h3 className={cn("text-3xl font-mono font-bold tracking-tight tabular-nums", trendColor)}>
            {value}
          </h3>
          {change && (
            <div className="flex items-center gap-1.5 mt-2">
              {trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-400" />}
              {trend === "down" && <ArrowDownRight className="h-3 w-3 text-rose-500" />}
              <span className={cn(
                "text-[10px] font-mono font-medium",
                trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-500" : "text-zinc-500"
              )}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]">
            <Icon className="h-4 w-4 text-slate-500 dark:text-zinc-500" />
          </div>
          {sparkData && <MiniSparkline data={sparkData} color={trend === "down" ? "#f43f5e" : "#34d399"} />}
        </div>
      </div>
    </div>
  )
})

// --- GLASS CHART CARD ---
const ChartCard = ({ title, subtitle, children, action, className }: any) => (
  <div className={cn(
    "flex flex-col overflow-hidden rounded-xl",
    "bg-white dark:bg-white/[0.04] backdrop-blur-md",
    "border border-slate-200 dark:border-white/[0.08]",
    className
  )}>
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.06]">
      <div>
        <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 tracking-wide uppercase font-mono">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="flex-1 p-5 relative">{children}</div>
  </div>
)

// --- SKELETON ---
const DashboardSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 p-8 space-y-8 animate-pulse">
    <div className="h-14 w-full border-b border-slate-200 dark:border-zinc-800" />
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 max-w-7xl mx-auto mt-8">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-zinc-800/50 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      <div className="lg:col-span-2 h-[400px] bg-slate-200 dark:bg-zinc-800/50 rounded-xl" />
      <div className="h-[400px] bg-slate-200 dark:bg-zinc-800/50 rounded-xl" />
    </div>
  </div>
)


// ======= MAIN PAGE =======

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [confluenceStats, setConfluenceStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab")
  const [mainTab, setMainTab] = useState(initialTab === "intelligence" ? "intelligence" : "overview")

  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      from: subDays(new Date(), 90),
      to: new Date(),
    },
    instruments: [],
    setups: [],
    outcomes: [],
    timeframe: "daily",
  })

  const { openAdvisor, isOpen, closeAdvisor, advisorProps } = useAIAdvisor()

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [tradesData, analyticsData] = await Promise.all([
          getTrades(),
          getAnalyticsData()
        ])
        setTrades(tradesData || [])
        if (analyticsData?.confluenceStats) {
          setConfluenceStats(analyticsData.confluenceStats)
        }
      } catch (error) {
        console.error("Failed to fetch analytics data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // --- MEMOIZED ANALYTICS ---
  const analytics = useMemo((): ProcessedAnalytics => {
    const emptyStats: ProcessedAnalytics = {
      totalTrades: 0, wins: 0, losses: 0, breakeven: 0, totalPnL: 0, avgPnL: 0, winRate: 0, profitFactor: 0,
      maxDrawdown: 0, consistencyScore: 0, adaptabilityScore: 0, executionScore: 0, riskManagementScore: 0, efficiencyScore: 0, overallScore: 0,
      monthlyData: [], dailyData: [], setupDistribution: {}, instrumentDistribution: {}, outcomeDistribution: { wins: 0, losses: 0, breakeven: 0 },
      metricsList: [], filteredTrades: []
    }

    if (!trades.length) return emptyStats

    let filteredTrades = trades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (filters.dateRange?.from) {
      const from = filters.dateRange.from.getTime()
      const to = filters.dateRange.to ? endOfDay(filters.dateRange.to).getTime() : endOfDay(new Date()).getTime()
      filteredTrades = filteredTrades.filter((t) => {
        const tTime = new Date(t.date).getTime()
        return tTime >= from && tTime <= to
      })
    }
    if (filters.instruments.length > 0) filteredTrades = filteredTrades.filter((t) => filters.instruments.includes(t.instrument))
    if (filters.setups.length > 0) filteredTrades = filteredTrades.filter((t) => t.setup_name && filters.setups.includes(t.setup_name))
    if (filters.outcomes.length > 0) filteredTrades = filteredTrades.filter((t) => filters.outcomes.includes(t.outcome))

    if (filteredTrades.length === 0) return emptyStats

    const wins = filteredTrades.filter((t) => t.outcome === "win" || t.pnl > 0).length
    const losses = filteredTrades.filter((t) => t.outcome === "loss" || t.pnl < 0).length
    const breakeven = filteredTrades.filter((t) => t.outcome === "breakeven" || t.pnl === 0).length
    const totalPnL = filteredTrades.reduce((sum, t) => sum + Number(t.pnl), 0)
    const grossProfit = filteredTrades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + Number(t.pnl), 0)
    const grossLoss = Math.abs(filteredTrades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + Number(t.pnl), 0))
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 10 : 0) : grossProfit / grossLoss
    const winRate = (wins / filteredTrades.length) * 100

    const dailyMap = new Map<string, { pnl: number; trades: number }>()
    const monthlyMap = new Map<string, { profit: number; trades: number }>()

    filteredTrades.forEach((t) => {
      const dateStr = format(new Date(t.date), "yyyy-MM-dd")
      const dCurr = dailyMap.get(dateStr) || { pnl: 0, trades: 0 }
      dailyMap.set(dateStr, { pnl: dCurr.pnl + Number(t.pnl), trades: dCurr.trades + 1 })

      const monthStr = format(new Date(t.date), "MMM yyyy")
      const mCurr = monthlyMap.get(monthStr) || { profit: 0, trades: 0 }
      monthlyMap.set(monthStr, { profit: mCurr.profit + Number(t.pnl), trades: mCurr.trades + 1 })
    })

    let cumulative = 0
    const dailyData = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => {
        cumulative += data.pnl
        return { date, ...data, cumulative }
      })

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

    const monthlyReturns = monthlyData.map(m => m.profit)
    const avgMonthly = monthlyReturns.reduce((a, b) => a + b, 0) / (monthlyReturns.length || 1)
    const variance = monthlyReturns.reduce((a, b) => a + Math.pow(b - avgMonthly, 2), 0) / (monthlyReturns.length || 1)
    const stdDev = Math.sqrt(variance)
    let cv = avgMonthly !== 0 ? (stdDev / Math.abs(avgMonthly)) : 1
    const consistencyScore = Math.max(0, Math.min(100, 100 - (cv * 50)))

    let peak = -Infinity
    let maxDD = 0
    dailyData.forEach(day => {
      if (day.cumulative > peak) peak = day.cumulative
      const dd = peak - day.cumulative
      if (dd > maxDD) maxDD = dd
    })
    const totalEquity = Math.abs(totalPnL) + 1000
    const ddPercentage = maxDD / totalEquity
    const riskManagementScore = Math.max(0, Math.min(100, 100 - (ddPercentage * 400)))

    const recentTrades = filteredTrades.filter(t => new Date(t.date) >= subDays(new Date(), 30))
    const recentWinRate = recentTrades.length ? (recentTrades.filter(t => t.pnl > 0).length / recentTrades.length) * 100 : 0
    const adaptabilityScore = Math.max(0, Math.min(100, 70 + (recentWinRate - winRate)))
    const executionScore = Math.max(0, Math.min(100, (winRate - 30) * 2.5))
    const efficiencyScore = Math.max(0, Math.min(100, (profitFactor) * 33))

    const overallScore = Math.round(
      consistencyScore * 0.2 +
      riskManagementScore * 0.25 +
      executionScore * 0.2 +
      efficiencyScore * 0.2 +
      adaptabilityScore * 0.15
    )

    const setupDist: Record<string, any> = {}
    const instrumentDist: Record<string, any> = {}

    filteredTrades.forEach(t => {
      const s = t.setup_name || "No Setup"
      if (!setupDist[s]) setupDist[s] = { count: 0, pnl: 0, wins: 0 }
      setupDist[s].count++
      setupDist[s].pnl += t.pnl
      if (t.pnl > 0) setupDist[s].wins++

      const i = t.instrument
      if (!instrumentDist[i]) instrumentDist[i] = { count: 0, pnl: 0, wins: 0 }
      instrumentDist[i].count++
      instrumentDist[i].pnl += t.pnl
      if (t.pnl > 0) instrumentDist[i].wins++
    })

    Object.keys(setupDist).forEach(k => setupDist[k].winRate = (setupDist[k].wins / setupDist[k].count) * 100)
    Object.keys(instrumentDist).forEach(k => instrumentDist[k].winRate = (instrumentDist[k].wins / instrumentDist[k].count) * 100)

    const metricsList = [
      { name: "Win Rate", value: executionScore },
      { name: "Risk Control", value: riskManagementScore },
      { name: "Consistency", value: consistencyScore },
      { name: "Adaptability", value: adaptabilityScore },
      { name: "Profit Factor", value: efficiencyScore },
      { name: "Risk/Reward", value: Math.min(profitFactor * 20, 100) }
    ]

    return {
      totalTrades: filteredTrades.length, wins, losses, breakeven, totalPnL,
      avgPnL: filteredTrades.length ? totalPnL / filteredTrades.length : 0,
      winRate, profitFactor, maxDrawdown: maxDD,
      consistencyScore, adaptabilityScore, executionScore, riskManagementScore, efficiencyScore, overallScore,
      monthlyData, dailyData,
      setupDistribution: setupDist,
      instrumentDistribution: instrumentDist,
      outcomeDistribution: { wins, losses, breakeven },
      metricsList,
      filteredTrades
    }
  }, [trades, filters])

  // Prepare Recharts Data
  const outcomeData = useMemo(() => [
    { name: "Wins", value: analytics.wins, color: "#34d399" },
    { name: "Losses", value: analytics.losses, color: "#f43f5e" },
    { name: "Breakeven", value: analytics.breakeven, color: "#52525b" }
  ], [analytics])

  const instrumentData = useMemo(() =>
    Object.entries(analytics.instrumentDistribution).map(([key, val]) => ({
      name: key,
      value: val.pnl,
      color: val.pnl >= 0 ? "#34d399" : "#f43f5e"
    }))
    , [analytics])

  const setupData = useMemo(() =>
    Object.entries(analytics.setupDistribution).map(([key, val]) => ({
      name: key,
      value: val.count,
      color: "#818cf8"
    }))
    , [analytics])

  // Sparkline data from dailyData
  const pnlSparkData = useMemo(() => analytics.dailyData.map(d => d.cumulative), [analytics])
  const winRateSparkData = useMemo(() => {
    let w = 0, total = 0
    return analytics.dailyData.map(d => { total += d.trades; w += d.pnl > 0 ? 1 : 0; return total > 0 ? (w / total) * 100 : 0 })
  }, [analytics])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 font-sans text-slate-900 dark:text-zinc-100 transition-colors duration-500">

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-none font-mono uppercase">Analytics</h1>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Performance & Insights</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg p-0.5">
              <div className="w-[200px] border-r border-slate-100 dark:border-white/[0.06]">
                <DatePickerWithRange date={filters.dateRange} setDate={(date: any) => setFilters({ ...filters, dateRange: date })} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "h-9 rounded-md px-3 text-slate-500 dark:text-zinc-400 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-white/5",
                  showFilters && "bg-slate-100 dark:bg-white/[0.08] text-emerald-500"
                )}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/50"
            >
              <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Instrument</Label>
                    <Select onValueChange={(v) => setFilters(p => ({ ...p, instruments: v === "all" ? [] : [v] }))}>
                      <SelectTrigger className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 h-9 text-xs"><SelectValue placeholder="All Instruments" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Instruments</SelectItem>
                        {Array.from(new Set(trades.map(t => t.instrument))).map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Setup</Label>
                    <Select onValueChange={(v) => setFilters(p => ({ ...p, setups: v === "all" ? [] : [v] }))}>
                      <SelectTrigger className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 h-9 text-xs"><SelectValue placeholder="All Setups" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Setups</SelectItem>
                        {Array.from(new Set(trades.map(t => t.setup_name).filter((s): s is string => Boolean(s)))).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full space-y-8">

          <div className="flex border-b border-slate-200 dark:border-zinc-800">
            <TabsList className="bg-transparent p-0 gap-6 h-auto">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-500 font-medium text-slate-500 dark:text-zinc-500 transition-all hover:text-slate-700 dark:hover:text-zinc-300 font-mono uppercase text-xs tracking-wider"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="intelligence"
                className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:text-violet-400 font-medium text-slate-500 dark:text-zinc-500 transition-all hover:text-slate-700 dark:hover:text-zinc-300 font-mono uppercase text-xs tracking-wider"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Intelligence
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* ====== SECTION A: HEADLINES - KPI CARDS ====== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Net P&L"
                value={`$${analytics.totalPnL.toLocaleString()}`}
                change={`${analytics.totalPnL > 0 ? "+" : ""}${((analytics.totalPnL / (Math.abs(analytics.totalPnL - 500) || 1)) * 10).toFixed(1)}%`}
                trend={analytics.totalPnL >= 0 ? "up" : "down"}
                icon={DollarSign}
                sparkData={pnlSparkData}
              />
              <MetricCard
                title="Win Rate"
                value={`${analytics.winRate.toFixed(1)}%`}
                change={analytics.winRate > 50 ? "Healthy" : "Needs Improvement"}
                trend={analytics.winRate > 50 ? "up" : "down"}
                icon={Target}
                sparkData={winRateSparkData}
              />
              <MetricCard
                title="Profit Factor"
                value={analytics.profitFactor.toFixed(2)}
                trend="neutral"
                change="Ratio"
                icon={Activity}
              />
              <MetricCard
                title="Total Volume"
                value={analytics.totalTrades}
                change={`$${analytics.avgPnL.toFixed(0)} avg`}
                trend="neutral"
                icon={BarChart3}
              />
            </div>

            {/* ====== SECTION B: THE PULSE - Equity Curve + Calendar ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT 2/3: Equity Curve */}
              <ChartCard
                title="Equity Curve"
                subtitle="Cumulative Performance"
                className="lg:col-span-2 h-[420px]"
                action={
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-500 hover:text-emerald-400 dark:hover:text-emerald-400"><Download className="h-3.5 w-3.5" /></Button>
                }
              >
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.dailyData}>
                      <defs>
                        <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-zinc-800" strokeOpacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(str) => format(new Date(str), "MMM d")}
                        className="fill-slate-400 dark:fill-zinc-600"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        className="fill-slate-400 dark:fill-zinc-600"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                      />
                      <RechartsTooltip content={<CustomTooltip prefix="$" />} />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#34d399"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#equityGradient)"
                        name="Equity"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* RIGHT 1/3: Calendar Heatmap - ALWAYS VISIBLE */}
              <div className="lg:col-span-1 h-[420px]">
                <RedesignedCalendarHeatmap
                  dailyData={analytics.dailyData}
                  trades={analytics.filteredTrades}
                />
              </div>
            </div>

            {/* ====== SECTION C: THE BREAKDOWN - Bento Grid ====== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Win/Loss Donut */}
              <ChartCard title="Outcomes" subtitle="Win / Loss Ratio" className="h-[280px]">
                <div className="h-full w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {outcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                    <span className="text-2xl font-mono font-bold text-slate-800 dark:text-zinc-100">{analytics.totalTrades}</span>
                    <span className="text-[9px] uppercase text-slate-400 dark:text-zinc-500 font-bold tracking-widest">Trades</span>
                  </div>
                </div>
              </ChartCard>

              {/* Instrument P&L */}
              <ChartCard title="By Instrument" subtitle="P&L Distribution" className="h-[280px]">
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={instrumentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-zinc-800" strokeOpacity={0.2} />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip prefix="$" />} />
                      <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                        {instrumentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Strategy Frequency */}
              <ChartCard title="By Strategy" subtitle="Setup Frequency" className="h-[280px]">
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={setupData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-zinc-800" strokeOpacity={0.2} />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#818cf8" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Trader DNA */}
              <div className={cn(
                "flex flex-col overflow-hidden rounded-xl h-[280px]",
                "bg-white dark:bg-white/[0.04] backdrop-blur-md",
                "border border-slate-200 dark:border-white/[0.08]"
              )}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-emerald-400" />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 tracking-wide uppercase font-mono">Trader DNA</h3>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                    {analytics.overallScore}/100
                  </Badge>
                </div>
                <div className="flex-1 flex items-center justify-center p-2">
                  <EnhancedHexagram
                    winPercentage={analytics.winRate}
                    consistency={analytics.consistencyScore}
                    maxDrawdown={analytics.riskManagementScore}
                    recoveryFactor={analytics.adaptabilityScore}
                    profitFactor={Math.min(analytics.profitFactor, 5)}
                    avgWinLoss={analytics.efficiencyScore}
                    totalScore={analytics.overallScore}
                  />
                </div>
              </div>
            </div>

            {/* Timing Analytics - Full Width */}
            <TimingAnalyticsDashboard
              trades={trades}
              className="rounded-xl bg-white dark:bg-white/[0.04] backdrop-blur-md border border-slate-200 dark:border-white/[0.08]"
            />

          </TabsContent>

          {/* --- INTELLIGENCE TAB --- */}
          <TabsContent value="intelligence" className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            <InsightsView trades={analytics.filteredTrades} isLoading={loading} />
          </TabsContent>

        </Tabs>
      </main>

      {advisorProps && (
        <AdvisorPanel
          isOpen={isOpen}
          onClose={closeAdvisor}
          title={advisorProps.title}
          type={advisorProps.type}
          data={advisorProps.data}
          context={advisorProps.context}
        />
      )}
    </div>
  )
}
