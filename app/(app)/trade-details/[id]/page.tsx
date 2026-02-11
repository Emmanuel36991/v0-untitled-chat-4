"use client"

export const dynamic = "force-dynamic"

import React, { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
  Clock,
  Target,
  Activity,
  Calendar,
  Timer,
  Shield,
  AlertTriangle,
  TrendingDown,
  MinusCircle,
  Info,
  BookOpen,
  Sparkles,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Image as ImageIcon,
  ChevronRight,
  CircleDot,
  Crosshair,
  DollarSign,
  BarChart3,
  Gauge,
} from "lucide-react"
import TradingChart from "@/components/trading-chart"
import { getTradeById, deleteTrade } from "@/app/actions/trade-actions"
import type { Trade } from "@/types"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

// --- Helper Functions ---

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

const formatPercentage = (value: number): string => {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
}

// For date-only strings like "2026-02-10" from the trade.date field
const formatTradeDate = (dateOnlyString?: string): string => {
  if (!dateOnlyString) return "N/A"
  try {
    const d = new Date(dateOnlyString + "T12:00:00")
    if (isNaN(d.getTime())) return "Invalid Date"
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "Invalid Date"
  }
}

// For full ISO timestamps from DB
const formatTimestamp = (dateString?: string | null): string => {
  if (!dateString) return "N/A"
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return "N/A"
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return "N/A"
  }
}

const formatTime = (dateString?: string | null): string => {
  if (!dateString) return "--:--"
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return "--:--"
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return "--:--"
  }
}

const calculateDuration = (entryTime?: string | null, exitTime?: string | null): string => {
  if (!entryTime || !exitTime) return "Open"
  try {
    const entry = new Date(entryTime)
    const exit = new Date(exitTime)
    const diffMs = exit.getTime() - entry.getTime()
    if (diffMs < 0) return "Invalid"
    const totalSeconds = Math.floor(diffMs / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  } catch {
    return "Error"
  }
}

// --- Markdown Renderer ---
const SimpleMarkdown = ({ content }: { content: string }) => {
  if (!content) return null
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let currentList: React.ReactNode[] = []
  let inList = false

  const flushList = () => {
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1 mb-3 text-foreground/80">
          {currentList}
        </ul>
      )
      currentList = []
      inList = false
    }
  }

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) { flushList(); return }
    if (trimmed.startsWith("## ")) {
      flushList()
      elements.push(<h3 key={i} className="text-base font-bold text-foreground mt-5 mb-2">{trimmed.replace(/^##\s+/, "")}</h3>)
    } else if (trimmed.startsWith("### ") || (trimmed.startsWith("**") && trimmed.endsWith("**") && trimmed.length < 50)) {
      flushList()
      const text = trimmed.replace(/^###\s+/, "").replace(/^\*\*/, "").replace(/\*\*$/, "")
      elements.push(<h4 key={i} className="text-sm font-bold text-foreground mt-4 mb-1.5">{text}</h4>)
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true
      currentList.push(<li key={i} className="leading-relaxed text-sm">{parseInline(trimmed.replace(/^[-*]\s+/, ""))}</li>)
    } else {
      flushList()
      elements.push(<p key={i} className="mb-2 text-sm text-foreground/80 leading-relaxed">{parseInline(trimmed)}</p>)
    }
  })
  flushList()
  return <div>{elements}</div>
}

// --- Stat Card ---
function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  variant = "default",
  className,
}: {
  label: string
  value: React.ReactNode
  subValue?: React.ReactNode
  icon: React.ElementType
  variant?: "profit" | "loss" | "default"
  className?: string
}) {
  return (
    <div className={cn(
      "relative rounded-xl border p-5 transition-colors",
      variant === "profit" && "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20",
      variant === "loss" && "border-red-200 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/20",
      variant === "default" && "border-border bg-card",
      className,
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg",
          variant === "profit" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
          variant === "loss" && "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
          variant === "default" && "bg-muted text-muted-foreground",
        )}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="space-y-1">
        <div className={cn(
          "text-2xl font-bold tracking-tight tabular-nums",
          variant === "profit" && "text-emerald-700 dark:text-emerald-400",
          variant === "loss" && "text-red-700 dark:text-red-400",
          variant === "default" && "text-foreground",
        )}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-muted-foreground">{subValue}</div>
        )}
      </div>
    </div>
  )
}

