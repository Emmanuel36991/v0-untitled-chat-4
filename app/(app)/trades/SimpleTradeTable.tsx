"use client"

import type { Trade } from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit3, Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Database, PlusCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
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
import { EmptyState } from "@/components/empty-state"
import { StorageIcon } from "@/components/icons/system-icons"

interface SimpleTradeTableProps {
  trades: Trade[]
  onRefresh: () => void
  highlightTradeId?: string
}

const tableRowBaseClass =
  "hover:bg-muted/50 transition-colors border-l-4 border-l-transparent data-[state=selected]:bg-muted"

export function SimpleTradeTable({ trades, onRefresh, highlightTradeId }: SimpleTradeTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [highlightDone, setHighlightDone] = useState(false)
  const highlightedRowRef = useRef<HTMLTableRowElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const isHighlightActive = Boolean(highlightTradeId && !highlightDone)

  // Scroll new trade into view and clear highlight + URL after animation
  useEffect(() => {
    if (!highlightTradeId) return
    const el = highlightedRowRef.current
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
    const t = setTimeout(() => {
      setHighlightDone(true)
      router.replace("/trades", { scroll: false })
    }, 2200)
    return () => clearTimeout(t)
  }, [highlightTradeId, router])

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
        <Badge variant="secondary" className="badge-animated text-muted-foreground border border-border">
          N/A
        </Badge>
      )
    }

    switch (outcome.toLowerCase()) {
      case "win":
        return (
          <Badge className="badge-animated bg-success/15 text-success border border-success/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            Win
          </Badge>
        )
      case "loss":
        return (
          <Badge className="badge-animated bg-destructive/15 text-destructive border border-destructive/20">
            <TrendingDown className="h-3 w-3 mr-1" />
            Loss
          </Badge>
        )
      case "breakeven":
        return (
          <Badge className="badge-animated bg-warning/15 text-warning border border-warning/20">
            Breakeven
          </Badge>
        )
      default:
        return (
          <Badge className="badge-animated bg-primary/15 text-primary border border-primary/20">
            {outcome}
          </Badge>
        )
    }
  }

  const getDirectionIcon = (direction: string) => {
    if (direction === "long") {
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-success/15 rounded-lg">
            <ArrowUpRight className="h-4 w-4 text-success" />
          </div>
          <span className="capitalize font-medium text-success">
            Long
          </span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-destructive/15 rounded-lg">
          <ArrowDownRight className="h-4 w-4 text-destructive" />
        </div>
        <span className="capitalize font-medium text-destructive">
          Short
        </span>
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <Card className="border-2 border-dashed border-border bg-card">
        <CardContent className="py-20">
          <EmptyState
            icon={Database}
            title="No trades yet"
            description="Start tracking your trading journey today!"
            action={{
              label: "Add Your First Trade",
              href: "/add-trade",
              variant: "default",
            }}
            className="animate-fade-in-up"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="shadow-lg border-border bg-card relative overflow-hidden">
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <StorageIcon size={24} className="text-primary-foreground drop-shadow-md" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">
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
                <TableRow className="border-b-2 border-border">
                  <TableHead className="font-bold text-foreground">DATE</TableHead>
                  <TableHead className="font-bold text-foreground">INSTRUMENT</TableHead>
                  <TableHead className="font-bold text-foreground">DIRECTION</TableHead>
                  <TableHead className="font-bold text-foreground">SIZE</TableHead>
                  <TableHead className="font-bold text-foreground">ENTRY</TableHead>
                  <TableHead className="font-bold text-foreground">EXIT</TableHead>
                  <TableHead className="font-bold text-foreground">P&L (DOLLARS)</TableHead>
                  <TableHead className="font-bold text-foreground">OUTCOME</TableHead>
                  <TableHead className="font-bold text-foreground">R:R</TableHead>
                  <TableHead className="text-right font-bold text-foreground">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade, index) => {
                  const isWin = trade.outcome === "win"
                  const isLoss = trade.outcome === "loss"
                  const isNewTrade = highlightTradeId === trade.id

                  const rowContent = (
                    <>
                      <TableCell className="font-medium text-foreground font-mono">
                        {new Date(trade.date).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {trade.instrument || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getDirectionIcon(trade.direction)}</TableCell>
                      <TableCell className="font-mono font-semibold text-foreground">
                        {trade.size}
                      </TableCell>
                      <TableCell className="font-mono text-foreground">
                        {formatPrice(trade.entry_price)}
                      </TableCell>
                      <TableCell className="font-mono text-foreground">
                        {formatPrice(trade.exit_price)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-mono font-bold text-lg ${(trade.pnl || 0) >= 0 ? "text-success" : "text-destructive"
                            }`}
                        >
                          {formatPnL(trade.pnl)}
                        </span>
                      </TableCell>
                      <TableCell>{getOutcomeBadge(trade.outcome)}</TableCell>
                      <TableCell className="font-mono text-foreground font-semibold">
                        {trade.risk_reward_ratio !== null && trade.risk_reward_ratio !== undefined ? (
                          <span className="text-foreground">
                            {!isNaN(Number(trade.risk_reward_ratio)) && trade.risk_reward_ratio !== ""
                              ? Number(trade.risk_reward_ratio).toFixed(2)
                              : trade.risk_reward_ratio}
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-normal">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openAdvisor("Trade Analysis", "trade", trade)}
                            className="hover:bg-muted hover:text-foreground"
                            title="AI analysis for this trade"
                          >
                            <Sparkles className="h-4 w-4 text-amber-400" />
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="hover:bg-muted hover:text-foreground"
                          >
                            <Link href={`/trade-details/${trade.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="hover:bg-muted hover:text-foreground"
                          >
                            <Link href={`/edit-trade/${trade.id}`}>
                              <Edit3 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-destructive/10 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(trade.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )

                  if (isNewTrade) {
                    return (
                      <motion.tr
                        key={trade.id}
                        ref={highlightedRowRef}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          backgroundColor: isHighlightActive ? "rgba(16, 185, 129, 0.14)" : "transparent",
                          borderLeftColor: isHighlightActive ? "rgb(16, 185, 129)" : "transparent",
                        }}
                        transition={{
                          opacity: { duration: 0.35 },
                          x: { type: "spring", stiffness: 400, damping: 30 },
                          backgroundColor: { delay: 0.35, duration: 1.2 },
                          borderLeftColor: { delay: 0.35, duration: 1.2 },
                        }}
                        className={tableRowBaseClass + " border-l-4"}
                      >
                        {rowContent}
                      </motion.tr>
                    )
                  }

                  return (
                    <TableRow key={trade.id} className={tableRowBaseClass}>
                      {rowContent}
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
