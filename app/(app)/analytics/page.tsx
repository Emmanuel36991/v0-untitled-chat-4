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
import { Badge } from "@/components/ui/badge"      // <--- Added Badge import
import { Progress } from "@/components/ui/progress" // <--- Added Progress import
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { motion } from "framer-motion"
import {
  X,
  DollarSign,
  Target,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  CalendarIcon,
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
  Loader2,
  CheckCircle2,
  RefreshCw
} from "lucide-react"
import { getTrades } from "@/app/actions/trade-actions"
import type { Trade } from "@/types"
import type { DateRange } from "react-day-picker"
import { format, subDays, endOfDay } from "date-fns"
import { cn } from "@/lib/utils"
import { useAIAdvisor } from "@/hooks/use-ai-advisor"
import { AdvisorPanel } from "@/components/ai/advisor-panel"
import { EnhancedHexagram } from "@/components/charts/enhanced-hexagram"
import { CalendarTabs } from "@/components/calendar/calendar-tabs"
import { InsightsWindows } from "@/components/insights/insights-windows"
import { AnalyticsLogoSelector } from "@/components/analytics-logos"
import { TimingAnalyticsDashboard } from "@/components/charts/timing-analytics-dashboard"
import { SetupScatterChart } from "@/components/insights/setup-scatter-chart"

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

// --- 2. TYPES & INTERFACES ---

interface AnalyticsFilters {
  dateRange: DateRange | undefined
  instruments: string[]
  setups: string[]
  outcomes: string[]
  timeframe: "daily" | "weekly" | "monthly"
}

interface ProcessedAnalytics {
  // Core KPI
  totalTrades: number
  wins: number
  losses: number
  breakeven: number
  totalPnL: number
  avgPnL: number
  winRate: number
  profitFactor: number
  
  // Advanced Scoring Metrics
  maxDrawdown: number
  consistencyScore: number
  adaptabilityScore: number
  executionScore: number
  riskManagementScore: number
  efficiencyScore: number
  overallScore: number
  
  // Data Series
  monthlyData: Array<{ month: string; profit: number; trades: number }>
  dailyData: Array<{ date: string; pnl: number; trades: number; cumulative: number }>
  
  // Distributions
  setupDistribution: Record<string, { count: number; pnl: number; winRate: number }>
  instrumentDistribution: Record<string, { count: number; pnl: number; winRate: number }>
  outcomeDistribution: { wins: number; losses: number; breakeven: number }
  
  // Helper for UI
  metricsList: Array<{ name: string; value: number }>
}

// --- 3. INLINE UI COMPONENTS ---

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
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
        "fixed z-50 gap-4 bg-white dark:bg-slate-950 p-6 shadow-2xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full w-[90%] border-l border-slate-200 dark:border-slate-800 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm lg:max-w-2xl",
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <X className="h-4 w-4 text-slate-500" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

function DatePickerWithRange({
  className,
  date,
  setDate,
}: {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "justify-start text-left font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all h-9",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yy")}
                </>
              ) : (
                format(date.from, "MMM dd, y")
              )
            ) : (
              <span>Select Period</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarPrimitive
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            className="p-3 pointer-events-auto bg-white border border-slate-200"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const DashboardSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50 p-8 space-y-8 animate-pulse">
    <div className="h-12 w-64 bg-slate-200 rounded-lg mb-8" />
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
       {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <div className="lg:col-span-2 space-y-6">
          <div className="h-[400px] bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-[250px] bg-slate-200 rounded-2xl" />
            <div className="h-[250px] bg-slate-200 rounded-2xl" />
          </div>
       </div>
       <div className="space-y-6">
          <div className="h-[500px] bg-slate-200 rounded-2xl" />
       </div>
    </div>
  </div>
)

const MetricCard = React.memo(
  ({
    title,
    value,
    change,
    trend,
    icon: Icon,
  }: {
    title: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
    icon: any
  }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.15)] hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 group-hover:bg-indigo-50 transition-colors border border-slate-100">
           <Icon className="h-6 w-6 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        </div>
        {change && (
             <div
             className={cn(
               "flex items-center text-xs font-bold px-2.5 py-1 rounded-full border",
               trend === "up" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "",
               trend === "down" ? "text-rose-700 bg-rose-50 border-rose-100" : "text-slate-600 bg-slate-100 border-slate-200",
             )}
           >
             {trend === "up" && <ArrowUpRight className="mr-1 h-3 w-3 stroke-[3]" />}
             {trend === "down" && <ArrowDownRight className="mr-1 h-3 w-3 stroke-[3]" />}
             {change}
           </div>
        )}
      </div>
      <div className="mt-5">
         <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
         <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-1 font-feature-settings-zero">{value}</h3>
      </div>
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />
    </div>
  ),
)

