'use client'

import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns'
import { TrendingUp, TrendingDown, Activity, DollarSign, Calendar } from 'lucide-react'
import { Trade } from '@/types'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface MonthlyProgressOverviewProps {
  trades?: Trade[]
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

export function MonthlyProgressOverview({ trades = [] }: MonthlyProgressOverviewProps) {
  // Ensure trades is always an array
  const safeTrades = Array.isArray(trades) ? trades : []

  // Calculate monthly metrics for the last 6 months using safe Array.map approach
  const monthlyData = useMemo(() => {
    if (safeTrades.length === 0) {
      return []
    }

    const now = new Date()
    const sixMonthsAgo = subMonths(now, 5)
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now })

    // First pass: calculate base metrics for each month
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

    // Second pass: calculate change from previous month (avoids referencing uninitialized data)
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

  // Calculate overall summary
  const summary = useMemo(() => {
    const total = monthlyData.reduce((sum, m) => sum + m.totalPnL, 0)
    const totalTrades = monthlyData.reduce((sum, m) => sum + m.tradeCount, 0)
    const profitableMonths = monthlyData.filter((m) => m.isPositive).length
    const consistencyRate = monthlyData.length > 0 ? (profitableMonths / monthlyData.length) * 100 : 0

    return { total, totalTrades, profitableMonths, consistencyRate }
  }, [monthlyData])

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthlyData
      return (
        <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs backdrop-blur-sm">
          <div className="font-bold mb-2 text-foreground">{data.month}</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">P&L:</span>
              <span className={cn('font-bold', data.isPositive ? 'text-profit' : 'text-loss')}>
                {data.isPositive ? '+' : ''}${data.totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Trades:</span>
              <span className="font-semibold">{data.tradeCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Win Rate:</span>
              <span className="font-semibold">{data.winRate.toFixed(1)}%</span>
            </div>
            {data.changeFromPrev !== null && (
              <div className="flex justify-between gap-4 pt-1 border-t border-border/30">
                <span className="text-muted-foreground">Change:</span>
                <span className={cn('font-semibold', data.changeFromPrev >= 0 ? 'text-profit' : 'text-loss')}>
                  {data.changeFromPrev >= 0 ? '+' : ''}
                  {data.changeFromPrev.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  // Show empty state if no data
  if (monthlyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No trading data available</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Start tracking trades to see monthly progress</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-profit/10 to-profit/5 rounded-md p-2.5 border border-profit/20">
          <div className="flex items-center gap-1.5 mb-0.5">
            <DollarSign className="w-3 h-3 text-profit" />
            <span className="text-[9px] font-semibold text-profit uppercase tracking-wide">
              6-Month P&L
            </span>
          </div>
          <div className="text-base font-bold text-profit">
            {summary.total >= 0 ? '+' : ''}${summary.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-md p-2.5 border border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-[9px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
              Total Trades
            </span>
          </div>
          <div className="text-base font-bold text-blue-700 dark:text-blue-300">{summary.totalTrades}</div>
        </div>
      </div>

      {/* Bar Chart - Compact */}
      <div className="bg-card/50 rounded-lg border border-border/50 p-3">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Monthly Performance</h4>
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
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

        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <XAxis dataKey="monthShort" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
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

      {/* Monthly Breakdown List - Compact */}
      <div className="space-y-1.5">
        {monthlyData.slice(-3).reverse().map((month, idx) => (
          <div
            key={month.month}
            className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-md flex items-center justify-center',
                month.isPositive
                  ? 'bg-profit/10 text-profit'
                  : 'bg-loss/10 text-loss'
              )}>
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">{month.monthShort}</div>
                <div className="text-[9px] text-muted-foreground">{month.tradeCount} trades</div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                'text-xs font-bold flex items-center gap-0.5',
                month.isPositive ? 'text-profit' : 'text-loss'
              )}>
                {month.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {month.isPositive ? '+' : ''}${Math.abs(month.totalPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              {month.changeFromPrev !== null && (
                <div className={cn(
                  'text-[9px] font-medium',
                  month.changeFromPrev >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {month.changeFromPrev >= 0 ? '↑' : '↓'} {Math.abs(month.changeFromPrev).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Consistency Indicator - Compact */}
      <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-md p-2.5 border border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
              Consistency Rate
            </div>
            <div className="text-base font-bold text-foreground">
              {summary.consistencyRate.toFixed(0)}%
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {summary.profitableMonths}/{monthlyData.length} profitable
          </div>
        </div>
      </div>
    </div>
  )
}
