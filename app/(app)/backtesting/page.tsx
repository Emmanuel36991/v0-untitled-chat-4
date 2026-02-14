"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3, LineChart, Settings, Play, History,
  Bell, Calculator, Lock, Calendar, RefreshCw
} from "lucide-react"
import { PulseIcon } from "@/components/icons/system-icons"
import { toast } from "sonner"

export default function BacktestingPage() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSubscribed(true)
    toast.success("You're on the list for the Backtester beta.")
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 relative overflow-hidden flex flex-col font-sans">
      
      {/* =====================================================================================
          1. THE "COMING SOON" OVERLAY (Foreground)
          - Premium, dark aesthetic matching the Community page.
      ===================================================================================== */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
        <div className="w-full max-w-md relative group">
          
          {/* Glowing backdrop effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          
          <Card className="relative w-full bg-[#0F1219] border border-slate-800 shadow-2xl rounded-xl overflow-hidden">
            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <CardContent className="p-8 md:p-12 text-center relative z-10 space-y-8">
              
              {/* Icon & Badge */}
              <div className="flex flex-col items-center gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transform -rotate-3">
                  <History className="w-7 h-7 text-white" />
                </div>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-widest font-bold">
                  System Upgrade
                </Badge>
              </div>

              {/* Headlines */}
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Backtesting Engine
                </h2>
                <p className="text-slate-400 text-base leading-relaxed">
                  We are rebuilding the simulator from the ground up. High-speed replay, multi-timeframe analysis, and institutional-grade data.
                </p>
              </div>

              {/* Feature Teasers */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
                  <PulseIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-300">Instant Replay</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-slate-300">Advanced Stats</span>
                </div>
              </div>

              {/* Waitlist Form */}
              {!isSubscribed ? (
                <form onSubmit={handleJoinWaitlist} className="space-y-3 pt-2">
                  <div className="relative">
                    <Input 
                      type="email" 
                      placeholder="name@example.com" 
                      className="bg-slate-950/50 border-slate-700 text-white h-11 focus:border-blue-500 transition-colors"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]">
                    Notify Me
                  </Button>
                </form>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center gap-2 animate-in fade-in zoom-in">
                  <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white fill-white" />
                  </div>
                  <p className="text-emerald-400 font-medium">Notification set.</p>
                  <p className="text-emerald-500/70 text-xs">Prepare your strategies.</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>

      {/* =====================================================================================
          2. THE BACKGROUND "SKELETON" UI (Blurred)
          - Mimics a sophisticated Backtesting Dashboard
      ===================================================================================== */}
      <div className="flex-1 opacity-20 blur-[6px] pointer-events-none select-none overflow-hidden grayscale-[0.3] p-8">
        
        {/* Fake Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <div className="h-8 w-48 bg-slate-800 rounded-lg"></div>
            <div className="h-4 w-64 bg-slate-900 rounded-lg"></div>
          </div>
          <div className="flex gap-3">
             <div className="h-10 w-32 bg-slate-800 rounded-lg border border-slate-700"></div>
             <div className="h-10 w-10 bg-blue-600/20 rounded-lg border border-blue-600/50"></div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 h-full">
          
          {/* Left Sidebar: Strategy Config */}
          <div className="col-span-3 space-y-6">
             <div className="bg-[#0F1219] border border-slate-800 rounded-xl p-5 space-y-6">
                <div className="space-y-2">
                   <div className="h-4 w-24 bg-slate-800 rounded"></div>
                   <div className="h-10 w-full bg-slate-900 rounded border border-slate-800"></div>
                </div>
                <div className="space-y-2">
                   <div className="h-4 w-20 bg-slate-800 rounded"></div>
                   <div className="h-10 w-full bg-slate-900 rounded border border-slate-800"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <div className="h-4 w-16 bg-slate-800 rounded"></div>
                     <div className="h-10 w-full bg-slate-900 rounded border border-slate-800"></div>
                  </div>
                  <div className="space-y-2">
                     <div className="h-4 w-16 bg-slate-800 rounded"></div>
                     <div className="h-10 w-full bg-slate-900 rounded border border-slate-800"></div>
                  </div>
                </div>
                <div className="h-px w-full bg-slate-800 my-4"></div>
                <div className="space-y-3">
                   <div className="flex justify-between"><div className="h-4 w-20 bg-slate-800 rounded"></div><div className="h-4 w-4 bg-slate-800 rounded"></div></div>
                   <div className="flex justify-between"><div className="h-4 w-24 bg-slate-800 rounded"></div><div className="h-4 w-4 bg-slate-800 rounded"></div></div>
                   <div className="flex justify-between"><div className="h-4 w-16 bg-slate-800 rounded"></div><div className="h-4 w-4 bg-slate-800 rounded"></div></div>
                </div>
                <div className="h-12 w-full bg-blue-900/30 rounded-lg border border-blue-800/50 mt-4 flex items-center justify-center">
                   <Play className="w-5 h-5 text-blue-700" />
                </div>
             </div>
          </div>

          {/* Center: Charts & Result */}
          <div className="col-span-9 space-y-6">
             
             {/* Stats Row */}
             <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-[#0F1219] border border-slate-800 rounded-xl p-5 space-y-2">
                     <div className="flex justify-between items-start">
                        <div className="h-4 w-20 bg-slate-800 rounded"></div>
                        <div className="h-5 w-5 bg-slate-800 rounded-full"></div>
                     </div>
                     <div className="h-8 w-24 bg-slate-700 rounded"></div>
                  </div>
                ))}
             </div>

             {/* Main Chart Placeholder */}
             <div className="bg-[#0F1219] border border-slate-800 rounded-xl p-6 h-96 relative overflow-hidden">
                <div className="absolute inset-0 flex items-end px-6 pb-6 gap-2 opacity-50">
                   {/* Fake candles/bars */}
                   {[...Array(20)].map((_, i) => (
                      <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-sm" style={{ height: `${Math.random() * 80 + 10}%` }}></div>
                   ))}
                </div>
                <div className="absolute top-6 left-6 space-y-2">
                   <div className="h-6 w-32 bg-slate-800 rounded"></div>
                   <div className="h-4 w-48 bg-slate-900 rounded"></div>
                </div>
             </div>

             {/* Trade List Placeholder */}
             <div className="bg-[#0F1219] border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center mb-4">
                   <div className="h-5 w-32 bg-slate-800 rounded"></div>
                   <div className="h-8 w-24 bg-slate-900 rounded border border-slate-800"></div>
                </div>
                {[1,2,3].map(i => (
                   <div key={i} className="h-12 w-full bg-slate-900/50 rounded-lg border border-slate-800/50 flex items-center px-4 justify-between">
                      <div className="h-3 w-16 bg-slate-800 rounded"></div>
                      <div className="h-3 w-24 bg-slate-800 rounded"></div>
                      <div className="h-3 w-20 bg-slate-800 rounded"></div>
                      <div className="h-3 w-16 bg-slate-800 rounded"></div>
                   </div>
                ))}
             </div>

          </div>
        </div>
      </div>
    </div>
  )
}
