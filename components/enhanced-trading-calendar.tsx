"use client"
import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Target,
  Activity,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types"

interface DailyData {
  date: string
  totalPnl: number
  tradeCount: number
  trades: Trade[]
  winCount: number
  lossCount: number
  winRate: number
  avgPnl: number
  hasAnomaly: boolean
  volume: number
  bestTrade: Trade | null
  worstTrade: Trade | null
}

interface WeeklyData {
  weekStart: Date
  weekEnd: Date
  weekNumber: number
  year: number
  totalPnl: number
  tradeCount: number
  winRate: number
  days: DailyData[]
  bestDay: DailyData | null
  worstDay: DailyData | null
}

interface MonthlyData {
  month: number
  year: number
  totalPnl: number
  tradeCount: number
  winRate: number
  weeks: WeeklyData[]
  bestWeek: WeeklyData | null
  worstWeek: WeeklyData | null
  tradingDays: number
}

type CalendarView = "month" | "week" | "year"
type DetailView = "day" | "week" | "month" | null

interface EnhancedTradingCalendarProps {
  trades: Trade[]
  anomalies: Array<{
    id: string
    tradeDate: string
    type: string
    severity: "Error" | "Warning"
    description: string
  }>
}

const EnhancedTradingCalendar: React.FC<EnhancedTradingCalendarProps> = ({ trades, anomalies }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>("month")
  const [selectedDetail, setSelectedDetail] = useState<{
    type: DetailView
    data: DailyData | WeeklyData | MonthlyData | null
  }>({ type: null, data: null })

  // Helper functions
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  // Process trades data
  const processedData = useMemo(() => {
    const dailyMap = new Map<string, DailyData>()
    const weeklyMap = new Map<string, WeeklyData>()
    const monthlyMap = new Map<string, MonthlyData>()

    // Process daily data
    trades.forEach((trade) => {
      const dateKey = trade.date
      const tradeDate = new Date(trade.date)

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          totalPnl: 0,
          tradeCount: 0,
          trades: [],
          winCount: 0,
          lossCount: 0,
          winRate: 0,
          avgPnl: 0,
          hasAnomaly: anomalies.some((a) => a.tradeDate === dateKey),
          volume: 0,
          bestTrade: null,
          worstTrade: null,
        })
      }

      const dayData = dailyMap.get(dateKey)!
      dayData.trades.push(trade)
      dayData.totalPnl += trade.pnl
      dayData.tradeCount += 1
      dayData.volume += Math.abs(trade.entry_price * trade.size)

      if (trade.outcome === "win") dayData.winCount++
      if (trade.outcome === "loss") dayData.lossCount++

      if (!dayData.bestTrade || trade.pnl > dayData.bestTrade.pnl) {
        dayData.bestTrade = trade
      }
      if (!dayData.worstTrade || trade.pnl < dayData.worstTrade.pnl) {
        dayData.worstTrade = trade
      }
    })

    // Calculate derived metrics for daily data
    dailyMap.forEach((dayData) => {
      dayData.winRate =
        dayData.winCount + dayData.lossCount > 0 ? (dayData.winCount / (dayData.winCount + dayData.lossCount)) * 100 : 0
      dayData.avgPnl = dayData.tradeCount > 0 ? dayData.totalPnl / dayData.tradeCount : 0
    })

    // Process weekly data
    dailyMap.forEach((dayData) => {
      const date = new Date(dayData.date)
      const weekStart = getWeekStart(date)
      const weekNumber = getWeekNumber(date)
      const year = date.getFullYear()
      const weekKey = `${year}-W${weekNumber}`

      if (!weeklyMap.has(weekKey)) {
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)

        weeklyMap.set(weekKey, {
          weekStart,
          weekEnd,
          weekNumber,
          year,
          totalPnl: 0,
          tradeCount: 0,
          winRate: 0,
          days: [],
          bestDay: null,
          worstDay: null,
        })
      }

      const weekData = weeklyMap.get(weekKey)!
      weekData.days.push(dayData)
      weekData.totalPnl += dayData.totalPnl
      weekData.tradeCount += dayData.tradeCount

      if (!weekData.bestDay || dayData.totalPnl > weekData.bestDay.totalPnl) {
        weekData.bestDay = dayData
      }
      if (!weekData.worstDay || dayData.totalPnl < weekData.worstDay.totalPnl) {
        weekData.worstDay = dayData
      }
    })

    // Calculate derived metrics for weekly data
    weeklyMap.forEach((weekData) => {
      const totalWins = weekData.days.reduce((sum, day) => sum + day.winCount, 0)
      const totalLosses = weekData.days.reduce((sum, day) => sum + day.lossCount, 0)
      weekData.winRate = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0
    })

    // Process monthly data
    weeklyMap.forEach((weekData) => {
      const monthKey = `${weekData.year}-${weekData.weekStart.getMonth()}`

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: weekData.weekStart.getMonth(),
          year: weekData.year,
          totalPnl: 0,
          tradeCount: 0,
          winRate: 0,
          weeks: [],
          bestWeek: null,
          worstWeek: null,
          tradingDays: 0,
        })
      }

      const monthData = monthlyMap.get(monthKey)!
      monthData.weeks.push(weekData)
      monthData.totalPnl += weekData.totalPnl
      monthData.tradeCount += weekData.tradeCount
      monthData.tradingDays += weekData.days.filter((day) => day.tradeCount > 0).length

      if (!monthData.bestWeek || weekData.totalPnl > monthData.bestWeek.totalPnl) {
        monthData.bestWeek = weekData
      }
      if (!monthData.worstWeek || weekData.totalPnl < monthData.worstWeek.totalPnl) {
        monthData.worstWeek = weekData
      }
    })

    // Calculate derived metrics for monthly data
    monthlyMap.forEach((monthData) => {
      const totalWins = monthData.weeks.reduce(
        (sum, week) => sum + week.days.reduce((s, day) => s + day.winCount, 0),
        0,
      )
      const totalLosses = monthData.weeks.reduce(
        (sum, week) => sum + week.days.reduce((s, day) => s + day.lossCount, 0),
        0,
      )
      monthData.winRate = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0
    })

    return { dailyMap, weeklyMap, monthlyMap }
  }, [trades, anomalies])

  // Navigation functions
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else if (view === "year") {
      newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  // Get P&L color class
  const getPnlColor = (pnl: number) => {
    if (pnl > 0) return "text-green-600 dark:text-green-400"
    if (pnl < 0) return "text-red-600 dark:text-red-400"
    return "text-gray-600 dark:text-gray-400"
  }

  // Get P&L background class
  const getPnlBgColor = (pnl: number, intensity: "light" | "medium" | "strong" = "light") => {
    const intensityMap = {
      light: { positive: "bg-green-50 dark:bg-green-950/20", negative: "bg-red-50 dark:bg-red-950/20" },
      medium: { positive: "bg-green-100 dark:bg-green-900/30", negative: "bg-red-100 dark:bg-red-900/30" },
      strong: { positive: "bg-green-200 dark:bg-green-800/40", negative: "bg-red-200 dark:bg-red-800/40" },
    }

    if (pnl > 0) return intensityMap[intensity].positive
    if (pnl < 0) return intensityMap[intensity].negative
    return "bg-gray-50 dark:bg-gray-800"
  }

  // Render month view
  const renderMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDay = new Date(startDate)

    while (currentDay <= lastDay || currentDay.getDay() !== 0) {
      const dateKey = currentDay.toISOString().split("T")[0]
      const dayData = processedData.dailyMap.get(dateKey)
      const isCurrentMonth = currentDay.getMonth() === month
      const isToday = currentDay.toDateString() === new Date().toDateString()

      days.push(
        <div
          key={dateKey}
          onClick={() => dayData && setSelectedDetail({ type: "day", data: dayData })}
          className={cn(
            "relative h-24 p-2 border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-200",
            "hover:shadow-lg hover:scale-[1.02] hover:z-10",
            {
              "opacity-40": !isCurrentMonth,
              "ring-2 ring-blue-500": isToday,
              "bg-white dark:bg-gray-800": !dayData,
            },
            dayData && getPnlBgColor(dayData.totalPnl, "light"),
          )}
        >
          {/* Day number */}
          <div className="flex justify-between items-start mb-1">
            <span
              className={cn("text-sm font-semibold", {
                "text-blue-600 dark:text-blue-400": isToday,
                "text-gray-900 dark:text-gray-100": !isToday && isCurrentMonth,
                "text-gray-400": !isCurrentMonth,
              })}
            >
              {currentDay.getDate()}
            </span>
            {dayData?.hasAnomaly && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
          </div>

          {/* P&L and trade info */}
          {dayData && dayData.tradeCount > 0 && (
            <div className="space-y-1">
              <div className={cn("text-xs font-bold", getPnlColor(dayData.totalPnl))}>
                ${dayData.totalPnl > 0 ? "+" : ""}
                {dayData.totalPnl.toFixed(0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {dayData.tradeCount} trade{dayData.tradeCount !== 1 ? "s" : ""}
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-600">W:{dayData.winCount}</span>
                <span className="text-red-600">L:{dayData.lossCount}</span>
              </div>
            </div>
          )}

          {/* Today indicator */}
          {isToday && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>}
        </div>,
      )

      currentDay.setDate(currentDay.getDate() + 1)
    }

    return (
      <div className="space-y-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">{days}</div>
      </div>
    )
  }

  // Render week view
  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate)
    const weekDays = []

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(day.getDate() + i)
      const dateKey = day.toISOString().split("T")[0]
      const dayData = processedData.dailyMap.get(dateKey)
      const isToday = day.toDateString() === new Date().toDateString()

      weekDays.push(
        <div
          key={dateKey}
          onClick={() => dayData && setSelectedDetail({ type: "day", data: dayData })}
          className={cn(
            "relative h-32 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200",
            "hover:shadow-xl hover:scale-[1.02]",
            {
              "ring-2 ring-blue-500": isToday,
              "bg-white dark:bg-gray-800": !dayData,
            },
            dayData && getPnlBgColor(dayData.totalPnl, "medium"),
          )}
        >
          {/* Day header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className={cn("text-lg font-bold", isToday ? "text-blue-600" : "text-gray-900 dark:text-gray-100")}>
                {day.getDate()}
              </div>
              <div className="text-xs text-gray-500">{day.toLocaleDateString(undefined, { weekday: "short" })}</div>
            </div>
            {dayData?.hasAnomaly && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
          </div>

          {/* Trade data */}
          {dayData && dayData.tradeCount > 0 && (
            <div className="space-y-2">
              <div className={cn("text-lg font-bold", getPnlColor(dayData.totalPnl))}>
                ${dayData.totalPnl > 0 ? "+" : ""}
                {dayData.totalPnl.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {dayData.tradeCount} trades • {dayData.winRate.toFixed(0)}% WR
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">✓ {dayData.winCount}</span>
                <span className="text-red-600">✗ {dayData.lossCount}</span>
              </div>
            </div>
          )}
        </div>,
      )
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-4">{weekDays}</div>
      </div>
    )
  }

  // Render year view
  const renderYearView = () => {
    const year = currentDate.getFullYear()
    const months = []

    for (let month = 0; month < 12; month++) {
      const monthKey = `${year}-${month}`
      const monthData = processedData.monthlyMap.get(monthKey)
      const monthName = new Date(year, month, 1).toLocaleDateString(undefined, { month: "long" })

      months.push(
        <div
          key={monthKey}
          onClick={() => monthData && setSelectedDetail({ type: "month", data: monthData })}
          className={cn(
            "relative h-28 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200",
            "hover:shadow-xl hover:scale-[1.02]",
            {
              "bg-white dark:bg-gray-800": !monthData,
            },
            monthData && getPnlBgColor(monthData.totalPnl, "medium"),
          )}
        >
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{monthName}</div>

          {monthData && monthData.tradeCount > 0 && (
            <div className="space-y-1">
              <div className={cn("text-xl font-bold", getPnlColor(monthData.totalPnl))}>
                ${monthData.totalPnl > 0 ? "+" : ""}
                {monthData.totalPnl.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {monthData.tradeCount} trades • {monthData.tradingDays} days
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{monthData.winRate.toFixed(0)}% WR</div>
            </div>
          )}
        </div>,
      )
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{months}</div>
      </div>
    )
  }

  // Render detail panel
  const renderDetailPanel = () => {
    if (!selectedDetail.data) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Select a day, week, or month to view details</p>
          </div>
        </div>
      )
    }

    const { type, data } = selectedDetail

    if (type === "day") {
      const dayData = data as DailyData
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {new Date(dayData.date).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <Badge variant={dayData.totalPnl >= 0 ? "default" : "destructive"}>
              {dayData.totalPnl >= 0 ? "Profitable" : "Loss"}
            </Badge>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-blue-600" />
              <div className={cn("text-lg font-bold", getPnlColor(dayData.totalPnl))}>
                ${dayData.totalPnl > 0 ? "+" : ""}
                {dayData.totalPnl.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Total P&L</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <BarChart3 className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{dayData.tradeCount}</div>
              <div className="text-xs text-gray-500">Trades</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Target className="h-5 w-5 mx-auto mb-1 text-purple-600" />
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{dayData.winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Activity className="h-5 w-5 mx-auto mb-1 text-orange-600" />
              <div className={cn("text-lg font-bold", getPnlColor(dayData.avgPnl))}>${dayData.avgPnl.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Avg P&L</div>
            </div>
          </div>

          {/* Best and worst trades */}
          {(dayData.bestTrade || dayData.worstTrade) && (
            <div className="space-y-4">
              <h4 className="font-medium">Trade Highlights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dayData.bestTrade && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Best Trade</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        {dayData.bestTrade.instrument} • {dayData.bestTrade.direction.toUpperCase()}
                      </div>
                      <div className="font-bold text-green-600">+${dayData.bestTrade.pnl.toFixed(2)}</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {dayData.bestTrade.setup_name || "No setup"}
                      </div>
                    </div>
                  </div>
                )}
                {dayData.worstTrade && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800 dark:text-red-200">Worst Trade</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        {dayData.worstTrade.instrument} • {dayData.worstTrade.direction.toUpperCase()}
                      </div>
                      <div className="font-bold text-red-600">${dayData.worstTrade.pnl.toFixed(2)}</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {dayData.worstTrade.setup_name || "No setup"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All trades */}
          <div className="space-y-4">
            <h4 className="font-medium">All Trades ({dayData.trades.length})</h4>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {dayData.trades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          trade.outcome === "win" ? "default" : trade.outcome === "loss" ? "destructive" : "secondary"
                        }
                      >
                        {trade.outcome}
                      </Badge>
                      <div>
                        <div className="font-medium">{trade.instrument}</div>
                        <div className="text-sm text-gray-500">{trade.setup_name || "No setup"}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("font-bold", getPnlColor(trade.pnl))}>
                        ${trade.pnl > 0 ? "+" : ""}
                        {trade.pnl.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">{trade.direction.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )
    }

    // Similar detailed views for week and month data would go here
    return <div>Detail view for {type}</div>
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Main Calendar */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Enhanced Trading Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(["month", "week", "year"] as CalendarView[]).map((viewType) => (
                  <Button
                    key={viewType}
                    variant={view === viewType ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView(viewType)}
                    className="capitalize"
                  >
                    {viewType}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-lg font-semibold">
              {view === "month" && currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              {view === "week" && `Week of ${getWeekStart(currentDate).toLocaleDateString()}`}
              {view === "year" && currentDate.getFullYear()}
            </div>

            <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {view === "month" && renderMonthView()}
          {view === "week" && renderWeekView()}
          {view === "year" && renderYearView()}
        </CardContent>
      </Card>

      {/* Detail Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">{renderDetailPanel()}</ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedTradingCalendar
