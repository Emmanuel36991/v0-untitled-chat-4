"use server"

import { createClient } from "@/lib/supabase/server"
import { buildTradingContext, type TradingContext } from "./context-builder"
import { analyzePsychologyPatterns, type PsychologyAnalysisResult } from "@/lib/insights/psychology-analyzer"
import type { Trade, PlaybookStrategy } from "@/types"

// ==========================================
// TYPES
// ==========================================

export interface EmotionalState {
  currentMood: string
  recentMoods: string[]
  stressLevel: "low" | "moderate" | "high" | "critical"
  emotionalTrend: "improving" | "stable" | "declining"
  riskOfTilt: number // 0-100
  lastJournalDate: string | null
}

export interface BehavioralPattern {
  pattern: string
  frequency: number
  impact: "positive" | "negative" | "neutral"
  description: string
  recommendation: string
}

export interface UserProfile {
  tradingStyle: string
  preferredInstruments: string[]
  preferredSessions: string[]
  riskTolerance: "conservative" | "moderate" | "aggressive"
  experienceLevel: "beginner" | "intermediate" | "advanced"
  strengths: string[]
  areasForImprovement: string[]
  goals: string[]
}

export interface EnhancedTradingContext {
  // Core trading data
  tradingContext: TradingContext
  
  // Emotional intelligence
  emotionalState: EmotionalState
  psychologyAnalysis: PsychologyAnalysisResult
  
  // Behavioral insights
  behavioralPatterns: BehavioralPattern[]
  
  // User profile
  userProfile: UserProfile
  
  // Strategies
  strategies: {
    total: number
    topPerforming: Array<{ name: string; winRate: number; trades: number }>
    recentlyUsed: string[]
  }
  
  // Recent activity
  recentActivity: {
    lastTradeDate: string | null
    tradesThisWeek: number
    tradesThisMonth: number
    currentStreak: { type: "win" | "loss" | "none"; count: number }
    daysSinceLastTrade: number
  }
  
  // Contextual alerts
  alerts: Array<{
    type: "warning" | "info" | "success"
    message: string
    priority: number
  }>
  
  // Summary for AI prompt
  contextSummary: string
}

// ==========================================
// MAIN FUNCTION
// ==========================================

export async function buildEnhancedContext(): Promise<EnhancedTradingContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return getEmptyContext()
  }

  // Fetch all data in parallel
  const [trades, strategies, journalEntries, userConfig] = await Promise.all([
    fetchTrades(supabase, user.id),
    fetchStrategies(supabase, user.id),
    fetchJournalEntries(supabase, user.id),
    fetchUserConfig(supabase, user.id),
  ])

  // Build core trading context
  const tradingContext = buildTradingContext(trades)
  
  // Analyze psychology patterns
  const psychologyAnalysis = analyzePsychologyPatterns(trades)
  
  // Determine emotional state
  const emotionalState = analyzeEmotionalState(trades, journalEntries)
  
  // Detect behavioral patterns
  const behavioralPatterns = detectBehavioralPatterns(trades)
  
  // Build user profile
  const userProfile = buildUserProfile(trades, userConfig)
  
  // Analyze strategies
  const strategyAnalysis = analyzeStrategies(trades, strategies)
  
  // Calculate recent activity
  const recentActivity = calculateRecentActivity(trades)
  
  // Generate alerts
  const alerts = generateAlerts(tradingContext, emotionalState, behavioralPatterns, recentActivity)
  
  // Create context summary for AI
  const contextSummary = generateContextSummary({
    tradingContext,
    emotionalState,
    psychologyAnalysis,
    behavioralPatterns,
    userProfile,
    strategies: strategyAnalysis,
    recentActivity,
    alerts,
  })

  return {
    tradingContext,
    emotionalState,
    psychologyAnalysis,
    behavioralPatterns,
    userProfile,
    strategies: strategyAnalysis,
    recentActivity,
    alerts,
    contextSummary,
  }
}

// ==========================================
// DATA FETCHING
// ==========================================

async function fetchTrades(supabase: any, userId: string): Promise<Trade[]> {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(500)

  if (error) {
    console.error("Error fetching trades for context:", error)
    return []
  }
  
  return data || []
}

async function fetchStrategies(supabase: any, userId: string): Promise<PlaybookStrategy[]> {
  const { data, error } = await supabase
    .from("playbook_strategies")
    .select("*")
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching strategies for context:", error)
    return []
  }
  
  return data || []
}

