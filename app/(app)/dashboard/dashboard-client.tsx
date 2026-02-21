"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { format, subDays } from "date-fns"
import { calculateInstrumentPnL } from "@/types/instrument-calculations"
import { useCurrencyConversion } from "@/hooks/use-currency-conversion"
import {
    getPnLThreshold,
    getWinRateThreshold,
    getProfitFactorThreshold,
    getAvgReturnThreshold,
    getStreakThreshold
} from "@/lib/semantic-thresholds"
import type { Trade } from "@/types"

// --- UI Components (Shadcn) ---
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// --- Icons ---
import {
    TrendingUp,
    Plus,
    LayoutDashboard,
    MessageCircle,
    Calendar,
} from "lucide-react"

import {
    ProfitChartIcon,
    ScalpIcon,
    ProfitFactorIcon,
    AvgReturnIcon,
    BreakoutIcon,
    MeanReversionIcon,
    MomentumFlowIcon,
    PulseIcon,
    PnLIcon,
    WinRateIcon,
} from "@/components/icons/system-icons"

import { CurrencySelector } from "@/components/currency-selector"
import { formatCurrencyValue } from "@/lib/currency-config"
import { OnboardingChecklist } from "@/components/onboarding-checklist"
import { AINeuralInsight } from "@/components/dashboard/ai-neural-insight"
import { MetricCard } from "@/components/dashboard/metric-card"
import { EquityChartCard } from "@/components/dashboard/equity-chart-card"
import { StrategyBreakdownCard } from "@/components/dashboard/strategy-breakdown-card"
import { RecentTradesList } from "@/components/dashboard/recent-trades-list"
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid"

// ==========================================
// CONSTANTS & CONFIGURATION
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
    Default: PulseIcon,
}

const MOTIVATIONAL_QUOTES = [
    "The goal of a successful trader is to make the best trades. Money is secondary.",
    "Risk comes from not knowing what you are doing.",
    "Limit your size in any position so that fear does not become the prevailing instinct.",
    "It's not whether you're right or wrong that's important, but how much money you make when you're right.",
]

// ==========================================
// LOGIC HELPERS
// ==========================================

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
// SUB-COMPONENTS
// ==========================================

const AnimatedTitle = React.memo<{ children: React.ReactNode; className?: string }>(
    ({ children, className }) => (
        <h1 className={cn("text-3xl font-extrabold tracking-tight text-foreground", className)}>
            {children}
        </h1>
    )
)

const MotivationalQuote = () => {
    // Use a hardcoded initial state to prevent hydration mismatch, then randomize if desired,
    // or just stick to the first one for stability.
    const [quoteIndex] = useState(0)

    return (
        <span className="italic text-muted-foreground animate-in fade-in duration-500">
            "{MOTIVATIONAL_QUOTES[quoteIndex]}"
        </span>
    )
}

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

interface DashboardClientProps {
    initialTrades: Trade[]
    hasAccounts: boolean
    hasStrategies: boolean
}

