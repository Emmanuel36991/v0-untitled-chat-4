"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts"
import {
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity,
  Shield,
  Brain,
  Eye,
  Edit3,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  Layers,
  PieChartIcon,
  TrendingUpIcon,
} from "lucide-react"
import { PulseIcon } from "@/components/icons/system-icons"
import type { Trade } from "@/types"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePnLDisplay } from "@/hooks/use-pnl-display"
import { calculateInstrumentPnL, formatPnLDisplay } from "@/types/instrument-calculations"
import { EnhancedPnLCell } from "@/components/trades/enhanced-pnl-cell"

interface TradeDetailsViewProps {
  trade: Trade
  className?: string
}

export function TradeDetailsView({ trade, className }: TradeDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "analysis" | "methodology">("overview")
  const { displayFormat } = usePnLDisplay() // Added P&L display format state

  const pnlResult = useMemo(() => {
    return calculateInstrumentPnL(trade.instrument, trade.direction, trade.entry_price, trade.exit_price, trade.size)
  }, [trade])

  // Calculate trade metrics
  const isLong = trade.direction === "long"
  const isWin = trade.outcome === "win"
  const isLoss = trade.outcome === "loss"
  const pnlColor = pnlResult.adjustedPnL >= 0 ? "text-green-400" : "text-red-400"
  const pnlBgColor = pnlResult.adjustedPnL >= 0 ? "bg-green-500/10" : "bg-red-500/10"
  const pnlBorderColor = pnlResult.adjustedPnL >= 0 ? "border-green-500/30" : "border-red-500/30"

  // Calculate risk-reward ratio
  const riskAmount = Math.abs(trade.entry_price - trade.stop_loss) * trade.size
  const rewardAmount = trade.take_profit
    ? Math.abs(trade.take_profit - trade.entry_price) * trade.size
    : Math.abs(trade.exit_price - trade.entry_price) * trade.size
  const riskRewardRatio = riskAmount > 0 ? (rewardAmount / riskAmount).toFixed(2) : "N/A"

  // Generate price movement simulation data
  const generatePriceData = () => {
    const data = []
    const steps = 20
    const entryPrice = trade.entry_price
    const exitPrice = trade.exit_price
    const stopLoss = trade.stop_loss

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps
      let price = entryPrice

      if (isWin) {
        // Simulate a winning trade path
        if (progress < 0.3) {
          price = entryPrice + (exitPrice - entryPrice) * (progress / 0.3) * 0.2
        } else if (progress < 0.7) {
          price =
            entryPrice + (exitPrice - entryPrice) * 0.2 + (exitPrice - entryPrice) * ((progress - 0.3) / 0.4) * 0.6
        } else {
          price =
            entryPrice + (exitPrice - entryPrice) * 0.8 + (exitPrice - entryPrice) * ((progress - 0.7) / 0.3) * 0.2
        }
      } else {
        // Simulate a losing trade path
        price = entryPrice + (exitPrice - entryPrice) * progress
      }

      data.push({
        time: i,
        price: price,
        entry: entryPrice,
        exit: exitPrice,
        stopLoss: stopLoss,
        takeProfit: trade.take_profit || null,
      })
    }
    return data
  }

  const priceData = generatePriceData()

  // Risk analysis data
  const riskAnalysisData = [
    { name: "Risk", value: riskAmount, fill: "#ef4444" },
    { name: "Reward", value: rewardAmount, fill: "#10b981" },
  ]

  // Performance metrics
  const performanceData = [
    { metric: "Win Rate", value: isWin ? 100 : 0, color: "#10b981" },
    { metric: "Risk Management", value: 85, color: "#3b82f6" },
    { metric: "Execution", value: 92, color: "#8b5cf6" },
    { metric: "Discipline", value: 88, color: "#f59e0b" },
  ]

  const getOutcomeIcon = () => {
    if (isWin) return <CheckCircle className="h-5 w-5 text-green-400" />
    if (isLoss) return <AlertTriangle className="h-5 w-5 text-red-400" />
    return <MinusCircle className="h-5 w-5 text-yellow-400" />
  }

  const getOutcomeBadge = () => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
    if (isWin)
      return (
        <Badge className={`${baseClasses} bg-green-500/20 text-green-400 border-green-500/50`}>
          <CheckCircle className="h-4 w-4" />
          Win
        </Badge>
      )
    if (isLoss)
      return (
        <Badge className={`${baseClasses} bg-red-500/20 text-red-400 border-red-500/50`}>
          <AlertTriangle className="h-4 w-4" />
          Loss
        </Badge>
      )
    return (
      <Badge className={`${baseClasses} bg-yellow-500/20 text-yellow-400 border-yellow-500/50`}>
        <MinusCircle className="h-4 w-4" />
        Breakeven
      </Badge>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="glass-card rounded-2xl p-6 border-cyan-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {isLong ? (
                <ArrowUpRight className="h-8 w-8 text-green-400" />
              ) : (
                <ArrowDownRight className="h-8 w-8 text-red-400" />
              )}
              <div className="absolute -inset-1 bg-current opacity-20 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">{trade.instrument}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant={isLong ? "default" : "destructive"} className="capitalize">
                  {trade.direction}
                </Badge>
                {getOutcomeBadge()}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(trade.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="glass-card border-cyan-500/30 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="glass-card border-cyan-500/30 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild size="sm" className="futuristic-button">
              <Link href={`/edit-trade/${trade.id}`}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Trade
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-10 translate-x-10" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DollarSign className="h-6 w-6 text-green-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit & Loss ({displayFormat})</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedPnLCell trade={trade} displayFormat={displayFormat} showMultipleFormats={true} />
            <p className="text-xs text-muted-foreground mt-2">
              {formatPnLDisplay(pnlResult, displayFormat, trade.instrument)} on this trade
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -translate-y-10 translate-x-10" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Target className="h-6 w-6 text-blue-400" />
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk:Reward</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400 mb-1">1:{riskRewardRatio}</div>
            <p className="text-xs text-muted-foreground">Risk to reward ratio</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-10 translate-x-10" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Activity className="h-6 w-6 text-purple-400" />
              <PulseIcon className="h-4 w-4 text-purple-400" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Position Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400 mb-1">{trade.size}</div>
            <p className="text-xs text-muted-foreground">Units traded</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -translate-y-10 translate-x-10" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Clock className="h-6 w-6 text-orange-400" />
              {getOutcomeIcon()}
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400 mb-1 capitalize">{trade.outcome}</div>
            <p className="text-xs text-muted-foreground">Trade result</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card rounded-2xl border-cyan-500/30">
        <div className="flex border-b border-cyan-500/20">
          {[
            { id: "overview", label: "Overview", icon: Eye },
            { id: "analysis", label: "Analysis", icon: BarChart3 },
            { id: "methodology", label: "Methodology", icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300",
                  activeTab === tab.id
                    ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5"
                    : "text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/5",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Price Movement Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUpIcon className="h-5 w-5 text-cyan-400" />
                      Price Movement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={priceData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.9)",
                              border: "1px solid rgba(34, 197, 94, 0.3)",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#06b6d4"
                            fill="#06b6d4"
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                          <Line dataKey="entry" stroke="#f59e0b" strokeDasharray="5 5" />
                          <Line dataKey="exit" stroke="#10b981" strokeDasharray="5 5" />
                          <Line dataKey="stopLoss" stroke="#ef4444" strokeDasharray="5 5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-yellow-500"></div>
                        <span>Entry: ${trade.entry_price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-green-500"></div>
                        <span>Exit: ${trade.exit_price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-red-500"></div>
                        <span>Stop: ${trade.stop_loss}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk vs Reward */}
                <Card className="glass-card border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <PieChartIcon className="h-5 w-5 text-purple-400" />
                      Risk vs Reward
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={riskAnalysisData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                          >
                            {riskAnalysisData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: any) => [`$${value.toFixed(2)}`, ""]}
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.9)",
                              border: "1px solid rgba(34, 197, 94, 0.3)",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Risk: ${riskAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Reward: ${rewardAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trade Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-cyan-400" />
                      Execution Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Entry Price</p>
                        <p className="text-lg font-semibold text-cyan-400">${trade.entry_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Exit Price</p>
                        <p className="text-lg font-semibold text-green-400">${trade.exit_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stop Loss</p>
                        <p className="text-lg font-semibold text-red-400">${trade.stop_loss}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Take Profit</p>
                        <p className="text-lg font-semibold text-purple-400">
                          {trade.take_profit ? `$${trade.take_profit}` : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-400" />
                      Risk Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Risk Amount</span>
                        <span className="text-red-400">${riskAmount.toFixed(2)}</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Reward Potential</span>
                        <span className="text-green-400">${rewardAmount.toFixed(2)}</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div className="pt-2 border-t border-slate-700/50">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">R:R Ratio</span>
                        <span className="font-semibold text-blue-400">1:{riskRewardRatio}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === "analysis" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <Card className="glass-card border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={performanceData}>
                          <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                          <RechartsTooltip
                            formatter={(value: any) => [`${value}%`, ""]}
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.9)",
                              border: "1px solid rgba(34, 197, 94, 0.3)",
                              borderRadius: "8px",
                            }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Trade Statistics */}
                <Card className="glass-card border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-400" />
                      Trade Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Duration</span>
                        <span className="font-medium">Intraday</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Setup Quality</span>
                        <Badge variant="default" className="bg-green-500/20 text-green-400">
                          High
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Execution Score</span>
                        <span className="font-medium text-blue-400">92/100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Risk Level</span>
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                          Moderate
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trade Notes */}
              {trade.notes && (
                <Card className="glass-card border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-cyan-400" />
                      Trade Notes & Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed">{trade.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Methodology Tab */}
          {activeTab === "methodology" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Setup Information */}
                <Card className="glass-card border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-400" />
                      Trading Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Setup Name</p>
                        <p className="font-medium">{trade.setup_name || "Not specified"}</p>
                      </div>
                      <Separator className="bg-slate-700/50" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Applied Concepts</p>
                        <div className="flex flex-wrap gap-2">
                          {/* Display methodology concepts if available */}
                          {trade.ict_entry_model &&
                            trade.ict_entry_model.length > 0 &&
                            trade.ict_entry_model.slice(0, 3).map((concept, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {concept}
                              </Badge>
                            ))}
                          {(!trade.ict_entry_model || trade.ict_entry_model.length === 0) && (
                            <span className="text-sm text-muted-foreground">No concepts specified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Psychology Factors */}
                <Card className="glass-card border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      Psychology & Mindset
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trade.psychology_factors && trade.psychology_factors.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {trade.psychology_factors.slice(0, 4).map((factor, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs border-purple-500/50 text-purple-400"
                            >
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No psychology factors recorded</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Screenshots */}
              {(trade.screenshot_before_url || trade.screenshot_after_url) && (
                <Card className="glass-card border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-green-400" />
                      Trade Screenshots
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trade.screenshot_before_url && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Before Trade</p>
                          <div className="aspect-video bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-center justify-center">
                            <img
                              src={trade.screenshot_before_url || "/placeholder.svg"}
                              alt="Before trade screenshot"
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                e.currentTarget.nextElementSibling!.classList.remove("hidden")
                              }}
                            />
                            <div className="hidden text-muted-foreground">Screenshot unavailable</div>
                          </div>
                        </div>
                      )}
                      {trade.screenshot_after_url && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">After Trade</p>
                          <div className="aspect-video bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-center justify-center">
                            <img
                              src={trade.screenshot_after_url || "/placeholder.svg"}
                              alt="After trade screenshot"
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                e.currentTarget.nextElementSibling!.classList.remove("hidden")
                              }}
                            />
                            <div className="hidden text-muted-foreground">Screenshot unavailable</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
