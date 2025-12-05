"use client"

import { Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Trade {
  id: string
  duration_minutes: number | null
  outcome: "win" | "loss"
}

interface TopDurationChartProps {
  trades: Trade[]
}

export function TopDurationChart({ trades }: TopDurationChartProps) {
  const getDurationLabel = (minutes: number) => {
    if (minutes < 15) return "< 15min"
    if (minutes < 30) return "15-30min"
    if (minutes < 60) return "30-60min"
    if (minutes < 120) "1-2hr"
    if (minutes < 240) return "2-4hr"
    return "4hr+"
  }

  const durationStats = trades
    .filter((trade) => trade.duration_minutes !== null)
    .reduce(
      (acc, trade) => {
        const label = getDurationLabel(trade.duration_minutes!)
        if (!acc[label]) {
          acc[label] = { wins: 0, total: 0 }
        }
        acc[label].total++
        if (trade.outcome === "win") {
          acc[label].wins++
        }
        return acc
      },
      {} as Record<string, { wins: number; total: number }>,
    )

  const topDurations = Object.entries(durationStats)
    .map(([duration, stats]) => ({
      duration,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
      trades: stats.total,
    }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 3)

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-500"
      case 1:
        return "bg-gray-400"
      case 2:
        return "bg-amber-600"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <div className="p-1.5 rounded-lg bg-purple-500/20">
            <Trophy className="h-4 w-4 text-purple-600" />
          </div>
          Top 3 Duration Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topDurations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No duration data available</p>
        ) : (
          topDurations.map((item, index) => (
            <div key={item.duration} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full ${getRankColor(index)} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{item.duration}</div>
                  <div className="text-xs text-muted-foreground">{item.trades} trades</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">{Math.round(item.winRate)}%</div>
                <div className="text-xs text-muted-foreground">win rate</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
