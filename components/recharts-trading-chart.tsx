// components/recharts-trading-chart.tsx

"use client"

import type React from "react"
import { useMemo, memo } from "react"
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { CandlestickData, ActiveIndicator } from "@/types"
import { AVAILABLE_INDICATORS } from "@/types"
import { cn } from "@/lib/utils"

// Helper to calculate Moving Average
const calculateMA = (data: CandlestickData[], period: number): { time: number; value: number }[] => {
  if (data.length < period) return []
  const result: { time: number; value: number }[] = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push({ time: data[i].time, value: sum / period })
  }
  return result
}

interface RechartsTradingChartProps {
  data: CandlestickData[]
  activeIndicators?: ActiveIndicator[]
  height?: string | number
  className?: string
}

// Custom shape for Candlestick
const CandlestickShape = (props: any) => {
  if (
    !props.payload ||
    typeof props.payload.open === "undefined" ||
    typeof props.payload.high === "undefined" ||
    typeof props.payload.low === "undefined" ||
    typeof props.payload.close === "undefined" ||
    !props.yAxis ||
    typeof props.yAxis.scale !== "function"
  ) {
    return null
  }
  const { low, high, open, close } = props.payload
  const { x, width, yAxis, fill } = props

  const candleX = x + width / 2
  const wickY1 = yAxis.scale(high)
  const wickY2 = yAxis.scale(low)
  const bodyTopScreenY = yAxis.scale(Math.max(open, close))
  const bodyBottomScreenY = yAxis.scale(Math.min(open, close))
  const bodyHeight = Math.max(1, Math.abs(bodyTopScreenY - bodyBottomScreenY))

  return (
    <g>
      <line x1={candleX} y1={wickY1} x2={candleX} y2={wickY2} stroke={fill} strokeWidth={1.5} />
      <rect x={x} y={bodyTopScreenY} width={width} height={bodyHeight} fill={fill} />
    </g>
  )
}

const RechartsTradingChart: React.FC<RechartsTradingChartProps> = ({
  data,
  activeIndicators = [],
  height = "100%",
  className,
}) => {
  const chartDataWithIndicators = useMemo(() => {
    let processedData = data.map((d) => ({ ...d }))

    activeIndicators.forEach((indicator) => {
      if (indicator.type === "MA" && AVAILABLE_INDICATORS.MA) {
        const maParams = indicator.params
        const maValues = calculateMA(data, maParams.period)
        processedData = processedData.map((d) => {
          const maPoint = maValues.find((m) => m.time === d.time)
          return { ...d, [`MA_${maParams.period}`]: maPoint?.value }
        })
      }
    })
    return processedData
  }, [data, activeIndicators])

  const yDomain = useMemo(() => {
    if (!data || data.length === 0) return ["auto", "auto"]
    let minPrice = Number.POSITIVE_INFINITY
    let maxPrice = Number.NEGATIVE_INFINITY
    chartDataWithIndicators.forEach((d) => {
      minPrice = Math.min(minPrice, d.low)
      maxPrice = Math.max(maxPrice, d.high)
      activeIndicators.forEach((indicator) => {
        if (indicator.type === "MA") {
          const maKey = `MA_${indicator.params.period}`
          if (d[maKey] !== undefined) {
            minPrice = Math.min(minPrice, d[maKey])
            maxPrice = Math.max(maxPrice, d[maKey])
          }
        }
      })
    })
    if (minPrice === Number.POSITIVE_INFINITY || maxPrice === Number.NEGATIVE_INFINITY) return ["auto", "auto"]
    const padding = (maxPrice - minPrice) * 0.1
    return [minPrice - padding, maxPrice + padding]
  }, [chartDataWithIndicators, activeIndicators, data])

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex justify-center items-center w-full min-h-[300px] text-muted-foreground bg-card/50 rounded-lg",
          className,
        )}
        style={{ height: typeof height === "number" ? `${height}px` : height }}
      >
        No data to display for the chart.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={cn(className)}>
      <ComposedChart
        data={chartDataWithIndicators}
        margin={{
          top: 15,
          right: 5,
          left: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid stroke="hsl(var(--border) / 0.5)" strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tickFormatter={(unixTime) =>
            new Date(unixTime * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" })
          }
          stroke="hsl(var(--muted-foreground) / 0.8)"
          dy={10}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border) / 0.7)" }}
          tickLine={{ stroke: "hsl(var(--border) / 0.7)" }}
        />
        <YAxis
          orientation="right"
          stroke="hsl(var(--muted-foreground) / 0.8)"
          domain={yDomain as [number, number]}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(value) => value.toFixed(2)}
          axisLine={{ stroke: "hsl(var(--border) / 0.7)" }}
          tickLine={{ stroke: "hsl(var(--border) / 0.7)" }}
          width={55}
        />
        <Tooltip
          // FIXED: Added cursor prop object to resolve "Received true for non-boolean attribute" warning
          cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            borderColor: "hsl(var(--border))",
            color: "hsl(var(--popover-foreground))",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: "8px 12px",
          }}
          itemStyle={{ color: "hsl(var(--popover-foreground))", fontSize: 13 }}
          labelStyle={{ color: "hsl(var(--primary))", marginBottom: "4px", fontSize: 14, fontWeight: "bold" }}
          formatter={(value: number | string, name: string, entry: any) => {
            if (name === "Price") {
              const { open, high, low, close } = entry.payload
              return [
                <>
                  <div key="ohlc-open-high" style={{ marginBottom: "3px" }}>
                    O: {open?.toFixed(2)} H: {high?.toFixed(2)}
                  </div>
                  <div key="ohlc-low-close">
                    L: {low?.toFixed(2)} C: {close?.toFixed(2)}
                  </div>
                </>,
                "OHLC",
              ]
            }
            if (typeof value === "number") {
              return [value.toFixed(name.startsWith("MA_") ? 2 : 4), name]
            }
            return [value, name]
          }}
          labelFormatter={(label) => `Time: ${new Date(label * 1000).toLocaleString()}`}
        />
        <Legend
          wrapperStyle={{
            paddingTop: "15px",
            color: "hsl(var(--muted-foreground))",
            fontSize: "13px",
          }}
          iconSize={10}
          formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>}
        />

        <Bar dataKey="close" name="Price" shape={<CandlestickShape />}>
          {chartDataWithIndicators.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.close >= entry.open ? "hsl(var(--performance-green))" : "hsl(var(--performance-red))"}
            />
          ))}
        </Bar>

        {activeIndicators.map((indicator) => {
          if (indicator.type === "MA" && AVAILABLE_INDICATORS.MA) {
            const maKey = `MA_${indicator.params.period}`
            const lineColor = indicator.params.color || "hsl(var(--secondary))"
            return (
              <Line
                key={indicator.id}
                type="monotone"
                dataKey={maKey}
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                name={`MA (${indicator.params.period})`}
              />
            )
          }
          return null
        })}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default memo(RechartsTradingChart)
