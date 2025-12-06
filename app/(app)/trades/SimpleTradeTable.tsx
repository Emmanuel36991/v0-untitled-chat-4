"use client"

import type { Trade } from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit3, Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Database, Sparkles, Zap } from 'lucide-react'
import Link from "next/link"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteTrade } from "@/app/actions/trade-actions"
import { useToast } from "@/components/ui/use-toast"
import { useAIAdvisor } from "@/hooks/use-ai-advisor"
import { AdvisorPanel } from "@/components/ai/advisor-panel"

interface SimpleTradeTableProps {
  trades: Trade[]
  onRefresh: () => void
}

export function SimpleTradeTable({ trades, onRefresh }: SimpleTradeTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  
  // FIX: Destructure the correct values from the hook
  const { openAdvisor, advisorProps } = useAIAdvisor()

  const handleDeleteClick = (tradeId: string) => {
    setTradeToDelete(tradeId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!tradeToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteTrade(tradeToDelete)
      if (result.success) {
        toast({
          title: "Trade Deleted",
          description: "Trade has been successfully removed.",
          className: "bg-green-500 text-white",
        })
        onRefresh()
      } else {
        toast({
          title: "Delete Failed",
          description: result.message || "Could not delete trade.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setTradeToDelete(null)
    }
  }

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "—"
    return price.toFixed(5)
  }

  const formatPnL = (pnl: number | null | undefined) => {
    if (pnl === null || pnl === undefined) return "$0.00"
    const formatted = Math.abs(pnl).toFixed(2)
    return pnl >= 0 ? `$${formatted}` : `−$${formatted}`
  }

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome || outcome === null || outcome === undefined) {
      return (
        <Badge
          variant="secondary"
          className="bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          N/A
        </Badge>
      )
    }

    switch (outcome.toLowerCase()) {
      case "win":
        return (
          <Badge className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse">
            <TrendingUp className="h-3 w-3 mr-1" />
            Win
          </Badge>
        )
      case "loss":
        return (
          <Badge className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <TrendingDown className="h-3 w-3 mr-1" />
            Loss
          </Badge>
        )
      case "breakeven":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Breakeven
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            {outcome}
          </Badge>
        )
    }
  }

  const getDirectionIcon = (direction: string) => {
    if (direction === "long") {
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse">
            <ArrowUpRight className="h-4 w-4 text-white" />
          </div>
          <span className="capitalize font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Long
          </span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-gradient-to-br from-red-400 via-rose-500 to-red-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
          <ArrowDownRight className="h-4 w-4 text-white" />
        </div>
        <span className="capitalize font-semibold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
          Short
        </span>
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <CardContent className="py-20 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <Sparkles className="h-12 w-12 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-2">
            No trades yet
          </h3>
          <p className="text-muted-foreground text-lg mb-6">Start tracking your trading journey today!</p>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/add-trade">
              <Sparkles className="h-4 w-4 mr-2" />
              Add Your First Trade
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="shadow-2xl border-2 border-transparent bg-gradient-to-r from-white via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10 pointer-events-none" />

        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Trade Database
              </CardTitle>
              <CardDescription className="text-base">Complete trading history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-gray-200 dark:border-gray-700">
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300">DATE</TableHead>
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300">INSTRUMENT</TableHead>
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300">DIRECTION</TableHead>
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300">SIZE</TableHead>
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300">ENTRY</TableHead>
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300">EXIT</TableHead>
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300">P&L (DOLLARS)</TableHead>
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300">OUTCOME</TableHead>
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300">R:R</TableHead>
                  <TableHead className="text-right font-bold text-gray-700 dark:text-gray-300">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade, index) => {
                  const isWin = trade.outcome === "win"
                  const isLoss = trade.outcome === "loss"
                  const rowBg = isWin
                    ? "bg-gradient-to-r from-green-50/50 via-emerald-50/30 to-green-50/50 dark:from-green-950/20 dark:via-emerald-950/10 dark:to-green-950/20"
                    : isLoss
                      ? "bg-gradient-to-r from-red-50/50 via-rose-50/30 to-red-50/50 dark:from-red-950/20 dark:via-rose-950/10 dark:to-red-950/20"
                      : index % 2 === 0
                        ? "bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/10 dark:via-purple-950/5 dark:to-pink-950/10"
                        : "bg-white dark:bg-gray-900"

                  return (
                    <TableRow
                      key={trade.id}
                      className={`${rowBg} hover:bg-gradient-to-r hover:from-blue-100/50 hover:via-purple-100/50 hover:to-pink-100/50 dark:hover:from-blue-900/20 dark:hover:via-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 hover:shadow-lg border-l-4 ${
                        isWin
                          ? "border-l-green-500"
                          : isLoss
                            ? "border-l-red-500"
                            : "border-l-transparent hover:border-l-purple-500"
                      }`}
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(trade.date).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                          {trade.instrument || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getDirectionIcon(trade.direction)}</TableCell>
                      <TableCell className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {trade.size}
                      </TableCell>
                      <TableCell className="font-mono text-gray-900 dark:text-gray-100">
                        {formatPrice(trade.entry_price)}
                      </TableCell>
                      <TableCell className="font-mono text-gray-900 dark:text-gray-100">
                        {formatPrice(trade.exit_price)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-bold text-lg ${
                            (trade.pnl || 0) >= 0
                              ? "bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                              : "bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent"
                          }`}
                        >
                          {formatPnL(trade.pnl)}
                        </span>
                      </TableCell>
                      <TableCell>{getOutcomeBadge(trade.outcome)}</TableCell>
                      <TableCell className="font-mono text-gray-900 dark:text-gray-100 font-semibold">
                        {trade.risk_reward_ratio !== null && trade.risk_reward_ratio !== undefined ? (
                          <span className="text-gray-900 dark:text-gray-100">
                            {typeof trade.risk_reward_ratio === "number"
                              ? trade.risk_reward_ratio.toFixed(2)
                              : trade.risk_reward_ratio}
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400 font-normal">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            // FIX: Use openAdvisor properly
                            onClick={() => openAdvisor("Trade Analysis", "trade", trade)}
                            className="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110"
                            title="Get AI insights for this trade"
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                          >
                            <Link href={`/trade-details/${trade.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110"
                          >
                            <Link href={`/edit-trade/${trade.id}`}>
                              <Edit3 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-300 hover:scale-110"
                            onClick={() => handleDeleteClick(trade.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* FIX: Use advisorProps to spread all necessary props */}
      <AdvisorPanel {...advisorProps} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
