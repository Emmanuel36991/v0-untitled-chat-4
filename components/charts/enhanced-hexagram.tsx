"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Target, Activity, ShieldAlert, RefreshCw, TrendingUp, Zap } from "lucide-react"

interface HexagramProps {
  winPercentage: number
  consistency: number
  maxDrawdown: number
  recoveryFactor: number
  profitFactor: number
  avgWinLoss: number
  totalScore: number
  className?: string
}

export function EnhancedHexagram({
  winPercentage,
  consistency,
  maxDrawdown,
  recoveryFactor,
  profitFactor,
  avgWinLoss,
  totalScore,
  className,
}: HexagramProps) {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null)

  // New "Trader DNA" layout: a vertical list of metric progress bars with icons.
  const dnaMetrics = [
    { label: "Win Rate", value: Math.min(Math.max(winPercentage, 0), 100), icon: <Target className="w-4 h-4 text-emerald-500" />, color: "bg-emerald-500", raw: `${winPercentage.toFixed(1)}%` },
    { label: "Consistency", value: Math.min(Math.max(consistency, 0), 100), icon: <Activity className="w-4 h-4 text-blue-500" />, color: "bg-blue-500", raw: `${consistency.toFixed(0)}/100` },
    { label: "Risk Mgmt", value: Math.min(Math.max(maxDrawdown, 0), 100), icon: <ShieldAlert className="w-4 h-4 text-rose-500" />, color: "bg-rose-500", raw: `${maxDrawdown.toFixed(0)}/100` },
    { label: "Recovery", value: Math.min(Math.max(recoveryFactor, 0), 100), icon: <RefreshCw className="w-4 h-4 text-amber-500" />, color: "bg-amber-500", raw: `${recoveryFactor.toFixed(0)}/100` },
    { label: "Profit Factor", value: Math.min(Math.max(profitFactor * 20, 0), 100), icon: <TrendingUp className="w-4 h-4 text-indigo-500" />, color: "bg-indigo-500", raw: profitFactor.toFixed(2) },
    { label: "Efficiency", value: Math.min(Math.max(avgWinLoss, 0), 100), icon: <Zap className="w-4 h-4 text-violet-500" />, color: "bg-violet-500", raw: `${avgWinLoss.toFixed(0)}/100` },
  ]

  return (
    <div className={cn("w-full h-full flex flex-col justify-center px-4 py-6 gap-5", className)}>
      {dnaMetrics.map((metric, i) => (
        <div key={i} className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {metric.icon}
              <span id={`dna-label-${i}`} className="font-bold text-muted-foreground tracking-wide uppercase">{metric.label}</span>
            </div>
            <span className="font-mono font-bold text-foreground">{metric.raw}</span>
          </div>
          <div
            role="meter"
            aria-labelledby={`dna-label-${i}`}
            aria-valuenow={Math.round(metric.value)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 w-full bg-muted/50 rounded-full overflow-hidden flex"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metric.value}%` }}
              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
              className={cn("h-full rounded-full", metric.color)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
