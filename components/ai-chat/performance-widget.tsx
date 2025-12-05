"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getTrades } from "@/app/actions/trade-actions"
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Shield, RefreshCw } from "lucide-react"

interface PerformanceStats {
  totalTrades: number
  winRate: number
  totalPnl: number
  avgPnlPerTrade: number
  profitFactor: number
  maxDrawdown: number
  riskScore: number
}

export function PerformanceWidget() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const trades = await getTrades()

        if (trades.length === 0) {
          setStats({
            totalTrades: 0,
            winRate: 0,
            totalPnl: 0,
            avgPnlPerTrade: 0,
            profitFactor: 0,
            maxDrawdown: 0,
            riskScore: 0,
          })
          return
        }

        const totalTrades = trades.length
        const winningTrades = trades.filter((t) => t.outcome === "win").length
        const winRate = (winningTrades / totalTrades) * 100
        const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0)
        const avgPnlPerTrade = totalPnl / totalTrades

        // Calculate profit factor
        const grossProfit = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
        const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0

        // Calculate max drawdown
        let runningTotal = 0
        let peak = 0
        let maxDrawdown = 0
        trades.forEach((trade) => {
          runningTotal += trade.pnl
          if (runningTotal > peak) peak = runningTotal
          const drawdown = peak - runningTotal
          if (drawdown > maxDrawdown) maxDrawdown = drawdown
        })

        // Calculate risk score
        const tradesWithStopLoss = trades.filter((t) => t.stop_loss && t.stop_loss !== 0).length
        const stopLossUsage = (tradesWithStopLoss / totalTrades) * 100
        const riskScore = Math.min(100, stopLossUsage * 0.7 + (profitFactor > 1 ? 30 : 0))

        setStats({
          totalTrades,
          winRate,
          totalPnl,
          avgPnlPerTrade,
          profitFactor,
          maxDrawdown,
          riskScore,
        })
      } catch (error) {
        console.error("Error fetching performance stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalTrades === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <BarChart3 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No trades recorded yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPerformanceColor = (value: number, type: "pnl" | "winRate" | "profitFactor") => {
    switch (type) {
      case "pnl":
        return value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      case "winRate":
        return value >= 60
          ? "text-green-600 dark:text-green-400"
          : value >= 45
            ? "text-yellow-600 dark:text-yellow-400"
            : "text-red-600 dark:text-red-400"
      case "profitFactor":
        return value >= 1.5
          ? "text-green-600 dark:text-green-400"
          : value >= 1.0
            ? "text-yellow-600 dark:text-yellow-400"
            : "text-red-600 dark:text-red-400"
      default:
        return "text-slate-600 dark:text-slate-400"
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Win Rate</span>
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(stats.winRate, "winRate")}`}>
              {stats.winRate.toFixed(1)}%
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Total P&L</span>
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(stats.totalPnl, "pnl")}`}>
              ${stats.totalPnl.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Profit Factor & Risk Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Profit Factor</span>
            <span className={`text-sm font-semibold ${getPerformanceColor(stats.profitFactor, "profitFactor")}`}>
              {stats.profitFactor.toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Risk Score
              </span>
              <span className={`text-sm font-semibold ${getRiskScoreColor(stats.riskScore)}`}>
                {stats.riskScore.toFixed(0)}/100
              </span>
            </div>
            <Progress value={stats.riskScore} className="h-2" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Trades:</span>
              <span className="font-medium">{stats.totalTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Avg P&L:</span>
              <span className={`font-medium ${getPerformanceColor(stats.avgPnlPerTrade, "pnl")}`}>
                ${stats.avgPnlPerTrade.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Badge */}
        <div className="flex justify-center pt-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              stats.totalPnl >= 0 && stats.winRate >= 50
                ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
                : "border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300",
            )}
          >
            {stats.totalPnl >= 0 && stats.winRate >= 50 ? (
              <>
                <TrendingUp className="h-3 w-3 mr-1" />
                Profitable
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 mr-1" />
                Needs Improvement
              </>
            )}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
