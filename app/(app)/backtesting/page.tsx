"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  FlaskConical, 
  Cpu, 
  LineChart, 
  ShieldCheck, 
  Zap,
  Hammer
} from "lucide-react"

export default function BacktestingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/50 dark:bg-[#0B0D12] p-6">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl relative">
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

            <div className="relative z-10 p-8 md:p-12 text-center">
              
              {/* Icon */}
              <div className="mx-auto w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-inner transform rotate-3">
                <FlaskConical className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>

              {/* Status Badge */}
              <Badge variant="secondary" className="mb-6 px-4 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                <Hammer className="w-3 h-3 mr-2" /> Engineering in Progress
              </Badge>

              {/* Text */}
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                Strategy Engine V2
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed mb-10">
                We are completely rebuilding the backtesting core to support institutional-grade simulation. 
                Get ready for tick-level precision and multi-asset replay.
              </p>

              {/* Upcoming Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10 text-left">
                <FeatureItem 
                  icon={Cpu} 
                  title="Cloud Execution" 
                  desc="Run 10,000+ simulations in seconds" 
                />
                <FeatureItem 
                  icon={LineChart} 
                  title="Deep Analytics" 
                  desc="Sharpe, Sortino, and Monte Carlo risk analysis" 
                />
                <FeatureItem 
                  icon={ShieldCheck} 
                  title="Reality Check" 
                  desc="Advanced slippage & commission modeling" 
                />
                <FeatureItem 
                  icon={Zap} 
                  title="Gen-AI Optimization" 
                  desc="Let AI tune your parameters automatically" 
                />
              </div>

              {/* Action */}
              <div className="flex justify-center">
                <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
                  </Link>
                </Button>
              </div>

            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
        <Icon className="w-5 h-5 text-indigo-500" />
      </div>
      <div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
