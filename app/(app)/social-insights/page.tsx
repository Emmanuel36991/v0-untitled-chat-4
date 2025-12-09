"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, MessageSquare, Heart, Share2, Search, 
  Bell, Zap, MoreHorizontal, ShieldCheck, Trophy, Activity 
} from "lucide-react"
import { toast } from "sonner"

export default function CommunityPage() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSubscribed(true)
    toast.success("You're on the list.")
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 relative overflow-hidden flex flex-col font-sans">
      
      {/* =====================================================================================
          1. THE "COMING SOON" OVERLAY (Foreground)
          - Simplified to just "Coming Soon" as requested.
      ===================================================================================== */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
        <div className="w-full max-w-md relative group">
          
          {/* Glowing backdrop effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          
          <Card className="relative w-full bg-[#0F1219] border border-slate-800 shadow-2xl rounded-xl overflow-hidden">
            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <CardContent className="p-8 md:p-12 text-center relative z-10 space-y-8">
              
              {/* Icon & Badge */}
              <div className="flex flex-col items-center gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transform rotate-3">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-widest font-bold">
                  Under Construction
                </Badge>
              </div>

              {/* Headlines - Minimal */}
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white tracking-tight">
                  Coming Soon
                </h2>
              </div>

              {/* Waitlist Form */}
              {!isSubscribed ? (
                <form onSubmit={handleJoinWaitlist} className="space-y-3 pt-2">
                  <div className="relative">
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="bg-slate-950/50 border-slate-700 text-white h-11 focus:border-indigo-500 transition-colors"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02]">
                    Notify Me
                  </Button>
                </form>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center gap-2 animate-in fade-in zoom-in">
                  <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white fill-white" />
                  </div>
                  <p className="text-emerald-400 font-medium">You're on the list.</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>


      {/* =====================================================================================
          2. THE BACKGROUND "SKELETON" UI
          - This is a fully built-out "fake" UI that sits in the background.
          - It is blurred and non-interactive to create depth and context.
      ===================================================================================== */}
      <div className="flex-1 opacity-20 blur-[6px] pointer-events-none select-none overflow-hidden grayscale-[0.3]">
        
        {/* Mock Navigation Bar */}
        <header className="h-16 border-b border-slate-800 bg-[#0F1219] flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" /> Community
            </h1>
            <div className="hidden md:flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <span className="px-4 py-1.5 bg-slate-800 rounded text-sm text-white font-medium shadow-sm">Feed</span>
              <span className="px-4 py-1.5 text-sm text-slate-500 font-medium">Leaderboard</span>
              <span className="px-4 py-1.5 text-sm text-slate-500 font-medium">Events</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <div className="w-full h-9 bg-slate-900 rounded-lg border border-slate-800"></div>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700"></div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
          
          {/* Left Sidebar (Topics) */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-[#0F1219] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Market Trends</h3>
              <div className="space-y-3">
                {['#ES_F Futures', '#Bitcoin Breakout', '#NFP_Prep', '#SupplyDemand'].map((tag, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <span className="text-slate-300 font-medium">{tag}</span>
                    <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0F1219] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Top Contributors</h3>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-800"></div>
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-slate-800 rounded mb-1.5"></div>
                    <div className="h-2 w-16 bg-slate-900 rounded"></div>
                  </div>
                  <Trophy className="w-4 h-4 text-amber-500 opacity-50" />
                </div>
              ))}
            </div>
          </div>

          {/* Center Feed (The Meat) */}
          <div className="col-span-1 lg:col-span-6 space-y-6">
            
            {/* Create Post Mock */}
            <div className="bg-[#0F1219] border border-slate-800 rounded-xl p-4 flex gap-4">
              <div className="h-10 w-10 rounded-full bg-indigo-600/20 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-10 bg-slate-900 rounded-lg border border-slate-800 mb-3"></div>
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-slate-900 rounded"></div>
                    <div className="h-8 w-8 bg-slate-900 rounded"></div>
                  </div>
                  <div className="h-8 w-24 bg-indigo-600/50 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Mock Post 1: Chart Analysis */}
            <div className="bg-[#0F1219] border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Alex_Trader</span>
                        <Badge variant="secondary" className="text-[10px] h-5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Pro</Badge>
                      </div>
                      <span className="text-xs text-slate-500">2 hours ago • EURUSD</span>
                    </div>
                  </div>
                  <MoreHorizontal className="text-slate-600" />
                </div>
                <p className="text-slate-300 mb-4">
                  Beautiful rejection off the 1.0850 level. Liquidity sweep confirmed on the 15m timeframe. Targeting recent lows. 📉
                </p>
                {/* Fake Chart Visualization */}
                <div className="h-64 w-full bg-slate-900 rounded-lg border border-slate-800 relative overflow-hidden mb-4 flex items-center justify-center">
                   <div className="w-full h-full opacity-30" style={{ 
                     backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                     backgroundSize: "20px 20px"
                   }}></div>
                   <div className="absolute inset-0 flex items-end justify-around px-8 pb-8 gap-2">
                      <div className="w-8 h-20 bg-emerald-500/40 rounded-sm"></div>
                      <div className="w-8 h-32 bg-emerald-500/40 rounded-sm"></div>
                      <div className="w-8 h-16 bg-rose-500/40 rounded-sm"></div>
                      <div className="w-8 h-40 bg-rose-500/40 rounded-sm"></div>
                      <div className="w-8 h-10 bg-emerald-500/40 rounded-sm"></div>
                   </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex gap-6 text-slate-500">
                    <div className="flex items-center gap-2"><Heart className="w-4 h-4" /> 24</div>
                    <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> 8</div>
                  </div>
                  <div className="flex items-center gap-2"><Share2 className="w-4 h-4" /></div>
                </div>
              </div>
            </div>

            {/* Mock Post 2: Text Discussion */}
            <div className="bg-[#0F1219] border border-slate-800 rounded-xl p-5">
               <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                  <div>
                    <div className="h-4 w-32 bg-slate-800 rounded mb-1"></div>
                    <div className="h-3 w-20 bg-slate-900 rounded"></div>
                  </div>
               </div>
               <div className="space-y-2">
                 <div className="h-4 w-full bg-slate-800 rounded"></div>
                 <div className="h-4 w-[90%] bg-slate-800 rounded"></div>
                 <div className="h-4 w-[60%] bg-slate-800 rounded"></div>
               </div>
            </div>

          </div>

          {/* Right Sidebar (Stats) */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
             <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-xl p-5">
                <h3 className="font-bold text-indigo-400 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Live Market Pulse
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-slate-300">Sentiment</span>
                      <span className="text-emerald-400 font-bold">Bullish</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-slate-300">Volume</span>
                      <span className="text-white font-bold">High</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-slate-300">Volatility</span>
                      <span className="text-amber-400 font-bold">Medium</span>
                   </div>
                </div>
             </div>

             <div className="bg-[#0F1219] border border-slate-800 rounded-xl p-5">
                <h3 className="font-bold text-slate-300 mb-4">Suggested Mentors</h3>
                <div className="space-y-4">
                   {[1, 2].map(i => (
                     <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-slate-800"></div>
                           <div className="h-3 w-20 bg-slate-800 rounded"></div>
                        </div>
                        <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
