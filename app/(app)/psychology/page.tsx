import React from "react"
import { createClient } from "@/lib/supabase/server"
import PsychologyPageClient from "./psychology-page-client"

interface PsychologyStats {
  disciplineScore: number
  dominantEmotion: string
  winRate: number
  totalEntries: number
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
    .select("pnl, outcome, psychology_state, mistakes")
    .eq("user_id", user.id)

  if (error) {
    console.error("Error fetching trades:", error)
    return <PsychologyPageClient stats={null} />
  }

  // Calculate server-side stats
  const stats: PsychologyStats = calculateStats(trades || [])

  return <PsychologyPageClient stats={stats} />
}

function calculateStats(trades: any[]): PsychologyStats {
  if (trades.length === 0) {
    return {
      disciplineScore: 0,
      dominantEmotion: "Unknown",
      winRate: 0,
      totalEntries: 0
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
  const disciplineScore = Math.round((disciplinedTrades.length / trades.length) * 100)

  // 2. Dominant Emotion: Most frequent psychology_state
  const emotionCounts: Record<string, number> = {}
  trades.forEach(trade => {
    if (trade.psychology_state) {
      emotionCounts[trade.psychology_state] = (emotionCounts[trade.psychology_state] || 0) + 1
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
  const winRate = Math.round((winningTrades.length / trades.length) * 100)

  return {
    disciplineScore,
    dominantEmotion: dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1),
    winRate,
    totalEntries: trades.length
  }
}