async function fetchJournalEntries(supabase: any, userId: string): Promise<any[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data, error } = await supabase
    .from("psychology_journal_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("entry_date", { ascending: false })
    .limit(30)

  if (error) {
    console.error("Error fetching journal entries for context:", error)
    return []
  }
  
  return data || []
}

async function fetchUserConfig(supabase: any, userId: string): Promise<any> {
  const { data, error } = await supabase
    .from("user_config")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user config:", error)
  }
  
  return data || {}
}

// ==========================================
// ANALYSIS FUNCTIONS
// ==========================================

function analyzeEmotionalState(trades: Trade[], journalEntries: any[]): EmotionalState {
  const recentMoods = journalEntries.slice(0, 7).map(j => j.mood).filter(Boolean)
  const currentMood = recentMoods[0] || "neutral"
  
  // Calculate stress indicators
  const recentTrades = trades.slice(0, 10)
  const recentLosses = recentTrades.filter(t => t.outcome === "loss").length
  const hasLosingStreak = detectCurrentStreak(trades).type === "loss" && detectCurrentStreak(trades).count >= 3
  
  // Check for high-stress patterns
  const hasRevengeTradingRisk = recentTrades.some(t => 
    t.psychology_factors?.includes("bad_revenge") || 
    t.psychology_factors?.includes("bad_emotional")
  )
  
  let stressLevel: EmotionalState["stressLevel"] = "low"
  let riskOfTilt = 0
  
  if (recentLosses >= 7) {
    stressLevel = "critical"
    riskOfTilt = 90
  } else if (recentLosses >= 5 || hasLosingStreak) {
    stressLevel = "high"
    riskOfTilt = 70
  } else if (recentLosses >= 3 || hasRevengeTradingRisk) {
    stressLevel = "moderate"
    riskOfTilt = 40
  }
  
  // Determine emotional trend
  let emotionalTrend: EmotionalState["emotionalTrend"] = "stable"
  if (recentMoods.length >= 3) {
    const moodScores = recentMoods.map(moodToScore)
    const recentAvg = moodScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3
    const olderAvg = moodScores.slice(3).reduce((a, b) => a + b, 0) / Math.max(1, moodScores.slice(3).length)
    
    if (recentAvg > olderAvg + 0.5) emotionalTrend = "improving"
    else if (recentAvg < olderAvg - 0.5) emotionalTrend = "declining"
  }
  
  return {
    currentMood,
    recentMoods,
    stressLevel,
    emotionalTrend,
    riskOfTilt,
    lastJournalDate: journalEntries[0]?.entry_date || null,
  }
}

function moodToScore(mood: string): number {
  const scores: Record<string, number> = {
    "very_positive": 5, "positive": 4, "neutral": 3, "negative": 2, "very_negative": 1,
    "confident": 5, "focused": 4, "calm": 4, "anxious": 2, "frustrated": 1, "fearful": 1,
  }
  return scores[mood] || 3
}