// --- Price Row ---
function PriceRow({
  label,
  value,
  icon: Icon,
  color = "default",
}: {
  label: string
  value: string
  icon: React.ElementType
  color?: "default" | "red" | "green"
}) {
  return (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center",
          color === "red" && "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400",
          color === "green" && "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400",
          color === "default" && "bg-muted text-muted-foreground",
        )}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <span className={cn(
        "font-mono text-sm font-semibold tabular-nums",
        color === "red" && "text-red-600 dark:text-red-400",
        color === "green" && "text-emerald-600 dark:text-emerald-400",
        color === "default" && "text-foreground",
      )}>
        {value}
      </span>
    </div>
  )
}

// --- Timeline Node ---
function TimelineNode({
  label,
  date,
  time,
  isActive = false,
  isLast = false,
  color = "default",
}: {
  label: string
  date: string
  time: string
  isActive?: boolean
  isLast?: boolean
  color?: "entry" | "exit" | "default"
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-3 h-3 rounded-full border-2 z-10",
          color === "entry" && "border-indigo-500 bg-indigo-500 dark:border-indigo-400 dark:bg-indigo-400",
          color === "exit" && "border-slate-400 bg-slate-400 dark:border-slate-500 dark:bg-slate-500",
          color === "default" && "border-muted-foreground bg-muted-foreground",
          isActive && "border-emerald-500 bg-emerald-500 animate-pulse",
        )} />
        {!isLast && (
          <div className="w-px flex-1 bg-border min-h-[40px]" />
        )}
      </div>
      <div className="pb-6">
        <p className={cn(
          "text-[10px] font-bold uppercase tracking-widest mb-1",
          color === "entry" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground",
        )}>
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{date}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">{time}</span>
        </div>
      </div>
    </div>
  )
}

// --- Main Page Component ---

