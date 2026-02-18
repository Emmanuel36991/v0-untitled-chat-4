"use client"

import React, { useMemo, useState, useEffect, useCallback } from "react"
import type { Trade } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp, TrendingDown, Brain, Shield,
  AlertTriangle, CheckCircle2,
  ArrowUp, ArrowDown, Clock, Crosshair, Trash2,
} from "lucide-react"
import { NeuralSparkIcon, PulseIcon } from "@/components/icons/system-icons"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from "recharts"
import { analyzePatterns, type PatternStat, type SmartRecommendation } from "@/lib/insights/pattern-recognition"
import { analyzeRuleCompliance, type ComplianceAnalysis, type StrategyWithRules } from "@/lib/insights/rule-compliance"
import { analyzePsychologyCorrelation, type PsychologyCorrelationResult } from "@/lib/insights/psychology-correlation"
import { getStrategiesWithRules } from "@/app/actions/pattern-actions"
import { getInsights, deleteInsight, type SavedInsight } from "@/app/actions/insight-actions"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

// ══════════════════════════════════════════════════════════════════════════════
// GLASS CARD WRAPPER — shared visual language
// ══════════════════════════════════════════════════════════════════════════════

function GlassCard({
  children,
  className,
  glowColor = "primary",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  glowColor?: "primary" | "emerald" | "red" | "amber" | "sky"
  delay?: number
}) {
  const glowMap = {
    primary: "hover:shadow-[0_0_25px_-6px_rgba(var(--primary-rgb,100,80,220),0.15)]",
    emerald: "hover:shadow-[0_0_25px_-6px_rgba(16,185,129,0.15)]",
    red: "hover:shadow-[0_0_25px_-6px_rgba(239,68,68,0.15)]",
    amber: "hover:shadow-[0_0_25px_-6px_rgba(245,158,11,0.15)]",
    sky: "hover:shadow-[0_0_25px_-6px_rgba(14,165,233,0.15)]",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-card/70 dark:bg-card/50 backdrop-blur-lg",
        "border border-border/50 dark:border-border/30",
        "shadow-sm dark:shadow-lg",
        "transition-all duration-300",
        glowMap[glowColor],
        className
      )}
    >
      {/* Top edge glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {children}
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// METRIC BOX — glassmorphism style
// ══════════════════════════════════════════════════════════════════════════════

function MetricBox({ label, value, sub, accent, delay }: {
  label: string; value: string | number; sub?: string; accent?: "green" | "red" | "amber" | "default"; delay?: number
}) {
  const accentLine = {
    green: "from-emerald-500 to-emerald-500/0",
    red: "from-red-500 to-red-500/0",
    amber: "from-amber-500 to-amber-500/0",
    default: "from-primary to-primary/0",
  }
  const glowMap: Record<string, "emerald" | "red" | "amber" | "primary"> = {
    green: "emerald", red: "red", amber: "amber", default: "primary",
  }

  return (
    <GlassCard glowColor={glowMap[accent || "default"]} delay={delay}>
      {/* Left accent line */}
      <div className={cn("absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b", accentLine[accent || "default"])} />
      <div className="p-4 pl-5">
        <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">{label}</p>
        <p className="text-2xl font-bold text-foreground tabular-nums mt-1.5 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </GlassCard>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PATTERN CARD
// ══════════════════════════════════════════════════════════════════════════════

