"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { format, addMonths, subMonths, eachDayOfInterval, startOfMonth, endOfMonth, getDay, isSameDay } from "date-fns"

interface CalendarHeatmapProps {
  dailyData: Array<{ date: string; pnl: number; trades: number }>
  onDayClick?: (date: string) => void
}

export function RedesignedCalendarHeatmap({ dailyData, onDayClick }: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)

  // Calculate month statistics
  const monthStats = useMemo(() => {
    const monthKey = format(currentMonth, "yyyy-MM")
    const days = dailyData.filter(d => d.date.startsWith(monthKey))
    const totalPnL = days.reduce((acc, d) => acc + d.pnl, 0)
    const totalTrades = days.reduce((acc, d) => acc + d.trades, 0)
    const winningDays = days.filter(d => d.pnl > 0).length
    const losingDays = days.filter(d => d.pnl < 0).length
    const winRate = days.length ? (winningDays / days.length) * 100 : 0
    return { totalPnL, totalTrades, winningDays, losingDays, winRate, tradingDays: days.length }
  }, [currentMonth, dailyData])

  // Generate calendar grid
  const calendarGrid = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    const padding = Array(getDay(start)).fill(null)
    return { days, padding }
  }, [currentMonth])

  // Get color intensity based on P&L
  const getHeatmapColor = (pnl: number, trades: number) => {
    if (trades === 0) return "bg-zinc-900/40 border-zinc-800/60"
    
    const maxPnl = Math.max(...dailyData.map(d => Math.abs(d.pnl)))
    const intensity = Math.abs(pnl) / maxPnl
    
    if (pnl > 0) {
      // Green gradient for profits
      if (intensity > 0.75) return "bg-emerald-500/90 border-emerald-400 shadow-emerald-500/20"
      if (intensity > 0.5) return "bg-emerald-500/70 border-emerald-500"
      if (intensity > 0.25) return "bg-emerald-500/50 border-emerald-600"
      return "bg-emerald-500/30 border-emerald-700"
    } else {
      // Red gradient for losses
      if (intensity > 0.75) return "bg-rose-500/90 border-rose-400 shadow-rose-500/20"
      if (intensity > 0.5) return "bg-rose-500/70 border-rose-500"
      if (intensity > 0.25) return "bg-rose-500/50 border-rose-600"
      return "bg-rose-500/30 border-rose-700"
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/60 shadow-2xl overflow-hidden">
      {/* Header with navigation and stats */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/60 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur px-3 py-2 rounded-lg border border-border/60">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-lg font-bold min-w-[140px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
          </div>

          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Net P&L</p>
              <p className={cn(
                "text-2xl font-mono font-bold",
                monthStats.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                {monthStats.totalPnL >= 0 ? "+" : ""}${monthStats.totalPnL.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Win Rate</p>
              <p className="text-2xl font-mono font-bold text-foreground">
                {monthStats.winRate.toFixed(0)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Days Traded</p>
              <p className="text-2xl font-mono font-bold text-foreground">
                {monthStats.tradingDays}
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1.5">
            <div className="w-5 h-5 rounded border bg-zinc-900/40 border-zinc-800/60" />
            <div className="w-5 h-5 rounded border bg-emerald-500/30 border-emerald-700" />
            <div className="w-5 h-5 rounded border bg-emerald-500/50 border-emerald-600" />
            <div className="w-5 h-5 rounded border bg-emerald-500/70 border-emerald-500" />
            <div className="w-5 h-5 rounded border bg-emerald-500/90 border-emerald-400" />
          </div>
          <span>More Profit</span>
          <div className="flex gap-1.5 ml-4">
            <div className="w-5 h-5 rounded border bg-rose-500/30 border-rose-700" />
            <div className="w-5 h-5 rounded border bg-rose-500/50 border-rose-600" />
            <div className="w-5 h-5 rounded border bg-rose-500/70 border-rose-500" />
            <div className="w-5 h-5 rounded border bg-rose-500/90 border-rose-400" />
          </div>
          <span>More Loss</span>
        </div>
      </div>

      <CardContent className="p-8">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-3 mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-3">
          {calendarGrid.padding.map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {calendarGrid.days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const data = dailyData.find(d => d.date === dateStr)
            const isToday = isSameDay(day, new Date())
            const isHovered = hoveredDay === dateStr
            const pnl = data?.pnl || 0
            const trades = data?.trades || 0

            return (
              <div
                key={day.toISOString()}
                onMouseEnter={() => setHoveredDay(dateStr)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => onDayClick?.(dateStr)}
                className={cn(
                  "relative aspect-square rounded-lg border-2 transition-all duration-200 cursor-pointer flex items-center justify-center group",
                  getHeatmapColor(pnl, trades),
                  isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  isHovered && "scale-110 z-10 shadow-2xl"
                )}
              >
                <span className={cn(
                  "text-sm font-bold transition-all",
                  trades > 0 ? "text-white" : "text-muted-foreground"
                )}>
                  {format(day, "d")}
                </span>

                {/* Tooltip on hover */}
                {isHovered && data && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-lg shadow-2xl p-3 min-w-[180px] z-20 backdrop-blur-sm">
                    <div className="text-xs space-y-2">
                      <div className="font-bold text-center mb-2 pb-2 border-b border-border">
                        {format(day, "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Net P&L:</span>
                        <span className={cn(
                          "font-mono font-bold",
                          pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Trades:</span>
                        <span className="font-mono font-bold">{trades}</span>
                      </div>
                      {trades > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Avg P&L:</span>
                          <span className="font-mono font-bold">
                            ${(pnl / trades).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />
                  </div>
                )}

                {/* Activity indicator */}
                {trades > 0 && (
                  <div className="absolute bottom-1 right-1">
                    <div className="w-1 h-1 rounded-full bg-white/60" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
