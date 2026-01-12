"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
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
import { EconomicCalendarWidget } from "@/components/dashboard/economic-calendar-widget"
import { calculateInstrumentPnL } from "@/types/instrument-calculations"
import { format, subDays, eachDayOfInterval, isSameDay, getDay, startOfMonth, endOfMonth } from "date-fns"

// --- Types & Interfaces ---

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ElementType
  iconColor: string
  trendData?: any[] // Array for sparkline
  subtitle?: string
  tooltipInfo?: string
  onClick?: () => void
}

interface QuickStatProps {
  label: string
  value: string
  icon: React.ElementType
  color: string
  trend?: "up" | "down" | "flat"
}

interface CalendarHeatmapProps {
  trades: Trade[]
  currentDate: Date
}

// --- Constants & Configuration ---

const ANIMATION_DELAY_BASE = 100

// Expanded Strategy Palette for complex visualizations
const STRATEGY_COLORS = [
  {
    bg: "bg-blue-500",
    gradient: "from-blue-500 to-blue-600",
    text: "text-blue-700 dark:text-blue-300",
    light: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    stroke: "#3b82f6",
  },
  {
    bg: "bg-purple-500",
    gradient: "from-purple-500 to-purple-600",
    text: "text-purple-700 dark:text-purple-300",
    light: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    stroke: "#a855f7",
  },
  {
    bg: "bg-emerald-500",
    gradient: "from-emerald-500 to-emerald-600",
    text: "text-emerald-700 dark:text-emerald-300",
    light: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    stroke: "#10b981",
  },
  {
    bg: "bg-amber-500",
    gradient: "from-amber-500 to-amber-600",
    text: "text-amber-700 dark:text-amber-300",
    light: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    stroke: "#f59e0b",
  },
  {
    bg: "bg-rose-500",
    gradient: "from-rose-500 to-rose-600",
    text: "text-rose-700 dark:text-rose-300",
    light: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    stroke: "#f43f5e",
  },
  {
    bg: "bg-cyan-500",
    gradient: "from-cyan-500 to-cyan-600",
    text: "text-cyan-700 dark:text-cyan-300",
    light: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-800",
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
]

// --- Helper Functions ---

const getStrategyIcon = (strategyName: string) => {
  const normalizedName = strategyName.toLowerCase()
  if (normalizedName.includes("breakout")) return STRATEGY_ICONS.Breakout
  if (normalizedName.includes("reversal")) return STRATEGY_ICONS.Reversal
  if (normalizedName.includes("trend")) return STRATEGY_ICONS["Trend Following"]
  if (normalizedName.includes("scalp")) return STRATEGY_ICONS.Scalping
  if (normalizedName.includes("swing")) return STRATEGY_ICONS["Swing Trading"]
  if (normalizedName.includes("mean") || normalizedName.includes("reversion")) return STRATEGY_ICONS["Mean Reversion"]
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
      "animate-fade-in-up",
      "bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 dark:from-white dark:via-slate-200 dark:to-white",
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
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 py-1">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <div>
              <p className="text-xs text-muted-foreground capitalize">
                {entry.name === "cumulativePnl" ? "Net P&L" : entry.name}
              </p>
              <p
                className={cn(
                  "text-sm font-bold font-mono",
                  typeof entry.value === "number" && entry.value > 0
                    ? "text-green-600 dark:text-green-400"
                    : typeof entry.value === "number" && entry.value < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-gray-100",
                )}
              >
                {currency && typeof entry.value === "number" ? "$" : ""}
                {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
                {!currency && typeof entry.value === "number" ? "%" : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// 3. Advanced Metric Card with Sparkline
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
        "relative overflow-hidden border-0 shadow-lg transition-all duration-300 group cursor-pointer",
        "bg-white dark:bg-gray-900/80 backdrop-blur-xl",
        "hover:shadow-2xl hover:-translate-y-1 hover:ring-1 hover:ring-primary/20",
      )}
      onClick={onClick}
    >
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div
            className={cn(
              "p-3 rounded-2xl shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
              iconColor,
            )}
          >
            <Icon className="h-6 w-6 text-white drop-shadow-md" />
          </div>
          {change && (
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-xs px-2 py-0.5 border-0 bg-opacity-20 backdrop-blur-sm",
                changeType === "positive" && "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30",
                changeType === "negative" && "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30",
                changeType === "neutral" && "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
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
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {title}
            {tooltipInfo && <AlertCircle className="h-3 w-3 text-muted-foreground/50" />}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold tracking-tighter text-foreground">{value}</h3>
          </div>
          {subtitle && <p className="text-xs text-muted-foreground/80 font-medium">{subtitle}</p>}
        </div>

        {/* Sparkline Area */}
        {trendData && trendData.length > 0 && (
          <div className="h-16 w-full mt-4 -mb-2 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="currentColor"
                      stopOpacity={0.3}
                      className={
                        changeType === "positive"
                          ? "text-green-500"
                          : changeType === "negative"
                            ? "text-red-500"
                            : "text-gray-500"
                      }
                    />
                    <stop
                      offset="95%"
                      stopColor="currentColor"
                      stopOpacity={0}
                      className={
                        changeType === "positive"
                          ? "text-green-500"
                          : changeType === "negative"
                            ? "text-red-500"
                            : "text-gray-500"
                      }
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill={`url(#gradient-${title})`}
                  className={
                    changeType === "positive"
                      ? "text-green-500"
                      : changeType === "negative"
                        ? "text-red-500"
                        : "text-gray-500"
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

// 4. Quick Stat Component
const QuickStat = React.memo<QuickStatProps>(({ label, value, icon: Icon, color, trend }) => (
  <div className="group relative flex items-center p-4 bg-white/50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-lg backdrop-blur-sm overflow-hidden">
    <div
      className={cn(
        "absolute right-0 top-0 w-16 h-16 rounded-bl-full opacity-10 transition-opacity group-hover:opacity-20",
        color.replace("bg-gradient-to-br", "bg"), // Simplified color extraction for bg
      )}
    />
    <div className={cn("p-3 rounded-xl shadow-lg mr-4 group-hover:scale-110 transition-transform duration-300", color)}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-lg font-bold text-foreground">{value}</p>
        {trend && (
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-full bg-opacity-20",
              trend === "up" ? "bg-green-500 text-green-600" : "bg-red-500 text-red-600",
            )}
          >
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          </span>
        )}
      </div>
    </div>
  </div>
))

// 5. Calendar Heatmap Component (Visualization of trading activity)
const CalendarHeatmap = React.memo<CalendarHeatmapProps>(({ trades, currentDate }) => {
  const [hoveredDay, setHoveredDay] = useState<any>(null)

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })

    // Pad the beginning
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
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day, idx) => {
          const data = getDayData(day)
          if (!day) return <div key={`empty-${idx}`} className="aspect-square" />

          const pnlColor =
            !data || data.count === 0
              ? "bg-gray-100 dark:bg-gray-800"
              : data.pnl > 0
                ? "bg-green-500"
                : data.pnl < 0
                  ? "bg-red-500"
                  : "bg-yellow-500"

          const opacity = !data || data.count === 0 ? "opacity-100" : Math.min(Math.abs(data.pnl) / 500, 1) * 0.8 + 0.2 // Dynamic opacity based on PnL magnitude

          return (
            <Tooltip
              key={day.toISOString()}
              content={
                data && data.count > 0 ? (
                  <div className="p-2 bg-white dark:bg-gray-900 border rounded shadow-lg text-xs">
                    <p className="font-bold">{format(day, "MMM dd, yyyy")}</p>
                    <p className={data.pnl >= 0 ? "text-green-500" : "text-red-500"}>
                      {data.pnl >= 0 ? "+" : ""}${data.pnl.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">{data.count} trades</p>
                  </div>
                ) : null
              }
            >
              <div
                className="aspect-square rounded-md relative group cursor-pointer transition-all hover:ring-2 ring-primary/50 ring-offset-1 dark:ring-offset-gray-900"
                onMouseEnter={() => setHoveredDay(data)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div
                  className={cn("absolute inset-0 rounded-md transition-colors duration-300", pnlColor)}
                  style={{ opacity: data && data.count > 0 ? opacity : 1 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={cn("text-[10px] font-semibold", data && data.count > 0 ? "text-white" : "text-gray-400")}
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
  const [chartViewMode, setChartViewMode] = useState<"cumulative" | "daily" | "volume">("cumulative")
  const [quoteIndex, setQuoteIndex] = useState(0)

  // Custom Hooks
  const { config, isLoading: isConfigLoading } = useUserConfig()
  const { displayFormat, setDisplayFormat } = usePnLDisplay()

  // --- Effects ---

  // Load Trades
  const loadTrades = useCallback(
    async (showLoadingState = true) => {
      if (isConfigLoading) return
      if (showLoadingState) setIsLoading(true)
      else setIsRefreshing(true)

      setError(null)
      try {
        // Simulate network delay for smoother UI if strictly local
        await new Promise((resolve) => setTimeout(resolve, 600))
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
    },
    [isConfigLoading],
  )

  useEffect(() => {
    loadTrades()
  }, [loadTrades])

  // Rotation for quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // --- Data Processing & Calculation (Heavy Lifting) ---

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
    // Return default object if no trades
    if (filteredTrades.length === 0) {
      return {
        totalPnL: 0,
        winRate: 0,
        profitFactor: 0,
        avgReturn: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        bestTrade: null,
        worstTrade: null,
        consecutiveWins: 0,
        consecutiveLosses: 0,
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

    // Expectancy calculation: (Win % * Avg Win) - (Loss % * Avg Loss)
    const winPct = wins.length / totalTrades
    const lossPct = losses.length / totalTrades
    const expectancy = winPct * avgWin - lossPct * avgLoss

    // Sort for Min/Max
    const sortedByPnL = [...processedTrades].sort((a, b) => b.adjustedPnL - a.adjustedPnL)
    const bestTrade = sortedByPnL[0]
    const worstTrade = sortedByPnL[sortedByPnL.length - 1]

    // Drawdown Calculation
    let peak = Number.NEGATIVE_INFINITY
    let maxDrawdown = 0
    let runningPnL = 0

    // Sort by Date for Drawdown & Streak
    const sortedByDate = [...processedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let currentWinStreak = 0
    let maxWinStreak = 0
    let currentLossStreak = 0
    let maxLossStreak = 0

    sortedByDate.forEach((trade) => {
      // Drawdown
      runningPnL += trade.adjustedPnL
      if (runningPnL > peak) peak = runningPnL
      const drawdown = peak - runningPnL
      if (drawdown > maxDrawdown) maxDrawdown = drawdown

      // Streaks
      if (trade.outcome === "win") {
        currentWinStreak++
        currentLossStreak = 0
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak
      } else if (trade.outcome === "loss") {
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
      bestTrade,
      worstTrade,
      consecutiveWins: maxWinStreak,
      consecutiveLosses: maxLossStreak,
      avgWin,
      avgLoss,
      expectancy,
      largestDrawdown: maxDrawdown,
    }
  }, [filteredTrades])

  // Chart Data Preparation
  const chartData = useMemo(() => {
    if (filteredTrades.length === 0) return []
    const sorted = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let cumulative = 0
    return sorted.map((trade) => {
      const { adjustedPnL } = calculateInstrumentPnL(
        trade.instrument,
        trade.direction,
        trade.entry_price,
        trade.exit_price,
        trade.size,
      )
      cumulative += adjustedPnL
      return {
        date: format(new Date(trade.date), "MMM dd"),
        fullDate: format(new Date(trade.date), "yyyy-MM-dd HH:mm"),
        cumulativePnl: cumulative,
        tradePnl: adjustedPnL,
        volume: trade.size, // Simplified volume
        outcome: trade.outcome,
      }
    })
  }, [filteredTrades])

  // Strategy Data Preparation
  const strategyData = useMemo(() => {
    const map = new Map<string, { name: string; pnl: number; wins: number; total: number }>()

    filteredTrades.forEach((trade) => {
      const name = trade.setup_name || "Discretionary"
      const current = map.get(name) || { name, pnl: 0, wins: 0, total: 0 }

      const { adjustedPnL } = calculateInstrumentPnL(
        trade.instrument,
        trade.direction,
        trade.entry_price,
        trade.exit_price,
        trade.size,
      )
      current.pnl += adjustedPnL
      current.total += 1
      if (trade.outcome === "win") current.wins += 1

      map.set(name, current)
    })

    return Array.from(map.values())
      .map((s) => ({ ...s, winRate: (s.wins / s.total) * 100 }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5) // Top 5
  }, [filteredTrades])

  // Loading State
  if (isLoading && !isRefreshing && trades.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-10 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 rounded-xl bg-muted animate-pulse" />
          <div className="h-96 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  // Error State
  if (error && !isLoading && trades.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Data Synchronization Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => loadTrades()} className="w-full">
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
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 animate-fade-in-up">
          <div className="space-y-2 relative">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground mb-1">
              <span className="flex items-center text-orange-500">
                <Flame className="w-3 h-3 mr-1" /> {getGreeting()}, Trader
              </span>
              <Separator orientation="vertical" className="h-3" />
              <span>{format(new Date(), "MMMM dd, yyyy")}</span>
            </div>

            <AnimatedTitle className="text-4xl">Dashboard Overview</AnimatedTitle>

            <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-2xl">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <span className="italic">"{MOTIVATIONAL_QUOTES[quoteIndex]}"</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-1">
              {(["7d", "30d", "90d", "ytd", "all"] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                    selectedPeriod === period
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  {period.toUpperCase()}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <PnLDisplaySelector currentFormat={displayFormat} onFormatChange={setDisplayFormat} />

              <Button
                variant="outline"
                size="icon"
                onClick={() => loadTrades(false)}
                className={cn("rounded-xl border-gray-200 dark:border-gray-800", isRefreshing && "animate-spin")}
                title="Refresh Data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button
                data-tutorial="add-trade-btn"
                className="rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all hover:scale-105"
                asChild
              >
                <Link href="/add-trade">
                  <Plus className="mr-2 h-4 w-4" /> New Trade
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* --- Key Metrics Grid with Sparklines --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tutorial="key-metrics">
          <MetricCard
            title="Total Net P&L"
            value={
              displayFormat === "dollars"
                ? `$${stats.totalPnL.toFixed(2)}`
                : displayFormat === "percentage"
                  ? `${((stats.totalPnL / 10000) * 100).toFixed(2)}%` // Assuming 10k start
                  : `${stats.totalPnL.toFixed(2)} R`
            }
            change={`${stats.totalTrades} Trades`}
            changeType={stats.totalPnL >= 0 ? "positive" : "negative"}
            icon={Wallet}
            iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
            trendData={chartData.map((d) => ({ value: d.cumulativePnl }))}
            subtitle="Net profit after commissions"
          />

          <MetricCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            change={`${stats.winningTrades}W - ${stats.losingTrades}L`}
            changeType={stats.winRate > 50 ? "positive" : stats.winRate > 40 ? "neutral" : "negative"}
            icon={Target}
            iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
            // Mock trend data for win rate stability
            trendData={[{ value: 45 }, { value: 48 }, { value: 47 }, { value: 52 }, { value: stats.winRate }]}
            subtitle={`Streak: ${stats.consecutiveWins} Wins`}
          />

          <MetricCard
            title="Profit Factor"
            value={stats.profitFactor.toFixed(2)}
            change={`Exp: $${stats.expectancy.toFixed(2)}`}
            changeType={stats.profitFactor >= 1.5 ? "positive" : stats.profitFactor >= 1 ? "neutral" : "negative"}
            icon={Award}
            iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
            subtitle="Gross Profit / Gross Loss"
          />

          <MetricCard
            title="Avg Return"
            value={`$${stats.avgReturn.toFixed(2)}`}
            change={`DD: -$${Math.abs(stats.largestDrawdown).toFixed(0)}`}
            changeType={stats.avgReturn > 0 ? "positive" : "negative"}
            icon={BarChart3}
            iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
            trendData={chartData.map((d) => ({ value: d.tradePnl }))}
            subtitle="Average P&L per trade"
          />
        </div>

        {/* --- Main Content Area: Charts & Distribution --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Chart Section (Takes 2/3 width on large screens) */}
          <Card
            className="xl:col-span-2 border-0 shadow-xl dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden flex flex-col"
            data-tutorial="performance-chart"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>Cumulative P&L growth over {selectedPeriod.toUpperCase()} period</CardDescription>
              </div>

              <Tabs value={chartViewMode} onValueChange={(v: any) => setChartViewMode(v)} className="w-auto">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="cumulative" className="text-xs">
                    Growth
                  </TabsTrigger>
                  <TabsTrigger value="daily" className="text-xs">
                    Daily P&L
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="flex-1 min-h-[400px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {chartViewMode === "cumulative" ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPnLMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      minTickGap={30}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickFormatter={(value) => `$${value}`}
                      width={60}
                    />
                    <Tooltip content={<CustomChartTooltip currency />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{value}</span>
                      )}
                    />
                    <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" opacity={0.5} />
                    <Area
                      name="Cumulative P&L"
                      type="monotone"
                      dataKey="cumulativePnl"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPnLMain)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      minTickGap={30}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickFormatter={(value) => `$${value}`}
                      width={60}
                    />
                    <Tooltip content={<CustomChartTooltip currency />} />
                    <ReferenceLine y={0} stroke="#9ca3af" opacity={0.5} />
                    <Bar name="Daily P&L" dataKey="tradePnl" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.tradePnl >= 0 ? "#10b981" : "#ef4444"}
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Side Panel: Strategy & Calendar */}
          <div className="space-y-6 flex flex-col">
            {/* Strategy Donut */}
            <Card className="flex-1 border-0 shadow-lg dark:bg-gray-900/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-500" />
                  Strategy Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[250px]">
                <div className="relative w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={strategyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="pnl"
                      >
                        {strategyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STRATEGY_COLORS[index % STRATEGY_COLORS.length].stroke} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip currency />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold">{strategyData.length}</span>
                    <span className="text-xs text-muted-foreground">Active Strategies</span>
                  </div>
                </div>

                <div className="w-full mt-4 space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  {strategyData.map((strategy, idx) => {
                    const color = STRATEGY_COLORS[idx % STRATEGY_COLORS.length]
                    return (
                      <div
                        key={strategy.name}
                        className="flex items-center justify-between text-sm group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${color.bg}`} />
                          <span className="font-medium text-gray-700 dark:text-gray-300">{strategy.name}</span>
                        </div>
                        <div className="text-right">
                          <span className={strategy.pnl >= 0 ? "text-green-600 font-mono" : "text-red-600 font-mono"}>
                            ${strategy.pnl.toFixed(0)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({strategy.winRate.toFixed(0)}% WR)
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Heatmap Preview */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>Monthly Activity</span>
                  </div>
                  <span className="text-xs font-normal text-muted-foreground">{format(new Date(), "MMMM yyyy")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarHeatmap trades={filteredTrades} currentDate={new Date()} />
              </CardContent>
            </Card>

            {/* Economic Calendar Widget */}
            <EconomicCalendarWidget maxHeight="500px" className="animate-fade-in-up" />
          </div>
        </div>

        {/* --- Lower Section: Recent Trades & Quick Actions --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
          {/* Recent Trades List */}
          <Card
            className="lg:col-span-2 border-0 shadow-xl overflow-hidden bg-white dark:bg-gray-900"
            data-tutorial="recent-trades"
          >
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Recent Trades
                </CardTitle>
                <CardDescription>Your last execution activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="group">
                <Link href="/trades">
                  View All <ArrowUpRight className="ml-1 w-3 h-3 transition-transform group-hover:rotate-45" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {filteredTrades.slice(0, 5).map((trade, idx) => {
                const isWin = trade.outcome === "win"
                const isLong = trade.direction === "long"
                const pnlColor =
                  trade.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                const StrategyIcon = getStrategyIcon(trade.setup_name || "")

                return (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b last:border-0 border-gray-100 dark:border-gray-800/50 group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                          isWin
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                            : "bg-red-100 text-red-600 dark:bg-red-900/30",
                        )}
                      >
                        {isLong ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-gray-100">{trade.instrument}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                            {trade.direction.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{format(new Date(trade.date), "MMM dd • HH:mm")}</span>
                          <span className="flex items-center gap-1">
                            <StrategyIcon className="w-3 h-3" />
                            {trade.setup_name || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block text-right">
                        <p className="text-xs text-muted-foreground">Entry / Exit</p>
                        <p className="text-xs font-medium">
                          {trade.entry_price} → {trade.exit_price}
                        </p>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className={cn("font-bold text-sm", pnlColor)}>
                          {trade.pnl > 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{trade.outcome.toUpperCase()}</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link href={`/trade-details/${trade.id}`}>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}

              {filteredTrades.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>No trading data available for this period.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & AI Insight Teaser */}
          <div className="space-y-6">
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Add Trade", icon: Plus, href: "/add-trade", color: "bg-blue-600", desc: "Log manual" },
                { label: "Import", icon: Download, href: "/import", color: "bg-indigo-600", desc: "CSV/Broker" },
                { label: "Playbook", icon: BookOpen, href: "/playbook", color: "bg-amber-600", desc: "Strategies" },
                { label: "Insights", icon: Zap, href: "/insights", color: "bg-rose-600", desc: "AI Analysis" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-md border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-4 flex flex-col items-center text-center space-y-2 relative z-10">
                    <div
                      className={cn(
                        "p-2.5 rounded-lg shadow-lg text-white transition-transform group-hover:scale-110 group-hover:rotate-3",
                        action.color,
                      )}
                    >
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{action.label}</h4>
                      <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                    </div>
                  </div>
                  {/* Hover Effect */}
                  <div
                    className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity", action.color)}
                  />
                </Link>
              ))}
            </div>

            {/* AI Insight Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-900 to-purple-900 text-white relative overflow-hidden">
              {/* Background Effects */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500 opacity-10 rounded-full blur-2xl -ml-10 -mb-10" />

              <CardHeader className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="secondary"
                    className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md"
                  >
                    <Sparkles className="w-3 h-3 mr-1 text-yellow-300" /> AI Insight
                  </Badge>
                </div>
                <CardTitle className="text-lg">Pattern Detected</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
                  Your win rate on <span className="font-bold text-white">Long</span> trades in the{" "}
                  <span className="font-bold text-white">Morning Session</span> is 15% higher than afternoon sessions.
                  Consider sizing up before 11:00 AM.
                </p>
                <Button
                  variant="secondary"
                  className="w-full bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg font-semibold"
                  asChild
                >
                  <Link href="/insights">View Full Analysis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Market Status (Mock) */}
            <div className="bg-gray-900 dark:bg-black rounded-xl p-4 flex items-center justify-between text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 left-0 animate-ping opacity-75" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Market Status</p>
                  <p className="text-sm font-bold">NY Session Open</p>
                </div>
              </div>
              <Timer className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
