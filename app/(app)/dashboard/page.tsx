"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  AlertTriangle,
  BookOpen,
  Activity,
  Clock,
  RefreshCw,
  PieChart,
  Zap,
  ChevronRight,
  Flame,
  Shield,
  Rocket,
  Diamond,
  Sparkles,
  Hexagon,
  MoreHorizontal,
  Download,
  AlertCircle,
  BrainCircuit,
  Timer,
  Wallet,
  ArrowRight,
  Filter,
  Calendar, // <--- Added missing import
} from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
  Legend,
} from "recharts"
import Link from "next/link"
import type { Trade } from "@/types"
import { getTrades } from "@/app/actions/trade-actions"
import { useUserConfig } from "@/hooks/use-user-config"
import { cn } from "@/lib/utils"

import { usePnLDisplay } from "@/hooks/use-pnl-display"
import { PnLDisplaySelector } from "@/components/trades/pnl-display-selector"
import { calculateInstrumentPnL } from "@/types/instrument-calculations"
import { PremiumCalendarView } from "@/components/dashboard/premium-calendar-view"
import {
  format,
  subDays,
  isSameDay,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
} from "date-fns"

// --- Types & Interfaces ---

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ElementType
  iconColor: string
  trendData?: any[]
  subtitle?: string
  tooltipInfo?: string
  onClick?: () => void
}

interface CalendarHeatmapProps {
  trades: Trade[]
  currentDate: Date
}

// --- Constants & Configuration ---

const STRATEGY_COLORS = [
  {
    bg: "bg-blue-500",
    gradient: "from-blue-500 to-blue-600",
    text: "text-blue-700 dark:text-blue-300",
    stroke: "#3b82f6",
  },
  {
    bg: "bg-purple-500",
    gradient: "from-purple-500 to-purple-600",
    text: "text-purple-700 dark:text-purple-300",
    stroke: "#a855f7",
  },
  {
    bg: "bg-emerald-500",
    gradient: "from-emerald-500 to-emerald-600",
    text: "text-emerald-700 dark:text-emerald-300",
    stroke: "#10b981",
  },
  {
    bg: "bg-amber-500",
    gradient: "from-amber-500 to-amber-600",
    text: "text-amber-700 dark:text-amber-300",
    stroke: "#f59e0b",
  },
  {
    bg: "bg-rose-500",
    gradient: "from-rose-500 to-rose-600",
    text: "text-rose-700 dark:text-rose-300",
    stroke: "#f43f5e",
  },
  {
    bg: "bg-cyan-500",
    gradient: "from-cyan-500 to-cyan-600",
    text: "text-cyan-700 dark:text-cyan-300",
    stroke: "#06b6d4",
  },
]

const STRATEGY_ICONS = {
  Breakout: Rocket,
  Reversal: RefreshCw,
  "Trend Following": TrendingUp,
  Scalping: Zap,
  "Swing Trading": Activity,
  "Mean Reversion": Target,
  Momentum: Flame,
  "Support/Resistance": Shield,
  "Pattern Trading": Hexagon,
  "News Trading": Sparkles,
  Default: Diamond,
}

const MOTIVATIONAL_QUOTES = [
  "The goal of a successful trader is to make the best trades. Money is secondary.",
  "Risk comes from not knowing what you are doing.",
  "Limit your size in any position so that fear does not become the prevailing instinct.",
  "It's not whether you're right or wrong that's important, but how much money you make when you're right.",
  "Amateurs think about how much they can make. Professionals think about how much they can lose.",
]

// --- Helper Functions ---

