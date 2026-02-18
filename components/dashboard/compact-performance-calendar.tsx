"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Trade } from "@/types"

interface CompactPerformanceCalendarProps {
  trades: Trade[]
  className?: string
}

export function CompactPerformanceCalendar({
  trades,
  className,
}: CompactPerformanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    const startDay = getDay(start)
    const paddedDays = Array(startDay).fill(null).concat(days)
    return paddedDays
  }, [currentMonth])

  const getDayData = (day: Date | null) => {
    if (!day) return null
    const dayTrades = trades.filter((t) => isSameDay(new Date(t.date), day))
    const pnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0)
    const count = dayTrades.length
    const winCount = dayTrades.filter((t) => t.outcome === "win").length
    return { day, pnl, count, winCount, trades: dayTrades }
  }

  // Calculate intensity based on PnL magnitude
  const getColorAndIntensity = (pnl: number, hasTradesCount: number) => {
    if (hasTradesCount === 0) {
      return {
        bgClass: "bg-muted/30",
        textClass: "text-muted-foreground",
        intensity: 0,
      }
    }

    // Calculate intensity: 0.3 to 1.0 based on absolute PnL
    const intensity = Math.min(Math.abs(pnl) / 2000, 1) * 0.7 + 0.3

    if (pnl > 0) {
      return {
        bgClass: "bg-emerald-500",
        textClass: "text-white",
        intensity,
      }
    } else if (pnl < 0) {
      return {
        bgClass: "bg-rose-500",
        textClass: "text-white",
        intensity,
      }
    } else {
      return {
        bgClass: "bg-amber-400",
        textClass: "text-white",
        intensity: 0.7,
      }
    }
  }

  const monthStats = useMemo(() => {
    const monthTrades = trades.filter((t) => {
      const tradeDate = new Date(t.date)
      return (
        tradeDate.getMonth() === currentMonth.getMonth() &&
        tradeDate.getFullYear() === currentMonth.getFullYear()
      )
    })

    const totalPnL = monthTrades.reduce((acc, t) => acc + t.pnl, 0)
    const wins = monthTrades.filter((t) => t.outcome === "win").length
    const winRate =
      monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0

    return {
      totalPnL,
      tradeCount: monthTrades.length,
      winRate,
    }
  }, [trades, currentMonth])

  return (
    <Card
      className={cn(
        "border border-border/60 shadow-sm bg-card/50 backdrop-blur-sm",
        className,
      )}
    >
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Daily Performance
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Month Stats */}
        <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Net P&L:</span>
            <span
              className={cn(
                "font-mono font-semibold",
                monthStats.totalPnL >= 0
                  ? "text-emerald-500"
                  : "text-rose-500",
              )}
            >
              {monthStats.totalPnL >= 0 ? "+" : ""}$
              {monthStats.totalPnL.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Trades:</span>
            <span className="font-mono font-semibold">
              {monthStats.tradeCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Win Rate:</span>
            <span className="font-mono font-semibold text-primary">
              {monthStats.winRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
            <div
              key={`${d}-${idx}`}
              className="text-center text-2xs font-semibold text-muted-foreground tracking-wide"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {daysInMonth.map((day, idx) => {
            const data = getDayData(day)

            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="aspect-square rounded-md"
                />
              )
            }

            const { bgClass, textClass, intensity } = getColorAndIntensity(
              data?.pnl || 0,
              data?.count || 0,
            )
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "aspect-square rounded-md relative group cursor-pointer transition-all duration-200",
                  "hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 hover:ring-offset-background",
                  isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                )}
                title={
                  data && data.count > 0
                    ? `${format(day, "MMM dd")}\nP&L: ${data.pnl >= 0 ? "+" : ""}$${data.pnl.toFixed(2)}\nTrades: ${data.count}\nWins: ${data.winCount}`
                    : format(day, "MMM dd")
                }
              >
                {/* Background Color */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-md transition-all duration-200",
                    bgClass,
                    "group-hover:shadow-md",
                  )}
                  style={{
                    opacity: intensity,
                  }}
                />

                {/* Day Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={cn(
                      "text-2xs font-medium pointer-events-none",
                      textClass,
                      isToday && "font-bold",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Hover Tooltip */}
                {data && data.count > 0 && (
                  <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
                    <div className="bg-popover border border-border rounded-lg shadow-xl p-2.5 text-xs min-w-[140px]">
                      <p className="font-semibold text-foreground mb-1.5 border-b border-border/50 pb-1">
                        {format(day, "MMM dd, yyyy")}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Net P&L:</span>
                          <span
                            className={cn(
                              "font-mono font-bold",
                              data.pnl >= 0
                                ? "text-emerald-500"
                                : "text-rose-500",
                            )}
                          >
                            {data.pnl >= 0 ? "+" : ""}${data.pnl.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Trades:</span>
                          <span className="font-mono">{data.count}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Wins:</span>
                          <span className="font-mono text-emerald-500">
                            {data.winCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-xs text-muted-foreground">Loss</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted/50" />
            <span className="text-xs text-muted-foreground">No Trades</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
