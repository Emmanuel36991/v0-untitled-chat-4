"use client"

import { Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Trade {
  id: string
  duration_minutes?: number | null
  precise_duration_minutes?: number | null
  outcome: "win" | "loss" | "breakeven"
  pnl: number
}

interface TopDurationChartProps {
  trades: Trade[]
}

export function TopDurationChart({ trades }: TopDurationChartProps) {
  const getDurationLabel = (minutes: number) => {
    if (minutes < 15) return "< 15min"
    if (minutes < 30) return "15-30min"
    if (minutes < 60) return "30-60min"
    if (minutes < 120) return "1-2hr"
    if (minutes < 240) return "2-4hr"
    return "4hr+"
  }

  const durationStats = trades
    .filter((trade) => {
      const mins = trade.precise_duration_minutes || trade.duration_minutes
      return mins != null && mins > 0
    })
    .reduce(
      (acc, trade) => {
        const mins = trade.precise_duration_minutes || trade.duration_minutes!
        const label = getDurationLabel(mins)
        if (!acc[label]) {
          acc[label] = { wins: 0, total: 0, pnl: 0 }
        }
        acc[label].total++
        acc[label].pnl += trade.pnl
        if (trade.outcome === "win" || trade.pnl > 0) {
          acc[label].wins++
        }
        return acc
      },
      {} as Record<string, { wins: number; total: number; pnl: number }>,
    )

  const topDurations = Object.entries(durationStats)
    .map(([duration, stats]) => ({
      duration,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
      trades: stats.total,
      pnl: stats.pnl,
    }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 3)

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return "bg-yellow-500"
      case 1: return "bg-gray-400"
      case 2: return "bg-amber-600"
      default: return "bg-gray-300"
    }
  }

  return (
    <Card className="border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900/40 shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800/50">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/20">
            <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          Top 3 Duration Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        {topDurations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No duration data available</p>
        ) : (
          topDurations.map((item, index) => (
            <div key={item.duration} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-3">
                <div
                  className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold", getRankColor(index))}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-sm">{item.duration}</div>
                  <div className="text-xs text-muted-foreground">{item.trades} trades</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm font-mono">{Math.round(item.winRate)}%</div>
                <div className="text-xs text-muted-foreground">win rate</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
