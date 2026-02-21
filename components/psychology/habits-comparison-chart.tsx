"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts"

interface HabitData {
  name: string
  winRate: number
  tradeCount: number
  avgPnL: number
  type: 'good' | 'bad'
}

interface Props {
  goodHabits: HabitData[]
  badHabits: HabitData[]
  isDark?: boolean
}

export default function HabitsComparisonChart({ goodHabits, badHabits, isDark = false }: Props) {
  // Combine all and sort by avgPnL descending for a logical impact flow
  const chartData = [
    ...goodHabits.map(h => ({
      name: h.name.slice(0, 20),
      winRate: h.winRate * 100,
      type: 'good',
      trades: h.tradeCount,
      pnl: h.avgPnL
    })),
    ...badHabits.map(h => ({
      name: h.name.slice(0, 20),
      winRate: h.winRate * 100,
      type: 'bad',
      trades: h.tradeCount,
      pnl: h.avgPnL
    }))
  ]
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 10) // Top 10 most impactful habits (both positive and negative)

  const topGoodHabits = chartData.filter(d => d.type === 'good')
  const topBadHabits = chartData.filter(d => d.type === 'bad')

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className={`p-3 rounded-lg border shadow-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <p className={`font-semibold mb-1 ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
            {data.name}
          </p>
          <div className="space-y-1 text-xs">
            <p className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
              Avg P/L: <span className={`font-bold ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}
              </span>
            </p>
            <p className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
              Win Rate: <span className="font-bold">{data.winRate.toFixed(1)}%</span>
            </p>
            <p className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
              Trades: <span className="font-bold">{data.trades}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={`${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'} backdrop-blur shadow-xl`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Habit Impact Analysis
            </CardTitle>
            <CardDescription className={isDark ? 'text-zinc-500' : 'text-slate-600'}>
              Average P/L impact per trade based on reported habits
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              No habit data available yet. Start logging trades with habits to see analysis.
            </p>
          </div>
        ) : (
          <>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#27272a' : '#e2e8f0'}
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(val) => `$${val}`}
                    stroke={isDark ? '#71717a' : '#64748b'}
                    tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke={isDark ? '#71717a' : '#64748b'}
                    tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 11 }}
                    width={95}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#18181b' : '#f8fafc' }} />
                  <ReferenceLine x={0} stroke={isDark ? '#52525b' : '#cbd5e1'} />
                  <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? 'var(--profit)' : 'var(--loss)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend / Key */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-profit" />
                <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Positive Impact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-loss" />
                <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Negative Impact</span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-profit/10 border-profit/20' : 'bg-profit/10 border-profit/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-profit" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-profit">
                    Good Habits
                  </span>
                </div>
                <p className="text-2xl font-bold text-profit">
                  {topGoodHabits.length > 0
                    ? `${(topGoodHabits.reduce((sum, h) => sum + h.winRate, 0) / topGoodHabits.length).toFixed(1)}%`
                    : 'N/A'
                  }
                </p>
                <p className="text-xs mt-1 text-profit/70">Avg Win Rate</p>
              </div>

              <div className={`p-4 rounded-lg border ${isDark ? 'bg-loss/10 border-loss/20' : 'bg-loss/10 border-loss/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-loss" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-loss">
                    Bad Habits
                  </span>
                </div>
                <p className="text-2xl font-bold text-loss">
                  {topBadHabits.length > 0
                    ? `${(topBadHabits.reduce((sum, h) => sum + h.winRate, 0) / topBadHabits.length).toFixed(1)}%`
                    : 'N/A'
                  }
                </p>
                <p className="text-xs mt-1 text-loss/70">Avg Win Rate</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
