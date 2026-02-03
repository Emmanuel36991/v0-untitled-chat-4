'use client'

import { useMemo, useState } from 'react'
import { format, subDays, startOfWeek, getDay, isSameDay } from 'date-fns'
import { Trade } from '@/types'
import { cn } from '@/lib/utils'

interface YearlyConsistencyHeatmapProps {
  trades?: Trade[]
}

interface DayData {
  date: Date
  dateString: string
  pnl: number
  tradeCount: number
}

// Color scale for the GitHub-style heatmap
function getPnLColor(pnl: number, tradeCount: number): string {
  if (tradeCount === 0) {
    return 'bg-muted/40 dark:bg-muted/20' // No trade - gray
  }
  
  if (pnl > 0) {
    // Green shades for profit
    if (pnl >= 500) return 'bg-emerald-600 dark:bg-emerald-500'
    if (pnl >= 200) return 'bg-emerald-500 dark:bg-emerald-400'
    if (pnl >= 100) return 'bg-emerald-400 dark:bg-emerald-500/70'
    if (pnl >= 50) return 'bg-emerald-300 dark:bg-emerald-500/50'
    return 'bg-emerald-200 dark:bg-emerald-500/30'
  } else if (pnl < 0) {
    // Red shades for loss
    const absLoss = Math.abs(pnl)
    if (absLoss >= 500) return 'bg-rose-600 dark:bg-rose-500'
    if (absLoss >= 200) return 'bg-rose-500 dark:bg-rose-400'
    if (absLoss >= 100) return 'bg-rose-400 dark:bg-rose-500/70'
    if (absLoss >= 50) return 'bg-rose-300 dark:bg-rose-500/50'
    return 'bg-rose-200 dark:bg-rose-500/30'
  }
  
  // Breakeven
  return 'bg-amber-300 dark:bg-amber-500/50'
}

export function YearlyConsistencyHeatmap({ trades = [] }: YearlyConsistencyHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
  const safeTrades = Array.isArray(trades) ? trades : []

  // Generate the last 365 days and map trades to them
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date()
    const days: DayData[] = []
    
    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = subDays(today, i)
      
      // Find trades for this day
      const dayTrades = safeTrades.filter((trade) => {
        if (!trade?.date) return false
        return isSameDay(new Date(trade.date), date)
      })
      
      const pnl = dayTrades.reduce((sum, trade) => sum + (trade?.pnl || 0), 0)
      
      days.push({
        date,
        dateString: format(date, 'yyyy-MM-dd'),
        pnl,
        tradeCount: dayTrades.length,
      })
    }
    
    // Organize into weeks (7 rows x ~52 columns)
    // Each column is a week, each row is a day of the week (0=Sun to 6=Sat)
    const weeksArray: (DayData | null)[][] = []
    let currentWeek: (DayData | null)[] = Array(7).fill(null)
    
    days.forEach((day, index) => {
      const dayOfWeek = getDay(day.date) // 0 = Sunday, 6 = Saturday
      
      // If this is the first day, we need to pad the beginning
      if (index === 0) {
        const firstDayOfWeek = dayOfWeek
        // Initialize current week with nulls for days before our start
        currentWeek = Array(7).fill(null)
        currentWeek[firstDayOfWeek] = day
      } else {
        if (dayOfWeek === 0 && currentWeek.some(d => d !== null)) {
          // Start of a new week (Sunday), push previous week
          weeksArray.push(currentWeek)
          currentWeek = Array(7).fill(null)
        }
        currentWeek[dayOfWeek] = day
      }
    })
    
    // Push the last week
    if (currentWeek.some(d => d !== null)) {
      weeksArray.push(currentWeek)
    }
    
    // Generate month labels
    const labels: { month: string; weekIndex: number }[] = []
    let lastMonth = ''
    
    weeksArray.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find(d => d !== null)
      if (firstDayOfWeek) {
        const month = format(firstDayOfWeek.date, 'MMM')
        if (month !== lastMonth) {
          labels.push({ month, weekIndex })
          lastMonth = month
        }
      }
    })
    
    return { weeks: weeksArray, monthLabels: labels }
  }, [safeTrades])

  const handleMouseEnter = (day: DayData, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHoveredDay(day)
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="w-full">
      {/* Month labels */}
      <div className="flex mb-2 ml-8">
        <div className="flex relative" style={{ width: `${weeks.length * 14}px` }}>
          {monthLabels.map((label, idx) => (
            <span
              key={idx}
              className="absolute text-[10px] font-medium text-muted-foreground"
              style={{ left: `${label.weekIndex * 14}px` }}
            >
              {label.month}
            </span>
          ))}
        </div>
      </div>
      
      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* Day of week labels */}
        <div className="flex flex-col gap-[3px] pr-1">
          {dayLabels.map((label, idx) => (
            <div
              key={label}
              className="h-[11px] w-6 text-[9px] font-medium text-muted-foreground flex items-center"
              style={{ visibility: idx % 2 === 1 ? 'visible' : 'hidden' }}
            >
              {label}
            </div>
          ))}
        </div>
        
        {/* Weeks grid */}
        <div className="flex gap-[3px] overflow-x-auto pb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn(
                    'w-[11px] h-[11px] rounded-[2px] transition-all duration-150',
                    day ? getPnLColor(day.pnl, day.tradeCount) : 'bg-transparent',
                    day && 'cursor-pointer hover:ring-2 hover:ring-foreground/30 hover:ring-offset-1'
                  )}
                  onMouseEnter={(e) => day && handleMouseEnter(day, e)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="flex items-center gap-1">
          <div className="w-[11px] h-[11px] rounded-[2px] bg-rose-500" title="Loss" />
          <div className="w-[11px] h-[11px] rounded-[2px] bg-rose-300 dark:bg-rose-500/50" />
          <div className="w-[11px] h-[11px] rounded-[2px] bg-muted/40 dark:bg-muted/20" title="No Trade" />
          <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-300 dark:bg-emerald-500/50" />
          <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-500" title="Profit" />
        </div>
        <span>More</span>
      </div>
      
      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 bg-popover border border-border rounded-lg shadow-xl p-2.5 text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="font-semibold text-foreground mb-1">
            {format(hoveredDay.date, 'MMM dd, yyyy')}
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Net P&L:</span>
              <span
                className={cn(
                  'font-mono font-bold',
                  hoveredDay.pnl > 0
                    ? 'text-emerald-500'
                    : hoveredDay.pnl < 0
                    ? 'text-rose-500'
                    : 'text-muted-foreground'
                )}
              >
                {hoveredDay.pnl >= 0 ? '+' : ''}${hoveredDay.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Trades:</span>
              <span className="font-mono">{hoveredDay.tradeCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
