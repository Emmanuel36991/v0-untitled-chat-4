"use client"

import React, { useState, useEffect, useMemo } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
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
  CheckCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowLeft,
  Layers,
  Shield,
  AlertTriangle,
  Zap,
  Check
} from "lucide-react"
import { getTrades } from "@/app/actions/trade-actions"
import { getAnalyticsData } from "@/app/actions/analytics-actions"
import type { Trade } from "@/types"
import { DateRange } from "react-day-picker"
import { format, subDays, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { useAIAdvisor } from "@/hooks/use-ai-advisor"
import { AdvisorPanel } from "@/components/ai/advisor-panel"
import { EnhancedHexagram } from "@/components/charts/enhanced-hexagram"
import { TimingAnalyticsDashboard } from "@/components/charts/timing-analytics-dashboard"
import { SetupScatterChart } from "@/components/insights/setup-scatter-chart"
import { AiSummaryCard } from "@/components/analytics/ai-summary-card"

// Import Insight Analyzers
import { analyzeSetupPatterns } from "@/lib/insights/setup-analyzer"
import { analyzePsychologyPatterns } from "@/lib/insights/psychology-analyzer"
import { analyzeAndCalculateRisk } from "@/lib/insights/risk-calculator"

// --- OKLCH COLOR PALETTE (Premium Design Spec) ---
const COLORS = {
  // Background Colors
  bgBase: 'oklch(0.96 0.002 264)', // Light mode base
  bgBaseDark: 'oklch(0.08 0.018 264)', // Dark mode base
  cardSurface: 'oklch(0.14 0.025 264)', // Elevated dark surface
  primaryAccent: 'oklch(0.65 0.28 270)', // Vibrant purple-blue

  // Data Visualization - Emerald (Wins/Profit)
  emerald: {
    light: '#10B981',
    medium: '#059669',
    strong: '#047857',
    glow: 'rgba(16, 185, 129, 0.2)',
  },
  // Data Visualization - Rose (Losses/Negative)
  rose: {
    light: '#EF4444',
    medium: '#DC2626',
    strong: '#B91C1C',
    glow: 'rgba(239, 68, 68, 0.2)',
  },
  // Neutral/Info - Slate spectrum
  slate: {
    muted: '#64748B',
    borders: '#334155',
    text: '#94A3B8',
  },
  // Chart 5-Color Palette (OKLCH)
  chartPalette: [
    'oklch(0.70 0.30 270)', // Purple
    'oklch(0.72 0.26 320)', // Magenta
    'oklch(0.74 0.24 200)', // Cyan
    'oklch(0.76 0.22 140)', // Green
    'oklch(0.73 0.28 40)',  // Amber
  ]
}

// --- 1. TYPES ---
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
}

// --- 2. UI COMPONENTS (Light Mode Only) ---

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-white shadow-2xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full w-full border-l border-slate-200 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-xl lg:max-w-4xl p-0",
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-6 top-6 rounded-md p-2 bg-transparent hover:bg-slate-100 transition-colors z-50">
        <X className="h-4 w-4 text-slate-500" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

// --- 3. PREMIUM GLASSMORPHISM TOOLTIP ---
const CustomTooltip = ({ active, payload, label, prefix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[oklch(0.14_0.025_264)]/95 dark:bg-[oklch(0.14_0.025_264)]/98 backdrop-blur-xl border border-slate-300 dark:border-slate-700/70 shadow-2xl dark:shadow-black/60 rounded-xl p-4">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-[0.1em]">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-slate-600 dark:text-slate-300">{entry.name}</span>
            </div>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// --- 4. FIXED DATE PICKER ---
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
            "h-9 w-full justify-start text-left font-normal text-slate-600 hover:bg-slate-50 px-3",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
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
      <PopoverContent className="w-auto p-0 border-0 shadow-xl rounded-xl overflow-hidden ring-1 ring-slate-200" align="start">
        <div className="flex flex-col sm:flex-row bg-white">
          <div className="flex flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50 sm:w-[160px]">
            <div className="px-2 py-1.5 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Select</span>
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
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-white text-slate-600"
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
                day_selected: "bg-blue-600 text-white hover:bg-blue-600 focus:bg-blue-600",
                day_today: "bg-slate-100 text-slate-900",
                day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-blue-900",
              }}
            />
            <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-2 gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-7 text-xs">Cancel</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs font-medium" onClick={() => setOpen(false)}>Apply</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// --- 5. CALENDAR COMPONENTS ---