const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  className,
  logoType,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  logoType?: keyof typeof import("@/components/ui/analytics-logos").AnalyticsLogos
}) => (
  <Card
    className={cn(
      "flex flex-col overflow-hidden border-slate-200 shadow-sm bg-white",
      className,
    )}
  >
    <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/30">
      <div className="flex items-center gap-4">
        {logoType && (
          <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
             <AnalyticsLogoSelector type={logoType} className="w-6 h-6" />
          </div>
        )}
        <div>
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">{title}</CardTitle>
          {subtitle && <CardDescription className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</CardDescription>}
        </div>
      </div>
      {action}
    </CardHeader>
    <CardContent className="flex-1 p-6 bg-white">{children}</CardContent>
  </Card>
)

// --- 4. MAIN PAGE COMPONENT ---

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [mainTab, setMainTab] = useState("overview")
  const [insightsTab, setInsightsTab] = useState("setups")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiReport, setAiReport] = useState<string | null>(null)
  
  // Filter State
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

  const openStatisticAdvisor = (title: string, data: string, context: string) => {
    openAdvisor(title, "analytics", data, context)
  }

  const handleGenerateAIReport = () => {
    setIsGeneratingAI(true)
    setTimeout(() => {
      setAiReport("Based on your last 50 trades, your 'Silver Bullet' setup has a 75% win rate in the AM session but drops to 30% in the PM. I recommend implementing a time-based rule to stop trading this setup after 11:00 AM EST. Additionally, your risk of ruin has increased slightly due to larger sizing on losing streaks.")
      setIsGeneratingAI(false)
    }, 2500)
  }

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true)
      try {
        const data = await getTrades()
        setTrades(data || [])
      } catch (error) {
        console.error("Failed to fetch trades", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrades()
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

    // Metrics Scores
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
            backgroundColor: "#1e293b", 
            padding: 12, 
            cornerRadius: 8, 
            titleFont: { weight: 'bold' },
            displayColors: false,
            callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${typeof ctx.raw === 'number' ? ctx.raw.toFixed(2) : ctx.raw}`
            }
        } 
    },
    scales: { 
        x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } }, 
        y: { border: { display: false }, grid: { color: "rgba(148, 163, 184, 0.1)" }, ticks: { color: "#94a3b8", font: { size: 10 }, callback: (v) => `$${Number(v).toFixed(0)}` } } 
    },
  }

  const sortedMetrics = [...analytics.metricsList].sort((a, b) => b.value - a.value)
  const strongestMetric = sortedMetrics[0] || { name: "N/A", value: 0 }
  const weakestMetric = sortedMetrics[sortedMetrics.length - 1] || { name: "N/A", value: 0 }
  const avgMetricScore = Math.round(analytics.metricsList.reduce((a, b) => a + b.value, 0) / (analytics.metricsList.length || 1))

  const topSetup = setupAnalysis.topSetups?.[0]
  const bottomSetup = setupAnalysis.bottomSetups?.[0]
  const personalEdge = setupAnalysis.personalEdge

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 transition-colors duration-500">
      
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 10%, rgba(16, 185, 129, 0.05) 0%, transparent 30%)' }}>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">Analytics</h1>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Performance Overview</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <DatePickerWithRange date={filters.dateRange} setDate={(date) => setFilters({ ...filters, dateRange: date })} />
              <Button 
                variant={showFilters ? "secondary" : "outline"} 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)} 
                className={cn("h-9 border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white transition-all", showFilters && "bg-slate-100")}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
              </Button>
            </div>

            <Sheet>
               <SheetTrigger asChild>
                 <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                    <CalendarIcon className="h-5 w-5" />
                 </Button>
               </SheetTrigger>
               <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                  <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-6">
                     <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                        <CalendarIcon className="h-6 w-6" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900">Trading Journal</h2>
                        <p className="text-slate-500 text-sm">Daily breakdown of your trading activity</p>
                     </div>
                  </div>
                  <CalendarTabs trades={trades} dailyData={analytics.dailyData} />
               </SheetContent>
            </Sheet>

            <Button 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95" 
              onClick={() => openStatisticAdvisor("General Review", `Total PnL: ${analytics.totalPnL}, Win Rate: ${analytics.winRate}`, "User dashboard review")}
            >
              <Zap className="mr-2 h-4 w-4 fill-indigo-200" /> AI Insights
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-4 animate-in slide-in-from-top-2 duration-200">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-3 sm:px-6 lg:px-8">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Instrument</Label>
                <Select onValueChange={(v) => setFilters(p => ({ ...p, instruments: v === "all" ? [] : [v] }))}>
                  <SelectTrigger className="bg-white h-9"><SelectValue placeholder="All Instruments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Instruments</SelectItem>
                    {Array.from(new Set(trades.map(t => t.instrument))).map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Setup</Label>
                 <Select onValueChange={(v) => setFilters(p => ({ ...p, setups: v === "all" ? [] : [v] }))}>
                  <SelectTrigger className="bg-white h-9"><SelectValue placeholder="All Setups" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Setups</SelectItem>
                    {Array.from(new Set(trades.map(t => t.setup_name).filter(Boolean))).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/50 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium transition-all">
                <Activity className="w-4 h-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium transition-all">
                <Brain className="w-4 h-4 mr-2" /> Intelligence
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* --- 1. TOP METRIC CARDS --- */}
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
                change={analytics.winRate > 50 ? "Strong" : "Weak"} 
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

            {/* --- 2. MAIN CHARTS (Better Spacing) --- */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* EQUITY CURVE - Takes 2/3 width */}
              <ChartCard 
                title="Equity Curve" 
                subtitle="Cumulative profit performance" 
                className="lg:col-span-2 border-t-4 border-t-indigo-500 shadow-md" 
                logoType="MonthlyProfits"
                action={
                   <div className="flex gap-2">
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400"><Download className="h-4 w-4" /></Button>
                   </div>
                }
              >
                <div className="h-[300px] w-full">
                  <Line 
                    data={{
                      labels: analytics.dailyData.map((d) => format(new Date(d.date), "MMM dd")),
                      datasets: [{
                          label: "Cumulative P&L",
                          data: analytics.dailyData.map(d => d.cumulative),
                          borderColor: "#6366f1",
                          borderWidth: 3,
                          pointBackgroundColor: "#fff",
                          pointBorderColor: "#6366f1",
                          pointBorderWidth: 2,
                          backgroundColor: (context: ScriptableContext<"line">) => {
                            const ctx = context.chart.ctx
                            const gradient = ctx.createLinearGradient(0, 0, 0, 350)
                            gradient.addColorStop(0, "rgba(99, 102, 241, 0.2)")
                            gradient.addColorStop(1, "rgba(99, 102, 241, 0)")
                            return gradient
                          },
                          fill: true,
                          tension: 0.4,
                          pointRadius: 0,
                          pointHoverRadius: 6,
                      }],
                    }} 
                    options={commonOptions} 
                  />
                </div>
              </ChartCard>

              {/* WIN/LOSS - Takes 1/3 width */}
              <ChartCard title="Win/Loss Ratio" subtitle="Trade Outcomes" className="h-full" logoType="WinLoss">
                 <div className="h-[250px] flex justify-center items-center relative">
                     <Pie 
                         data={{
                             labels: ["Win", "Loss", "BE"],
                             datasets: [{
                                 data: [analytics.wins, analytics.losses, analytics.breakeven],
                                 backgroundColor: ["#10b981", "#ef4444", "#fbbf24"],
                                 borderWidth: 0,
                                 hoverOffset: 15,
                                 offset: 5
                             }]
                         }}
                         options={{ 
                             cutout: '70%',
                             plugins: { 
                                 legend: { 
                                     position: 'bottom', 
                                     labels: { font: { size: 11, weight: 'bold' }, usePointStyle: true, padding: 20 } 
                                 } 
                             } 
                         }}
                     />
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                          <span className="text-4xl font-bold text-slate-800">{analytics.totalTrades}</span>
                          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Trades</span>
                     </div>
                 </div>
              </ChartCard>
            </div>

            {/* --- 3. INTELLIGENCE & HEXAGRAM (New Bottom Section) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Enhanced Hexagram */}
                <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-3xl relative h-full">
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50 pointer-events-none z-0" />
                  <div className="relative z-10 p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-indigo-500" />
                          Trading DNA
                        </h2>
                        <p className="text-sm text-slate-500">Comprehensive score analysis</p>
                      </div>
                      <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold border border-indigo-100">
                        Score: {analytics.overallScore}/100
                      </div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center">
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
                  </div>
                </Card>

                {/* AI Observations Feed */}
                <div className="space-y-6">
                   {/* Quick Observations */}
                   <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col h-full">
                      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md">
                            <Zap className="h-4 w-4 fill-amber-600" />
                          </div>
                          <span className="font-bold text-sm text-slate-800">Quick Observations</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Live Analysis</span>
                      </div>
                      <div className="p-0">
                        <InsightsWindows trades={trades} />
                      </div>
                   </div>
                </div>
            </div>

            {/* --- 4. DETAILED BREAKDOWNS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ChartCard title="Instrument Performance" subtitle="P&L by Asset Class" logoType="InstrumentDistribution">
                <div className="h-[220px]">
                    <Bar
                    data={{
                        labels: Object.keys(analytics.instrumentDistribution),
                        datasets: [{
                        label: "P&L",
                        data: Object.values(analytics.instrumentDistribution).map((d) => d.pnl),
                        backgroundColor: Object.values(analytics.instrumentDistribution).map((d) => d.pnl >= 0 ? "#10b981" : "#ef4444"),
                        borderRadius: 6,
                        barThickness: 30
                        }],
                    }}
                    options={commonOptions}
                    />
                </div>
                </ChartCard>
                
                <ChartCard title="Strategy Performance" subtitle="Setup Frequency" logoType="SetupDistribution">
                <div className="h-[220px]">
                    <Bar
                    data={{
                        labels: Object.keys(analytics.setupDistribution),
                        datasets: [{
                        label: "Count",
                        data: Object.values(analytics.setupDistribution).map((d) => d.count),
                        backgroundColor: "#6366f1",
                        borderRadius: 6,
                        barThickness: 30
                        }],
                    }}
                    options={commonOptions}
                    />
                </div>
                </ChartCard>
            </div>

            {/* --- 5. TIMING ANALYSIS --- */}
            <TimingAnalyticsDashboard
              trades={trades}
              className="rounded-xl bg-white border border-slate-200/60 shadow-sm overflow-hidden"
            />

          </TabsContent>

          {/* --- INTELLIGENCE TAB (Deep Dive with Original Insights Look) --- */}
          <TabsContent value="intelligence" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Deep Insights</h2>
                <p className="text-slate-500">Advanced pattern recognition and risk analysis</p>
              </div>
              <Button 
                onClick={handleGenerateAIReport} 
                disabled={isGeneratingAI || !!aiReport}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                  </>
                ) : aiReport ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Report Ready
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate AI Report
                  </>
                )}
              </Button>
            </div>

            {aiReport && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                       <Brain className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">AI Executive Summary</h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                        {aiReport}
                      </p>
                    </div>
                  </div>
                </motion.div>
            )}

            <Tabs value={insightsTab} onValueChange={setInsightsTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-slate-200">
                <TabsTrigger value="setups" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200 font-medium">
                  <Target className="h-4 w-4 mr-2" />
                  Setup Patterns
                </TabsTrigger>
                <TabsTrigger value="psychology" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200 font-medium">
                  <Brain className="h-4 w-4 mr-2" />
                  Psychology
                </TabsTrigger>
                <TabsTrigger value="risk" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200 font-medium">
                  <Shield className="h-4 w-4 mr-2" />
                  Risk Calculator
                </TabsTrigger>
              </TabsList>

              {/* Setup Patterns Sub-Tab */}
              <TabsContent value="setups" className="space-y-6 mt-6">
                
                {/* --- 1. SETUP SCATTER CHART --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 border-0 shadow-xl bg-white dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle>Setup Performance Matrix</CardTitle>
                      <CardDescription>Win Rate vs. Reward-to-Risk Ratio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SetupScatterChart data={scatterData} />
                      <div className="flex justify-center gap-6 mt-4 text-xs text-slate-500">
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 opacity-70" /> Profitable</div>
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500 opacity-70" /> Unprofitable</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top/Bottom Performer Cards */}
                  <div className="space-y-6">
                    {/* SAFE GUARD: Check if personalEdge exists */}
                    {personalEdge && (
                      <Card className="border-l-4 border-l-emerald-500 shadow-md bg-white dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Top Performer</p>
                            <CardTitle className="text-xl">{personalEdge.setupName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end">
                              <div>
                                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {(personalEdge.winRate * 100).toFixed(1)}%
                                  </p>
                                  <p className="text-xs text-slate-500">Win Rate</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-lg font-mono font-medium text-emerald-600">
                                    +${(topSetup?.totalPnL ?? 0).toFixed(0)}
                                  </p>
                              </div>
                            </div>
                        </CardContent>
                      </Card>
                    )}

                    {bottomSetup && (
                      <Card className="border-l-4 border-l-rose-500 shadow-md bg-white dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Needs Improvement</p>
                            <CardTitle className="text-xl">{bottomSetup.setupName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end">
                              <div>
                                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {(bottomSetup.winRate * 100).toFixed(1)}%
                                  </p>
                                  <p className="text-xs text-slate-500">Win Rate</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-lg font-mono font-medium text-rose-600">
                                    ${(bottomSetup.totalPnL).toFixed(0)}
                                  </p>
                              </div>
                            </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {setupAnalysis.personalEdge && (
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-indigo-600" />
                        <span>Your Personal Edge</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 p-4 bg-white/60 rounded-xl">
                          <p className="text-sm text-slate-500">Best Performing Setup</p>
                          <p className="text-2xl font-bold text-slate-900">{setupAnalysis.personalEdge.setupName}</p>
                        </div>
                        <div className="space-y-2 p-4 bg-white/60 rounded-xl">
                          <p className="text-sm text-slate-500">Win Rate</p>
                          <p className="text-2xl font-bold text-emerald-600">{(setupAnalysis.personalEdge.winRate * 100).toFixed(1)}%</p>
                        </div>
                        <div className="space-y-2 p-4 bg-white/60 rounded-xl">
                          <p className="text-sm text-slate-500">Optimal RRR</p>
                          <p className="text-2xl font-bold text-indigo-600">1:{setupAnalysis.personalEdge.optimalRRR.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Psychology Sub-Tab - Styled like original Insights page */}
              <TabsContent value="psychology" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Enablers */}
                  <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="h-1.5 w-full bg-emerald-500" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                          <span>Edge-Enablers</span>
                        </CardTitle>
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Positive Impact</Badge>
                      </div>
                      <CardDescription>Emotions correlated with higher profitability</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {psychologyAnalysis.topEnablers.length === 0 ? (
                        <p className="text-gray-500 italic">No psychology factors recorded</p>
                      ) : (
                        psychologyAnalysis.topEnablers.map((factor, idx) => (
                          <div key={idx} className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">{factor.factor}</p>
                                <p className="text-sm text-gray-600">{factor.tradeCount} trades</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">+{factor.impact.toFixed(1)}%</p>
                                <p className="text-sm text-gray-600">{(factor.winRate * 100).toFixed(0)}% WR</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Edge Killers */}
                  <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="h-1.5 w-full bg-rose-500" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-rose-600" />
                          <span>Edge-Killers</span>
                        </CardTitle>
                        <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50">Negative Impact</Badge>
                      </div>
                      <CardDescription>Emotions correlated with losses</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {psychologyAnalysis.topKillers.length === 0 ? (
                        <p className="text-gray-500 italic">No psychology factors recorded</p>
                      ) : (
                        psychologyAnalysis.topKillers.map((factor, idx) => (
                          <div key={idx} className="p-4 bg-red-50 rounded-xl border border-red-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">{factor.factor}</p>
                                <p className="text-sm text-gray-600">{factor.tradeCount} trades</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-red-600">{factor.impact.toFixed(1)}%</p>
                                <p className="text-sm text-gray-600">{(factor.winRate * 100).toFixed(0)}% WR</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Insights Footer */}
                {psychologyAnalysis.insights.length > 0 && (
                  <Card className="border-0 shadow-lg bg-purple-50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <span>Psychological Insights</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {psychologyAnalysis.insights.map((insight, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <Activity className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Risk Calculator Sub-Tab - Styled like original Insights page */}
              <TabsContent value="risk" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Current Win Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-600">{(riskAnalysis.currentWinRate * 100).toFixed(1)}%</p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Profit Factor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-blue-600">{riskAnalysis.profitFactor.toFixed(2)}x</p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Avg Win / Loss</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-purple-600">
                        {riskAnalysis.avgLoss > 0 ? (riskAnalysis.avgWin / riskAnalysis.avgLoss).toFixed(2) : "—"}x
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Max Drawdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-orange-600">{riskAnalysis.drawdownMetrics.maxDrawdown.toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Kelly Criterion */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                      <span>Kelly Criterion & Position Sizing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white/60 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-600 mb-2">Kelly %</p>
                        <p className="text-2xl font-bold text-indigo-600">{riskAnalysis.kellyCriterion.kellyPercent.toFixed(2)}%</p>
                      </div>
                      <div className="p-4 bg-white/60 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-600 mb-2">Recommended Risk</p>
                        <p className="text-2xl font-bold text-green-600">{riskAnalysis.kellyCriterion.recommendedRiskPercent.toFixed(2)}%</p>
                      </div>
                      <div className="p-4 bg-white/60 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-600 mb-2">Half Kelly</p>
                        <p className="text-2xl font-bold text-purple-600">{riskAnalysis.kellyCriterion.halfKellyPercent.toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/60 rounded-xl italic text-gray-700 border-l-4 border-indigo-600">
                      {riskAnalysis.kellyCriterion.advice}
                    </div>

                    {/* Position Size Guide */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Position Size Guide</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {riskAnalysis.kellyCriterion.positionSizeGuide.map((guide, idx) => (
                          <div key={idx} className="p-3 bg-white/60 rounded-lg text-sm shadow-sm">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600">Account:</span>
                              <span className="font-bold text-gray-900">${guide.accountSize.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600">Risk:</span>
                              <span className="text-gray-900">${guide.riskAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                              <span className="text-indigo-600 font-medium">Position:</span>
                              <span className="text-indigo-600 font-bold">${guide.suggestedPositionSize.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Recommendations */}
                {riskAnalysis.recommendations.length > 0 && (
                  <Card className="border-0 shadow-lg bg-orange-50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-orange-600" />
                        <span>Risk Management Recommendations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {riskAnalysis.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      {/* MOBILE CALENDAR FAB */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" className="h-14 w-14 rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 transition-transform hover:scale-110">
                    <CalendarIcon className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full">
                <div className="h-full overflow-y-auto">
                    <CalendarTabs trades={trades} dailyData={analytics.dailyData} />
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
