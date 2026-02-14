"use client"

import React, { useMemo } from "react"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { format } from "date-fns"
import type { Trade } from "@/types"
import { usePnLDisplay } from "@/hooks/use-pnl-display"
import { calculateInstrumentPnL, formatPnLDisplay } from "@/types/instrument-calculations"

interface CumulativePLChartProps {
  trades: Trade[]
}

const CumulativePLChart = React.memo(({ trades }: CumulativePLChartProps) => {
  const { displayFormat } = usePnLDisplay() // Added P&L display format state

  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) {
      return []
    }

    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let cumulativePL = 0
    return sortedTrades.map((trade) => {
      const pnlResult = calculateInstrumentPnL(
        trade.instrument,
        trade.direction,
        trade.entry_price,
        trade.exit_price,
        trade.size,
      )
      cumulativePL += pnlResult.adjustedPnL

      return {
        date: format(new Date(trade.date), "MM/dd/yy"),
        fullDate: trade.date,
        pl: cumulativePL,
        tradePL: pnlResult.adjustedPnL,
        instrument: trade.instrument,
        displayValue: formatPnLDisplay(pnlResult, displayFormat, trade.instrument),
      }
    })
  }, [trades, displayFormat])

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { currentTotal: 0, bestDay: 0, worstDay: 0, totalTrades: 0 }
    }

    const currentTotal = chartData[chartData.length - 1]?.pl || 0
    const bestDay = Math.max(...chartData.map((d) => d.tradePL))
    const worstDay = Math.min(...chartData.map((d) => d.tradePL))
    const totalTrades = chartData.length

    return { currentTotal, bestDay, worstDay, totalTrades }
  }, [chartData])

  const isPositive = stats.currentTotal >= 0

  if (chartData.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Cumulative P&L</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No trades available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Cumulative P&L ({displayFormat})</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal mt-0.5">Performance over time</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <span className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {displayFormat === "dollars"
                  ? `$${stats.currentTotal.toFixed(2)}`
                  : `${stats.currentTotal.toFixed(2)} ${displayFormat}`}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stats.totalTrades} trades</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-80 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  displayFormat === "dollars" ? `$${value}` : `${value} ${displayFormat.slice(0, 3)}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#f9fafb",
                }}
                labelStyle={{ color: "#d1d5db" }}
                formatter={(value: any, name: any) => [
                  displayFormat === "dollars"
                    ? `$${Number(value).toFixed(2)}`
                    : `${Number(value).toFixed(2)} ${displayFormat}`,
                  "Cumulative P&L",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="pl"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={3}
                fill="url(#colorPL)"
                dot={{ fill: isPositive ? "#10b981" : "#ef4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: isPositive ? "#10b981" : "#ef4444", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Best Day</p>
            <p className="text-lg font-bold text-green-600">
              {displayFormat === "dollars"
                ? `$${stats.bestDay.toFixed(2)}`
                : `${stats.bestDay.toFixed(2)} ${displayFormat}`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Worst Day</p>
            <p className="text-lg font-bold text-red-600">
              {displayFormat === "dollars"
                ? `$${stats.worstDay.toFixed(2)}`
                : `${stats.worstDay.toFixed(2)} ${displayFormat}`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Trades</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalTrades}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

CumulativePLChart.displayName = "CumulativePLChart"

export default CumulativePLChart