export default function TradeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const tradeId = params.id as string

  const [trade, setTrade] = useState<Trade | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState("")

  useEffect(() => {
    const loadTrade = async () => {
      try {
        setIsLoading(true)
        setError(null)
        if (!tradeId) throw new Error("Trade ID is required")
        const tradeData = await getTradeById(tradeId)
        if (!tradeData) throw new Error("Trade not found")
        setTrade(tradeData)
      } catch (err: any) {
        console.error("Error loading trade:", err)
        setError(err.message || "Failed to load trade details")
      } finally {
        setIsLoading(false)
      }
    }
    loadTrade()
  }, [tradeId])

  const generateAnalysis = async () => {
    if (!trade) return
    setAiLoading(true)
    setAiAnalysis("")
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "trade", data: trade }),
      })
      if (!response.ok) throw new Error("Analysis failed")
      if (!response.body) return
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.substring(6))
              const content = json.choices?.[0]?.delta?.content || ""
              setAiAnalysis((prev) => prev + content)
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error("AI Error", error)
    } finally {
      setAiLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!trade || !confirm("Are you sure you want to delete this trade?")) return
    try {
      setIsDeleting(true)
      await deleteTrade(trade.id)
      router.refresh()
      router.push("/trades")
    } catch {
      alert("Failed to delete trade")
    } finally {
      setIsDeleting(false)
    }
  }

  const stats = useMemo(() => {
    if (!trade) return null
    const calculatedPnL = trade.pnl ?? (
      trade.exit_price && trade.entry_price
        ? (trade.exit_price - trade.entry_price) * (trade.size || 1) * (trade.direction === "long" ? 1 : -1)
        : 0
    )
    const isProfit = calculatedPnL > 0
    const isLoss = calculatedPnL < 0
    const pnlPercentage = trade.entry_price && trade.exit_price
      ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100 * (trade.direction === "long" ? 1 : -1)
      : 0
    const riskPerShare = trade.stop_loss ? Math.abs(trade.entry_price - trade.stop_loss) : 0
    const totalRisk = riskPerShare * (trade.size || 1)
    const rewardPerShare = trade.exit_price ? Math.abs(trade.exit_price - trade.entry_price) : 0
    const rrRatio = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0
    const efficiencyScore = Math.min(Math.max(rrRatio * 20, 0), 100)
    const durationLabel = calculateDuration(trade.trade_start_time || trade.date, trade.trade_end_time)
    const status: "CLOSED" | "OPEN" = trade.trade_end_time || trade.exit_price ? "CLOSED" : "OPEN"
    return {
      pnl: calculatedPnL, pnlPercentage, isProfit, isLoss,
      risk: totalRisk, rrRatio, efficiencyScore, durationLabel, status,
    }
  }, [trade])

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading trade...</p>
        </div>
      </div>
    )
  }

  // --- Error State ---
  if (error || !trade || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Unable to Load Trade</h2>
          <p className="text-sm text-muted-foreground mb-6">{error || "Trade data is unavailable."}</p>
          <Button onClick={() => router.push("/trades")} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to Trades
          </Button>
        </div>
      </div>
    )
  }

  const entryTime = formatTime(trade.trade_start_time)
  const exitTime = formatTime(trade.trade_end_time)
  const entryDateDisplay = formatTradeDate(trade.date)
  const exitDateDisplay = trade.trade_end_time ? formatTimestamp(trade.trade_end_time) : null

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background pb-16">

        {/* ---- STICKY HEADER ---- */}
        <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">

              {/* Left: Back + Trade Identity */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/trades")}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Back to trades"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-bold text-foreground tracking-tight">{trade.instrument}</h1>
                      <Badge
                        variant={trade.direction === "long" ? "default" : "destructive"}
                        className="rounded-md text-[10px] font-bold uppercase px-2 py-0"
                      >
                        {trade.direction === "long" ? (
                          <><ArrowUpRight className="w-3 h-3 mr-0.5" />Long</>
                        ) : (
                          <><ArrowDownRight className="w-3 h-3 mr-0.5" />Short</>
                        )}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-md text-[10px] font-mono px-2 py-0",
                          stats.status === "OPEN" && "border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20",
                        )}
                      >
                        {stats.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{entryDateDisplay}</span>
                      <span className="text-muted-foreground/40 mx-0.5">|</span>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground">{entryTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={generateAnalysis}
                  disabled={aiLoading}
                  size="sm"
                  className="hidden sm:flex bg-primary text-primary-foreground gap-1.5 h-8 text-xs font-semibold"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Analyze
                </Button>
                <Button
                  onClick={() => router.push(`/edit-trade/${trade.id}`)}
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* ---- MAIN CONTENT ---- */}
        <main className="mx-auto max-w-[1400px] px-4 sm:px-6 pt-6">

          {/* --- P&L HERO STRIP --- */}
          <div className="flex flex-wrap items-center gap-4 mb-6 px-1">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-3xl sm:text-4xl font-bold tracking-tight tabular-nums",
                stats.isProfit ? "text-emerald-600 dark:text-emerald-400" : stats.isLoss ? "text-red-600 dark:text-red-400" : "text-foreground",
              )}>
                {stats.isProfit ? "+" : ""}{formatCurrency(stats.pnl)}
              </span>
              <Badge variant="secondary" className={cn(
                "text-xs font-mono tabular-nums",
                stats.isProfit ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                stats.isLoss ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" : "",
              )}>
                {formatPercentage(stats.pnlPercentage)}
              </Badge>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>R:R <strong className="text-foreground font-semibold">1:{stats.rrRatio.toFixed(1)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Size <strong className="text-foreground font-semibold">{trade.size?.toLocaleString() || "1"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" />
                <span>Duration <strong className="text-foreground font-semibold">{stats.durationLabel}</strong></span>
              </div>
            </div>
          </div>

          {/* --- AI ANALYSIS (conditionally rendered) --- */}
          <AnimatePresence>
            {(aiAnalysis || aiLoading) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">AI Trade Analysis</span>
                  </div>
                  {aiLoading && !aiAnalysis ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing execution quality...
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <SimpleMarkdown content={aiAnalysis} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- MAIN GRID --- */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* === LEFT: Chart + Analysis === */}
            <div className="xl:col-span-8 space-y-6">

              {/* Chart */}
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="h-[460px] sm:h-[500px]">
                  <TradingChart
                    instrument={trade.instrument}
                    trades={[trade]}
                    tradeDate={trade.trade_start_time || trade.date}
                    timeframe="15m"
                  />
                </div>
              </div>

              {/* Execution Metrics Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                  label="Net P&L"
                  value={`${stats.isProfit ? "+" : ""}${formatCurrency(stats.pnl)}`}
                  subValue={<Badge variant="secondary" className={cn(
                    "text-[10px] font-mono",
                    stats.isProfit ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    stats.isLoss ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "",
                  )}>{formatPercentage(stats.pnlPercentage)} return</Badge>}
                  icon={stats.isProfit ? TrendingUp : stats.isLoss ? TrendingDown : MinusCircle}
                  variant={stats.isProfit ? "profit" : stats.isLoss ? "loss" : "default"}
                />
                <StatCard
                  label="Risk : Reward"
                  value={`1:${stats.rrRatio.toFixed(2)}`}
                  subValue={
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={Math.min(stats.rrRatio * 33, 100)} className="h-1 flex-1 bg-muted" />
                      <span className="text-[10px] font-mono text-muted-foreground">{Math.min(stats.rrRatio * 33, 100).toFixed(0)}%</span>
                    </div>
                  }
                  icon={Gauge}
                />
                <StatCard
                  label="Position"
                  value={`${trade.size?.toLocaleString() || "1"}`}
                  subValue={`Notional: ${formatCurrency(trade.entry_price * (trade.size || 1))}`}
                  icon={Activity}
                />
                <StatCard
                  label="Duration"
                  value={stats.durationLabel}
                  subValue={stats.status === "OPEN" ? "Trade is active" : `Closed ${exitTime}`}
                  icon={Timer}
                />
              </div>

              {/* Trade Health */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Trade Health</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">Risk vs Capital</span>
                      <span className="text-xs font-mono text-muted-foreground">{formatCurrency(stats.risk)}</span>
                    </div>
                    <Progress value={Math.min((stats.risk / 50000) * 100, 100)} className="h-2" />
                    <p className="text-[11px] text-muted-foreground mt-1.5">Based on $50k account</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">Execution Quality</span>
                      <span className={cn(
                        "text-xs font-mono font-semibold",
                        stats.efficiencyScore >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                      )}>{stats.efficiencyScore.toFixed(0)}/100</span>
                    </div>
                    <Progress value={stats.efficiencyScore} className="h-2" />
                    <p className="text-[11px] text-muted-foreground mt-1.5">Based on R:R efficiency</p>
                  </div>
                </div>
              </div>

              {/* Notes + Screenshots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notes */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Journal Notes</h3>
                  </div>
                  <div className="p-5">
                    {trade.notes ? (
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{trade.notes}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No notes added for this trade.</p>
                    )}
                  </div>
                </div>

                {/* Screenshots */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Screenshots</h3>
                  </div>
                  <div className="p-5">
                    {trade.screenshot_before_url || trade.screenshot_after_url ? (
                      <div className="grid grid-cols-2 gap-3">
                        {trade.screenshot_before_url && (
                          <a href={trade.screenshot_before_url} target="_blank" rel="noreferrer" className="block relative aspect-video rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity">
                            <Image src={trade.screenshot_before_url} alt="Before trade" fill className="object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 text-center backdrop-blur-sm font-medium">Before</div>
                          </a>
                        )}
                        {trade.screenshot_after_url && (
                          <a href={trade.screenshot_after_url} target="_blank" rel="noreferrer" className="block relative aspect-video rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity">
                            <Image src={trade.screenshot_after_url} alt="After trade" fill className="object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 text-center backdrop-blur-sm font-medium">After</div>
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No screenshots attached.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* === RIGHT SIDEBAR === */}
            <div className="xl:col-span-4 space-y-6">

              {/* Execution Ledger */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
                  <Crosshair className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Execution Ledger</h3>
                </div>
                <div className="px-5 divide-y divide-border">
                  <PriceRow label="Entry Price" value={formatCurrency(trade.entry_price)} icon={CircleDot} />
                  <PriceRow label="Exit Price" value={trade.exit_price ? formatCurrency(trade.exit_price) : "--" } icon={Target} />
                  <PriceRow label="Stop Loss" value={trade.stop_loss ? formatCurrency(trade.stop_loss) : "None"} icon={Shield} color="red" />
                  <PriceRow label="Take Profit" value={trade.take_profit ? formatCurrency(trade.take_profit) : "None"} icon={DollarSign} color="green" />
                </div>

                {/* Price spread visualization */}
                {trade.stop_loss && trade.take_profit && (
                  <div className="px-5 pb-4 pt-2">
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      {(() => {
                        const low = Math.min(trade.stop_loss, trade.entry_price, trade.exit_price || trade.entry_price, trade.take_profit)
                        const high = Math.max(trade.stop_loss, trade.entry_price, trade.exit_price || trade.entry_price, trade.take_profit)
                        const range = high - low || 1
                        const entryPct = ((trade.entry_price - low) / range) * 100
                        const exitPct = trade.exit_price ? ((trade.exit_price - low) / range) * 100 : entryPct
                        return (
                          <>
                            <div className="absolute top-0 h-full bg-red-400/30 rounded-l-full" style={{ left: 0, width: `${((trade.stop_loss - low) / range) * 100}%` }} />
                            <div className="absolute top-0 h-full bg-emerald-400/30 rounded-r-full" style={{ left: `${((trade.take_profit - low) / range) * 100}%`, right: 0 }} />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-card shadow-sm cursor-pointer" style={{ left: `${entryPct}%` }} />
                              </TooltipTrigger>
                              <TooltipContent>Entry: {formatCurrency(trade.entry_price)}</TooltipContent>
                            </Tooltip>
                            {trade.exit_price && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-card shadow-sm cursor-pointer",
                                    stats.isProfit ? "bg-emerald-500" : "bg-red-500",
                                  )} style={{ left: `${exitPct}%` }} />
                                </TooltipTrigger>
                                <TooltipContent>Exit: {formatCurrency(trade.exit_price)}</TooltipContent>
                              </Tooltip>
                            )}
                          </>
                        )
                      })()}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] font-mono text-red-500">SL</span>
                      <span className="text-[10px] font-mono text-emerald-500">TP</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Trade Timeline */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timeline</h3>
                </div>
                <div className="p-5">
                  <TimelineNode
                    label="Entry"
                    date={entryDateDisplay}
                    time={entryTime}
                    color="entry"
                  />
                  {trade.trade_end_time ? (
                    <TimelineNode
                      label="Exit"
                      date={exitDateDisplay || "N/A"}
                      time={exitTime}
                      color="exit"
                      isLast
                    />
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-500 animate-pulse z-10" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Active</p>
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 italic">Trade is open</p>
                      </div>
                    </div>
                  )}

                  {/* Duration summary */}
                  {trade.trade_end_time && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">Total Duration</span>
                        <span className="text-sm font-bold font-mono text-foreground">{stats.durationLabel}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Strategy / Setup Info */}
              {(trade.setup_name || trade.playbook_strategy_id) && (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Strategy</h3>
                  </div>
                  <div className="p-5">
                    {trade.setup_name && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{trade.setup_name}</Badge>
                      </div>
                    )}
                    {trade.playbook_strategy_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between mt-2 text-xs h-8 text-muted-foreground hover:text-foreground"
                        onClick={() => router.push(`/playbook`)}
                      >
                        View in Playbook
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Psychology Factors */}
              {(trade.psychology_factors?.length || trade.good_habits?.length) ? (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Psychology</h3>
                  </div>
                  <div className="p-5 space-y-3">
                    {trade.good_habits && trade.good_habits.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2">Good Habits</p>
                        <div className="flex flex-wrap gap-1.5">
                          {trade.good_habits.map((h) => (
                            <Badge key={h} variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30">{h}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {trade.psychology_factors && trade.psychology_factors.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400 mb-2">Factors</p>
                        <div className="flex flex-wrap gap-1.5">
                          {trade.psychology_factors.map((f) => (
                            <Badge key={f} variant="secondary" className="text-[10px] bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/50 dark:border-red-800/30">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
