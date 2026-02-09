"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
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
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)

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
    if (tradeCount === 0) return "bg-zinc-800/30 dark:bg-zinc-800/30 border-zinc-700/40"
    const intensity = Math.min(Math.abs(pnl) / maxPnl, 1)
    if (pnl > 0) {
      if (intensity > 0.75) return "bg-emerald-400 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
      if (intensity > 0.5) return "bg-emerald-500/80 border-emerald-400/70"
      if (intensity > 0.25) return "bg-emerald-600/50 border-emerald-500/40"
      return "bg-emerald-700/30 border-emerald-600/30"
    } else {
      if (intensity > 0.75) return "bg-rose-400 border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
      if (intensity > 0.5) return "bg-rose-500/80 border-rose-400/70"
      if (intensity > 0.25) return "bg-rose-600/50 border-rose-500/40"
      return "bg-rose-700/30 border-rose-600/30"
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
    <div className="h-full flex flex-col bg-white/[0.03] dark:bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/[0.08] dark:border-white/[0.08] overflow-hidden">
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] dark:border-white/[0.06] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/10"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-bold font-mono text-zinc-200 dark:text-zinc-200 min-w-[100px] text-center uppercase tracking-wider">
              {format(currentMonth, "MMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/10"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="text-[10px] font-mono text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            TODAY
          </button>
        </div>

        {/* Compact stats row */}
        <div className="flex gap-4 text-[10px]">
          <div>
            <span className="text-zinc-500 uppercase tracking-wider">P&L </span>
            <span className={cn(
              "font-mono font-bold",
              monthStats.totalPnL >= 0 ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" : "text-rose-500"
            )}>
              {monthStats.totalPnL >= 0 ? "+" : ""}${monthStats.totalPnL.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase tracking-wider">W/R </span>
            <span className="font-mono font-bold text-zinc-300">{monthStats.winRate.toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase tracking-wider">Days </span>
            <span className="font-mono font-bold text-zinc-300">{monthStats.tradingDays}</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-3 overflow-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={`${day}-${i}`} className="text-center text-[9px] font-bold uppercase tracking-widest text-zinc-600">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarGrid.padding.map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {calendarGrid.days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const data = dailyData.find(d => d.date === dateStr)
            const isToday = isSameDay(day, new Date())
            const isHovered = hoveredDay === dateStr
            const pnl = data?.pnl || 0
            const tradeCount = data?.trades || 0

            return (
              <div
                key={day.toISOString()}
                className="relative"
                onMouseEnter={() => setHoveredDay(dateStr)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div
                  onClick={() => onDayClick?.(dateStr)}
                  className={cn(
                    "aspect-square rounded-[4px] border transition-all duration-200 cursor-pointer flex items-center justify-center",
                    getHeatmapStyle(pnl, tradeCount),
                    isToday && "ring-1 ring-emerald-400 ring-offset-1 ring-offset-zinc-950",
                    isHovered && "scale-125 z-10"
                  )}
                >
                  <span className={cn(
                    "text-[9px] font-mono font-bold leading-none",
                    tradeCount > 0 ? "text-white/90" : "text-zinc-600"
                  )}>
                    {format(day, "d")}
                  </span>
                </div>

                {/* Tooltip - Daily Dossier */}
                {isHovered && data && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-lg shadow-2xl shadow-black/60 p-3 min-w-[190px] z-50 pointer-events-none">
                    <div className="text-[10px] font-bold text-zinc-300 text-center mb-2 pb-2 border-b border-zinc-700/50 font-mono uppercase tracking-wider">
                      {format(day, "MMM d, yyyy")}
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Net P&L</span>
                        <span className={cn(
                          "font-mono font-bold",
                          pnl >= 0 ? "text-emerald-400" : "text-rose-500"
                        )}>
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Trades</span>
                        <span className="font-mono font-bold text-zinc-200">{tradeCount}</span>
                      </div>
                      {tradeCount > 0 && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">Avg P&L</span>
                            <span className="font-mono font-bold text-zinc-200">
                              ${(pnl / tradeCount).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">Best Setup</span>
                            <span className="font-mono font-bold text-emerald-400 text-[10px] truncate max-w-[90px]">
                              {getBestSetup(dateStr)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-700/50" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-3 text-[9px] text-zinc-600">
          <span>Loss</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-[2px] bg-rose-700/30 border border-rose-600/30" />
            <div className="w-3 h-3 rounded-[2px] bg-rose-500/80 border border-rose-400/70" />
          </div>
          <div className="w-3 h-3 rounded-[2px] bg-zinc-800/30 border border-zinc-700/40" />
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-[2px] bg-emerald-700/30 border border-emerald-600/30" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-300" />
          </div>
          <span>Profit</span>
        </div>
      </div>
    </div>
  )
}
