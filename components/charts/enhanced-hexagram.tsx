"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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

  // Normalize data to 0-100 scale for the chart
  const data = {
    "Win Rate": Math.min(Math.max(winPercentage, 0), 100),
    "Consistency": Math.min(Math.max(consistency, 0), 100),
    "Risk Mgmt": Math.min(Math.max(maxDrawdown, 0), 100),
    "Recovery": Math.min(Math.max(recoveryFactor, 0), 100),
    "Profit Factor": Math.min(Math.max(profitFactor * 20, 0), 100), // Scale PF: 5.0 = 100
    "Efficiency": Math.min(Math.max(avgWinLoss, 0), 100),
  }

  const metrics = Object.keys(data)
  const values = Object.values(data)
  const numMetrics = metrics.length
  const radius = 120
  const center = { x: 180, y: 180 } // Center of a 360x360 SVG

  // Helper to calculate polygon points
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numMetrics - Math.PI / 2
    const r = (value / 100) * radius
    return {
      x: center.x + Math.cos(angle) * r,
      y: center.y + Math.sin(angle) * r,
    }
  }

  const polygonPoints = values
    .map((v, i) => {
      const p = getPoint(i, v)
      return `${p.x},${p.y}`
    })
    .join(" ")

  const fullPolygonPoints = values
    .map((_, i) => {
      const p = getPoint(i, 100)
      return `${p.x},${p.y}`
    })
    .join(" ")

  return (
    <div className={cn("relative w-full h-full flex flex-col items-center justify-center", className)}>
      <div className="relative w-full aspect-square max-w-[400px]">
        {/* Tooltip Portal - Positioned absolutely within the container but z-indexed above */}
        <AnimatePresence>
          {hoveredMetric && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md border border-slate-700 pointer-events-none"
            >
              <span className="font-bold text-indigo-400">{hoveredMetric}: </span>
              <span className="font-mono">
                {data[hoveredMetric as keyof typeof data].toFixed(1)}/100
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <svg
          viewBox="0 0 360 360"
          className="w-full h-full overflow-visible"
          style={{ filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.1))" }}
        >
          {/* Defs for Gradients */}
          <defs>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.05)" />
            </linearGradient>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <radialGradient id="pulseGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
            </radialGradient>
          </defs>

          {/* Background Grid Rings - Pulsing */}
          <motion.circle
            cx={center.x}
            cy={center.y}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.05"
            strokeWidth="1"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <polygon
              key={i}
              points={values
                .map((_, idx) => {
                  const p = getPoint(idx, scale * 100)
                  return `${p.x},${p.y}`
                })
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeDasharray="4 4"
              className="text-slate-400 dark:text-slate-600"
            />
          ))}

          {/* Radar Background Area */}
          <polygon points={fullPolygonPoints} fill="url(#gridGradient)" />

          {/* Connecting Lines from Center */}
          {metrics.map((_, i) => {
            const p = getPoint(i, 100)
            return (
              <line
                key={i}
                x1={center.x}
                y1={center.y}
                x2={p.x}
                y2={p.y}
                stroke="currentColor"
                strokeOpacity="0.1"
                className="text-slate-300 dark:text-slate-700"
              />
            )
          })}

          {/* The Data Polygon */}
          <motion.polygon
            points={polygonPoints}
            fill="rgba(99, 102, 241, 0.45)" // Increased opacity
            stroke="#6366f1"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Data Points & Labels */}
          {metrics.map((metric, i) => {
            const p = getPoint(i, values[i])
            const labelP = getPoint(i, 125) // Push labels out further

            return (
              <g key={i} onMouseEnter={() => setHoveredMetric(metric)} onMouseLeave={() => setHoveredMetric(null)}>
                {/* Data Point Dot */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#fff"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  whileHover={{ scale: 1.5 }}
                  className="cursor-pointer"
                />

                {/* Metric Label */}
                <text
                  x={labelP.x}
                  y={labelP.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    "text-2xs font-bold fill-slate-500 dark:fill-slate-400 uppercase tracking-widest pointer-events-none",
                    hoveredMetric === metric && "fill-indigo-600 dark:fill-indigo-400 font-extrabold scale-110 transition-all"
                  )}
                  style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.1)" }}
                >
                  {metric}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Center Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="relative">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 drop-shadow-sm">
              {totalScore}
            </span>
            <motion.div
              className="absolute -inset-4 bg-indigo-500/10 rounded-full -z-10"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
        </div>
      </div>
    </div>
  )
}
