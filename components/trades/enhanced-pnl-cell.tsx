"use client"

import { Badge } from "@/components/ui/badge"
import { calculateInstrumentPnL, formatPnLDisplay, type PnLDisplayFormat } from "@/types/instrument-calculations"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
    if (isBreakeven) return "bg-warning/10 border-warning/20 shadow-[0_0_15px_rgba(var(--warning),0.05)]"
    return isProfit
      ? "bg-profit/10 border-profit/20 shadow-[0_0_15px_rgba(var(--profit),0.1)]"
      : "bg-loss/10 border-loss/20 shadow-[0_0_15px_rgba(var(--loss),0.1)]"
  }

  return (
    <div className="space-y-2">
      <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`flex w-fit items-center gap-2 font-bold text-base ${getColorClasses()} px-3 py-2 rounded-xl ${getBackgroundClasses()} border backdrop-blur-md cursor-default`}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
        >
          {getIcon()}
        </motion.div>
        <span className="drop-shadow-sm tracking-tight">{primaryDisplay}</span>
      </motion.div>

      <div className="flex flex-wrap gap-2 h-[26px]">
        <AnimatePresence>
          {showMultipleFormats && (
            <>
              {["dollars", "points", "percentage"].filter(fmt => fmt !== displayFormat).map((fmt, i) => (
                <motion.div
                  key={fmt}
                  initial={{ opacity: 0, x: -10, scale: 0.9, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <Badge
                    variant="outline"
                    className="text-xs font-medium px-2.5 py-1 bg-white/40 dark:bg-card/40 backdrop-blur-md hover:bg-white/80 dark:hover:bg-card/80 transition-colors duration-200 border-slate-200/50 dark:border-white/10"
                  >
                    {formatPnLDisplay(pnlResult, fmt as PnLDisplayFormat, trade.instrument)}
                  </Badge>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
