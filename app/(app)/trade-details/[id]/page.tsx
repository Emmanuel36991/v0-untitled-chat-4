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
  Lightbulb,
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
  Brain,
  Zap,
  CheckCircle2,
  XCircle,
  Maximize2,
  Share2,
  Download,
  MoreHorizontal,
  History,
  LayoutDashboard,
  ShieldCheck,
  Flame,
  Scale,
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

// --- Components ---

function MetricCard({ 
  label, 
  value, 
  subValue, 
  icon: Icon, 
  trend, 
  className 
}: { 
  label: string
  value: string
  subValue?: string
  icon: any
  trend?: "up" | "down" | "neutral"
  className?: string
}) {
  return (
    <div className={cn("bg-card/50 border border-border/50 rounded-xl p-4 hover:bg-card/80 transition-all group", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight tabular-nums">{value}</span>
        {subValue && (
          <span className={cn(
            "text-[10px] font-medium mt-0.5",
            trend === "up" && "text-emerald-500",
            trend === "down" && "text-rose-500",
            trend === "neutral" && "text-muted-foreground"
          )}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  )
}

function PsychologyTag({ label, type }: { label: string, type: "good" | "bad" }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium",
      type === "good" 
        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" 
        : "bg-rose-500/5 border-rose-500/20 text-rose-500"
    )}>
      {type === "good" ? <CheckCircle2 className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
      {label}
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-indigo-300/60 font-medium tracking-widest uppercase">Initializing Terminal...</p>
        </div>
      </div>
    )
  }

  if (error || !trade || !stats) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Terminal Error</h2>
          <p className="text-sm text-slate-400 mb-6">{error || "Trade data is unavailable."}</p>
          <Button onClick={() => router.push("/trades")} variant="outline" className="gap-2 border-slate-800 hover:bg-slate-900">
            <ArrowLeft className="w-4 h-4" /> Return to Database
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 selection:bg-indigo-500/30">
        
        {/* --- INSTITUTIONAL HEADER --- */}
        <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push("/trades")}
                className="text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="h-8 w-px bg-slate-800" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white">{trade.instrument}</h1>
                  <Badge className={cn(
                    "rounded-md text-[10px] font-black uppercase px-2 py-0.5",
                    trade.direction === "long" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  )}>
                    {trade.direction}
                  </Badge>
                  <Badge variant="outline" className="rounded-md text-[10px] font-mono border-slate-700 text-slate-400">
                    ID: {trade.id.slice(0, 8)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatTradeDate(trade.date)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(trade.trade_start_time)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={generateAnalysis} 
                disabled={aiLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white h-9 px-4 text-xs font-bold gap-2 shadow-lg shadow-indigo-500/20"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Neural Analysis
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => router.push(`/edit-trade/${trade.id}`)}
                className="border-slate-800 hover:bg-slate-900 h-9 w-9"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleDelete}
                className="border-slate-800 hover:bg-rose-500/10 hover:text-rose-500 h-9 w-9"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-8">
          
          {/* --- TOP GRID: P&L + CORE METRICS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* P&L HERO CARD */}
            <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 transition-all group-hover:opacity-40",
                stats.isProfit ? "bg-emerald-500" : "bg-rose-500"
              )} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Net Realized P&L</span>
              <div className="flex items-baseline gap-3">
                <h2 className={cn(
                  "text-6xl font-black tracking-tighter tabular-nums",
                  stats.isProfit ? "text-emerald-400" : "text-rose-400"
                )}>
                  {formatCurrency(stats.pnl)}
                </h2>
                <span className={cn(
                  "text-xl font-bold tabular-nums",
                  stats.isProfit ? "text-emerald-500/60" : "text-rose-500/60"
                )}>
                  {formatPercentage(stats.pnlPercentage)}
                </span>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Efficiency</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={stats.efficiencyScore} className="h-1.5 w-24 bg-slate-800" />
                    <span className="text-xs font-mono font-bold text-slate-300">{stats.efficiencyScore.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Risk:Reward</span>
                  <span className="text-sm font-mono font-bold text-indigo-400 mt-0.5">1:{stats.rrRatio.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* METRIC GRID */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard 
                label="Entry Price" 
                value={trade.entry_price.toFixed(2)} 
                icon={ArrowUpRight} 
                subValue="Execution Level"
              />
              <MetricCard 
                label="Exit Price" 
                value={trade.exit_price ? trade.exit_price.toFixed(2) : "---"} 
                icon={ArrowDownRight} 
                subValue={trade.exit_price ? "Realized Level" : "Active Trade"}
              />
              <MetricCard 
                label="Position Size" 
                value={trade.size.toString()} 
                icon={Scale} 
                subValue="Units/Lots"
              />
              <MetricCard 
                label="Duration" 
                value={stats.durationLabel} 
                icon={Timer} 
                subValue="Time in Market"
              />
              <MetricCard 
                label="Stop Loss" 
                value={trade.stop_loss ? trade.stop_loss.toFixed(2) : "---"} 
                icon={ShieldCheck} 
                subValue={trade.stop_loss ? `${((Math.abs(trade.entry_price - trade.stop_loss) / trade.entry_price) * 100).toFixed(2)}% Risk` : "No Protection"}
                className={trade.stop_loss ? "border-rose-500/20" : ""}
              />
              <MetricCard 
                label="Take Profit" 
                value={trade.take_profit ? trade.take_profit.toFixed(2) : "---"} 
                icon={Target} 
                subValue={trade.take_profit ? "Target Level" : "Discretionary"}
                className={trade.take_profit ? "border-emerald-500/20" : ""}
              />
              <MetricCard 
                label="Strategy" 
                value={trade.setup_name || "Uncategorized"} 
                icon={BookOpen} 
                subValue="Playbook Entry"
              />
              <MetricCard 
                label="Session" 
                value={trade.trade_session || "NY Open"} 
                icon={Activity} 
                subValue="Market Context"
              />
            </div>
          </div>

          {/* --- MIDDLE SECTION: CHART & ANALYSIS --- */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
            
            {/* CHART VIEW */}
            <div className="xl:col-span-8 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden h-[600px] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Market Execution Chart</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase text-slate-400 hover:text-white">
                      <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Fullscreen
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <TradingChart 
                    instrument={trade.instrument} 
                    trades={[trade]} 
                    className="h-full border-0 rounded-xl"
                  />
                </div>
              </div>

              {/* SCREENSHOTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <ImageIcon className="w-3 h-3" /> Entry Setup
                  </div>
                  <div className="aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative group cursor-zoom-in">
                    {trade.screenshot_before_url ? (
                      <Image 
                        src={trade.screenshot_before_url} 
                        alt="Entry Setup" 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-xs font-medium">No Entry Screenshot</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <ImageIcon className="w-3 h-3" /> Exit Result
                  </div>
                  <div className="aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative group cursor-zoom-in">
                    {trade.screenshot_after_url ? (
                      <Image 
                        src={trade.screenshot_after_url} 
                        alt="Exit Result" 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-xs font-medium">No Exit Screenshot</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR: PSYCHOLOGY & AI */}
            <div className="xl:col-span-4 space-y-8">
              
              {/* AI NEURAL INSIGHT */}
              <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <Zap className="w-5 h-5 text-indigo-500/30" />
                </div>
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Neural Insight
                </h3>
                <div className="space-y-4">
                  {aiLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      <p className="text-xs font-medium text-indigo-400/60 animate-pulse">Processing Market Data...</p>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="text-sm text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                      {aiAnalysis}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-500 mb-4">Run neural analysis to identify behavioral patterns and execution errors.</p>
                      <Button 
                        onClick={generateAnalysis}
                        variant="outline" 
                        className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 h-8 text-[10px] font-bold uppercase"
                      >
                        Initialize Analysis
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* BEHAVIORAL TAGS */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-400" /> Behavioral Intelligence
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Positive Habits</span>
                    <div className="flex flex-wrap gap-2">
                      {trade.good_habits && trade.good_habits.length > 0 ? (
                        trade.good_habits.map((h, i) => <PsychologyTag key={i} label={h} type="good" />)
                      ) : (
                        <span className="text-xs text-slate-600 italic">No positive habits logged</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Psychological Triggers</span>
                    <div className="flex flex-wrap gap-2">
                      {trade.psychology_factors && trade.psychology_factors.length > 0 ? (
                        trade.psychology_factors.map((f, i) => <PsychologyTag key={i} label={f} type="bad" />)
                      ) : (
                        <span className="text-xs text-slate-600 italic">No triggers identified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* TRADE NOTES */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-slate-400" /> Execution Notes
                </h3>
                <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 min-h-[150px]">
                  {trade.notes ? (
                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
                  ) : (
                    <p className="text-sm text-slate-600 italic">No notes recorded for this execution.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* --- BOTTOM SECTION: TIMELINE & CONTEXT --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* EXECUTION TIMELINE */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" /> Execution Timeline
              </h3>
              <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Entry Executed</span>
                    <p className="text-sm font-bold text-white mt-0.5">{trade.entry_price.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatTime(trade.trade_start_time)} • {formatTradeDate(trade.date)}</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exit Executed</span>
                    <p className="text-sm font-bold text-white mt-0.5">{trade.exit_price ? trade.exit_price.toFixed(2) : "---"}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{trade.trade_end_time ? formatTime(trade.trade_end_time) : "--:--"} • {trade.trade_end_time ? formatTimestamp(trade.trade_end_time) : "---"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTEXTUAL DATA */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-slate-400" /> Market Context
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Account</span>
                  <p className="text-sm font-bold text-slate-300">Main Portfolio</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Risk Amount</span>
                  <p className="text-sm font-bold text-rose-400">{formatCurrency(stats.risk)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Commission</span>
                  <p className="text-sm font-bold text-slate-300">$4.50</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tags</span>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-500">#HighConviction</Badge>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>

        {/* --- FLOATING ACTION BAR (MOBILE) --- */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl lg:hidden">
          <button className="text-slate-400 hover:text-white"><Share2 className="w-5 h-5" /></button>
          <button className="text-slate-400 hover:text-white"><Download className="w-5 h-5" /></button>
          <button className="text-slate-400 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
        </div>

      </div>
    </TooltipProvider>
  )
}

// --- Missing Icons ---
function PenLine(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}
