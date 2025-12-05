"use client"

import { useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Heart,
  CheckCircle,
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
} from "recharts"

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

const MOODS = [
  { id: "euphoric", label: "Euphoric", emoji: "😄", color: "#10b981", value: 9 },
  { id: "confident", label: "Confident", emoji: "😊", color: "#3b82f6", value: 8 },
  { id: "focused", label: "Focused", emoji: "🎯", color: "#8b5cf6", value: 7 },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "#6b7280", value: 5 },
  { id: "cautious", label: "Cautious", emoji: "⚠️", color: "#f59e0b", value: 4 },
  { id: "frustrated", label: "Frustrated", emoji: "😤", color: "#f97316", value: 3 },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😰", color: "#ef4444", value: 2 },
  { id: "exhausted", label: "Exhausted", emoji: "😫", color: "#a855f7", value: 2 },
  { id: "anxious", label: "Anxious", emoji: "😟", color: "#ec4899", value: 3 },
]

const CHART_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"]

export default function PsychologyAnalytics() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadEntries()
  }, [timeRange])

  async function loadEntries() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      const { data, error } = await supabase
        .from("psychology_journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("Error loading entries:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate analytics
  const analytics = useMemo(() => {
    if (entries.length === 0) return null

    // Mood trend data
    const moodTrend = entries.map((entry) => {
      const moodData = MOODS.find((m) => m.id === entry.mood)
      return {
        date: new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: moodData?.value || 5,
        mood: moodData?.label || "Unknown",
      }
    })

    // Mood distribution
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
        color: moodData?.color || "#6b7280",
      }
    })

    // Top triggers
    const triggerCounts: Record<string, number> = {}
    entries.forEach((entry) => {
      if (entry.emotions && Array.isArray(entry.emotions)) {
        entry.emotions.forEach((emotion) => {
          triggerCounts[emotion] = (triggerCounts[emotion] || 0) + 1
        })
      }
    })
    const topTriggers = Object.entries(triggerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([trigger, count]) => ({
        name: trigger.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      }))

    // Calculate average mood
    const avgMood =
      entries.reduce((sum, entry) => {
        const moodData = MOODS.find((m) => m.id === entry.mood)
        return sum + (moodData?.value || 5)
      }, 0) / entries.length

    // Mood trend (improving/declining)
    const recentEntries = entries.slice(-7)
    const olderEntries = entries.slice(0, Math.min(7, entries.length - 7))
    const recentAvg =
      recentEntries.reduce((sum, entry) => {
        const moodData = MOODS.find((m) => m.id === entry.mood)
        return sum + (moodData?.value || 5)
      }, 0) / recentEntries.length
    const olderAvg =
      olderEntries.length > 0
        ? olderEntries.reduce((sum, entry) => {
            const moodData = MOODS.find((m) => m.id === entry.mood)
            return sum + (moodData?.value || 5)
          }, 0) / olderEntries.length
        : recentAvg

    const moodChange = recentAvg - olderAvg
    const moodTrendDirection = moodChange > 0.5 ? "improving" : moodChange < -0.5 ? "declining" : "stable"

    // AI Insights
    const insights = generateInsights(entries, topTriggers, moodTrendDirection, avgMood)

    return {
      moodTrend,
      moodDistribution,
      topTriggers,
      avgMood,
      moodTrendDirection,
      moodChange,
      insights,
      totalEntries: entries.length,
    }
  }, [entries])

  function generateInsights(
    entries: JournalEntry[],
    topTriggers: { name: string; count: number }[],
    trend: string,
    avgMood: number,
  ) {
    const insights = []

    // Trend insight
    if (trend === "improving") {
      insights.push({
        type: "positive",
        icon: TrendingUp,
        title: "Positive Momentum",
        description:
          "Your emotional state has been improving over the past week. Keep up the good work with your mental discipline practices.",
      })
    } else if (trend === "declining") {
      insights.push({
        type: "warning",
        icon: TrendingDown,
        title: "Attention Needed",
        description:
          "Your mood trend shows a decline. Consider taking a break, reviewing your trading plan, or seeking support.",
      })
    }

    // Trigger insight
    if (topTriggers.length > 0) {
      const topTrigger = topTriggers[0]
      insights.push({
        type: "info",
        icon: AlertTriangle,
        title: `Watch Out for "${topTrigger.name}"`,
        description: `This trigger appears in ${topTrigger.count} of your entries. Develop strategies to manage this emotional response.`,
      })
    }

    // Frequency insight
    if (entries.length >= 20) {
      insights.push({
        type: "positive",
        icon: Target,
        title: "Consistent Journaling",
        description: "Excellent consistency! Regular journaling helps identify patterns and improve self-awareness.",
      })
    } else if (entries.length < 5) {
      insights.push({
        type: "info",
        icon: Lightbulb,
        title: "Build the Habit",
        description: "Try to journal more frequently to gain better insights into your trading psychology patterns.",
      })
    }

    // Mood insight
    if (avgMood >= 7) {
      insights.push({
        type: "positive",
        icon: Sparkles,
        title: "Strong Mental State",
        description: "Your overall mood is positive. This is a great foundation for disciplined trading decisions.",
      })
    } else if (avgMood <= 4) {
      insights.push({
        type: "warning",
        icon: Brain,
        title: "Mental Health Check",
        description: "Your average mood is low. Consider taking a break from trading and focusing on self-care.",
      })
    }

    return insights
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Analyzing your psychology data...</p>
        </div>
      </div>
    )
  }

  if (!analytics || entries.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No Analytics Available</h3>
            <p className="text-muted-foreground leading-relaxed">
              Start creating journal entries to see comprehensive analytics and AI-powered insights about your trading
              psychology.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Psychology Analytics
          </h2>
          <p className="text-muted-foreground mt-1">AI-powered insights into your trading mindset</p>
        </div>
        <div className="flex gap-2">
          <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
            7 Days
          </Button>
          <Button variant={timeRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("30d")}>
            30 Days
          </Button>
          <Button variant={timeRange === "90d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("90d")}>
            90 Days
          </Button>
        </div>
      </div>

      {/* Current Emotional State */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-blue-200/50 dark:border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Current Emotional State
          </CardTitle>
          <CardDescription>Your mental and emotional readiness for trading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - (analytics.avgMood * 10) / 100)}`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(analytics.avgMood * 10)}%</span>
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">Confidence</div>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - ((10 - analytics.avgMood) * 10) / 100)}`}
                    className="text-red-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round((10 - analytics.avgMood) * 10)}%</span>
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">Stress</div>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - (analytics.avgMood * 8.5) / 100)}`}
                    className="text-blue-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(analytics.avgMood * 8.5)}%</span>
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">Focus</div>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - (analytics.avgMood * 9.2) / 100)}`}
                    className="text-purple-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(analytics.avgMood * 9.2)}%</span>
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">Patience</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Mood & Performance */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-purple-200/50 dark:border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Recent Mood & Performance
          </CardTitle>
          <CardDescription>Track your emotional state over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries
              .slice(-5)
              .reverse()
              .map((entry, index) => {
                const moodData = MOODS.find((m) => m.id === entry.mood)
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                      <Badge
                        style={{ backgroundColor: `${moodData?.color}20`, color: moodData?.color }}
                        className="border-0"
                      >
                        {moodData?.emoji} {moodData?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Emotions</div>
                        <div className="font-semibold">{entry.emotions?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-3xl font-bold mt-1">{analytics.totalEntries}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Mood Score</p>
                <p className="text-3xl font-bold mt-1">{analytics.avgMood.toFixed(1)}/10</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <PieChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br ${analytics.moodTrendDirection === "improving" ? "from-green-500/10 to-emerald-500/10 border-green-500/20" : analytics.moodTrendDirection === "declining" ? "from-red-500/10 to-rose-500/10 border-red-500/20" : "from-gray-500/10 to-slate-500/10 border-gray-500/20"}`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mood Trend</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold capitalize">{analytics.moodTrendDirection}</p>
                  {analytics.moodTrendDirection === "improving" && <ArrowUpRight className="h-5 w-5 text-green-600" />}
                  {analytics.moodTrendDirection === "declining" && <ArrowDownRight className="h-5 w-5 text-red-600" />}
                </div>
              </div>
              <div
                className={`p-3 rounded-xl ${analytics.moodTrendDirection === "improving" ? "bg-green-500/20" : analytics.moodTrendDirection === "declining" ? "bg-red-500/20" : "bg-gray-500/20"}`}
              >
                {analytics.moodTrendDirection === "improving" ? (
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : analytics.moodTrendDirection === "declining" ? (
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                ) : (
                  <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Trigger</p>
                <p className="text-lg font-bold mt-1 line-clamp-1">{analytics.topTriggers[0]?.name || "None"}</p>
                <p className="text-xs text-muted-foreground">{analytics.topTriggers[0]?.count || 0} occurrences</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Personalized recommendations based on your psychology patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    insight.type === "positive"
                      ? "bg-green-500/5 border-green-500/20"
                      : insight.type === "warning"
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-blue-500/5 border-blue-500/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        insight.type === "positive"
                          ? "bg-green-500/20"
                          : insight.type === "warning"
                            ? "bg-amber-500/20"
                            : "bg-blue-500/20"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          insight.type === "positive"
                            ? "text-green-600 dark:text-green-400"
                            : insight.type === "warning"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-blue-600 dark:text-blue-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Mood Trend Over Time
            </CardTitle>
            <CardDescription>Track your emotional state progression</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.moodTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis domain={[0, 10]} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Mood Distribution
            </CardTitle>
            <CardDescription>Breakdown of your emotional states</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={analytics.moodDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Behavioral Patterns and Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-amber-200/50 dark:border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Behavioral Patterns
            </CardTitle>
            <CardDescription>Identified patterns in your trading psychology</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.insights.slice(0, 3).map((insight, index) => {
                const Icon = insight.icon
                return (
                  <div
                    key={index}
                    className="p-4 bg-white/60 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">{insight.title}</h4>
                      </div>
                      <Badge
                        className={`${
                          insight.type === "positive"
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : insight.type === "warning"
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                              : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        {insight.type === "positive" ? "Positive" : insight.type === "warning" ? "Warning" : "Info"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-green-200/50 dark:border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              Recommendations
            </CardTitle>
            <CardDescription>Actionable steps to improve your trading psychology</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white/60 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">Pre-trade Emotional Check</h4>
                  <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">High</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Rate your emotional state before each trade on a 1-10 scale
                </p>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">Meditation Practice</h4>
                  <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Medium</Badge>
                </div>
                <p className="text-sm text-muted-foreground">5-minute mindfulness session before market open</p>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">Trade Limit Rules</h4>
                  <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">High</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set maximum daily trade limits when feeling excited or frustrated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emotional Impact Analysis */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-indigo-200/50 dark:border-indigo-500/20">
        <CardHeader>
          <CardTitle>Emotional Impact on Performance</CardTitle>
          <CardDescription>How your mental state affects your trading results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {Math.round(analytics.avgMood * 10)}%
              </div>
              <div className="text-sm text-muted-foreground">Positive emotional states</div>
            </div>
            <div className="text-center p-6 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                {analytics.topTriggers.length}
              </div>
              <div className="text-sm text-muted-foreground">Identified triggers</div>
            </div>
            <div className="text-center p-6 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {Math.round((analytics.totalEntries / (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Emotional awareness score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
