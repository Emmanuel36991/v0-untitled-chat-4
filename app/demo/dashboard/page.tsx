"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  BookOpen,
  Eye,
  Activity,
  Clock,
  RefreshCw,
  PieChart,
  LineChart,
  ChevronRight,
  TrendingUp as TrendUp,
  Star,
} from "lucide-react"
import {
  BreakoutIcon,
  ScalpIcon,
  MomentumFlowIcon,
  MeanReversionIcon,
  CompassIcon,
  PulseIcon,
} from "@/components/icons/system-icons"
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
} from "recharts"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ElementType
  iconColor: string
  trend?: number
  subtitle?: string
}

interface QuickStatProps {
  label: string
  value: string
  icon: React.ElementType
  color: string
}

// Strategy color palette (same as real dashboard)
const STRATEGY_COLORS = [
  {
    bg: "bg-gradient-to-br from-primary to-primary",
    text: "text-primary",
    light: "bg-primary/10",
    border: "border-primary/30",
  },
  {
    bg: "bg-gradient-to-br from-secondary to-secondary",
    text: "text-secondary",
    light: "bg-secondary/10",
    border: "border-secondary/30",
  },
  {
    bg: "bg-gradient-to-br from-accent to-accent",
    text: "text-accent",
    light: "bg-accent/10",
    border: "border-accent/30",
  },
  {
    bg: "bg-gradient-to-br from-warning to-warning",
    text: "text-warning",
    light: "bg-warning/10",
    border: "border-warning/30",
  },
  {
    bg: "bg-gradient-to-br from-pink-500 to-pink-600",
    text: "text-pink-700 dark:text-pink-300",
    light: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200 dark:border-pink-800",
  },
]

// Strategy icons mapping (same as real dashboard)
const STRATEGY_ICONS = {
  Breakout: BreakoutIcon,
  Reversal: MeanReversionIcon,
  "Trend Following": MomentumFlowIcon,
  Scalping: ScalpIcon,
  "Swing Trading": Activity,
  Default: CompassIcon,
}

const getStrategyIcon = (strategyName: string) => {
  const normalizedName = strategyName.toLowerCase()
  if (normalizedName.includes("breakout")) return STRATEGY_ICONS.Breakout
  if (normalizedName.includes("reversal")) return STRATEGY_ICONS.Reversal
  if (normalizedName.includes("trend")) return STRATEGY_ICONS["Trend Following"]
  if (normalizedName.includes("scalp")) return STRATEGY_ICONS.Scalping
  if (normalizedName.includes("swing")) return STRATEGY_ICONS["Swing Trading"]
  return STRATEGY_ICONS.Default
}

