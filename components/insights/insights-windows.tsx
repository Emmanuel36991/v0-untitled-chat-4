"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Target, Brain, Shield, CheckCircle, AlertTriangle, Award, BarChart3 } from 'lucide-react'
import { PulseIcon } from "@/components/icons/system-icons"
import { analyzeSetupPatterns } from "@/lib/insights/setup-analyzer"
import { analyzePsychologyPatterns } from "@/lib/insights/psychology-analyzer"
import { analyzeAndCalculateRisk } from "@/lib/insights/risk-calculator"
import type { Trade } from "@/types"
import { cn } from "@/lib/utils"

interface InsightsWindowsProps {
  trades: Trade[]
}

export function InsightsWindows({ trades }: InsightsWindowsProps) {
  const [activeTab, setActiveTab] = useState("setups")

  const setupAnalysis = useMemo(() => analyzeSetupPatterns(trades), [trades])
  const psychologyAnalysis = useMemo(() => analyzePsychologyPatterns(trades), [trades])
  const riskAnalysis = useMemo(() => analyzeAndCalculateRisk(trades), [trades])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-700 rounded-lg shadow-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">AI Trading Intelligence</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Setup Patterns, Psychology & Risk Analysis</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="relative z-10 px-6 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100/60 dark:bg-slate-700/60 p-1 rounded-xl backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60">
            <TabsTrigger value="setups" className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all duration-300 rounded-lg">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-semibold">Setup Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="psychology" className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all duration-300 rounded-lg">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-semibold">Psychology</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all duration-300 rounded-lg">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-semibold">Risk Calc</span>
            </TabsTrigger>
          </TabsList>

          {/* Setup Patterns Tab */}
          <TabsContent value="setups" className="mt-6 space-y-4 pb-6">
            {setupAnalysis.personalEdge && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-slate-900 dark:text-white">Your Personal Edge</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Best Setup</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{setupAnalysis.personalEdge.setupName}</p>
                    </div>
                    <div className="space-y-1 bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Win Rate</p>
                      <p className="text-sm font-bold text-green-600">{(setupAnalysis.personalEdge.winRate * 100).toFixed(1)}%</p>
                    </div>
                    <div className="space-y-1 bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Optimal RRR</p>
                      <p className="text-sm font-bold text-blue-600">1:{setupAnalysis.personalEdge.optimalRRR.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Top Setups</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {setupAnalysis.topSetups.slice(0, 3).map((setup, idx) => (
                    <div key={idx} className="p-2.5 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{setup.setupName}</span>
                        <span className="font-bold text-green-600">{(setup.winRate * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span>Underperformers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {setupAnalysis.bottomSetups.slice(0, 3).map((setup, idx) => (
                    <div key={idx} className="p-2.5 bg-red-50 dark:bg-red-950/30 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{setup.setupName}</span>
                        <span className="font-bold text-red-600">{(setup.winRate * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Psychology Tab */}
          <TabsContent value="psychology" className="mt-6 space-y-4 pb-6">
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Edge-Enablers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {psychologyAnalysis.topEnablers.slice(0, 3).map((factor, idx) => (
                    <div key={idx} className="p-2.5 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{factor.factor}</span>
                        <span className="font-bold text-green-600">+{factor.impact.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Edge-Killers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {psychologyAnalysis.topKillers.slice(0, 3).map((factor, idx) => (
                    <div key={idx} className="p-2.5 bg-red-50 dark:bg-red-950/30 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{factor.factor}</span>
                        <span className="font-bold text-red-600">{factor.impact.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Calculator Tab */}
          <TabsContent value="risk" className="mt-6 space-y-4 pb-6">
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Current Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{(riskAnalysis.currentWinRate * 100).toFixed(1)}%</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Kelly %</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-indigo-600">{riskAnalysis.kellyCriterion.kellyPercent.toFixed(2)}%</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Profit Factor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">{riskAnalysis.profitFactor.toFixed(2)}x</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Max Drawdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">{riskAnalysis.drawdownMetrics.maxDrawdown.toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-indigo-50 dark:bg-indigo-950/30">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <PulseIcon className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm italic text-slate-700 dark:text-slate-300">{riskAnalysis.kellyCriterion.advice}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
