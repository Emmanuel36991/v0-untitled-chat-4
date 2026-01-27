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
  ShieldAlert,
  Sparkles
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const HUDCard = ({ label, value, subtext, icon: Icon, trend, trendColor = "text-emerald-600" }: any) => (
  <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <CardContent className="p-5">
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
        <Icon className="w-4 h-4 text-indigo-500/80" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight font-mono">{value}</span>
        {subtext && <span className="text-xs text-slate-400 font-medium">{subtext}</span>}
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-xs font-mono">
          <span className={`${trendColor} font-medium bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700`}>{trend}</span>
          <span className="text-slate-500 ml-2">vs 7d avg</span>
        </div>
      )}
    </CardContent>
  </Card>
)

export default function PsychologyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.4] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                Trader Mindset Journal
              </span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium tracking-wide">
              Track your emotional state and optimize performance.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"/>
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
            value="12" 
            subtext="DAYS"
            icon={Zap} 
            trend="+2"
            trendColor="text-emerald-600 bg-emerald-50"
          />
          <HUDCard 
            label="Focus Score" 
            value="8.4" 
            subtext="/ 10.0"
            icon={Target} 
            trend="+0.3"
            trendColor="text-emerald-600 bg-emerald-50"
          />
          <HUDCard 
            label="Risk Alert" 
            value="FOMO" 
            subtext="DETECTED"
            icon={ShieldAlert} 
            trend="High Risk"
            trendColor="text-rose-600 bg-rose-50"
          />
          <HUDCard 
            label="Total Entries" 
            value="143" 
            subtext="LOGS"
            icon={CalendarDays} 
            trend="+5"
            trendColor="text-indigo-600 bg-indigo-50"
          />
        </motion.div>

        <Separator className="bg-slate-200 my-2" />

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