// Animated Title Component (same as real dashboard)
const AnimatedTitle = React.memo<{ children: React.ReactNode; className?: string; delay?: number }>(
  ({ children, className, delay = 0 }) => (
    <h1
      className={cn(
        "text-3xl font-bold text-gray-900 dark:text-white tracking-tight",
        "animate-fade-in-up drop-shadow-lg",
        "leading-tight pb-1",
        "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </h1>
  ),
)

// Enhanced Metric Card Component (same as real dashboard)
const MetricCard = React.memo<MetricCardProps>(
  ({ title, value, change, changeType = "neutral", icon: Icon, iconColor, trend, subtitle }) => (
    <Card className="relative overflow-hidden bg-card border-0 shadow-lg hover:shadow-xl transition-all duration-500 group hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "p-3 rounded-xl shadow-lg",
                  iconColor,
                  "group-hover:scale-110 transition-transform duration-300",
                )}
              >
                <Icon className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground tracking-tight drop-shadow-sm">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            {change && (
              <div className="flex items-center space-x-1">
                {changeType === "positive" && <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
                {changeType === "negative" && <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
                <span
                  className={cn(
                    "text-sm font-medium",
                    changeType === "positive" && "text-green-600 dark:text-green-400",
                    changeType === "negative" && "text-red-600 dark:text-red-400",
                    changeType === "neutral" && "text-muted-foreground",
                  )}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          {trend !== undefined && (
            <div className="ml-4">
              <div className="w-20 h-10 flex items-end space-x-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-sm transition-all duration-300 group-hover:opacity-80",
                      trend > 0 ? "bg-green-200 dark:bg-green-800" : "bg-red-200 dark:bg-red-800",
                    )}
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  ),
)

// Enhanced Quick Stat Component (same as real dashboard)
const QuickStat = React.memo<QuickStatProps>(({ label, value, icon: Icon, color }) => (
  <div className="flex items-center space-x-3 p-4 bg-muted rounded-xl border border-border hover:border-border/80 transition-all duration-300 hover:shadow-md">
    <div className={cn("p-3 rounded-xl shadow-md", color, "hover:scale-110 transition-transform duration-300")}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  </div>
))

const mockTrades = [
  {
    id: "1",
    instrument: "AAPL",
    direction: "long",
    outcome: "win",
    pnl: 450,
    date: "2025-01-21",
    setup_name: "Breakout Strategy",
    risk_reward_ratio: 2.5,
    notes: "Perfect entry on morning breakout. Followed the plan exactly and took profits at resistance.",
  },
  {
    id: "2",
    instrument: "TSLA",
    direction: "short",
    outcome: "loss",
    pnl: -120,
    date: "2025-01-21",
    setup_name: "Reversal Play",
    risk_reward_ratio: 1.8,
    notes: "Got stopped out too early. Need to give more room on volatile stocks.",
  },
  {
    id: "3",
    instrument: "NVDA",
    direction: "long",
    outcome: "win",
    pnl: 680,
    date: "2025-01-20",
    setup_name: "Trend Following",
    risk_reward_ratio: 3.2,
    notes: "Excellent trend continuation trade. Held through minor pullback and was rewarded.",
  },
  {
    id: "4",
    instrument: "MSFT",
    direction: "long",
    outcome: "win",
    pnl: 320,
    date: "2025-01-20",
    setup_name: "Breakout Strategy",
    risk_reward_ratio: 2.1,
    notes: "Clean breakout with volume confirmation. Textbook setup.",
  },
  {
    id: "5",
    instrument: "GOOGL",
    direction: "short",
    outcome: "win",
    pnl: 890,
    date: "2025-01-19",
    setup_name: "Reversal Play",
    risk_reward_ratio: 4.5,
    notes: "Big winner! Caught the top perfectly and rode it down. Best trade of the week.",
  },
  {
    id: "6",
    instrument: "AMZN",
    direction: "long",
    outcome: "win",
    pnl: 540,
    date: "2025-01-19",
    setup_name: "Swing Trading",
    risk_reward_ratio: 2.8,
    notes: "Multi-day hold paid off. Patience was key here.",
  },
  {
    id: "7",
    instrument: "META",
    direction: "long",
    outcome: "loss",
    pnl: -200,
    date: "2025-01-18",
    setup_name: "Breakout Strategy",
    risk_reward_ratio: 1.5,
    notes: "False breakout. Should have waited for confirmation.",
  },
  {
    id: "8",
    instrument: "SPY",
    direction: "long",
    outcome: "win",
    pnl: 380,
    date: "2025-01-18",
    setup_name: "Scalping",
    risk_reward_ratio: 2.0,
    notes: "Quick scalp on market open. In and out in 15 minutes.",
  },
]

const mockMetrics = {
  totalPnL: 47230,
  totalTrades: 1247,
  winRate: 73.2,
  avgReturn: 285,
  bestTrade: mockTrades[4],
  worstTrade: mockTrades[6],
  winningTrades: 914,
  losingTrades: 333,
  profitFactor: 2.4,
  avgWin: 385,
  avgLoss: -160,
}

const mockChartData = [
  { date: "01/14", cumulativePnl: 38500, tradePnl: 450, instrument: "AAPL" },
  { date: "01/15", cumulativePnl: 39800, tradePnl: 1300, instrument: "NVDA" },
  { date: "01/16", cumulativePnl: 40200, tradePnl: 400, instrument: "MSFT" },
  { date: "01/17", cumulativePnl: 42100, tradePnl: 1900, instrument: "GOOGL" },
  { date: "01/18", cumulativePnl: 43500, tradePnl: 1400, instrument: "AMZN" },
  { date: "01/19", cumulativePnl: 44800, tradePnl: 1300, instrument: "META" },
  { date: "01/20", cumulativePnl: 46200, tradePnl: 1400, instrument: "TSLA" },
  { date: "01/21", cumulativePnl: 47230, tradePnl: 1030, instrument: "SPY" },
]

const mockStrategyData = [
  { name: "Breakout Strategy", trades: 342, winRate: 76.3, totalPnl: 15420, avgPnl: 45.1 },
  { name: "Trend Following", trades: 289, winRate: 71.8, totalPnl: 12890, avgPnl: 44.6 },
  { name: "Reversal Play", trades: 234, winRate: 68.4, totalPnl: 9870, avgPnl: 42.2 },
  { name: "Swing Trading", trades: 198, winRate: 74.2, totalPnl: 8450, avgPnl: 42.7 },
  { name: "Scalping", trades: 184, winRate: 79.3, totalPnl: 7600, avgPnl: 41.3 },
]

const mockDistributionData = [
  { name: "Wins", value: 914, color: "#10b981", percentage: 73.2 },
  { name: "Losses", value: 333, color: "#ef4444", percentage: 26.8 },
]

// Enhanced Trade Item Component
const TradeItem = React.memo<{ trade: any; isCompact?: boolean }>(({ trade, isCompact = false }) => {
  const isLong = trade.direction === "long"
  const isWin = trade.outcome === "win"
  const pnlColor = trade.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-border/80 transition-all duration-300 group hover:shadow-lg hover:scale-[1.02]",
        isCompact && "p-3",
      )}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div
          className={cn(
            "p-3 rounded-full shadow-md transition-transform duration-300 group-hover:scale-110",
            isLong ? "bg-gradient-to-br from-green-400 to-green-600" : "bg-gradient-to-br from-red-400 to-red-600",
          )}
        >
          {isLong ? <ArrowUpRight className="h-5 w-5 text-white" /> : <ArrowDownRight className="h-5 w-5 text-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <p className="font-bold text-foreground text-sm">{trade.instrument}</p>
            <Badge
              variant={isWin ? "default" : "destructive"}
              className={cn(
                "text-xs px-3 py-1 font-medium shadow-sm",
                isWin ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600",
              )}
            >
              {trade.outcome.charAt(0).toUpperCase() + trade.outcome.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{new Date(trade.date).toLocaleDateString()}</span>
            {trade.setup_name && (
              <>
                <span>•</span>
                <span className="truncate font-medium">{trade.setup_name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className={cn("font-bold text-sm", pnlColor)}>
            {trade.pnl >= 0 ? "+" : ""}${Math.abs(trade.pnl).toFixed(2)}
          </p>
          {trade.risk_reward_ratio && <p className="text-xs text-muted-foreground">R:R {trade.risk_reward_ratio}</p>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-muted"
          disabled
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

// Enhanced Strategy Performance Component
const StrategyPerformance = React.memo<{ strategies: any[] }>(({ strategies }) => {
  if (strategies.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No strategies recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {strategies.map((strategy, index) => {
        const colorScheme = STRATEGY_COLORS[index % STRATEGY_COLORS.length]
        const StrategyIcon = getStrategyIcon(strategy.name)

        return (
          <div
            key={strategy.name}
            className={cn(
              "p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group",
              colorScheme.light,
              colorScheme.border,
              "dark:bg-gray-800/50 dark:border-gray-700",
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "p-3 rounded-xl shadow-lg",
                    colorScheme.bg,
                    "group-hover:scale-110 transition-transform duration-300",
                  )}
                >
                  <StrategyIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className={cn("font-bold text-sm", colorScheme.text, "dark:text-white")}>{strategy.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Trading Strategy</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-medium px-3 py-1 shadow-sm">
                {strategy.trades} trades
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm mb-4">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Win Rate</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{strategy.winRate.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Avg P&L</p>
                <p
                  className={cn(
                    "font-bold text-lg",
                    strategy.avgPnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                  )}
                >
                  ${strategy.avgPnl.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Total P&L</p>
                <p
                  className={cn(
                    "font-bold text-lg",
                    strategy.totalPnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                  )}
                >
                  ${strategy.totalPnl.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Performance</span>
                <span>{strategy.winRate.toFixed(1)}%</span>
              </div>
              <Progress value={strategy.winRate} className="h-2 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        )
      })}
    </div>
  )
})

// Main Demo Dashboard Component
export default function DemoDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Demo Banner */}
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-xl p-4 text-center">
          <p className="text-sm font-medium">
            🎯 <strong>Demo Mode</strong> - Exploring with sample data •{" "}
            <Link href="/signup" className="text-accent hover:underline font-semibold">
              Sign up free
            </Link>{" "}
            to track your real trades
          </p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 relative">
            {/* Main header container with gradient background - matching real dashboard */}
            <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 p-8 shadow-xl backdrop-blur-sm">
              <AnimatedTitle
                delay={0}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                Trading Dashboard
              </AnimatedTitle>

              <p
                className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in-up"
                style={{ animationDelay: "200ms" }}
              >
                Real-time performance analytics and insights
              </p>
            </div>
          </div>
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex items-center space-x-2 p-1 bg-muted rounded-lg">
              {[
                { key: "7d", label: "7D" },
                { key: "30d", label: "30D" },
                { key: "90d", label: "90D" },
                { key: "all", label: "All" },
              ].map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.key as "7d" | "30d" | "90d" | "all")}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 transition-all duration-200",
                    selectedPeriod === period.key
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {period.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button disabled className="bg-gradient-to-r from-primary to-accent opacity-50 cursor-not-allowed">
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh Data
              </Button>
              <Button disabled className="bg-gradient-to-r from-green-600 to-emerald-600 opacity-50 cursor-not-allowed">
                <Plus className="h-5 w-5 mr-2" />
                Add Trade
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up"
          style={{ animationDelay: "800ms" }}
        >
          <MetricCard
            title="Total P&L"
            value={`$${mockMetrics.totalPnL.toFixed(2)}`}
            change={`${mockMetrics.totalTrades} trades`}
            changeType="positive"
            icon={DollarSign}
            iconColor="bg-gradient-to-br from-green-500 to-green-600"
            trend={mockMetrics.totalPnL}
          />

          <MetricCard
            title="Win Rate"
            value={`${mockMetrics.winRate.toFixed(1)}%`}
            change={`${mockMetrics.winningTrades}W / ${mockMetrics.losingTrades}L`}
            changeType="positive"
            icon={Target}
            iconColor="bg-gradient-to-br from-green-500 to-green-600"
            trend={mockMetrics.winRate}
          />

          <MetricCard
            title="Profit Factor"
            value={mockMetrics.profitFactor.toFixed(2)}
            change="Gross Profit / Gross Loss"
            changeType="positive"
            icon={Award}
            iconColor="bg-gradient-to-br from-green-500 to-green-600"
            trend={mockMetrics.profitFactor}
          />

          <MetricCard
            title="Average Return"
            value={`$${mockMetrics.avgReturn.toFixed(2)}`}
            change="Per trade average"
            changeType="positive"
            icon={BarChart3}
            iconColor="bg-gradient-to-br from-primary to-accent"
            trend={mockMetrics.avgReturn}
          />
        </div>

        {/* Enhanced Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: "1000ms" }}>
          <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                      <LineChart className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold drop-shadow-sm">Performance Overview</span>
                  </CardTitle>
                  <CardDescription className="text-base">Cumulative P&L over time</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <QuickStat
                    label="Best Trade"
                    value={`$${mockMetrics.bestTrade.pnl.toFixed(2)}`}
                    icon={TrendUp}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: any, name: string) => [
                        `$${value.toFixed(2)}`,
                        name === "cumulativePnl" ? "Cumulative P&L" : "Trade P&L",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativePnl"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorPnL)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold drop-shadow-sm">Trade Distribution</span>
              </CardTitle>
              <CardDescription className="text-base">Win/Loss breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={mockDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mockDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {mockDistributionData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Recent Activity & Strategy Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "1200ms" }}>
          {/* Enhanced Recent Trades */}
          <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold drop-shadow-sm">Recent Trades</span>
                  </CardTitle>
                  <CardDescription className="text-base">Your latest trading activity</CardDescription>
                </div>
                <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {mockTrades.map((trade) => (
                    <TradeItem key={trade.id} trade={trade} isCompact />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Enhanced Strategy Performance */}
          <Card className="bg-white dark:bg-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold drop-shadow-sm">Top Strategies</span>
              </CardTitle>
              <CardDescription className="text-base">Performance by setup</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <StrategyPerformance strategies={mockStrategyData} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Trading Insights */}
        <Card
          className="bg-white dark:bg-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
          style={{ animationDelay: "1400ms" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold drop-shadow-sm">Recent Trading Insights</span>
            </CardTitle>
            <CardDescription className="text-base">Key learnings from your trades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTrades.slice(0, 3).map((trade) => (
                <div
                  key={`insight-${trade.id}`}
                  className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs font-medium px-3 py-1 shadow-sm">
                        {trade.instrument}
                      </Badge>
                      <Badge
                        variant={trade.outcome === "win" ? "default" : "destructive"}
                        className={cn(
                          "text-xs px-3 py-1 font-medium shadow-sm",
                          trade.outcome === "win"
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : "bg-gradient-to-r from-red-500 to-red-600",
                        )}
                      >
                        {trade.outcome}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(trade.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4">
                    {trade.notes}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span
                      className={cn(
                        "text-sm font-bold",
                        trade.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                    </span>
                    <Button variant="ghost" size="sm" disabled className="opacity-0 group-hover:opacity-100">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "1600ms" }}>
          <QuickStat label="This Week" value="47" icon={Calendar} color="bg-gradient-to-br from-blue-500 to-blue-600" />
          <QuickStat
            label="Avg Hold Time"
            value="45m"
            icon={Clock}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <QuickStat
            label="Best Win"
            value={`$${mockMetrics.bestTrade.pnl.toFixed(2)}`}
            icon={TrendingUp}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <QuickStat
            label="Worst Loss"
            value={`$${mockMetrics.worstTrade.pnl.toFixed(2)}`}
            icon={TrendingDown}
            color="bg-gradient-to-br from-red-500 to-red-600"
          />
        </div>

        {/* Enhanced Quick Actions */}
        <Card
          className="bg-card border-0 shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
          style={{ animationDelay: "1800ms" }}
        >
          <CardHeader>
            <CardTitle className="text-xl font-bold drop-shadow-sm">Quick Actions</CardTitle>
            <CardDescription className="text-base">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-primary/30 opacity-50 cursor-not-allowed"
                disabled
              >
                <div className="p-2 bg-gradient-to-br from-primary to-primary rounded-lg shadow-md">
                  <Plus className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold text-primary">Add Trade</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-secondary/10 to-secondary/20 border-2 border-secondary/30 opacity-50 cursor-not-allowed"
                disabled
              >
                <div className="p-2 bg-gradient-to-br from-secondary to-secondary rounded-lg shadow-md">
                  <BarChart3 className="h-6 w-6 text-secondary-foreground" />
                </div>
                <span className="text-sm font-bold text-secondary">Analytics</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800 opacity-50 cursor-not-allowed"
                disabled
              >
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                  <PulseIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-bold text-green-700 dark:text-green-300">Risk Calc</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-warning/10 to-warning/20 border-2 border-warning/30 opacity-50 cursor-not-allowed"
                disabled
              >
                <div className="p-2 bg-gradient-to-br from-warning to-warning rounded-lg shadow-md">
                  <BookOpen className="h-6 w-6 text-warning-foreground" />
                </div>
                <span className="text-sm font-bold text-warning">Guides</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