function detectBehavioralPatterns(trades: Trade[]): BehavioralPattern[] {
  const patterns: BehavioralPattern[] = []
  
  if (trades.length < 10) return patterns

  // Pattern 1: Overtrading detection
  const tradeDates = trades.map(t => t.date)
  const uniqueDates = [...new Set(tradeDates)]
  const tradesPerDay = trades.length / uniqueDates.length
  
  if (tradesPerDay > 5) {
    patterns.push({
      pattern: "Overtrading",
      frequency: tradesPerDay,
      impact: "negative",
      description: `Averaging ${tradesPerDay.toFixed(1)} trades per active day`,
      recommendation: "Consider reducing trade frequency and focusing on A+ setups only",
    })
  }

  // Pattern 2: Revenge trading detection
  const revengeTradeInstances = trades.filter(t => 
    t.psychology_factors?.includes("bad_revenge")
  ).length
  
  if (revengeTradeInstances >= 3) {
    const revengeRate = (revengeTradeInstances / trades.length) * 100
    patterns.push({
      pattern: "Revenge Trading",
      frequency: revengeTradeInstances,
      impact: "negative",
      description: `Identified in ${revengeRate.toFixed(1)}% of trades`,
      recommendation: "Implement a mandatory cool-off period after losses",
    })
  }

  // Pattern 3: FOMO detection
  const fomoInstances = trades.filter(t => 
    t.psychology_factors?.includes("bad_fomo")
  ).length
  
  if (fomoInstances >= 3) {
    patterns.push({
      pattern: "FOMO Trading",
      frequency: fomoInstances,
      impact: "negative",
      description: `Fear of missing out detected in ${fomoInstances} trades`,
      recommendation: "Trust your analysis. Missing a trade is better than taking a bad one",
    })
  }

  // Pattern 4: Stop loss discipline
  const movedStopLoss = trades.filter(t => 
    t.psychology_factors?.includes("bad_moved_sl")
  ).length
  
  if (movedStopLoss >= 2) {
    patterns.push({
      pattern: "Stop Loss Movement",
      frequency: movedStopLoss,
      impact: "negative",
      description: `Moved stop loss in ${movedStopLoss} trades`,
      recommendation: "Once set, treat your stop loss as sacred. Never widen it",
    })
  }

  // Pattern 5: Positive discipline pattern
  const disciplinedTrades = trades.filter(t => 
    t.good_habits?.includes("good_followed_plan") ||
    t.good_habits?.includes("good_disciplined")
  ).length
  
  if (disciplinedTrades >= 5) {
    const disciplineRate = (disciplinedTrades / trades.length) * 100
    patterns.push({
      pattern: "Disciplined Execution",
      frequency: disciplinedTrades,
      impact: "positive",
      description: `${disciplineRate.toFixed(1)}% of trades followed the plan`,
      recommendation: "Keep up the great discipline! This is key to long-term success",
    })
  }

  // Pattern 6: Session performance
  const sessionStats = analyzeSessionPerformance(trades)
  const bestSession = sessionStats.sort((a, b) => b.winRate - a.winRate)[0]
  const worstSession = sessionStats.sort((a, b) => a.winRate - b.winRate)[0]
  
  if (bestSession && worstSession && bestSession.session !== worstSession.session) {
    if (bestSession.winRate - worstSession.winRate > 15) {
      patterns.push({
        pattern: "Session Performance Gap",
        frequency: 1,
        impact: "neutral",
        description: `Best in ${bestSession.session} (${bestSession.winRate.toFixed(1)}% WR), worst in ${worstSession.session} (${worstSession.winRate.toFixed(1)}% WR)`,
        recommendation: `Consider focusing more on ${bestSession.session} and reducing activity in ${worstSession.session}`,
      })
    }
  }

  // Pattern 7: Day of week analysis
  const dayStats = analyzeDayOfWeekPerformance(trades)
  const bestDay = dayStats.sort((a, b) => b.avgPnl - a.avgPnl)[0]
  const worstDay = dayStats.sort((a, b) => a.avgPnl - b.avgPnl)[0]
  
  if (bestDay && worstDay && bestDay.day !== worstDay.day && worstDay.avgPnl < 0) {
    patterns.push({
      pattern: "Day Performance Variance",
      frequency: 1,
      impact: "neutral",
      description: `Best performance on ${bestDay.day}, struggles on ${worstDay.day}`,
      recommendation: `${worstDay.day}s might need different approach or reduced size`,
    })
  }

  return patterns
}

function analyzeSessionPerformance(trades: Trade[]): Array<{ session: string; winRate: number; trades: number }> {
  const sessionMap = new Map<string, { wins: number; total: number }>()
  
  trades.forEach(t => {
    const session = t.trade_session || "Unknown"
    if (!sessionMap.has(session)) {
      sessionMap.set(session, { wins: 0, total: 0 })
    }
    const stats = sessionMap.get(session)!
    stats.total++
    if (t.outcome === "win") stats.wins++
  })
  
  return Array.from(sessionMap.entries())
    .filter(([_, stats]) => stats.total >= 5)
    .map(([session, stats]) => ({
      session,
      winRate: (stats.wins / stats.total) * 100,
      trades: stats.total,
    }))
}

function analyzeDayOfWeekPerformance(trades: Trade[]): Array<{ day: string; avgPnl: number; trades: number }> {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayMap = new Map<string, { totalPnl: number; count: number }>()
  
  trades.forEach(t => {
    const dayIndex = new Date(t.date).getDay()
    const day = days[dayIndex]
    if (!dayMap.has(day)) {
      dayMap.set(day, { totalPnl: 0, count: 0 })
    }
    const stats = dayMap.get(day)!
    stats.totalPnl += t.pnl
    stats.count++
  })
  
  return Array.from(dayMap.entries())
    .filter(([_, stats]) => stats.count >= 3)
    .map(([day, stats]) => ({
      day,
      avgPnl: stats.totalPnl / stats.count,
      trades: stats.count,
    }))
}

