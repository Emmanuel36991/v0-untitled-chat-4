"use client"

export const dynamic = "force-dynamic"

import React, { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Zap,
  Shield,
  Share2,
  Download,
  AlertTriangle,
  MinusCircle,
  TrendingDown,
  Maximize2,
  RefreshCw,
  Info,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  Image as ImageIcon
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

const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A"
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (e) {
    return "Invalid Date"
  }
}

const formatTime = (dateString?: string): string => {
  if (!dateString) return "--:--"
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return "--:--"
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch (e) {
    return "--:--"
  }
}

const calculateDuration = (entryTime?: string, exitTime?: string): string => {
  if (!entryTime || !exitTime) return "Open Trade"

  try {
    const entry = new Date(entryTime)
    const exit = new Date(exitTime)
    const diffMs = exit.getTime() - entry.getTime()

    if (diffMs < 0) return "Invalid Times"

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  } catch (e) {
    return "Error"
  }
}

// --- Simple Markdown Component ---
const SimpleMarkdown = ({ content }: { content: string }) => {
  if (!content) return null

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  
  let currentList: React.ReactNode[] = []
  let inList = false

  const flushList = () => {
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1 mb-4 text-slate-700 dark:text-slate-300">
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
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-indigo-900 dark:text-indigo-100">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      return
    }

    if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(<h3 key={i} className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-2">{trimmed.replace(/^##\s+/, '')}</h3>)
    } else if (trimmed.startsWith('### ') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 50)) {
      flushList()
      const text = trimmed.replace(/^###\s+/, '').replace(/^\*\*/, '').replace(/\*\*$/, '')
      elements.push(<h4 key={i} className="text-base font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">{text}</h4>)
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true
      currentList.push(<li key={i} className="leading-relaxed text-sm">{parseInline(trimmed.replace(/^[-*]\s+/, ''))}</li>)
    } else {
      flushList()
      elements.push(<p key={i} className="mb-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{parseInline(trimmed)}</p>)
    }
  })

  flushList()
  return <div>{elements}</div>
}

// --- Main Page Component ---