function DailyDossier({ date, trades }: { date: Date, trades: Trade[] }) {
  const stats = useMemo(() => {
    const pnl = trades.reduce((a, b) => a + b.pnl, 0)
    const wins = trades.filter(t => t.pnl > 0).length
    return {
      pnl,
      count: trades.length,
      winRate: trades.length ? (wins / trades.length) * 100 : 0
    }
  }, [trades])

  if (trades.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
        <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-zinc-800">
          <Layers className="w-8 h-8 opacity-20 text-slate-500 dark:text-zinc-600" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">No trading activity</p>
        <p className="text-xs opacity-60">This day is empty.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn(
          "p-6 rounded-xl border flex flex-col justify-between h-28 shadow-sm transition-all",
          stats.pnl >= 0
            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
            : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30"
        )}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Net PnL</span>
          <span className={cn(
            "text-3xl font-mono font-medium tracking-tight",
            stats.pnl >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
          )}>
            {stats.pnl >= 0 ? "+" : ""}${stats.pnl.toFixed(2)}
          </span>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Win Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-medium text-slate-900 dark:text-zinc-100">{stats.winRate.toFixed(0)}%</span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{stats.count} Trades</span>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Best Setup</span>
          <div className="flex items-center gap-2 mt-auto">
            <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 border-blue-100 dark:border-blue-900/50">
              {trades.length > 0 ? trades.reduce((a, b) => (a.pnl > b.pnl ? a : b)).setup_name || "Discretionary" : "N/A"}
            </Badge>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">Session Log</h3>
        </div>

        <div className="space-y-3 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-px before:bg-slate-200 dark:before:bg-zinc-800">
          {trades.map((trade) => (
            <div key={trade.id} className="relative pl-12 group">
              <div className={cn(
                "absolute left-[15px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-[3px] border-white dark:border-zinc-900 z-10 box-content shadow-sm",
                trade.pnl >= 0 ? "bg-emerald-500" : "bg-rose-500"
              )} />

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs border shadow-sm",
                    trade.direction === "long"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50"
                  )}>
                    {trade.direction === "long" ? "L" : "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">{trade.instrument}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-medium border border-slate-200 dark:border-zinc-700">
                        {trade.setup_name || "No Setup"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{format(new Date(trade.date), "HH:mm:ss")}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className={cn("font-mono font-medium text-sm", trade.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                    {trade.entry_price} → {trade.exit_price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function JournalCalendar({ trades, dailyData }: { trades: Trade[], dailyData: any[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [view, setView] = useState<"month" | "day">("month")

  const monthStats = useMemo(() => {
    const monthKey = format(currentMonth, "yyyy-MM")
    const days = dailyData.filter(d => d.date.startsWith(monthKey))
    const totalPnL = days.reduce((acc, d) => acc + d.pnl, 0)
    const winRate = days.length ? (days.filter(d => d.pnl > 0).length / days.length) * 100 : 0
    return { totalPnL, winRate }
  }, [currentMonth, dailyData])

  const calendarGrid = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    return { days, padding: Array(getDay(start)).fill(null) }
  }, [currentMonth])

  const handleDaySelect = (day: Date) => {
    setSelectedDay(day)
    setView("day")
  }

  const handleBack = () => {
    setView("month")
    setTimeout(() => setSelectedDay(null), 300)
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
      <AnimatePresence mode="wait">

        {view === "month" && (
          <motion.div
            key="month-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-50" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  </Button>
                  <span className="text-sm font-bold w-28 text-center text-slate-800 font-mono">{format(currentMonth, "MMMM yyyy")}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-50" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net PnL</p>
                  <p className={cn("text-sm font-mono font-bold", monthStats.totalPnL >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {monthStats.totalPnL >= 0 ? "+" : ""}${monthStats.totalPnL.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="grid grid-cols-7 gap-3 max-w-5xl mx-auto">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-[10px] uppercase font-bold text-slate-400 pb-2 tracking-wider">{day}</div>
                ))}

                {calendarGrid.padding.map((_, i) => <div key={`pad-${i}`} className="aspect-square" />)}

                {calendarGrid.days.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd")
                  const data = dailyData.find(d => d.date === dateStr)
                  const isToday = isSameDay(day, new Date())

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDaySelect(day)}
                      className={cn(
                        "relative aspect-square rounded-lg border flex flex-col items-center justify-center gap-1 transition-all shadow-sm group",
                        isToday ? "ring-2 ring-indigo-500 ring-offset-2 z-10" : "hover:border-indigo-300 hover:shadow-md",
                        !data ? "bg-white border-slate-100" :
                          data.pnl > 0 ? "bg-emerald-50/30 border-emerald-100" :
                            "bg-rose-50/30 border-rose-100"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] font-bold absolute top-2 left-2",
                        !data ? "text-slate-300" : "text-slate-500"
                      )}>{format(day, "d")}</span>

                      {data ? (
                        <>
                          <span className={cn(
                            "text-xs font-mono font-medium tracking-tight",
                            data.pnl > 0 ? "text-emerald-700" : "text-rose-700"
                          )}>
                            {data.pnl > 0 ? "+" : ""}{Math.abs(data.pnl) >= 1000 ? `${(data.pnl / 1000).toFixed(1)}k` : data.pnl.toFixed(0)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium px-1.5 rounded-full bg-slate-50">
                            {data.trades}
                          </span>
                        </>
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-slate-100 group-hover:bg-indigo-200 transition-colors" />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {view === "day" && selectedDay && (
          <motion.div
            key="day-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-full bg-white"
          >
            <div className="flex items-center gap-4 px-6 py-6 border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <Button variant="ghost" size="sm" onClick={handleBack} className="group pl-2 pr-4 rounded-md hover:bg-slate-100 text-slate-600">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform text-slate-400" />
                Back
              </Button>
              <div className="h-4 w-px bg-slate-200" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {format(selectedDay, "MMMM do, yyyy")}
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <DailyDossier
                date={selectedDay}
                trades={trades.filter(t => isSameDay(new Date(t.date), selectedDay))}
              />
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- 6. METRIC CARDS ---
const MetricCard = React.memo(({ title, value, change, trend, icon: Icon }: any) => {
  const gradientClass = trend === "up"
    ? "bg-gradient-to-br from-emerald-50/50 via-white to-white dark:from-emerald-950/20 dark:via-[oklch(0.14_0.025_264)] dark:to-[oklch(0.14_0.025_264)]"
    : trend === "down"
      ? "bg-gradient-to-br from-rose-50/50 via-white to-white dark:from-rose-950/20 dark:via-[oklch(0.14_0.025_264)] dark:to-[oklch(0.14_0.025_264)]"
      : "bg-gradient-to-br from-slate-50/50 via-white to-white dark:from-slate-950/20 dark:via-[oklch(0.14_0.025_264)] dark:to-[oklch(0.14_0.025_264)]"

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl p-6 shadow-xl dark:shadow-black/40 border border-slate-200 dark:border-slate-700/50 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300",
      gradientClass
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-slate-200 dark:border-zinc-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-all">
          <Icon className="h-5 w-5 text-slate-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm",
            trend === "up" ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50" : "",
            trend === "down" ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50" : "text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700",
          )}>
            {trend === "up" && <ArrowUpRight className="mr-1 h-3 w-3" />}
            {trend === "down" && <ArrowDownRight className="mr-1 h-3 w-3" />}
            {change}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-4xl font-mono font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">{value}</h3>
        <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mt-1.5">{title}</p>
      </div>
    </div>
  )
})

const ChartCard = ({ title, subtitle, children, action, className }: any) => (
  <Card className={cn("flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-lg dark:shadow-black/40 bg-white dark:bg-[oklch(0.14_0.025_264)] rounded-xl", className)}>
    <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-wide uppercase">{title}</CardTitle>
          {subtitle && <CardDescription className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</CardDescription>}
        </div>
      </div>
      {action}
    </CardHeader>
    <CardContent className="flex-1 p-6 relative">{children}</CardContent>
  </Card>
)

const DashboardSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 p-8 space-y-8 animate-pulse">
    <div className="h-16 w-full border-b border-slate-200 dark:border-zinc-800" />
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 max-w-7xl mx-auto mt-8">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-zinc-800 rounded-xl" />)}
    </div>
  </div>
)

// --- 7. MAIN PAGE LOGIC ---

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [confluenceStats, setConfluenceStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [mainTab, setMainTab] = useState("overview")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiReport, setAiReport] = useState<string | null>(null)

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

  const handleGenerateAIReport = () => {
    setIsGeneratingAI(true)
    setTimeout(() => {
      setAiReport("Based on your last 50 trades, your 'Silver Bullet' setup has a 75% win rate in the AM session but drops to 30% in the PM. I recommend implementing a time-based rule to stop trading this setup after 11:00 AM EST. Additionally, your risk of ruin has increased slightly due to larger sizing on losing streaks.")
      setIsGeneratingAI(false)
    }, 2500)
  }

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
      metricsList: []
    }

    if (!trades.length) return emptyStats

    let filteredTrades = trades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Filtering
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

    // Metrics Scores Calculation
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
      metricsList
    }
  }, [trades, filters])

  // Intelligence Analytics
  const setupAnalysis = useMemo(() => analyzeSetupPatterns(trades), [trades])
  const psychologyAnalysis = useMemo(() => analyzePsychologyPatterns(trades), [trades])
  const riskAnalysis = useMemo(() => analyzeAndCalculateRisk(trades), [trades])

  // Prepare Recharts Data
  const scatterData = useMemo(() => {
    const top = setupAnalysis.topSetups || []
    const bottom = setupAnalysis.bottomSetups || []
    return [
      ...top.map(s => ({
        name: s.setupName, x: s.winRate * 100, y: 2, volume: s.totalTrades, pnl: s.totalPnL, winRate: s.winRate * 100, rrr: 2
      })),
      ...bottom.map(s => ({
        name: s.setupName, x: s.winRate * 100, y: 1.2, volume: s.totalTrades, pnl: s.totalPnL, winRate: s.winRate * 100, rrr: 1.2
      }))
    ]
  }, [setupAnalysis])

  const outcomeData = useMemo(() => [
    { name: "Wins", value: analytics.wins, color: "#10b981" },
    { name: "Losses", value: analytics.losses, color: "#ef4444" },
    { name: "Breakeven", value: analytics.breakeven, color: "#94a3b8" }
  ], [analytics])

  const instrumentData = useMemo(() =>
    Object.entries(analytics.instrumentDistribution).map(([key, val]) => ({
      name: key,
      value: val.pnl,
      color: val.pnl >= 0 ? "#10b981" : "#ef4444"
    }))
    , [analytics])

  const setupData = useMemo(() =>
    Object.entries(analytics.setupDistribution).map(([key, val]) => ({
      name: key,
      value: val.count,
      color: "#3b82f6"
    }))
    , [analytics])

  const personalEdge = setupAnalysis.personalEdge

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-[oklch(0.96_0.002_264)] dark:bg-[oklch(0.08_0.018_264)] pb-20 font-sans text-slate-900 dark:text-zinc-100 transition-colors duration-500">

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-[oklch(0.14_0.025_264)]/80 backdrop-blur-lg shadow-sm dark:shadow-black/20">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-600 text-white shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-none">ANALYTICS</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Performance & Insights</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-0.5 shadow-sm">
              <div className="w-[200px] border-r border-slate-100">
                <DatePickerWithRange date={filters.dateRange} setDate={(date: any) => setFilters({ ...filters, dateRange: date })} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "h-9 rounded-md px-3 text-slate-500 hover:text-blue-600 hover:bg-slate-50",
                  showFilters && "bg-slate-100 text-blue-600"
                )}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors rounded-lg shadow-sm">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="p-0 flex flex-col h-full bg-slate-50/50 dark:bg-zinc-950/50">
                <JournalCalendar trades={trades} dailyData={analytics.dailyData} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50"
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
                className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 font-medium text-slate-500 transition-all hover:text-slate-700"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="intelligence"
                className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-violet-600 data-[state=active]:bg-transparent data-[state=active]:text-violet-600 font-medium text-slate-500 transition-all hover:text-slate-700"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Intelligence
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* --- 1. KPI CARDS --- */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Net P&L"
                value={`$${analytics.totalPnL.toLocaleString()}`}
                change={`${analytics.totalPnL > 0 ? "+" : ""}${((analytics.totalPnL / (Math.abs(analytics.totalPnL - 500) || 1)) * 10).toFixed(1)}%`}
                trend={analytics.totalPnL >= 0 ? "up" : "down"}
                icon={DollarSign}
              />
              <MetricCard
                title="Win Rate"
                value={`${analytics.winRate.toFixed(1)}%`}
                change={analytics.winRate > 50 ? "Healthy" : "Weak"}
                trend={analytics.winRate > 50 ? "up" : "down"}
                icon={Target}
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

            {/* --- 2. MAIN CHARTS (RECHARTS) --- */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* EQUITY CURVE */}
              <ChartCard
                title="Equity Curve"
                subtitle="Cumulative Performance"
                className="lg:col-span-2 h-[350px]"
                action={
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600"><Download className="h-4 w-4" /></Button>
                }
              >
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.dailyData}>
                      <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-zinc-800" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(str) => format(new Date(str), "MMM d")}
                        className="fill-slate-500 dark:fill-zinc-500"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        className="fill-slate-500 dark:fill-zinc-500"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorPnL)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* WIN/LOSS DONUT */}
              <ChartCard title="Outcomes" subtitle="Win / Loss Ratio" className="h-[350px]">
                <div className="h-full w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {outcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                    <span className="text-3xl font-mono font-bold text-slate-900">{analytics.totalTrades}</span>
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Trades</span>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* --- 3. BREAKDOWNS (RECHARTS) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="By Instrument" subtitle="P&L Distribution">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={instrumentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <RechartsTooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip prefix="$" />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {instrumentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="By Strategy" subtitle="Setup Frequency">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={setupData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* --- 4. INTELLIGENCE MODULES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-500" />
                    Trader DNA
                  </CardTitle>
                  <Badge variant="outline" className="font-mono text-blue-600 bg-blue-50 border-blue-100">
                    {analytics.overallScore}/100
                  </Badge>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
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

              <TimingAnalyticsDashboard
                trades={trades}
                className="rounded-xl bg-white border border-slate-200 shadow-sm h-full"
              />
            </div>

          </TabsContent>

          {/* --- INTELLIGENCE TAB --- */}
          <TabsContent value="intelligence" className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">

            {/* Header & AI Summary */}
            <div className="space-y-8">
              <div className="relative flex flex-col md:flex-row justify-between items-center p-8 bg-gradient-to-br from-violet-50 via-purple-50/30 to-white dark:from-violet-950/20 dark:via-purple-950/10 dark:to-[oklch(0.14_0.025_264)] rounded-2xl border border-violet-100 dark:border-violet-900/30 shadow-lg overflow-hidden">
                {/* Decorative blur */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    Trading Intelligence
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 ml-14">
                    AI-powered insights and behavioral pattern recognition
                  </p>
                </div>
                <div className="flex gap-3 mt-6 md:mt-0 w-full md:w-auto relative z-10">
                  <Button
                    onClick={handleGenerateAIReport}
                    disabled={isGeneratingAI || !!aiReport}
                    className="w-full md:w-auto bg-violet-600 hover:bg-violet-700 text-white shadow-lg font-semibold px-6"
                  >
                    {isGeneratingAI ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : aiReport ? (
                      <><CheckCircle2 className="mr-2 h-4 w-4" /> Report Ready</>
                    ) : (
                      <><Brain className="mr-2 h-4 w-4" /> Generate Report</>
                    )}
                  </Button>
                </div>
              </div>

              <div className="animate-in slide-in-from-top-2 fade-in duration-500 delay-100">
                <AiSummaryCard />
              </div>

              {aiReport && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-6 bg-white dark:bg-[oklch(0.14_0.025_264)] rounded-xl border border-violet-200 dark:border-violet-900/30 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-purple-600" />
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg shrink-0">
                      <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm uppercase tracking-wide">Executive Summary</h3>
                      <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-sm">
                        {aiReport}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <motion.div
                className="lg:col-span-2 space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Trading DNA
                  </h3>
                </div>

                <Card className="border border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-black/40 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-[oklch(0.14_0.025_264)] dark:via-slate-950/20 dark:to-[oklch(0.14_0.025_264)] overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                  <CardHeader className="pb-6">
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <CardTitle className="text-2xl font-bold">Your Personal Edge</CardTitle>
                        <CardDescription className="text-base mt-2">Highest probability configurations based on historical performance</CardDescription>
                      </div>
                      {personalEdge && (
                        <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 px-3 py-1 text-xs font-semibold">
                          {personalEdge.winRate > 0.6 ? "High Probability" : "Moderate Probability"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 relative z-10">
                    {personalEdge ? (
                      <>
                        <div className="grid grid-cols-3 gap-5">
                          <div className="p-5 bg-white dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-lg transition-shadow">
                            <p className="text-xs text-slate-500 dark:text-zinc-500 mb-2 font-semibold uppercase tracking-wider">Top Setup</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-zinc-100 truncate" title={personalEdge.setupName}>{personalEdge.setupName}</p>
                          </div>
                          <div className="p-5 bg-white dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-lg transition-shadow">
                            <p className="text-xs text-slate-500 dark:text-zinc-500 mb-2 font-semibold uppercase tracking-wider">Win Rate</p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{(personalEdge.winRate * 100).toFixed(1)}%</p>
                          </div>
                          <div className="p-5 bg-white dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-lg transition-shadow">
                            <p className="text-xs text-slate-500 dark:text-zinc-500 mb-2 font-semibold uppercase tracking-wider">Optimal R:R</p>
                            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">1:{personalEdge.optimalRRR.toFixed(1)}</p>
                          </div>
                        </div>

                        <div className="h-[280px] w-full bg-slate-50/50 dark:bg-zinc-900/30 rounded-xl p-5 border border-slate-200 dark:border-zinc-800">
                          <SetupScatterChart data={scatterData} />
                        </div>
                      </>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm">
                        Not enough data to determine edge
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div>
                  <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-3 mb-6">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Psychology
                  </h3>

                  <div className="space-y-5">
                    {/* Good Habits Card */}
                    <Card className="border-2 border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 to-emerald-50/30 dark:from-emerald-950/30 dark:to-emerald-950/10 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Good Habits</span>
                          <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div className="space-y-3">
                          {psychologyAnalysis.goodHabits.slice(0, 2).map((habit, i) => (
                            <div key={i} className="flex justify-between items-center text-sm bg-white/50 dark:bg-zinc-900/30 p-2 rounded-lg">
                              <span className="text-slate-700 dark:text-zinc-300 truncate max-w-[140px] font-medium">{habit.factor}</span>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                {habit.impact >= 0 ? '+' : ''}{habit.impact.toFixed(0)}%
                              </span>
                            </div>
                          ))}
                          {psychologyAnalysis.goodHabits.length === 0 && (
                            <span className="text-xs text-slate-400 dark:text-zinc-500 italic">No good habits logged yet</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bad Habits Card */}
                    <Card className="border-2 border-rose-200 dark:border-rose-800/50 bg-gradient-to-br from-rose-50 to-rose-50/30 dark:from-rose-950/30 dark:to-rose-950/10 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Bad Habits</span>
                          <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                        </div>
                        <div className="space-y-3">
                          {psychologyAnalysis.topKillers.slice(0, 2).map((factor, i) => (
                            <div key={i} className="flex justify-between items-center text-sm bg-white/50 dark:bg-zinc-900/30 p-2 rounded-lg">
                              <span className="text-slate-700 dark:text-zinc-300 truncate max-w-[140px] font-medium">{factor.factor}</span>
                              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-base">{factor.impact.toFixed(0)}%</span>
                            </div>
                          ))}
                          {psychologyAnalysis.topKillers.length === 0 && (
                            <span className="text-xs text-slate-400 dark:text-zinc-500 italic">No bad habits logged yet</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-3 mb-6">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Risk Assessment
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-white dark:bg-zinc-900/50 border-2 border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase font-bold tracking-wider mb-2">Max Drawdown</p>
                        <p className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400">
                          {riskAnalysis.drawdownMetrics.maxDrawdown.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-zinc-900/50 border-2 border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase font-bold tracking-wider mb-2">Kelly Criterion</p>
                        <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                          {riskAnalysis.kellyCriterion.kellyPercent.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* Metrics Strip - Redesigned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-3">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  Performance Metrics
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {analytics.metricsList.map((metric, i) => (
                  <Card key={i} className="border-2 border-slate-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900/50 hover:shadow-xl transition-shadow">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-3">{metric.name}</span>
                      <span className={cn(
                        "text-4xl font-mono font-bold",
                        metric.value >= 70 ? "text-emerald-600 dark:text-emerald-400" : metric.value >= 40 ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"
                      )}>
                        {metric.value.toFixed(0)}
                      </span>
                      <div className={cn(
                        "mt-3 h-1.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800"
                      )}>
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            metric.value >= 70 ? "bg-emerald-500" : metric.value >= 40 ? "bg-amber-500" : "bg-rose-500"
                          )}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Calendar FAB */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-transform hover:scale-105">
              <CalendarIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full h-full p-0 bg-white">
            <div className="px-6 py-6 border-b border-slate-100 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-900">Trading Journal</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <JournalCalendar trades={trades} dailyData={analytics.dailyData} />
            </div>
          </SheetContent>
        </Sheet>
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

