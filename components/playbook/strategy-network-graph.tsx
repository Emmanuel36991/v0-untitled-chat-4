"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, Link2 } from "lucide-react"
import type { PlaybookStrategy, MergedStrategy, StrategyRelationship } from "@/types"
import { cn } from "@/lib/utils"

interface StrategyNetworkGraphProps {
  strategies: PlaybookStrategy[]
  mergedStrategies: MergedStrategy[]
  relationships: StrategyRelationship[]
}

interface Node {
  id: string
  name: string
  x: number
  y: number
  type: 'strategy' | 'merged'
  winRate: number
  tradesCount: number
  pnl: number
  goodHabits?: string[]
}

interface Edge {
  from: string
  to: string
  strength: number
}

export function StrategyNetworkGraph({
  strategies,
  mergedStrategies,
  relationships
}: StrategyNetworkGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, Node>()
    const edgeList: Edge[] = []

    // Create nodes for individual strategies
    const radius = 200
    const angleStep = (2 * Math.PI) / strategies.length

    strategies.forEach((strategy, index) => {
      const angle = index * angleStep
      nodeMap.set(strategy.id, {
        id: strategy.id,
        name: strategy.name,
        x: 300 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
        type: 'strategy',
        winRate: strategy.win_rate,
        tradesCount: strategy.trades_count,
        pnl: strategy.pnl,
      })
    })

    // Create nodes for merged strategies (center positions)
    mergedStrategies.forEach((merged, index) => {
      const offset = index * 60
      nodeMap.set(merged.id, {
        id: merged.id,
        name: merged.name,
        x: 300 + offset - 30,
        y: 300,
        type: 'merged',
        winRate: merged.combined_win_rate,
        tradesCount: merged.combined_trades_count,
        pnl: merged.combined_pnl,
        goodHabits: merged.common_good_habits,
      })
    })

    // Create edges from relationships
    relationships.forEach(rel => {
      edgeList.push({
        from: rel.parent_strategy_id,
        to: rel.child_strategy_id,
        strength: rel.relationship_strength
      })
    })

    return { nodes: Array.from(nodeMap.values()), edges: edgeList }
  }, [strategies, mergedStrategies, relationships])

  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardHeader className="border-b border-border py-3 bg-card/50">
        <CardTitle className="text-base font-bold flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Link2 className="w-4 h-4 text-primary" />
          </div>
          Strategy Network Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <svg
          width="600"
          height="600"
          viewBox="0 0 600 600"
          className="w-full h-auto max-h-[500px]"
          style={{ maxWidth: '100%' }}
        >
          {/* Background */}
          <rect width="600" height="600" fill="transparent" />

          {/* Grid pattern */}
          <defs>
            <pattern id="network-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>

            {/* Glow filters */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="600" height="600" fill="url(#network-grid)" opacity="0.5" />

          {/* Draw edges (connections) */}
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from)
            const toNode = nodes.find(n => n.id === edge.to)

            if (!fromNode || !toNode) return null

            const strokeWidth = (edge.strength / 100) * 4 + 1
            const opacity = edge.strength / 100

            return (
              <g key={`edge-${index}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="hsl(var(--success))"
                  strokeWidth={strokeWidth}
                  opacity={opacity * 0.6}
                  strokeDasharray={edge.strength === 100 ? "0" : "5,5"}
                />
                {/* Strength label */}
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2}
                  fill="hsl(var(--success))"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {edge.strength}%
                </text>
              </g>
            )
          })}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const isMerged = node.type === 'merged'
            const nodeRadius = isMerged ? 40 : 30
            const color = isMerged ? 'hsl(var(--primary))' : 'hsl(var(--info))'

            return (
              <g key={node.id} filter="url(#glow)">
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={color}
                  stroke="hsl(var(--background))"
                  strokeWidth="3"
                  className="cursor-pointer"
                  opacity="0.9"
                />

                {/* Good habits indicator */}
                {node.goodHabits && node.goodHabits.length > 0 && (
                  <circle
                    cx={node.x + nodeRadius - 10}
                    cy={node.y - nodeRadius + 10}
                    r="8"
                    fill="hsl(var(--success))"
                    stroke="hsl(var(--background))"
                    strokeWidth="2"
                  />
                )}

                {/* Win rate indicator */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  fill="hsl(var(--primary-foreground))"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {(node.winRate * 100).toFixed(0)}%
                </text>

                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + nodeRadius + 20}
                  fill="hsl(var(--foreground))"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {node.name.length > 15 ? node.name.slice(0, 15) + '...' : node.name}
                </text>

                {/* Stats */}
                <text
                  x={node.x}
                  y={node.y + nodeRadius + 35}
                  fill="hsl(var(--muted-foreground))"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {node.tradesCount} trades • ${node.pnl.toFixed(0)}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-2xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-info" />
            <span>Individual Strategy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Merged Strategy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Good Habits Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-success" />
            <span>Connection Strength</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
