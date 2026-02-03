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
    if (pnl === 0) return 'bg-gray-100 dark:bg-gray-800/40'
    if (pnl > 0) {
      const intensity = Math.min(Math.abs(pnl) / 5000, 1)
      return `bg-emerald-500/[${Math.max(intensity, 0.15)}]`
    } else {
      const intensity = Math.min(Math.abs(pnl) / 5000, 1)
      return `bg-rose-500/[${Math.max(intensity, 0.15)}]`
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
    <div className="flex flex-col space-y-3">
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
              monthStats.winRate >= 50 ? "text-emerald-500" : "text-rose-500"
            )}>
              {monthStats.winRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">P&L:</span>
            <span className={cn(
              "font-semibold",
              monthStats.totalPnl >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              ${monthStats.totalPnl.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card/50 rounded-xl border border-border/50 p-3">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
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
            const hasTrades = day.trades.length > 0
            
            return (
              <div
                key={index}
                className={cn(
                  "group relative rounded-lg border transition-all duration-200 min-h-[68px] flex flex-col",
                  day.isCurrentMonth
                    ? "border-border/50 hover:border-primary/50 hover:shadow-md cursor-pointer"
                    : "border-transparent opacity-40",
                  isCurrentDay && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  hasTrades && "hover:scale-[1.01]"
                )}
                style={hasTrades ? getPnlStyle(day.pnl) : undefined}
              >
                {/* Date Number */}
                <div className="absolute top-1.5 left-2 text-xs font-semibold">
                  <span className={cn(
                    day.isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                    isCurrentDay && "text-primary font-bold"
                  )}>
                    {format(day.date, 'd')}
                  </span>
                </div>

                {/* Trade Count Badge */}
                {hasTrades && (
                  <div className="absolute top-1.5 right-2">
                    <div className="bg-background/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[10px] font-bold border border-border/50 shadow-sm">
                      {day.trades.length}
                    </div>
                  </div>
                )}

                {/* P&L Display */}
                {hasTrades && (
                  <div className="absolute inset-x-0 bottom-0 p-1.5 flex flex-col items-center gap-0.5">
                    <div className={cn(
                      "text-xs font-bold flex items-center gap-0.5",
                      day.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {day.pnl >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      ${Math.abs(day.pnl).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {day.winRate.toFixed(0)}% WR
                    </div>
                  </div>
                )}

                {/* Hover Tooltip */}
                {hasTrades && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                    <div className="bg-popover text-popover-foreground rounded-lg shadow-lg border border-border p-3 text-xs whitespace-nowrap">
                      <div className="font-semibold mb-1.5">
                        {format(day.date, 'MMM d, yyyy')}
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Trades:</span>
                          <span className="font-medium">{day.trades.length}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">P&L:</span>
                          <span className={cn(
                            "font-semibold",
                            day.pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                          )}>
                            ${day.pnl.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Win Rate:</span>
                          <span className="font-medium">{day.winRate.toFixed(1)}%</span>
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
      <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
          <span>Profitable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/30" />
          <span>Loss</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-800 border border-border" />
          <span>No Trades</span>
        </div>
      </div>
    </div>
  )
}
