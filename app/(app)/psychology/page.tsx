import React from "react"
import { createClient } from "@/lib/supabase/server"
import PsychologyPageClient from "./psychology-page-client"
import type { Trade } from "@/types"

interface PsychologyStats {
  disciplineScore: number
  dominantEmotion: string
  winRate: number
  totalEntries: number
  currentStreak: number
  focusScore: number
  riskAlert: string
  totalJournalEntries: number
}

export default async function PsychologyPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <PsychologyPageClient stats={null} trades={[]} journalEntries={[]} />
  }

  // Fetch FULL trade data so the psychology correlation engine can work
  const { data: trades, error } = await supabase
    .from("trades")
    .select("id, user_id, date, instrument, direction, entry_price, exit_price, stop_loss, take_profit, size, outcome, pnl, setup_name, notes, created_at, updated_at, psychology_factors, good_habits, playbook_strategy_id, executed_rules, trade_start_time, trade_end_time")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching trades:", error)
    return <PsychologyPageClient stats={null} trades={[]} journalEntries={[]} />
  }

  // Fetch journal entries
  const { data: journalEntries } = await supabase
    .from("psychology_journal_entries")
    .select("*, trades!psychology_journal_entries_trade_id_fkey(instrument, pnl, outcome)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const stats: PsychologyStats = calculateStats(trades || [], journalEntries || [])

  return (
    <PsychologyPageClient
      stats={stats}
      trades={(trades || []) as Trade[]}
      journalEntries={journalEntries || []}
    />
  )
}

function calculateStats(trades: any[], journalEntries: any[]): PsychologyStats {
  if (trades.length === 0 && journalEntries.length === 0) {
    return {
      disciplineScore: 0,
      dominantEmotion: "Unknown",
      winRate: 0,
      totalEntries: 0,
      currentStreak: 0,
      focusScore: 0,
      riskAlert: "None",
      totalJournalEntries: 0
    }
  }

  // 1. Discipline Score: Based on absence of "Bad Habits" in journal + trades
  // We check triggers in journal entries that match known bad patterns
  const BAD_PATTERNS = [
    "overtrading", "averaging-down", "ignoring-stops", "revenge-trading", "fomo-trading", "holding-losers", "position-size-large"
  ]

  const disciplinedEntries = journalEntries.filter(entry => {
    const emotions = entry.emotions || []
    const hasBadPattern = emotions.some((e: string) => BAD_PATTERNS.includes(e))
    return !hasBadPattern
  })

  // Also check trades for explicit bad psychology tags if they exist (legacy support or if users tag trades directly)
  const disciplinedTrades = trades.filter(trade => {
    const psychologyFactors = trade.psychology_factors || []
    const hasImpulsive = psychologyFactors.some((factor: string) =>
      factor.toLowerCase().includes('impulsive') ||
      factor.toLowerCase().includes('revenge') ||
      factor.toLowerCase().includes('fomo') ||
      factor.toLowerCase().includes('overtrading')
    )
    return !hasImpulsive
  })

  // Weighted average: Journal entries are more direct psychology logs
  const totalItems = journalEntries.length + trades.length
  const totalDisciplined = disciplinedEntries.length + disciplinedTrades.length

  const disciplineScore = totalItems > 0
    ? Math.round((totalDisciplined / totalItems) * 100)
    : 100 // Default to 100 if no data

  // 2. Dominant Emotion
  const emotionCounts: Record<string, number> = {}
  journalEntries.forEach(entry => {
    if (entry.mood) {
      emotionCounts[entry.mood] = (emotionCounts[entry.mood] || 0) + 1
    }
  })
  let dominantEmotion = "Neutral"
  let maxCount = 0
  Object.entries(emotionCounts).forEach(([emotion, count]) => {
    if (count > maxCount) {
      maxCount = count
      dominantEmotion = emotion
    }
  })

  const winningTrades = trades.filter(trade => trade.pnl > 0)
  const winRate = trades.length > 0
    ? Math.round((winningTrades.length / trades.length) * 100)
    : 0

  const currentStreak = calculateJournalStreak(journalEntries)
  const focusScore = calculateFocusScore(journalEntries)
  const riskAlert = detectRiskAlert(trades, journalEntries)

  return {
    disciplineScore,
    dominantEmotion: dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1),
    winRate,
    totalEntries: trades.length,
    currentStreak,
    focusScore,
    riskAlert,
    totalJournalEntries: journalEntries.length
  }
}

function calculateJournalStreak(journalEntries: any[]): number {
  if (journalEntries.length === 0) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  let checkDate = new Date(today)
  const sortedEntries = [...journalEntries].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Check if there is an entry for today, if not start checking from yesterday
  const dateStrToday = checkDate.toISOString().split('T')[0]
  const hasEntryToday = sortedEntries.some(entry => entry.created_at.startsWith(dateStrToday))
  if (!hasEntryToday) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const hasEntry = sortedEntries.some(entry => entry.created_at.startsWith(dateStr))
    if (hasEntry) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function calculateFocusScore(journalEntries: any[]): number {
  if (journalEntries.length === 0) return 0
  let totalFocus = 0
  let count = 0
  journalEntries.forEach(entry => {
    if (entry.emotions && Array.isArray(entry.emotions)) {
      entry.emotions.forEach((emotion: string) => {
        if (emotion.startsWith("Focus:")) {
          const focusValue = parseInt(emotion.split(":")[1]) || 0
          totalFocus += focusValue
          count++
        }
      })
    }
  })
  return count > 0 ? Math.round((totalFocus / count) * 10) / 10 : 0
}

function detectRiskAlert(trades: any[], journalEntries: any[]): string {
  // Check recent journal entries (last 3 days)
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const recentEntries = journalEntries.filter(e => new Date(e.created_at) >= threeDaysAgo)

  const fomoCount = recentEntries.filter(e => e.emotions?.includes('fomo-trading')).length
  const revengeCount = recentEntries.filter(e => e.emotions?.includes('revenge-trading')).length
  const overtradingCount = recentEntries.filter(e => e.emotions?.includes('overtrading')).length
  const tiltCount = recentEntries.filter(e => ['anxious', 'frustrated', 'overwhelmed'].includes(e.mood)).length

  if (revengeCount >= 1) return "Revenge"
  if (fomoCount >= 2) return "FOMO"
  if (overtradingCount >= 2) return "Overtrading"
  if (tiltCount >= 3) return "Tilt / Burnout"

  return "None"
}
