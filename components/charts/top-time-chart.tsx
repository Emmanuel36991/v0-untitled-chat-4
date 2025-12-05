"use client"

import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Trade {
  id: string
  trade_start_time: string | null
  outcome: "win" | "loss"
}

interface TopTimeChartProps {
  trades: Trade[]
}

export function TopTimeChart({ trades }: TopTimeChartProps) {
  const getHourFromTime = (timeString: string) => {
    const [hours] = timeString.split(":").map(Number)
    return hours
  }

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`
  }

  const hourlyStats = trades
    .filter((trade) => trade.trade_start_time !== null)
    .reduce(
      (acc, trade) => {
        const hour = getHourFromTime(trade.trade_start_time!)
        if (!acc[hour]) {
          acc[hour] = { wins: 0, total: 0 }
        }
        acc[hour].total++
        if (trade.outcome === "win") {
          acc[hour].wins++
        }
        return acc
      },
      {} as Record<number, { wins: number; total: number }>,
    )

  const topTimes = Object.entries(hourlyStats)
    .map(([hour, stats]) => ({
      hour: Number.parseInt(hour),
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
          <div className="p-1.5 rounded-lg bg-blue-500/20">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          Top 3 Entry Time Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topTimes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No time data available</p>
        ) : (
          topTimes.map((item, index) => (
            <div key={item.hour} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full ${getRankColor(index)} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{formatHour(item.hour)}</div>
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
