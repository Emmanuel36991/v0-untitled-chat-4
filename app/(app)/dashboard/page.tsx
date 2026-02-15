"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  format,
  subDays,
  addMonths,
  subMonths,
} from "date-fns"
import { getTrades } from "@/app/actions/trade-actions"
import { useUserConfig } from "@/hooks/use-user-config"
import { useCurrencyConversion } from "@/hooks/use-currency-conversion"
import type { Trade } from "@/types"

// --- UI Components (Shadcn) ---
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// --- Icons ---
import {
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Activity,
  Clock,
  RefreshCw,
  PieChart,
  ChevronRight,
  ChevronLeft,
  Shield,
  MoreHorizontal,
  AlertCircle,
  Timer,
  Wallet,
  ArrowRight,
  Filter,
  Calendar,
  LineChart,
  Inbox,
  SettingsIcon,
  Plus,
} from "lucide-react"
import {
  BreakoutIcon,
  ScalpIcon,
  ProfitChartIcon,
  MomentumFlowIcon,
  MeanReversionIcon,
  CompassIcon,
  NeuralSparkIcon,
  PatternEyeIcon,
  AddTradeIcon,
  TradeLedgerIcon,
  PlaybookIcon,
  AvgReturnIcon,
  ProfitFactorIcon,
} from "@/components/icons/system-icons"

// --- Charts (Recharts) ---
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts"

import { CurrencySelector } from "@/components/currency-selector"
import { formatPnLEnhanced } from "@/lib/format-pnl-enhanced"
import { formatCurrencyValue } from "@/lib/currency-config"
import { getTradingAccounts } from "@/app/actions/account-actions"
import { getStrategies } from "@/app/actions/playbook-actions"
import { EmptyState } from "@/components/empty-state"
import { OnboardingChecklist } from "@/components/onboarding-checklist"
import { AINeuralInsight } from "@/components/dashboard/ai-neural-insight"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap"
import { CustomChartTooltip } from "@/components/dashboard/custom-chart-tooltip"

// ==========================================
// 2. CONSTANTS & CONFIGURATION
// ==========================================

const STRATEGY_COLORS = [
  { bg: "bg-chart-1", stroke: "var(--chart-1)" },
  { bg: "bg-chart-2", stroke: "var(--chart-2)" },
  { bg: "bg-chart-3", stroke: "var(--chart-3)" },
  { bg: "bg-chart-4", stroke: "var(--chart-4)" },
  { bg: "bg-chart-5", stroke: "var(--chart-5)" },
  { bg: "bg-primary", stroke: "var(--primary)" },
]

const STRATEGY_ICONS: Record<string, React.ElementType> = {
  Breakout: BreakoutIcon,
  Reversal: MeanReversionIcon,
  "Trend Following": MomentumFlowIcon,
  Scalping: ScalpIcon,
  "Swing Trading": ProfitChartIcon,
  "Mean Reversion": MeanReversionIcon,
  Momentum: MomentumFlowIcon,
  "Support/Resistance": BreakoutIcon,
  Default: CompassIcon,
}

const MOTIVATIONAL_QUOTES = [
  "The goal of a successful trader is to make the best trades. Money is secondary.",
  "Risk comes from not knowing what you are doing.",
  "Limit your size in any position so that fear does not become the prevailing instinct.",
  "It's not whether you're right or wrong that's important, but how much money you make when you're right.",
]

// ==========================================
// 3. LOGIC HELPERS
// ==========================================

/**
 * Calculates the P&L of a trade based on instrument ticks/points.
 * Embedded here to avoid external file dependency.
 */
const calculateInstrumentPnL = (
  instrument: string,
  direction: "long" | "short",
  entry: number,
  exit: number,
  size: number
) => {
  let multiplier = 1
  // Simple multiplier logic for common instruments
  if (["NQ", "MNQ", "ES", "MES"].includes(instrument)) multiplier = 20 // Approx futures multiplier (simplified)
  if (["EURUSD", "GBPUSD"].includes(instrument)) multiplier = 100000 // Forex lot

  const diff = direction === "long" ? exit - entry : entry - exit
  const rawPnL = diff * size * multiplier

  // Return adjusted PnL (rounded to 2 decimals)
  return { adjustedPnL: Math.round(rawPnL * 100) / 100 }
}

