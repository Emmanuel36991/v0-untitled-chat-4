"use client"
import { format } from "date-fns"
import { TrendingUp, TrendingDown, Clock, Target, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Trade } from "@/types"
import { cn } from "@/lib/utils"

interface TradeDetailsTabProps {
  date: string
  trades: Trade[]
}

export function TradeDetailsTab({ date, trades }: TradeDetailsTabProps) {
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {format(new Date(date), "EEEE, MMMM dd, yyyy")}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {trades.length} trade{trades.length !== 1 ? "s" : ""} on this day
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {sortedTrades.map((trade, index) => {
          const pnlPercent = ((trade.pnl / (trade.size * trade.entry_price)) * 100).toFixed(2)
          const duration = trade.duration_minutes
            ? `${Math.floor(trade.duration_minutes / 60)}h ${trade.duration_minutes % 60}m`
            : "N/A"
          const isWin = trade.pnl > 0
          const isLoss = trade.pnl < 0

          return (
            <Card
              key={index}
              className={cn(
                "overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                isWin &&
                  "border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent",
                isLoss &&
                  "border-l-rose-500 bg-gradient-to-r from-rose-50/50 to-transparent dark:from-rose-950/20 dark:to-transparent",
                !isWin &&
                  !isLoss &&
                  "border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20 dark:to-transparent",
              )}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Trade Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          isWin && "bg-emerald-100 dark:bg-emerald-900/30",
                          isLoss && "bg-rose-100 dark:bg-rose-900/30",
                          !isWin && !isLoss && "bg-amber-100 dark:bg-amber-900/30",
                        )}
                      >
                        {isWin ? (
                          <TrendingUp className={cn("h-5 w-5", "text-emerald-600 dark:text-emerald-400")} />
                        ) : (
                          <TrendingDown className={cn("h-5 w-5", "text-rose-600 dark:text-rose-400")} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{trade.instrument}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                          {trade.direction === "long" ? "📈 Long" : "📉 Short"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-bold",
                        isWin &&
                          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
                        isLoss &&
                          "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300 dark:border-rose-700",
                        !isWin &&
                          !isLoss &&
                          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700",
                      )}
                    >
                      {isWin ? "WIN" : isLoss ? "LOSS" : "BREAKEVEN"}
                    </Badge>
                  </div>

                  {/* P&L Display */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">P&L ($)</p>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          isWin ? "text-emerald-600" : isLoss ? "text-rose-600" : "text-amber-600",
                        )}
                      >
                        {trade.pnl > 0 ? "+" : ""}
                        {trade.pnl.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">P&L (%)</p>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          isWin ? "text-emerald-600" : isLoss ? "text-rose-600" : "text-amber-600",
                        )}
                      >
                        {Number.parseFloat(pnlPercent) > 0 ? "+" : ""}
                        {pnlPercent}%
                      </p>
                    </div>
                  </div>

                  {/* Trade Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <Target className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Entry</p>
                        <p className="font-semibold">${trade.entry_price.toFixed(4)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <Award className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Exit</p>
                        <p className="font-semibold">${trade.exit_price.toFixed(4)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Duration</p>
                        <p className="font-semibold">{duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-700/50 p-2 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Size: {trade.size}</p>
                    </div>
                  </div>

                  {/* Stop Loss & Take Profit */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Stop Loss</p>
                      <p className="font-bold text-rose-600 dark:text-rose-400">${trade.stop_loss.toFixed(4)}</p>
                    </div>
                    {trade.take_profit && (
                      <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Take Profit</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          ${trade.take_profit.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Setup and Notes */}
                  {trade.setup_name && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-lg p-2">
                      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                        Setup
                      </p>
                      <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium">{trade.setup_name}</p>
                    </div>
                  )}

                  {trade.notes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-2">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-blue-900 dark:text-blue-200">{trade.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
