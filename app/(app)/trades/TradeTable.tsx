"use client"

import type React from "react"
import { useState, useTransition, useMemo, useEffect } from "react"
import type { Trade } from "@/types"
import { deleteTrade, updateTrade } from "@/app/actions/trade-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
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
import {
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  DollarSign,
  CalendarDays,
  Tag,
  BookOpen,
  BarChart3,
  FilterX,
  Zap,
  Activity,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Check,
  X,
  Search,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { TradeFilters } from "@/components/trades/advanced-trade-filters"
import { EnhancedPnLCell } from "@/components/trades/enhanced-pnl-cell"
import { PnLDisplaySelector } from "@/components/trades/pnl-display-selector"
import { usePnLDisplay } from "@/hooks/use-pnl-display"

interface TradeTableProps {
  initialTrades: Trade[]
  filters: TradeFilters
  onRefreshNeeded: () => Promise<void>
  isLoading: boolean
  viewMode?: "grid" | "list"
}

type SortField = "date" | "instrument" | "pnl" | "outcome" | "size"
type SortDirection = "asc" | "desc"

export function TradeTable({
  initialTrades,
  filters,
  onRefreshNeeded,
  isLoading: pageIsLoading,
  viewMode = "list",
}: TradeTableProps) {
  const [displayedTrades, setDisplayedTrades] = useState<Trade[]>(initialTrades)
  const { toast } = useToast()
  const [isPendingDelete, startDeleteTransition] = useTransition()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false)
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null)
  const { displayFormat, setDisplayFormat } = usePnLDisplay()

  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc") // Newest first by default
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Trade>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setDisplayedTrades(initialTrades)
  }, [initialTrades])

  const sortedAndFilteredTrades = useMemo(() => {
    if (!displayedTrades) return []

    let filtered = [...displayedTrades]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((trade) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          (trade.instrument || "").toLowerCase().includes(searchLower) ||
          (trade.setup_name || "").toLowerCase().includes(searchLower) ||
          (trade.notes || "").toLowerCase().includes(searchLower) ||
          (trade.outcome || "").toLowerCase().includes(searchLower)
        )
      })
    }

    // Apply existing filters
    if (Object.keys(filters).length > 0) {
      filtered = filtered.filter((trade) => {
        let passes = true
        if (filters.instrument && !(trade.instrument || "").toLowerCase().includes(filters.instrument.toLowerCase()))
          passes = false
        if (filters.outcome && filters.outcome !== "any" && trade.outcome !== filters.outcome) passes = false
        if (filters.setupName && !(trade.setup_name || "").toLowerCase().includes(filters.setupName.toLowerCase()))
          passes = false
        if (filters.dateRange?.from) {
          const tradeDate = new Date(trade.date)
          if (tradeDate < filters.dateRange.from) passes = false
          if (filters.dateRange.to && tradeDate > new Date(new Date(filters.dateRange.to).setHours(23, 59, 59, 999)))
            passes = false
        }
        if (filters.minPnl !== undefined && trade.pnl < filters.minPnl) passes = false
        if (filters.maxPnl !== undefined && trade.pnl > filters.maxPnl) passes = false
        if (filters.ictConcept && filters.ictConcept !== "any") {
          const tradeConcepts = [
            ...(trade.ict_entry_model || []),
            ...(trade.ict_liquidity_concepts || []),
            ...(trade.ict_market_structure || []),
            ...(trade.ict_market_structure_shift || []),
            ...(trade.ict_time_and_price || []),
            ...(trade.ict_bias_context || []),
            ...(trade.ict_liquidity_events || []),
            ...(trade.ict_fibonacci_levels || []),
            ...(trade.ict_price_action_patterns || []),
            ...(trade.ict_confluence || []),
          ].map((concept) => concept.toLowerCase())
          if (!tradeConcepts.includes(filters.ictConcept.toLowerCase())) passes = false
        }
        return passes
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "instrument":
          comparison = (a.instrument || "").localeCompare(b.instrument || "")
          break
        case "pnl":
          comparison = a.pnl - b.pnl
          break
        case "outcome":
          comparison = (a.outcome || "").localeCompare(b.outcome || "")
          break
        case "size":
          comparison = a.size - b.size
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [displayedTrades, filters, sortField, sortDirection, searchTerm])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const startEditing = (trade: Trade) => {
    setEditingRow(trade.id)
    setEditValues({
      instrument: trade.instrument,
      size: trade.size,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      setup_name: trade.setup_name,
      outcome: trade.outcome,
    })
  }

  const cancelEditing = () => {
    setEditingRow(null)
    setEditValues({})
  }

  const saveEditing = async (tradeId: string) => {
    setIsSaving(true)
    try {
      const result = await updateTrade(tradeId, editValues)
      if (result.success) {
        toast({
          title: "Trade Updated",
          description: "Trade has been successfully updated.",
          className: "bg-green-500 text-white",
        })
        await onRefreshNeeded()
        setEditingRow(null)
        setEditValues({})
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Could not update trade.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefreshNeeded()
    setIsRefreshing(false)
  }

  const handleRequestDelete = (tradeId: string) => {
    setTradeToDelete(tradeId)
    setIsConfirmDeleteDialogOpen(true)
  }

  const handleCancelDelete = () => {
    setTradeToDelete(null)
    setIsConfirmDeleteDialogOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!tradeToDelete) return

    startDeleteTransition(async () => {
      try {
        const result = await deleteTrade(tradeToDelete)
        if (result.success) {
          toast({
            title: "Trade Deleted",
            description: result.message || `Trade successfully removed.`,
            className: "bg-green-500 text-white",
          })
          await onRefreshNeeded()
        } else {
          toast({
            title: "Error Deleting Trade",
            description: result.message || `Could not delete trade. Please try again.`,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Critical Deletion Error",
          description: "An unexpected error occurred while deleting the trade.",
          variant: "destructive",
        })
      } finally {
        handleCancelDelete()
      }
    })
  }

  const getDirectionIcon = (direction: Trade["direction"]) => {
    if (direction === "long")
      return (
        <div className="p-1.5 bg-green-500 rounded-lg">
          <ArrowUpRight className="h-3.5 w-3.5 text-white" />
        </div>
      )
    return (
      <div className="p-1.5 bg-red-500 rounded-lg">
        <ArrowDownRight className="h-3.5 w-3.5 text-white" />
      </div>
    )
  }

  const formatPrice = (price: number | null | undefined, instrument: string) => {
    if (price === null || price === undefined) return "N/A"
    const isJpyPair = (instrument || "").toLowerCase().includes("jpy")
    return price.toFixed(isJpyPair ? 3 : 5)
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort(field)}>
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        {sortField === field ? (
          sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-30" />
        )}
      </div>
    </TableHead>
  )

  if (pageIsLoading && initialTrades.length === 0) {
    return (
      <Card className="bg-card border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Loading Trade Data</h3>
          <p className="text-muted-foreground">Retrieving your trading history...</p>
        </CardContent>
      </Card>
    )
  }

  if (sortedAndFilteredTrades.length === 0 && Object.keys(filters).length > 0 && !pageIsLoading) {
    return (
      <Card className="bg-card border-0 shadow-xl">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 bg-warning rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FilterX className="h-8 w-8 text-warning-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No Data Matches Filters</h3>
          <p className="text-muted-foreground mb-6">
            Adjust your filters or clear all parameters to view your trading data.
          </p>
          <Button onClick={() => onRefreshNeeded()} className="bg-primary hover:bg-primary/90">
            Reset Filters
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-foreground">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPendingDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {isPendingDelete ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Yes, Delete Trade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {viewMode === "grid" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Trade Matrix</h3>
                <p className="text-muted-foreground">Visual overview of your trades</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PnLDisplaySelector currentFormat={displayFormat} onFormatChange={setDisplayFormat} />
              <Button onClick={handleRefresh} disabled={isRefreshing || pageIsLoading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Sync
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredTrades.map((trade) => {
              const getOutcomeBadge = () => {
                if (!trade.outcome) return <Badge variant="outline">Not Set</Badge>

                switch (trade.outcome.toLowerCase()) {
                  case "win":
                    return <Badge className="bg-green-500 text-white">Win</Badge>
                  case "loss":
                    return <Badge className="bg-red-500 text-white">Loss</Badge>
                  case "breakeven":
                    return <Badge className="bg-amber-500 text-white">Breakeven</Badge>
                  default:
                    return <Badge variant="outline">{trade.outcome}</Badge>
                }
              }

              return (
                <Card
                  key={trade.id}
                  className="bg-card border shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getDirectionIcon(trade.direction)}
                        <div>
                          <span className="font-bold text-foreground text-lg">
                            {trade.instrument || <span className="text-muted-foreground italic">Not Set</span>}
                          </span>
                          <p className="text-sm text-muted-foreground capitalize">{trade.direction}</p>
                        </div>
                      </div>
                      {getOutcomeBadge()}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground font-medium">Entry</span>
                        <span className="font-mono font-bold text-foreground">
                          {formatPrice(trade.entry_price, trade.instrument)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground font-medium">Exit</span>
                        <span className="font-mono font-bold text-foreground">
                          {formatPrice(trade.exit_price, trade.instrument)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground font-medium">P&L</span>
                        <EnhancedPnLCell trade={trade} displayFormat={displayFormat} />
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground font-medium">Date</span>
                        <span className="font-medium text-foreground">{new Date(trade.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground font-medium">Size</span>
                        <span className="font-mono font-bold text-foreground">{trade.size}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground font-medium">Setup</span>
                        <span className="font-medium text-foreground">
                          {trade.setup_name || <span className="text-muted-foreground italic">Not Set</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/trade-details/${trade.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/edit-trade/${trade.id}`}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 bg-transparent"
                        onClick={() => handleRequestDelete(trade.id)}
                        disabled={isPendingDelete}
                      >
                        {isPendingDelete && tradeToDelete === trade.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <Card className="bg-card border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Trade Database
                    <span className="ml-2 text-lg text-accent">({sortedAndFilteredTrades.length})</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    {Object.keys(filters).length > 0 ? "Filtered data stream" : "Complete trading history"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search trades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <PnLDisplaySelector currentFormat={displayFormat} onFormatChange={setDisplayFormat} />
                <Button onClick={handleRefresh} disabled={isRefreshing || pageIsLoading} variant="outline">
                  <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing || pageIsLoading ? "animate-spin" : ""}`} />
                  {isRefreshing || pageIsLoading ? "Syncing..." : "Sync Data"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-b border-border">
                    <SortableHeader field="date">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>Date</span>
                      </div>
                    </SortableHeader>
                    <SortableHeader field="instrument">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4" />
                        <span>Instrument</span>
                      </div>
                    </SortableHeader>
                    <TableHead>Direction</TableHead>
                    <SortableHeader field="size">Size</SortableHeader>
                    <TableHead>Entry</TableHead>
                    <TableHead>Exit</TableHead>
                    <SortableHeader field="pnl">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>P&L ({displayFormat})</span>
                      </div>
                    </SortableHeader>
                    <SortableHeader field="outcome">Outcome</SortableHeader>
                    <TableHead>R:R</TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Setup</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAndFilteredTrades.map((trade) => {
                    const isEditing = editingRow === trade.id

                    return (
                      <TableRow
                        key={trade.id}
                        className="border-b border-border hover:bg-muted/50 transition-all duration-200"
                      >
                        <TableCell className="text-sm font-medium text-foreground">
                          {new Date(trade.date).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-sm">
                          {isEditing ? (
                            <Input
                              value={editValues.instrument || ""}
                              onChange={(e) => setEditValues({ ...editValues, instrument: e.target.value })}
                              className="w-32"
                              placeholder="Instrument"
                            />
                          ) : (
                            <Badge variant="outline" className="font-semibold">
                              {trade.instrument || "Not Set"}
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-sm">
                          <div className="flex items-center space-x-2">
                            {getDirectionIcon(trade.direction)}
                            <span className="ml-2 capitalize font-medium text-foreground">{trade.direction}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm font-mono font-bold text-foreground">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editValues.size || ""}
                              onChange={(e) => setEditValues({ ...editValues, size: Number(e.target.value) })}
                              className="w-24"
                            />
                          ) : (
                            trade.size
                          )}
                        </TableCell>

                        <TableCell className="text-sm font-mono font-bold text-foreground">
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.00001"
                              value={editValues.entry_price || ""}
                              onChange={(e) => setEditValues({ ...editValues, entry_price: Number(e.target.value) })}
                              className="w-32"
                            />
                          ) : (
                            formatPrice(trade.entry_price, trade.instrument)
                          )}
                        </TableCell>

                        <TableCell className="text-sm font-mono font-bold text-foreground">
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.00001"
                              value={editValues.exit_price || ""}
                              onChange={(e) => setEditValues({ ...editValues, exit_price: Number(e.target.value) })}
                              className="w-32"
                            />
                          ) : (
                            formatPrice(trade.exit_price, trade.instrument)
                          )}
                        </TableCell>

                        <TableCell className="text-sm">
                          <EnhancedPnLCell trade={trade} displayFormat={displayFormat} showMultipleFormats={true} />
                        </TableCell>

                        <TableCell className="text-sm">
                          {isEditing ? (
                            <Select
                              value={editValues.outcome || ""}
                              onValueChange={(value) =>
                                setEditValues({ ...editValues, outcome: value as Trade["outcome"] })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Outcome" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="win">Win</SelectItem>
                                <SelectItem value="loss">Loss</SelectItem>
                                <SelectItem value="breakeven">Breakeven</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <>
                              {!trade.outcome && <span className="text-muted-foreground italic text-xs">Not Set</span>}
                              {trade.outcome === "win" && (
                                <Badge className="bg-green-500 text-white font-semibold">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Win
                                </Badge>
                              )}
                              {trade.outcome === "loss" && (
                                <Badge className="bg-red-500 text-white font-semibold">
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                  Loss
                                </Badge>
                              )}
                              {trade.outcome === "breakeven" && (
                                <Badge className="bg-amber-500 text-white font-semibold">
                                  <MinusCircle className="h-3 w-3 mr-1" />
                                  Breakeven
                                </Badge>
                              )}
                            </>
                          )}
                        </TableCell>

                        <TableCell className="text-sm font-medium text-foreground">
                          {trade.risk_reward_ratio && trade.risk_reward_ratio !== 0 ? (
                            <span className="font-mono">{trade.risk_reward_ratio.toFixed(2)}</span>
                          ) : (
                            <span className="text-muted-foreground italic">N/A</span>
                          )}
                        </TableCell>

                        <TableCell className="text-sm">
                          {isEditing ? (
                            <Input
                              value={editValues.setup_name || ""}
                              onChange={(e) => setEditValues({ ...editValues, setup_name: e.target.value })}
                              className="w-32"
                              placeholder="Setup"
                            />
                          ) : (
                            <Badge variant="secondary" className="font-semibold">
                              {trade.setup_name || "Not Set"}
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => saveEditing(trade.id)}
                                  disabled={isSaving}
                                  className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                                >
                                  {isSaving ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEditing} disabled={isSaving}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button asChild size="sm" variant="outline">
                                  <Link href={`/trade-details/${trade.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => startEditing(trade)}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 bg-transparent"
                                  onClick={() => handleRequestDelete(trade.id)}
                                  disabled={isPendingDelete && tradeToDelete === trade.id}
                                >
                                  {isPendingDelete && tradeToDelete === trade.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {sortedAndFilteredTrades.length === 0 && Object.keys(filters).length === 0 && !pageIsLoading && (
              <div className="text-center py-20 px-6">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-primary rounded-3xl flex items-center justify-center shadow-2xl">
                    <BarChart3 className="h-12 w-12 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-3">Trade Database Empty</h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                  Start your trading journey by logging your first trade or importing historical data.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Button asChild className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg">
                    <Link href="/add-trade">
                      <Zap className="mr-3 h-6 w-6" /> Log First Trade
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
