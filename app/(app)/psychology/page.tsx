import React from "react"
import { createClient } from "@/lib/supabase/server"
import PsychologyPageClient from "./psychology-page-client"

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
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <PsychologyPageClient stats={null} />
  }

  // Fetch trades data from database
  const { data: trades, error } = await supabase
    .from("trades")
    .select("pnl, outcome, psychology_state, mistakes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching trades:", error)
    return <PsychologyPageClient stats={null} />
  }

  // Fetch journal entries for additional stats
  const { data: journalEntries } = await supabase
    .from("psychology_journal_entries")
    .select("created_at, mood, emotions")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate server-side stats
  const stats: PsychologyStats = calculateStats(trades || [], journalEntries || [])

  return <PsychologyPageClient stats={stats} />
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

  // 1. Discipline Score: Percentage of trades without 'Impulsive' or 'Revenge' tags
  const disciplinedTrades = trades.filter(trade => {
    const mistakes = trade.mistakes || []
    const hasImpulsive = mistakes.some((m: string) => 
      m.toLowerCase().includes('impulsive') || m.toLowerCase().includes('revenge')
    )
    return !hasImpulsive
  })
  const disciplineScore = trades.length > 0 
    ? Math.round((disciplinedTrades.length / trades.length) * 100)
    : 0

  // 2. Dominant Emotion: Most frequent psychology_state from trades
  const emotionCounts: Record<string, number> = {}
  trades.forEach(trade => {
    if (trade.psychology_state) {
      emotionCounts[trade.psychology_state] = (emotionCounts[trade.psychology_state] || 0) + 1
    }
  })
  
  // Also include journal entry moods
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

  // 3. Win Rate: Percentage of trades with pnl > 0
  const winningTrades = trades.filter(trade => trade.pnl > 0)
  const winRate = trades.length > 0 
    ? Math.round((winningTrades.length / trades.length) * 100)
    : 0

  // 4. Current Streak: Calculate consecutive days with journal entries
  const currentStreak = calculateJournalStreak(journalEntries)

  // 5. Focus Score: Average focus level from journal entries
  const focusScore = calculateFocusScore(journalEntries)

  // 6. Risk Alert: Detect FOMO or Revenge trading patterns
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

  // Sort entries by date (newest first)
  const sortedEntries = [...journalEntries].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Check each day backwards from today
  for (let i = 0; i < 90; i++) { // Check up to 90 days
    const dateStr = checkDate.toISOString().split('T')[0]
    const hasEntry = sortedEntries.some(entry => 
      entry.created_at.startsWith(dateStr)
    )
    
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
  // Check recent trades for FOMO/Revenge patterns
  const recentTrades = trades.slice(0, 10)
  const fomoCount = recentTrades.filter(trade => {
    const mistakes = trade.mistakes || []
    return mistakes.some((m: string) => m.toLowerCase().includes('fomo'))
  }).length

  const revengeCount = recentTrades.filter(trade => {
    const mistakes = trade.mistakes || []
    return mistakes.some((m: string) => m.toLowerCase().includes('revenge'))
  }).length

  // Check journal entries for emotional triggers
  const recentJournalEntries = journalEntries.slice(0, 5)
  const stressedMoods = ['anxious', 'overwhelmed', 'frustrated', 'exhausted']
  const stressCount = recentJournalEntries.filter(entry => 
    stressedMoods.includes(entry.mood)
  ).length

  // Determine risk alert
  if (fomoCount >= 3) return "FOMO"
  if (revengeCount >= 2) return "Revenge"
  if (stressCount >= 3) return "Burnout"
  
  return "None"
}
