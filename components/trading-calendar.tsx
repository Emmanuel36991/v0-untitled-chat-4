"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Settings, Camera, Info } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns"
import type { Trade } from "@/types"

interface DayData {
  date: Date
  day: number
  profit: number
  trades: number
  winRate: number
  isCurrentMonth: boolean
  isToday: boolean
}

interface WeekData {
  weekNumber: number
  totalProfit: number
  tradingDays: number
}

interface TradingCalendarProps {
  trades: Trade[]
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Process trades data for the current month
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    // Get all days in the month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Create a map of daily data
    const dailyData = new Map<string, { profit: number; trades: Trade[]; winCount: number }>()

    // Process trades for the current month
    trades.forEach((trade) => {
      const tradeDate = new Date(trade.date)
      if (isSameMonth(tradeDate, currentDate)) {
        const dateKey = format(tradeDate, "yyyy-MM-dd")
        const existing = dailyData.get(dateKey) || { profit: 0, trades: [], winCount: 0 }

        existing.profit += trade.pnl
        existing.trades.push(trade)
        if (trade.outcome === "win") {
          existing.winCount++
        }

        dailyData.set(dateKey, existing)
      }
    })

    // Create calendar grid (6 weeks x 7 days)
    const calendarGrid: (DayData | null)[][] = []
    const today = new Date()

    // Start from the first day of the week containing the first day of the month
    const firstDayOfMonth = monthStart
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(startDate.getDate() - getDay(firstDayOfMonth))

    for (let week = 0; week < 6; week++) {
      const weekDays: (DayData | null)[] = []

      for (let day = 0; day < 7; day++) {
        const currentDay = new Date(startDate)
        currentDay.setDate(startDate.getDate() + week * 7 + day)

        const dateKey = format(currentDay, "yyyy-MM-dd")
        const dayData = dailyData.get(dateKey)
        const isCurrentMonth = isSameMonth(currentDay, currentDate)

        if (isCurrentMonth || dayData) {
          const winRate = dayData && dayData.trades.length > 0 ? (dayData.winCount / dayData.trades.length) * 100 : 0

          weekDays.push({
            date: currentDay,
            day: currentDay.getDate(),
            profit: dayData?.profit || 0,
            trades: dayData?.trades.length || 0,
            winRate,
            isCurrentMonth,
            isToday: isSameDay(currentDay, today),
          })
        } else {
          weekDays.push(null)
        }
      }

      calendarGrid.push(weekDays)
    }

    // Calculate weekly summaries
    const weeklyData: WeekData[] = calendarGrid.map((week, index) => {
      const validDays = week.filter((day): day is DayData => day !== null && day.isCurrentMonth && day.trades > 0)
      const totalProfit = validDays.reduce((sum, day) => sum + day.profit, 0)
      const tradingDays = validDays.length

      return {
        weekNumber: index + 1,
        totalProfit,
        tradingDays,
      }
    })

    return { calendarGrid, weeklyData }
  }, [trades, currentDate])

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const monthTrades = trades.filter((trade) => isSameMonth(new Date(trade.date), currentDate))

    const totalProfit = monthTrades.reduce((sum, trade) => sum + trade.pnl, 0)
    const tradingDays = new Set(monthTrades.map((trade) => format(new Date(trade.date), "yyyy-MM-dd"))).size

    return { totalProfit, tradingDays }
  }, [trades, currentDate])

  const getProfitColor = (profit: number, hasData: boolean) => {
    if (!hasData) return "bg-gray-50 text-gray-400 border-gray-200"
    if (profit > 0) return "bg-green-100 text-green-800 border-green-300 shadow-green-100"
    if (profit < 0) return "bg-red-100 text-red-800 border-red-300 shadow-red-100"
    return "bg-gray-100 text-gray-700 border-gray-300"
  }

  const getWeekColor = (profit: number) => {
    if (profit > 0) return "text-green-600"
    if (profit < 0) return "text-red-600"
    return "text-gray-600"
  }

  const formatProfit = (profit: number) => {
    if (profit === 0) return "$0"
    const absProfit = Math.abs(profit)
    if (absProfit >= 1000) {
      return `${profit > 0 ? "+" : "-"}$${(absProfit / 1000).toFixed(1)}K`
    }
    return `${profit > 0 ? "+" : ""}$${profit.toFixed(0)}`
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)))
  }

  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  return (
    <Card className="bg-white border-gray-200 shadow-xl">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <CardTitle className="text-xl font-bold text-gray-900">{format(currentDate, "MMMM yyyy")}</CardTitle>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentMonth}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              This month
            </Button>

            <Badge className="bg-green-600 hover:bg-green-700 text-white px-4 py-2">
              Monthly stats: {formatProfit(monthlyStats.totalProfit)} • {monthlyStats.tradingDays} days
            </Badge>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-2">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-2">
                <Camera className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-2">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 bg-white">
        {/* Days of Week Header */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
          <div className="text-center text-sm font-medium text-gray-600 py-2">Week</div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {calendarData.calendarGrid.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-8 gap-2">
              {/* Days */}
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`
                    relative h-24 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg
                    ${day ? getProfitColor(day.profit, day.trades > 0) : "bg-gray-50 border-gray-200"}
                    ${day?.isToday ? "ring-2 ring-blue-500 ring-opacity-50" : ""}
                  `}
                >
                  {day && (
                    <div className="p-2 h-full flex flex-col justify-between">
                      {/* Day number */}
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-sm font-medium ${day.isCurrentMonth ? "text-current" : "text-gray-400"}`}
                        >
                          {day.day}
                        </span>
                        {day.isToday && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>

                      {/* Profit */}
                      {day.trades > 0 && (
                        <>
                          <div className="text-center">
                            <div className="text-lg font-bold leading-tight">{formatProfit(day.profit)}</div>
                          </div>

                          {/* Trade info */}
                          <div className="text-xs text-center space-y-0.5 opacity-80">
                            <div>
                              {day.trades} {day.trades === 1 ? "trade" : "trades"}
                            </div>
                            <div>{day.winRate.toFixed(0)}%</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Weekly Summary */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 h-24 flex flex-col justify-between hover:bg-gray-100 transition-colors duration-200">
                <div className="text-sm text-gray-600">Week {calendarData.weeklyData[weekIndex]?.weekNumber}</div>
                <div
                  className={`text-lg font-bold ${getWeekColor(calendarData.weeklyData[weekIndex]?.totalProfit || 0)}`}
                >
                  {formatProfit(calendarData.weeklyData[weekIndex]?.totalProfit || 0)}
                </div>
                <div className="text-xs text-gray-500">{calendarData.weeklyData[weekIndex]?.tradingDays || 0} days</div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 rounded border border-green-300"></div>
            <span className="text-sm text-gray-600">Profitable Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded border border-red-300"></div>
            <span className="text-sm text-gray-600">Loss Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
            <span className="text-sm text-gray-600">Breakeven Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 rounded border border-gray-200"></div>
            <span className="text-sm text-gray-600">No Trades</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TradingCalendar
