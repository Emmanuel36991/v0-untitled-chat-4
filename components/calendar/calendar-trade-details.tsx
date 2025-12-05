"use client"

import type React from "react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react"
import type { Trade } from "@/types"
import { cn } from "@/lib/utils"

interface CalendarTradeDetailsProps {
  date: string
  trades: Trade[]
}

export const CalendarTradeDetails: React.FC<CalendarTradeDetailsProps> = ({ date, trades }) => {
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
  const wins = trades.filter((t) => t.outcome === "win").length
  const losses = trades.filter((t) => t.outcome === "loss").length
  const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : 0

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">Date</p>
            <p className="text-lg font-bold text-slate-800">{format(new Date(date), "MMM dd, yyyy")}</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "bg-gradient-to-br border transition-all",
            totalPnL > 0
              ? "from-emerald-50 to-emerald-100 border-emerald-200"
              : totalPnL < 0
                ? "from-rose-50 to-rose-100 border-rose-200"
                : "from-amber-50 to-amber-100 border-amber-200",
          )}
        >
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">Daily P&L</p>
            <p
              className={cn(
                "text-lg font-bold",
                totalPnL > 0 ? "text-emerald-700" : totalPnL < 0 ? "text-rose-700" : "text-amber-700",
              )}
            >
              ${totalPnL.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">Trades</p>
            <p className="text-lg font-bold text-blue-700">{trades.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">Win Rate</p>
            <p className="text-lg font-bold text-purple-700">{winRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Trades List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-slate-800">Trades for {format(new Date(date), "MMM dd")}</h4>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {trades.map((trade, idx) => (
            <div
              key={trade.id}
              className={cn(
                "p-4 rounded-lg border-2 transition-all hover:shadow-md",
                trade.pnl > 0
                  ? "border-emerald-200 bg-emerald-50"
                  : trade.pnl < 0
                    ? "border-rose-200 bg-rose-50"
                    : "border-amber-200 bg-amber-50",
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      trade.pnl > 0 ? "bg-emerald-100" : trade.pnl < 0 ? "bg-rose-100" : "bg-amber-100",
                    )}
                  >
                    {trade.pnl > 0 ? (
                      <TrendingUp className={cn("h-5 w-5", "text-emerald-600")} />
                    ) : trade.pnl < 0 ? (
                      <TrendingDown className={cn("h-5 w-5", "text-rose-600")} />
                    ) : (
                      <DollarSign className={cn("h-5 w-5", "text-amber-600")} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {trade.instrument} {trade.direction === "long" ? "📈" : "📉"}
                    </p>
                    <p className="text-xs text-slate-600">{trade.setup_name || "No setup"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-lg font-bold",
                      trade.pnl > 0 ? "text-emerald-700" : trade.pnl < 0 ? "text-rose-700" : "text-amber-700",
                    )}
                  >
                    ${trade.pnl.toFixed(2)}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-semibold uppercase",
                      trade.outcome === "win"
                        ? "text-emerald-600"
                        : trade.outcome === "loss"
                          ? "text-rose-600"
                          : "text-amber-600",
                    )}
                  >
                    {trade.outcome}
                  </p>
                </div>
              </div>

              {/* Trade Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-current border-opacity-10 pt-3">
                <div>
                  <p className="text-slate-600">Entry</p>
                  <p className="font-semibold text-slate-800">${trade.entry_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Exit</p>
                  <p className="font-semibold text-slate-800">${trade.exit_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Size</p>
                  <p className="font-semibold text-slate-800">{trade.size}</p>
                </div>
                <div>
                  <p className="text-slate-600">R:R</p>
                  <p className="font-semibold text-slate-800">{trade.risk_reward_ratio || "—"}</p>
                </div>
              </div>

              {/* Trade Time */}
              {trade.duration_minutes && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-10 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Duration: {trade.duration_minutes} mins</span>
                  </div>
                </div>
              )}

              {/* Trade Notes */}
              {trade.notes && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-10">
                  <p className="text-xs text-slate-600 mb-1 font-medium">Notes:</p>
                  <p className="text-xs text-slate-700 italic">{trade.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