export default function EnhancedTradeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const tradeId = params.id as string

  // State
  const [trade, setTrade] = useState<Trade | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // UI State
  const [isChartFullscreen, setIsChartFullscreen] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    analysis: true,
  })

  // AI State
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState("")

  // --- Load Trade Data ---
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

  // --- Actions ---
  const generateAnalysis = async () => {
    if (!trade) return
    setAiLoading(true)
    setAiAnalysis("")
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "trade", data: trade })
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
                    setAiAnalysis(prev => prev + content)
                } catch (e) {}
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
  } catch (err) {
  alert("Failed to delete trade")
  } finally {
  setIsDeleting(false)
  }
  }

  // --- Derived Calculations (Robust) ---
  const stats = useMemo(() => {
    if (!trade) return null

    // Fallback if PnL is not stored
    const calculatedPnL = trade.pnl ?? (
       (trade.exit_price && trade.entry_price) 
       ? (trade.exit_price - trade.entry_price) * (trade.size || 1) * (trade.direction === 'long' ? 1 : -1)
       : 0
    )

    const isProfit = calculatedPnL > 0
    const isLoss = calculatedPnL < 0
    
    // Percentage Return
    const pnlPercentage = trade.entry_price && trade.exit_price
       ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100 * (trade.direction === 'long' ? 1 : -1)
       : 0

    // Risk Calculation
    const riskPerShare = trade.stop_loss ? Math.abs(trade.entry_price - trade.stop_loss) : 0
    const totalRisk = riskPerShare * (trade.size || 1)
    
    // Reward Calculation
    const rewardPerShare = trade.exit_price ? Math.abs(trade.exit_price - trade.entry_price) : 0
    
    // R:R Ratio
    const rrRatio = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0
    
    // Efficiency (Simple metric: how much of the move did we capture vs risk)
    const efficiencyScore = Math.min(Math.max(rrRatio * 20, 0), 100)

    // Duration
    const durationLabel = calculateDuration(trade.trade_start_time || trade.date, trade.trade_end_time)

    return {
        pnl: calculatedPnL,
        pnlPercentage,
        isProfit,
        isLoss,
        risk: totalRisk,
        reward: calculatedPnL, // Realized reward
        rrRatio,
        efficiencyScore,
        durationLabel,
        status: trade.trade_end_time || trade.exit_price ? "CLOSED" : "OPEN"
    }
  }, [trade])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading trade data...</p>
        </div>
      </div>
    )
  }

  if (error || !trade || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-100 shadow-lg">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Trade</h2>
            <p className="text-slate-500 mb-6">{error || "Trade data is unavailable."}</p>
            <Button onClick={() => router.push("/trades")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Trades
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        
        {/* --- HEADER --- */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30 supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <Button onClick={() => router.push("/trades")} variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{trade.instrument}</h1>
                    <Badge variant={trade.direction === 'long' ? "default" : "destructive"} className="rounded-md px-2.5 font-mono font-medium uppercase">
                      {trade.direction}
                    </Badge>
                    <Badge variant={stats.status === "CLOSED" ? "secondary" : "outline"} className="rounded-md px-2.5 font-mono text-xs text-slate-500">
                      {stats.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(trade.date)}</span>
                    <span className="text-slate-300">•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(trade.trade_start_time || trade.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Button onClick={generateAnalysis} disabled={aiLoading} className="hidden sm:flex bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all mr-2">
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                    Analyze Trade
                </Button>
                <Button onClick={() => router.push(`/edit-trade/${trade.id}`)} variant="outline" size="sm" className="h-9">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button onClick={handleDelete} variant="ghost" size="sm" className="h-9 text-red-600 hover:bg-red-50" disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>

            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* --- KPI CARDS (Dynamic Data) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            {/* 1. Net P&L */}
            <Card className={cn("border shadow-sm overflow-hidden", stats.isProfit ? "border-emerald-200 bg-emerald-50/30" : stats.isLoss ? "border-red-200 bg-red-50/30" : "border-slate-200")}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Net P&L</p>
                  <div className={cn("p-1.5 rounded-full", stats.isProfit ? "bg-emerald-100 text-emerald-600" : stats.isLoss ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600")}>
                    {stats.isProfit ? <TrendingUp className="w-4 h-4" /> : stats.isLoss ? <TrendingDown className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-3xl font-bold tracking-tight tabular-nums", stats.isProfit ? "text-emerald-700" : stats.isLoss ? "text-red-700" : "text-slate-700")}>
                    {stats.isProfit ? "+" : ""}{formatCurrency(stats.pnl)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className={cn("text-xs font-mono", stats.isProfit ? "bg-emerald-100 text-emerald-700" : stats.isLoss ? "bg-red-100 text-red-700" : "")}>
                    {formatPercentage(stats.pnlPercentage)}
                  </Badge>
                  <span className="text-xs text-slate-500 font-medium">Return</span>
                </div>
              </CardContent>
            </Card>

            {/* 2. Risk : Reward */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Risk : Reward</p>
                  <Tooltip>
                    <TooltipTrigger><Info className="w-4 h-4 text-slate-400" /></TooltipTrigger>
                    <TooltipContent>Reward earned per unit of risk</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                    1:{stats.rrRatio.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 w-full">
                  <Progress value={Math.min(stats.rrRatio * 33, 100)} className="h-1.5 bg-slate-100" />
                </div>
              </CardContent>
            </Card>

            {/* 3. Position Size */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Position Size</p>
                  <Activity className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                    {trade.size?.toLocaleString() || "1"}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">Contracts</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Notional: <span className="font-mono text-slate-700">{formatCurrency(trade.entry_price * (trade.size || 1))}</span>
                </div>
              </CardContent>
            </Card>

            {/* 4. Duration */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Duration</p>
                  <Timer className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    {stats.durationLabel}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {stats.status === "OPEN" ? "Active Trade" : `Closed ${formatTime(trade.trade_end_time || "")}`}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- AI ANALYSIS (Dynamic) --- */}
          <AnimatePresence>
            {(aiAnalysis || aiLoading) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-8">
                <Card className="border border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 shadow-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100">Trade Analysis</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {aiLoading && !aiAnalysis ? (
                            <div className="flex items-center gap-2 text-slate-500 py-4">
                            <Loader2 className="w-4 h-4 animate-spin" /> Analyzing trade execution...
                            </div>
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                            <SimpleMarkdown content={aiAnalysis} />
                            </div>
                        )}
                    </CardContent>
                </Card>
                </motion.div>
            )}
          </AnimatePresence>

          {/* --- MAIN LAYOUT --- */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Column (8 cols) */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* Chart */}
              <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
                <div className="h-[500px]">
                   <TradingChart 
                      instrument={trade.instrument} 
                      trades={[trade]} 
                      tradeDate={trade.trade_start_time || trade.date}
                      timeframe="1D" // Default, can be made dynamic
                   />
                </div>
              </Card>

              {/* Analysis & Risk Tabs */}
              <Card className="border border-slate-200 shadow-sm bg-white">
                 <CardHeader className="border-b border-slate-100 pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                       <Shield className="w-4 h-4" /> Trade Health
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-medium text-slate-700">Risk vs Capital</span>
                           <span className="text-sm font-mono text-slate-500">{formatCurrency(stats.risk)} Risk</span>
                        </div>
                        <Progress value={Math.min((stats.risk / 50000) * 100, 100)} className="h-2" />
                        <p className="text-xs text-slate-400 mt-1">Based on assumed $50k account</p>
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-medium text-slate-700">Execution Quality</span>
                           <span className="text-sm font-mono text-emerald-600">{stats.efficiencyScore}/100</span>
                        </div>
                        <Progress value={stats.efficiencyScore} className="h-2 bg-slate-100" />
                        <p className="text-xs text-slate-400 mt-1">Efficiency based on R:R</p>
                     </div>
                 </CardContent>
              </Card>

              {/* Trade Notes & Screenshots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Notes */}
                 <Card className="border border-slate-200 shadow-sm bg-white h-full">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                       <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> Journal Notes
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                       {trade.notes ? (
                          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{trade.notes}</p>
                       ) : (
                          <p className="text-sm text-slate-400 italic">No notes added for this trade.</p>
                       )}
                    </CardContent>
                 </Card>

                 {/* Screenshots */}
                 <Card className="border border-slate-200 shadow-sm bg-white h-full">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                       <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Screenshots
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                       {trade.screenshot_before_url || trade.screenshot_after_url ? (
                          <div className="grid grid-cols-2 gap-2">
                             {trade.screenshot_before_url && (
                                <a href={trade.screenshot_before_url} target="_blank" rel="noreferrer" className="block relative aspect-video rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity">
                                   <Image src={trade.screenshot_before_url} alt="Before" fill className="object-cover" />
                                   <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center backdrop-blur-sm">Before</div>
                                </a>
                             )}
                             {trade.screenshot_after_url && (
                                <a href={trade.screenshot_after_url} target="_blank" rel="noreferrer" className="block relative aspect-video rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity">
                                   <Image src={trade.screenshot_after_url} alt="After" fill className="object-cover" />
                                   <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center backdrop-blur-sm">After</div>
                                </a>
                             )}
                          </div>
                       ) : (
                          <p className="text-sm text-slate-400 italic">No screenshots attached.</p>
                       )}
                    </CardContent>
                 </Card>
              </div>

            </div>

            {/* Right Column (4 cols) */}
            <div className="xl:col-span-4 space-y-6">
               
               {/* Execution Ledger */}
               <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                     <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Execution Ledger
                     </CardTitle>
                  </CardHeader>
                  <div className="divide-y divide-slate-100">
                     <div className="p-4 flex justify-between items-center hover:bg-slate-50/50">
                        <span className="text-sm text-slate-500">Entry</span>
                        <span className="font-mono font-medium text-slate-900">{formatCurrency(trade.entry_price)}</span>
                     </div>
                     <div className="p-4 flex justify-between items-center hover:bg-slate-50/50">
                        <span className="text-sm text-slate-500">Exit</span>
                        <span className="font-mono font-medium text-slate-900">{trade.exit_price ? formatCurrency(trade.exit_price) : "-"}</span>
                     </div>
                     <div className="p-4 flex justify-between items-center hover:bg-red-50/30">
                        <span className="text-sm text-slate-500 flex items-center gap-1"><Shield className="w-3 h-3"/> Stop Loss</span>
                        <span className="font-mono font-medium text-red-600">{trade.stop_loss ? formatCurrency(trade.stop_loss) : "None"}</span>
                     </div>
                     <div className="p-4 flex justify-between items-center hover:bg-emerald-50/30">
                        <span className="text-sm text-slate-500 flex items-center gap-1"><Target className="w-3 h-3"/> Take Profit</span>
                        <span className="font-mono font-medium text-emerald-600">{trade.take_profit ? formatCurrency(trade.take_profit) : "None"}</span>
                     </div>
                  </div>
               </Card>

               {/* Timeline */}
               <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                     <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Trade Timeline
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                     <div className="relative border-l-2 border-slate-200 pl-6 space-y-8">
                        {/* Entry Point */}
                        <div className="relative">
                           <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-4 border-white shadow-sm" />
                           <p className="text-xs font-bold text-slate-400 uppercase mb-1">Entry</p>
                           <p className="text-sm font-medium text-slate-900">{formatDate(trade.date)}</p>
                           <p className="text-xs font-mono text-slate-500">{formatTime(trade.trade_start_time || trade.date)}</p>
                        </div>
                        
                        {/* Exit Point */}
                        <div className="relative">
                           <div className={cn(
                              "absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                              trade.trade_end_time ? "bg-slate-500" : "bg-emerald-500 animate-pulse"
                           )} />
                           <p className="text-xs font-bold text-slate-400 uppercase mb-1">Exit</p>
                           {trade.trade_end_time ? (
                              <>
                                 <p className="text-sm font-medium text-slate-900">{formatDate(trade.trade_end_time)}</p>
                                 <p className="text-xs font-mono text-slate-500">{formatTime(trade.trade_end_time)}</p>
                              </>
                           ) : (
                              <p className="text-sm font-medium text-emerald-600 italic">Trade Active</p>
                           )}
                        </div>
                     </div>
                  </CardContent>
               </Card>

            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