export default function DashboardClient({
    initialTrades,
    hasAccounts,
    hasStrategies,
}: DashboardClientProps) {
    // UI State
    const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "ytd" | "all">("30d")
    const [chartViewMode, setChartViewMode] = useState<"cumulative" | "daily" | "calendar">("cumulative")
    const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

    // --- Currency conversion ---
    const {
        selectedCurrency,
        displayFormat,
        setCurrency,
        setDisplayFormat,
        convert,
    } = useCurrencyConversion()

    // --- Data Processing ---

    // Filter by Date
    const filteredTrades = useMemo(() => {
        if (selectedPeriod === "all") return initialTrades

        const now = new Date()
        let startDate = subDays(now, 30) // default

        if (selectedPeriod === "7d") startDate = subDays(now, 7)
        if (selectedPeriod === "90d") startDate = subDays(now, 90)
        if (selectedPeriod === "ytd") startDate = new Date(now.getFullYear(), 0, 1)

        return initialTrades.filter((trade) => new Date(trade.date) >= startDate)
    }, [initialTrades, selectedPeriod])

    // Unified Pre-Processing
    const processedTrades = useMemo(() => {
        return filteredTrades.map((trade) => {
            const pnl = trade.pnl !== undefined
                ? trade.pnl
                : calculateInstrumentPnL(trade.instrument, trade.direction, trade.entry_price, trade.exit_price, trade.size)?.adjustedPnL ?? 0
            return { ...trade, pnl }
        })
    }, [filteredTrades])

    // Calculate Statistics
    const stats = useMemo(() => {
        if (processedTrades.length === 0) {
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

        const totalPnL = processedTrades.reduce((acc, t) => acc + t.pnl, 0)
        const wins = processedTrades.filter((t) => t.pnl > 0)
        const losses = processedTrades.filter((t) => t.pnl <= 0)
        const totalTrades = processedTrades.length

        const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0)
        const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0))

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
            runningPnL += trade.pnl
            if (runningPnL > peak) peak = runningPnL
            const drawdown = peak - runningPnL
            if (drawdown > maxDrawdown) maxDrawdown = drawdown

            if (trade.pnl > 0) {
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
    }, [processedTrades])

    // Prepare Chart Data
    const chartData = useMemo(() => {
        if (processedTrades.length === 0) return []
        const sorted = [...processedTrades].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        let cumulative = 0
        return sorted.map((trade) => {
            cumulative += trade.pnl
            return {
                date: format(new Date(trade.date), "MMM dd"),
                fullDate: format(new Date(trade.date), "yyyy-MM-dd HH:mm"),
                cumulativePnl: cumulative,
                tradePnl: trade.pnl,
                volume: trade.size,
                outcome: trade.pnl > 0 ? "win" : "loss",
            }
        })
    }, [processedTrades])

    // Prepare Strategy Data
    const strategyData = useMemo(() => {
        const map = new Map<string, { name: string; pnl: number; wins: number; total: number }>()

        processedTrades.forEach((trade) => {
            const name = trade.setup_name || "Discretionary"
            const current = map.get(name) || { name, pnl: 0, wins: 0, total: 0 }

            current.pnl += trade.pnl
            current.total += 1
            if (trade.pnl > 0) current.wins += 1

            map.set(name, current)
        })

        return Array.from(map.values())
            .map((s) => ({ ...s, winRate: (s.wins / s.total) * 100, chartValue: s.total }))
            .sort((a, b) => b.pnl - a.pnl)
            .slice(0, 5) // Top 5
    }, [processedTrades])

    // Pre-calculated memoized values for MetricCards to prevent inline object creation re-rendering issues
    const pnlTrendData = useMemo(() => chartData.map((d) => ({ value: d.cumulativePnl })), [chartData])
    const avgReturnTrendData = useMemo(() => chartData.map((d) => ({ value: d.tradePnl })), [chartData])
    // Simple trend simulation, properly memoized
    const winRateTrendData = useMemo(() => [
        { value: 45 }, { value: 48 }, { value: 52 }, { value: stats.winRate }
    ], [stats.winRate])

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                    <div className="space-y-1 relative">
                        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            <span className="flex items-center text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                                <TrendingUp className="w-3 h-3 mr-1" /> {getGreeting()}
                            </span>
                            <span>•</span>
                            <span suppressHydrationWarning>{format(new Date(), "MMMM dd, yyyy")}</span>
                        </div>

                        <AnimatedTitle className="text-3xl sm:text-4xl flex items-center gap-3">
                            <LayoutDashboard className="w-8 h-8 text-primary/80" />
                            Dashboard Overview
                        </AnimatedTitle>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-2xl pt-1">
                            <MessageCircle className="w-5 h-5 text-primary" />
                            <MotivationalQuote />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        {/* Period Selector */}
                        <div
                            role="group"
                            aria-label="Select timeframe filter"
                            className="glass-card p-1 rounded-xl shadow-sm border border-border flex items-center gap-1 backdrop-blur-sm"
                        >
                            {(["7d", "30d", "90d", "ytd", "all"] as const).map((period) => (
                                <Button
                                    key={period}
                                    variant={selectedPeriod === period ? "default" : "ghost"}
                                    size="sm"
                                    aria-pressed={selectedPeriod === period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={cn(
                                        "rounded-lg px-3 py-1.5 text-xs font-bold transition-all tactile-transition",
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
                                className="rounded-xl h-10 px-6 shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-all btn-enhanced magnetic-hover"
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
                    hasTrades={initialTrades.length > 0}
                />

                {processedTrades.length === 0 && initialTrades.length > 0 ? (
                    <div className="mt-8 flex flex-col justify-center items-center py-24 glass-card rounded-xl border border-dashed border-border text-center">
                        <div className="p-4 bg-muted/50 rounded-full mb-4">
                            <Calendar className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">No trades found</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mt-2">
                            You haven't executed any trades in the selected {selectedPeriod.toUpperCase()} period.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-6 rounded-xl border-border"
                            onClick={() => setSelectedPeriod("all")}
                        >
                            View All Time
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up">
                            <MetricCard
                                className="stagger-1"
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
                                changeType={getPnLThreshold(stats.totalPnL)}
                                icon={PnLIcon}
                                iconColor="text-chart-1"
                                trendData={pnlTrendData}
                                subtitle="Net profit after commissions"
                                isHot={stats.totalPnL > 0 && stats.winRate > 50}
                            />

                            <MetricCard
                                className="stagger-2"
                                title="Win Rate"
                                value={`${stats.winRate.toFixed(1)}%`}
                                change={`${stats.winningTrades}W - ${stats.losingTrades}L`}
                                changeType={getWinRateThreshold(stats.winRate)}
                                icon={WinRateIcon}
                                iconColor="text-chart-2"
                                trendData={winRateTrendData}
                                subtitle={`Current Streak: ${stats.consecutiveWins} Wins`}
                                isHot={getStreakThreshold(stats.consecutiveWins)}
                            />

                            <MetricCard
                                className="stagger-3"
                                title="Profit Factor"
                                value={stats.profitFactor.toFixed(2)}
                                change={`Exp: $${stats.expectancy.toFixed(2)}`}
                                changeType={getProfitFactorThreshold(stats.profitFactor)}
                                icon={ProfitFactorIcon}
                                iconColor="text-chart-3"
                                subtitle="Gross Profit / Gross Loss"
                            />

                            <MetricCard
                                className="stagger-4"
                                title="Avg Return"
                                value={`$${stats.avgReturn.toFixed(2)}`}
                                change={`DD: -$${Math.abs(stats.largestDrawdown).toFixed(0)}`}
                                changeType={getAvgReturnThreshold(stats.avgReturn)}
                                icon={AvgReturnIcon}
                                iconColor="text-chart-4"
                                trendData={avgReturnTrendData}
                                subtitle="Average P&L per trade"
                            />
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                            {/* Equity Chart (Left, 2/3 width) */}
                            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                <EquityChartCard
                                    chartData={chartData}
                                    chartViewMode={chartViewMode}
                                    setChartViewMode={setChartViewMode}
                                    filteredTrades={processedTrades}
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 pb-8">
                            <RecentTradesList
                                trades={processedTrades}
                                calculatePnL={calculateInstrumentPnL}
                                getStrategyIcon={getStrategyIcon}
                            />

                            {/* Quick Actions & AI Insight */}
                            <div className="space-y-4 sm:space-y-6">
                                <AINeuralInsight trades={initialTrades} />
                                <QuickActionsGrid />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
