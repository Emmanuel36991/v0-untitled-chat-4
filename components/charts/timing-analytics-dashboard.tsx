"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Clock, TrendingUp, Target, Activity } from "lucide-react"
import type { Trade } from "@/types"
import { TopDurationChart } from "./top-duration-chart"
import { TopTimeChart } from "./top-time-chart"
import { cn } from "@/lib/utils"

interface TimingAnalyticsDashboardProps {
  trades: Trade[]
  className?: string
}

export function TimingAnalyticsDashboard({ trades, className }: TimingAnalyticsDashboardProps) {
  const timingInsights = React.useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        avgDuration: 0,
        avgDurationFormatted: "N/A",
        mostActivePeriod: "N/A",
        bestPerformingDuration: "N/A",
        bestPerformingTime: "N/A",
      }
    }

    // --- Average Duration (from real data) ---
    const durationsWithData = trades.filter(
      (t) => (t.duration_minutes != null && t.duration_minutes > 0) || (t.precise_duration_minutes != null && t.precise_duration_minutes > 0)
    )
    const avgDurationMinutes =
      durationsWithData.length > 0
        ? durationsWithData.reduce(
          (sum, trade) => sum + (trade.precise_duration_minutes || trade.duration_minutes || 0),
          0,
        ) / durationsWithData.length
        : 0

    // Format duration nicely
    let avgDurationFormatted = "N/A"
    if (durationsWithData.length > 0) {
      if (avgDurationMinutes < 1) {
        avgDurationFormatted = "<1min"
      } else if (avgDurationMinutes < 60) {
        avgDurationFormatted = `${Math.round(avgDurationMinutes)}min`
      } else {
        const hours = Math.floor(avgDurationMinutes / 60)
        const mins = Math.round(avgDurationMinutes % 60)
        avgDurationFormatted = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
      }
    }

    // --- Most Active Trading Hour (only from trade_start_time, no fallback) ---
    const tradesWithTime = trades.filter(
      (t) => t.trade_start_time && typeof t.trade_start_time === "string" && t.trade_start_time.includes(":")
    )

    let mostActivePeriod = "N/A"
    if (tradesWithTime.length > 0) {
      const hourCounts: Record<number, number> = {}
      tradesWithTime.forEach((trade) => {
        const parts = trade.trade_start_time!.split(":")
        const hour = parseInt(parts[0], 10)
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        }
      })

      const entries = Object.entries(hourCounts)
      if (entries.length > 0) {
        const mostActiveHour = entries.reduce(
          (max, [hour, count]) => (count > max.count ? { hour: parseInt(hour, 10), count } : max),
          { hour: 0, count: 0 },
        )
        mostActivePeriod = `${mostActiveHour.hour.toString().padStart(2, "0")}:00`
      }
    }

    // --- Best Performing Duration (computed from real data) ---
    const getDurationBucket = (minutes: number): string => {
      if (minutes < 15) return "< 15min"
      if (minutes < 30) return "15-30min"
      if (minutes < 60) return "30-60min"
      if (minutes < 120) return "1-2hr"
      if (minutes < 240) return "2-4hr"
      return "4hr+"
    }

    let bestPerformingDuration = "N/A"
    if (durationsWithData.length > 0) {
      const durationBuckets: Record<string, { wins: number; total: number }> = {}
      durationsWithData.forEach((t) => {
        const mins = t.precise_duration_minutes || t.duration_minutes || 0
        const bucket = getDurationBucket(mins)
        if (!durationBuckets[bucket]) durationBuckets[bucket] = { wins: 0, total: 0 }
        durationBuckets[bucket].total++
        if (t.outcome === "win" || t.pnl > 0) durationBuckets[bucket].wins++
      })

      // Find bucket with highest win rate (minimum 2 trades to be meaningful)
      let bestWinRate = -1
      Object.entries(durationBuckets).forEach(([bucket, stats]) => {
        if (stats.total >= 2) {
          const wr = stats.wins / stats.total
          if (wr > bestWinRate) {
            bestWinRate = wr
            bestPerformingDuration = bucket
          }
        }
      })
      // Fallback if no bucket has >= 2 trades
      if (bestPerformingDuration === "N/A" && Object.keys(durationBuckets).length > 0) {
        const entries = Object.entries(durationBuckets)
        const best = entries.reduce((a, b) => ((b[1].wins / b[1].total) > (a[1].wins / a[1].total) ? b : a))
        bestPerformingDuration = best[0]
      }
    }

    // --- Best Performing Entry Time (computed from real data) ---
    let bestPerformingTime = "N/A"
    if (tradesWithTime.length > 0) {
      const hourStats: Record<number, { wins: number; total: number }> = {}
      tradesWithTime.forEach((t) => {
        const parts = t.trade_start_time!.split(":")
        const hour = parseInt(parts[0], 10)
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          if (!hourStats[hour]) hourStats[hour] = { wins: 0, total: 0 }
          hourStats[hour].total++
          if (t.outcome === "win" || t.pnl > 0) hourStats[hour].wins++
        }
      })

      // Find hour with highest win rate (minimum 2 trades)
      let bestWinRate = -1
      Object.entries(hourStats).forEach(([hour, stats]) => {
        if (stats.total >= 2) {
          const wr = stats.wins / stats.total
          if (wr > bestWinRate) {
            bestWinRate = wr
            bestPerformingTime = `${parseInt(hour, 10).toString().padStart(2, "0")}:00`
          }
        }
      })
      // Fallback if no hour has >= 2 trades
      if (bestPerformingTime === "N/A" && Object.keys(hourStats).length > 0) {
        const entries = Object.entries(hourStats)
        const best = entries.reduce((a, b) => ((b[1].wins / b[1].total) > (a[1].wins / a[1].total) ? b : a))
        bestPerformingTime = `${parseInt(best[0], 10).toString().padStart(2, "0")}:00`
      }
    }

    return {
      avgDuration: Math.round(avgDurationMinutes),
      avgDurationFormatted,
      mostActivePeriod,
      bestPerformingDuration,
      bestPerformingTime,
    }
  }, [trades])

  return (
    <div className={className}>
      {/* Overview Cards */}
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Timing Analytics
        </CardTitle>
        <CardDescription className="text-xs">Duration and entry time performance breakdown</CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1.5 p-3.5 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              Avg Duration
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
              {timingInsights.avgDurationFormatted}
            </div>
            <p className="text-[10px] text-muted-foreground">Average hold time</p>
          </div>

          <div className="flex flex-col gap-1.5 p-3.5 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Most Active
            </div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {timingInsights.mostActivePeriod}
            </div>
            <p className="text-[10px] text-muted-foreground">Peak trading time</p>
          </div>

          <div className="flex flex-col gap-1.5 p-3.5 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Target className="h-3.5 w-3.5 text-primary" />
              Best Duration
            </div>
            <div className="text-lg font-bold text-primary font-mono">
              {timingInsights.bestPerformingDuration}
            </div>
            <p className="text-[10px] text-muted-foreground">Highest win rate hold time</p>
          </div>

          <div className="flex flex-col gap-1.5 p-3.5 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-amber-500" />
              Best Time
            </div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
              {timingInsights.bestPerformingTime}
            </div>
            <p className="text-[10px] text-muted-foreground">Highest win rate entry</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <TopDurationChart trades={trades} />
          <TopTimeChart trades={trades} />
        </div>
      </CardContent>
    </div>
  )
}

export default TimingAnalyticsDashboard
