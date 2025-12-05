"use client"

import React, { useState, useMemo } from "react"
import { getTrades } from "@/app/actions/trade-actions"
import type { Trade } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Target, Brain, Shield, Activity, AlertTriangle, CheckCircle, Zap, Award, BarChart3, RefreshCw } from 'lucide-react'
import { analyzeSetupPatterns } from "@/lib/insights/setup-analyzer"
import { analyzePsychologyPatterns } from "@/lib/insights/psychology-analyzer"
import { analyzeAndCalculateRisk } from "@/lib/insights/risk-calculator"
import { cn } from "@/lib/utils"

export default function InsightsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("setups")

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const fetchedTrades = await getTrades()
        setTrades(fetchedTrades)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading trading insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Trading Intelligence
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            AI-Powered Analysis of Your Trading Patterns, Psychology & Risk Management
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger value="setups" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Target className="h-4 w-4 mr-2" />
              Setup Patterns
            </TabsTrigger>
            <TabsTrigger value="psychology" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Brain className="h-4 w-4 mr-2" />
              Psychology
            </TabsTrigger>
            <TabsTrigger value="risk" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Shield className="h-4 w-4 mr-2" />
              Risk Calculator
            </TabsTrigger>
          </TabsList>

          {/* Setup Patterns Tab */}
          <TabsContent value="setups" className="space-y-6 mt-6">
            {setupAnalysis.personalEdge && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span>Your Personal Edge</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Best Performing Setup</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{setupAnalysis.personalEdge.setupName}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold text-green-600">{(setupAnalysis.personalEdge.winRate * 100).toFixed(1)}%</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Optimal RRR</p>
                      <p className="text-2xl font-bold text-blue-600">1:{setupAnalysis.personalEdge.optimalRRR.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Setups */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Top Performing Setups</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {setupAnalysis.topSetups.length === 0 ? (
                    <p className="text-gray-500">No setup data available</p>
                  ) : (
                    setupAnalysis.topSetups.map((setup, idx) => (
                      <div key={idx} className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{setup.setupName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{setup.totalTrades} trades</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{(setup.winRate * 100).toFixed(1)}%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">${setup.totalPnL.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Bottom Setups */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span>Underperforming Setups</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {setupAnalysis.bottomSetups.length === 0 ? (
                    <p className="text-gray-500">No setup data available</p>
                  ) : (
                    setupAnalysis.bottomSetups.map((setup, idx) => (
                      <div key={idx} className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{setup.setupName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{setup.totalTrades} trades</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{(setup.winRate * 100).toFixed(1)}%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">${setup.totalPnL.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            {setupAnalysis.recommendations.length > 0 && (
              <Card className="border-0 shadow-lg bg-blue-50 dark:bg-blue-950/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <span>Setup Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {setupAnalysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Psychology Tab */}
          <TabsContent value="psychology" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Enablers */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Edge-Enablers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {psychologyAnalysis.topEnablers.length === 0 ? (
                    <p className="text-gray-500">No psychology factors recorded</p>
                  ) : (
                    psychologyAnalysis.topEnablers.map((factor, idx) => (
                      <div key={idx} className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{factor.factor}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{factor.tradeCount} trades</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">+{factor.impact.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{(factor.winRate * 100).toFixed(0)}% WR</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Edge Killers */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span>Edge-Killers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {psychologyAnalysis.topKillers.length === 0 ? (
                    <p className="text-gray-500">No psychology factors recorded</p>
                  ) : (
                    psychologyAnalysis.topKillers.map((factor, idx) => (
                      <div key={idx} className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{factor.factor}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{factor.tradeCount} trades</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{factor.impact.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{(factor.winRate * 100).toFixed(0)}% WR</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Psychology Insights */}
            {psychologyAnalysis.insights.length > 0 && (
              <Card className="border-0 shadow-lg bg-purple-50 dark:bg-purple-950/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>Psychological Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {psychologyAnalysis.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <Activity className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">{insight}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Risk Calculator Tab */}
          <TabsContent value="risk" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{(riskAnalysis.currentWinRate * 100).toFixed(1)}%</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Factor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{riskAnalysis.profitFactor.toFixed(2)}x</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Win / Loss</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">
                    {riskAnalysis.avgLoss > 0 ? (riskAnalysis.avgWin / riskAnalysis.avgLoss).toFixed(2) : "—"}x
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Max Drawdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">{riskAnalysis.drawdownMetrics.maxDrawdown.toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Kelly Criterion */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <span>Kelly Criterion & Position Sizing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Kelly %</p>
                    <p className="text-2xl font-bold text-indigo-600">{riskAnalysis.kellyCriterion.kellyPercent.toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recommended Risk</p>
                    <p className="text-2xl font-bold text-green-600">{riskAnalysis.kellyCriterion.recommendedRiskPercent.toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Half Kelly</p>
                    <p className="text-2xl font-bold text-purple-600">{riskAnalysis.kellyCriterion.halfKellyPercent.toFixed(2)}%</p>
                  </div>
                </div>

                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg italic text-gray-700 dark:text-gray-300 border-l-4 border-indigo-600">
                  {riskAnalysis.kellyCriterion.advice}
                </div>

                {/* Position Size Guide */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Position Size Guide</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {riskAnalysis.kellyCriterion.positionSizeGuide.map((guide, idx) => (
                      <div key={idx} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg text-sm">
                        <p className="font-semibold text-gray-900 dark:text-white">${guide.accountSize.toLocaleString()}</p>
                        <p className="text-gray-600 dark:text-gray-400">Risk: ${guide.riskAmount.toFixed(2)}</p>
                        <p className="text-indigo-600 font-semibold mt-1">${guide.suggestedPositionSize.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Recommendations */}
            {riskAnalysis.recommendations.length > 0 && (
              <Card className="border-0 shadow-lg bg-orange-50 dark:bg-orange-950/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <span>Risk Management Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {riskAnalysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 dark:text-gray-300">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
