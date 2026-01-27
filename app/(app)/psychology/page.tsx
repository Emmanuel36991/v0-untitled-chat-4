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
  TrendingUp,
  ShieldAlert
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const HUDCard = ({ label, value, subtext, icon: Icon, trend, trendColor = "text-emerald-500" }: any) => (
  <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-xl relative overflow-hidden group hover:border-zinc-700 transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <CardContent className="p-5">
      <div className="flex justify-between items-start mb-2">
        <span className="text-zinc-500 text-[10px] font-mono font-medium uppercase tracking-widest">{label}</span>
        <Icon className="w-4 h-4 text-indigo-400/80" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-zinc-100 tracking-tight font-mono">{value}</span>
        {subtext && <span className="text-xs text-zinc-500 font-medium">{subtext}</span>}
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-xs font-mono">
          <span className={`${trendColor} font-medium bg-zinc-950/50 px-1.5 py-0.5 rounded`}>{trend}</span>
          <span className="text-zinc-600 ml-2">vs 7d avg</span>
        </div>
      )}
    </CardContent>
  </Card>
)

export default function PsychologyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Global Tech Grid Background */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 pointer-events-none" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
              <Brain className="w-6 h-6 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500">
                Psychology Command Center
              </span>
            </h1>
            <p className="text-zinc-500 mt-1 text-sm font-medium tracking-wide">
              MINDSET OPTIMIZATION PROTOCOL // V2.0
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400 bg-zinc-900/80 backdrop-blur border border-zinc-800 px-3 py-1.5 rounded-full shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"/>
            SYSTEM ONLINE
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
            value="12" 
            subtext="DAYS"
            icon={Zap} 
            trend="+2"
            trendColor="text-emerald-400"
          />
          <HUDCard 
            label="Mental Clarity" 
            value="8.4" 
            subtext="/ 10.0"
            icon={Target} 
            trend="+0.3"
            trendColor="text-emerald-400"
          />
          <HUDCard 
            label="Trigger Alert" 
            value="FOMO" 
            subtext="DETECTED"
            icon={ShieldAlert} 
            trend="High Risk"
            trendColor="text-rose-400"
          />
          <HUDCard 
            label="Total Logs" 
            value="143" 
            subtext="ENTRIES"
            icon={CalendarDays} 
            trend="+5"
            trendColor="text-indigo-400"
          />
        </motion.div>

        <Separator className="bg-zinc-800/50 my-2" />

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
            <PsychologyAnalytics />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
