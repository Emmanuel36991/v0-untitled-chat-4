"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar as CalendarIcon,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  AlertTriangle,
  RefreshCw,
  PieChart,
  Zap,
  ChevronRight,
  Flame,
  Wallet,
  ArrowRight,
  Maximize2,
  Minimize2,
  Activity,
  Layers,
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
  ComposedChart,
  Line,
  Brush,
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
import {
  format,
  subDays,
  eachDayOfInterval,
  isSameDay,
  getDay,
  startOfMonth,
  endOfMonth,
} from "date-fns"

// --- Types & Interfaces ---

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ElementType
  iconColor: string
  chartData?: any[]
  chartColor?: string
}

interface CalendarHeatmapProps {
  trades: Trade[]
  currentDate: Date
}

// --- Constants ---

const STRATEGY_COLORS = [
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#f43f5e", // rose-500
  "#06b6d4", // cyan-500
]

// --- Helper Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border border-border/50 backdrop-blur-xl p-4 rounded-xl shadow-2xl text-xs space-y-2 min-w-[200px] animate-in fade-in zoom-in-95">
        <p className="font-semibold text-muted-foreground border-b border-border pb-2 mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => {
          if (entry.value === 0 && entry.dataKey === "drawdown") return null;
          return (
            <div key={index} className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-2 text-muted-foreground capitalize">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name === "cumulativePnl" ? "Equity" : entry.name}
              </span>
              <span
                className={cn(
                  "font-mono font-medium",
                  entry.value > 0 ? "text-green-500" : entry.value < 0 ? "text-red-500" : ""
                )}
              >
                 {entry.name === "Trades" ? entry.value : `$${Number(entry.value).toFixed(2)}`}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor,
  chartData,
  chartColor = "#3b82f6",
}: MetricCardProps) => (
  <Card className="relative overflow-hidden border border-border/40 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 group">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        </div>
        <div
          className={cn(
            "p-2.5 rounded-xl bg-secondary/50 group-hover:scale-110 transition-transform duration-300",
            iconColor.replace("bg-", "text-") // quick hack to tint icon
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        {change && (
          <Badge
            variant="secondary"
            className={cn(
              "font-medium text-xs px-2 py-0.5",
              changeType === "positive" && "text-green-600 bg-green-500/10",
              changeType === "negative" && "text-red-600 bg-red-500/10",
              changeType === "neutral" && "text-muted-foreground bg-secondary"
            )}
          >
            {changeType === "positive" ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : changeType === "negative" ? (
              <TrendingDown className="w-3 h-3 mr-1" />
            ) : null}
            {change}
          </Badge>
        )}

        {/* Mini Sparkline */}
        {chartData && chartData.length > 0 && (
          <div className="h-8 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#grad-${title})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

// --- Main Page Component ---

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Dashboard State
  const [period, setPeriod] = useState<"30d" | "90d" | "ytd" | "all">("30d")
  const { displayFormat, setDisplayFormat } = usePnLDisplay()
  const { config } = useUserConfig()

  // Load Data
  const loadTrades = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)
    try {
      const data = await getTrades()
      setTrades(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadTrades()
  }, [loadTrades])

  // --- Data Processing ---

  const filteredTrades = useMemo(() => {
    const now = new Date()
    let start = subDays(now, 30)
    if (period === "90d") start = subDays(now, 90)
    if (period === "ytd") start = new Date(now.getFullYear(), 0, 1)
    if (period === "all") start = new Date(0)

    return trades
      .filter((t) => new Date(t.date) >= start)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [trades, period])

  // Advanced Stats Calculation
  const stats = useMemo(() => {
    let cumulative = 0
    let peak = -Infinity
    let maxDD = 0
    let wins = 0
    let grossProfit = 0
    let grossLoss = 0

    const processed = filteredTrades.map(t => {
      const { adjustedPnL } = calculateInstrumentPnL(t.instrument, t.direction, t.entry_price, t.exit_price, t.size)
      
      cumulative += adjustedPnL
      if (cumulative > peak) peak = cumulative
      const dd = peak - cumulative
      if (dd > maxDD) maxDD = dd

      if (adjustedPnL > 0) {
        wins++
        grossProfit += adjustedPnL
      } else {
        grossLoss += Math.abs(adjustedPnL)
      }

      return { ...t, adjustedPnL, cumulative, dd: -dd }
    })

    const totalTrades = processed.length
    const winRate = totalTrades ? (wins / totalTrades) * 100 : 0
    const profitFactor = grossLoss ? grossProfit / grossLoss : grossProfit

    return {
      totalPnL: cumulative,
      winRate,
      profitFactor,
      maxDD,
      totalTrades,
      bestTrade: Math.max(...processed.map(t => t.adjustedPnL), 0),
      processedData: processed
    }
  }, [filteredTrades])

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Aggregate by day for cleaner charts
    const dayMap = new Map()

    stats.processedData.forEach(trade => {
      const dateStr = format(new Date(trade.date), "yyyy-MM-dd")
      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, { 
          date: dateStr, 
          displayDate: format(new Date(trade.date), "MMM dd"),
          dailyPnl: 0, 
          cumulativePnl: 0, // Will set later
          drawdown: 0,
          volume: 0,
          tradesCount: 0 
        })
      }
      const entry = dayMap.get(dateStr)
      entry.dailyPnl += trade.adjustedPnL
      entry.volume += trade.size
      entry.tradesCount += 1
      // Note: Cumulative needs to be the END of day value
    })

    // Re-calculate cumulative based on daily aggregates to ensure accuracy
    let runningTotal = 0
    let runningPeak = -Infinity
    
    return Array.from(dayMap.values())
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((day: any) => {
        runningTotal += day.dailyPnl
        if (runningTotal > runningPeak) runningPeak = runningTotal
        const dd = runningTotal - runningPeak

        return {
          ...day,
          cumulativePnl: runningTotal,
          drawdown: dd,
          peak: runningPeak
        }
      })
  }, [stats.processedData])

  // Strategy Distribution
  const strategyData = useMemo(() => {
    const map = new Map()
    filteredTrades.forEach(t => {
      const name = t.setup_name || "Discretionary"
      const current = map.get(name) || { name, value: 0 }
      map.set(name, { name, value: current.value + 1 })
    })
    return Array.from(map.values()).sort((a, b) => b.value - a.value)
  }, [filteredTrades])

  if (isLoading && !isRefreshing) {
    return <div className="h-screen flex items-center justify-center"><RefreshCw className="animate-spin w-8 h-8 text-muted-foreground" /></div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1800px] mx-auto">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Overview of your trading performance for the last 
            <span className="font-semibold text-foreground">{period === 'all' ? 'All Time' : period.toUpperCase()}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
           <Tabs value={period} onValueChange={(v: any) => setPeriod(v)} className="w-full lg:w-auto">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
              <TabsTrigger value="ytd">YTD</TabsTrigger>
              <TabsTrigger value="all">ALL</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <PnLDisplaySelector currentFormat={displayFormat} onFormatChange={setDisplayFormat} />
          
          <Button onClick={() => loadTrades(false)} variant="outline" size="icon" className={cn(isRefreshing && "animate-spin")}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Link href="/add-trade"><Plus className="w-4 h-4 mr-2" /> New Trade</Link>
          </Button>
        </div>
      </div>

      {/* --- Metrics Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Net P&L"
          value={`$${stats.totalPnL.toFixed(2)}`}
          change={`${stats.totalTrades} Trades`}
          changeType={stats.totalPnL >= 0 ? "positive" : "negative"}
          icon={Wallet}
          iconColor="text-blue-500 bg-blue-500/10"
          chartData={chartData.map(d => ({ value: d.cumulativePnl }))}
          chartColor={stats.totalPnL >= 0 ? "#10b981" : "#ef4444"}
        />
        <MetricCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          changeType={stats.winRate > 50 ? "positive" : "neutral"}
          change={stats.winRate > 50 ? "Healthy" : "Needs Work"}
          icon={Target}
          iconColor="text-purple-500 bg-purple-500/10"
          chartData={chartData.map(d => ({ value: d.dailyPnl > 0 ? 1 : 0 }))} // Win streak vis
          chartColor="#8b5cf6"
        />
        <MetricCard
          title="Profit Factor"
          value={stats.profitFactor.toFixed(2)}
          changeType={stats.profitFactor > 1.5 ? "positive" : "neutral"}
          change="Gross Ratio"
          icon={Award}
          iconColor="text-amber-500 bg-amber-500/10"
        />
        <MetricCard
          title="Max Drawdown"
          value={`-$${stats.maxDD.toFixed(2)}`}
          changeType="negative"
          change="From Peak"
          icon={TrendingDown}
          iconColor="text-rose-500 bg-rose-500/10"
          chartData={chartData.map(d => ({ value: d.drawdown }))}
          chartColor="#f43f5e"
        />
      </div>

      {/* --- Main Visualization Section --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[500px]">
        
        {/* BIG CHART: Equity & Activity */}
        <Card className="xl:col-span-2 flex flex-col border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Account Growth & Drawdown
              </CardTitle>
              <CardDescription>Visualizing equity curve against daily performance</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[450px] p-0 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }} 
                  minTickGap={40}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false}
                  hide
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* 0 Line */}
                <ReferenceLine y={0} yAxisId="left" stroke="#6b7280" strokeDasharray="3 3" opacity={0.5} />

                {/* Drawdown (Area Underlay) */}
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="drawdown" 
                  stroke="none" 
                  fill="url(#colorDD)" 
                  name="Drawdown"
                />

                {/* Daily P&L (Bars) */}
                <Bar 
                  yAxisId="right"
                  dataKey="dailyPnl" 
                  name="Daily P&L"
                  barSize={8}
                  radius={[2, 2, 0, 0]}
                  opacity={0.6}
                >
                   {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.dailyPnl >= 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>

                {/* Equity Curve (Main Line) */}
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="cumulativePnl" 
                  name="Cumulative P&L"
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#colorEquity)" 
                />

                <Brush 
                  dataKey="date" 
                  height={30} 
                  stroke="#3b82f6" 
                  fill="var(--background)"
                  tickFormatter={() => ""}
                  className="opacity-50"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Side Panel: Strategy & Calendar */}
        <div className="space-y-6 flex flex-col">
          {/* Strategy Donut */}
          <Card className="flex-1 border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Strategy Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[200px]">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={strategyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {strategyData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={STRATEGY_COLORS[index % STRATEGY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover border p-2 rounded shadow-md text-xs">
                                <span className="font-bold">{payload[0].name}</span>: {payload[0].value} trades
                              </div>
                            )
                          }
                          return null
                       }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold">{strategyData.length}</span>
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

           {/* Economic Calendar Mini */}
           <EconomicCalendarWidget className="flex-1" />
        </div>
      </div>

      {/* --- Recent Activity Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Your latest execution history</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/trades" className="text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {filteredTrades.slice(0, 5).reverse().map((trade) => (
                <div key={trade.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={cn(
                       "w-10 h-10 rounded-full flex items-center justify-center",
                       trade.outcome === 'win' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                     )}>
                       {trade.direction === 'long' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                     </div>
                     <div>
                       <p className="font-bold text-sm">{trade.instrument}</p>
                       <p className="text-xs text-muted-foreground">{format(new Date(trade.date), "MMM dd, HH:mm")} • {trade.setup_name || "Manual"}</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-mono font-medium text-sm",
                      trade.pnl > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {trade.pnl > 0 ? "+" : ""}{displayFormat === 'dollars' ? `$${trade.pnl.toFixed(2)}` : `${trade.pnl}R`}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">{trade.outcome}</p>
                  </div>
                </div>
              ))}
              {filteredTrades.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No trades recorded for this period.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / AI */}
        <div className="space-y-6">
           <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
             <CardHeader className="relative">
               <div className="flex items-center gap-2 mb-2">
                 <Zap className="w-4 h-4 text-yellow-300" />
                 <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">AI Insight</span>
               </div>
               <CardTitle className="text-lg">Pattern Detected</CardTitle>
             </CardHeader>
             <CardContent className="relative space-y-4">
               <p className="text-sm text-indigo-50/90 leading-relaxed">
                 You have a <span className="font-bold text-white">72% Win Rate</span> on trending days, but only 34% during consolidation. Consider filtering for high ADX environments.
               </p>
               <Button variant="secondary" className="w-full text-indigo-700 font-semibold" asChild>
                 <Link href="/insights">View Analysis</Link>
               </Button>
             </CardContent>
           </Card>

           <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5" asChild>
                <Link href="/playbook">
                  <Layers className="w-5 h-5 text-primary" />
                  <span className="text-xs">Playbook</span>
                </Link>
             </Button>
             <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-blue-500/50 hover:bg-blue-500/5" asChild>
                <Link href="/journal">
                   <CalendarIcon className="w-5 h-5 text-blue-500" />
                   <span className="text-xs">Journal</span>
                </Link>
             </Button>
           </div>
        </div>
      </div>
    </div>
  )
}
