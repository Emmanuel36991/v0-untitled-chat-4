'use client'

import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns'
import { TrendingUp, TrendingDown, Activity, DollarSign, Calendar } from 'lucide-react'
import { Trade } from '@/types'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface MonthlyProgressOverviewProps {
  trades: Trade[]
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
  console.log('[v0] MonthlyProgressOverview rendering with trades:', trades?.length || 0)
  
  // Calculate monthly metrics for the last 6 months
  const monthlyData = useMemo(() => {
    console.log('[v0] Calculating monthly data...')
    
    if (!trades || trades.length === 0) {
      console.log('[v0] No trades available, returning empty data')
      return []
    }
    
    const now = new Date()
    const sixMonthsAgo = subMonths(now, 5)
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now })
    console.log('[v0] Months to analyze:', months.length)

    const data: MonthlyData[] = months.map((monthDate, index) => {
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)

      const monthTrades = trades.filter((trade) => {
        if (!trade.entry_date) return false
        const tradeDate = new Date(trade.entry_date)
        return tradeDate >= monthStart && tradeDate <= monthEnd
      })

      const totalPnL = monthTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
      const wins = monthTrades.filter((t) => t.outcome === 'win').length
      const winRate = monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0
      const avgTrade = monthTrades.length > 0 ? totalPnL / monthTrades.length : 0

      // Calculate change from previous month
      let changeFromPrev: number | null = null
      if (index > 0) {
        const prevMonthPnL = data[index - 1].totalPnL
        if (prevMonthPnL !== 0) {
          changeFromPrev = ((totalPnL - prevMonthPnL) / Math.abs(prevMonthPnL)) * 100
        } else if (totalPnL !== 0) {
          changeFromPrev = 100
        }
      }

      return {
        month: format(monthDate, 'MMMM yyyy'),
        monthShort: format(monthDate, 'MMM'),
        totalPnL,
        tradeCount: monthTrades.length,
        winRate,
        avgTrade,
        isPositive: totalPnL >= 0,
        changeFromPrev,
      }
    })

    console.log('[v0] Monthly data calculated:', data.length, 'months')
    return data
  }, [trades])

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
              <span className={cn('font-bold', data.isPositive ? 'text-emerald-500' : 'text-rose-500')}>
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
                <span className={cn('font-semibold', data.changeFromPrev >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
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
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-lg p-3 border border-emerald-200/50 dark:border-emerald-800/30">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              6-Month P&L
            </span>
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {summary.total >= 0 ? '+' : ''}${summary.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
              Total Trades
            </span>
          </div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{summary.totalTrades}</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-card/50 rounded-xl border border-border/50 p-4">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Monthly Performance</h4>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Profit</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Loss</span>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="monthShort" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.1)' }} />
            <Bar dataKey="totalPnL" radius={[6, 6, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPositive ? '#10b981' : '#f43f5e'}
                  opacity={0.85}
                  className="transition-opacity hover:opacity-100"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown List */}
      <div className="space-y-2">
        {monthlyData.slice(-3).reverse().map((month, idx) => (
          <div
            key={month.month}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                month.isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              )}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{month.monthShort}</div>
                <div className="text-[10px] text-muted-foreground">{month.tradeCount} trades</div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                'text-sm font-bold flex items-center gap-1',
                month.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}>
                {month.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {month.isPositive ? '+' : ''}${Math.abs(month.totalPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              {month.changeFromPrev !== null && (
                <div className={cn(
                  'text-[10px] font-medium',
                  month.changeFromPrev >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                )}>
                  {month.changeFromPrev >= 0 ? '↑' : '↓'} {Math.abs(month.changeFromPrev).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Consistency Indicator */}
      <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-3 border border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Consistency Rate
            </div>
            <div className="text-lg font-bold text-foreground">
              {summary.consistencyRate.toFixed(0)}%
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {summary.profitableMonths}/{monthlyData.length} profitable
          </div>
        </div>
      </div>
    </div>
  )
}
