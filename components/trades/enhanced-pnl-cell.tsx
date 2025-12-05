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
    if (isBreakeven) return "text-orange-600 dark:text-orange-400"
    return isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  }

  const getIcon = () => {
    if (isBreakeven) return <Minus className="h-4 w-4" />
    return isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  const getBackgroundClasses = () => {
    if (isBreakeven) return "bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/50"
    return isProfit
      ? "bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50"
      : "bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50"
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
              className="text-xs font-medium px-2 py-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {formatPnLDisplay(pnlResult, "dollars", trade.instrument)}
            </Badge>
          )}
          {displayFormat !== "points" && (
            <Badge
              variant="outline"
              className="text-xs font-medium px-2 py-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {formatPnLDisplay(pnlResult, "points", trade.instrument)}
            </Badge>
          )}
          {displayFormat !== "percentage" && (
            <Badge
              variant="outline"
              className="text-xs font-medium px-2 py-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {formatPnLDisplay(pnlResult, "percentage", trade.instrument)}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
