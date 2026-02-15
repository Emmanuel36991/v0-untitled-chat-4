"use client"

import { useMemo, useState } from "react"
import { Trade } from "@/types"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PremiumCalendarViewProps {
  trades: Trade[]
}

interface DayData {
  date: Date
  pnl: number
  trades: Trade[]
  winRate: number
  isCurrentMonth: boolean
}

export function PremiumCalendarView({ trades }: PremiumCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return days.map(date => {
      const dayTrades = trades.filter(trade =>
        trade.entry_time && isSameDay(new Date(trade.entry_time), date)
      )

      const pnl = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
      const wins = dayTrades.filter(t => (t.pnl || 0) > 0).length
      const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0

      return {
        date,
        pnl,
        trades: dayTrades,
        winRate,
        isCurrentMonth: date >= monthStart && date <= monthEnd
      }
    })
  }, [trades, currentMonth])

  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    const monthTrades = trades.filter(trade => {
      if (!trade.entry_time) return false
      const tradeDate = new Date(trade.entry_time)
      return tradeDate >= monthStart && tradeDate <= monthEnd
    })

    const totalPnl = monthTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const wins = monthTrades.filter(t => (t.pnl || 0) > 0).length
    const winRate = monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0

    return {
      totalTrades: monthTrades.length,
      totalPnl,
      winRate,
      avgPnl: monthTrades.length > 0 ? totalPnl / monthTrades.length : 0
    }
  }, [trades, currentMonth])

  const getPnlColor = (pnl: number) => {
    if (pnl === 0) return 'bg-muted/40'
    if (pnl > 0) {
      const intensity = Math.min(Math.abs(pnl) / 5000, 1)
      return `bg-profit/[${Math.max(intensity, 0.15)}]`
    } else {
      const intensity = Math.min(Math.abs(pnl) / 5000, 1)
      return `bg-loss/[${Math.max(intensity, 0.15)}]`
    }
  }

  const getPnlStyle = (pnl: number) => {
    if (pnl === 0) return {}
    const intensity = Math.min(Math.abs(pnl) / 5000, 1)
    const alpha = Math.max(intensity, 0.15)

    if (pnl > 0) {
      return { backgroundColor: `rgba(16, 185, 129, ${alpha})` }
    } else {
      return { backgroundColor: `rgba(239, 68, 68, ${alpha})` }
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex flex-col space-y-2.5">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className="h-8 px-3 text-xs hover:bg-accent"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Month Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Trades:</span>
            <span className="font-semibold">{monthStats.totalTrades}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Win Rate:</span>
            <span className={cn(
              "font-semibold",
              monthStats.winRate >= 50 ? "text-profit" : "text-loss"
            )}>
              {monthStats.winRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">P&L:</span>
            <span className={cn(
              "font-semibold",
              monthStats.totalPnl >= 0 ? "text-profit" : "text-loss"
            )}>
              ${monthStats.totalPnl.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card/50 rounded-xl border border-border/50 p-2.5">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-1.5">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarData.map((day, index) => {
            const isCurrentDay = isToday(day.date)
            const isSelectedDay = selectedDate && isSameDay(selectedDate, day.date)
            const hasTrades = day.trades.length > 0

            const handleDayClick = () => {
              setSelectedDate(isSelectedDay ? null : day.date)
              console.log('[v0] Selected date:', format(day.date, 'yyyy-MM-dd'), 'Trades:', day.trades.length, 'PnL:', day.pnl)
            }

            return (
              <div
                key={index}
                onClick={handleDayClick}
                className={cn(
                  "group relative rounded-lg border-2 transition-all duration-200 min-h-[72px] flex flex-col justify-between",
                  day.isCurrentMonth
                    ? "cursor-pointer hover:shadow-lg hover:border-primary/60"
                    : "border-transparent opacity-30 cursor-default",
                  isCurrentDay && "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary",
                  isSelectedDay && "border-primary shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-background",
                  !hasTrades && day.isCurrentMonth && "border-border/30 bg-muted/30 hover:border-border/60",
                  hasTrades && "hover:scale-[1.02] hover:shadow-xl"
                )}
                style={hasTrades ? getPnlStyle(day.pnl) : undefined}
              >
                {/* Date Number - Top Left */}
                <div className="p-2">
                  <span className={cn(
                    "text-sm font-bold",
                    !day.isCurrentMonth && "text-muted-foreground/50",
                    day.isCurrentMonth && !hasTrades && "text-muted-foreground",
                    day.isCurrentMonth && hasTrades && day.pnl >= 0 && "text-profit",
                    day.isCurrentMonth && hasTrades && day.pnl < 0 && "text-loss",
                    isCurrentDay && "text-primary font-extrabold",
                    isSelectedDay && "text-primary font-extrabold"
                  )}>
                    {format(day.date, 'd')}
                  </span>
                </div>

                {/* Middle Section - PnL Display */}
                {hasTrades && (
                  <div className="flex flex-col items-center justify-center flex-1 px-2">
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-bold",
                      day.pnl >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {day.pnl >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>${Math.abs(day.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                )}

                {/* Bottom Section - Stats */}
                <div className="p-2 flex items-center justify-between text-2xs">
                  {hasTrades ? (
                    <>
                      <div className="bg-background/70 backdrop-blur-sm rounded px-1.5 py-0.5 font-semibold border border-border/30">
                        {day.trades.length}T
                      </div>
                      <div className={cn(
                        "font-medium",
                        day.winRate >= 50 ? "text-profit" : "text-loss"
                      )}>
                        {day.winRate.toFixed(0)}%
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground/50 text-[9px]">—</div>
                  )}
                </div>

                {/* Hover Tooltip - Enhanced */}
                {hasTrades && day.isCurrentMonth && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                    <div className="bg-popover text-popover-foreground rounded-lg shadow-xl border border-border/80 p-3 text-xs whitespace-nowrap backdrop-blur-sm">
                      <div className="font-bold mb-2 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                        {format(day.date, 'MMM d, yyyy')}
                      </div>
                      <div className="space-y-1.5 text-2xs border-t border-border/30 pt-2">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Trades:</span>
                          <span className="font-semibold">{day.trades.length}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">P&L:</span>
                          <span className={cn(
                            "font-bold",
                            day.pnl >= 0 ? "text-profit" : "text-loss"
                          )}>
                            {day.pnl >= 0 ? '+' : ''}{day.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Win Rate:</span>
                          <span className={cn(
                            "font-semibold",
                            day.winRate >= 50 ? "text-profit" : "text-loss"
                          )}>
                            {day.winRate.toFixed(1)}%
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
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-2xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-profit/20 border border-profit/30" />
          <span>Profitable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-loss/20 border border-loss/30" />
          <span>Loss</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted border border-border" />
          <span>No Trades</span>
        </div>
      </div>
    </div>
  )
}