const getStrategyIcon = (strategyName: string) => {
  const normalizedName = strategyName?.toLowerCase() || ""
  if (normalizedName.includes("breakout")) return STRATEGY_ICONS.Breakout
  if (normalizedName.includes("reversal")) return STRATEGY_ICONS.Reversal
  if (normalizedName.includes("trend")) return STRATEGY_ICONS["Trend Following"]
  if (normalizedName.includes("scalp")) return STRATEGY_ICONS.Scalping
  if (normalizedName.includes("swing")) return STRATEGY_ICONS["Swing Trading"]
  return STRATEGY_ICONS.Default
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 18) return "Good Afternoon"
  return "Good Evening"
}

// ==========================================
// 4. SUB-COMPONENTS
// ==========================================

const AnimatedTitle = React.memo<{ children: React.ReactNode; className?: string }>(
  ({ children, className }) => (
    <h1 className={cn("text-3xl font-extrabold tracking-tight text-foreground", className)}>
      {children}
    </h1>
  )
)

// ==========================================
// 5. MAIN DASHBOARD COMPONENT
// ==========================================

export default function DashboardPage() {
  // --- State ---
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Onboarding state
  const [hasAccounts, setHasAccounts] = useState(false)
  const [hasStrategies, setHasStrategies] = useState(false)

  // UI State
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "ytd" | "all">("30d")
  const [chartViewMode, setChartViewMode] = useState<"cumulative" | "daily" | "calendar">("cumulative")
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

  // --- Load user config ---
  const { config: userConfig, isLoaded: isConfigLoaded } = useUserConfig()

  // --- Currency conversion ---
  const {
    selectedCurrency,
    displayFormat,
    setCurrency,
    setDisplayFormat,
    convert,
  } = useCurrencyConversion()

  // --- Load Trades from Database ---
  const loadTrades = useCallback(async (showLoading = true) => {
    if (!isConfigLoaded) return
    if (showLoading) setIsLoading(true)
    else setIsRefreshing(true)
    setError(null)

    try {
      const [fetchedTrades, accounts, strategies] = await Promise.all([
        getTrades(),
        getTradingAccounts(),
        getStrategies(),
      ])
      setTrades(fetchedTrades || [])
      setHasAccounts((accounts?.length ?? 0) > 0)
      setHasStrategies((strategies?.length ?? 0) > 0)
    } catch (err) {
      console.error("Dashboard: Failed to fetch trades", err)
      setError("Failed to synchronize trading data.")
      setTrades([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [isConfigLoaded])

  useEffect(() => {
    loadTrades()
  }, [loadTrades])

  // Cycle quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // --- Data Processing ---

  // Filter by Date
  const filteredTrades = useMemo(() => {
    if (selectedPeriod === "all") return trades

    const now = new Date()
    let startDate = subDays(now, 30) // default

    if (selectedPeriod === "7d") startDate = subDays(now, 7)
    if (selectedPeriod === "90d") startDate = subDays(now, 90)
    if (selectedPeriod === "ytd") startDate = new Date(now.getFullYear(), 0, 1)

    return trades.filter((trade) => new Date(trade.date) >= startDate)
  }, [trades, selectedPeriod])

  // Calculate Statistics
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

    // Ensure PnL exists on all trades
    const processedTrades = filteredTrades.map((trade) => {
      const pnl = trade.pnl !== undefined
        ? trade.pnl
        : calculateInstrumentPnL(trade.instrument, trade.direction, trade.entry_price, trade.exit_price, trade.size).adjustedPnL
      return { ...trade, adjustedPnL: pnl }
    })

    const totalPnL = processedTrades.reduce((acc, t) => acc + t.adjustedPnL, 0)
    const wins = processedTrades.filter((t) => t.adjustedPnL > 0)
    const losses = processedTrades.filter((t) => t.adjustedPnL <= 0)
    const totalTrades = processedTrades.length

    const grossProfit = wins.reduce((acc, t) => acc + t.adjustedPnL, 0)
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.adjustedPnL, 0))

    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0
    const avgReturn = totalTrades > 0 ? totalPnL / totalTrades : 0

    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0
    const winPct = wins.length / totalTrades
    const lossPct = losses.length / totalTrades
    const expectancy = winPct * avgWin - lossPct * avgLoss

    // Drawdown Calculation
    let peak = -Infinity
    let maxDrawdown = 0
    let runningPnL = 0
    let currentWinStreak = 0
    let maxWinStreak = 0

    // Sort by date ascending for curve calculation
    const sortedByDate = [...processedTrades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedByDate.forEach((trade) => {
      runningPnL += trade.adjustedPnL
      if (runningPnL > peak) peak = runningPnL
      const drawdown = peak - runningPnL
      if (drawdown > maxDrawdown) maxDrawdown = drawdown

      if (trade.adjustedPnL > 0) {
        currentWinStreak++
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak
      } else {
        currentWinStreak = 0
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
      largestDrawdown: maxDrawdown,
    }
  }, [filteredTrades])

  // Prepare Chart Data
  const chartData = useMemo(() => {
    if (filteredTrades.length === 0) return []
    const sorted = [...filteredTrades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let cumulative = 0
    return sorted.map((trade) => {
      const pnl = trade.pnl !== undefined
        ? trade.pnl
        : calculateInstrumentPnL(trade.instrument, trade.direction, trade.entry_price, trade.exit_price, trade.size).adjustedPnL
      cumulative += pnl
      return {
        date: format(new Date(trade.date), "MMM dd"),
        fullDate: format(new Date(trade.date), "yyyy-MM-dd HH:mm"),
        cumulativePnl: cumulative,
        tradePnl: pnl,
        volume: trade.size,
        outcome: pnl > 0 ? "win" : "loss",
      }
    })
  }, [filteredTrades])

  // Prepare Strategy Data
  const strategyData = useMemo(() => {
    const map = new Map<string, { name: string; pnl: number; wins: number; total: number }>()

    filteredTrades.forEach((trade) => {
      const name = trade.setup_name || "Discretionary"
      const current = map.get(name) || { name, pnl: 0, wins: 0, total: 0 }

      const pnl = trade.pnl !== undefined
        ? trade.pnl
        : calculateInstrumentPnL(trade.instrument, trade.direction, trade.entry_price, trade.exit_price, trade.size).adjustedPnL

      current.pnl += pnl
      current.total += 1
      if (pnl > 0) current.wins += 1

      map.set(name, current)
    })

    return Array.from(map.values())
      .map((s) => ({ ...s, winRate: (s.wins / s.total) * 100, chartValue: s.total }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5) // Top 5
  }, [filteredTrades])


  // --- Render ---

  if (isLoading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading trading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div className="space-y-1 relative">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <span className="flex items-center text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                <MomentumFlowIcon className="w-3 h-3 mr-1" /> {getGreeting()}
              </span>
              <span>•</span>
              <span>{format(new Date(), "MMMM dd, yyyy")}</span>
            </div>

            <AnimatedTitle className="text-3xl sm:text-4xl">
              Dashboard Overview
            </AnimatedTitle>

            <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-2xl pt-1">
              <NeuralSparkIcon className="w-4 h-4 text-primary" />
              <span className="italic text-muted-foreground">
                "{MOTIVATIONAL_QUOTES[quoteIndex]}"
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Period Selector */}
            <div className="bg-card p-1 rounded-xl shadow-sm border border-border flex items-center gap-1 backdrop-blur-sm">
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
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {period.toUpperCase()}
                </Button>
              ))}
            </div>

            {/* Currency Selector */}
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              displayFormat={displayFormat}
              onCurrencyChange={setCurrency}
              onFormatChange={setDisplayFormat}
            />

            <Separator
              orientation="vertical"
              className="h-8 hidden xl:block mx-1 bg-border"
            />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => loadTrades(false)}
                className={cn(
                  "rounded-xl h-10 w-10 border-border hover:bg-muted",
                  isRefreshing && "animate-spin text-primary"
                )}
                title="Refresh Data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button
                className="rounded-xl h-10 px-6 shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                asChild
              >
                <Link href="/add-trade">
                  <Plus className="mr-2 h-4 w-4" /> New Trade
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Onboarding Checklist (new users) */}
        <OnboardingChecklist
          hasAccounts={hasAccounts}
          hasStrategies={hasStrategies}
          hasTrades={trades.length > 0}
        />

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Net P&L"
            value={
              displayFormat === "dollars"
                ? formatCurrencyValue(convert(stats.totalPnL), selectedCurrency, { showSign: false })
                : displayFormat === "percentage"
                  ? `${stats.totalPnL >= 0 ? "+" : ""}${((stats.totalPnL / (stats.totalTrades || 1)) * 100).toFixed(2)}%`
                  : displayFormat === "privacy"
                    ? stats.totalPnL > 0 ? "+•••" : stats.totalPnL < 0 ? "-•••" : "•••"
                    : formatCurrencyValue(convert(stats.totalPnL), selectedCurrency, { showSign: false })
            }
            change={`${stats.totalTrades} Executions`}
            changeType={stats.totalPnL >= 0 ? "positive" : "negative"}
            icon={Wallet}
            iconColor="text-chart-1"
            trendData={chartData.map((d) => ({ value: d.cumulativePnl }))}
            subtitle="Net profit after commissions"
          />

          <MetricCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            change={`${stats.winningTrades}W - ${stats.losingTrades}L`}
            changeType={
              stats.winRate > 50
                ? "positive"
                : stats.winRate > 40
                  ? "neutral"
                  : "negative"
            }
            icon={Target}
            iconColor="text-chart-2"
            trendData={[
              { value: 45 }, { value: 48 }, { value: 52 }, { value: stats.winRate }
            ]} // Simple trend simulation
            subtitle={`Current Streak: ${stats.consecutiveWins} Wins`}
          />

          <MetricCard
            title="Profit Factor"
            value={stats.profitFactor.toFixed(2)}
            change={`Exp: $${stats.expectancy.toFixed(2)}`}
            changeType={
              stats.profitFactor >= 1.5
                ? "positive"
                : stats.profitFactor >= 1
                  ? "neutral"
                  : "negative"
            }
            icon={ProfitFactorIcon}
            iconColor="text-chart-3"
            subtitle="Gross Profit / Gross Loss"
          />

          <MetricCard
            title="Avg Return"
            value={`$${stats.avgReturn.toFixed(2)}`}
            change={`DD: -$${Math.abs(stats.largestDrawdown).toFixed(0)}`}
            changeType={stats.avgReturn > 0 ? "positive" : "negative"}
            icon={AvgReturnIcon}
            iconColor="text-chart-4"
            trendData={chartData.map((d) => ({ value: d.tradePnl }))}
            subtitle="Average P&L per trade"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Equity Chart (Left, 2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              className={cn(
                "border-0 shadow-lg backdrop-blur-sm overflow-hidden flex flex-col ring-1 ring-border",
                chartViewMode === "calendar" ? "h-auto" : "h-[550px]"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Equity Curve
                  </CardTitle>
                  <CardDescription>
                    Performance analysis over selected period
                  </CardDescription>
                </div>

                <Tabs
                  value={chartViewMode}
                  onValueChange={(v: any) => setChartViewMode(v)}
                  className="w-auto"
                >
                  <TabsList className="h-9 p-1 bg-muted rounded-lg">
                    <TabsTrigger
                      value="cumulative"
                      className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    >
                      Growth
                    </TabsTrigger>
                    <TabsTrigger
                      value="daily"
                      className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    >
                      Daily P&L
                    </TabsTrigger>
                    <TabsTrigger
                      value="calendar"
                      className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    >
                      Calendar
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent
                className={cn(
                  "pt-6 pl-0",
                  chartViewMode === "calendar" ? "h-auto pb-3" : "h-[420px]"
                )}
              >
                {chartViewMode === "calendar" ? (
                  <div className="px-6 pb-3">
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                        className="h-8 px-3"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold">
                          {format(calendarMonth, "MMMM yyyy")}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCalendarMonth(new Date())}
                          className="h-7 px-2 text-xs"
                        >
                          Today
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                        className="h-8 px-3"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <CalendarHeatmap
                      trades={filteredTrades}
                      currentDate={calendarMonth}
                    />
                  </div>
                ) : chartData.length === 0 ? (
                  <EmptyState
                    icon={LineChart}
                    title="No Trading Data"
                    description="Log your first trade to see your equity curve and performance charts come to life."
                    action={{ label: "Log your first trade", href: "/add-trade" }}
                    className="h-full"
                  />
                ) : (
                  <div className="w-full h-full px-6">
                    <ResponsiveContainer width="100%" height="100%">
                      {(() => {
                        return chartViewMode === "cumulative" ? (
                          <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id="colorPnLMain"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="var(--primary)"
                                  stopOpacity={0.2}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="var(--primary)"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="var(--border)"
                              opacity={0.2}
                            />
                            <XAxis
                              dataKey="date"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                              minTickGap={40}
                              dy={10}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                              tickFormatter={(value) => {
                                if (displayFormat === "dollars") {
                                  const symbol = selectedCurrency === "USD" ? "$" : selectedCurrency === "EUR" ? "€" : selectedCurrency === "GBP" ? "£" : selectedCurrency === "JPY" ? "¥" : "$"
                                  return `${symbol}${convert(value).toFixed(0)}`
                                } else if (displayFormat === "percentage") {
                                  return `${value.toFixed(1)}%`
                                } else if (displayFormat === "privacy") {
                                  return "•••"
                                }
                                return `$${value.toFixed(0)}`
                              }}
                              width={60}
                            />
                            <RechartsTooltip
                              content={<CustomChartTooltip currency currencyCode={selectedCurrency} convertFn={convert} />}
                              cursor={{
                                stroke: "var(--primary)",
                                strokeWidth: 1,
                                strokeDasharray: "4 4",
                              }}
                            />
                            <ReferenceLine
                              y={0}
                              stroke="var(--muted-foreground)"
                              strokeDasharray="3 3"
                              opacity={0.5}
                            />
                            <Area
                              name="Cumulative P&L"
                              type="monotone"
                              dataKey="cumulativePnl"
                              stroke="var(--primary)"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#colorPnLMain)"
                              animationDuration={1500}
                            />
                          </AreaChart>
                        ) : (
                          <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="var(--border)"
                              opacity={0.2}
                            />
                            <XAxis
                              dataKey="date"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                              minTickGap={40}
                              dy={10}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                              tickFormatter={(value) => `$${value}`}
                              width={60}
                            />
                            <RechartsTooltip
                              content={<CustomChartTooltip currency />}
                              cursor={{ fill: "transparent" }}
                            />
                            <ReferenceLine
                              y={0}
                              stroke="var(--muted-foreground)"
                              opacity={0.5}
                            />
                            <Bar
                              name="Daily P&L"
                              dataKey="tradePnl"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={60}
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.tradePnl >= 0 ? "var(--profit)" : "var(--loss)"
                                  }
                                  fillOpacity={0.9}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        )
                      })()}
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Strategy Pie Chart (Right, 1/3 width) */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            <Card className="flex-1 border-0 shadow-lg ring-1 ring-border backdrop-blur-sm">
              <CardHeader className="pb-2 border-b border-border">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-chart-5" />
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
                        dataKey="chartValue"
                        cornerRadius={4}
                      >
                        {strategyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              STRATEGY_COLORS[index % STRATEGY_COLORS.length]
                                .stroke
                            }
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomChartTooltip currency />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold tracking-tighter text-foreground">
                      {strategyData.length}
                    </span>
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
                      Setups
                    </span>
                  </div>
                </div>

                <div className="w-full mt-6 space-y-3">
                  {strategyData.slice(0, 4).map((strategy, idx) => {
                    const color = STRATEGY_COLORS[idx % STRATEGY_COLORS.length]
                    return (
                      <div
                        key={strategy.name}
                        className="flex items-center justify-between gap-4 text-sm group p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.bg}`}
                          />
                          <span className="font-medium text-foreground/80 truncate" title={strategy.name}>
                            {strategy.name}
                          </span>
                        </div>
                        <div className="text-right flex items-center gap-3 shrink-0">
                          <span className="text-xs text-muted-foreground font-medium">
                            {strategy.winRate.toFixed(0)}% WR
                          </span>
                          <span
                            className={cn(
                              "font-mono font-bold",
                              strategy.pnl >= 0
                                ? "text-profit"
                                : "text-loss"
                            )}
                          >
                            ${strategy.pnl.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Trades & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">

          {/* Recent Trade List */}
          <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden bg-card ring-1 ring-border">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/30 py-5">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-chart-1" />
                  Recent Execution Log
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="group border-border hover:bg-muted"
              >
                <Link href="/trades" className="text-xs font-semibold">
                  View All{" "}
                  <ArrowRight className="ml-2 w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {filteredTrades.slice(0, 5).map((trade) => {
                const isWin = trade.outcome === "win"
                const isLong = trade.direction === "long"
                const StrategyIcon = getStrategyIcon(trade.setup_name || "")
                const tradePnl = trade.pnl !== undefined
                  ? trade.pnl
                  : calculateInstrumentPnL(trade.instrument, trade.direction, trade.entry_price, trade.exit_price, trade.size).adjustedPnL

                return (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted/50 transition-colors border-b last:border-0 border-border group cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-colors",
                          isWin
                            ? "bg-profit/10 border-profit/20 text-profit"
                            : "bg-loss/10 border-loss/20 text-loss"
                        )}
                      >
                        {isLong ? (
                          <ArrowUpRight className="w-6 h-6" />
                        ) : (
                          <ArrowDownRight className="w-6 h-6" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-foreground text-base">
                            {trade.instrument}
                          </span>
                          <Badge
                            variant={isLong ? "default" : "destructive"}
                            className={cn(
                              "text-xs px-1.5 py-0 h-5 font-bold uppercase tracking-wide opacity-80",
                              isLong ? "bg-long" : "bg-short"
                            )}
                          >
                            {trade.direction}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(trade.date), "MMM dd • HH:mm")}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                            <StrategyIcon className="w-3 h-3" />
                            {trade.setup_name || "Discretionary"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="hidden md:block text-right space-y-1">
                        <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                          Prices
                        </p>
                        <p className="text-xs font-mono font-medium text-foreground/80">
                          <span className="opacity-60">
                            {trade.entry_price}
                          </span>{" "}
                          <span className="mx-1">→</span>{" "}
                          <span>{trade.exit_price}</span>
                        </p>
                      </div>

                      <div className="text-right min-w-[90px] space-y-1">
                        <p
                          className={cn(
                            "font-bold text-base font-mono",
                            isWin
                              ? "text-profit"
                              : "text-loss"
                          )}
                        >
                          {tradePnl > 0 ? "+" : ""}
                          ${tradePnl.toFixed(2)}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs h-4 px-1.5 border-0 uppercase font-bold",
                            isWin
                              ? "bg-profit/15 text-profit"
                              : "bg-loss/15 text-loss"
                          )}
                        >
                          {trade.outcome}
                        </Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-muted text-muted-foreground"
                        asChild
                      >
                        <Link href={`/trade-details/${trade.id}`}>
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}

              {filteredTrades.length === 0 && (
                <EmptyState
                  icon={Inbox}
                  title="No recent executions"
                  description="Trades logged within your selected time period will appear here."
                  action={{ label: "Log your first trade", href: "/add-trade" }}
                  compact
                />
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & AI Insight */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Add Trade", icon: AddTradeIcon, href: "/add-trade", color: "bg-primary", desc: "Log Entry" },
                { label: "Import", icon: TradeLedgerIcon, href: "/import", color: "bg-chart-5", desc: "Sync Data" },
                { label: "Playbook", icon: PlaybookIcon, href: "/playbook", color: "bg-warning", desc: "Strategies" },
                { label: "AI Insights", icon: PatternEyeIcon, href: "/analytics?tab=intelligence", color: "bg-loss", desc: "Analysis" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group relative overflow-hidden rounded-2xl bg-card shadow-sm border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-200"
                >
                  <div className="p-4 flex flex-row items-center justify-start gap-4 relative z-10 h-full">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl shadow-lg text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shrink-0",
                        action.color
                      )}
                    >
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-sm text-foreground leading-tight">
                        {action.label}
                      </h4>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-0.5">
                        {action.desc}
                      </p>
                    </div>
                  </div>
                  {/* Hover Effect */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity",
                      action.color.replace("bg-", "bg-text-")
                    )}
                  />
                </Link>
              ))}
            </div>

            {/* AI Neural Insight */}
            <AINeuralInsight trades={trades} />
          </div>
        </div>
      </div>
    </div>
  )
}

