"use client"

import React from "react"
import { motion } from "framer-motion"
import SimplePsychologyJournal from "@/components/journal/simple-psychology-journal"
import PsychologyAnalytics from "@/components/journal/psychology-analytics"
import {
  Activity,
  Brain,
  Target,
  Zap,
  CalendarDays,
  ShieldAlert,
  BarChart3
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import PsychologyInsightsPanel from "@/components/psychology/psychology-insights-panel"
import type { Trade } from "@/types"

interface PsychologyStats {
  disciplineScore: number
  dominantEmotion: string
  winRate: number
  totalEntries: number
  currentStreak: number
  focusScore: number
  riskAlert: string
  totalJournalEntries: number
}

interface Props {
  stats: PsychologyStats | null
  trades: Trade[]
}

const HUDCard = ({ label, value, subtext, icon: Icon, trend, trendColor = "text-emerald-600 dark:text-emerald-400" }: any) => (
  <Card className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border-slate-200 dark:border-zinc-800 shadow-lg relative overflow-hidden group hover:border-blue-300 dark:hover:border-zinc-700 transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 dark:from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <CardContent className="p-5">
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-600 dark:text-zinc-500 text-[10px] font-mono font-medium uppercase tracking-widest">{label}</span>
        <Icon className="w-4 h-4 text-blue-600 dark:text-indigo-500/80" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight font-mono">{value}</span>
        {subtext && <span className="text-xs text-slate-600 dark:text-zinc-500 font-medium">{subtext}</span>}
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-xs font-mono">
          <span className={`${trendColor} font-medium bg-slate-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded border border-slate-300 dark:border-zinc-700/50`}>{trend}</span>
          <span className="text-slate-500 dark:text-zinc-600 ml-2">vs 7d avg</span>
        </div>
      )}
    </CardContent>
  </Card>
)

export default function PsychologyPageClient({ stats, trades }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-50 via-slate-50/90 to-slate-50 dark:from-zinc-950 dark:via-zinc-950/90 dark:to-zinc-950 pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Brain className="w-6 h-6 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-zinc-100 dark:to-zinc-400">
                Trader Mindset Journal
              </span>
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 mt-1 text-sm font-medium tracking-wide">
              Track your emotional state and optimize performance.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-full shadow-inner backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            JOURNAL ACTIVE
          </div>
        </motion.div>

        {/* Top HUD (Heads Up Display) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <HUDCard
            label="Current Streak"
            value={stats?.currentStreak || "0"}
            subtext="DAYS"
            icon={Zap}
            trend={stats && stats.currentStreak >= 7 ? `+${Math.floor(stats.currentStreak / 7)} weeks` : stats && stats.currentStreak > 0 ? "Building" : "Start Today"}
            trendColor={stats && stats.currentStreak >= 7 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-500"}
          />
          <HUDCard
            label="Focus Score"
            value={stats?.focusScore ? stats.focusScore.toFixed(1) : "0.0"}
            subtext="/ 10.0"
            icon={Target}
            trend={stats && stats.focusScore >= 7 ? "Excellent" : stats && stats.focusScore >= 5 ? "Good" : "Improve"}
            trendColor={stats && stats.focusScore >= 7 ? "text-emerald-600 dark:text-emerald-400" : stats && stats.focusScore >= 5 ? "text-blue-600 dark:text-indigo-400" : "text-amber-600 dark:text-amber-500"}
          />
          <HUDCard
            label="Risk Alert"
            value={stats?.riskAlert || "None"}
            subtext={stats?.riskAlert && stats.riskAlert !== "None" ? "DETECTED" : "CLEAR"}
            icon={ShieldAlert}
            trend={stats?.riskAlert && stats.riskAlert !== "None" ? "High Risk" : "Low Risk"}
            trendColor={stats?.riskAlert && stats.riskAlert !== "None" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}
          />
          <HUDCard
            label="Total Entries"
            value={stats?.totalJournalEntries || "0"}
            subtext="LOGS"
            icon={CalendarDays}
            trend={stats && stats.totalJournalEntries >= 30 ? "+30 Logs" : stats && stats.totalJournalEntries > 0 ? `+${stats.totalJournalEntries}` : "No Data"}
            trendColor="text-blue-600 dark:text-indigo-400"
          />
        </motion.div>

        <Separator className="bg-slate-200 dark:bg-zinc-800/50 my-2" />



        {/* Psychology Insights Panel */}
        <div className="mb-6">
          <PsychologyInsightsPanel trades={trades} />
        </div>

        <Separator className="bg-slate-200 dark:bg-zinc-800/50 my-2" />

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">

          {/* Left Column: Input Interface (40%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 w-full"
          >
            <div className="sticky top-6">
              <SimplePsychologyJournal />
            </div>
          </motion.div>

          {/* Right Column: Analytics & Visualization (60%) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7 w-full h-full"
          >
            <PsychologyAnalytics
              disciplineScore={stats?.disciplineScore || 0}
              dominantEmotion={stats?.dominantEmotion || "Unknown"}
              winRate={stats?.winRate || 0}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
