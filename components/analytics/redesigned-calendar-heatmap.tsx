"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, eachDayOfInterval, startOfMonth, endOfMonth, getDay, isSameDay } from "date-fns"
import type { Trade } from "@/types"

interface CalendarHeatmapProps {
  dailyData: Array<{ date: string; pnl: number; trades: number }>
  trades?: Trade[]
  onDayClick?: (date: string) => void
}

export function RedesignedCalendarHeatmap({ dailyData, trades = [], onDayClick }: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStats = useMemo(() => {
    const monthKey = format(currentMonth, "yyyy-MM")
    const days = dailyData.filter(d => d.date.startsWith(monthKey))
    const totalPnL = days.reduce((acc, d) => acc + d.pnl, 0)
    const totalTrades = days.reduce((acc, d) => acc + d.trades, 0)
    const winningDays = days.filter(d => d.pnl > 0).length
    const winRate = days.length ? (winningDays / days.length) * 100 : 0
    return { totalPnL, totalTrades, winningDays, winRate, tradingDays: days.length }
  }, [currentMonth, dailyData])

  const calendarGrid = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    const padding = Array(getDay(start)).fill(null)
    return { days, padding }
  }, [currentMonth])

  const maxPnl = useMemo(() => {
    const vals = dailyData.map(d => Math.abs(d.pnl)).filter(v => v > 0)
    return vals.length > 0 ? Math.max(...vals) : 1
  }, [dailyData])

  const getHeatmapStyle = (pnl: number, tradeCount: number): string => {
    if (tradeCount === 0) return "bg-muted/60"
    const intensity = Math.min(Math.abs(pnl) / maxPnl, 1)
    if (pnl > 0) {
      if (intensity > 0.75) return "bg-emerald-500"
      if (intensity > 0.5) return "bg-emerald-500/70"
      if (intensity > 0.25) return "bg-emerald-500/45"
      return "bg-emerald-500/25"
    } else {
      if (intensity > 0.75) return "bg-rose-500"
      if (intensity > 0.5) return "bg-rose-500/70"
      if (intensity > 0.25) return "bg-rose-500/45"
      return "bg-rose-500/25"
    }
  }

  const getBestSetup = (dateStr: string): string => {
    if (!trades.length) return "N/A"
    const dayTrades = trades.filter(t => format(new Date(t.date), "yyyy-MM-dd") === dateStr)
    if (!dayTrades.length) return "N/A"
    const best = dayTrades.reduce((a, b) => (a.pnl > b.pnl ? a : b))
    return best.setup_name || "Discretionary"
  }

  return (
    <div className="w-full select-none">
      {/* Month Navigation + Stats */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-8 px-3 border-border"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Today
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-8 px-3 border-border"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Monthly Summary Stats */}
        <div className="hidden sm:flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Month P&L</span>
            <span className={cn(
              "font-mono font-bold",
              monthStats.totalPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {monthStats.totalPnL >= 0 ? "+" : ""}${monthStats.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Win Rate</span>
            <span className="font-mono font-bold text-foreground">{monthStats.winRate.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Days</span>
            <span className="font-mono font-bold text-foreground">{monthStats.tradingDays}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Trades</span>
            <span className="font-mono font-bold text-foreground">{monthStats.totalTrades}</span>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center text-2xs uppercase font-bold text-muted-foreground tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        <TooltipProvider delayDuration={100}>
          {calendarGrid.padding.map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {calendarGrid.days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const data = dailyData.find(d => d.date === dateStr)
            const isToday = isSameDay(day, new Date())
            const pnl = data?.pnl || 0
            const tradeCount = data?.trades || 0

            const CellContent = (
              <div
                onClick={() => onDayClick?.(dateStr)}
                className="aspect-square rounded-md relative group cursor-pointer transition-all hover:ring-2 ring-primary/50 ring-offset-1 ring-offset-background"
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-md transition-colors duration-300",
                    getHeatmapStyle(pnl, tradeCount),
                    isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                  )}
                  style={tradeCount > 0 ? { opacity: Math.min(Math.abs(pnl) / maxPnl, 1) * 0.6 + 0.4 } : undefined}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className={cn(
                      "text-2xs font-medium transition-colors",
                      tradeCount > 0
                        ? "text-white/90"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>
              </div>
            )

            if (data && tradeCount > 0) {
              return (
                <Tooltip key={day.toISOString()}>
                  <TooltipTrigger asChild>{CellContent}</TooltipTrigger>
                  <TooltipContent side="top" className="p-0 border-0 bg-transparent shadow-none">
                    <div className="p-3 bg-card border border-border rounded-lg shadow-xl text-xs min-w-[180px]">
                      <p className="font-semibold mb-2 pb-1.5 border-b border-border text-foreground">
                        {format(day, "MMM dd, yyyy")}
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Net P&L</span>
                          <span
                            className={cn(
                              "font-mono font-bold",
                              pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Trades</span>
                          <span className="font-mono font-bold">{tradeCount}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Avg P&L</span>
                          <span className="font-mono font-bold">${(pnl / tradeCount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Best Setup</span>
                          <span className="font-medium text-primary truncate max-w-[90px]">
                            {getBestSetup(dateStr)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={day.toISOString()}>{CellContent}</div>
          })}
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-5 text-2xs text-muted-foreground">
        <span>Loss</span>
        <div className="flex gap-1">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-rose-500/25" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-rose-500/70" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-rose-500" />
        </div>
        <div className="w-3.5 h-3.5 rounded-[3px] bg-muted/60" />
        <div className="flex gap-1">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-500/25" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-500/70" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-500" />
        </div>
        <span>Profit</span>
      </div>
    </div>
  )
}
