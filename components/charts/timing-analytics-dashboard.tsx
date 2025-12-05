"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, BarChart3, TrendingUp, Target } from "lucide-react"
import type { Trade } from "@/types"
import { TopDurationChart } from "./top-duration-chart"
import { TopTimeChart } from "./top-time-chart"

interface TimingAnalyticsDashboardProps {
  trades: Trade[]
  className?: string
}

export function TimingAnalyticsDashboard({ trades, className }: TimingAnalyticsDashboardProps) {
  // Calculate overall timing insights
  const timingInsights = React.useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        avgDuration: 0,
        mostActivePeriod: "N/A",
        bestPerformingDuration: "N/A",
        bestPerformingTime: "N/A",
      }
    }

    // Calculate average duration
    const durationsWithData = trades.filter((t) => t.duration_minutes || t.precise_duration_minutes)
    const avgDuration =
      durationsWithData.length > 0
        ? durationsWithData.reduce(
            (sum, trade) => sum + (trade.duration_minutes || trade.precise_duration_minutes || 0),
            0,
          ) / durationsWithData.length
        : 0

    // Find most active trading period
    const hourCounts = trades.reduce(
      (acc, trade) => {
        let hour = 12 // default
        if (trade.trade_start_time) {
          hour = Number.parseInt(trade.trade_start_time.split(":")[0])
        } else {
          hour = new Date(trade.date).getHours()
        }
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const mostActiveHour = Object.entries(hourCounts).reduce(
      (max, [hour, count]) => (count > max.count ? { hour: Number.parseInt(hour), count } : max),
      { hour: 12, count: 0 },
    )

    const mostActivePeriod = `${mostActiveHour.hour.toString().padStart(2, "0")}:00`

    return {
      avgDuration: Math.round(avgDuration),
      mostActivePeriod,
      bestPerformingDuration: "30-60min", // This would be calculated from the duration chart
      bestPerformingTime: "10:00", // This would be calculated from the time chart
    }
  }, [trades])

  return (
    <div className={className}>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="glass-card border-cyan-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-blue-400" />
              <BarChart3 className="h-3 w-3 text-blue-400" />
            </div>
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-blue-400 mb-1">{timingInsights.avgDuration}min</div>
            <p className="text-xs text-muted-foreground">Average hold time</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <Target className="h-3 w-3 text-green-400" />
            </div>
            <CardTitle className="text-xs font-medium text-muted-foreground">Most Active</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-green-400 mb-1">{timingInsights.mostActivePeriod}</div>
            <p className="text-xs text-muted-foreground">Peak trading time</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-purple-400" />
              <Clock className="h-3 w-3 text-purple-400" />
            </div>
            <CardTitle className="text-xs font-medium text-muted-foreground">Best Duration</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-purple-400 mb-1">{timingInsights.bestPerformingDuration}</div>
            <p className="text-xs text-muted-foreground">Optimal hold time</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <Clock className="h-3 w-3 text-orange-400" />
            </div>
            <CardTitle className="text-xs font-medium text-muted-foreground">Best Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-orange-400 mb-1">{timingInsights.bestPerformingTime}</div>
            <p className="text-xs text-muted-foreground">Optimal entry time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopDurationChart trades={trades} />
        <TopTimeChart trades={trades} />
      </div>
    </div>
  )
}

export default TimingAnalyticsDashboard
