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
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-200 dark:text-gray-800"
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
          
          <rect width="600" height="600" fill="url(#grid)" opacity="0.5" />

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
                  stroke="rgb(34, 197, 94)"
                  strokeWidth={strokeWidth}
                  opacity={opacity * 0.6}
                  strokeDasharray={edge.strength === 100 ? "0" : "5,5"}
                />
                {/* Strength label */}
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2}
                  fill="rgb(34, 197, 94)"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="dark:fill-emerald-400"
                >
                  {edge.strength}%
                </text>
              </g>
            )
          })}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const isMerged = node.type === 'merged'
            const radius = isMerged ? 40 : 30
            const color = isMerged ? 'rgb(168, 85, 247)' : 'rgb(59, 130, 246)'
            
            return (
              <g key={node.id} filter="url(#glow)">
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={color}
                  stroke="white"
                  strokeWidth="3"
                  className="transition-all hover:r-[35] cursor-pointer"
                  opacity="0.9"
                />
                
                {/* Good habits indicator */}
                {node.goodHabits && node.goodHabits.length > 0 && (
                  <circle
                    cx={node.x + radius - 10}
                    cy={node.y - radius + 10}
                    r="8"
                    fill="rgb(34, 197, 94)"
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
                
                {/* Win rate indicator */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {(node.winRate * 100).toFixed(0)}%
                </text>
                
                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + radius + 20}
                  fill="currentColor"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  className="text-gray-900 dark:text-gray-100"
                >
                  {node.name.length > 15 ? node.name.slice(0, 15) + '...' : node.name}
                </text>
                
                {/* Stats */}
                <text
                  x={node.x}
                  y={node.y + radius + 35}
                  fill="currentColor"
                  fontSize="10"
                  textAnchor="middle"
                  className="text-gray-600 dark:text-gray-400"
                >
                  {node.tradesCount} trades • ${node.pnl.toFixed(0)}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Individual Strategy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Merged Strategy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Good Habits Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-emerald-500" />
            <span className="text-muted-foreground">Connection Strength</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
