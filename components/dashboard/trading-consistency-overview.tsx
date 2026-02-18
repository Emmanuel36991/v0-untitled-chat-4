'use client'

import { useMemo, useState } from 'react'
import { format, subDays, startOfWeek, getDay, isSameDay, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns'
import { Trade } from '@/types'
import { cn } from '@/lib/utils'
import { Activity, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface TradingConsistencyOverviewProps {
  trades?: Trade[]
}

interface DayData {
  date: Date
  dateString: string
  pnl: number
  tradeCount: number
}

interface MonthlyData {
  month: string
  monthShort: string
  totalPnL: number
  tradeCount: number
  winRate: number
  avgTrade: number
  isPositive: boolean
  changeFromPrev: number | null
}

// Color scale for heatmap
function getPnLColor(pnl: number, tradeCount: number): string {
  if (tradeCount === 0) {
    return 'bg-muted/40 dark:bg-muted/20'
  }

  if (pnl > 0) {
    if (pnl >= 500) return 'bg-profit dark:bg-profit'
    if (pnl >= 200) return 'bg-profit/80 dark:bg-profit/80'
    if (pnl >= 100) return 'bg-profit/60 dark:bg-profit/60'
    if (pnl >= 50) return 'bg-profit/40 dark:bg-profit/40'
    return 'bg-profit/25 dark:bg-profit/25'
  } else if (pnl < 0) {
    const absLoss = Math.abs(pnl)
    if (absLoss >= 500) return 'bg-loss dark:bg-loss'
    if (absLoss >= 200) return 'bg-loss/80 dark:bg-loss/80'
    if (absLoss >= 100) return 'bg-loss/60 dark:bg-loss/60'
    if (absLoss >= 50) return 'bg-loss/40 dark:bg-loss/40'
    return 'bg-loss/25 dark:bg-loss/25'
  }

  return 'bg-warning/50 dark:bg-warning/50'
}

export function TradingConsistencyOverview({ trades = [] }: TradingConsistencyOverviewProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const safeTrades = Array.isArray(trades) ? trades : []

  // Generate yearly heatmap data
  const { weeks, monthLabels, stats } = useMemo(() => {
    const today = new Date()
    const days: DayData[] = []

    for (let i = 364; i >= 0; i--) {
      const date = subDays(today, i)
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

    // Organize into weeks
    const weeksArray: (DayData | null)[][] = []
    let currentWeek: (DayData | null)[] = Array(7).fill(null)

    days.forEach((day, index) => {
      const dayOfWeek = getDay(day.date)

      if (index === 0) {
        currentWeek = Array(7).fill(null)
        currentWeek[dayOfWeek] = day
      } else {
        if (dayOfWeek === 0 && currentWeek.some(d => d !== null)) {
          weeksArray.push(currentWeek)
          currentWeek = Array(7).fill(null)
        }
        currentWeek[dayOfWeek] = day
      }
    })

    if (currentWeek.some(d => d !== null)) {
      weeksArray.push(currentWeek)
    }

    // Generate month labels
    const labels: { month: string; weekIndex: number }[] = []
    let lastMonth = -1
    weeksArray.forEach((week, weekIndex) => {
      const firstDay = week.find(d => d !== null)
      if (firstDay) {
        const monthNum = firstDay.date.getMonth()
        if (monthNum !== lastMonth && weekIndex > 0) {
          labels.push({
            month: format(firstDay.date, 'MMM'),
            weekIndex,
          })
          lastMonth = monthNum
        } else if (weekIndex === 0) {
          labels.push({
            month: format(firstDay.date, 'MMM'),
            weekIndex,
          })
          lastMonth = monthNum
        }
      }
    })

    // Calculate stats
    const tradingDays = days.filter(d => d.tradeCount > 0).length
    const profitableDays = days.filter(d => d.pnl > 0).length
    const totalPnL = days.reduce((sum, d) => sum + d.pnl, 0)
    const avgDayPnL = tradingDays > 0 ? totalPnL / tradingDays : 0

    return {
      weeks: weeksArray,
      monthLabels: labels,
      stats: {
        tradingDays,
        profitableDays,
        consistency: tradingDays > 0 ? (profitableDays / tradingDays) * 100 : 0,
        totalPnL,
        avgDayPnL,
      },
    }
  }, [safeTrades])

  // Calculate monthly data
  const monthlyData = useMemo(() => {
    if (safeTrades.length === 0) return []

    const now = new Date()
    const sixMonthsAgo = subMonths(now, 5)
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now })

    const baseData = months.map((monthDate) => {
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      const monthTrades = safeTrades.filter((trade) => {
        if (!trade?.date) return false
        const tradeDate = new Date(trade.date)
        return tradeDate >= monthStart && tradeDate <= monthEnd
      })

      const totalPnL = monthTrades.reduce((sum, trade) => sum + (trade?.pnl || 0), 0)
      const wins = monthTrades.filter((t) => t?.outcome === 'win').length
      const winRate = monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0
      const avgTrade = monthTrades.length > 0 ? totalPnL / monthTrades.length : 0

      return {
        month: format(monthDate, 'MMMM yyyy'),
        monthShort: format(monthDate, 'MMM'),
        totalPnL,
        tradeCount: monthTrades.length,
        winRate,
        avgTrade,
        isPositive: totalPnL >= 0,
        changeFromPrev: null as number | null,
      }
    })

    const dataWithChanges: MonthlyData[] = baseData.map((item, index) => {
      if (index === 0) return item
      const prevMonthPnL = baseData[index - 1].totalPnL
      let changeFromPrev: number | null = null
      if (prevMonthPnL !== 0) {
        changeFromPrev = ((item.totalPnL - prevMonthPnL) / Math.abs(prevMonthPnL)) * 100
      } else if (item.totalPnL !== 0) {
        changeFromPrev = 100
      }
      return { ...item, changeFromPrev }
    })

    return dataWithChanges
  }, [safeTrades])

  const monthlySummary = useMemo(() => {
    const total = monthlyData.reduce((sum, m) => sum + m.totalPnL, 0)
    const totalTrades = monthlyData.reduce((sum, m) => sum + m.tradeCount, 0)
    const profitableMonths = monthlyData.filter((m) => m.isPositive).length
    const consistencyRate = monthlyData.length > 0 ? (profitableMonths / monthlyData.length) * 100 : 0
    return { total, totalTrades, profitableMonths, consistencyRate }
  }, [monthlyData])

  const handleMouseEnter = (day: DayData, event: React.MouseEvent) => {
    setHoveredDay(day)
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 })
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover border border-border rounded-lg shadow-xl p-3">
          <div className="text-xs font-semibold text-foreground mb-1">{data.month}</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">P&L:</span>
              <span className={cn("font-mono font-bold", data.isPositive ? "text-profit" : "text-loss")}>
                {data.isPositive ? '+' : ''}${data.totalPnL.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">Trades:</span>
              <span className="font-semibold">{data.tradeCount}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">Win Rate:</span>
              <span className="font-semibold">{data.winRate.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-profit/10 to-profit/5 rounded-lg p-3 border border-profit/20">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-profit" />
            <span className="text-[9px] font-semibold text-profit uppercase tracking-wide">
              Total P&L
            </span>
          </div>
          <div className="text-lg font-bold text-profit">
            {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[9px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
              Trading Days
            </span>
          </div>
          <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{stats.tradingDays}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 rounded-lg p-3 border border-purple-200/50 dark:border-purple-800/30">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-[9px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
              Consistency
            </span>
          </div>
          <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{stats.consistency.toFixed(0)}%</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 rounded-lg p-3 border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
              Avg Day
            </span>
          </div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
            ${stats.avgDayPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Tabs for Yearly vs Monthly View */}
      <Tabs defaultValue="yearly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="yearly">Yearly View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="yearly" className="space-y-4">
          {/* Yearly Heatmap */}
          <div className="bg-card/50 rounded-lg border border-border/50 p-4">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                365 Day Activity
              </h4>
              <p className="text-2xs text-muted-foreground">
                Each square represents a trading day • {stats.profitableDays} profitable days out of {stats.tradingDays} trading days
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Month labels */}
                <div className="flex gap-[3px] mb-1 ml-[22px]">
                  {monthLabels.map((label) => (
                    <div
                      key={label.weekIndex}
                      className="text-[9px] text-muted-foreground font-medium"
                      style={{
                        marginLeft: `${label.weekIndex * 13}px`,
                        position: 'absolute',
                      }}
                    >
                      {label.month}
                    </div>
                  ))}
                </div>

                {/* Day labels and heatmap grid */}
                <div className="flex gap-[3px] mt-5">
                  {/* Day of week labels */}
                  <div className="flex flex-col gap-[3px] mr-1">
                    {dayLabels.map((label, i) => (
                      <div key={i} className="h-[10px] text-[8px] text-muted-foreground font-medium flex items-center">
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* Weeks */}
                  <div className="flex gap-[3px]">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-[3px]">
                        {week.map((day, dayIndex) => (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            onMouseEnter={(e) => day && handleMouseEnter(day, e)}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={cn(
                              'w-[10px] h-[10px] rounded-sm cursor-pointer transition-all',
                              day ? getPnLColor(day.pnl, day.tradeCount) : 'bg-transparent',
                              day && 'hover:ring-2 hover:ring-foreground/30'
                            )}
                            title={day ? `${day.dateString}: $${day.pnl.toFixed(0)}` : ''}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-3 ml-[22px]">
                  <span className="text-[9px] text-muted-foreground">Less</span>
                  <div className="flex gap-[2px]">
                    <div className="w-[10px] h-[10px] rounded-sm bg-muted/40 dark:bg-muted/20" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-profit/25" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-profit/40" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-profit/60" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-profit/80" />
                    <div className="w-[10px] h-[10px] rounded-sm bg-profit" />
                  </div>
                  <span className="text-[9px] text-muted-foreground">More</span>
                </div>
              </div>
            </div>

            {/* Tooltip */}
            {hoveredDay && (
              <div
                className="fixed z-50 pointer-events-none"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y}px`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="bg-popover border border-border rounded-lg shadow-xl p-2">
                  <div className="text-2xs font-semibold text-foreground mb-0.5">
                    {format(hoveredDay.date, 'MMM d, yyyy')}
                  </div>
                  <div className="text-2xs text-muted-foreground">
                    {hoveredDay.tradeCount > 0 ? (
                      <>
                        <div className={cn("font-bold", hoveredDay.pnl >= 0 ? "text-profit" : "text-loss")}>
                          {hoveredDay.pnl >= 0 ? '+' : ''}${hoveredDay.pnl.toFixed(0)}
                        </div>
                        <div>{hoveredDay.tradeCount} trade{hoveredDay.tradeCount > 1 ? 's' : ''}</div>
                      </>
                    ) : (
                      'No trades'
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          {/* Monthly Bar Chart */}
          <div className="bg-card/50 rounded-lg border border-border/50 p-4">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Last 6 Months</h4>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-profit" />
                    <span>Profit</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-loss" />
                    <span>Loss</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="monthShort" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.1)' }} />
                  <Bar dataKey="totalPnL" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isPositive ? 'var(--profit)' : 'var(--loss)'}
                        opacity={0.85}
                        className="transition-opacity hover:opacity-100"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Breakdown List */}
          <div className="space-y-2">
            {monthlyData.slice(-3).reverse().map((month) => (
              <div
                key={month.month}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    month.isPositive
                      ? 'bg-profit/10 text-profit'
                      : 'bg-loss/10 text-loss'
                  )}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{month.monthShort}</div>
                    <div className="text-2xs text-muted-foreground">{month.tradeCount} trades • {month.winRate.toFixed(0)}% WR</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    'text-sm font-bold flex items-center gap-1',
                    month.isPositive ? 'text-profit' : 'text-loss'
                  )}>
                    {month.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {month.isPositive ? '+' : ''}${Math.abs(month.totalPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  {month.changeFromPrev !== null && (
                    <div className={cn(
                      'text-2xs font-medium',
                      month.changeFromPrev >= 0 ? 'text-profit' : 'text-loss'
                    )}>
                      {month.changeFromPrev >= 0 ? '↑' : '↓'} {Math.abs(month.changeFromPrev).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
