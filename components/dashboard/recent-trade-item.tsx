import Link from "next/link"
import { ArrowUpRight, ArrowDownLeft, Calendar, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Trade } from "@/types"
import { cn } from "@/lib/utils"

interface RecentTradeItemProps {
  trade: Trade
}

export function RecentTradeItem({ trade }: RecentTradeItemProps) {
  const isLong = trade.direction === "long"
  const isWin = trade.outcome === "win"
  const isLoss = trade.outcome === "loss"
  const pnlColor = trade.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"

  return (
    <div className="group flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-border/80 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Direction Indicator */}
        <div
          className={cn(
            "p-2.5 rounded-full flex-shrink-0",
            isLong ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20",
          )}
        >
          {isLong ? (
            <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDownLeft className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
        </div>

        {/* Trade Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-foreground text-sm truncate">{trade.instrument}</h4>
            <Badge variant={isLong ? "default" : "destructive"} className="text-xs px-2 py-0.5 flex-shrink-0">
              {trade.direction.toUpperCase()}
            </Badge>
            <Badge
              variant={isWin ? "default" : isLoss ? "destructive" : "secondary"}
              className="text-xs px-2 py-0.5 flex-shrink-0"
            >
              {trade.outcome.charAt(0).toUpperCase() + trade.outcome.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>
              {new Date(trade.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {trade.setup_name && (
              <>
                <span>•</span>
                <span className="truncate">{trade.setup_name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* P&L and Actions */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <div className="text-right">
          <p className={cn("text-lg font-bold", pnlColor)}>
            {trade.pnl >= 0 ? "+" : ""}${Math.abs(trade.pnl).toFixed(2)}
          </p>
          {trade.risk_reward_ratio && <p className="text-xs text-muted-foreground">R:R {trade.risk_reward_ratio}</p>}
        </div>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Link href={`/trade-details/${trade.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View trade details</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
