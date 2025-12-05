"use client"

import { useEffect, useState } from "react"
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
  DollarSign,
  Target,
  Activity,
  Calendar,
  Timer,
  Zap,
  Shield,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Maximize2,
  RefreshCw,
  Info,
  BookOpen,
  Calculator,
  PieChart,
  LineChart,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"
import TradingChart from "@/components/trading-chart"
import { getTradeById, deleteTrade } from "@/app/actions/trade-actions"
import type { Trade } from "@/types"
import { cn } from "@/lib/utils"

export default function EnhancedTradeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChartFullscreen, setIsChartFullscreen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    analysis: true,
    risk: true,
  })

  const [selectedTimeframe, setSelectedTimeframe] = useState("1D")

  const tradeId = params.id as string

  useEffect(() => {
    const loadTrade = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!tradeId) {
          setError("Trade ID is required")
          return
        }

        const tradeData = await getTradeById(tradeId)
        if (!tradeData) {
          setError("Trade not found")
          return
        }

        setTrade(tradeData)
      } catch (err) {
        console.error("Error loading trade:", err)
        setError("Failed to load trade details")
      } finally {
        setIsLoading(false)
      }
    }

    loadTrade()
  }, [tradeId])

  const handleDelete = async () => {
    if (!trade || !confirm("Are you sure you want to delete this trade?")) return

    try {
      setIsDeleting(true)
      await deleteTrade(trade.id)
      router.push("/trades")
    } catch (err) {
      console.error("Error deleting trade:", err)
      alert("Failed to delete trade")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    if (trade) {
      router.push(`/edit-trade/${trade.id}`)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateDuration = (entryTime: string, exitTime?: string): string => {
    if (!exitTime) return "Open"

    const entry = new Date(entryTime)
    const exit = new Date(exitTime)
    const diffMs = exit.getTime() - entry.getTime()

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading trade data...</p>
        </div>
      </div>
    )
  }

  if (error || !trade) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-100 shadow-lg">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Trade</h2>
            <p className="text-slate-500 mb-6">{error || "The trade you're looking for could not be found."}</p>
            <Button onClick={() => router.push("/trades")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Trades
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pnl = trade.exit_price ? (trade.exit_price - trade.entry_price) * (trade.quantity || 0) : 0
  const pnlPercentage = trade.exit_price ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100 : 0
  const directionLabel = trade?.direction?.toUpperCase?.() ?? "N/A"
  
  // Refined variants for cleaner look
  const directionVariant = trade?.direction === "long" ? "default" : "destructive" 

  const rawStatus = "status" in trade! ? (trade as any).status : trade.exit_price ? "closed" : "open"
  const statusLabel = rawStatus?.toUpperCase?.() ?? "UNKNOWN"
  const statusVariant = rawStatus === "closed" ? "secondary" : "outline"

  const isProfit = pnl > 0
  const isLoss = pnl < 0
  const riskAmount = trade.stop_loss ? Math.abs((trade.entry_price - trade.stop_loss) * (trade.quantity || 0)) : 0
  const rewardAmount = Math.abs(pnl)
  const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0

  const getPerformanceGrade = () => {
    if (riskRewardRatio >= 3) return { grade: "A+", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
    if (riskRewardRatio >= 2) return { grade: "A", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
    if (riskRewardRatio >= 1.5) return { grade: "B", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" }
    if (riskRewardRatio >= 1) return { grade: "C", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
    return { grade: "D", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
  }

  const performanceGrade = getPerformanceGrade()

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        {/* Subtle, clean header background */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30 supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push("/trades")}
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {trade.instrument}
                    </h1>
                    <Badge variant={directionVariant} className="rounded-md px-2.5 font-mono font-medium">
                      {directionLabel}
                    </Badge>
                    <Badge variant={statusVariant} className="rounded-md px-2.5 font-mono text-xs uppercase text-slate-500">
                      {statusLabel}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(trade.entry_time)}</span>
                    <span className="text-slate-300">•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(trade.entry_time)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-2">
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-slate-900">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share</TooltipContent>
                   </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-slate-900">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export</TooltipContent>
                   </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-slate-900">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh</TooltipContent>
                   </Tooltip>
                </div>

                <Button onClick={handleEdit} variant="outline" size="sm" className="h-9">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  onClick={handleDelete} 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* Top KPI Cards - Cleaner, higher contrast */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* P&L Card - The "Hero" Card */}
            <Card className={cn(
              "border shadow-sm overflow-hidden relative",
              isProfit ? "border-emerald-200 bg-emerald-50/30" : isLoss ? "border-red-200 bg-red-50/30" : "border-slate-200"
            )}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Net P&L</p>
                  <div className={cn(
                    "p-1.5 rounded-full", 
                    isProfit ? "bg-emerald-100 text-emerald-600" : isLoss ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                  )}>
                    {isProfit ? <TrendingUp className="w-4 h-4" /> : isLoss ? <TrendingDown className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-3xl font-bold tracking-tight tabular-nums", isProfit ? "text-emerald-700" : isLoss ? "text-red-700" : "text-slate-700")}>
                    {isProfit ? "+" : ""}{formatCurrency(pnl)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className={cn("text-xs font-mono", isProfit ? "bg-emerald-100 text-emerald-700" : isLoss ? "bg-red-100 text-red-700" : "")}>
                    {formatPercentage(pnlPercentage)}
                  </Badge>
                  <span className="text-xs text-slate-500 font-medium">Return on Risk</span>
                </div>
              </CardContent>
            </Card>

            {/* R:R Card */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Risk : Reward</p>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>Reward earned per unit of risk</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                    1:{riskRewardRatio > 0 ? riskRewardRatio.toFixed(2) : "0"}
                  </span>
                </div>
                <div className="mt-2 w-full">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Quality</span>
                    <span className={cn("font-bold", performanceGrade.color)}>{performanceGrade.grade}</span>
                  </div>
                  <Progress 
                    value={Math.min(riskRewardRatio * 20, 100)} 
                    className="h-1.5 bg-slate-100" 
                    // Note: You might need to inline style the indicator color if shadcn Progress doesn't support color prop easily
                  />
                </div>
              </CardContent>
            </Card>

            {/* Position Size - Neutral styling */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Position Size</p>
                  <Activity className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                    {(trade.quantity || 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">units</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Total Value: <span className="font-mono text-slate-700">{formatCurrency(trade.entry_price * (trade.quantity || 0))}</span>
                </div>
              </CardContent>
            </Card>

            {/* Duration - Neutral styling */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Duration</p>
                  <Timer className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    {calculateDuration(trade.entry_time, trade.exit_time)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {rawStatus === "open" ? "Trade is active" : `Closed on ${formatDate(trade.exit_time || "")}`}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Column (Chart & Analysis) - Spans 8 cols */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* Chart Section */}
              <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
                <Tabs defaultValue="chart" className="w-full">
                  <div className="border-b border-slate-100 p-3 flex items-center justify-between bg-slate-50/30">
                    <TabsList className="bg-slate-200/50 h-9">
                      <TabsTrigger value="chart" className="text-xs px-4">Price Chart</TabsTrigger>
                      <TabsTrigger value="analysis" className="text-xs px-4">Analytics</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-slate-200 rounded-md shadow-sm p-0.5">
                        {["5M", "15M", "1H", "4H", "1D", "1W"].map((timeframe) => (
                          <button
                            key={timeframe}
                            onClick={() => setSelectedTimeframe(timeframe)}
                            className={cn(
                              "px-2.5 py-1 text-[10px] font-semibold rounded transition-colors",
                              selectedTimeframe === timeframe
                                ? "bg-slate-900 text-white"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                          >
                            {timeframe}
                          </button>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-900"
                        onClick={() => setIsChartFullscreen(!isChartFullscreen)}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="chart" className="m-0 relative">
                    <div className={cn(
                      "transition-all duration-300 bg-white",
                      isChartFullscreen ? "fixed inset-0 z-50 p-4 bg-slate-900" : "h-[500px]"
                    )}>
                      {isChartFullscreen && (
                        <div className="absolute top-4 right-4 z-50">
                          <Button variant="secondary" size="sm" onClick={() => setIsChartFullscreen(false)}>
                            <X className="w-4 h-4 mr-2" /> Exit Fullscreen
                          </Button>
                        </div>
                      )}
                      
                      <TradingChart
                        instrument={trade.instrument}
                        trades={[trade]}
                        tradeDate={trade.entry_time}
                        timeframe={selectedTimeframe}
                        className={isChartFullscreen ? "h-full w-full rounded-lg" : "h-full border-0"}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis" className="p-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-slate-500" /> Risk Analysis
                            </h3>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Risk Amount</span>
                                    <span className="font-mono text-red-600">{formatCurrency(riskAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Reward Target</span>
                                    <span className="font-mono text-emerald-600">{formatCurrency(rewardAmount)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-700">Win Rate Needed</span>
                                    <span className="text-slate-900">{riskRewardRatio > 0 ? `${(100 / (1 + riskRewardRatio)).toFixed(1)}%` : "N/A"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-slate-500" /> Capital Efficiency
                            </h3>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Capital Deployed</span>
                                    <span className="font-mono text-slate-900">{formatCurrency(trade.entry_price * (trade.quantity || 0))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Efficiency Score</span>
                                    <span className="font-mono text-blue-600 font-medium">
                                        {riskRewardRatio > 0 ? `${Math.min(riskRewardRatio * 50, 100).toFixed(0)}/100` : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                     </div>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Trade Notes */}
              {trade.notes && (
                <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                    <div 
                        className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("analysis")}
                    >
                         <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-slate-500" /> Trade Notes
                        </h3>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {expandedSections.analysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>
                    
                    {expandedSections.analysis && (
                        <CardContent className="p-6">
                            <div className="prose prose-slate prose-sm max-w-none text-slate-600 bg-white">
                                <p className="whitespace-pre-wrap">{trade.notes}</p>
                            </div>
                        </CardContent>
                    )}
                </Card>
              )}
            </div>

            {/* Right Column (Details) - Spans 4 cols */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* Execution Details - Vertical List style */}
              <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                   <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4" /> Execution Levels
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-slate-100">
                      <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <span className="text-sm text-slate-500">Entry Price</span>
                          <span className="font-mono font-medium text-slate-900">{formatCurrency(trade.entry_price)}</span>
                      </div>
                      
                      {trade.exit_price && (
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <span className="text-sm text-slate-500">Exit Price</span>
                            <span className="font-mono font-medium text-slate-900">{formatCurrency(trade.exit_price)}</span>
                        </div>
                      )}

                      {trade.stop_loss && (
                        <div className="p-4 flex items-center justify-between hover:bg-red-50/30 transition-colors">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Stop Loss</span>
                                <Badge variant="outline" className="text-[10px] h-5 border-red-200 text-red-600 bg-red-50">Risk</Badge>
                            </div>
                            <span className="font-mono font-medium text-red-600">{formatCurrency(trade.stop_loss)}</span>
                        </div>
                      )}

                      {trade.take_profit && (
                        <div className="p-4 flex items-center justify-between hover:bg-emerald-50/30 transition-colors">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Take Profit</span>
                                <Badge variant="outline" className="text-[10px] h-5 border-emerald-200 text-emerald-600 bg-emerald-50">Target</Badge>
                            </div>
                            <span className="font-mono font-medium text-emerald-600">{formatCurrency(trade.take_profit)}</span>
                        </div>
                      )}
                   </div>
                </CardContent>
              </Card>

              {/* Timing Details */}
              <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                   <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Timing
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-white" />
                            <p className="text-xs text-slate-500 font-medium uppercase mb-0.5">Entry</p>
                            <p className="text-sm font-medium text-slate-900">{formatDate(trade.entry_time)}</p>
                            <p className="text-xs text-slate-500 font-mono">{formatTime(trade.entry_time)}</p>
                        </div>
                        
                        {trade.exit_time ? (
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-slate-900 ring-4 ring-white" />
                                <p className="text-xs text-slate-500 font-medium uppercase mb-0.5">Exit</p>
                                <p className="text-sm font-medium text-slate-900">{formatDate(trade.exit_time)}</p>
                                <p className="text-xs text-slate-500 font-mono">{formatTime(trade.exit_time)}</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-slate-300 bg-white ring-4 ring-white animate-pulse" />
                                <p className="text-sm text-slate-500 italic">Trade active...</p>
                            </div>
                        )}
                    </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-900 text-white shadow-lg border-0">
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" /> Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <Button variant="secondary" className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700">
                            <Share2 className="w-4 h-4 mr-3" /> Share Analysis
                        </Button>
                        <Button variant="secondary" className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700">
                            <BookOpen className="w-4 h-4 mr-3" /> Add to Journal
                        </Button>
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
