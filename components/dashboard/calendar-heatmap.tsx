import React, { useMemo } from "react"
import {
  format,
  isSameDay,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
} from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types"
import { calculateInstrumentPnL } from "@/types/instrument-calculations"

export interface CalendarHeatmapProps {
  trades: Trade[]
  currentDate: Date
}

export const CalendarHeatmap = React.memo<CalendarHeatmapProps>(
  ({ trades, currentDate }) => {
    const daysInMonth = useMemo(() => {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      const days = eachDayOfInterval({ start, end })
      const startDay = getDay(start)
      return Array(startDay).fill(null).concat(days)
    }, [currentDate])

    const getDayData = (day: Date | null) => {
      if (!day) return null
      const dayTrades = trades.filter((t) => isSameDay(new Date(t.date), day))
      const pnl = dayTrades.reduce((acc, t) => {
        const val =
          t.pnl !== undefined
            ? t.pnl
            : calculateInstrumentPnL(
              t.instrument,
              t.direction,
              t.entry_price,
              t.exit_price,
              t.size
            ).adjustedPnL
        return acc + val
      }, 0)
      return { day, pnl, count: dayTrades.length }
    }

    return (
      <div className="w-full select-none">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-center text-xs uppercase font-bold text-muted-foreground tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          <TooltipProvider delayDuration={100}>
            {daysInMonth.map((day, idx) => {
              const data = getDayData(day)
              if (!day) return <div key={`empty-${idx}`} className="aspect-square" />

              let bgClass = "bg-muted"
              let opacity = 1

              if (data && data.count > 0) {
                if (data.pnl > 0) bgClass = "bg-profit"
                else if (data.pnl < 0) bgClass = "bg-loss"
                else bgClass = "bg-warning"
                opacity = Math.min(Math.abs(data.pnl) / 1000, 1) * 0.6 + 0.4
              }

              const CellContent = (
                <div className="aspect-square rounded-md relative group cursor-pointer transition-all hover:ring-2 ring-primary/50 ring-offset-1 ring-offset-background">
                  <div
                    className={cn("absolute inset-0 rounded-md transition-colors duration-200", bgClass)}
                    style={{ opacity: data && data.count > 0 ? opacity : 1 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className={cn(
                        "text-xs font-medium transition-colors",
                        data && data.count > 0 ? "text-white/90" : "text-muted-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                </div>
              )

              if (data && data.count > 0) {
                return (
                  <Tooltip key={day.toISOString()}>
                    <TooltipTrigger asChild>{CellContent}</TooltipTrigger>
                    <TooltipContent side="top" className="p-0 border-0 bg-transparent shadow-none">
                      <div className="p-2.5 bg-card border border-border rounded-lg shadow-xl text-xs">
                        <p className="font-semibold mb-1">
                          {format(day, "MMM dd, yyyy")}
                        </p>
                        <div className="space-y-0.5">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Net P&L:</span>
                            <span
                              className={cn(
                                "font-mono font-bold",
                                data.pnl >= 0 ? "text-profit" : "text-loss"
                              )}
                            >
                              {data.pnl >= 0 ? "+" : ""}${data.pnl.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Trades:</span>
                            <span className="font-mono">{data.count}</span>
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
      </div>
    )
  }
)

CalendarHeatmap.displayName = "CalendarHeatmap"
