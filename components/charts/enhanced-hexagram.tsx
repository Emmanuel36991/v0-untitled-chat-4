"use client"

import { useState, useMemo } from "react"

interface EnhancedHexagramProps {
  winPercentage: number
  consistency: number
  maxDrawdown: number
  recoveryFactor: number
  profitFactor: number
  avgWinLoss: number
  totalScore: number
}

const EnhancedHexagram = ({
  winPercentage,
  consistency,
  maxDrawdown,
  recoveryFactor,
  profitFactor,
  avgWinLoss,
  totalScore,
}: EnhancedHexagramProps) => {
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null)

  const metrics = useMemo(
    () => [
      {
        label: "Win Rate",
        value: Math.max(0, Math.min(100, winPercentage)),
        angle: 0,
        description: `${winPercentage.toFixed(1)}% successful trades`,
        category: "Performance",
      },
      {
        label: "Profit Factor",
        value: Math.max(0, Math.min(100, profitFactor)),
        angle: 60,
        description: `${(profitFactor / 20).toFixed(2)}x profit multiplier`,
        category: "Returns",
      },
      {
        label: "Risk/Reward",
        value: Math.max(0, Math.min(100, avgWinLoss)),
        angle: 120,
        description: `${avgWinLoss.toFixed(1)}% risk-adjusted ratio`,
        category: "Risk",
      },
      {
        label: "Consistency",
        value: Math.max(0, Math.min(100, consistency)),
        angle: 180,
        description: `${consistency.toFixed(1)}% outcome regularity`,
        category: "Stability",
      },
      {
        label: "Adaptability",
        value: Math.max(0, Math.min(100, recoveryFactor)),
        angle: 240,
        description: `${recoveryFactor.toFixed(1)}% market response`,
        category: "Flexibility",
      },
      {
        label: "Risk Control",
        value: Math.max(0, Math.min(100, 100 - maxDrawdown)),
        angle: 300,
        description: `${(100 - maxDrawdown).toFixed(1)}% drawdown protection`,
        category: "Protection",
      },
    ],
    [winPercentage, consistency, maxDrawdown, recoveryFactor, profitFactor, avgWinLoss],
  )

  const getMetricColor = (value: number) => {
    // Professional Gradient Theme (Violet/Indigo/Blue)
    if (value >= 80) return { fill: "#8b5cf6", stroke: "#7c3aed", label: "text-violet-600" }
    if (value >= 65) return { fill: "#6366f1", stroke: "#4f46e5", label: "text-indigo-600" }
    if (value >= 50) return { fill: "#3b82f6", stroke: "#2563eb", label: "text-blue-600" }
    return { fill: "#94a3b8", stroke: "#64748b", label: "text-slate-500" }
  }

  const center = 200
  const maxRadius = 110
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]

  const dataPath = useMemo(() => {
    return (
      metrics
        .map((metric, i) => {
          const angle = (metric.angle - 90) * (Math.PI / 180)
          const baseRadius = (metric.value / 100) * maxRadius
          // We slightly expand the visual path on hover for effect, 
          // but we DO NOT move the hit targets to prevent glitches.
          const radius = hoveredMetric === i ? baseRadius * 1.05 : baseRadius
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          return `${i === 0 ? "M" : "L"} ${x} ${y}`
        })
        .join(" ") + " Z"
    )
  }, [metrics, hoveredMetric, center, maxRadius])

  const getOverallColor = () => {
    if (totalScore >= 80) return "from-violet-500/20 via-indigo-500/10 to-blue-500/15 border-violet-200 shadow-violet-500/20"
    if (totalScore >= 65) return "from-indigo-500/20 via-blue-500/10 to-cyan-500/15 border-indigo-200 shadow-indigo-500/20"
    if (totalScore >= 50) return "from-blue-500/20 via-sky-500/10 to-teal-500/15 border-blue-200 shadow-blue-500/20"
    return "from-slate-200/20 via-gray-200/10 to-slate-200/15 border-slate-200 shadow-slate-200/20"
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className={`relative transition-all duration-500 w-full max-w-[360px]`}>
        
        {/* Chart SVG */}
        <div className="relative">
          <svg
            width="400"
            height="420"
            viewBox="0 0 400 420"
            className="w-full h-auto drop-shadow-xl"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Spider Grid */}
            {gridLevels.map((level, i) => {
              const gridPath = Array.from({ length: 6 }, (_, j) => {
                  const angle = (j * 60 - 90) * (Math.PI / 180)
                  const x = center + maxRadius * level * Math.cos(angle)
                  const y = center + maxRadius * level * Math.sin(angle)
                  return `${j === 0 ? "M" : "L"} ${x} ${y}`
                }).join(" ") + " Z"

              return (
                <path
                  key={i}
                  d={gridPath}
                  fill="none"
                  stroke={i === 4 ? "#cbd5e1" : "#e2e8f0"} // Darker outer ring
                  strokeWidth={i === 4 ? "1.5" : "1"}
                  strokeDasharray={i === 4 ? "0" : "4 4"}
                />
              )
            })}

            {/* Axis Lines */}
            {metrics.map((metric, i) => {
              const angle = (metric.angle - 90) * (Math.PI / 180)
              const x = center + maxRadius * Math.cos(angle)
              const y = center + maxRadius * Math.sin(angle)
              return (
                <line
                  key={`axis-${i}`}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              )
            })}

            {/* Data Polygon */}
            <path
              d={dataPath}
              fill="url(#hexGradient)"
              stroke="#6366f1"
              strokeWidth="2.5"
              className="transition-all duration-300 ease-out"
              filter="url(#glow)"
            />

            {/* Interactive Points & Labels */}
            {metrics.map((metric, i) => {
              const angle = (metric.angle - 90) * (Math.PI / 180)
              const radius = (metric.value / 100) * maxRadius
              const x = center + radius * Math.cos(angle)
              const y = center + radius * Math.sin(angle)
              
              const labelRadius = maxRadius + 35
              const lx = center + labelRadius * Math.cos(angle)
              const ly = center + labelRadius * Math.sin(angle)
              
              const color = getMetricColor(metric.value)
              const isHovered = hoveredMetric === i

              return (
                <g key={`group-${i}`}>
                  {/* Label Text */}
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-[11px] font-bold uppercase tracking-wider transition-all duration-200 select-none ${isHovered ? 'fill-indigo-600 font-extrabold' : 'fill-slate-400'}`}
                  >
                    {metric.label}
                  </text>

                  {/* Visible Dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill="white"
                    stroke={color.stroke}
                    strokeWidth="2"
                    className="transition-all duration-200 pointer-events-none" 
                  />

                  {/* INVISIBLE HIT TARGET (Large radius for stability) */}
                  <circle
                    cx={x}
                    cy={y}
                    r="24" 
                    fill="transparent"
                    className="cursor-pointer z-50"
                    onMouseEnter={() => setHoveredMetric(i)}
                    onMouseLeave={() => setHoveredMetric(null)}
                    onClick={() => setSelectedMetric(selectedMetric === i ? null : i)}
                  />
                </g>
              )
            })}
          </svg>

          {/* Central Score Detail (appears on hover) */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 ${hoveredMetric !== null ? 'opacity-100' : 'opacity-0'}`}>
             <div className="bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-xl shadow-xl text-center min-w-[140px]">
                {hoveredMetric !== null && (
                  <>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{metrics[hoveredMetric].category}</p>
                    <p className="text-2xl font-bold text-white">{metrics[hoveredMetric].value.toFixed(0)}%</p>
                    <p className="text-[10px] text-slate-300 mt-1">{metrics[hoveredMetric].description}</p>
                  </>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { EnhancedHexagram }
export default EnhancedHexagram
