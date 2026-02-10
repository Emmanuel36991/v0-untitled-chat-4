"use client"

import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import type { Trade } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    TrendingUp, TrendingDown, Target, Brain, Shield,
    Activity, AlertTriangle, CheckCircle2, Zap,
    BarChart3, RefreshCw, ArrowRight, Sparkles, Microscope
} from 'lucide-react'
import { analyzeSetupPatterns } from "@/lib/insights/setup-analyzer"
import { analyzePsychologyPatterns } from "@/lib/insights/psychology-analyzer"
import { analyzeAndCalculateRisk } from "@/lib/insights/risk-calculator"
import { SetupScatterChart } from "@/components/insights/setup-scatter-chart"
import { cn } from "@/lib/utils"

interface InsightsViewProps {
    trades: Trade[]
    isLoading: boolean
}

export function InsightsView({ trades, isLoading }: InsightsViewProps) {
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)
    const [aiReport, setAiReport] = useState<string | null>(null)

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
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
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
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Microscope className="w-12 h-12 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Intelligence Coming Soon</h1>
            <p className="text-slate-500 max-w-md mb-8">
                Advanced AI-powered insights and trading intelligence features are currently in development. Check back soon for deep analysis of your trading patterns, psychology, and risk profile.
            </p>
            <Button asChild variant="outline">
                <a href="/analytics">Back to Analytics</a>
            </Button>
        </div>
    )

}
