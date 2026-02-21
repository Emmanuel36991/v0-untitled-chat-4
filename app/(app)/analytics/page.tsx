"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
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
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
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
  Check,
  Download,
  BarChart3,
  Brain,
  TrendingUp,
  Activity,
  X,
  AlertTriangle,
  ChevronDown,
  MoreVertical,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { WinRateIcon, PnLIcon, WinIcon, LossIcon, BreakevenIcon, RRRatioIcon } from "@/components/icons/system-icons"
import { getTrades } from "@/app/actions/trade-actions"
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
import { AiSummaryCard } from "@/components/analytics/ai-summary-card"


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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)")
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  // Sync temp state when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setTempDate(date)
    setOpen(isOpen)
  }

  const presets = useMemo(() => [
    { label: "Last 7 Days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "Last 30 Days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: "Last 90 Days", getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
    { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: "This Week", getValue: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
    { label: "Year to Date", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  ], [])

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
                numberOfMonths={isMobile ? 1 : 2}
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
  <div className="w-full min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header: title + tabs + filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted rounded-lg" />
          <div className="h-4 w-64 bg-muted rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-40 bg-muted rounded-lg" />
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-8 w-24 bg-muted rounded-lg" />
        </div>
      </div>
      {/* KPI metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-[120px] bg-muted rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted-foreground/20" />
          </div>
        ))}
      </div>
      {/* Calendar + Hexagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[400px] bg-muted rounded-xl" />
        <div className="h-[400px] bg-muted rounded-xl" />
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-[350px] bg-muted rounded-xl" />)}
      </div>
    </div>
  </div>
)


// --- Animated Number Component (#22) ---
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)
  useEffect(() => {
    const start = prevRef.current
    const end = value
    if (start === end) return
    const duration = 600
    const startTime = performance.now()
    let raf: number
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (end - start) * eased)
      if (progress < 1) {
        raf = requestAnimationFrame(animate)
      } else {
        prevRef.current = end
      }
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>
}

// --- Memoized Sparkline (#5) ---
const MemoizedSparkline = React.memo(function MemoizedSparkline({ data, color }: { data: Array<{ date: string; cumulative: number }>; color: string }) {
  return (
    <div className="h-7 -mx-1 mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="cumulative" stroke={color} strokeWidth={1.5} fill="url(#eqGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})

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
        <div className="flex items-center gap-3">
          <Icon className={cn("w-10 h-10 drop-shadow-sm shrink-0", colors.iconText)} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showTimingSection, setShowTimingSection] = useState(true)
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

  const router = useRouter()
  const pathname = usePathname()
  const filterDrawerRef = useRef<HTMLDivElement>(null)
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  const { openAdvisor, isOpen, closeAdvisor, advisorProps } = useAIAdvisor()

  // --- URL PERSISTENCE: read initial filter state from search params ---
  useEffect(() => {
    const inst = searchParams.get("instruments")
    const setups = searchParams.get("setups")
    const outcomes = searchParams.get("outcomes")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    if (inst || setups || outcomes || from || to) {
      setFilters(prev => ({
        ...prev,
        instruments: inst ? inst.split(",") : prev.instruments,
        setups: setups ? setups.split(",") : prev.setups,
        outcomes: outcomes ? outcomes.split(",") : prev.outcomes,
        dateRange: from ? { from: new Date(from), to: to ? new Date(to) : new Date() } : prev.dateRange,
      }))
    }
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- URL PERSISTENCE: sync filter state to URL search params ---
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.instruments.length) params.set("instruments", filters.instruments.join(","))
    if (filters.setups.length) params.set("setups", filters.setups.join(","))
    if (filters.outcomes.length) params.set("outcomes", filters.outcomes.join(","))
    if (filters.dateRange?.from) params.set("from", format(filters.dateRange.from, "yyyy-MM-dd"))
    if (filters.dateRange?.to) params.set("to", format(filters.dateRange.to, "yyyy-MM-dd"))
    if (mainTab !== "overview") params.set("tab", mainTab)
    const qs = params.toString()
    const newUrl = qs ? `${pathname}?${qs}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [filters, mainTab, pathname, router])

  // --- FILTER DRAWER FOCUS MANAGEMENT ---
  useEffect(() => {
    if (showFilters && filterDrawerRef.current) {
      const firstCheckbox = filterDrawerRef.current.querySelector<HTMLButtonElement>('[role="checkbox"]')
      firstCheckbox?.focus()
    } else if (!showFilters) {
      filterButtonRef.current?.focus()
    }
  }, [showFilters])

  // --- DATA FETCHING ---
  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const tradesData = await getTrades({ limit: 10000, order: "asc" })
      setTrades(tradesData || [])
    } catch (err) {
      console.error("Failed to fetch analytics data", err)
      setError("Failed to load analytics data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- MEMOIZED ANALYTICS ---
  const analytics = useMemo((): ProcessedAnalytics => {
    const emptyStats: ProcessedAnalytics = {
      totalTrades: 0, wins: 0, losses: 0, breakeven: 0, totalPnL: 0, avgPnL: 0, winRate: 0, profitFactor: 0,
      maxDrawdown: 0, consistencyScore: 0, adaptabilityScore: 0, executionScore: 0, riskManagementScore: 0, efficiencyScore: 0, overallScore: 0,
      monthlyData: [], dailyData: [], setupDistribution: {}, instrumentDistribution: {}, outcomeDistribution: { wins: 0, losses: 0, breakeven: 0 },
      metricsList: [], filteredTrades: []
    }
    if (!trades.length) return emptyStats

    // Immutable sort + normalize pnl to finite number once (avoids downstream Number() casts)
    let filteredTrades = [...trades]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(t => ({ ...t, pnl: Number(t.pnl) || 0 }))
    if (filters.dateRange?.from) {
      const from = filters.dateRange.from.getTime()
      const to = filters.dateRange.to ? endOfDay(filters.dateRange.to).getTime() : endOfDay(new Date()).getTime()
      filteredTrades = filteredTrades.filter((t) => { const tTime = new Date(t.date).getTime(); return tTime >= from && tTime <= to })
    }
    if (filters.instruments.length > 0) filteredTrades = filteredTrades.filter((t) => filters.instruments.includes(t.instrument))
    if (filters.setups.length > 0) filteredTrades = filteredTrades.filter((t) => t.setup_name && filters.setups.includes(t.setup_name))
    if (filters.outcomes.length > 0) filteredTrades = filteredTrades.filter((t) => filters.outcomes.includes(t.outcome))
    if (filteredTrades.length === 0) return emptyStats

    // Outcome-first classification: explicit outcome tag takes priority, then fall back to PnL
    const wins = filteredTrades.filter((t) =>
      t.outcome === "win" || (t.outcome !== "loss" && t.outcome !== "breakeven" && t.pnl > 0)
    ).length
    const losses = filteredTrades.filter((t) =>
      t.outcome === "loss" || (t.outcome !== "win" && t.outcome !== "breakeven" && t.pnl < 0)
    ).length
    const breakeven = filteredTrades.length - wins - losses
    const totalPnL = filteredTrades.reduce((sum, t) => sum + t.pnl, 0)
    const grossProfit = filteredTrades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(filteredTrades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
    // When no losses exist, show Infinity symbol rather than an arbitrary cap
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss
    const winRate = (wins / filteredTrades.length) * 100

    const dailyMap = new Map<string, { pnl: number; trades: number }>()
    const monthlyMap = new Map<string, { profit: number; trades: number }>()
    filteredTrades.forEach((t) => {
      const dateStr = format(new Date(t.date), "yyyy-MM-dd")
      const dCurr = dailyMap.get(dateStr) || { pnl: 0, trades: 0 }
      dailyMap.set(dateStr, { pnl: dCurr.pnl + t.pnl, trades: dCurr.trades + 1 })
      const monthStr = format(new Date(t.date), "MMM yyyy")
      const mCurr = monthlyMap.get(monthStr) || { profit: 0, trades: 0 }
      monthlyMap.set(monthStr, { profit: mCurr.profit + t.pnl, trades: mCurr.trades + 1 })
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

    let peak = 0; let maxDD = 0
    dailyData.forEach(day => { if (day.cumulative > peak) peak = day.cumulative; const dd = peak - day.cumulative; if (dd > maxDD) maxDD = dd })
    // Use peak equity as the base for drawdown percentage (avoids arbitrary starting balance)
    const ddPercentage = peak > 0 ? maxDD / peak : (maxDD > 0 ? 1 : 0)
    const riskManagementScore = Math.max(0, Math.min(100, 100 - (ddPercentage * 200)))

    const recentTrades = filteredTrades.filter(t => new Date(t.date) >= subDays(new Date(), 30))
    const recentWinRate = recentTrades.length ? (recentTrades.filter(t => t.pnl > 0).length / recentTrades.length) * 100 : 0
    const adaptabilityScore = Math.max(0, Math.min(100, 70 + (recentWinRate - winRate)))
    const executionScore = Math.max(0, Math.min(100, (winRate - 30) * 2.5))
    const efficiencyScore = Math.max(0, Math.min(100, (isFinite(profitFactor) ? profitFactor : 3) * 33))
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
      { name: "Profit Factor", value: efficiencyScore }, { name: "Risk/Reward", value: Math.min((isFinite(profitFactor) ? profitFactor : 5) * 20, 100) }
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
  // Chart colors use CSS variables for theme-awareness
  const CHART_PROFIT = "var(--color-profit, #10b981)"
  const CHART_LOSS = "var(--color-loss, #f43f5e)"
  const CHART_NEUTRAL = "var(--color-muted-foreground, #6b7280)"
  const CHART_ACCENT = "var(--color-chart-1, #818cf8)"

  const outcomeData = useMemo(() => [
    { name: "Wins", value: analytics.wins, color: CHART_PROFIT },
    { name: "Losses", value: analytics.losses, color: CHART_LOSS },
    { name: "Breakeven", value: analytics.breakeven, color: CHART_NEUTRAL }
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
        color: val.pnl >= 0 ? CHART_PROFIT : CHART_LOSS,
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

  // --- Filter helpers ---
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.instruments.length > 0) count++
    if (filters.setups.length > 0) count++
    if (filters.outcomes.length > 0) count++
    return count
  }, [filters.instruments, filters.setups, filters.outcomes])

  const uniqueInstruments = useMemo(() =>
    Array.from(new Set(trades.map(t => t.instrument))).sort()
  , [trades])

  const uniqueSetups = useMemo(() =>
    Array.from(new Set(trades.map(t => t.setup_name).filter((s): s is string => Boolean(s)))).sort()
  , [trades])

  // #11: Trade counts per filter option (computed from unfiltered trades)
  const instrumentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    trades.forEach(t => { counts[t.instrument] = (counts[t.instrument] || 0) + 1 })
    return counts
  }, [trades])

  const setupCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    trades.forEach(t => { if (t.setup_name) counts[t.setup_name] = (counts[t.setup_name] || 0) + 1 })
    return counts
  }, [trades])

  const outcomeCounts = useMemo(() => {
    const counts: Record<string, number> = { win: 0, loss: 0, breakeven: 0 }
    trades.forEach(t => { if (t.outcome && counts[t.outcome] !== undefined) counts[t.outcome]++ })
    return counts
  }, [trades])

  // #9: Calendar day click handler for cross-filtering
  const handleDayClick = useCallback((dateStr: string) => {
    const clickedDate = new Date(dateStr)
    setFilters(prev => ({
      ...prev,
      dateRange: { from: clickedDate, to: clickedDate },
    }))
  }, [])

  // #16: Check if filters produced empty results while trades exist
  const isFilteredEmpty = analytics.totalTrades === 0 && trades.length > 0

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full border-destructive/30 ring-1 ring-destructive/20">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchData} variant="outline" className="gap-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                  <Brain className="w-3 h-3 mr-1.5" /> Insights
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <DatePickerWithRange date={filters.dateRange} setDate={(date: any) => setFilters({ ...filters, dateRange: date })} />
            <Button
              ref={filterButtonRef}
              variant="outline" size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn("h-8 rounded-lg px-3 border-border", showFilters && "bg-primary/10 border-primary/30 text-primary")}
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-semibold">Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] rounded-full bg-primary text-primary-foreground">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {/* #24: Export dropdown in header */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3 border-border gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
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
                }}>
                  <Download className="w-3.5 h-3.5 mr-2" /> Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const jsonContent = JSON.stringify(analytics.filteredTrades, null, 2)
                  const blob = new Blob([jsonContent], { type: "application/json" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a"); a.href = url; a.download = `trading-analytics-${format(new Date(), "yyyy-MM-dd")}.json`; a.click()
                  URL.revokeObjectURL(url)
                }}>
                  <Download className="w-3.5 h-3.5 mr-2" /> Export JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.instruments.map(i => (
              <Badge key={`inst-${i}`} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
                {i}
                <button onClick={() => setFilters(p => ({ ...p, instruments: p.instruments.filter(x => x !== i) }))} className="ml-0.5 hover:bg-blue-500/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.setups.map(s => (
              <Badge key={`setup-${s}`} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
                {s}
                <button onClick={() => setFilters(p => ({ ...p, setups: p.setups.filter(x => x !== s) }))} className="ml-0.5 hover:bg-amber-500/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.outcomes.map(o => (
              <Badge key={`out-${o}`} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                {o}
                <button onClick={() => setFilters(p => ({ ...p, outcomes: p.outcomes.filter(x => x !== o) }))} className="ml-0.5 hover:bg-emerald-500/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <button
              onClick={() => setFilters(p => ({ ...p, instruments: [], setups: [], outcomes: [] }))}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <Card className="border-border bg-card">
                <CardContent className="p-4" ref={filterDrawerRef}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filter Trades</span>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground px-2" onClick={() => setFilters(p => ({ ...p, instruments: [], setups: [], outcomes: [] }))}>
                        Reset All
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {/* Instruments — multi-select checkboxes */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Instruments</Label>
                      <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1">
                        {uniqueInstruments.map(inst => (
                          <label key={inst} className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                            <Checkbox
                              checked={filters.instruments.includes(inst)}
                              onCheckedChange={(checked) => {
                                setFilters(p => ({
                                  ...p,
                                  instruments: checked
                                    ? [...p.instruments, inst]
                                    : p.instruments.filter(x => x !== inst)
                                }))
                              }}
                            />
                            <span className="text-xs font-medium text-foreground">{inst}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{instrumentCounts[inst] || 0}</span>
                          </label>
                        ))}
                        {uniqueInstruments.length === 0 && <p className="text-xs text-muted-foreground py-2">No instruments found</p>}
                      </div>
                    </div>
                    {/* Setups — multi-select checkboxes */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Setups</Label>
                      <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1">
                        {uniqueSetups.map(setup => (
                          <label key={setup} className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                            <Checkbox
                              checked={filters.setups.includes(setup)}
                              onCheckedChange={(checked) => {
                                setFilters(p => ({
                                  ...p,
                                  setups: checked
                                    ? [...p.setups, setup]
                                    : p.setups.filter(x => x !== setup)
                                }))
                              }}
                            />
                            <span className="text-xs font-medium text-foreground">{setup}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{setupCounts[setup] || 0}</span>
                          </label>
                        ))}
                        {uniqueSetups.length === 0 && <p className="text-xs text-muted-foreground py-2">No setups found</p>}
                      </div>
                    </div>
                    {/* Outcomes — multi-select checkboxes */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Outcome</Label>
                      <div className="space-y-1">
                        {(["win", "loss", "breakeven"] as const).map(outcome => (
                          <label key={outcome} className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                            <Checkbox
                              checked={filters.outcomes.includes(outcome)}
                              onCheckedChange={(checked) => {
                                setFilters(p => ({
                                  ...p,
                                  outcomes: checked
                                    ? [...p.outcomes, outcome]
                                    : p.outcomes.filter(x => x !== outcome)
                                }))
                              }}
                            />
                            <span className="text-xs font-medium text-foreground capitalize">{outcome}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{outcomeCounts[outcome] || 0}</span>
                          </label>
                        ))}
                      </div>
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

            {/* #16: Empty filter state */}
            {isFilteredEmpty && (
              <Card className="border-dashed border-2 border-muted-foreground/20">
                <CardContent className="p-8 text-center space-y-3">
                  <Filter className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <h3 className="text-sm font-bold text-foreground">No trades match your filters</h3>
                  <p className="text-xs text-muted-foreground">Try adjusting your date range, instruments, or outcome filters.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, instruments: [], setups: [], outcomes: [], dateRange: { from: subDays(new Date(), 90), to: new Date() } }))}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isFilteredEmpty && <>
            {/* ====== SECTION A: KEY FINANCIAL METRICS ====== */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {/* P&L */}
              <MetricCard
                title="Total P&L"
                icon={PnLIcon}
                accentColor={analytics.totalPnL >= 0 ? "emerald" : "rose"}
                value={<>{analytics.totalPnL >= 0 ? "+" : ""}$<AnimatedNumber value={analytics.totalPnL} decimals={2} /></>}
              >
                {equityCurveData.length > 1 && (
                  <MemoizedSparkline data={equityCurveData} color={analytics.totalPnL >= 0 ? CHART_PROFIT : CHART_LOSS} />
                )}
              </MetricCard>

              {/* Win Rate */}
              <MetricCard title="Win Rate" icon={WinRateIcon} accentColor="blue" value={<><AnimatedNumber value={analytics.winRate} suffix="%" decimals={1} /></>} subtitle={`${analytics.wins}W / ${analytics.losses}L`}>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(analytics.winRate, 100)}%` }} />
                </div>
              </MetricCard>

              {/* R:R — profitFactor capped at 5 for the hexagram display; Infinity is safe since isFinite check handles it */}
              <MetricCard title="R:R Ratio" icon={RRRatioIcon} accentColor="amber" value={avgRiskReward.toFixed(2)} subtitle={`Profit factor: ${isFinite(analytics.profitFactor) ? analytics.profitFactor.toFixed(2) : "∞ (no losses)"}`} />

              {/* Wins */}
              <MetricCard title="Wins" icon={WinIcon} accentColor="emerald" value={<AnimatedNumber value={analytics.wins} />} subtitle={`of ${analytics.totalTrades} trades`} />

              {/* Losses */}
              <MetricCard title="Losses" icon={LossIcon} accentColor="rose" value={<AnimatedNumber value={analytics.losses} />} subtitle={`Max DD: $${analytics.maxDrawdown.toFixed(2)}`} />

              {/* Breakeven */}
              <MetricCard title="Breakeven" icon={BreakevenIcon} accentColor="gray" value={<AnimatedNumber value={analytics.breakeven} />} subtitle={`Avg P&L: $${analytics.avgPnL.toFixed(2)}`} />
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
                  <RedesignedCalendarHeatmap dailyData={analytics.dailyData} trades={analytics.filteredTrades} onDayClick={handleDayClick} />
                </CardContent>
              </Card>

              {/* Trader DNA Hexagram */}
              <Card className="border-0 shadow-sm ring-1 ring-border bg-card/60 backdrop-blur-sm flex flex-col card-enhanced glass-card">
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
            <motion.section
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Strategy Performance */}
              <Card className="border-0 shadow-sm ring-1 ring-border bg-card/60 backdrop-blur-sm card-enhanced glass-card">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Strategy Performance
                  </CardTitle>
                  <CardDescription className="text-xs">{"P&L and trade count per strategy"}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[280px] w-full" role="img" aria-label={`Strategy performance chart: ${strategyPnlData.length} strategies, showing P&L and trade count`}>
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
                              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? CHART_PROFIT : CHART_LOSS} fillOpacity={0.85} />
                            ))}
                          </Bar>
                          <Line yAxisId="trades" type="monotone" dataKey="trades" stroke={CHART_ACCENT} strokeWidth={2} dot={{ fill: CHART_ACCENT, r: 3 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No strategy data yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top 5 Instruments by P&L */}
              <Card className="border-0 shadow-sm ring-1 ring-border bg-card/60 backdrop-blur-sm card-enhanced glass-card">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Top Instruments
                  </CardTitle>
                  <CardDescription className="text-xs">{"Top 5 by P&L with trade volume"}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[280px] w-full" role="img" aria-label={`Top ${top5InstrumentData.length} instruments by P&L`}>
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
              <Card className="border-0 shadow-sm ring-1 ring-border bg-card/60 backdrop-blur-sm card-enhanced glass-card">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" /> Trade Outcomes
                  </CardTitle>
                  <CardDescription className="text-xs">Win / Loss / Breakeven distribution</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[280px] w-full flex flex-col items-center justify-center" role="img" aria-label={`Trade outcomes: ${analytics.wins} wins, ${analytics.losses} losses, ${analytics.breakeven} breakeven out of ${analytics.totalTrades} total trades`}>
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
            </motion.section>

            {/* #17: Visually-hidden accessible data table */}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors font-medium py-1">View chart data as table</summary>
              <div className="overflow-x-auto mt-2 rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Strategy</th>
                      <th className="px-3 py-2 font-semibold text-right">P&L</th>
                      <th className="px-3 py-2 font-semibold text-right">Trades</th>
                      <th className="px-3 py-2 font-semibold text-right">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategyPnlData.map(s => (
                      <tr key={s.fullName} className="border-t border-border">
                        <td className="px-3 py-1.5">{s.fullName}</td>
                        <td className={cn("px-3 py-1.5 text-right font-mono", s.pnl >= 0 ? "text-emerald-600" : "text-rose-600")}>${s.pnl.toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-right">{s.trades}</td>
                        <td className="px-3 py-1.5 text-right">{s.winRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>


            {/* ====== SECTION D: TIMING ANALYTICS (collapsible) ====== */}
            <section>
              <button
                onClick={() => setShowTimingSection(prev => !prev)}
                className="w-full flex items-center justify-between p-4 rounded-xl border-0 shadow-sm ring-1 ring-border bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-bold text-foreground">Timing Analytics</h2>
                    <p className="text-xs text-muted-foreground">Duration and entry time performance breakdown</p>
                  </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", showTimingSection && "rotate-180")} />
              </button>
              <AnimatePresence>
                {showTimingSection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, opacity: { delay: 0.1, duration: 0.2 } }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2">
                      <TimingAnalyticsDashboard
                        trades={analytics.filteredTrades}
                        className="rounded-xl border-0 shadow-sm ring-1 ring-border bg-card/60 backdrop-blur-sm card-enhanced glass-card"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* ====== SECTION D2: AI PERFORMANCE REPORT ====== */}
            <section>
              <AiSummaryCard />
            </section>

            </>}
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
