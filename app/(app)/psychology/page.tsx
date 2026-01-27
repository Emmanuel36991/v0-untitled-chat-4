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
  TrendingUp 
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const HUDCard = ({ label, value, subtext, icon: Icon, trend }: any) => (
  <Card className="bg-zinc-900 border-zinc-800 shadow-lg relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <CardContent className="p-5">
      <div className="flex justify-between items-start mb-2">
        <span className="text-zinc-500 text-xs font-mono font-medium uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-indigo-500" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {subtext && <span className="text-xs text-zinc-500 mb-1">{subtext}</span>}
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-xs">
          <span className="text-emerald-500 font-medium">{trend}</span>
          <span className="text-zinc-600 ml-1">vs last week</span>
        </div>
      )}
    </CardContent>
  </Card>
)

export default function PsychologyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* 1. Global Visual Language: Grid Background */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-indigo-500" />
              Trader Mindset Protocol
            </h1>
            <p className="text-zinc-400 mt-1 text-sm max-w-xl">
              Log your mental state, track emotional triggers, and optimize your psychological edge.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
            SYSTEM ACTIVE
          </div>
        </motion.div>

        {/* 2. Top Section (The HUD) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <HUDCard 
            label="Current Streak" 
            value="12 Days" 
            icon={Zap} 
            trend="+2"
          />
          <HUDCard 
            label="Avg. Discipline" 
            value="8.4/10" 
            icon={Target} 
            trend="+0.3"
          />
          <HUDCard 
            label="Primary State" 
            value="Flow" 
            subtext="Last 5 sessions"
            icon={Activity} 
          />
          <HUDCard 
            label="Journal Entries" 
            value="143" 
            icon={CalendarDays} 
            trend="+5"
          />
        </motion.div>

        <Separator className="bg-zinc-800/50" />

        {/* 3. Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Input - 40%) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="sticky top-24">
              <SimplePsychologyJournal />
            </div>
          </motion.div>

          {/* Right Column (Insights - 60%) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* We pass a 'minimal' prop or control the analytics view here to ensure 
                it fits the dashboard aesthetic. Ideally, PsychologyAnalytics 
                is refactored to be a grid of charts itself.
            */}
            <PsychologyAnalytics />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