function buildUserProfile(trades: Trade[], userConfig: any): UserProfile {
  // Determine trading style from trade patterns
  const avgHoldTime = trades
    .filter(t => t.duration_minutes)
    .reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / trades.length

  let tradingStyle = "Day Trading"
  if (avgHoldTime < 15) tradingStyle = "Scalping"
  else if (avgHoldTime > 240) tradingStyle = "Swing Trading"

  // Get preferred instruments
  const instrumentCounts = trades.reduce((acc, t) => {
    acc[t.instrument] = (acc[t.instrument] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const preferredInstruments = Object.entries(instrumentCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([instrument]) => instrument)

  // Get preferred sessions
  const sessionCounts = trades.reduce((acc, t) => {
    const session = t.trade_session || "Unknown"
    acc[session] = (acc[session] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const preferredSessions = Object.entries(sessionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([session]) => session)

  // Determine risk tolerance from position sizing
  const avgRisk = trades
    .filter(t => t.stop_loss)
    .map(t => Math.abs(t.entry_price - t.stop_loss) / t.entry_price * 100)
    .reduce((sum, r) => sum + r, 0) / trades.length

  let riskTolerance: UserProfile["riskTolerance"] = "moderate"
  if (avgRisk < 0.5) riskTolerance = "conservative"
  else if (avgRisk > 2) riskTolerance = "aggressive"

  // Determine experience level
  let experienceLevel: UserProfile["experienceLevel"] = "beginner"
  if (trades.length > 500) experienceLevel = "advanced"
  else if (trades.length > 100) experienceLevel = "intermediate"

  // Identify strengths
  const strengths: string[] = []
  const winRate = trades.filter(t => t.outcome === "win").length / trades.length * 100
  if (winRate > 55) strengths.push("Above average win rate")
  
  const stopLossUsage = trades.filter(t => t.stop_loss).length / trades.length * 100
  if (stopLossUsage > 80) strengths.push("Consistent risk management")
  
  const goodHabitUsage = trades.filter(t => t.good_habits?.length).length / trades.length * 100
  if (goodHabitUsage > 50) strengths.push("Strong trading discipline")

  // Identify areas for improvement
  const areasForImprovement: string[] = []
  if (winRate < 45) areasForImprovement.push("Trade selection")
  if (stopLossUsage < 60) areasForImprovement.push("Risk management consistency")
  
  const revengeTradingRate = trades.filter(t => t.psychology_factors?.includes("bad_revenge")).length / trades.length * 100
  if (revengeTradingRate > 10) areasForImprovement.push("Emotional control")

  return {
    tradingStyle,
    preferredInstruments,
    preferredSessions,
    riskTolerance,
    experienceLevel,
    strengths,
    areasForImprovement,
    goals: userConfig?.goals || [],
  }
}

function analyzeStrategies(trades: Trade[], strategies: PlaybookStrategy[]): EnhancedTradingContext["strategies"] {
  // Get strategy performance from trades
  const strategyStats = strategies.map(strat => {
    const stratTrades = trades.filter(t => t.playbook_strategy_id === strat.id || t.setup_name === strat.name)
    const wins = stratTrades.filter(t => t.outcome === "win").length
    return {
      name: strat.name,
      winRate: stratTrades.length > 0 ? (wins / stratTrades.length) * 100 : 0,
      trades: stratTrades.length,
    }
  })

  const topPerforming = strategyStats
    .filter(s => s.trades >= 3)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 3)

  // Get recently used strategies
  const recentTrades = trades.slice(0, 20)
  const recentlyUsed = [...new Set(
    recentTrades
      .map(t => t.setup_name)
      .filter(Boolean) as string[]
  )].slice(0, 5)

  return {
    total: strategies.length,
    topPerforming,
    recentlyUsed,
  }
}

function calculateRecentActivity(trades: Trade[]): EnhancedTradingContext["recentActivity"] {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const tradesThisWeek = trades.filter(t => new Date(t.date) >= oneWeekAgo).length
  const tradesThisMonth = trades.filter(t => new Date(t.date) >= oneMonthAgo).length
  
  const lastTrade = trades[0]
  const lastTradeDate = lastTrade?.date || null
  const daysSinceLastTrade = lastTradeDate 
    ? Math.floor((now.getTime() - new Date(lastTradeDate).getTime()) / (24 * 60 * 60 * 1000))
    : -1

  const currentStreak = detectCurrentStreak(trades)

  return {
    lastTradeDate,
    tradesThisWeek,
    tradesThisMonth,
    currentStreak,
    daysSinceLastTrade,
  }
}

function detectCurrentStreak(trades: Trade[]): { type: "win" | "loss" | "none"; count: number } {
  if (trades.length === 0) return { type: "none", count: 0 }
  
  const firstOutcome = trades[0].outcome
  if (firstOutcome === "breakeven") return { type: "none", count: 0 }
  
  let count = 0
  for (const trade of trades) {
    if (trade.outcome === firstOutcome) {
      count++
    } else {
      break
    }
  }
  
  return { type: firstOutcome as "win" | "loss", count }
}

function generateAlerts(
  tradingContext: TradingContext,
  emotionalState: EmotionalState,
  behavioralPatterns: BehavioralPattern[],
  recentActivity: EnhancedTradingContext["recentActivity"]
): EnhancedTradingContext["alerts"] {
  const alerts: EnhancedTradingContext["alerts"] = []

  // Critical: High tilt risk
  if (emotionalState.riskOfTilt >= 70) {
    alerts.push({
      type: "warning",
      message: "High risk of tilt detected. Consider taking a break before your next trade.",
      priority: 1,
    })
  }

  // Warning: Losing streak
  if (recentActivity.currentStreak.type === "loss" && recentActivity.currentStreak.count >= 3) {
    alerts.push({
      type: "warning",
      message: `You're on a ${recentActivity.currentStreak.count}-trade losing streak. Review your recent trades before continuing.`,
      priority: 2,
    })
  }

  // Warning: Haven't traded in a while
  if (recentActivity.daysSinceLastTrade > 7) {
    alerts.push({
      type: "info",
      message: `It's been ${recentActivity.daysSinceLastTrade} days since your last trade. Take time to review market conditions.`,
      priority: 5,
    })
  }

  // Success: Winning streak
  if (recentActivity.currentStreak.type === "win" && recentActivity.currentStreak.count >= 3) {
    alerts.push({
      type: "success",
      message: `Great work! You're on a ${recentActivity.currentStreak.count}-trade winning streak. Stay disciplined.`,
      priority: 3,
    })
  }

  // Warning: Declining performance
  if (tradingContext.recentTrends.last10Trades.trend === "declining") {
    alerts.push({
      type: "warning",
      message: "Your recent performance is declining. Consider reviewing your strategy and taking smaller positions.",
      priority: 2,
    })
  }

  // Info: Behavioral pattern alerts
  const negativePatterns = behavioralPatterns.filter(p => p.impact === "negative")
  if (negativePatterns.length > 0) {
    const topPattern = negativePatterns[0]
    alerts.push({
      type: "warning",
      message: `${topPattern.pattern} detected: ${topPattern.recommendation}`,
      priority: 3,
    })
  }

  // Sort by priority
  return alerts.sort((a, b) => a.priority - b.priority)
}

function generateContextSummary(context: Omit<EnhancedTradingContext, "contextSummary">): string {
  const { tradingContext, emotionalState, psychologyAnalysis, behavioralPatterns, userProfile, strategies, recentActivity, alerts } = context
  
  const lines: string[] = []
  
  // Performance Summary
  lines.push("=== TRADER PROFILE ===")
  lines.push(`Style: ${userProfile.tradingStyle} | Experience: ${userProfile.experienceLevel} | Risk: ${userProfile.riskTolerance}`)
  lines.push(`Preferred Instruments: ${userProfile.preferredInstruments.join(", ") || "Not established"}`)
  lines.push(`Strengths: ${userProfile.strengths.join(", ") || "Building foundation"}`)
  lines.push(`Areas to Improve: ${userProfile.areasForImprovement.join(", ") || "Doing well"}`)
  
  lines.push("")
  lines.push("=== PERFORMANCE METRICS ===")
  lines.push(`Total Trades: ${tradingContext.performance.totalTrades} | Win Rate: ${tradingContext.performance.winRate.toFixed(1)}%`)
  lines.push(`Total P&L: $${tradingContext.performance.totalPnl.toFixed(2)} | Profit Factor: ${tradingContext.performance.profitFactor.toFixed(2)}`)
  lines.push(`Max Drawdown: $${tradingContext.performance.maxDrawdown.toFixed(2)} | Sharpe: ${tradingContext.performance.sharpeRatio.toFixed(2)}`)
  
  lines.push("")
  lines.push("=== EMOTIONAL STATE ===")
  lines.push(`Current Mood: ${emotionalState.currentMood} | Stress Level: ${emotionalState.stressLevel}`)
  lines.push(`Tilt Risk: ${emotionalState.riskOfTilt}% | Trend: ${emotionalState.emotionalTrend}`)
  
  lines.push("")
  lines.push("=== RECENT ACTIVITY ===")
  lines.push(`Last Trade: ${recentActivity.lastTradeDate || "Never"} (${recentActivity.daysSinceLastTrade >= 0 ? recentActivity.daysSinceLastTrade + " days ago" : "N/A"})`)
  lines.push(`This Week: ${recentActivity.tradesThisWeek} trades | This Month: ${recentActivity.tradesThisMonth} trades`)
  if (recentActivity.currentStreak.type !== "none") {
    lines.push(`Current Streak: ${recentActivity.currentStreak.count} ${recentActivity.currentStreak.type}s`)
  }
  
  // Psychology insights
  if (psychologyAnalysis.insights.length > 0) {
    lines.push("")
    lines.push("=== PSYCHOLOGY INSIGHTS ===")
    psychologyAnalysis.insights.slice(0, 3).forEach(insight => lines.push(`- ${insight}`))
  }
  
  // Behavioral patterns
  if (behavioralPatterns.length > 0) {
    lines.push("")
    lines.push("=== BEHAVIORAL PATTERNS ===")
    behavioralPatterns.slice(0, 3).forEach(p => {
      lines.push(`- ${p.pattern} (${p.impact}): ${p.description}`)
    })
  }
  
  // Active alerts
  if (alerts.length > 0) {
    lines.push("")
    lines.push("=== ACTIVE ALERTS ===")
    alerts.slice(0, 3).forEach(a => lines.push(`[${a.type.toUpperCase()}] ${a.message}`))
  }
  
  // Strategies
  if (strategies.topPerforming.length > 0) {
    lines.push("")
    lines.push("=== TOP STRATEGIES ===")
    strategies.topPerforming.forEach(s => {
      lines.push(`- ${s.name}: ${s.winRate.toFixed(1)}% WR (${s.trades} trades)`)
    })
  }
  
  // Recommendations
  if (tradingContext.recommendations.length > 0) {
    lines.push("")
    lines.push("=== AI RECOMMENDATIONS ===")
    tradingContext.recommendations.slice(0, 3).forEach(r => lines.push(`- ${r}`))
  }
  
  return lines.join("\n")
}

// ==========================================
// EMPTY CONTEXT
// ==========================================

function getEmptyContext(): EnhancedTradingContext {
  return {
    tradingContext: {
      performance: { totalTrades: 0, winRate: 0, totalPnl: 0, avgPnlPerTrade: 0, profitFactor: 0, maxDrawdown: 0, sharpeRatio: 0 },
      patterns: { bestSetups: [], worstSetups: [], instrumentPerformance: [], timePatterns: [] },
      riskMetrics: { stopLossUsage: 0, avgRiskPerTrade: 0, riskRewardRatio: 0, maxConsecutiveLosses: 0, riskScore: 0 },
      recentTrends: { last10Trades: { winRate: 0, totalPnl: 0, trend: "stable" }, last30Days: { winRate: 0, totalPnl: 0, tradeFrequency: 0 } },
      strengths: [],
      weaknesses: [],
      recommendations: ["Start by logging your first trade to begin analysis"],
    },
    emotionalState: {
      currentMood: "neutral",
      recentMoods: [],
      stressLevel: "low",
      emotionalTrend: "stable",
      riskOfTilt: 0,
      lastJournalDate: null,
    },
    psychologyAnalysis: {
      allFactors: [],
      positiveFactors: [],
      negativeFactors: [],
      topKillers: [],
      topEnablers: [],
      goodHabits: [],
      badHabits: [],
      insights: [],
    },
    behavioralPatterns: [],
    userProfile: {
      tradingStyle: "Day Trading",
      preferredInstruments: [],
      preferredSessions: [],
      riskTolerance: "moderate",
      experienceLevel: "beginner",
      strengths: [],
      areasForImprovement: [],
      goals: [],
    },
    strategies: { total: 0, topPerforming: [], recentlyUsed: [] },
    recentActivity: {
      lastTradeDate: null,
      tradesThisWeek: 0,
      tradesThisMonth: 0,
      currentStreak: { type: "none", count: 0 },
      daysSinceLastTrade: -1,
    },
    alerts: [],
    contextSummary: "No trading data available yet. Start logging trades to receive personalized insights.",
  }
}
