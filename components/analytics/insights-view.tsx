"use client"

import React, { useMemo, useState, useEffect } from "react"
import type { Trade } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp, TrendingDown, Target, Brain, Shield, Activity,
  AlertTriangle, CheckCircle2, Zap, BarChart3, Microscope,
  ArrowUp, ArrowDown, Clock, ChevronRight, Flame, Crosshair,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, ScatterChart, Scatter, ZAxis,
} from "recharts"
import { analyzePatterns, type PatternStat, type SmartRecommendation } from "@/lib/insights/pattern-recognition"
import { analyzeRuleCompliance, type ComplianceAnalysis, type StrategyWithRules } from "@/lib/insights/rule-compliance"
import { analyzePsychologyCorrelation, type PsychologyCorrelationResult } from "@/lib/insights/psychology-correlation"
import { getStrategiesWithRules } from "@/app/actions/pattern-actions"
import { cn } from "@/lib/utils"

// ── Props ──────────────────────────────────────────────────────────────────────

interface InsightsViewProps {
  trades: Trade[]
  isLoading: boolean
}

// ── Sub-Components ─────────────────────────────────────────────────────────────

function MetricBox({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: "green" | "red" | "amber" | "default"
}) {
  const accentColors = {
    green: "border-l-emerald-500",
    red: "border-l-red-500",
    amber: "border-l-amber-500",
    default: "border-l-primary",
  }
  return (
    <div className={cn(
      "bg-card rounded-lg border border-border p-4 border-l-4",
      accentColors[accent || "default"]
    )}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-foreground tabular-nums mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

function PatternCard({ pattern, rank }: { pattern: PatternStat; rank: number }) {
  const isPositive = pattern.winRate >= 0.5
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        isPositive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400"
      )}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{pattern.label}</p>
        <p className="text-xs text-muted-foreground">{pattern.totalTrades} trades</p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn(
          "text-sm font-semibold tabular-nums",
          isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
        )}>
          {(pattern.winRate * 100).toFixed(0)}%
        </p>
        <p className={cn(
          "text-xs tabular-nums",
          pattern.totalPnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
        )}>
          {pattern.totalPnl >= 0 ? "+" : ""}${pattern.totalPnl.toFixed(0)}
        </p>
      </div>
    </div>
  )
}

function RecommendationCard({ rec }: { rec: SmartRecommendation }) {
  const iconMap = {
    strength: <TrendingUp className="w-4 h-4 text-emerald-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    tip: <Zap className="w-4 h-4 text-sky-500" />,
  }
  const borderMap = {
    strength: "border-l-emerald-500",
    warning: "border-l-amber-500",
    tip: "border-l-sky-500",
  }
  return (
    <div className={cn("bg-card border border-border border-l-4 rounded-lg p-4", borderMap[rec.type])}>
      <div className="flex items-center gap-2 mb-1">
        {iconMap[rec.type]}
        <p className="text-sm font-semibold text-foreground">{rec.title}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{rec.body}</p>
    </div>
  )
}