function PatternCard({ pattern, rank }: { pattern: PatternStat; rank: number }) {
  const isPositive = pattern.winRate >= 0.5
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
        isPositive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
          : "bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20"
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

// ══════════════════════════════════════════════════════════════════════════════
// RECOMMENDATION CARD — glass treatment
// ══════════════════════════════════════════════════════════════════════════════

function RecommendationCard({ rec, delay }: { rec: SmartRecommendation; delay?: number }) {
  const iconMap = {
    strength: <TrendingUp className="w-4 h-4 text-emerald-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    tip: <PulseIcon className="w-4 h-4 text-sky-500" />,
  }
  const glowMap: Record<string, "emerald" | "amber" | "sky"> = {
    strength: "emerald", warning: "amber", tip: "sky",
  }
  const accentLine = {
    strength: "from-emerald-500 to-emerald-500/0",
    warning: "from-amber-500 to-amber-500/0",
    tip: "from-sky-500 to-sky-500/0",
  }

  return (
    <GlassCard glowColor={glowMap[rec.type]} delay={delay}>
      <div className={cn("absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b", accentLine[rec.type])} />
      <div className="p-4 pl-5">
        <div className="flex items-center gap-2 mb-1.5">
          {iconMap[rec.type]}
          <p className="text-sm font-semibold text-foreground">{rec.title}</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{rec.body}</p>
      </div>
    </GlassCard>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOM TOOLTIP
// ══════════════════════════════════════════════════════════════════════════════

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-popover/90 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-foreground mb-1">{label || data.label}</p>
      <p className="text-muted-foreground">Win Rate: <span className="font-medium text-foreground">{(data.winRate * 100).toFixed(0)}%</span></p>
      <p className="text-muted-foreground">Trades: <span className="font-medium text-foreground">{data.totalTrades}</span></p>
      <p className="text-muted-foreground">Avg P&L: <span className={cn("font-medium", data.avgPnl >= 0 ? "text-emerald-600" : "text-red-600")}>${data.avgPnl.toFixed(2)}</span></p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// AI HISTORY — saved insight timeline
// ══════════════════════════════════════════════════════════════════════════════

function AIHistorySection() {
  const [insights, setInsights] = useState<SavedInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadInsights = useCallback(async () => {
    setLoading(true)
    const data = await getInsights(50)
    setInsights(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadInsights()
  }, [loadInsights])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const result = await deleteInsight(id)
    if (result.success) {
      setInsights((prev) => prev.filter((i) => i.id !== id))
    }
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-muted rounded-full" />
          <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading insight history...</p>
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <GlassCard className="p-0">
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center border border-primary/10">
              <NeuralSparkIcon className="w-8 h-8 text-primary/40" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No Insights Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            AI insights are generated from your dashboard and saved here automatically.
            Visit your dashboard to trigger your first analysis.
          </p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">
            {insights.length} insight{insights.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-primary/30 via-border/40 to-transparent" />

        <AnimatePresence mode="popLayout">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12, scale: 0.95 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              layout
              className="relative pl-12 pb-4 last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-3 top-4 w-3 h-3 rounded-full border-2 border-primary/40 bg-card z-10" />

              <GlassCard delay={0}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <NeuralSparkIcon className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                      <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-[0.06em]">
                        {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(insight.id)}
                      disabled={deletingId === insight.id}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors shrink-0",
                        "text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10",
                        deletingId === insight.id && "opacity-50 pointer-events-none"
                      )}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[14px] leading-relaxed text-foreground/85 font-medium tracking-[-0.01em]">
                    {insight.insight_text}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

interface InsightsViewProps {
  trades: Trade[]
  isLoading: boolean
}

export function InsightsView({ trades, isLoading }: InsightsViewProps) {
  const [strategies, setStrategies] = useState<StrategyWithRules[]>([])
  const [strategiesLoaded, setStrategiesLoaded] = useState(false)

  useEffect(() => {
    getStrategiesWithRules().then((data) => {
      setStrategies(data as StrategyWithRules[])
      setStrategiesLoaded(true)
    }).catch(() => setStrategiesLoaded(true))
  }, [])

  const patternResult = useMemo(() => analyzePatterns(trades), [trades])
  const complianceResult = useMemo(
    () => analyzeRuleCompliance(trades, strategies),
    [trades, strategies]
  )
  const psychResult = useMemo(
    () => analyzePsychologyCorrelation(trades),
    [trades]
  )

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-muted rounded-full" />
          <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Analyzing patterns...</p>
      </div>
    )
  }

  // ── Empty ──
  if (trades.length === 0) {
    return (
      <GlassCard>
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-primary/5 dark:bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/10">
            <NeuralSparkIcon className="w-8 h-8 text-primary/40" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No Trades to Analyze</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Log at least a few trades to unlock pattern recognition and smart recommendations.
          </p>
          <Button asChild><a href="/add-trade">Log Your First Trade</a></Button>
        </div>
      </GlassCard>
    )
  }

  const overallWinRate = trades.filter(t => t.pnl > 0).length / trades.length
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
          delay={0}
        />
        <MetricBox
          label="Net P&L"
          value={`$${totalPnl.toFixed(0)}`}
          sub={totalPnl >= 0 ? "Profitable" : "Drawdown"}
          accent={totalPnl >= 0 ? "green" : "red"}
          delay={1}
        />
        <MetricBox
          label="Best Win Streak"
          value={streaks.bestWinStreak}
          sub={`Current: ${streaks.currentStreak > 0 ? `+${streaks.currentStreak} wins` : streaks.currentStreak < 0 ? `${Math.abs(streaks.currentStreak)} losses` : "neutral"}`}
          accent={streaks.currentStreak > 0 ? "green" : streaks.currentStreak < 0 ? "red" : "default"}
          delay={2}
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
          delay={3}
        />
      </div>

      {/* ── Smart Recommendations ──────────────────────────────────────────── */}
      {patternResult.recommendations.length > 0 && (
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-3"
          >
            <PulseIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground tracking-tight">Smart Recommendations</h3>
          </motion.div>
          <div className="grid gap-3 md:grid-cols-2">
            {patternResult.recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} delay={i + 4} />
            ))}
          </div>
        </div>
      )}

      {/* ── Tabbed Analysis ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs defaultValue="ai-history" className="w-full">
          <TabsList className="w-full justify-start bg-card/60 dark:bg-card/40 backdrop-blur-lg border border-border/40 rounded-xl h-11 p-1 gap-0.5">
            <TabsTrigger value="ai-history" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
              <NeuralSparkIcon className="w-3.5 h-3.5" /> AI History
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
              <Crosshair className="w-3.5 h-3.5" /> Patterns
            </TabsTrigger>
            <TabsTrigger value="timing" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
              <Clock className="w-3.5 h-3.5" /> Timing
            </TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
              <Shield className="w-3.5 h-3.5" /> Compliance
            </TabsTrigger>
            <TabsTrigger value="psychology" className="text-xs gap-1.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
              <Brain className="w-3.5 h-3.5" /> Psychology
            </TabsTrigger>
          </TabsList>

          {/* ── AI History Tab ────────────────────────────────────────────── */}
          <TabsContent value="ai-history" className="mt-4">
            <AIHistorySection />
          </TabsContent>

          {/* ── Patterns Tab ─────────────────────────────────────────────── */}
          <TabsContent value="patterns" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <GlassCard glowColor="emerald" delay={0}>
                <div className="p-5">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                    <ArrowUp className="w-4 h-4 text-emerald-500" /> Winning Patterns
                  </h4>
                  {patternResult.topWinningPatterns.length > 0 ? (
                    patternResult.topWinningPatterns.map((p, i) => (
                      <PatternCard key={i} pattern={p} rank={i + 1} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">Need 2+ trades per pattern</p>
                  )}
                </div>
              </GlassCard>

              <GlassCard glowColor="red" delay={1}>
                <div className="p-5">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                    <ArrowDown className="w-4 h-4 text-red-500" /> Anti-Patterns
                  </h4>
                  {patternResult.topLosingPatterns.length > 0 ? (
                    patternResult.topLosingPatterns.map((p, i) => (
                      <PatternCard key={i} pattern={p} rank={i + 1} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">Need 2+ trades per pattern</p>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Category Charts */}
            {patternResult.groups
              .filter(g => g.patterns.length > 1 && g.category !== "Entry Hour")
              .map((group, idx) => (
                <GlassCard key={group.category} delay={idx + 2}>
                  <div className="p-5">
                    <h4 className="text-sm font-bold text-foreground mb-3">{group.category} Performance</h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={group.patterns} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} className="text-muted-foreground" />
                          <Tooltip content={<CustomBarTooltip />} />
                          <Bar dataKey="winRate" radius={[6, 6, 0, 0]} maxBarSize={48}>
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
                  </div>
                </GlassCard>
              ))}
          </TabsContent>

          {/* ── Timing Tab ───────────────────────────────────────────────── */}
          <TabsContent value="timing" className="mt-4 space-y-4">
            {(() => {
              const hourGroup = patternResult.groups.find(g => g.category === "Entry Hour")
              if (!hourGroup || hourGroup.patterns.length === 0) {
                return (
                  <GlassCard>
                    <div className="py-12 text-center">
                      <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No entry time data. Add entry times when logging trades.</p>
                    </div>
                  </GlassCard>
                )
              }
              return (
                <GlassCard>
                  <div className="p-5">
                    <h4 className="text-sm font-bold text-foreground mb-3">Win Rate by Entry Hour</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourGroup.patterns} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted-foreground" interval={0} angle={-45} textAnchor="end" height={50} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} className="text-muted-foreground" />
                          <Tooltip content={<CustomBarTooltip />} />
                          <Bar dataKey="winRate" radius={[4, 4, 0, 0]} maxBarSize={32}>
                            {hourGroup.patterns.map((p, i) => (
                              <Cell key={i} fill={p.winRate >= 0.5 ? "oklch(0.72 0.17 160)" : "oklch(0.64 0.2 25)"} fillOpacity={0.8} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </GlassCard>
              )
            })()}

            {(() => {
              const dayGroup = patternResult.groups.find(g => g.category === "Day of Week")
              if (!dayGroup || dayGroup.patterns.length === 0) return null
              return (
                <GlassCard delay={1}>
                  <div className="p-5">
                    <h4 className="text-sm font-bold text-foreground mb-3">Performance by Day of Week</h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayGroup.patterns} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(0)}`} className="text-muted-foreground" />
                          <Tooltip content={<CustomBarTooltip />} />
                          <Bar dataKey="avgPnl" radius={[6, 6, 0, 0]} maxBarSize={48}>
                            {dayGroup.patterns.map((p, i) => (
                              <Cell key={i} fill={p.avgPnl >= 0 ? "oklch(0.72 0.17 160)" : "oklch(0.64 0.2 25)"} fillOpacity={0.8} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </GlassCard>
              )
            })()}

            {patternResult.weeklyHeatmap.length > 0 && (
              <GlassCard delay={2}>
                <div className="p-5">
                  <h4 className="text-sm font-bold text-foreground mb-3">Activity Heatmap (Day x Hour)</h4>
                  <WeeklyHeatmap data={patternResult.weeklyHeatmap} />
                </div>
              </GlassCard>
            )}
          </TabsContent>

          {/* ── Compliance Tab ───────────────────────────────────────────── */}
          <TabsContent value="compliance" className="mt-4 space-y-4">
            <ComplianceSection result={complianceResult} loaded={strategiesLoaded} />
          </TabsContent>

          {/* ── Psychology Tab ───────────────────────────────────────────── */}
          <TabsContent value="psychology" className="mt-4 space-y-4">
            <PsychologySection result={psychResult} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// WEEKLY HEATMAP
// ══════════════════════════════════════════════════════════════════════════════

function WeeklyHeatmap({ data }: { data: { day: string; hour: number; winRate: number; count: number }[] }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const hours = Array.from(new Set(data.map(d => d.hour))).sort((a, b) => a - b)
  if (hours.length === 0) return null

  const lookup = new Map(data.map(d => [`${d.day}-${d.hour}`, d]))

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        <div className="flex gap-1">
          <div className="w-16 shrink-0" />
          {hours.map(h => (
            <div key={h} className="flex-1 text-center text-2xs text-muted-foreground">
              {h === 0 ? "12A" : h < 12 ? `${h}A` : h === 12 ? "12P" : `${h - 12}P`}
            </div>
          ))}
        </div>
        {days.map(day => (
          <div key={day} className="flex gap-1 mt-1">
            <div className="w-16 shrink-0 text-2xs text-muted-foreground flex items-center">{day.slice(0, 3)}</div>
            {hours.map(h => {
              const cell = lookup.get(`${day}-${h}`)
              const wr = cell?.winRate || 0
              const count = cell?.count || 0
              return (
                <div
                  key={h}
                  className={cn(
                    "flex-1 aspect-square rounded-md flex items-center justify-center text-[9px] font-medium transition-colors",
                    count === 0 && "bg-muted/20 text-transparent",
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
        <div className="flex items-center justify-center gap-4 mt-3 text-2xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-md bg-emerald-500/70 inline-block" /> {">"} 60% WR</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-md bg-amber-500/50 inline-block" /> 40-60%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-md bg-red-500/60 inline-block" /> {"<"} 40%</span>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE SECTION
// ══════════════════════════════════════════════════════════════════════════════

function ComplianceSection({ result, loaded }: { result: ComplianceAnalysis; loaded: boolean }) {
  if (!loaded) {
    return <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">Loading strategies...</div>
  }

  if (result.tradeScores.length === 0) {
    return (
      <GlassCard>
        <div className="py-12 text-center px-8">
          <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No Compliance Data</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Link trades to playbook strategies and check off executed rules when logging trades. This enables compliance tracking and outcome correlation.
          </p>
        </div>
      </GlassCard>
    )
  }

  const { complianceVsOutcome, mostMissedRules, overallScore, recommendation } = result

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <div className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-3">Overall Compliance Score</h4>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    className="stroke-muted/30"
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
          </div>
        </GlassCard>

        <GlassCard delay={1}>
          <div className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-3">Compliance vs Outcome</h4>
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
          </div>
        </GlassCard>
      </div>

      {mostMissedRules.length > 0 && (
        <GlassCard glowColor="amber" delay={2}>
          <div className="p-5">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Most Missed Rules
            </h4>
            <div className="space-y-3">
              {mostMissedRules.map((rule, i) => {
                const missRate = rule.totalTrades > 0 ? (rule.missCount / rule.totalTrades) * 100 : 0
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-2xs font-bold text-red-600 dark:text-red-400 shrink-0 ring-1 ring-red-500/20">
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
          </div>
        </GlassCard>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PSYCHOLOGY SECTION
// ══════════════════════════════════════════════════════════════════════════════

function PsychologySection({ result }: { result: PsychologyCorrelationResult }) {
  if (result.tradesWithFactors === 0) {
    return (
      <GlassCard>
        <div className="py-12 text-center px-8">
          <Brain className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No Psychology Data</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Tag psychology factors (mood, discipline, focus) when logging trades to unlock mindset-performance correlations.
          </p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <MetricBox
          label="Trades with Factors"
          value={result.tradesWithFactors}
          sub={`${result.tradesWithoutFactors} without`}
          accent="default"
          delay={0}
        />
        <MetricBox
          label="Tagged Trades Win Rate"
          value={`${(result.overallWithFactorsWinRate * 100).toFixed(0)}%`}
          sub={`vs ${(result.overallWithoutFactorsWinRate * 100).toFixed(0)}% untagged`}
          accent={result.overallWithFactorsWinRate >= 0.5 ? "green" : "red"}
          delay={1}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard glowColor="emerald" delay={2}>
          <div className="p-5">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Positive Mental States
            </h4>
            {result.topPositiveFactors.length > 0 ? (
              <div className="space-y-3">
                {result.topPositiveFactors.map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.tradeCount} trades</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "tabular-nums rounded-lg",
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
          </div>
        </GlassCard>

        <GlassCard glowColor="red" delay={3}>
          <div className="p-5">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Negative Mental States
            </h4>
            {result.topNegativeFactors.length > 0 ? (
              <div className="space-y-3">
                {result.topNegativeFactors.map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.tradeCount} trades</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "tabular-nums rounded-lg",
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
          </div>
        </GlassCard>
      </div>

      {result.recommendation && (
        <GlassCard delay={4}>
          <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-primary to-primary/0" />
          <div className="p-5 pl-6">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendation}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {result.factors.length > 0 && (
        <GlassCard delay={5}>
          <div className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-3">All Factor Win Rates</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={result.factors.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} className="text-muted-foreground" />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={130} className="text-muted-foreground" />
                  <Tooltip
                    formatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="winRate" radius={[0, 6, 6, 0]} maxBarSize={20}>
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
          </div>
        </GlassCard>
      )}
    </div>
  )
}
