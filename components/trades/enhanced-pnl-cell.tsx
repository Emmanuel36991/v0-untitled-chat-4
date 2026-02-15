"use client"

import { Badge } from "@/components/ui/badge"
import { calculateInstrumentPnL, formatPnLDisplay, type PnLDisplayFormat } from "@/types/instrument-calculations"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface EnhancedPnLCellProps {
  trade: {
    instrument: string
    direction: "long" | "short"
    entry_price: number
    exit_price: number
    size: number
    pnl: number
  }
  displayFormat: PnLDisplayFormat
  showMultipleFormats?: boolean
}

export function EnhancedPnLCell({ trade, displayFormat, showMultipleFormats = false }: EnhancedPnLCellProps) {
  const pnlResult = calculateInstrumentPnL(
    trade.instrument,
    trade.direction,
    trade.entry_price,
    trade.exit_price,
    trade.size,
  )

  const primaryDisplay = formatPnLDisplay(pnlResult, displayFormat, trade.instrument)
  const isProfit = pnlResult.adjustedPnL > 0
  const isBreakeven = pnlResult.adjustedPnL === 0

  const getColorClasses = () => {
    if (isBreakeven) return "text-warning"
    return isProfit ? "text-profit" : "text-loss"
  }

  const getIcon = () => {
    if (isBreakeven) return <Minus className="h-4 w-4" />
    return isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  const getBackgroundClasses = () => {
    if (isBreakeven) return "bg-warning/10 border-warning/20"
    return isProfit
      ? "bg-profit/10 border-profit/20"
      : "bg-loss/10 border-loss/20"
  }

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-2 font-bold text-base ${getColorClasses()} px-3 py-2 rounded-lg ${getBackgroundClasses()} border transition-all duration-300 hover:scale-105 hover:shadow-md`}
      >
        {getIcon()}
        <span className="drop-shadow-sm">{primaryDisplay}</span>
      </div>

      {showMultipleFormats && (
        <div className="flex flex-wrap gap-2">
          {displayFormat !== "dollars" && (
            <Badge
              variant="outline"
              className="text-xs font-medium px-2 py-1 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors duration-200"
            >
              {formatPnLDisplay(pnlResult, "dollars", trade.instrument)}
            </Badge>
          )}
          {displayFormat !== "points" && (
            <Badge
              variant="outline"
              className="text-xs font-medium px-2 py-1 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors duration-200"
            >
              {formatPnLDisplay(pnlResult, "points", trade.instrument)}
            </Badge>
          )}
          {displayFormat !== "percentage" && (
            <Badge
              variant="outline"
              className="text-xs font-medium px-2 py-1 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors duration-200"
            >
              {formatPnLDisplay(pnlResult, "percentage", trade.instrument)}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
