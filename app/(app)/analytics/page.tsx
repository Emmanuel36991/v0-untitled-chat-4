"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  ReferenceLine
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar as CalendarIcon,
  Filter,
  Brain,
  Sparkles,
  Check,
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


// --- Custom Chart Tooltip (Dashboard Style) ---
const CustomChartTooltip = ({
  active,
  payload,
  label,
  prefix = "",
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl z-50">
        <p className="text-xs font-medium text-muted-foreground mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                {entry.name}
              </p>
            </div>
            <p
              className={cn(
                "text-xs font-bold font-mono",
                typeof entry.value === "number" && entry.value > 0
                  ? "text-green-600 dark:text-green-400"
                  : typeof entry.value === "number" && entry.value < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-gray-100"
              )}
            >
              {prefix}{typeof entry.value === "number" ? entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : entry.value}
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}


// --- Date Picker with Presets (Dashboard Style) ---
function DatePickerWithRange({ className, date, setDate }: any) {
  const [open, setOpen] = useState(false)
  const presets = [
    { label: "Last 7 Days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "Last 30 Days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: "Last 90 Days", getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
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
          variant="outline"
          size="sm"
          className={cn(
            "h-9 justify-start text-left font-normal border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {date?.from ? (
            date.to ? (
              <span className="text-xs font-medium">
                {format(date.from, "MMM dd")} – {format(date.to, "MMM dd")}
              </span>
            ) : (
              <span className="text-xs">{format(date.from, "MMM dd, yyyy")}</span>
            )
          ) : (
            <span className="text-xs">Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl overflow-hidden" align="start">
        <div className="flex flex-col sm:flex-row bg-white dark:bg-gray-950">
          <div className="flex flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 sm:w-[160px]">
            <div className="px-2 py-1.5 mb-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quick Select</span>
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
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground"
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
            />
            <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-2 gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-7 text-xs">Cancel</Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 text-xs font-medium" onClick={() => setOpen(false)}>Apply</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}


// --- Loading Skeleton (Dashboard Style) ---
const DashboardSkeleton = () => (
  <div className="w-full min-h-screen bg-gray-50/50 dark:bg-[#0B0D12] p-8 space-y-8 animate-pulse">
    <div className="h-14 w-full" />
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 max-w-[1600px] mx-auto mt-8">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800/50 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
      <div className="lg:col-span-2 h-[400px] bg-gray-200 dark:bg-gray-800/50 rounded-xl" />
      <div className="h-[400px] bg-gray-200 dark:bg-gray-800/50 rounded-xl" />
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
    { name: "Wins", value: analytics.wins, color: "#10b981" },
    { name: "Losses", value: analytics.losses, color: "#f43f5e" },
    { name: "Breakeven", value: analytics.breakeven, color: "#6b7280" }
  ], [analytics])

  const instrumentData = useMemo(() =>
    Object.entries(analytics.instrumentDistribution).map(([key, val]) => ({
      name: key,
      value: val.pnl,
      color: val.pnl >= 0 ? "#10b981" : "#f43f5e"
    }))
    , [analytics])

  const setupData = useMemo(() =>
    Object.entries(analytics.setupDistribution).map(([key, val]) => ({
      name: key,
      value: val.count,
      color: "#818cf8"
    }))
    , [analytics])

  // Sparkline data
  const pnlSparkData = useMemo(() => analytics.dailyData.map(d => ({ value: d.cumulative })), [analytics])
  const winRateSparkData = useMemo(() => {
    let w = 0, total = 0
    return analytics.dailyData.map(d => { total += d.trades; w += d.pnl > 0 ? 1 : 0; return { value: total > 0 ? (w / total) * 100 : 0 } })
  }, [analytics])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0B0D12] text-foreground transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

        {/* ======= HEADER ======= */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div className="space-y-1">
            <h1
              className={cn(
                "text-3xl sm:text-4xl font-extrabold tracking-tight",
                "bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-slate-700 to-gray-900 dark:from-white dark:via-slate-200 dark:to-white"
              )}
            >
              Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Performance insights and breakdown analysis
            </p>
          </div>

          {/* Tab Switcher + Filter */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <Tabs value={mainTab} onValueChange={setMainTab} className="w-auto">
              <TabsList className="h-9 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <TabsTrigger
                  value="overview"
                  className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm font-semibold"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="intelligence"
                  className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm font-semibold"
                >
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Intelligence
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-9 rounded-lg px-3 border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800",
                showFilters && "bg-primary/10 border-primary/30 text-primary"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="text-xs font-semibold">Filters</span>
            </Button>
          </div>
        </div>

        {/* Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900/40">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Instrument</Label>
                      <Select onValueChange={(v) => setFilters(p => ({ ...p, instruments: v === "all" ? [] : [v] }))}>
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 h-9 text-xs"><SelectValue placeholder="All Instruments" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Instruments</SelectItem>
                          {Array.from(new Set(trades.map(t => t.instrument))).map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Setup</Label>
                      <Select onValueChange={(v) => setFilters(p => ({ ...p, setups: v === "all" ? [] : [v] }))}>
                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 h-9 text-xs"><SelectValue placeholder="All Setups" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Setups</SelectItem>
                          {Array.from(new Set(trades.map(t => t.setup_name).filter((s): s is string => Boolean(s)))).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>


        {/* ======= OVERVIEW TAB CONTENT ======= */}
        {mainTab === "overview" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* ====== CALENDAR HEATMAP — Full width, prominent ====== */}
            <Card className="border-0 shadow-lg dark:shadow-2xl dark:bg-gray-900/60 backdrop-blur-sm overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/50">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Trading Calendar
                  </CardTitle>
                  <CardDescription>
                    Daily P&L heatmap — hover for details
                  </CardDescription>
                </div>

                {/* Time span filter right next to the calendar */}
                <DatePickerWithRange
                  date={filters.dateRange}
                  setDate={(date: any) => setFilters({ ...filters, dateRange: date })}
                  className="w-auto"
                />
              </CardHeader>
              <CardContent className="p-6">
                <RedesignedCalendarHeatmap
                  dailyData={analytics.dailyData}
                  trades={analytics.filteredTrades}
                />
              </CardContent>
            </Card>


            {/* ====== SECTION D: BREAKDOWN GRID ====== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Win/Loss Donut */}
              <Card className="border-0 shadow-lg dark:shadow-2xl dark:bg-gray-900/60 ring-1 ring-gray-200 dark:ring-gray-800 backdrop-blur-sm h-[320px]">
                <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    Outcomes
                  </CardTitle>
                  <CardDescription className="text-xs">Win / Loss Ratio</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center flex-1 p-6">
                  <div className="relative w-full h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={outcomeData}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                          cornerRadius={4}
                        >
                          {outcomeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">
                        {analytics.totalTrades}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
                        Trades
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instrument P&L */}
              <Card className="border-0 shadow-lg dark:shadow-2xl dark:bg-gray-900/60 ring-1 ring-gray-200 dark:ring-gray-800 backdrop-blur-sm h-[320px]">
                <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800/50">
                  <CardTitle className="text-sm font-bold">By Instrument</CardTitle>
                  <CardDescription className="text-xs">P&L Distribution</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-4">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={instrumentData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.2} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6b7280" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(val) => `$${val}`} />
                        <RechartsTooltip cursor={{ fill: "transparent" }} content={<CustomChartTooltip prefix="$" />} />
                        <ReferenceLine y={0} stroke="#9ca3af" opacity={0.5} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                          {instrumentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Strategy Frequency */}
              <Card className="border-0 shadow-lg dark:shadow-2xl dark:bg-gray-900/60 ring-1 ring-gray-200 dark:ring-gray-800 backdrop-blur-sm h-[320px]">
                <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800/50">
                  <CardTitle className="text-sm font-bold">By Strategy</CardTitle>
                  <CardDescription className="text-xs">Setup Frequency</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-4">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={setupData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.2} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6b7280" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6b7280" }} />
                        <RechartsTooltip cursor={{ fill: "transparent" }} content={<CustomChartTooltip />} />
                        <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Trader DNA */}
              <Card className="border-0 shadow-lg dark:shadow-2xl dark:bg-gray-900/60 ring-1 ring-gray-200 dark:ring-gray-800 backdrop-blur-sm h-[320px]">
                <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800/50">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        Trader DNA
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-0">
                      {analytics.overallScore}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-2">
                  <EnhancedHexagram
                    winPercentage={analytics.winRate}
                    consistency={analytics.consistencyScore}
                    maxDrawdown={analytics.riskManagementScore}
                    recoveryFactor={analytics.adaptabilityScore}
                    profitFactor={Math.min(analytics.profitFactor, 5)}
                    avgWinLoss={analytics.efficiencyScore}
                    totalScore={analytics.overallScore}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Timing Analytics - Full Width */}
            <TimingAnalyticsDashboard
              trades={trades}
              className="rounded-xl border-0 shadow-lg dark:shadow-2xl dark:bg-gray-900/60 backdrop-blur-sm ring-1 ring-gray-200 dark:ring-gray-800"
            />

          </div>
        )}


        {/* ======= INTELLIGENCE TAB CONTENT ======= */}
        {mainTab === "intelligence" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            <InsightsView trades={analytics.filteredTrades} isLoading={loading} />
          </div>
        )}

      </div>

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
