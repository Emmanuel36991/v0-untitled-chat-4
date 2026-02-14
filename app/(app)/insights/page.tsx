"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { getTrades } from "@/app/actions/trade-actions"
import type { Trade } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, TrendingDown, Target, Brain, Shield, 
  Activity, AlertTriangle, CheckCircle2,
  BarChart3, RefreshCw, ArrowRight, Microscope, BarChart3 as ChartIcon
} from 'lucide-react'
import { SparkIcon, PulseIcon } from "@/components/icons/system-icons"
import { analyzeSetupPatterns } from "@/lib/insights/setup-analyzer"
import { analyzePsychologyPatterns } from "@/lib/insights/psychology-analyzer"
import { analyzeAndCalculateRisk } from "@/lib/insights/risk-calculator"
import { SetupScatterChart } from "@/components/insights/setup-scatter-chart"
import { cn } from "@/lib/utils"

export default function InsightsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiReport, setAiReport] = useState<string | null>(null)

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const fetchedTrades = await getTrades()
        setTrades(fetchedTrades || [])
      } catch (error) {
        console.error("Failed to load trades:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const setupAnalysis = useMemo(() => analyzeSetupPatterns(trades), [trades])
  const psychologyAnalysis = useMemo(() => analyzePsychologyPatterns(trades), [trades])
  const riskAnalysis = useMemo(() => analyzeAndCalculateRisk(trades), [trades])

  // Prepare Data for Charts (Safe mapping)
  const scatterData = useMemo(() => {
    const top = setupAnalysis.topSetups || []
    const bottom = setupAnalysis.bottomSetups || []
    
    return [
      ...top.map(s => ({ 
        name: s.setupName, x: s.winRate * 100, y: 2, volume: s.totalTrades, pnl: s.totalPnL, winRate: s.winRate * 100, rrr: 2 
      })),
      ...bottom.map(s => ({ 
        name: s.setupName, x: s.winRate * 100, y: 1.2, volume: s.totalTrades, pnl: s.totalPnL, winRate: s.winRate * 100, rrr: 1.2 
      }))
    ]
  }, [setupAnalysis])

  const handleGenerateAIReport = () => {
    setIsGeneratingAI(true)
    setTimeout(() => {
      setAiReport("Based on your last 50 trades, your 'Silver Bullet' setup has a 75% win rate in the AM session but drops to 30% in the PM. I recommend implementing a time-based rule to stop trading this setup after 11:00 AM EST. Additionally, your risk of ruin has increased slightly due to larger sizing on losing streaks.")
      setIsGeneratingAI(false)
    }, 2500)
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 rounded-full animate-pulse" />
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Analyzing Trading DNA...</p>
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Microscope className="w-12 h-12 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Data to Analyze</h1>
        <p className="text-slate-500 max-w-md mb-8">
          Log at least a few trades to unlock the AI Insights engine.
        </p>
        <Button asChild>
          <a href="/add-trade">Log a Trade</a>
        </Button>
      </div>
    )
  }

  // --- Safe Accessor Helpers ---
  const topSetup = setupAnalysis.topSetups?.[0]
  const bottomSetup = setupAnalysis.bottomSetups?.[0]
  const personalEdge = setupAnalysis.personalEdge

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B0D12] pb-20">
      
      {/* --- 1. HERO SECTION --- */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-8 pb-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                  <Microscope className="w-3 h-3 mr-1" /> Pattern Analysis
                </Badge>
                <span className="text-xs text-slate-400 font-mono">UPDATED JUST NOW</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Trading Intelligence
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
                Deep dive analysis into your edge, psychology, and risk parameters.
              </p>
            </div>

            <div className="flex items-center gap-3">
               <Button 
                 onClick={handleGenerateAIReport} 
                 disabled={isGeneratingAI || !!aiReport}
                 className={cn(
                   "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all",
                   isGeneratingAI && "opacity-80"
                 )}
               >
                 {isGeneratingAI ? (
                   <>
                     <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                   </>
                 ) : aiReport ? (
                   <>
                     <CheckCircle2 className="mr-2 h-4 w-4" /> Report Ready
                   </>
                 ) : (
                   <>
                     <SparkIcon className="mr-2 h-4 w-4" /> Generate AI Report
                   </>
                 )}
               </Button>
            </div>
          </div>

          {/* AI Report Card */}
          {aiReport && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                   <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">AI Executive Summary</h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                    {aiReport}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* --- 2. MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        <Tabs defaultValue="setups" className="space-y-8">
          
          <TabsList className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm inline-flex h-auto">
            <TabsTrigger value="setups" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-400 font-medium">
              Setup Analysis
            </TabsTrigger>
            <TabsTrigger value="psychology" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-400 font-medium">
              Psychology
            </TabsTrigger>
            <TabsTrigger value="risk" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-400 font-medium">
              Risk Profile
            </TabsTrigger>
          </TabsList>

          {/* --- TAB: SETUPS --- */}
          <TabsContent value="setups" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart Card */}
              <Card className="lg:col-span-2 border-0 shadow-xl bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle>Setup Performance Matrix</CardTitle>
                  <CardDescription>Win Rate vs. Reward-to-Risk Ratio</CardDescription>
                </CardHeader>
                <CardContent>
                  <SetupScatterChart data={scatterData} />
                  <div className="flex justify-center gap-6 mt-4 text-xs text-slate-500">
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 opacity-70" /> Profitable</div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500 opacity-70" /> Unprofitable</div>
                  </div>
                </CardContent>
              </Card>

              {/* Best/Worst Card */}
              <div className="space-y-6">
                 {/* SAFE GUARD: Check if personalEdge exists */}
                 <Card className="border-l-4 border-l-emerald-500 shadow-md bg-white dark:bg-slate-900">
                    <CardHeader className="pb-2">
                       <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Top Performer</p>
                       <CardTitle className="text-xl">{personalEdge?.setupName || "No Data"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-3xl font-bold text-slate-900 dark:text-white">
                               {((personalEdge?.winRate ?? 0) * 100).toFixed(1)}%
                             </p>
                             <p className="text-xs text-slate-500">Win Rate</p>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-mono font-medium text-emerald-600">
                               +${(topSetup?.totalPnL ?? 0).toFixed(0)}
                             </p>
                          </div>
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="border-l-4 border-l-rose-500 shadow-md bg-white dark:bg-slate-900">
                    <CardHeader className="pb-2">
                       <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Needs Improvement</p>
                       <CardTitle className="text-xl">{bottomSetup?.setupName || "No Data"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-3xl font-bold text-slate-900 dark:text-white">
                               {((bottomSetup?.winRate ?? 0) * 100).toFixed(1)}%
                             </p>
                             <p className="text-xs text-slate-500">Win Rate</p>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-mono font-medium text-rose-600">
                               ${(bottomSetup?.totalPnL ?? 0).toFixed(0)}
                             </p>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              </div>
            </div>
          </TabsContent>

          {/* --- TAB: PSYCHOLOGY --- */}
          <TabsContent value="psychology" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Enablers */}
              <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-slate-900">
                <div className="h-1.5 w-full bg-emerald-500" />
                <CardHeader>
                   <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <PulseIcon className="w-5 h-5 text-emerald-500" /> Edge Enablers
                      </CardTitle>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Positive Impact</Badge>
                   </div>
                   <CardDescription>Emotions correlated with higher profitability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {psychologyAnalysis.topEnablers.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="capitalize">{item.factor}</span>
                        <span className="text-emerald-600">+{item.impact.toFixed(0)}% PnL</span>
                      </div>
                      <Progress value={Math.min(item.impact * 2, 100)} className="h-2 bg-slate-100 dark:bg-slate-800" />
                    </div>
                  ))}
                  {psychologyAnalysis.topEnablers.length === 0 && <p className="text-sm text-slate-500">No positive correlations found yet.</p>}
                </CardContent>
              </Card>

              {/* Killers */}
              <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-slate-900">
                <div className="h-1.5 w-full bg-rose-500" />
                <CardHeader>
                   <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" /> Edge Killers
                      </CardTitle>
                      <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50">Negative Impact</Badge>
                   </div>
                   <CardDescription>Emotions correlated with losses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {psychologyAnalysis.topKillers.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="capitalize">{item.factor}</span>
                        <span className="text-rose-600">{item.impact.toFixed(0)}% PnL</span>
                      </div>
                      <Progress value={Math.min(Math.abs(item.impact) * 2, 100)} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-rose-500" />
                    </div>
                  ))}
                   {psychologyAnalysis.topKillers.length === 0 && <p className="text-sm text-slate-500">No negative correlations found yet.</p>}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* --- TAB: RISK --- */}
          <TabsContent value="risk" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Kelly Card */}
               <Card className="md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-400" /> Kelly Criterion Analysis
                    </CardTitle>
                    <CardDescription className="text-slate-400">Optimal position sizing based on your edge</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-8">
                     <div>
                        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Recommended Risk</p>
                        <p className="text-4xl font-mono font-bold text-indigo-400">
                          {(riskAnalysis.kellyCriterion.recommendedRiskPercent ?? 0).toFixed(2)}%
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Per trade of account balance</p>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                           <span className="text-slate-300">Full Kelly</span>
                           <span className="font-mono">{(riskAnalysis.kellyCriterion.kellyPercent ?? 0).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                           <span className="text-slate-300">Half Kelly (Safe)</span>
                           <span className="font-mono text-emerald-400">{(riskAnalysis.kellyCriterion.halfKellyPercent ?? 0).toFixed(2)}%</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Stats Card */}
               <div className="space-y-4">
                  <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                     <CardContent className="p-4 flex items-center justify-between">
                        <div>
                           <p className="text-xs text-slate-500 uppercase font-bold">Max Drawdown</p>
                           <p className="text-xl font-bold text-rose-600">{(riskAnalysis.drawdownMetrics.maxDrawdown ?? 0).toFixed(1)}%</p>
                        </div>
                        <TrendingDown className="w-8 h-8 text-rose-100 dark:text-rose-900/30" />
                     </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                     <CardContent className="p-4 flex items-center justify-between">
                        <div>
                           <p className="text-xs text-slate-500 uppercase font-bold">Profit Factor</p>
                           <p className="text-xl font-bold text-emerald-600">{(riskAnalysis.profitFactor ?? 0).toFixed(2)}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-emerald-100 dark:text-emerald-900/30" />
                     </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                     <CardContent className="p-4 flex items-center justify-between">
                        <div>
                           <p className="text-xs text-slate-500 uppercase font-bold">Expectancy</p>
                           <p className="text-xl font-bold text-indigo-600">${(riskAnalysis.expectancy ?? 0).toFixed(2)}</p>
                        </div>
                        <Target className="w-8 h-8 text-indigo-100 dark:text-indigo-900/30" />
                     </CardContent>
                  </Card>
               </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
