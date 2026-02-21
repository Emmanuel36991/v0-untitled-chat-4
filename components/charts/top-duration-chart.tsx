"use client"

import React, { useMemo } from "react"
import { Timer, Info } from "lucide-react"
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
  duration_minutes?: number | null
  precise_duration_minutes?: number | null
  trade_start_time?: string | null
  trade_end_time?: string | null
  outcome: "win" | "loss" | "breakeven"
  pnl: number
}

interface TopDurationChartProps {
  trades: Trade[]
}

function getDurationMinutes(trade: Trade): number | null {
  // Use precise_duration_minutes or duration_minutes first
  if (trade.precise_duration_minutes != null && trade.precise_duration_minutes > 0) {
    return trade.precise_duration_minutes
  }
  if (trade.duration_minutes != null && trade.duration_minutes > 0) {
    return trade.duration_minutes
  }

  // Try computing from start/end timestamps
  if (trade.trade_start_time && trade.trade_end_time) {
    const start = new Date(trade.trade_start_time)
    const end = new Date(trade.trade_end_time)
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffMs = end.getTime() - start.getTime()
      if (diffMs > 0) return diffMs / 60000
    }
  }

  return null
}

function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)}s`
  }
  if (minutes < 60) {
    const m = Math.floor(minutes)
    const s = Math.round((minutes - m) * 60)
    return s > 0 ? `${m}m:${s.toString().padStart(2, "0")}s` : `${m}m`
  }
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h}h:${m}m` : `${h}h`
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">
        {data.durationLabel}
      </p>
      <p className={`text-sm font-bold font-mono ${data.pnl >= 0 ? "text-profit" : "text-loss"}`}>
        {data.pnl >= 0 ? "+" : ""}${data.pnl.toFixed(2)}
      </p>
      <p className="text-2xs text-muted-foreground capitalize">{data.outcome}</p>
    </div>
  )
}

export function TopDurationChart({ trades }: TopDurationChartProps) {
  const { winData, lossData, ticks, tickLabels, truncated } = useMemo(() => {
    const wins: any[] = []
    const losses: any[] = []

    trades.forEach((trade) => {
      const mins = getDurationMinutes(trade)
      if (mins === null || mins <= 0) return

      const point = {
        duration: mins,
        durationLabel: formatDuration(mins),
        pnl: trade.pnl,
        outcome: trade.outcome,
      }

      if (trade.pnl >= 0) {
        wins.push(point)
      } else {
        losses.push(point)
      }
    })

    // Build nice log-scale-ish ticks
    const allMins = [...wins, ...losses].map((d) => d.duration)
    const maxMins = allMins.length > 0 ? Math.max(...allMins) : 60

    const baseTicks = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 240, 480, 960]
    const filteredTicks = baseTicks.filter((t) => t <= maxMins * 1.3)

    const labels: Record<number, string> = {}
    filteredTicks.forEach((t) => {
      labels[t] = formatDuration(t)
    })

    // #7: Cap at 500 most recent points per series to prevent render lag
    const MAX_POINTS = 500
    const cappedWins = wins.length > MAX_POINTS ? wins.slice(-MAX_POINTS) : wins
    const cappedLosses = losses.length > MAX_POINTS ? losses.slice(-MAX_POINTS) : losses
    const truncated = wins.length > MAX_POINTS || losses.length > MAX_POINTS

    return { winData: cappedWins, lossData: cappedLosses, ticks: filteredTicks, tickLabels: labels, truncated, totalPoints: wins.length + losses.length }
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

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center justify-between text-sm font-bold">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Timer className="h-4 w-4 text-primary" />
            </div>
            Trade Duration Performance
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
            No duration data available. Add entry/exit times to your trades.
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
                dataKey="duration"
                scale="log"
                domain={["auto", "auto"]}
                ticks={ticks}
                tickFormatter={(v) => tickLabels[v] ?? formatDuration(v)}
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
