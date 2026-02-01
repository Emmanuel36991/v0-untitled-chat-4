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

// Updated colors for Dark Mode Fintech aesthetic
const MOODS = [
  { id: "euphoric", label: "Euphoric", emoji: "😄", color: "#10b981", value: 9 }, // Emerald
  { id: "confident", label: "Confident", emoji: "😊", color: "#6366f1", value: 8 }, // Indigo
  { id: "focused", label: "Focused", emoji: "🎯", color: "#8b5cf6", value: 7 },   // Violet
  { id: "neutral", label: "Neutral", emoji: "😐", color: "#71717a", value: 5 },   // Zinc
  { id: "cautious", label: "Cautious", emoji: "⚠️", color: "#eab308", value: 4 },  // Yellow
  { id: "frustrated", label: "Frustrated", emoji: "😤", color: "#f97316", value: 3 }, // Orange
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😰", color: "#ef4444", value: 2 }, // Red
  { id: "exhausted", label: "Exhausted", emoji: "😫", color: "#a855f7", value: 2 }, // Purple
  { id: "anxious", label: "Anxious", emoji: "😟", color: "#ec4899", value: 3 },   // Pink
]

const CHART_THEME_DARK = {
  background: "#09090b",
  border: "#27272a",
  text: "#a1a1aa",
  grid: "#27272a",
  tooltipBg: "#18181b"
}

const CHART_THEME_LIGHT = {
  background: "#ffffff",
  border: "#e2e8f0",
  text: "#64748b",
  grid: "#e2e8f0",
  tooltipBg: "#f8fafc"
}

interface PsychologyAnalyticsProps {
  disciplineScore?: number
  dominantEmotion?: string
  winRate?: number
}

