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
    if (value >= 80) return { fill: "#3b82f6", stroke: "#2563eb", label: "text-blue-400" }
    if (value >= 65) return { fill: "#60a5fa", stroke: "#3b82f6", label: "text-blue-300" }
    if (value >= 50) return { fill: "#93c5fd", stroke: "#60a5fa", label: "text-blue-200" }
    return { fill: "#bfdbfe", stroke: "#93c5fd", label: "text-blue-100" }
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
          const radius = hoveredMetric === i ? baseRadius * 1.08 : baseRadius
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          return `${i === 0 ? "M" : "L"} ${x} ${y}`
        })
        .join(" ") + " Z"
    )
  }, [metrics, hoveredMetric, center, maxRadius])

  const getOverallColor = () => {
    if (totalScore >= 80)
      return {
        bg: "from-blue-500/20 via-blue-400/10 to-blue-500/15",
        border: "border-blue-400/40",
        glow: "shadow-blue-500/30",
      }
    if (totalScore >= 65)
      return {
        bg: "from-blue-400/20 via-blue-300/10 to-blue-400/15",
        border: "border-blue-300/40",
        glow: "shadow-blue-400/30",
      }
    if (totalScore >= 50)
      return {
        bg: "from-blue-300/20 via-blue-200/10 to-blue-300/15",
        border: "border-blue-200/40",
        glow: "shadow-blue-300/30",
      }
    return {
      bg: "from-slate-200/20 via-slate-100/10 to-slate-200/15",
      border: "border-slate-300/40",
      glow: "shadow-slate-300/30",
    }
  }

  const overallColor = getOverallColor()

  return (
    <div className="w-full max-w-2xl">
      <div
        className={`relative bg-gradient-to-br ${overallColor.bg} backdrop-blur-xl rounded-3xl p-8 border ${overallColor.border} shadow-2xl ${overallColor.glow} transition-all duration-500 hover:shadow-2xl`}
      >
        <div className="absolute -inset-1 bg-gradient-to-br from-slate-600/10 via-blue-600/5 to-slate-600/10 rounded-3xl blur-2xl -z-10 opacity-50" />

        <div className="absolute inset-0 overflow-hidden rounded-3xl -z-5">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.03)_25%,rgba(59,130,246,0.03)_50%,transparent_50%,transparent_75%,rgba(59,130,246,0.03)_75%)] bg-[length:12px_12px]" />
        </div>

        <div className="relative z-10 mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-100 bg-clip-text text-transparent">
                Trading Hexagram
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Six-factor performance analysis</p>
            </div>

            <div className="relative">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${totalScore >= 80 ? "from-blue-500/30 to-blue-600/30" : totalScore >= 65 ? "from-blue-400/30 to-blue-500/30" : totalScore >= 50 ? "from-blue-300/30 to-blue-400/30" : "from-slate-300/30 to-slate-400/30"} rounded-2xl blur-xl`}
              />
              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-slate-200/60 dark:border-slate-700 shadow-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalScore}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">/100 Score</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { icon: "📊", label: "Performance", count: 1 },
              { icon: "💰", label: "Returns", count: 1 },
              { icon: "⚠️", label: "Risk", count: 2 },
              { icon: "🎯", label: "Stability", count: 2 },
            ].map((cat, i) => (
              <div
                key={i}
                className="px-2.5 py-1.5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-200/40 dark:border-slate-700/40 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm"
              >
                {cat.icon} <span className="ml-1">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mb-8">
          <svg
            width="400"
            height="420"
            viewBox="0 0 400 420"
            className="w-full h-auto max-w-md mx-auto"
            style={{
              filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15))",
            }}
          >
            <defs>
              <linearGradient id="dataFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                <stop offset="50%" stopColor="rgba(147, 197, 253, 0.6)" />
                <stop offset="100%" stopColor="rgba(191, 219, 254, 0.5)" />
              </linearGradient>

              <radialGradient id="dataFillRadial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                <stop offset="60%" stopColor="rgba(96, 165, 250, 0.6)" />
                <stop offset="100%" stopColor="rgba(147, 197, 253, 0.3)" />
              </radialGradient>

              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="softShadow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            </defs>

            {gridLevels.map((level, i) => {
              const gridPath =
                Array.from({ length: 6 }, (_, j) => {
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
                  stroke={`rgba(148, 163, 184, ${0.12 + level * 0.06})`}
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
              )
            })}

            {metrics.map((metric, i) => {
              const angle = (metric.angle - 90) * (Math.PI / 180)
              const x = center + maxRadius * Math.cos(angle)
              const y = center + maxRadius * Math.sin(angle)
              return (
                <line
                  key={`line-${i}`}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke={`rgba(148, 163, 184, ${hoveredMetric === i ? 0.4 : 0.15})`}
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
              )
            })}

            <path
              d={dataPath}
              fill="url(#dataFillRadial)"
              stroke="url(#dataFill)"
              strokeWidth="3"
              filter="url(#glow)"
              className="transition-all duration-500 ease-out"
              opacity="0.85"
            />

            {metrics.map((metric, i) => {
              const angle = (metric.angle - 90) * (Math.PI / 180)
              const radius = (metric.value / 100) * maxRadius
              const x = center + radius * Math.cos(angle)
              const y = center + radius * Math.sin(angle)
              const color = getMetricColor(metric.value)

              return (
                <g key={`point-${i}`}>
                  {(hoveredMetric === i || selectedMetric === i) && (
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill={color.fill}
                      opacity="0.15"
                      className="transition-all duration-200"
                    />
                  )}

                  <circle
                    cx={x}
                    cy={y}
                    r={hoveredMetric === i || selectedMetric === i ? "7" : "5"}
                    fill={color.fill}
                    stroke="white"
                    strokeWidth="2"
                    filter="url(#softShadow)"
                    className="transition-all duration-200 cursor-pointer hover:opacity-100"
                    opacity={hoveredMetric === i || selectedMetric === i ? "1" : "0.9"}
                    onMouseEnter={() => setHoveredMetric(i)}
                    onMouseLeave={() => setHoveredMetric(null)}
                    onClick={() => setSelectedMetric(selectedMetric === i ? null : i)}
                  />
                </g>
              )
            })}

            {metrics.map((metric, i) => {
              const angle = (metric.angle - 90) * (Math.PI / 180)
              const labelRadius = maxRadius + 55
              const x = center + labelRadius * Math.cos(angle)
              const y = center + labelRadius * Math.sin(angle)
              const color = getMetricColor(metric.value)
              const isActive = hoveredMetric === i || selectedMetric === i

              return (
                <g key={`label-${i}`}>
                  {isActive && (
                    <rect
                      x={x - 35}
                      y={y - 15}
                      width="70"
                      height="30"
                      rx="8"
                      fill="rgba(255, 255, 255, 0.1)"
                      stroke={color.fill}
                      strokeWidth="1"
                      opacity="0.6"
                    />
                  )}

                  <text
                    x={x}
                    y={y - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-bold text-sm transition-all duration-200"
                    fill={isActive ? color.fill : "#94a3b8"}
                    onMouseEnter={() => setHoveredMetric(i)}
                    onMouseLeave={() => setHoveredMetric(null)}
                    onClick={() => setSelectedMetric(selectedMetric === i ? null : i)}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    {metric.label}
                  </text>

                  <text
                    x={x}
                    y={y + 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs transition-all duration-200"
                    fill={isActive ? color.fill : "#cbd5e1"}
                    onMouseEnter={() => setHoveredMetric(i)}
                    onMouseLeave={() => setHoveredMetric(null)}
                    onClick={() => setSelectedMetric(selectedMetric === i ? null : i)}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    opacity="0.8"
                  >
                    {metric.value.toFixed(0)}%
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {(hoveredMetric !== null || selectedMetric !== null) && (
          <div className="relative z-10 space-y-4">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300/40 dark:via-slate-600/40 to-transparent" />

            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, i) => {
                const isActive = hoveredMetric === i || selectedMetric === i
                const color = getMetricColor(metric.value)

                if (!isActive) return null

                return (
                  <div
                    key={i}
                    className={`col-span-2 p-4 rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border transition-all duration-300 ${
                      isActive
                        ? `border-slate-300/60 dark:border-slate-600 shadow-lg`
                        : "border-slate-200/40 dark:border-slate-700/40"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ backgroundColor: color.fill }}
                            />
                            {metric.label}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                            {metric.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: color.fill }}>
                            {metric.value.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{metric.description}</p>

                      <div className="relative h-2 bg-white/40 dark:bg-slate-700/40 rounded-full overflow-hidden border border-slate-200/30 dark:border-slate-600/30">
                        <div
                          className="h-full transition-all duration-500 ease-out"
                          style={{
                            width: `${metric.value}%`,
                            background: `linear-gradient(90deg, ${color.fill}, ${color.fill}dd)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="relative z-10 mt-8 pt-6 border-t border-slate-200/40 dark:border-slate-700/40">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Avg Metric</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {(metrics.reduce((sum, m) => sum + m.value, 0) / 6).toFixed(0)}%
              </p>
            </div>

            <div className="text-center p-3 rounded-lg bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Strongest</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                {Math.max(...metrics.map((m) => m.value)).toFixed(0)}%
              </p>
            </div>

            <div className="text-center p-3 rounded-lg bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Weakest</p>
              <p className="text-lg font-bold text-slate-500 dark:text-slate-400 mt-1">
                {Math.min(...metrics.map((m) => m.value)).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { EnhancedHexagram }
export default EnhancedHexagram
