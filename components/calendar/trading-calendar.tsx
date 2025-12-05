"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Trade } from "@/types"
import { cn } from "@/lib/utils"

interface CalendarTrade {
  date: string
  trades: Trade[]
  totalPnL: number
  wins: number
  losses: number
  tradeCount: number
}

interface TradingCalendarProps {
  trades: Trade[]
  onDateSelect: (date: string, trades: Trade[]) => void
}

export const TradingCalendar: React.FC<TradingCalendarProps> = ({ trades, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const calendarData = useMemo(() => {
    const dataMap = new Map<string, CalendarTrade>()

    trades.forEach((trade) => {
      const dateKey = format(new Date(trade.date), "yyyy-MM-dd")
      const existing = dataMap.get(dateKey)

      if (existing) {
        existing.trades.push(trade)
        existing.totalPnL += trade.pnl
        if (trade.outcome === "win") existing.wins++
        if (trade.outcome === "loss") existing.losses++
        existing.tradeCount++
      } else {
        dataMap.set(dateKey, {
          date: dateKey,
          trades: [trade],
          totalPnL: trade.pnl,
          wins: trade.outcome === "win" ? 1 : 0,
          losses: trade.outcome === "loss" ? 1 : 0,
          tradeCount: 1,
        })
      }
    })

    return dataMap
  }, [trades])

  // Get all days in the month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get starting day of the week
  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array(firstDayOfWeek).fill(null)

  const getDayColor = (pnl: number) => {
    if (pnl > 0) return "bg-emerald-50 border-emerald-200"
    if (pnl < 0) return "bg-rose-50 border-rose-200"
    return "bg-amber-50 border-amber-200"
  }

  const getTextColor = (pnl: number) => {
    if (pnl > 0) return "text-emerald-700"
    if (pnl < 0) return "text-rose-700"
    return "text-amber-700"
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">{format(currentDate, "MMMM yyyy")}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="px-3 h-9">
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold text-slate-600 text-sm py-2">
            {day}
          </div>
        ))}

        {/* Empty days before month starts */}
        {emptyDays.map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {daysInMonth.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd")
          const dayData = calendarData.get(dateKey)
          const isSelected = selectedDate === dateKey
          const isTodayDate = isToday(day)

          return (
            <button
              key={dateKey}
              onClick={() => {
                setSelectedDate(dateKey)
                if (dayData) {
                  onDateSelect(dateKey, dayData.trades)
                }
              }}
              className={cn(
                "aspect-square rounded-lg border-2 p-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                dayData
                  ? cn(getDayColor(dayData.totalPnL), "hover:shadow-lg hover:scale-105")
                  : "bg-slate-50 border-slate-200",
                isSelected && "ring-2 ring-offset-2 ring-blue-500",
                isTodayDate && "border-blue-500 ring-1 ring-blue-300",
              )}
            >
              <div className="h-full flex flex-col justify-between text-left text-xs">
                <span className={cn("font-bold", dayData ? getTextColor(dayData.totalPnL) : "text-slate-600")}>
                  {format(day, "d")}
                </span>

                {dayData && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-0.5">
                      {dayData.wins > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-xs font-bold">
                          {dayData.wins}
                        </span>
                      )}
                      {dayData.losses > 0 && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-xs font-bold">
                          {dayData.losses}
                        </span>
                      )}
                    </div>
                    <div className={cn("font-bold text-xs", getTextColor(dayData.totalPnL))}>
                      ${Math.abs(dayData.totalPnL).toFixed(0)}
                    </div>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Win</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-500" />
          <span>Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span>Breakeven</span>
        </div>
      </div>
    </div>
  )
}
