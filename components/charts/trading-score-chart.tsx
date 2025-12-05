// components/TradingScoreChart.tsx
import type React from "react"

interface TradingScoreChartProps {
  winPercentage: number // 0-100
  consistency: number // 0-100
  maxDrawdown: number // 0-100 (inverted if needed, but assuming higher is better)
  recoveryFactor: number // 0-100
  profitFactor: number // 0-100
  avgWinLoss: number // 0-100
  totalScore: number // e.g., 80.83
}

const TradingScoreChart: React.FC<TradingScoreChartProps> = ({
  winPercentage,
  consistency,
  maxDrawdown,
  recoveryFactor,
  profitFactor,
  avgWinLoss,
  totalScore,
}) => {
  const metrics = [
    { label: "Win %", value: winPercentage },
    { label: "Consistency", value: consistency },
    { label: "Max Drawdown", value: maxDrawdown },
    { label: "Recovery Factor", value: recoveryFactor },
    { label: "Profit Factor", value: profitFactor },
    { label: "Avg Win/Loss", value: avgWinLoss },
  ]

  const centerX = 100
  const centerY = 100
  const radius = 80
  const numPoints = metrics.length

  // Calculate points for the outer hexagon
  const outerPoints = metrics.map((_, i) => {
    const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  })

  // Calculate points for the filled shape based on values (0-100 -> 0-radius)
  const valuePoints = metrics.map((metric, i) => {
    const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2
    const r = (metric.value / 100) * radius
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    }
  })

  // Generate polygon points strings
  const outerPolygon = outerPoints.map((p) => `${p.x},${p.y}`).join(" ")
  const valuePolygon = valuePoints.map((p) => `${p.x},${p.y}`).join(" ")

  // Labels positioned outside
  const labelPositions = metrics.map((metric, i) => {
    const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2
    const labelRadius = radius + 20
    return {
      x: centerX + labelRadius * Math.cos(angle),
      y: centerY + labelRadius * Math.sin(angle),
      label: metric.label,
      anchor: Math.cos(angle) > 0 ? "start" : Math.cos(angle) < 0 ? "end" : "middle",
      baseline: Math.sin(angle) > 0 ? "hanging" : Math.sin(angle) < 0 ? "baseline" : "middle",
    }
  })

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-white">
      <svg viewBox="0 0 200 250" className="w-full h-auto">
        {/* Outer hexagon */}
        <polygon points={outerPolygon} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

        {/* Filled value polygon */}
        <polygon
          points={valuePolygon}
          fill="rgba(59, 130, 246, 0.5)" // Blue fill, different from original purple
          stroke="#3B82F6"
          strokeWidth="2"
        />

        {/* Dots at value points */}
        {valuePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3B82F6" />
        ))}

        {/* Labels */}
        {labelPositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor={pos.anchor}
            dominantBaseline={pos.baseline}
            className="text-xs font-medium fill-current"
          >
            {pos.label}
          </text>
        ))}
      </svg>

      {/* Score bar below */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-bold">Trading Score</span>
          <span className="text-lg font-bold">{totalScore.toFixed(2)}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
            style={{ width: `${totalScore}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default TradingScoreChart
