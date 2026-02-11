"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import {
    Lightbulb,
    TrendingUp,
    TrendingDown,
    Brain,
    Target,
    AlertTriangle,
    ArrowRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { analyzePsychologyCorrelation, PsychologyCorrelationResult } from "@/lib/insights/psychology-correlation"
import HabitsComparisonChart from "@/components/psychology/habits-comparison-chart"
import type { Trade } from "@/types"

interface Props {
    trades: Trade[]
}

export default function PsychologyInsightsPanel({ trades }: Props) {
    // Memoize the expensive analysis
    const correlationData = useMemo(() => {
        return analyzePsychologyCorrelation(trades)
    }, [trades])

    if (!trades || trades.length === 0) {
        return null
    }

    const {
        topPositiveFactors,
        topNegativeFactors,
        recommendation,
        factors
    } = correlationData

    const goodHabits = factors.filter(f => f.type === 'good')
    const badHabits = factors.filter(f => f.type === 'bad')

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg">
                    <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mindset Performance Insights</h2>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                        AI-driven analysis of how your psychology impacts your P&L
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Recommendation Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-1"
                >
                    <Card className="h-full bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-900/50 border-indigo-100 dark:border-indigo-500/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Lightbulb className="w-24 h-24 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                <Lightbulb className="w-5 h-5" />
                                AI Strategy Insight
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                                {recommendation}
                            </p>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-zinc-500">Trades Analyzed</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-200">{trades.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-zinc-500">Psychology Tagged</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-200">
                                        {Math.round((correlationData.tradesWithFactors / trades.length) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Strengths */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-1"
                >
                    <Card className="h-full bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-base">
                                <TrendingUp className="w-5 h-5" />
                                Top Performance Drivers
                            </CardTitle>
                            <CardDescription>Conditions where you win most often</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {topPositiveFactors.length > 0 ? (
                                <div className="space-y-4">
                                    {topPositiveFactors.slice(0, 3).map((factor, i) => (
                                        <div key={factor.id} className="group relative">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-slate-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                    {factor.label}
                                                </span>
                                                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                                    {(factor.winRate * 100).toFixed(0)}% WR
                                                </Badge>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${factor.winRate * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 text-right">
                                                {factor.tradeCount} trades • ${factor.avgPnl.toFixed(0)} avg
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-center p-4">
                                    <p className="text-sm text-slate-500 dark:text-zinc-500 italic">
                                        Not enough winning trades with positive habits tagged yet.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Weaknesses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-1"
                >
                    <Card className="h-full bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-base">
                                <AlertTriangle className="w-5 h-5" />
                                Leaks & Bad Habits
                            </CardTitle>
                            <CardDescription>Conditions that hurt your performance</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {topNegativeFactors.length > 0 ? (
                                <div className="space-y-4">
                                    {topNegativeFactors.slice(0, 3).map((factor, i) => (
                                        <div key={factor.id} className="group relative">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-slate-700 dark:text-zinc-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                                    {factor.label}
                                                </span>
                                                <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                                                    {(factor.winRate * 100).toFixed(0)}% WR
                                                </Badge>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${factor.winRate * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 text-right">
                                                {factor.tradeCount} trades • ${factor.avgPnl.toFixed(0)} avg
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-center p-4">
                                    <p className="text-sm text-slate-500 dark:text-zinc-500 italic">
                                        Great job! No significant negative habit correlations found yet.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Habits Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <HabitsComparisonChart
                    goodHabits={goodHabits.map(h => ({
                        name: h.label,
                        winRate: h.winRate,
                        tradeCount: h.tradeCount,
                        avgPnL: h.avgPnl,
                        type: 'good'
                    }))}
                    badHabits={badHabits.map(h => ({
                        name: h.label,
                        winRate: h.winRate,
                        tradeCount: h.tradeCount,
                        avgPnL: h.avgPnl,
                        type: 'bad'
                    }))}
                    isDark={true} // We can detect this prop or pass it down, defaulting to true for now as the layout seems dark-mode heavy
                />
            </motion.div>
        </div>
    )
}
