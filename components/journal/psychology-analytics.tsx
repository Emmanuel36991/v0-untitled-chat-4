"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  CheckCircle,
  Radar as RadarIcon,
  ShieldAlert,
  Loader2
} from "lucide-react"
import {
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import { analyzePsychologyCorrelation } from "@/lib/insights/psychology-correlation"

interface JournalEntry {
  id: string
  created_at: string
  entry_date: string
  mood: string
  emotions: string[]
  pre_trade_thoughts: string
  post_trade_thoughts: string
  lessons_learned: string
}

// Hex colors for reliable chart visibility on dark backgrounds (oklch can be faint or unsupported)
const MOODS = [
  { id: "euphoric", label: "Euphoric", emoji: "😄", color: "#22c55e", value: 9 },
  { id: "confident", label: "Confident", emoji: "😊", color: "#8b5cf6", value: 8 },
  { id: "focused", label: "Focused", emoji: "🎯", color: "#3b82f6", value: 7 },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "#94a3b8", value: 5 },
  { id: "cautious", label: "Cautious", emoji: "⚠️", color: "#eab308", value: 4 },
  { id: "frustrated", label: "Frustrated", emoji: "😤", color: "#f97316", value: 3 },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😰", color: "#ef4444", value: 2 },
  { id: "exhausted", label: "Exhausted", emoji: "😫", color: "#a855f7", value: 2 },
  { id: "anxious", label: "Anxious", emoji: "😟", color: "#ec4899", value: 3 },
]

interface PsychologyAnalyticsProps {
  disciplineScore?: number
  dominantEmotion?: string
  winRate?: number
  entries?: JournalEntry[]
  trades?: any[]
}