export default function PsychologyAnalytics({ 
  disciplineScore = 0, 
  dominantEmotion = "Unknown", 
  winRate = 0 
}: PsychologyAnalyticsProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
  const [isDark, setIsDark] = useState(false)

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const CHART_THEME = isDark ? CHART_THEME_DARK : CHART_THEME_LIGHT

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadEntries()
  }, [timeRange])

  async function loadEntries() {
    setLoading(true)
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

  // Calculate analytics - Preserving ALL original logic + adding Radar logic
  const analytics = useMemo(() => {
    if (entries.length === 0) return null

    // 1. Mood Trend Data
    const moodTrend = entries.map((entry) => {
      const moodData = MOODS.find((m) => m.id === entry.mood)
      return {
        date: new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: moodData?.value || 5,
        mood: moodData?.label || "Unknown",
        fullDate: entry.created_at
      }
    })

    // 2. Mood Distribution
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

    // 3. Top Triggers & Radar Data Extraction
    const triggerCounts: Record<string, number> = {}
    let totalConfidence = 0
    let totalFocus = 0
    let ratedEntriesCount = 0

    entries.forEach((entry) => {
      if (entry.emotions && Array.isArray(entry.emotions)) {
        entry.emotions.forEach((emotion) => {
          // Logic to handle new "Label: Value" format from new Input component
          if (emotion.startsWith("Confidence:")) {
             totalConfidence += parseInt(emotion.split(":")[1]) || 5
          } else if (emotion.startsWith("Focus:")) {
             totalFocus += parseInt(emotion.split(":")[1]) || 5
          } else {
             // Standard trigger counting
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

    // 4. Calculate Averages
    const avgMood =
      entries.reduce((sum, entry) => {
        const moodData = MOODS.find((m) => m.id === entry.mood)
        return sum + (moodData?.value || 5)
      }, 0) / entries.length

    // Radar Chart Data (Calculated or Inferred)
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

    // 5. Mood Trend Direction
    const recentEntries = entries.slice(-7)
    const olderEntries = entries.slice(0, Math.max(0, entries.length - 7))
    
    const getAvg = (arr: JournalEntry[]) => arr.reduce((sum, e) => sum + (MOODS.find(m => m.id === e.mood)?.value || 5), 0) / (arr.length || 1)
    
    const recentAvg = getAvg(recentEntries)
    const olderAvg = olderEntries.length > 0 ? getAvg(olderEntries) : recentAvg

    const moodChange = recentAvg - olderAvg
    const moodTrendDirection = moodChange > 0.5 ? "improving" : moodChange < -0.5 ? "declining" : "stable"

    // 6. AI Insights
    const insights = generateInsights(entries, topTriggers, moodTrendDirection, avgMood)

    return {
      moodTrend,
      moodDistribution,
      topTriggers,
      radarData,
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
        icon: ShieldAlert,
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

  // --- Rendering ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] h-full bg-slate-100 dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-slate-500 dark:text-zinc-500 font-mono text-sm">Decrypting psychology data...</p>
        </div>
      </div>
    )
  }

  if (!analytics || entries.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/20">
        <CardContent className="py-20 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 rounded-full bg-indigo-500/10 w-fit mx-auto border border-indigo-500/20">
              <Brain className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-zinc-200">No Analytics Available</h3>
            <p className="text-slate-600 dark:text-zinc-500 leading-relaxed">
              Start creating journal entries to see comprehensive analytics and AI-powered insights about your trading
              psychology.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-zinc-100">
            <Activity className="h-5 w-5 text-indigo-500" />
            Psychology Analytics
          </h2>
          <p className="text-slate-600 dark:text-zinc-500 text-sm mt-1">AI-powered insights into your trading mindset</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                timeRange === range 
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm border border-slate-300 dark:border-zinc-700" 
                  : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Current Emotional State Circular Indicators */}
      <Card className="bg-white dark:bg-zinc-900/50 backdrop-blur border-slate-200 dark:border-zinc-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-zinc-100">
            <Brain className="h-5 w-5 text-indigo-500" />
            Current Emotional State
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-zinc-500">Your calculated mental readiness metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Confidence Gauge */}
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-3 transform group-hover:scale-105 transition-transform duration-300">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke={isDark ? "#27272a" : "#e2e8f0"} strokeWidth="6" fill="transparent" />
                  <circle
                    cx="40" cy="40" r="36" stroke="#10b981" strokeWidth="6" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - (analytics.avgMood * 10) / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-emerald-400 dark:text-emerald-400 font-mono">{Math.round(analytics.avgMood * 10)}%</span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Confidence</div>
            </div>

            {/* Stress Gauge (Inverted) */}
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-3 transform group-hover:scale-105 transition-transform duration-300">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke={isDark ? "#27272a" : "#e2e8f0"} strokeWidth="6" fill="transparent" />
                  <circle
                    cx="40" cy="40" r="36" stroke="#ef4444" strokeWidth="6" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - ((10 - analytics.avgMood) * 10) / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-rose-400 dark:text-rose-400 font-mono">{Math.round((10 - analytics.avgMood) * 10)}%</span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Stress</div>
            </div>

            {/* Focus Gauge */}
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-3 transform group-hover:scale-105 transition-transform duration-300">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke={isDark ? "#27272a" : "#e2e8f0"} strokeWidth="6" fill="transparent" />
                  <circle
                    cx="40" cy="40" r="36" stroke="#3b82f6" strokeWidth="6" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - (analytics.avgMood * 8.5) / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-400 dark:text-blue-400 font-mono">{Math.round(analytics.avgMood * 8.5)}%</span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Focus</div>
            </div>

            {/* Patience Gauge */}
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-3 transform group-hover:scale-105 transition-transform duration-300">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke={isDark ? "#27272a" : "#e2e8f0"} strokeWidth="6" fill="transparent" />
                  <circle
                    cx="40" cy="40" r="36" stroke="#a855f7" strokeWidth="6" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - (analytics.avgMood * 9.2) / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-400 dark:text-purple-400 font-mono">{Math.round(analytics.avgMood * 9.2)}%</span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Patience</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart - NEW Feature */}
        <Card className="bg-white dark:bg-zinc-900/50 backdrop-blur border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-zinc-100">
              <RadarIcon className="h-5 w-5 text-indigo-500" />
              Psychometric Profile
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-500">Multidimensional analysis of your mental state</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analytics.radarData}>
                <PolarGrid stroke={CHART_THEME.grid} strokeOpacity={isDark ? 1 : 0.5} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: CHART_THEME.text, fontSize: 11, fontFamily: 'monospace' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="My Stats"
                  dataKey="A"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="#6366f1"
                  fillOpacity={isDark ? 0.25 : 0.15}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: CHART_THEME.tooltipBg, 
                    borderColor: CHART_THEME.border,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#0f172a'
                  }}
                  itemStyle={{ color: isDark ? '#e4e4e7' : '#334155' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Trend Chart */}
        <Card className="bg-white dark:bg-zinc-900/50 backdrop-blur border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-zinc-100">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Mood Trend
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-500">Track your emotional state progression</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.moodTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: CHART_THEME.text, fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 10]} 
                  hide
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: CHART_THEME.tooltipBg,
                    border: `1px solid ${CHART_THEME.border}`,
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#09090b", stroke: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <PieChart className="h-5 w-5 text-sky-500" />
              State Distribution
            </CardTitle>
            <CardDescription className="text-zinc-500">Breakdown of your reported emotional states</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={analytics.moodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {analytics.moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: CHART_THEME.tooltipBg,
                    border: `1px solid ${CHART_THEME.border}`,
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-[-20px] relative z-10">
                {analytics.moodDistribution.slice(0, 4).map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}/>
                        {m.name}
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Behavioral Patterns */}
        <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              Top Triggers
            </CardTitle>
            <CardDescription className="text-zinc-500">Identified emotional triggers (Frequency)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topTriggers.length > 0 ? (
                analytics.topTriggers.map((trigger, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-zinc-600 w-4">0{i + 1}</span>
                      <span className="text-sm font-medium text-zinc-300 group-hover:text-amber-400 transition-colors">{trigger.name}</span>
                    </div>
                    <div className="flex items-center gap-3 w-1/2">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-amber-500/60 rounded-full" 
                                style={{ width: `${Math.min(100, (trigger.count / analytics.totalEntries) * 100 * 2)}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono text-zinc-500">{trigger.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-zinc-600 italic">No triggers recorded yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights - Redesigned */}
      <Card className="bg-gradient-to-br from-indigo-950/20 via-zinc-900/50 to-purple-950/20 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-100">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            AI Advisor Protocol
          </CardTitle>
          <CardDescription className="text-indigo-400/50">Personalized trading psychology recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all hover:bg-zinc-900/80 ${
                    insight.type === "positive"
                      ? "bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40"
                      : insight.type === "warning"
                      ? "bg-amber-950/10 border-amber-500/20 hover:border-amber-500/40"
                      : "bg-indigo-950/10 border-indigo-500/20 hover:border-indigo-500/40"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        insight.type === "positive"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : insight.type === "warning"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-indigo-500/10 text-indigo-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className={`font-semibold text-sm ${
                         insight.type === "positive" ? "text-emerald-100" : 
                         insight.type === "warning" ? "text-amber-100" : "text-indigo-100"
                      }`}>
                        {insight.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Row (Bottom) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Entries Logged</p>
                        <p className="text-2xl font-bold text-zinc-100 mt-1">{analytics.totalEntries}</p>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-purple-500" />
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Avg Mood</p>
                        <p className="text-2xl font-bold text-zinc-100 mt-1">{analytics.avgMood.toFixed(1)} <span className="text-sm font-normal text-zinc-500">/ 10</span></p>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Recent Trend</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-2xl font-bold text-zinc-100 capitalize">{analytics.moodTrendDirection}</p>
                            {analytics.moodTrendDirection === 'improving' ? (
                                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                            ) : analytics.moodTrendDirection === 'declining' ? (
                                <ArrowDownRight className="w-5 h-5 text-rose-500" />
                            ) : (
                                <Activity className="w-5 h-5 text-zinc-500" />
                            )}
                        </div>
                    </div>
                    <div className={`p-2 rounded-lg ${
                        analytics.moodTrendDirection === 'improving' ? 'bg-emerald-500/10' : 
                        analytics.moodTrendDirection === 'declining' ? 'bg-rose-500/10' : 'bg-zinc-500/10'
                    }`}>
                        <TrendingUp className={`w-5 h-5 ${
                             analytics.moodTrendDirection === 'improving' ? 'text-emerald-500' : 
                             analytics.moodTrendDirection === 'declining' ? 'text-rose-500' : 'text-zinc-500'
                        }`} />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
