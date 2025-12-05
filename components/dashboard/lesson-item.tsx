import Link from "next/link"
import { Edit3, Brain, Calendar, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Trade } from "@/types"

interface LessonItemProps {
  trade: Trade
}

export function LessonItem({ trade }: LessonItemProps) {
  const pnlColor = trade.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  const isWin = trade.outcome === "win"
  const isLoss = trade.outcome === "loss"

  return (
    <div className="group p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{trade.instrument}</h4>
              <Badge variant={isWin ? "default" : isLoss ? "destructive" : "secondary"} className="text-xs px-2 py-0.5">
                {trade.outcome.charAt(0).toUpperCase() + trade.outcome.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(trade.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>•</span>
              <span className={pnlColor}>
                {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Link href={`/edit-trade/${trade.id}`}>
            <Edit3 className="h-4 w-4" />
            <span className="sr-only">Edit trade</span>
          </Link>
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
          {trade.notes || "No insights recorded for this trade."}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            {trade.setup_name && (
              <Badge variant="outline" className="text-xs">
                {trade.setup_name}
              </Badge>
            )}
          </div>

          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/trade-details/${trade.id}`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <span>View Details</span>
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
