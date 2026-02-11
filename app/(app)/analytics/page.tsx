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
  ReferenceLine,
  Area,
  AreaChart,
  Line,
  ComposedChart,
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
  Microscope,
  Check,
  Download,
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  XCircle,
  Minus,
  DollarSign,
  Percent,
  BarChart3,
  Clock,
  Activity,
  ChevronRight,
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


// --- Custom Chart Tooltip ---
const CustomChartTooltip = ({ active, payload, label, prefix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl z-50">
        <p className="text-xs font-medium text-muted-foreground mb-2 border-b border-border pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-xs font-medium text-muted-foreground capitalize">{entry.name}</p>
            </div>
            <p className={cn(
              "text-xs font-bold font-mono",
              typeof entry.value === "number" && entry.value > 0 ? "text-emerald-600 dark:text-emerald-400"
                : typeof entry.value === "number" && entry.value < 0 ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground"
            )}>
              {prefix}{typeof entry.value === "number" ? entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : entry.value}
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}


// --- Date Picker with Presets ---
function DatePickerWithRange({ className, date, setDate }: any) {
  const [open, setOpen] = useState(false)
  const [tempDate, setTempDate] = useState<DateRange | undefined>(date)

  // Sync temp state when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setTempDate(date)
    setOpen(isOpen)
  }

  const presets = [
    { label: "Last 7 Days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "Last 30 Days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: "Last 90 Days", getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
    { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: "This Week", getValue: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
    { label: "Year to Date", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  ]

  const isPresetActive = (presetValue: DateRange) => {
    const check = tempDate
    if (!check?.from || !check?.to || !presetValue.from || !presetValue.to) return false
    return isSameDay(check.from, presetValue.from) && isSameDay(check.to, presetValue.to)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 justify-start text-left font-normal border-border",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
          {date?.from ? (
            date.to ? (
              <span className="text-xs font-medium">
                {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
              </span>
            ) : (
              <span className="text-xs">{format(date.from, "MMM dd, yyyy")}</span>
            )
          ) : (
            <span className="text-xs">Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border shadow-xl rounded-xl overflow-hidden" align="start" sideOffset={6}>
        <div className="flex flex-col sm:flex-row bg-card">
          {/* Quick Select Sidebar */}
          <div className="flex flex-col gap-0.5 p-3 border-b sm:border-b-0 sm:border-r border-border sm:w-[152px] bg-muted/30">
            <div className="px-2 py-1.5 mb-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quick Select</span>
            </div>
            {presets.map((preset) => {
              const isActive = isPresetActive(preset.getValue())
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    const val = preset.getValue()
                    setTempDate(val)
                    setDate(val)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between text-left text-xs px-3 py-2 rounded-md transition-colors font-medium",
                    isActive
                      ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {preset.label}
                  {isActive && <Check className="w-3 h-3 shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Calendar Area */}
          <div className="flex flex-col">
            <div className="p-4 pb-3">
              <CalendarPrimitive
                initialFocus
                mode="range"
                defaultMonth={tempDate?.from}
                selected={tempDate}
                onSelect={setTempDate}
                numberOfMonths={2}
                className="rounded-md border-0"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
              <p className="text-[11px] text-muted-foreground">
                {tempDate?.from && tempDate?.to
                  ? `${format(tempDate.from, "MMM d, yyyy")} - ${format(tempDate.to, "MMM d, yyyy")}`
                  : tempDate?.from
                  ? `${format(tempDate.from, "MMM d, yyyy")} - Select end date`
                  : "Select a date range"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setTempDate(date); setOpen(false) }}
                  className="h-7 text-xs px-3"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs font-medium px-4"
                  disabled={!tempDate?.from || !tempDate?.to}
                  onClick={() => { setDate(tempDate); setOpen(false) }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}


// --- Loading Skeleton ---
const DashboardSkeleton = () => (
  <div className="w-full min-h-screen bg-background p-8 space-y-6 animate-pulse">
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="h-14 w-full" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[130px] bg-muted rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[420px] bg-muted rounded-xl" />
        <div className="h-[420px] bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-[340px] bg-muted rounded-xl" />)}
      </div>
    </div>
  </div>
)


// --- KPI Metric Card Component ---
function MetricCard({
  title, value, subtitle, icon: Icon, accentColor, children
}: {
  title: string
  value: React.ReactNode
  subtitle?: React.ReactNode
  icon: React.ElementType
  accentColor: string
  children?: React.ReactNode
}) {
  const colorMap: Record<string, { strip: string; iconBg: string; iconText: string; valueText?: string }> = {
    emerald: { strip: "bg-emerald-500", iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15", iconText: "text-emerald-600 dark:text-emerald-400", valueText: "text-emerald-600 dark:text-emerald-400" },
    rose: { strip: "bg-rose-500", iconBg: "bg-rose-500/10 dark:bg-rose-500/15", iconText: "text-rose-600 dark:text-rose-400", valueText: "text-rose-600 dark:text-rose-400" },
    blue: { strip: "bg-blue-500", iconBg: "bg-blue-500/10 dark:bg-blue-500/15", iconText: "text-blue-600 dark:text-blue-400" },
    amber: { strip: "bg-amber-500", iconBg: "bg-amber-500/10 dark:bg-amber-500/15", iconText: "text-amber-600 dark:text-amber-400" },
    gray: { strip: "bg-muted-foreground/40", iconBg: "bg-muted-foreground/10", iconText: "text-muted-foreground" },
  }
  const colors = colorMap[accentColor] || colorMap.blue

  return (
    <Card className="group relative border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-card/60 backdrop-blur-sm ring-1 ring-border overflow-hidden">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", colors.strip)} />
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", colors.iconBg)}>
            <Icon className={cn("w-3.5 h-3.5", colors.iconText)} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
        </div>
        <div className={cn("text-2xl font-extrabold font-mono tracking-tight leading-none", colors.valueText || "text-foreground")}>
          {value}
        </div>
        {subtitle && <p className="text-[10px] text-muted-foreground font-medium leading-tight">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  )
}


// --- Section Header Component ---
function SectionHeader({ icon: Icon, title, description, badge }: { icon: React.ElementType; title: string; description: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {badge}
    </div>
  )
}


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
    dateRange: { from: subDays(new Date(), 90), to: new Date() },
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
        const [tradesData, analyticsData] = await Promise.all([getTrades(), getAnalyticsData()])
        setTrades(tradesData || [])
        if (analyticsData?.confluenceStats) setConfluenceStats(analyticsData.confluenceStats)
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
      filteredTrades = filteredTrades.filter((t) => { const tTime = new Date(t.date).getTime(); return tTime >= from && tTime <= to })
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
    const dailyData = Array.from(dailyMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, data]) => {
      cumulative += data.pnl
      return { date, ...data, cumulative }
    })
    const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

    const monthlyReturns = monthlyData.map(m => m.profit)
    const avgMonthly = monthlyReturns.reduce((a, b) => a + b, 0) / (monthlyReturns.length || 1)
    const variance = monthlyReturns.reduce((a, b) => a + Math.pow(b - avgMonthly, 2), 0) / (monthlyReturns.length || 1)
    const stdDev = Math.sqrt(variance)
    let cv = avgMonthly !== 0 ? (stdDev / Math.abs(avgMonthly)) : 1
    const consistencyScore = Math.max(0, Math.min(100, 100 - (cv * 50)))

    let peak = -Infinity; let maxDD = 0
    dailyData.forEach(day => { if (day.cumulative > peak) peak = day.cumulative; const dd = peak - day.cumulative; if (dd > maxDD) maxDD = dd })
    const totalEquity = Math.abs(totalPnL) + 1000
    const ddPercentage = maxDD / totalEquity
    const riskManagementScore = Math.max(0, Math.min(100, 100 - (ddPercentage * 400)))

    const recentTrades = filteredTrades.filter(t => new Date(t.date) >= subDays(new Date(), 30))
    const recentWinRate = recentTrades.length ? (recentTrades.filter(t => t.pnl > 0).length / recentTrades.length) * 100 : 0
    const adaptabilityScore = Math.max(0, Math.min(100, 70 + (recentWinRate - winRate)))
    const executionScore = Math.max(0, Math.min(100, (winRate - 30) * 2.5))
    const efficiencyScore = Math.max(0, Math.min(100, (profitFactor) * 33))
    const overallScore = Math.round(consistencyScore * 0.2 + riskManagementScore * 0.25 + executionScore * 0.2 + efficiencyScore * 0.2 + adaptabilityScore * 0.15)

    const setupDist: Record<string, any> = {}
    const instrumentDist: Record<string, any> = {}
    filteredTrades.forEach(t => {
      const s = t.setup_name || "No Setup"
      if (!setupDist[s]) setupDist[s] = { count: 0, pnl: 0, wins: 0 }
      setupDist[s].count++; setupDist[s].pnl += t.pnl; if (t.pnl > 0) setupDist[s].wins++
      const i = t.instrument
      if (!instrumentDist[i]) instrumentDist[i] = { count: 0, pnl: 0, wins: 0 }
      instrumentDist[i].count++; instrumentDist[i].pnl += t.pnl; if (t.pnl > 0) instrumentDist[i].wins++
    })
    Object.keys(setupDist).forEach(k => setupDist[k].winRate = (setupDist[k].wins / setupDist[k].count) * 100)
    Object.keys(instrumentDist).forEach(k => instrumentDist[k].winRate = (instrumentDist[k].wins / instrumentDist[k].count) * 100)

    const metricsList = [
      { name: "Win Rate", value: executionScore }, { name: "Risk Control", value: riskManagementScore },
      { name: "Consistency", value: consistencyScore }, { name: "Adaptability", value: adaptabilityScore },
      { name: "Profit Factor", value: efficiencyScore }, { name: "Risk/Reward", value: Math.min(profitFactor * 20, 100) }
    ]

    return {
      totalTrades: filteredTrades.length, wins, losses, breakeven, totalPnL,
      avgPnL: filteredTrades.length ? totalPnL / filteredTrades.length : 0,
      winRate, profitFactor, maxDrawdown: maxDD,
      consistencyScore, adaptabilityScore, executionScore, riskManagementScore, efficiencyScore, overallScore,
      monthlyData, dailyData, setupDistribution: setupDist, instrumentDistribution: instrumentDist,
      outcomeDistribution: { wins, losses, breakeven }, metricsList, filteredTrades
    }
  }, [trades, filters])

  // --- Prepare Chart Data ---
  const outcomeData = useMemo(() => [
    { name: "Wins", value: analytics.wins, color: "#10b981" },
    { name: "Losses", value: analytics.losses, color: "#f43f5e" },
    { name: "Breakeven", value: analytics.breakeven, color: "#6b7280" }
  ], [analytics])

  const strategyPnlData = useMemo(() =>
    Object.entries(analytics.setupDistribution)
      .map(([key, val]) => ({
        name: key.length > 14 ? key.slice(0, 14) + "..." : key,
        fullName: key, pnl: Number(val.pnl.toFixed(2)), trades: val.count, winRate: Number(val.winRate.toFixed(1)),
      }))
      .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl)).slice(0, 8)
    , [analytics])

  const top5InstrumentData = useMemo(() =>
    Object.entries(analytics.instrumentDistribution)
      .map(([key, val]) => ({
        name: key, pnl: Number(val.pnl.toFixed(2)), trades: val.count,
        color: val.pnl >= 0 ? "#10b981" : "#f43f5e",
      }))
      .sort((a, b) => b.pnl - a.pnl).slice(0, 5)
    , [analytics])

  const equityCurveData = useMemo(() =>
    analytics.dailyData.map(d => ({ date: d.date, cumulative: Number(d.cumulative.toFixed(2)) }))
    , [analytics])

  const avgRiskReward = useMemo(() => {
    const tradesWithRR = analytics.filteredTrades.filter(t => t.risk_reward_ratio && !isNaN(parseFloat(t.risk_reward_ratio)))
    if (tradesWithRR.length === 0) return analytics.profitFactor
    return tradesWithRR.reduce((sum, t) => sum + parseFloat(t.risk_reward_ratio!), 0) / tradesWithRR.length
  }, [analytics])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ======= HEADER ======= */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Performance insights across {analytics.totalTrades} filtered trades</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <Tabs value={mainTab} onValueChange={setMainTab} className="w-auto">
              <TabsList className="h-8 p-0.5 bg-muted rounded-lg">
                <TabsTrigger value="overview" className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold">
                  <Microscope className="w-3 h-3 mr-1.5" /> Insights
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <DatePickerWithRange date={filters.dateRange} setDate={(date: any) => setFilters({ ...filters, dateRange: date })} />
            <Button
              variant="outline" size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn("h-8 rounded-lg px-3 border-border", showFilters && "bg-primary/10 border-primary/30 text-primary")}
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-semibold">Filters</span>
            </Button>
          </div>
        </header>

        {/* Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Instrument</Label>
                      <Select onValueChange={(v) => setFilters(p => ({ ...p, instruments: v === "all" ? [] : [v] }))}>
                        <SelectTrigger className="h-8 text-xs border-border"><SelectValue placeholder="All Instruments" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Instruments</SelectItem>
                          {Array.from(new Set(trades.map(t => t.instrument))).map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Setup</Label>
                      <Select onValueChange={(v) => setFilters(p => ({ ...p, setups: v === "all" ? [] : [v] }))}>
                        <SelectTrigger className="h-8 text-xs border-border"><SelectValue placeholder="All Setups" /></SelectTrigger>
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

        {/* ======= OVERVIEW TAB ======= */}
        {mainTab === "overview" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* ====== SECTION A: KEY FINANCIAL METRICS ====== */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {/* P&L */}
              <MetricCard
                title="Total P&L"
                icon={DollarSign}
                accentColor={analytics.totalPnL >= 0 ? "emerald" : "rose"}
                value={`${analytics.totalPnL >= 0 ? "+" : ""}$${analytics.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              >
                {equityCurveData.length > 1 && (
                  <div className="h-7 -mx-1 mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={equityCurveData}>
                        <defs>
                          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={analytics.totalPnL >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={analytics.totalPnL >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="cumulative" stroke={analytics.totalPnL >= 0 ? "#10b981" : "#f43f5e"} strokeWidth={1.5} fill="url(#eqGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </MetricCard>

              {/* Win Rate */}
              <MetricCard title="Win Rate" icon={Percent} accentColor="blue" value={`${analytics.winRate.toFixed(1)}%`} subtitle={`${analytics.wins}W / ${analytics.losses}L`}>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(analytics.winRate, 100)}%` }} />
                </div>
              </MetricCard>

              {/* R:R */}
              <MetricCard title="R:R Ratio" icon={Target} accentColor="amber" value={avgRiskReward.toFixed(2)} subtitle={`Profit factor: ${analytics.profitFactor.toFixed(2)}`} />

              {/* Wins */}
              <MetricCard title="Wins" icon={Trophy} accentColor="emerald" value={analytics.wins} subtitle={`of ${analytics.totalTrades} trades`} />

              {/* Losses */}
              <MetricCard title="Losses" icon={XCircle} accentColor="rose" value={analytics.losses} subtitle={`Max DD: $${analytics.maxDrawdown.toFixed(2)}`} />

              {/* Breakeven */}
              <MetricCard title="Breakeven" icon={Minus} accentColor="gray" value={analytics.breakeven} subtitle={`Avg P&L: $${analytics.avgPnL.toFixed(2)}`} />
            </section>


            {/* ====== SECTION B: CALENDAR + HEXAGRAM ====== */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Calendar Heatmap */}
              <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      Trading Calendar
                    </CardTitle>
                    <CardDescription className="text-xs">Daily P&L heatmap - click any day for details</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <RedesignedCalendarHeatmap dailyData={analytics.dailyData} trades={analytics.filteredTrades} />
                </CardContent>
              </Card>

              {/* Trader DNA Hexagram */}
              <Card className="border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm flex flex-col">
                <CardHeader className="pb-2 border-b border-border shrink-0">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        Trader DNA
                      </CardTitle>
                      <CardDescription className="text-xs">Performance hexagram</CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs bg-primary/10 text-primary border-0 font-bold">
                      {analytics.overallScore}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4 min-h-0">
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
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
                </CardContent>
              </Card>
            </section>


            {/* ====== SECTION C: CHARTS ROW ====== */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Strategy Performance */}
              <Card className="border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" /> Strategy Performance
                  </CardTitle>
                  <CardDescription className="text-xs">{"P&L and trade count per strategy"}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[280px] w-full">
                    {strategyPnlData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={strategyPnlData} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.3} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "currentColor", className: "text-muted-foreground" }} angle={-30} textAnchor="end" height={55} />
                          <YAxis yAxisId="pnl" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "currentColor", className: "text-muted-foreground" }} tickFormatter={(val) => `$${val}`} />
                          <YAxis yAxisId="trades" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "currentColor", className: "text-muted-foreground" }} />
                          <RechartsTooltip
                            content={({ active, payload, label }: any) => {
                              if (active && payload && payload.length) {
                                const data = payload[0]?.payload
                                return (
                                  <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl">
                                    <p className="text-xs font-bold mb-2 border-b border-border pb-1 text-foreground">{data?.fullName || label}</p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between gap-4 text-xs">
                                        <span className="text-muted-foreground">{"P&L"}</span>
                                        <span className={cn("font-mono font-bold", data?.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>${data?.pnl?.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between gap-4 text-xs">
                                        <span className="text-muted-foreground">Trades</span>
                                        <span className="font-mono font-bold text-foreground">{data?.trades}</span>
                                      </div>
                                      <div className="flex justify-between gap-4 text-xs">
                                        <span className="text-muted-foreground">Win Rate</span>
                                        <span className="font-mono font-bold text-foreground">{data?.winRate}%</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <ReferenceLine yAxisId="pnl" y={0} stroke="currentColor" className="text-muted-foreground" opacity={0.3} />
                          <Bar yAxisId="pnl" dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={28}>
                            {strategyPnlData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"} fillOpacity={0.85} />
                            ))}
                          </Bar>
                          <Line yAxisId="trades" type="monotone" dataKey="trades" stroke="#818cf8" strokeWidth={2} dot={{ fill: "#818cf8", r: 3 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No strategy data yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top 5 Instruments by P&L */}
              <Card className="border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Top Instruments
                  </CardTitle>
                  <CardDescription className="text-xs">{"Top 5 by P&L with trade volume"}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[280px] w-full">
                    {top5InstrumentData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={top5InstrumentData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-border" opacity={0.3} />
                          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "currentColor", className: "text-muted-foreground" }} tickFormatter={(val) => `$${val}`} />
                          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "currentColor", className: "text-muted-foreground" }} width={65} />
                          <RechartsTooltip
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                const data = payload[0]?.payload
                                return (
                                  <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl">
                                    <p className="text-xs font-bold mb-2 border-b border-border pb-1 text-foreground">{data?.name}</p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between gap-4 text-xs">
                                        <span className="text-muted-foreground">{"P&L"}</span>
                                        <span className={cn("font-mono font-bold", data?.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>${data?.pnl?.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between gap-4 text-xs">
                                        <span className="text-muted-foreground">Volume</span>
                                        <span className="font-mono font-bold text-foreground">{data?.trades} trades</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <ReferenceLine x={0} stroke="currentColor" className="text-muted-foreground" opacity={0.3} />
                          <Bar dataKey="pnl" radius={[0, 4, 4, 0]} maxBarSize={22}>
                            {top5InstrumentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No instrument data yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Outcomes Donut */}
              <Card className="border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" /> Trade Outcomes
                  </CardTitle>
                  <CardDescription className="text-xs">Win / Loss / Breakeven distribution</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[280px] w-full flex flex-col items-center justify-center">
                    <div className="relative w-full h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={outcomeData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" cornerRadius={4}>
                            {outcomeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-extrabold tracking-tighter text-foreground">{analytics.totalTrades}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Trades</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 mt-2">
                      {outcomeData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[10px] font-bold text-muted-foreground">{item.name}</span>
                          <span className="text-[10px] font-mono font-bold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>


            {/* ====== SECTION D: TIMING ANALYTICS ====== */}
            <section>
              <TimingAnalyticsDashboard
                trades={trades}
                className="rounded-xl border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm"
              />
            </section>


            {/* ====== SECTION E: DATA EXPORT ====== */}
            <section>
              <Card className="border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Download className="w-4 h-4 text-primary" /> Export Data
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">Download your filtered trading data</CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {analytics.filteredTrades.length} {analytics.filteredTrades.length === 1 ? "trade" : "trades"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => {
                        const csvContent = [
                          ["Date", "Instrument", "Direction", "Entry", "Exit", "Size", "PnL", "Setup", "Outcome"].join(","),
                          ...analytics.filteredTrades.map(t => [
                            format(new Date(t.date), "yyyy-MM-dd"), t.instrument, t.direction, t.entry_price, t.exit_price, t.size, t.pnl, t.setup_name || "", t.outcome || ""
                          ].join(","))
                        ].join("\n")
                        const blob = new Blob([csvContent], { type: "text/csv" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a"); a.href = url; a.download = `trading-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click()
                        URL.revokeObjectURL(url)
                      }}
                      variant="outline" size="sm" className="gap-2 hover:bg-primary/5 hover:border-primary/50"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </Button>
                    <Button
                      onClick={() => {
                        const jsonContent = JSON.stringify(analytics.filteredTrades, null, 2)
                        const blob = new Blob([jsonContent], { type: "application/json" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a"); a.href = url; a.download = `trading-analytics-${format(new Date(), "yyyy-MM-dd")}.json`; a.click()
                        URL.revokeObjectURL(url)
                      }}
                      variant="outline" size="sm" className="gap-2 hover:bg-primary/5 hover:border-primary/50"
                    >
                      <Download className="w-3.5 h-3.5" /> Export JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

          </div>
        )}


        {/* ======= INTELLIGENCE TAB ======= */}
        {mainTab === "intelligence" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
            <InsightsView trades={analytics.filteredTrades} isLoading={loading} />
          </div>
        )}

      </div>

      {advisorProps && (
        <AdvisorPanel isOpen={isOpen} onClose={closeAdvisor} title={advisorProps.title} type={advisorProps.type} data={advisorProps.data} context={advisorProps.context} />
      )}
    </div>
  )
}