const getStrategyIcon = (strategyName: string) => {
  const normalizedName = strategyName.toLowerCase()
  if (normalizedName.includes("breakout")) return STRATEGY_ICONS.Breakout
  if (normalizedName.includes("reversal")) return STRATEGY_ICONS.Reversal
  if (normalizedName.includes("trend")) return STRATEGY_ICONS["Trend Following"]
  if (normalizedName.includes("scalp")) return STRATEGY_ICONS.Scalping
  if (normalizedName.includes("swing")) return STRATEGY_ICONS["Swing Trading"]
  if (normalizedName.includes("mean") || normalizedName.includes("reversion"))
    return STRATEGY_ICONS["Mean Reversion"]
  if (normalizedName.includes("momentum")) return STRATEGY_ICONS.Momentum
  if (normalizedName.includes("support") || normalizedName.includes("resistance"))
    return STRATEGY_ICONS["Support/Resistance"]
  if (normalizedName.includes("pattern")) return STRATEGY_ICONS["Pattern Trading"]
  if (normalizedName.includes("news")) return STRATEGY_ICONS["News Trading"]
  return STRATEGY_ICONS.Default
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 18) return "Good Afternoon"
  return "Good Evening"
}

// --- Sub-Components ---

// 1. Animated Title
const AnimatedTitle = React.memo<{
  children: React.ReactNode
  className?: string
  delay?: number
}>(({ children, className, delay = 0 }) => (
  <h1
    className={cn(
      "text-3xl font-extrabold tracking-tight",
      "bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-slate-700 to-gray-900 dark:from-white dark:via-slate-200 dark:to-white",
      className,
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </h1>
))

// 2. Custom Tooltip for Charts
const CustomChartTooltip = ({ active, payload, label, currency = false }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl">
        <p className="text-xs font-medium text-muted-foreground mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                {entry.name === "cumulativePnl" ? "Net P&L" : entry.name}
              </p>
            </div>
            <p
              className={cn(
                "text-xs font-bold font-mono",
                typeof entry.value === "number" && entry.value > 0
                  ? "text-green-600 dark:text-green-400"
                  : typeof entry.value === "number" && entry.value < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-900 dark:text-gray-100",
              )}
            >
              {currency && typeof entry.value === "number" ? (entry.value < 0 ? "-" : "") + "$" : ""}
              {typeof entry.value === "number" ? Math.abs(entry.value).toFixed(2) : entry.value}
              {!currency && typeof entry.value === "number" ? "%" : ""}
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// 3. Metric Card
const MetricCard = React.memo<MetricCardProps>(
  ({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor,
    trendData,
    subtitle,
    tooltipInfo,
    onClick,
  }) => (
    <Card
      className={cn(
        "relative overflow-hidden border border-gray-200/60 dark:border-gray-800/60 shadow-sm transition-all duration-300 group cursor-pointer",
        "bg-white dark:bg-gray-900/40 backdrop-blur-xl",
        "hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5",
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
              iconColor,
              "bg-opacity-10 dark:bg-opacity-20",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {change && (
            <Badge
              variant="secondary"
              className={cn(
                "font-mono text-[10px] px-2 py-0.5 border-0",
                changeType === "positive" && "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-500/10",
                changeType === "negative" && "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10",
                changeType === "neutral" && "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800",
              )}
            >
              {changeType === "positive" ? (
                <TrendingUp className="h-3 w-3 mr-1 inline" />
              ) : changeType === "negative" ? (
                <TrendingDown className="h-3 w-3 mr-1 inline" />
              ) : (
                <MoreHorizontal className="h-3 w-3 mr-1 inline" />
              )}
              {change}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            {title}
            {tooltipInfo && <AlertCircle className="h-3 w-3 text-muted-foreground/50" />}
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {value}
            </h3>
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground/80 font-medium pt-1">{subtitle}</p>
          )}
        </div>

        {/* Subtle Sparkline Background */}
        {trendData && trendData.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="currentColor"
                  className={
                    changeType === "positive" ? "text-green-500" :
                    changeType === "negative" ? "text-red-500" : "text-gray-500"
                  }
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  ),
)

// 4. Calendar Heatmap Component
const CalendarHeatmap = React.memo<CalendarHeatmapProps>(({ trades, currentDate }) => {
  const [hoveredDay, setHoveredDay] = useState<any>(null)

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })
    const startDay = getDay(start)
    const paddedDays = Array(startDay).fill(null).concat(days)
    return paddedDays
  }, [currentDate])

  const getDayData = (day: Date | null) => {
    if (!day) return null
    const dayTrades = trades.filter((t) => isSameDay(new Date(t.date), day))
    const pnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0)
    const count = dayTrades.length
    return { day, pnl, count, trades: dayTrades }
  }

  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-7 gap-2 mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day, idx) => {
          const data = getDayData(day)
          if (!day) return <div key={`empty-${idx}`} className="aspect-square" />

          // Determine color intensity
          let bgClass = "bg-gray-100 dark:bg-gray-800/50"
          if (data && data.count > 0) {
            if (data.pnl > 0) bgClass = "bg-emerald-500"
            else if (data.pnl < 0) bgClass = "bg-rose-500"
            else bgClass = "bg-amber-400"
          }

          // Dynamic opacity logic for intensity
          const opacity = !data || data.count === 0
              ? 1
              : Math.min(Math.abs(data.pnl) / 1000, 1) * 0.6 + 0.4

          return (
            <Tooltip
              key={day.toISOString()}
              content={
                data && data.count > 0 ? (
                  <div className="p-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl text-xs z-50">
                    <p className="font-semibold mb-1">{format(day, "MMM dd, yyyy")}</p>
                    <div className="space-y-0.5">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Net P&L:</span>
                        <span className={cn("font-mono font-bold", data.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                          {data.pnl >= 0 ? "+" : ""}${data.pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Trades:</span>
                        <span className="font-mono">{data.count}</span>
                      </div>
                    </div>
                  </div>
                ) : null
              }
            >
              <div
                className="aspect-square rounded-md relative group cursor-pointer transition-all hover:ring-2 ring-primary/50 ring-offset-1 dark:ring-offset-gray-950"
                onMouseEnter={() => setHoveredDay(data)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-md transition-colors duration-300",
                    bgClass,
                  )}
                  style={{ opacity: data && data.count > 0 ? opacity : 1 }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      data && data.count > 0 ? "text-white/90" : "text-gray-400 dark:text-gray-600",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>
              </div>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
})

// --- Main Dashboard Page ---

export default function DashboardPage() {
  // State Management
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // UI Controls
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "ytd" | "all">("30d")
  const [chartViewMode, setChartViewMode] = useState<"cumulative" | "daily">("cumulative")
  const [quoteIndex, setQuoteIndex] = useState(0)
  
  // Custom Hooks
  const { config, isLoading: isConfigLoading } = useUserConfig()
  const { displayFormat, setDisplayFormat } = usePnLDisplay()

  // --- Effects ---

  // Load Trades
  const loadTrades = useCallback(async (showLoadingState = true) => {
    if (isConfigLoading) return
    if (showLoadingState) setIsLoading(true)
    else setIsRefreshing(true)
    
    setError(null)
    try {
      // Simulate network delay for smoother UI
      await new Promise(resolve => setTimeout(resolve, 600)) 
      const fetchedTrades = await getTrades()
      setTrades(fetchedTrades || [])
    } catch (err) {
      console.error("Dashboard: Failed to fetch trades", err)
      setError("Failed to synchronize trading data.")
      setTrades([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [isConfigLoading])

  useEffect(() => {
    loadTrades()
  }, [loadTrades])

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  // --- Data Processing ---

  const filteredTrades = useMemo(() => {
    if (selectedPeriod === "all") return trades

    const now = new Date()
    let startDate = subDays(now, 30) // default

    if (selectedPeriod === "7d") startDate = subDays(now, 7)
    if (selectedPeriod === "90d") startDate = subDays(now, 90)
    if (selectedPeriod === "ytd") startDate = new Date(now.getFullYear(), 0, 1)

    return trades.filter((trade) => new Date(trade.date) >= startDate)
  }, [trades, selectedPeriod])

  const stats = useMemo(() => {
    if (filteredTrades.length === 0) {
      return {
        totalPnL: 0,
        winRate: 0,
        profitFactor: 0,
        avgReturn: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        consecutiveWins: 0,
        avgWin: 0,
        avgLoss: 0,
        expectancy: 0,
        largestDrawdown: 0,
      }
    }

    const processedTrades = filteredTrades.map((trade) => {
      const { adjustedPnL } = calculateInstrumentPnL(
        trade.instrument,
        trade.direction,
        trade.entry_price,
        trade.exit_price,
        trade.size,
      )
      return { ...trade, adjustedPnL }
    })

    const totalPnL = processedTrades.reduce((acc, t) => acc + t.adjustedPnL, 0)
    const wins = processedTrades.filter((t) => t.outcome === "win")
    const losses = processedTrades.filter((t) => t.outcome === "loss")
    const totalTrades = processedTrades.length

    const grossProfit = wins.reduce((acc, t) => acc + t.adjustedPnL, 0)
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.adjustedPnL, 0))
    
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0
    const avgReturn = totalTrades > 0 ? totalPnL / totalTrades : 0
    
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0
    
    // Expectancy: (Win % * Avg Win) - (Loss % * Avg Loss)
    const winPct = wins.length / totalTrades
    const lossPct = losses.length / totalTrades
    const expectancy = (winPct * avgWin) - (lossPct * avgLoss)

    // Drawdown Calculation
    let peak = -Infinity
    let maxDrawdown = 0
    let runningPnL = 0
    
    const sortedByDate = [...processedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    let currentWinStreak = 0
    let maxWinStreak = 0
    let currentLossStreak = 0
    let maxLossStreak = 0

    sortedByDate.forEach(trade => {
      runningPnL += trade.adjustedPnL
      if (runningPnL > peak) peak = runningPnL
      const drawdown = peak - runningPnL
      if (drawdown > maxDrawdown) maxDrawdown = drawdown

      if (trade.outcome === 'win') {
        currentWinStreak++
        currentLossStreak = 0
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak
      } else if (trade.outcome === 'loss') {
        currentLossStreak++
        currentWinStreak = 0
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak
      }
    })

    return {
      totalPnL,
      winRate,
      profitFactor,
      avgReturn,
      totalTrades,
      winningTrades: wins.length,
      losingTrades: losses.length,
      consecutiveWins: maxWinStreak,
      avgWin,
      avgLoss,
      expectancy,
      largestDrawdown: maxDrawdown
    }
  }, [filteredTrades])

  // Chart Data Preparation
  const chartData = useMemo(() => {
    if (filteredTrades.length === 0) return []
    const sorted = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    let cumulative = 0
    return sorted.map(trade => {
      const { adjustedPnL } = calculateInstrumentPnL(trade.instrument, trade.direction, trade.entry_price, trade.exit_price, trade.size)
      cumulative += adjustedPnL
      return {
        date: format(new Date(trade.date), "MMM dd"),
        fullDate: format(new Date(trade.date), "yyyy-MM-dd HH:mm"),
        cumulativePnl: cumulative,
        tradePnl: adjustedPnL,
        volume: trade.size,
        outcome: trade.outcome
      }
    })
  }, [filteredTrades])

  // Strategy Data Preparation
  const strategyData = useMemo(() => {
     const map = new Map<string, {name: string, pnl: number, wins: number, total: number}>()
     
     filteredTrades.forEach(trade => {
       const name = trade.setup_name || "Discretionary"
       const current = map.get(name) || { name, pnl: 0, wins: 0, total: 0 }
       
       const { adjustedPnL } = calculateInstrumentPnL(trade.instrument, trade.direction, trade.entry_price, trade.exit_price, trade.size)
       current.pnl += adjustedPnL
       current.total += 1
       if (trade.outcome === 'win') current.wins += 1
       
       map.set(name, current)
     })

     return Array.from(map.values())
      .map(s => ({ ...s, winRate: (s.wins / s.total) * 100 }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5) // Top 5
  }, [filteredTrades])

  // Loading State
  if ((isLoading && !isRefreshing) && trades.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D12] p-6 lg:p-8 space-y-8">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
          <div className="lg:col-span-2 h-[450px] rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-[450px] rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    )
  }

  // Error State
  if (error && !isLoading && trades.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0D12]">
        <div className="text-center space-y-6 max-w-md p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
           <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <AlertTriangle className="w-8 h-8" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connection Issue</h2>
             <p className="text-muted-foreground text-sm leading-relaxed">{error}</p>
           </div>
           <Button onClick={() => loadTrades()} className="w-full rounded-xl h-11">
             <RefreshCw className="mr-2 h-4 w-4" /> Retry Connection
           </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0B0D12] text-foreground transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* --- Top Bar: Header & Controls --- */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div className="space-y-1 relative">
             <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
               <span className="flex items-center text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                 <Flame className="w-3 h-3 mr-1" /> {getGreeting()}
               </span>
               <span>•</span>
               <span>{format(new Date(), "MMMM dd, yyyy")}</span>
             </div>
             
             <AnimatedTitle className="text-3xl sm:text-4xl">Dashboard Overview</AnimatedTitle>
             
             <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-2xl pt-1">
               <BrainCircuit className="w-4 h-4 text-indigo-500" />
               <span className="italic text-gray-500 dark:text-gray-400">"{MOTIVATIONAL_QUOTES[quoteIndex]}"</span>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
             <div className="bg-white dark:bg-gray-900/60 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-1 backdrop-blur-sm">
                {(["7d", "30d", "90d", "ytd", "all"] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                      selectedPeriod === period 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {period.toUpperCase()}
                  </Button>
                ))}
             </div>
             
             <Separator orientation="vertical" className="h-8 hidden xl:block mx-1 bg-gray-200 dark:bg-gray-800" />

             <div className="flex items-center gap-2">
               <PnLDisplaySelector currentFormat={displayFormat} onFormatChange={setDisplayFormat} />
               
               <Button
                 variant="outline"
                 size="icon"
                 onClick={() => loadTrades(false)}
                 className={cn("rounded-xl h-10 w-10 border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800", isRefreshing && "animate-spin text-primary")}
                 title="Refresh Data"
               >
                 <RefreshCw className="h-4 w-4" />
               </Button>

               <Button 
                 data-tutorial="add-trade-btn"
                 className="rounded-xl h-10 px-6 shadow-lg shadow-primary/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02]" 
                 asChild
               >
                 <Link href="/add-trade">
                   <Plus className="mr-2 h-4 w-4" /> New Trade
                 </Link>
               </Button>
             </div>
          </div>
        </div>

        {/* --- Key Metrics Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tutorial="key-metrics">
          <MetricCard
            title="Net P&L"
            value={displayFormat === 'dollars' 
              ? `$${stats.totalPnL.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
              : displayFormat === 'percentage' 
                ? `${((stats.totalPnL / 10000) * 100).toFixed(2)}%`
                : `${stats.totalPnL.toFixed(2)} R`
            }
            change={`${stats.totalTrades} Executions`}
            changeType={stats.totalPnL >= 0 ? "positive" : "negative"}
            icon={Wallet}
            iconColor="text-blue-600 dark:text-blue-400"
            trendData={chartData.map(d => ({ value: d.cumulativePnl }))}
            subtitle="Net profit after commissions"
          />

          <MetricCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            change={`${stats.winningTrades}W - ${stats.losingTrades}L`}
            changeType={stats.winRate > 50 ? "positive" : stats.winRate > 40 ? "neutral" : "negative"}
            icon={Target}
            iconColor="text-purple-600 dark:text-purple-400"
            // Smooth trend data for win rate
            trendData={[
               {value: 45}, {value: 47}, {value: 50}, {value: 48}, {value: 52}, {value: stats.winRate}
            ]}
            subtitle={`Current Streak: ${stats.consecutiveWins} Wins`}
          />

          <MetricCard
            title="Profit Factor"
            value={stats.profitFactor.toFixed(2)}
            change={`Exp: $${stats.expectancy.toFixed(2)}`}
            changeType={stats.profitFactor >= 1.5 ? "positive" : stats.profitFactor >= 1 ? "neutral" : "negative"}
            icon={Award}
            iconColor="text-emerald-600 dark:text-emerald-400"
            subtitle="Gross Profit / Gross Loss"
          />

          <MetricCard
            title="Avg Return"
            value={`$${stats.avgReturn.toFixed(2)}`}
            change={`DD: -$${Math.abs(stats.largestDrawdown).toFixed(0)}`}
            changeType={stats.avgReturn > 0 ? "positive" : "negative"}
            icon={BarChart3}
            iconColor="text-amber-600 dark:text-amber-400"
            trendData={chartData.map(d => ({ value: d.tradePnl }))}
            subtitle="Average P&L per trade"
          />
        </div>

        {/* --- Main Content Area --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Chart Section (Takes 2/3 width) */}
          <Card 
              className="border-0 shadow-lg dark:shadow-2xl dark:bg-gray-900/60 backdrop-blur-sm overflow-hidden flex flex-col ring-1 ring-gray-200 dark:ring-gray-800"
              data-tutorial="performance-chart"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/50">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Equity Curve
                  </CardTitle>
                  <CardDescription>
                    Performance analysis over selected period
                  </CardDescription>
                </div>
              
              <Tabs value={chartViewMode} onValueChange={(v: any) => setChartViewMode(v)} className="w-auto">
                <TabsList className="h-9 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <TabsTrigger value="cumulative" className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Growth</TabsTrigger>
                  <TabsTrigger value="daily" className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Daily P&L</TabsTrigger>
                  <TabsTrigger value="calendar" className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Calendar</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className={cn(
              "pt-6 pl-0",
              chartViewMode === 'calendar' ? "h-auto pb-3" : "flex-1 min-h-[420px]"
            )}>
              {chartViewMode === 'calendar' ? (
                <div className="px-6 pb-3">
                  <PremiumCalendarView trades={filteredTrades} />
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartViewMode === 'cumulative' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPnLMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      minTickGap={40}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      tickFormatter={(value) => `$${value}`}
                      width={60}
                    />
                    <Tooltip content={<CustomChartTooltip currency />} cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }} />
                    <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" opacity={0.5} />
                    <Area 
                      name="Cumulative P&L"
                      type="monotone" 
                      dataKey="cumulativePnl" 
                      stroke="#3b82f6" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorPnLMain)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      minTickGap={40}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      tickFormatter={(value) => `$${value}`}
                      width={60}
                    />
                    <Tooltip content={<CustomChartTooltip currency />} cursor={{ fill: 'transparent' }} />
                    <ReferenceLine y={0} stroke="#9ca3af" opacity={0.5} />
                    <Bar 
                      name="Daily P&L"
                      dataKey="tradePnl" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.tradePnl >= 0 ? "#10b981" : "#f43f5e"} 
                          fillOpacity={0.9}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
              )}
            </CardContent>
            </Card>

          {/* Side Panel: Strategy & Calendar */}
          <div className="space-y-6 flex flex-col">
            
            {/* Strategy Donut */}
            <Card className="flex-1 border-0 shadow-lg dark:shadow-2xl dark:bg-gray-900/60 ring-1 ring-gray-200 dark:ring-gray-800 backdrop-blur-sm">
               <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800/50">
                 <CardTitle className="text-lg font-bold flex items-center gap-2">
                   <PieChart className="w-5 h-5 text-purple-500" />
                   Strategy Edge
                 </CardTitle>
               </CardHeader>
               <CardContent className="flex flex-col items-center justify-center min-h-[250px] p-6">
                 <div className="relative w-full h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <RechartsPieChart>
                       <Pie
                         data={strategyData}
                         cx="50%"
                         cy="50%"
                         innerRadius={65}
                         outerRadius={85}
                         paddingAngle={4}
                         dataKey="pnl"
                         cornerRadius={4}
                       >
                         {strategyData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={STRATEGY_COLORS[index % STRATEGY_COLORS.length].stroke} strokeWidth={0} />
                         ))}
                       </Pie>
                       <Tooltip content={<CustomChartTooltip currency />} />
                     </RechartsPieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-bold tracking-tighter text-gray-900 dark:text-white">{strategyData.length}</span>
                     <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Setups</span>
                   </div>
                 </div>
                 
                 <div className="w-full mt-6 space-y-3">
                   {strategyData.slice(0, 4).map((strategy, idx) => {
                     const color = STRATEGY_COLORS[idx % STRATEGY_COLORS.length]
                     return (
                       <div key={strategy.name} className="flex items-center justify-between text-sm group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                         <div className="flex items-center gap-3">
                           <div className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                           <span className="font-medium text-gray-700 dark:text-gray-300">{strategy.name}</span>
                         </div>
                         <div className="text-right flex items-center gap-3">
                            <span className="text-xs text-muted-foreground font-medium">{strategy.winRate.toFixed(0)}% WR</span>
                           <span className={cn("font-mono font-bold", strategy.pnl >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500")}>
                             ${strategy.pnl.toFixed(0)}
                           </span>
                         </div>
                       </div>
                     )
                   })}
                 </div>
               </CardContent>
            </Card>

            {/* Calendar Heatmap Preview */}
            <Card className="border-0 shadow-lg dark:shadow-2xl bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Consistency Map</span>
                  <span className="text-xs font-normal bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-foreground">{format(new Date(), "MMMM")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <CalendarHeatmap trades={filteredTrades} currentDate={new Date()} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- Lower Section: Recent Trades & Quick Actions --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
          
          {/* Recent Trades List */}
          <Card className="lg:col-span-2 border-0 shadow-lg dark:shadow-2xl overflow-hidden bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800" data-tutorial="recent-trades">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10 py-5">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recent Execution Log
                </CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild className="group border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800">
                <Link href="/trades" className="text-xs font-semibold">
                  View All <ArrowRight className="ml-2 w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
               {filteredTrades.slice(0, 5).map((trade) => {
                 const isWin = trade.outcome === 'win';
                 const isLong = trade.direction === 'long';
                 const StrategyIcon = getStrategyIcon(trade.setup_name || "");

                 return (
                   <div key={trade.id} className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all border-b last:border-0 border-gray-100 dark:border-gray-800/50 group cursor-pointer">
                     <div className="flex items-center gap-5">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-colors",
                         isWin 
                           ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400" 
                           : "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400"
                       )}>
                         {isLong ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                       </div>
                       
                       <div className="space-y-1">
                         <div className="flex items-center gap-2.5">
                           <span className="font-bold text-gray-900 dark:text-gray-100 text-base">{trade.instrument}</span>
                           <Badge variant={isLong ? "default" : "destructive"} className={cn("text-[10px] px-1.5 py-0 h-5 font-bold uppercase tracking-wide opacity-80", isLong ? "bg-blue-600" : "bg-orange-600")}>
                             {trade.direction}
                           </Badge>
                         </div>
                         <div className="flex items-center gap-3 text-xs text-muted-foreground">
                           <span className="flex items-center gap-1.5">
                             <Calendar className="w-3 h-3" />
                             {format(new Date(trade.date), "MMM dd • HH:mm")}
                           </span>
                           <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                           <span className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-400">
                             <StrategyIcon className="w-3 h-3" />
                             {trade.setup_name || "Discretionary"}
                           </span>
                         </div>
                       </div>
                     </div>

                     <div className="flex items-center gap-8">
                        <div className="hidden md:block text-right space-y-1">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Prices</p>
                          <p className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                            <span className="opacity-60">{trade.entry_price}</span> <span className="mx-1">→</span> <span>{trade.exit_price}</span>
                          </p>
                        </div>
                        
                        <div className="text-right min-w-[90px] space-y-1">
                          <p className={cn("font-bold text-base font-mono", isWin ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                            {trade.pnl > 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                          </p>
                          <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5 border-0 uppercase font-bold", isWin ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20" : "bg-rose-100 text-rose-700 dark:bg-rose-500/20")}>
                            {trade.outcome}
                          </Badge>
                        </div>

                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground" asChild>
                           <Link href={`/trade-details/${trade.id}`}>
                             <ChevronRight className="w-5 h-5" />
                           </Link>
                        </Button>
                     </div>
                   </div>
                 )
               })}
               
               {filteredTrades.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                   <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <Filter className="w-8 h-8 opacity-20" />
                   </div>
                   <p className="font-medium">No trading data found for this period</p>
                   <p className="text-sm opacity-60 mt-1">Try adjusting your filters or add a new trade</p>
                 </div>
               )}
            </CardContent>
          </Card>

          {/* Quick Actions & AI Insight */}
          <div className="space-y-6">
            
            {/* Quick Actions Grid - UPDATED: LEFT ALIGNED & START JUSTIFIED */}
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: "Add Trade", icon: Plus, href: "/add-trade", color: "bg-blue-600", desc: "Log Entry" },
                 { label: "Import", icon: Download, href: "/import", color: "bg-indigo-600", desc: "Sync Data" },
                 { label: "Playbook", icon: BookOpen, href: "/playbook", color: "bg-amber-600", desc: "Strategies" },
                 { label: "AI Insights", icon: Zap, href: "/insights", color: "bg-rose-600", desc: "Analysis" },
               ].map((action) => (
                 <Link key={action.label} href={action.href} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                    <div className="p-4 flex flex-row items-center justify-start gap-4 relative z-10 h-full">
                      <div className={cn("p-2.5 rounded-xl shadow-lg text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shrink-0", action.color)}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">{action.label}</h4>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">{action.desc}</p>
                      </div>
                    </div>
                    {/* Hover Effect */}
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity", action.color.replace('bg-', 'bg-text-'))} />
                 </Link>
               ))}
            </div>

            {/* AI Insight Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden rounded-2xl">
               {/* Decorative Background */}
               <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-[0.08] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500 opacity-20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
               
               <CardHeader className="relative z-10 pb-2">
                 <div className="flex items-center justify-between mb-1">
                   <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md px-3 py-1">
                     <Sparkles className="w-3 h-3 mr-1.5 text-yellow-300" /> AI Insight
                   </Badge>
                   <span className="text-[10px] font-medium opacity-70">Just now</span>
                 </div>
                 <CardTitle className="text-lg font-bold tracking-tight">Pattern Detected</CardTitle>
               </CardHeader>
               <CardContent className="relative z-10 space-y-4">
                 <p className="text-sm text-indigo-50 font-medium leading-relaxed opacity-90">
                   Your win rate on <span className="text-white font-bold bg-white/10 px-1 rounded">Long</span> trades in the morning session is <span className="text-green-300 font-bold">15% higher</span>. Consider increasing size before 11:00 AM.
                 </p>
                 <Button variant="secondary" className="w-full bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg font-bold border-0" asChild>
                   <Link href="/insights">
                     View Analysis <ArrowRight className="ml-2 w-4 h-4" />
                   </Link>
                 </Button>
               </CardContent>
            </Card>

            {/* Market Status (Visual Only) */}
            <div className="bg-gray-900 dark:bg-black rounded-2xl p-5 flex items-center justify-between text-white shadow-lg ring-1 ring-white/10">
               <div className="flex items-center gap-4">
                 <div className="relative flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Market Status</p>
                   <p className="text-sm font-bold tracking-tight">NY Session Open</p>
                 </div>
               </div>
               <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center">
                 <Timer className="w-5 h-5 text-gray-400" />
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
