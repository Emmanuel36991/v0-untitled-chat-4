"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  format,
  subDays,
} from "date-fns"
import { getTrades } from "@/app/actions/trade-actions"
import { useUserConfig } from "@/hooks/use-user-config"
import { useCurrencyConversion } from "@/hooks/use-currency-conversion"
import type { Trade } from "@/types"

// --- UI Components (Shadcn) ---
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// --- Icons ---
import {
  Target,
  RefreshCw,
  Wallet,
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
  AvgReturnIcon,
  ProfitFactorIcon,
} from "@/components/icons/system-icons"
import { WisdomSparkIcon } from "@/components/icons/hand-crafted-icons"

import { CurrencySelector } from "@/components/currency-selector"
import { formatCurrencyValue } from "@/lib/currency-config"
import { getTradingAccounts } from "@/app/actions/account-actions"
import { getStrategies } from "@/app/actions/playbook-actions"
import { OnboardingChecklist } from "@/components/onboarding-checklist"
import { AINeuralInsight } from "@/components/dashboard/ai-neural-insight"
import { MetricCard } from "@/components/dashboard/metric-card"
import { EquityChartCard } from "@/components/dashboard/equity-chart-card"
import { StrategyBreakdownCard } from "@/components/dashboard/strategy-breakdown-card"
import { RecentTradesList } from "@/components/dashboard/recent-trades-list"
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid"

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
        <div className="flex flex-col items-center gap-8">
          {/* Branded logo mark with pulse */}
          <div className="relative">
            <div className="absolute inset-0 -m-4 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute inset-0 -m-2 rounded-full border border-primary/10" />
            <div className="relative p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <NeuralSparkIcon className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Loading Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              Syncing your trading data...
            </p>
          </div>

          {/* Animated progress bar */}
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full"
              style={{
                width: "40%",
                animation: "loading-slide 1.5s ease-in-out infinite",
              }}
            />
          </div>

          <style>{`
            @keyframes loading-slide {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(200%); }
              100% { transform: translateX(-100%); }
            }
          `}</style>
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
              <WisdomSparkIcon className="w-5 h-5 text-primary" />
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
            <EquityChartCard
              chartData={chartData}
              chartViewMode={chartViewMode}
              setChartViewMode={setChartViewMode}
              filteredTrades={filteredTrades}
              calendarMonth={calendarMonth}
              setCalendarMonth={setCalendarMonth}
              displayFormat={displayFormat}
              selectedCurrency={selectedCurrency}
              convert={convert}
            />
          </div>

          {/* Strategy Pie Chart (Right, 1/3 width) */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            <StrategyBreakdownCard
              strategyData={strategyData}
              strategyColors={STRATEGY_COLORS}
            />
          </div>
        </div>

        {/* Recent Trades & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
          <RecentTradesList
            trades={filteredTrades}
            calculatePnL={calculateInstrumentPnL}
            getStrategyIcon={getStrategyIcon}
          />

          {/* Quick Actions & AI Insight */}
          <div className="space-y-6">
            <QuickActionsGrid />
            <AINeuralInsight trades={trades} />
          </div>
        </div>
      </div>
    </div>
  )
}

