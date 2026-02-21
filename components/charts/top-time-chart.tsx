"use client"

import React, { useMemo } from "react"
import { Clock, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface Trade {
  id: string
  trade_start_time?: string | null
  outcome: "win" | "loss" | "breakeven"
  pnl: number
}

interface TopTimeChartProps {
  trades: Trade[]
}

function extractHour(raw: string | null | undefined): number | null {
  if (!raw || typeof raw !== "string") return null

  // Try parsing as ISO / full timestamp first (e.g. "2025-01-15T14:30:00+00:00")
  const d = new Date(raw)
  if (!isNaN(d.getTime())) {
    return d.getHours()
  }

  // Fallback: simple "HH:MM" or "HH:MM:SS" string
  if (raw.includes(":")) {
    const hour = parseInt(raw.split(":")[0], 10)
    if (!isNaN(hour) && hour >= 0 && hour <= 23) return hour
  }

  return null
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">
        {data.hourLabel}
      </p>
      <p className={`text-sm font-bold font-mono ${data.pnl >= 0 ? "text-profit" : "text-loss"}`}>
        {data.pnl >= 0 ? "+" : ""}${data.pnl.toFixed(2)}
      </p>
      <p className="text-2xs text-muted-foreground capitalize">{data.outcome}</p>
    </div>
  )
}

export function TopTimeChart({ trades }: TopTimeChartProps) {
  const { winData, lossData, truncated } = useMemo(() => {
    const wins: any[] = []
    const losses: any[] = []

    trades.forEach((trade) => {
      const hour = extractHour(trade.trade_start_time)
      if (hour === null) return

      const point = {
        hour,
        hourLabel: `${hour.toString().padStart(2, "0")}:00`,
        pnl: trade.pnl,
        outcome: trade.outcome,
      }

      if (trade.pnl >= 0) {
        wins.push(point)
      } else {
        losses.push(point)
      }
    })

    // #7: Cap at 500 most recent points per series
    const MAX_POINTS = 500
    const cappedWins = wins.length > MAX_POINTS ? wins.slice(-MAX_POINTS) : wins
    const cappedLosses = losses.length > MAX_POINTS ? losses.slice(-MAX_POINTS) : losses
    const truncated = wins.length > MAX_POINTS || losses.length > MAX_POINTS

    return { winData: cappedWins, lossData: cappedLosses, truncated }
  }, [trades])

  const hasData = winData.length > 0 || lossData.length > 0

  // #18: Custom diamond shape for loss points
  const DiamondShape = (props: any) => {
    const { cx, cy, fill, fillOpacity } = props
    return (
      <polygon
        points={`${cx},${cy - 5} ${cx + 5},${cy} ${cx},${cy + 5} ${cx - 5},${cy}`}
        fill={fill}
        fillOpacity={fillOpacity}
      />
    )
  }

  // Compute tick values from actual data
  const allHours = useMemo(() => {
    const hours = new Set<number>()
      ;[...winData, ...lossData].forEach((d) => hours.add(d.hour))
    return Array.from(hours).sort((a, b) => a - b)
  }, [winData, lossData])

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center justify-between text-sm font-bold">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            Trade Time Performance
          </div>
          <div className="flex items-center gap-2">
            {truncated && <Badge variant="secondary" className="text-[10px]">Latest 500</Badge>}
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-2 px-2">
        {!hasData ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No time data available. Add entry times to your trades.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                type="number"
                dataKey="hour"
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
                ticks={allHours}
                tickFormatter={(h) => `${h}:00`}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="pnl"
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={54}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <Scatter
                name="Wins"
                data={winData}
                fill="var(--profit)"
                fillOpacity={0.85}
                r={5}
                shape="circle"
              />
              <Scatter
                name="Losses"
                data={lossData}
                fill="var(--loss)"
                fillOpacity={0.85}
                r={5}
                shape={<DiamondShape />}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
        {hasData && (
          <div className="flex items-center justify-center gap-5 pt-1 pb-1">
            <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-profit" />
              Profit (circle)
            </div>
            <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
              <svg width="8" height="8" viewBox="0 0 8 8" className="inline-block"><polygon points="4,0 8,4 4,8 0,4" className="fill-loss" /></svg>
              Loss (diamond)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
