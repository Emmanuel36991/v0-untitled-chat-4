"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
  type ChartOptions,
  type ScriptableContext,
} from "chart.js"
import { Bar, Line, Pie } from "react-chartjs-2"
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
  Zap,
  Calendar as CalendarIcon,
  LayoutDashboard,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Download,
  Brain,
  CheckCircle,
  Award,
  PieChart,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowLeft,
  Search,
  Check,
  Layers,
  Filter,
  Lightbulb,
  Maximize2
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
import { InsightsWindows } from "@/components/insights/insights-windows"
import { AnalyticsLogoSelector } from "@/components/analytics-logos"
import { TimingAnalyticsDashboard } from "@/components/charts/timing-analytics-dashboard"
import { SetupScatterChart } from "@/components/insights/setup-scatter-chart"
import { AiSummaryCard } from "@/components/analytics/ai-summary-card"
import { ConfluencePerformance } from "@/components/analytics/confluence-performance"

// Import Insight Analyzers
import { analyzeSetupPatterns } from "@/lib/insights/setup-analyzer"
import { analyzePsychologyPatterns } from "@/lib/insights/psychology-analyzer"
import { analyzeAndCalculateRisk } from "@/lib/insights/risk-calculator"

// --- 1. CHART.JS REGISTRATION ---
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
)

// --- 2. TYPES ---
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

