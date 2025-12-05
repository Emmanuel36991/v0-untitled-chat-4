"use client"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Timer } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimingAnalyticsProps {
  trades: Array<{
    id: string
    duration_minutes?: number | null
    precise_duration_minutes?: number | null
    trade_session?: string | null
    trade_start_time?: string | null
    trade_end_time?: string | null
    outcome: "win" | "loss" | "breakeven"
    pnl: number
  }>
}

export function TimingAnalytics({ trades }: TimingAnalyticsProps) {
  // Calculate duration categories
  const getDurationCategory = (minutes: number | undefined): string => {
    if (!minutes) return "Unknown"
    if (minutes <= 5) return "Scalp (≤5min)"
    if (minutes <= 30) return "Short-term (5-30min)"
    if (minutes <= 240) return "Intraday (30min-4h)"
    if (minutes <= 1440) return "Day Trade (4h-1d)"
    return "Swing (>1d)"
  }

  // Group trades by duration category
  const durationStats = trades.reduce(
    (acc, trade) => {
      const duration = trade.precise_duration_minutes || trade.duration_minutes
      const category = getDurationCategory(duration)

      if (!acc[category]) {
        acc[category] = {
          totalTrades: 0,
          winCount: 0,
          lossCount: 0,
          totalPnl: 0,
          avgDuration: 0,
          durations: [],
        }
      }

      acc[category].totalTrades++
      acc[category].totalPnl += trade.pnl
      if (duration) {
        acc[category].durations.push(duration)
      }

      if (trade.outcome === "win") acc[category].winCount++
      if (trade.outcome === "loss") acc[category].lossCount++

      return acc
    },
    {} as Record<string, any>,
  )

  // Calculate averages
  Object.keys(durationStats).forEach((category) => {
    const stats = durationStats[category]
    stats.winRate = stats.totalTrades > 0 ? (stats.winCount / stats.totalTrades) * 100 : 0
    stats.avgPnl = stats.totalTrades > 0 ? stats.totalPnl / stats.totalTrades : 0
    stats.avgDuration =
      stats.durations.length > 0
        ? stats.durations.reduce((sum: number, d: number) => sum + d, 0) / stats.durations.length
        : 0
  })

  // Group trades by session
  const sessionStats = trades.reduce(
    (acc, trade) => {
      const session = trade.trade_session || "Unknown"

      if (!acc[session]) {
        acc[session] = {
          totalTrades: 0,
          winCount: 0,
          lossCount: 0,
          totalPnl: 0,
        }
      }

      acc[session].totalTrades++
      acc[session].totalPnl += trade.pnl

      if (trade.outcome === "win") acc[session].winCount++
      if (trade.outcome === "loss") acc[session].lossCount++

      return acc
    },
    {} as Record<string, any>,
  )

  // Calculate session averages
  Object.keys(sessionStats).forEach((session) => {
    const stats = sessionStats[session]
    stats.winRate = stats.totalTrades > 0 ? (stats.winCount / stats.totalTrades) * 100 : 0
    stats.avgPnl = stats.totalTrades > 0 ? stats.totalPnl / stats.totalTrades : 0
  })

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)

    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Duration Category Analytics */}
      <Card className="glass-card border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Timer className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Duration Category Performance</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">Performance breakdown by trade duration</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(durationStats).map(([category, stats]: [string, any]) => (
              <div
                key={category}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300">{category}</h4>
                  <Badge variant={stats.winRate >= 50 ? "default" : "secondary"}>{stats.totalTrades} trades</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Win Rate:</span>
                    <span
                      className={cn(
                        "font-medium",
                        stats.winRate >= 50 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {stats.winRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Avg P&L:</span>
                    <span
                      className={cn(
                        "font-medium",
                        stats.avgPnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                      )}
                    >
                      ${stats.avgPnl.toFixed(2)}
                    </span>
                  </div>

                  {stats.avgDuration > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Avg Duration:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {formatDuration(stats.avgDuration)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Performance Analytics */}
      <Card className="glass-card border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Trading Session Performance</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">Performance breakdown by market session</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(sessionStats).map(([session, stats]: [string, any]) => (
              <div
                key={session}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                    {session.replace("-", " ")}
                  </h4>
                  <Badge variant={stats.winRate >= 50 ? "default" : "secondary"}>{stats.totalTrades}</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Win Rate:</span>
                    <span
                      className={cn(
                        "font-medium",
                        stats.winRate >= 50 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {stats.winRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Avg P&L:</span>
                    <span
                      className={cn(
                        "font-medium",
                        stats.avgPnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                      )}
                    >
                      ${stats.avgPnl.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total P&L:</span>
                    <span
                      className={cn(
                        "font-medium",
                        stats.totalPnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                      )}
                    >
                      ${stats.totalPnl.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TimingAnalytics