// Custom tooltip for bar charts
function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-foreground mb-1">{label || data.label}</p>
      <p className="text-muted-foreground">Win Rate: <span className="font-medium text-foreground">{(data.winRate * 100).toFixed(0)}%</span></p>
      <p className="text-muted-foreground">Trades: <span className="font-medium text-foreground">{data.totalTrades}</span></p>
      <p className="text-muted-foreground">Avg P&L: <span className={cn("font-medium", data.avgPnl >= 0 ? "text-emerald-600" : "text-red-600")}>${data.avgPnl.toFixed(2)}</span></p>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function InsightsView({ trades, isLoading }: InsightsViewProps) {
  const [strategies, setStrategies] = useState<StrategyWithRules[]>([])
  const [strategiesLoaded, setStrategiesLoaded] = useState(false)

  // Load strategies on mount for compliance analysis
  useEffect(() => {
    getStrategiesWithRules().then((data) => {
      setStrategies(data as StrategyWithRules[])
      setStrategiesLoaded(true)
    }).catch(() => setStrategiesLoaded(true))
  }, [])

  // Memoized analyses
  const patternResult = useMemo(() => analyzePatterns(trades), [trades])
  const complianceResult = useMemo(
    () => analyzeRuleCompliance(trades, strategies),
    [trades, strategies]
  )
  const psychResult = useMemo(
    () => analyzePsychologyCorrelation(trades),
    [trades]
  )

  // ── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-muted rounded-full animate-pulse" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Analyzing patterns...</p>
      </div>
    )
  }

  // ── Empty State ────────────────────────────────────────────────────────────
  if (trades.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-dashed border-border">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Microscope className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2 text-balance">No Trades to Analyze</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Log at least a few trades to unlock pattern recognition and smart recommendations.
        </p>
        <Button asChild><a href="/add-trade">Log Your First Trade</a></Button>
      </div>
    )
  }

  // ── Overview Metrics ───────────────────────────────────────────────────────
  const overallWinRate = trades.length > 0
    ? trades.filter(t => t.pnl > 0).length / trades.length
    : 0
  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0)
  const { streaks } = patternResult

  return (
    <div className="space-y-6">

      {/* ── Header Metrics ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricBox
          label="Overall Win Rate"
          value={`${(overallWinRate * 100).toFixed(1)}%`}
          sub={`${trades.length} trades analyzed`}
          accent={overallWinRate >= 0.5 ? "green" : "red"}
        />
        <MetricBox
          label="Net P&L"
          value={`$${totalPnl.toFixed(0)}`}
          sub={totalPnl >= 0 ? "Profitable" : "Drawdown"}
          accent={totalPnl >= 0 ? "green" : "red"}
        />
        <MetricBox
          label="Best Win Streak"
          value={streaks.bestWinStreak}
          sub={`Current: ${streaks.currentStreak > 0 ? `+${streaks.currentStreak} wins` : streaks.currentStreak < 0 ? `${Math.abs(streaks.currentStreak)} losses` : "neutral"}`}
          accent={streaks.currentStreak > 0 ? "green" : streaks.currentStreak < 0 ? "red" : "default"}
        />
        <MetricBox
          label="Rule Compliance"
          value={strategiesLoaded && complianceResult.tradeScores.length > 0
            ? `${(complianceResult.overallScore * 100).toFixed(0)}%`
            : "--"}
          sub={complianceResult.tradeScores.length > 0
            ? `${complianceResult.tradeScores.length} scored trades`
            : "No linked strategies"}
          accent={complianceResult.overallScore >= 0.7 ? "green" : complianceResult.overallScore >= 0.5 ? "amber" : "default"}
        />
      </div>

      {/* ── Smart Recommendations ──────────────────────────────────────────── */}
      {patternResult.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {patternResult.recommendations.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tabbed Analysis ────────────────────────────────────────────────── */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="w-full justify-start bg-muted/50 border border-border rounded-lg h-10 p-1">
          <TabsTrigger value="patterns" className="text-xs gap-1.5">
            <Crosshair className="w-3.5 h-3.5" /> Patterns
          </TabsTrigger>
          <TabsTrigger value="timing" className="text-xs gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Timing
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Compliance
          </TabsTrigger>
          <TabsTrigger value="psychology" className="text-xs gap-1.5">
            <Brain className="w-3.5 h-3.5" /> Psychology
          </TabsTrigger>
        </TabsList>

        {/* ── Patterns Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="patterns" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top Winning Patterns */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ArrowUp className="w-4 h-4 text-emerald-500" /> Winning Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {patternResult.topWinningPatterns.length > 0 ? (
                  patternResult.topWinningPatterns.map((p, i) => (
                    <PatternCard key={i} pattern={p} rank={i + 1} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">Need 2+ trades per pattern</p>
                )}
              </CardContent>
            </Card>

            {/* Top Losing Patterns */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ArrowDown className="w-4 h-4 text-red-500" /> Anti-Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {patternResult.topLosingPatterns.length > 0 ? (
                  patternResult.topLosingPatterns.map((p, i) => (
                    <PatternCard key={i} pattern={p} rank={i + 1} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">Need 2+ trades per pattern</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown Charts */}
          {patternResult.groups
            .filter(g => g.patterns.length > 1 && g.category !== "Entry Hour")
            .map((group) => (
              <Card key={group.category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{group.category} Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={group.patterns} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} className="text-muted-foreground" />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="winRate" radius={[4, 4, 0, 0]} maxBarSize={48}>
                          {group.patterns.map((p, i) => (
                            <Cell
                              key={i}
                              fill={p.winRate >= 0.5
                                ? "oklch(0.72 0.17 160)"
                                : "oklch(0.64 0.2 25)"}
                              fillOpacity={0.8}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* ── Timing Tab ───────────────────────────────────────────────────── */}
        <TabsContent value="timing" className="mt-4 space-y-4">
          {/* Entry Hour Chart */}
          {(() => {
            const hourGroup = patternResult.groups.find(g => g.category === "Entry Hour")
            if (!hourGroup || hourGroup.patterns.length === 0) {
              return (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No entry time data. Add entry times when logging trades.</p>
                  </CardContent>
                </Card>
              )
            }
            return (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Win Rate by Entry Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourGroup.patterns} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted-foreground" interval={0} angle={-45} textAnchor="end" height={50} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} className="text-muted-foreground" />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="winRate" radius={[3, 3, 0, 0]} maxBarSize={32}>
                          {hourGroup.patterns.map((p, i) => (
                            <Cell key={i} fill={p.winRate >= 0.5 ? "oklch(0.72 0.17 160)" : "oklch(0.64 0.2 25)"} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Day of Week Chart */}
          {(() => {
            const dayGroup = patternResult.groups.find(g => g.category === "Day of Week")
            if (!dayGroup || dayGroup.patterns.length === 0) return null
            return (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Performance by Day of Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dayGroup.patterns} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(0)}`} className="text-muted-foreground" />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]} maxBarSize={48}>
                          {dayGroup.patterns.map((p, i) => (
                            <Cell key={i} fill={p.avgPnl >= 0 ? "oklch(0.72 0.17 160)" : "oklch(0.64 0.2 25)"} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Weekly Heatmap */}
          {patternResult.weeklyHeatmap.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Activity Heatmap (Day x Hour)</CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyHeatmap data={patternResult.weeklyHeatmap} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Compliance Tab ───────────────────────────────────────────────── */}
        <TabsContent value="compliance" className="mt-4 space-y-4">
          <ComplianceSection result={complianceResult} loaded={strategiesLoaded} />
        </TabsContent>

        {/* ── Psychology Tab ───────────────────────────────────────────────── */}
        <TabsContent value="psychology" className="mt-4 space-y-4">
          <PsychologySection result={psychResult} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Weekly Heatmap ─────────────────────────────────────────────────────────────

function WeeklyHeatmap({ data }: { data: { day: string; hour: number; winRate: number; count: number }[] }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  // Find hour range from data
  const hours = Array.from(new Set(data.map(d => d.hour))).sort((a, b) => a - b)
  if (hours.length === 0) return null

  const lookup = new Map(data.map(d => [`${d.day}-${d.hour}`, d]))

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        <div className="flex gap-1">
          <div className="w-16 shrink-0" />
          {hours.map(h => (
            <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground">
              {h === 0 ? "12A" : h < 12 ? `${h}A` : h === 12 ? "12P" : `${h - 12}P`}
            </div>
          ))}
        </div>
        {days.map(day => (
          <div key={day} className="flex gap-1 mt-1">
            <div className="w-16 shrink-0 text-[11px] text-muted-foreground flex items-center">{day.slice(0, 3)}</div>
            {hours.map(h => {
              const cell = lookup.get(`${day}-${h}`)
              const wr = cell?.winRate || 0
              const count = cell?.count || 0
              return (
                <div
                  key={h}
                  className={cn(
                    "flex-1 aspect-square rounded-sm flex items-center justify-center text-[9px] font-medium transition-colors",
                    count === 0 && "bg-muted/30 text-transparent",
                    count > 0 && wr >= 0.6 && "bg-emerald-500/70 text-white",
                    count > 0 && wr >= 0.4 && wr < 0.6 && "bg-amber-500/50 text-foreground",
                    count > 0 && wr < 0.4 && "bg-red-500/60 text-white",
                  )}
                  title={`${day} ${h}:00 - ${count} trades, ${(wr * 100).toFixed(0)}% win rate`}
                >
                  {count > 0 ? count : ""}
                </div>
              )
            })}
          </div>
        ))}
        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500/70 inline-block" /> {">"} 60% WR</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500/50 inline-block" /> 40-60%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500/60 inline-block" /> {"<"} 40%</span>
        </div>
      </div>
    </div>
  )
}

// ── Compliance Section ─────────────────────────────────────────────────────────

function ComplianceSection({ result, loaded }: { result: ComplianceAnalysis; loaded: boolean }) {
  if (!loaded) {
    return <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">Loading strategies...</div>
  }

  if (result.tradeScores.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No Compliance Data</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Link trades to playbook strategies and check off executed rules when logging trades. This enables compliance tracking and outcome correlation.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { complianceVsOutcome, mostMissedRules, overallScore, recommendation } = result

  return (
    <div className="space-y-4">
      {/* Score + Compliance vs Outcome */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Overall Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    className="stroke-muted"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    className={cn(
                      overallScore >= 0.7 ? "stroke-emerald-500" : overallScore >= 0.5 ? "stroke-amber-500" : "stroke-red-500"
                    )}
                    strokeWidth="3"
                    strokeDasharray={`${overallScore * 100}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground tabular-nums">{(overallScore * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">{recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Compliance vs Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">High Compliance (70%+)</span>
                  <span className="font-medium text-foreground">{complianceVsOutcome.highCompliance.trades} trades</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={complianceVsOutcome.highCompliance.winRate * 100} className="flex-1 h-2" />
                  <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 w-12 text-right">
                    {(complianceVsOutcome.highCompliance.winRate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Low Compliance ({"<"}70%)</span>
                  <span className="font-medium text-foreground">{complianceVsOutcome.lowCompliance.trades} trades</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={complianceVsOutcome.lowCompliance.winRate * 100} className="flex-1 h-2" />
                  <span className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400 w-12 text-right">
                    {(complianceVsOutcome.lowCompliance.winRate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Missed Rules */}
      {mostMissedRules.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Most Missed Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostMissedRules.map((rule, i) => {
                const missRate = rule.totalTrades > 0 ? (rule.missCount / rule.totalTrades) * 100 : 0
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-[10px] font-bold text-red-600 dark:text-red-400 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{rule.ruleText}</p>
                      <p className="text-xs text-muted-foreground">Missed {rule.missCount} of {rule.totalTrades} trades ({missRate.toFixed(0)}%)</p>
                    </div>
                    <Progress value={missRate} className="w-20 h-1.5 shrink-0" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Psychology Section ─────────────────────────────────────────────────────────

function PsychologySection({ result }: { result: PsychologyCorrelationResult }) {
  if (result.tradesWithFactors === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No Psychology Data</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Tag psychology factors (mood, discipline, focus) when logging trades to unlock mindset-performance correlations.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricBox
          label="Trades with Factors"
          value={result.tradesWithFactors}
          sub={`${result.tradesWithoutFactors} without`}
          accent="default"
        />
        <MetricBox
          label="Tagged Trades Win Rate"
          value={`${(result.overallWithFactorsWinRate * 100).toFixed(0)}%`}
          sub={`vs ${(result.overallWithoutFactorsWinRate * 100).toFixed(0)}% untagged`}
          accent={result.overallWithFactorsWinRate >= 0.5 ? "green" : "red"}
        />
      </div>

      {/* Good vs Bad factors */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Positive Factors */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Positive Mental States
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.topPositiveFactors.length > 0 ? (
              <div className="space-y-3">
                {result.topPositiveFactors.map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.tradeCount} trades</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "tabular-nums",
                      f.winRate >= 0.5
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "border-red-500/30 text-red-600 dark:text-red-400"
                    )}>
                      {(f.winRate * 100).toFixed(0)}% WR
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No positive factors tagged yet</p>
            )}
          </CardContent>
        </Card>

        {/* Negative Factors */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Negative Mental States
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.topNegativeFactors.length > 0 ? (
              <div className="space-y-3">
                {result.topNegativeFactors.map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.tradeCount} trades</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "tabular-nums",
                      f.winRate >= 0.5
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "border-red-500/30 text-red-600 dark:text-red-400"
                    )}>
                      {(f.winRate * 100).toFixed(0)}% WR
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No negative factors tagged yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendation */}
      {result.recommendation && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Factors Chart */}
      {result.factors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">All Factor Win Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={result.factors.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} className="text-muted-foreground" />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={130} className="text-muted-foreground" />
                  <Tooltip
                    formatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="winRate" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {result.factors.slice(0, 10).map((f, i) => (
                      <Cell
                        key={i}
                        fill={f.type === "good"
                          ? "oklch(0.72 0.17 160)"
                          : "oklch(0.64 0.2 25)"}
                        fillOpacity={0.75}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