// --- 3. UI COMPONENTS ---

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
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
        "fixed z-50 gap-4 bg-white dark:bg-[#0B0D12] shadow-2xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full w-full border-l border-slate-200 dark:border-slate-800 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-xl lg:max-w-4xl p-0",
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-6 top-6 rounded-md p-2 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-50">
        <X className="h-4 w-4 text-slate-500" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

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
            "h-9 w-full justify-start text-left font-normal text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-3",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
          {date?.from ? (
            date.to ? (
              <span className="text-xs font-mono">
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
      <PopoverContent className="w-auto p-0 border-0 shadow-xl rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800" align="start">
        <div className="flex flex-col sm:flex-row bg-white dark:bg-[#0B0D12]">
          <div className="flex flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sm:w-[160px]">
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
                       ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                       : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
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
                day_selected: "bg-indigo-600 text-white hover:bg-indigo-600 focus:bg-indigo-600",
                day_today: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100",
                day_range_middle: "aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-900/20 aria-selected:text-indigo-900 dark:aria-selected:text-indigo-100",
              }}
            />
            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 gap-2">
               <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-7 text-xs">Cancel</Button>
               <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs font-medium" onClick={() => setOpen(false)}>Apply</Button>
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
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
          <Layers className="w-8 h-8 opacity-20 text-slate-500" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No trading activity</p>
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
            ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50"
            : "bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50"
        )}>
           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Net PnL</span>
           <span className={cn(
             "text-3xl font-mono font-medium tracking-tight",
             stats.pnl >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
           )}>
             {stats.pnl >= 0 ? "+" : ""}${stats.pnl.toFixed(2)}
           </span>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0D12] shadow-sm flex flex-col justify-between h-28">
           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Win Rate</span>
           <div className="flex items-baseline gap-2">
             <span className="text-3xl font-mono font-medium text-slate-900 dark:text-white">{stats.winRate.toFixed(0)}%</span>
             <span className="text-xs text-slate-400 font-medium">{stats.count} Trades</span>
           </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0D12] shadow-sm flex flex-col justify-between h-28">
           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Best Setup</span>
           <div className="flex items-center gap-2 mt-auto">
             <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900">
                {trades.length > 0 ? trades.reduce((a, b) => (a.pnl > b.pnl ? a : b)).setup_name || "Discretionary" : "N/A"}
             </Badge>
           </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Session Log</h3>
        </div>

        <div className="space-y-3 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
          {trades.map((trade) => (
            <div key={trade.id} className="relative pl-12 group">
              <div className={cn(
                "absolute left-[15px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-[3px] border-white dark:border-[#0B0D12] z-10 box-content shadow-sm",
                trade.pnl >= 0 ? "bg-emerald-500" : "bg-rose-500"
              )} />

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0D12] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs border shadow-sm",
                    trade.direction === "long"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50"
                      : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50"
                  )}>
                    {trade.direction === "long" ? "L" : "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-200">{trade.instrument}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium border border-slate-200 dark:border-slate-700">
                        {trade.setup_name || "No Setup"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{format(new Date(trade.date), "HH:mm:ss")}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className={cn("font-mono font-medium text-sm", trade.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
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
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-[#0B0D12] relative overflow-hidden">
      <AnimatePresence mode="wait">

        {view === "month" && (
          <motion.div
            key="month-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B0D12]/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  </Button>
                  <span className="text-sm font-bold w-28 text-center text-slate-800 dark:text-slate-200 font-mono">{format(currentMonth, "MMMM yyyy")}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
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
                        isToday ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#0B0D12] z-10" : "hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md",
                        !data ? "bg-white dark:bg-[#0B0D12] border-slate-100 dark:border-slate-800" :
                        data.pnl > 0 ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30" :
                        "bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] font-bold absolute top-2 left-2",
                        !data ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                      )}>{format(day, "d")}</span>

                      {data ? (
                        <>
                          <span className={cn(
                            "text-xs font-mono font-medium tracking-tight",
                            data.pnl > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                          )}>
                            {data.pnl > 0 ? "+" : ""}{Math.abs(data.pnl) >= 1000 ? `${(data.pnl/1000).toFixed(1)}k` : data.pnl.toFixed(0)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium px-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50">
                            {data.trades}
                          </span>
                        </>
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-200 transition-colors" />
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
            className="flex flex-col h-full bg-white dark:bg-[#0B0D12]"
          >
            <div className="flex items-center gap-4 px-6 py-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-[#0B0D12]/80 backdrop-blur-md z-10">
              <Button variant="ghost" size="sm" onClick={handleBack} className="group pl-2 pr-4 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform text-slate-400" />
                Back
              </Button>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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
const MetricCard = React.memo(({ title, value, change, trend, icon: Icon }: any) => (
  <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#0B0D12] p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10 transition-colors">
         <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
      </div>
      {change && (
           <div className={cn(
             "flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border",
             trend === "up" ? "text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" : "",
             trend === "down" ? "text-rose-700 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30" : "text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
           )}>
           {trend === "up" && <ArrowUpRight className="mr-1 h-3 w-3" />}
           {trend === "down" && <ArrowDownRight className="mr-1 h-3 w-3" />}
           {change}
         </div>
      )}
    </div>
    <div>
       <h3 className="text-2xl font-mono font-semibold tracking-tight text-slate-900 dark:text-white font-feature-settings-zero">{value}</h3>
       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{title}</p>
    </div>
  </div>
))

const ChartCard = ({ title, subtitle, children, action, className, logoType }: any) => (
  <Card className={cn("flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white dark:bg-[#0B0D12] rounded-xl", className)}>
    <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
      <div className="flex items-center gap-3">
        {logoType && (
          <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800">
             <AnalyticsLogoSelector type={logoType} className="w-4 h-4 text-slate-500" />
          </div>
        )}
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">{title}</CardTitle>
          {subtitle && <CardDescription className="text-xs text-slate-400">{subtitle}</CardDescription>}
        </div>
      </div>
      {action}
    </CardHeader>
    <CardContent className="flex-1 p-6 relative">{children}</CardContent>
  </Card>
)

const DashboardSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50 dark:bg-[#0B0D12] p-8 space-y-8 animate-pulse">
    <div className="h-16 w-full border-b border-slate-200 dark:border-slate-800" />
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 max-w-7xl mx-auto mt-8">
       {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
    </div>
  </div>
)

// --- 7. MAIN PAGE LOGIC ---

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [confluenceStats, setConfluenceStats] = useState<any[]>([]) // Store confluence data
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

  // AI Advisor Hook
  const { openAdvisor, isOpen, close, advisorData } = useAIAdvisor()

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

  // 2. Deep Insights Analytics (Intelligence)
  const setupAnalysis = useMemo(() => analyzeSetupPatterns(trades), [trades])
  const psychologyAnalysis = useMemo(() => analyzePsychologyPatterns(trades), [trades])
  const riskAnalysis = useMemo(() => analyzeAndCalculateRisk(trades), [trades])

  // Prepare Data for Charts (Safe mapping)
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

  // --- CHART OPTIONS ---
  const commonOptions: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: "#0F172A",
            padding: 12,
            cornerRadius: 4,
            titleFont: { family: "monospace", size: 12 },
            bodyFont: { family: "monospace", size: 12 },
            displayColors: false,
            callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${typeof ctx.raw === 'number' ? ctx.raw.toFixed(2) : ctx.raw}`
            }
        }
    },
    scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#94a3b8", font: { family: "monospace", size: 10 } }
        },
        y: {
          border: { display: false, dash: [4, 4] },
          grid: { color: "rgba(148, 163, 184, 0.05)" },
          ticks: { color: "#94a3b8", font: { family: "monospace", size: 10 }, callback: (v) => `$${Number(v).toFixed(0)}` }
        }
    },
  }

  const topSetup = setupAnalysis.topSetups?.[0]
  const bottomSetup = setupAnalysis.bottomSetups?.[0]
  const personalEdge = setupAnalysis.personalEdge

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D12] pb-20 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* --- HEADER: STICKY TOOLBAR --- */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B0D12]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">ANALYTICS</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Performance & Insights</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-sm">
              <div className="w-[200px] border-r border-slate-100 dark:border-slate-800">
                <DatePickerWithRange date={filters.dateRange} setDate={(date: any) => setFilters({ ...filters, dateRange: date })} />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)} 
                className={cn(
                  "h-9 rounded-md px-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800",
                  showFilters && "bg-slate-100 dark:bg-slate-800 text-indigo-600"
                )}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg shadow-sm">
                    <CalendarIcon className="h-4 w-4" />
                 </Button>
               </SheetTrigger>
               <SheetContent className="p-0 flex flex-col h-full bg-slate-50/50 dark:bg-[#0B0D12]/50">
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
              className="overflow-hidden border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0D12]/50"
            >
              <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Instrument</Label>
                    <Select onValueChange={(v) => setFilters(p => ({ ...p, instruments: v === "all" ? [] : [v] }))}>
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 text-xs"><SelectValue placeholder="All Instruments" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Instruments</SelectItem>
                        {Array.from(new Set(trades.map(t => t.instrument))).map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Setup</Label>
                      <Select onValueChange={(v) => setFilters(p => ({ ...p, setups: v === "all" ? [] : [v] }))}>
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 text-xs"><SelectValue placeholder="All Setups" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Setups</SelectItem>
                        {Array.from(new Set(trades.map(t => t.setup_name).filter(Boolean))).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
          
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <TabsList className="bg-transparent p-0 gap-6 h-auto">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 font-medium text-slate-500 transition-all hover:text-slate-700"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="intelligence" 
                className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 font-medium text-slate-500 transition-all hover:text-slate-700"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Intelligence
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* --- 1. KPI CARDS --- */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                icon={BarChart3} 
              />
            </div>

            {/* --- 2. MAIN CHARTS --- */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* EQUITY CURVE */}
              <ChartCard 
                title="Equity Curve" 
                subtitle="Cumulative Performance" 
                className="lg:col-span-2 h-[350px]" 
                logoType="MonthlyProfits"
                action={
                   <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600"><Download className="h-4 w-4" /></Button>
                }
              >
                <div className="h-full w-full">
                  <Line 
                    data={{
                      labels: analytics.dailyData.map((d) => format(new Date(d.date), "MMM dd")),
                      datasets: [{
                          label: "Cumulative P&L",
                          data: analytics.dailyData.map(d => d.cumulative),
                          borderColor: "#6366f1",
                          borderWidth: 2,
                          pointBackgroundColor: "#fff",
                          pointBorderColor: "#6366f1",
                          pointBorderWidth: 2,
                          backgroundColor: (context: ScriptableContext<"line">) => {
                            const ctx = context.chart.ctx
                            const gradient = ctx.createLinearGradient(0, 0, 0, 300)
                            gradient.addColorStop(0, "rgba(99, 102, 241, 0.1)")
                            gradient.addColorStop(1, "rgba(99, 102, 241, 0)")
                            return gradient
                          },
                          fill: true,
                          tension: 0.3,
                          pointRadius: 0,
                          pointHoverRadius: 4,
                      }],
                    }} 
                    options={commonOptions} 
                  />
                </div>
              </ChartCard>

              {/* WIN/LOSS PIE */}
              <ChartCard title="Outcomes" subtitle="Win / Loss Ratio" className="h-[350px]" logoType="WinLoss">
                  <div className="h-full flex flex-col justify-center items-center relative pb-2">
                      <div className="relative w-full h-[200px] flex justify-center items-center">
                        <Pie 
                            data={{
                                labels: ["Win", "Loss", "BE"],
                                datasets: [{
                                    data: [analytics.wins, analytics.losses, analytics.breakeven],
                                    backgroundColor: ["#10b981", "#ef4444", "#94a3b8"],
                                    borderWidth: 2,
                                    borderColor: "#fff",
                                    hoverOffset: 4,
                                }]
                            }}
                            options={{ 
                                maintainAspectRatio: false,
                                cutout: '70%',
                                plugins: { 
                                    legend: { 
                                        position: 'bottom', 
                                        labels: { 
                                          font: { size: 10, family: 'monospace' }, 
                                          usePointStyle: true, 
                                          padding: 15,
                                          color: '#94a3b8' 
                                        } 
                                    } 
                                } 
                            }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                             <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white">{analytics.totalTrades}</span>
                             <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Total</span>
                        </div>
                      </div>
                  </div>
              </ChartCard>
            </div>

            {/* --- 3. BREAKDOWNS & TIMING --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="By Instrument" subtitle="P&L Distribution" logoType="InstrumentDistribution">
                <div className="h-[200px]">
                    <Bar
                    data={{
                        labels: Object.keys(analytics.instrumentDistribution),
                        datasets: [{
                        label: "P&L",
                        data: Object.values(analytics.instrumentDistribution).map((d) => d.pnl),
                        backgroundColor: Object.values(analytics.instrumentDistribution).map((d) => d.pnl >= 0 ? "#10b981" : "#ef4444"),
                        borderRadius: 4,
                        barThickness: 24
                        }],
                    }}
                    options={commonOptions}
                    />
                </div>
                </ChartCard>
                
                <ChartCard title="By Strategy" subtitle="Setup Frequency" logoType="SetupDistribution">
                <div className="h-[200px]">
                    <Bar
                    data={{
                        labels: Object.keys(analytics.setupDistribution),
                        datasets: [{
                        label: "Count",
                        data: Object.values(analytics.setupDistribution).map((d) => d.count),
                        backgroundColor: "#818cf8",
                        borderRadius: 4,
                        barThickness: 24
                        }],
                    }}
                    options={commonOptions}
                    />
                </div>
                </ChartCard>
            </div>

            {/* --- 4. INTELLIGENCE MODULES (Bottom of Overview) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hexagram Score */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0B0D12] overflow-hidden rounded-xl h-full">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-500" />
                      Trader DNA
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900">
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

                {/* Timing Dashboard */}
                <TimingAnalyticsDashboard
                  trades={trades}
                  className="rounded-xl bg-white dark:bg-[#0B0D12] border border-slate-200 dark:border-slate-800 shadow-sm h-full"
                />
            </div>

          </TabsContent>

          {/* --- INTELLIGENCE TAB: COMMAND CENTER DASHBOARD --- */}
          <TabsContent value="intelligence" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
            
            {/* 1. Header & AI Summary */}
            <div className="space-y-6">
              {/* Action Bar */}
              <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-gradient-to-br from-indigo-50 via-white to-white dark:from-indigo-950/20 dark:via-[#0B0D12] dark:to-[#0B0D12] rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Trading Intelligence
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    AI-powered insights and behavioral pattern recognition
                  </p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
                  <Button 
                    onClick={handleGenerateAIReport} 
                    disabled={isGeneratingAI || !!aiReport}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-medium"
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

              {/* AI Summary Card (Moved here) */}
              <div className="animate-in slide-in-from-top-2 fade-in duration-500 delay-100">
                <AiSummaryCard />
              </div>
              
              {/* Executive AI Report Text (If Generated) */}
              {aiReport && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-6 bg-white dark:bg-[#0B0D12] rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg shrink-0">
                       <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">Executive Summary</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                        {aiReport}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 2. BENTO GRID DASHBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COL 1 & 2: PERSONAL EDGE (Featured) */}
              <motion.div 
                className="lg:col-span-2 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4" /> Trading DNA
                  </h3>
                </div>

                {/* Personal Edge Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-[#0F172A] dark:to-[#0B0D12] border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">Your Personal Edge</CardTitle>
                        <CardDescription>Highest probability configurations based on historical performance</CardDescription>
                      </div>
                      {personalEdge && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900">
                          {personalEdge.winRate > 0.6 ? "High Probability" : "Moderate Probability"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-8">
                    {personalEdge ? (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <p className="text-xs text-slate-500 mb-1">Top Setup</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white truncate" title={personalEdge.setupName}>{personalEdge.setupName}</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <p className="text-xs text-slate-500 mb-1">Win Rate</p>
                            <p className="text-lg font-bold text-emerald-600">{(personalEdge.winRate * 100).toFixed(1)}%</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <p className="text-xs text-slate-500 mb-1">Optimal R:R</p>
                            <p className="text-lg font-bold text-indigo-600">1:{personalEdge.optimalRRR.toFixed(1)}</p>
                          </div>
                        </div>
                        
                        {/* Integrated Scatter Chart */}
                        <div className="h-[250px] w-full mt-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800/50">
                           <SetupScatterChart data={scatterData} />
                        </div>
                      </>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
                        Not enough data to determine edge
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* COL 3: PSYCHOLOGY & RISK (Stacked) */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Psychology Section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4" /> Psychology
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Enablers */}
                    <Card className="border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/10 dark:bg-emerald-950/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Edge Enablers</span>
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                          {psychologyAnalysis.topEnablers.slice(0, 2).map((factor, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-slate-700 dark:text-slate-300">{factor.factor}</span>
                              <span className="font-mono font-bold text-emerald-600">+{factor.impact.toFixed(0)}%</span>
                            </div>
                          ))}
                          {psychologyAnalysis.topEnablers.length === 0 && (
                            <span className="text-xs text-slate-400 italic">No positive patterns yet</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Killers */}
                    <Card className="border border-rose-100 dark:border-rose-900/30 bg-rose-50/10 dark:bg-rose-950/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Edge Killers</span>
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                        </div>
                        <div className="space-y-2">
                          {psychologyAnalysis.topKillers.slice(0, 2).map((factor, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-slate-700 dark:text-slate-300">{factor.factor}</span>
                              <span className="font-mono font-bold text-rose-600">{factor.impact.toFixed(0)}%</span>
                            </div>
                          ))}
                          {psychologyAnalysis.topKillers.length === 0 && (
                            <span className="text-xs text-slate-400 italic">No negative patterns yet</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Risk Section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4" /> Risk Assessment
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <CardContent className="p-3">
                        <p className="text-[10px] text-slate-500 uppercase">Max Drawdown</p>
                        <p className="text-lg font-mono font-bold text-rose-600">
                          {riskAnalysis.drawdownMetrics.maxDrawdown.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <CardContent className="p-3">
                        <p className="text-[10px] text-slate-500 uppercase">Kelly Criterion</p>
                        <p className="text-lg font-mono font-bold text-indigo-600">
                          {riskAnalysis.kellyCriterion.kellyPercent.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* 3. METRICS STRIP (Bottom) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }} 
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
               {analytics.metricsList.map((metric, i) => (
                 <Card key={i} className="border-0 shadow-sm bg-slate-50 dark:bg-slate-900/50">
                   <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{metric.name}</span>
                      <span className={cn(
                        "text-xl font-mono font-bold",
                        metric.value >= 70 ? "text-emerald-600" : metric.value >= 40 ? "text-amber-500" : "text-rose-500"
                      )}>
                        {metric.value.toFixed(0)}
                      </span>
                   </CardContent>
                 </Card>
               ))}
            </motion.div>

          </TabsContent>
        </Tabs>
      </main>

      {/* MOBILE CALENDAR FAB */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" className="h-14 w-14 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-transform hover:scale-105">
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

      {/* AI ADVISOR OVERLAY */}
      {advisorData && (
        <AdvisorPanel
          isOpen={isOpen}
          onClose={close}
          title={advisorData.title}
          type={advisorData.type}
          data={advisorData.data}
          context={advisorData.context}
        />
      )}
    </div>
  )
}
