"use client"

import React, { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Area,
  AreaChart,
  Line,
  ComposedChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar as CalendarIcon,
  Filter,
  Brain,
  Microscope,
  TrendingUp,
  Target,
  Trophy,
  XCircle,
  Minus,
  DollarSign,
  Percent,
  BarChart3,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
// Import sub-components directly to mock them or simple versions
import { EnhancedHexagram } from "@/components/charts/enhanced-hexagram"
import { RedesignedCalendarHeatmap } from "@/components/analytics/redesigned-calendar-heatmap"
import { DEMO_ANALYTICS_DATA } from "@/lib/mock-demo-data"

// --- KPI Metric Card Component (Reused) ---
function MetricCard({
  title, value, subtitle, icon: Icon, accentColor, children
}: {
  title: string
  value: React.ReactNode
  subtitle?: React.ReactNode
  icon: React.ElementType
  accentColor: string
  children?: React.ReactNode
}) {
  const colorMap: Record<string, { strip: string; iconBg: string; iconText: string; valueText?: string }> = {
    emerald: { strip: "bg-emerald-500", iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15", iconText: "text-emerald-600 dark:text-emerald-400", valueText: "text-emerald-600 dark:text-emerald-400" },
    rose: { strip: "bg-rose-500", iconBg: "bg-rose-500/10 dark:bg-rose-500/15", iconText: "text-rose-600 dark:text-rose-400", valueText: "text-rose-600 dark:text-rose-400" },
    blue: { strip: "bg-blue-500", iconBg: "bg-blue-500/10 dark:bg-blue-500/15", iconText: "text-blue-600 dark:text-blue-400" },
    amber: { strip: "bg-amber-500", iconBg: "bg-amber-500/10 dark:bg-amber-500/15", iconText: "text-amber-600 dark:text-amber-400" },
    gray: { strip: "bg-muted-foreground/40", iconBg: "bg-muted-foreground/10", iconText: "text-muted-foreground" },
  }
  const colors = colorMap[accentColor] || colorMap.blue

  return (
    <Card className="group relative border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-card/60 backdrop-blur-sm ring-1 ring-border overflow-hidden">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", colors.strip)} />
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", colors.iconBg)}>
            <Icon className={cn("w-3.5 h-3.5", colors.iconText)} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
        </div>
        <div className={cn("text-2xl font-extrabold font-mono tracking-tight leading-none", colors.valueText || "text-foreground")}>
          {value}
        </div>
        {subtitle && <p className="text-[10px] text-muted-foreground font-medium leading-tight">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  )
}

export default function DemoAnalyticsPage() {
  const [mainTab, setMainTab] = useState("overview")
  const analytics = DEMO_ANALYTICS_DATA

  // Prepare chart data
  const equityCurveData = analytics.dailyData.map((d, i) => {
    let cum = 0;
    for (let j = 0; j <= i; j++) cum += analytics.dailyData[j].pnl;
    return { date: d.date, cumulative: cum + 10000 } // Start at 10k
  })

  // Strategy Data
  const strategyPnlData = Object.entries(analytics.setupDistribution).map(([key, val]) => ({
    name: key,
    fullName: key,
    pnl: val.pnl,
    trades: val.count,
    winRate: val.winRate
  })).sort((a, b) => b.pnl - a.pnl)

  // Instrument Data
  const top5InstrumentData = Object.entries(analytics.instrumentDistribution).map(([key, val]) => ({
    name: key,
    pnl: val.pnl,
    trades: val.count,
    color: val.pnl >= 0 ? "#10b981" : "#f43f5e"
  })).sort((a, b) => b.pnl - a.pnl)


  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ======= HEADER ======= */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Analytics <Badge variant="secondary" className="ml-2">Demo</Badge></h1>
            <p className="text-sm text-muted-foreground">Performance insights across {analytics.totalTrades} demo trades</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <Tabs value={mainTab} onValueChange={setMainTab} className="w-auto">
              <TabsList className="h-8 p-0.5 bg-muted rounded-lg">
                <TabsTrigger value="overview" className="text-xs h-7 px-3 rounded-md font-semibold">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="text-xs h-7 px-3 rounded-md font-semibold">
                  <Microscope className="w-3 h-3 mr-1.5" /> Insights
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" className="h-8 rounded-lg px-3 border-border bg-muted/50 text-muted-foreground pointer-events-none">
              <CalendarIcon className="mr-2 h-3.5 w-3.5" /> Last 90 Days
            </Button>
          </div>
        </header>

        {/* ======= OVERVIEW TAB ======= */}
        {mainTab === "overview" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* ====== SECTION A: KEY FINANCIAL METRICS ====== */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <MetricCard
                title="Total P&L"
                icon={DollarSign}
                accentColor="emerald"
                value={`+$${analytics.totalPnL.toLocaleString()}`}
              >
                <div className="h-7 -mx-1 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityCurveData}>
                      <defs>
                        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={1.5} fill="url(#eqGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </MetricCard>

              <MetricCard title="Win Rate" icon={Percent} accentColor="blue" value={`${analytics.winRate}%`} subtitle={`${analytics.wins}W / ${analytics.losses}L`}>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${analytics.winRate}%` }} />
                </div>
              </MetricCard>

              <MetricCard title="Profit Factor" icon={Target} accentColor="amber" value={analytics.profitFactor.toFixed(2)} subtitle="Risk/Reward: 1.8" />
              <MetricCard title="Wins" icon={Trophy} accentColor="emerald" value={analytics.wins} subtitle={`of ${analytics.totalTrades} trades`} />
              <MetricCard title="Losses" icon={XCircle} accentColor="rose" value={analytics.losses} subtitle={`Max DD: $${analytics.maxDrawdown}`} />
              <MetricCard title="Breakeven" icon={Minus} accentColor="gray" value={analytics.breakeven} subtitle={`Avg P&L: $${analytics.avgPnL.toFixed(2)}`} />
            </section>


            {/* ====== SECTION B: CALENDAR + HEXAGRAM ====== */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Calendar Heatmap - Using a placeholder or simplified version if the component is complex */}
              <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    Trading Calendar
                  </CardTitle>
                  <CardDescription className="text-xs">Daily P&L heatmap</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Simplified mock calendar */}
                  <div className="grid grid-cols-10 gap-1">
                    {analytics.dailyData.slice(0, 60).map((d: any, i: number) => (
                      <div key={i} className={cn(
                        "aspect-square rounded-sm border transition-all hover:scale-110 cursor-pointer",
                        d.pnl > 0 ? "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/40" :
                          d.pnl < 0 ? "bg-rose-500/20 border-rose-500/30 hover:bg-rose-500/40" :
                            "bg-muted/10 border-border"
                      )} title={`${d.date}: $${d.pnl.toFixed(2)}`}></div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trader DNA Hexagram */}
              <Card className="border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm flex flex-col">
                <CardHeader className="pb-2 border-b border-border shrink-0">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        Trader DNA
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs bg-primary/10 text-primary border-0 font-bold">
                      {analytics.overallScore}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-4 min-h-0">
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                    <EnhancedHexagram
                      winPercentage={analytics.winRate}
                      consistency={analytics.consistencyScore}
                      maxDrawdown={analytics.riskManagementScore}
                      recoveryFactor={analytics.adaptabilityScore}
                      profitFactor={analytics.profitFactor}
                      avgWinLoss={analytics.efficiencyScore}
                      totalScore={analytics.overallScore}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>


            {/* ====== SECTION C: CHARTS ROW ====== */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Strategy Performance */}
              <Card className="border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" /> Strategy Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={strategyPnlData} layout="vertical" margin={{ top: 10, right: 30, bottom: 0, left: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-border" opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} />
                        <Bar dataKey="pnl" barSize={20} radius={[0, 4, 4, 0]}>
                          {strategyPnlData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"} />
                          ))}
                        </Bar>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top 5 Instruments */}
              <Card className="border-0 shadow-sm ring-1 ring-border dark:bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Top Instruments
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={top5InstrumentData} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-border" opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={40} />
                        <RechartsTooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} />
                        <Bar dataKey="pnl" barSize={20} radius={[0, 4, 4, 0]}>
                          {top5InstrumentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex flex-col justify-center items-center text-center p-6">
                <Brain className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Unlock Full Analytics</h3>
                <p className="text-indigo-100 text-sm mb-6">
                  Connect your broker or upload trades to see your real psychology and performance data.
                </p>
                <Button variant="secondary" className="w-full font-bold">Start Free Trial</Button>
              </Card>

            </section>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-2">
            <Microscope className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold">AI Insights Demo</h2>
            <p className="text-muted-foreground max-w-md text-center mt-2">
              This feature analyzes over 50 data points to find your hidden profitability patterns.
            </p>
            <Button className="mt-6">Sign Up to View</Button>
          </div>
        )}
      </div>
    </div>
  )
}
