"use client"

import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Trade {
  id: string
  trade_start_time?: string | null
  outcome: "win" | "loss" | "breakeven"
  pnl: number
}

interface TopTimeChartProps {
  trades: Trade[]
}

export function TopTimeChart({ trades }: TopTimeChartProps) {
  const getValidHour = (timeString: string | null | undefined): number | null => {
    if (!timeString || typeof timeString !== "string") return null
    if (!timeString.includes(":")) return null
    const parts = timeString.split(":")
    const hour = parseInt(parts[0], 10)
    if (isNaN(hour) || hour < 0 || hour > 23) return null
    return hour
  }

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
  }

  const hourlyStats = trades
    .reduce(
      (acc, trade) => {
        const hour = getValidHour(trade.trade_start_time)
        if (hour === null) return acc
        if (!acc[hour]) {
          acc[hour] = { wins: 0, total: 0, pnl: 0 }
        }
        acc[hour].total++
        acc[hour].pnl += trade.pnl
        if (trade.outcome === "win" || trade.pnl > 0) {
          acc[hour].wins++
        }
        return acc
      },
      {} as Record<number, { wins: number; total: number; pnl: number }>,
    )

  const topTimes = Object.entries(hourlyStats)
    .map(([hour, stats]) => ({
      hour: parseInt(hour, 10),
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
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          Top 3 Entry Time Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        {topTimes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No time data available</p>
        ) : (
          topTimes.map((item, index) => (
            <div key={item.hour} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <div
                  className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold", getRankColor(index))}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-sm">{formatHour(item.hour)}</div>
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