export default function PsychologyAnalytics({
  disciplineScore = 0,
  dominantEmotion = "Unknown",
  winRate = 0,
  entries: allEntries = [],
  trades = []
}: PsychologyAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  const entries = useMemo(() => {
    const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)
    return allEntries.filter(e => new Date(e.created_at) >= startDate)
  }, [allEntries, timeRange])

  const psychResult = useMemo(
    () => analyzePsychologyCorrelation(trades),
    [trades]
  )

  const analytics = useMemo(() => {
    if (entries.length === 0) return null

    // Mood Trend
    const moodTrend = entries.map((entry) => {
      const moodData = MOODS.find((m) => m.id === entry.mood)
      return {
        date: new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: moodData?.value || 5,
        mood: moodData?.label || "Unknown",
      }
    })

    // Mood Distribution
    const moodCounts: Record<string, number> = {}
    entries.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
    })
    const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => {
      const moodData = MOODS.find((m) => m.id === mood)
      return {
        name: moodData?.label || mood,
        value: count,
        emoji: moodData?.emoji || "😐",
        color: moodData?.color || "#94a3b8",
      }
    })

    // Triggers & Radar
    const triggerCounts: Record<string, number> = {}
    let totalConfidence = 0
    let totalFocus = 0
    let ratedEntriesCount = 0

    entries.forEach((entry) => {
      if (entry.emotions && Array.isArray(entry.emotions)) {
        entry.emotions.forEach((emotion) => {
          if (emotion.startsWith("Confidence:")) {
            totalConfidence += parseInt(emotion.split(":")[1]) || 5
          } else if (emotion.startsWith("Focus:")) {
            totalFocus += parseInt(emotion.split(":")[1]) || 5
          } else {
            triggerCounts[emotion] = (triggerCounts[emotion] || 0) + 1
          }
        })
        if (entry.emotions.some(e => e.startsWith("Confidence:"))) {
          ratedEntriesCount++
        }
      }
    })

    const topTriggers = Object.entries(triggerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([trigger, count]) => ({
        name: trigger.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      }))

    const avgMood = entries.reduce((sum, entry) => {
      const moodData = MOODS.find((m) => m.id === entry.mood)
      return sum + (moodData?.value || 5)
    }, 0) / entries.length

    const avgConfidence = ratedEntriesCount > 0 ? Math.round((totalConfidence / ratedEntriesCount) * 10) : 50
    const avgFocus = ratedEntriesCount > 0 ? Math.round((totalFocus / ratedEntriesCount) * 10) : 50
    const impliedDiscipline = Math.min(100, Math.round(avgMood * 10) + (avgFocus > 70 ? 10 : 0))
    const impliedCalmness = Math.min(100, Math.round(avgMood * 10) + (avgConfidence > 70 ? 10 : 0))

    const radarData = [
      { subject: 'Confidence', A: avgConfidence, fullMark: 100 },
      { subject: 'Focus', A: avgFocus, fullMark: 100 },
      { subject: 'Discipline', A: impliedDiscipline, fullMark: 100 },
      { subject: 'Calmness', A: impliedCalmness, fullMark: 100 },
      { subject: 'Patience', A: Math.round((avgConfidence + impliedDiscipline) / 2), fullMark: 100 },
    ]

    // Mood Trend Direction
    const recentEntries = entries.slice(-7)
    const olderEntries = entries.slice(0, Math.max(0, entries.length - 7))
    const getAvg = (arr: JournalEntry[]) => arr.reduce((sum, e) => sum + (MOODS.find(m => m.id === e.mood)?.value || 5), 0) / (arr.length || 1)
    const recentAvg = getAvg(recentEntries)
    const olderAvg = olderEntries.length > 0 ? getAvg(olderEntries) : recentAvg
    const moodChange = recentAvg - olderAvg
    const moodTrendDirection = moodChange > 0.5 ? "improving" : moodChange < -0.5 ? "declining" : "stable"

    const insights = generateInsights(entries, topTriggers, moodTrendDirection, avgMood, psychResult)

    return { moodTrend, moodDistribution, topTriggers, radarData, avgMood, moodTrendDirection, moodChange, insights, totalEntries: entries.length }
  }, [entries, psychResult])

  function generateInsights(
    entries: JournalEntry[],
    topTriggers: { name: string; count: number }[],
    trend: string,
    avgMood: number,
    correlationData: any
  ) {
    const insights: { type: string; icon: React.ElementType; title: string; description: string }[] = []

    // 1. Data-Driven Correlation Insight (Replaces Fake AI)
    if (correlationData && correlationData.factorImpacts && correlationData.factorImpacts.length > 0) {
      // Find the most damaging habit based on actual PnL
      const worstFactor = [...correlationData.factorImpacts].sort((a, b) => a.avgPnl - b.avgPnl)[0]
      // Find the most profitable habit
      const bestFactor = [...correlationData.factorImpacts].sort((a, b) => b.avgPnl - a.avgPnl)[0]

      if (worstFactor && worstFactor.avgPnl < 0 && worstFactor.count > 2) {
        insights.push({
          type: "warning",
          icon: ShieldAlert,
          title: `High Cost Pattern: ${worstFactor.factor}`,
          description: `Our analysis detected that trades associated with "${worstFactor.factor}" result in an average loss of $${Math.abs(worstFactor.avgPnl).toFixed(2)}. ${correlationData.recommendation || ''}`
        })
      } else if (correlationData.recommendation) {
        insights.push({
          type: "info",
          icon: Brain,
          title: "Neural Analysis",
          description: correlationData.recommendation
        })
      }

      if (bestFactor && bestFactor.avgPnl > 0 && bestFactor.count > 2) {
        insights.push({
          type: "positive",
          icon: Target,
          title: `Profitable Edge: ${bestFactor.factor}`,
          description: `You show a strong edge when driven by "${bestFactor.factor}", yielding $${bestFactor.avgPnl.toFixed(2)} per trade on average. Lean into this state.`
        })
      }
    }

    // 2. Trend & Base Analytics
    if (trend === "improving") {
      insights.push({ type: "positive", icon: TrendingUp, title: "Positive Momentum", description: "Your emotional baseline has climbed functionally over the past rolling week." })
    } else if (trend === "declining") {
      insights.push({ type: "warning", icon: TrendingDown, title: "Attention Needed", description: "Your mood trend shows a quantified decline. Lower sizing until equilibrium is reached." })
    }

    // Fallback if no triggers found in correlation
    if (insights.length < 2 && topTriggers.length > 0) {
      const topTrigger = topTriggers[0]
      insights.push({ type: "info", icon: Lightbulb, title: `Frequent Trigger: "${topTrigger.name}"`, description: `This emotional trigger appeared ${topTrigger.count} times. Monitor your execution when this state surfaces.` })
    }

    return insights.slice(0, 4) // Keep HUD clean with top 4
  }

  // --- Rendering ---

  if (!analytics || entries.length === 0) {
    return (
      <Card className="border-dashed border-2 border-border bg-card/50">
        <CardContent className="py-20 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl ring-1 ring-primary/10 w-fit mx-auto">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No Analytics Available</h3>
            <p className="text-muted-foreground leading-relaxed">
              Start creating journal entries to see comprehensive analytics and data-driven insights about your trading psychology.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Use explicit colors for chart visibility on dark theme (CSS vars can be too faint)
  const chartGridColor = "rgba(148, 163, 184, 0.35)"
  const chartTextColor = "rgb(203, 213, 225)"
  const chartTooltipBg = "hsl(var(--card))"
  const chartTooltipBorder = "hsl(var(--border))"
  const primaryColor = "#8b5cf6"
  const successColor = "#22c55e"
  const radarFillColor = "rgba(139, 92, 246, 0.45)"
  const lineStrokeColor = "#22c55e"

  return (
    <div className="space-y-6">

      {/* Header with Time Range */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            Psychology Analytics
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Data-driven insights into your trading mindset</p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all",
                timeRange === range
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Circular Gauges */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Brain className="h-5 w-5 text-primary" />
            Current Emotional State
          </CardTitle>
          <CardDescription>Your calculated mental readiness metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GaugeCell label="Confidence" value={Math.round(analytics.avgMood * 10)} color={successColor} />
            <GaugeCell label="Stress" value={Math.round((10 - analytics.avgMood) * 10)} color="hsl(var(--destructive))" />
            <GaugeCell label="Focus" value={Math.round(analytics.avgMood * 8.5)} color="hsl(var(--info))" />
            <GaugeCell label="Patience" value={Math.round(analytics.avgMood * 9.2)} color={primaryColor} />
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Radar */}
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <RadarIcon className="h-5 w-5 text-primary" />
              Psychometric Profile
            </CardTitle>
            <CardDescription>Multidimensional analysis of your mental state</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analytics.radarData}>
                <PolarGrid stroke={chartGridColor} strokeWidth={1} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: chartTextColor, fontSize: 11, fontFamily: "monospace" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: chartTextColor, fontSize: 10 }} />
                <Radar name="My Stats" dataKey="A" stroke={primaryColor} strokeWidth={2.5} fill={radarFillColor} />
                <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, borderRadius: "8px", color: "hsl(var(--foreground))" }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Trend */}
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-success" />
              Mood Trend
            </CardTitle>
            <CardDescription>Track your emotional state progression</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.moodTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: chartTextColor, fontSize: 11 }} axisLine={{ stroke: chartGridColor }} tickLine={{ stroke: chartGridColor }} dy={10} />
                <YAxis domain={[0, 10]} tick={{ fill: chartTextColor, fontSize: 10 }} axisLine={{ stroke: chartGridColor }} tickLine={{ stroke: chartGridColor }} />
                <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Line type="monotone" dataKey="value" stroke={lineStrokeColor} strokeWidth={3} dot={{ fill: lineStrokeColor, stroke: "hsl(var(--card))", strokeWidth: 2, r: 5 }} activeDot={{ r: 7, fill: lineStrokeColor, stroke: "hsl(var(--card))", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie */}
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChart className="h-5 w-5 text-info" />
              State Distribution
            </CardTitle>
            <CardDescription>Breakdown of your reported emotional states</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={analytics.moodDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="hsl(var(--card))" strokeWidth={2} label={false}>
                  {analytics.moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, borderRadius: "8px", color: "hsl(var(--foreground))" }} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-[-20px] relative z-10">
              {analytics.moodDistribution.slice(0, 4).map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Triggers */}
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-warning" />
              Top Triggers
            </CardTitle>
            <CardDescription>Identified emotional triggers (Frequency)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topTriggers.length > 0 ? (
                (() => {
                  const maxCount = Math.max(...analytics.topTriggers.map((t) => t.count), 1)
                  return analytics.topTriggers.map((trigger, i) => {
                    const pct = maxCount > 0 ? (trigger.count / maxCount) * 100 : 0
                    const barWidth = Math.max(15, Math.min(100, pct))
                    return (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-muted-foreground w-4">0{i + 1}</span>
                          <span className="text-sm font-medium text-foreground group-hover:text-amber-400 transition-colors">{trigger.name}</span>
                        </div>
                        <div className="flex items-center gap-3 w-1/2">
                          <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-amber-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground w-6 text-right">{trigger.count}</span>
                        </div>
                      </div>
                    )
                  })
                })()
              ) : (
                <div className="text-center py-10 text-muted-foreground italic">No triggers recorded yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            Trading Advisor Insights
          </CardTitle>
          <CardDescription>Personalized trading psychology insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm",
                    insight.type === "positive" && "bg-success/5 border-success/20 hover:border-success/40",
                    insight.type === "warning" && "bg-warning/5 border-warning/20 hover:border-warning/40",
                    insight.type === "info" && "bg-info/5 border-info/20 hover:border-info/40"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      insight.type === "positive" && "bg-success/15 text-success",
                      insight.type === "warning" && "bg-warning/15 text-warning",
                      insight.type === "info" && "bg-info/15 text-info"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm text-foreground">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Entries Logged" value={String(analytics.totalEntries)} icon={CheckCircle} iconBg="bg-primary/10" iconColor="text-primary" />
        <MetricCard
          label="Avg Mood"
          value={analytics.avgMood.toFixed(1)}
          suffix="/ 10"
          icon={Activity}
          iconBg="bg-info/10"
          iconColor="text-info"
        />
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Trend</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold text-foreground capitalize font-mono">{analytics.moodTrendDirection}</p>
                  {analytics.moodTrendDirection === 'improving' ? (
                    <ArrowUpRight className="w-5 h-5 text-success" />
                  ) : analytics.moodTrendDirection === 'declining' ? (
                    <ArrowDownRight className="w-5 h-5 text-destructive" />
                  ) : (
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className={cn(
                "p-2 rounded-lg",
                analytics.moodTrendDirection === 'improving' ? 'bg-success/10' :
                  analytics.moodTrendDirection === 'declining' ? 'bg-destructive/10' : 'bg-muted'
              )}>
                <TrendingUp className={cn(
                  "w-5 h-5",
                  analytics.moodTrendDirection === 'improving' ? 'text-success' :
                    analytics.moodTrendDirection === 'declining' ? 'text-destructive' : 'text-muted-foreground'
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Sub-components ---

function GaugeCell({ label, value, color }: { label: string; value: number; color: string }) {
  const circumference = 2 * Math.PI * 36
  return (
    <div className="text-center group">
      <div className="relative w-20 h-20 mx-auto mb-3 transform group-hover:scale-105 transition-transform duration-300">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle cx="40" cy="40" r="36" stroke="hsl(var(--border))" strokeWidth="6" fill="transparent" />
          <circle
            cx="40" cy="40" r="36" stroke={color} strokeWidth="6" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold font-mono text-foreground">{value}%</span>
        </div>
      </div>
      <div className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  )
}

function MetricCard({ label, value, suffix, icon: Icon, iconBg, iconColor }: {
  label: string; value: string; suffix?: string; icon: React.ElementType; iconBg: string; iconColor: string
}) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1 font-mono">
              {value}
              {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
            </p>
          </div>
          <div className={cn("p-2 rounded-lg", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
