"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Network, ZoomIn, ZoomOut, Maximize, X } from "lucide-react"
import { generateEcosystemData, MapNode, MapLink } from "@/app/actions/visual-map-actions"
import { cn } from "@/lib/utils"

// No SSR for canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

export function VisualMap({ className }: { className?: string }) {
  const { theme } = useTheme()
  const fgRef = useRef<any>()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [data, setData] = useState<{ nodes: MapNode[], links: MapLink[] }>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null)
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 })

  // --- RESIZE OBSERVER ---
  useEffect(() => {
    const observeTarget = containerRef.current;
    if(!observeTarget) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        setDimensions({ w: width, h: height });
    });
    resizeObserver.observe(observeTarget);
    return () => resizeObserver.disconnect();
  }, []);



  const loadData = useCallback(async () => {
    setLoading(true)
    const graphData = await generateEcosystemData()
    if (graphData) setData(graphData)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const isDark = theme === "dark"
  
  // --- HFT COLOR PALETTE ---
  const COLORS = {
    strategy: { 
      core: isDark ? "#818cf8" : "#6366f1", 
      glow: isDark ? "rgba(129, 140, 248, 0.6)" : "rgba(99, 102, 241, 0.5)" 
    },
    setup: { 
      core: isDark ? "#60a5fa" : "#3b82f6", 
      glow: isDark ? "rgba(96, 165, 250, 0.5)" : "rgba(59, 130, 246, 0.4)" 
    },
    psych_pos: { 
      core: isDark ? "#34d399" : "#10b981", 
      glow: isDark ? "rgba(52, 211, 153, 0.5)" : "rgba(16, 185, 129, 0.4)" 
    },
    psych_neg: { 
      core: isDark ? "#fb7185" : "#f43f5e", 
      glow: isDark ? "rgba(251, 113, 133, 0.5)" : "rgba(244, 63, 94, 0.4)" 
    },
    text: isDark ? "rgba(248, 250, 252, 0.9)" : "rgba(15, 23, 42, 0.9)",
    textMuted: isDark ? "rgba(148, 163, 184, 0.7)" : "rgba(100, 116, 139, 0.7)",
    linkDefault: isDark ? "rgba(100, 116, 139, 0.15)" : "rgba(148, 163, 184, 0.2)",
    linkActive: isDark ? "rgba(129, 140, 248, 0.4)" : "rgba(99, 102, 241, 0.3)",
    bg: isDark ? "#020617" : "#ffffff",
    glassBg: isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.9)"
  }

  // --- CAMERA CONTROLS ---
  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 300)
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() / 1.5, 300)
  const handleRecenter = () => {
    fgRef.current?.zoomToFit(400, 60)
    setSelectedNode(null)
  }

  // --- GET CONNECTED NODE IDS ---
  const getConnectedIds = useCallback((nodeId: string): Set<string> => {
    const connected = new Set<string>([nodeId])
    data.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target
      if (sourceId === nodeId) connected.add(targetId)
      if (targetId === nodeId) connected.add(sourceId)
    })
    return connected
  }, [data.links])

  // --- NODE CLICK HANDLER (Focus Mode) ---
  const handleNodeClick = useCallback((node: any) => {
    if (selectedNode?.id === node.id) {
      // Deselect if clicking same node
      setSelectedNode(null)
      fgRef.current?.zoomToFit(400, 60)
    } else {
      setSelectedNode(node as MapNode)
      // Smooth camera animation to selected node
      fgRef.current?.centerAt(node.x, node.y, 600)
      fgRef.current?.zoom(2.5, 600)
    }
  }, [selectedNode])

  // --- BACKGROUND CLICK (Reset Focus) ---
  const handleBackgroundClick = useCallback(() => {
    if (selectedNode) {
      setSelectedNode(null)
      fgRef.current?.zoomToFit(400, 60)
    }
  }, [selectedNode])

  // --- LOGARITHMIC NODE SIZING ---
  const getNodeRadius = (node: MapNode): number => {
    const baseSizes = { strategy: 16, setup: 10, psych_positive: 6, psych_negative: 6 }
    const base = baseSizes[node.type] || 8
    const trades = node.stats?.trades || 1
    // Logarithmic scaling to prevent massive nodes
    return Math.min(base + Math.log10(trades + 1) * 4, base * 2.5)
  }

  // Connected nodes set for dimming effect
  const connectedIds = selectedNode ? getConnectedIds(selectedNode.id) : null

  return (
    <Card className={cn("overflow-hidden border-border/60 bg-card shadow-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-3 bg-muted/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-md text-indigo-500">
            <Network className="w-5 h-5" />
          </div>
          <div>
             <CardTitle className="text-base font-bold">Ecosystem Map</CardTitle>
             <CardDescription className="text-xs">Strategy → Setup → Psychology Correlations</CardDescription>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="h-8 text-xs gap-2">
           <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
           {loading ? "Mapping..." : "Refresh"}
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 relative h-[500px]" ref={containerRef}>
        
        {/* --- ANIMATED GRID BACKGROUND --- */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Radial gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: isDark 
                ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 70%)'
                : 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 70%)'
            }}
          />
          {/* Grid SVG */}
          <svg width="100%" height="100%" className="opacity-20">
            <defs>
              <pattern id="hft-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30"/>
              </pattern>
              <pattern id="hft-grid-large" width="150" height="150" patternUnits="userSpaceOnUse">
                <path d="M 150 0 L 0 0 0 150" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hft-grid)" />
            <rect width="100%" height="100%" fill="url(#hft-grid-large)" />
            {/* Center crosshair */}
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeDasharray="8 8" strokeWidth="0.5" className="text-indigo-500/20"/>
            <line x1="0" y1="50%" x2="100%" y2="100%" stroke="currentColor" strokeDasharray="8 8" strokeWidth="0.5" className="text-indigo-500/20"/>
          </svg>
          {/* Scan line effect */}
          <div 
            className="absolute inset-0 pointer-events-none animate-pulse"
            style={{
              background: isDark
                ? 'linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.02) 50%, transparent 100%)'
                : 'linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.03) 50%, transparent 100%)'
            }}
          />
        </div>

        {/* --- FORCE GRAPH --- */}
        <div className="absolute inset-0 z-10">
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.w}
            height={dimensions.h}
            graphData={data}
            backgroundColor="transparent"
            
            // --- STABILIZED PHYSICS WITH BETTER SPACING ---
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.4}
            cooldownTicks={200}
            warmupTicks={80}
            linkDistance={80}
            chargeStrength={-150}
            
            // --- LINK RENDERING ---
            linkColor={(link: any) => {
              const sourceId = typeof link.source === 'object' ? link.source.id : link.source
              const targetId = typeof link.target === 'object' ? link.target.id : link.target
              
              // Dim unconnected links when node is selected
              if (connectedIds && !connectedIds.has(sourceId) && !connectedIds.has(targetId)) {
                return isDark ? 'rgba(100, 116, 139, 0.03)' : 'rgba(148, 163, 184, 0.05)'
              }
              
              // Highlight profitable connections
              const targetNode = data.nodes.find(n => n.id === targetId)
              if (targetNode?.stats?.pnl && targetNode.stats.pnl > 0) {
                return isDark ? 'rgba(52, 211, 153, 0.25)' : 'rgba(16, 185, 129, 0.2)'
              }
              
              return link.type === 'structural' ? COLORS.linkActive : COLORS.linkDefault
            }}
            linkWidth={(link: any) => link.type === 'structural' ? 2 : 1}
            linkLineDash={(link: any) => link.type === 'correlation' ? [2, 3] : []}
            linkDirectionalParticles={(link: any) => link.type === 'structural' ? 2 : 0}
            linkDirectionalParticleSpeed={0.003}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => COLORS.strategy.core}

            // --- INTERACTIONS ---
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBackgroundClick}
            
            // --- SIMPLE NODE RENDERER (Clean Circles Only) ---
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const baseRadius = node.type === 'strategy' ? 12 : node.type === 'setup' ? 10 : 8
              const isSelected = selectedNode?.id === node.id
              const isDimmed = connectedIds && !connectedIds.has(node.id)
              const x = node.x
              const y = node.y

              // Expand selected node
              const radius = isSelected ? baseRadius * 1.5 : baseRadius

              // Get colors based on node type
              let coreColor = COLORS.strategy.core
              if (node.type === 'setup') coreColor = COLORS.setup.core
              else if (node.type === 'psych_positive') coreColor = COLORS.psych_pos.core
              else if (node.type === 'psych_negative') coreColor = COLORS.psych_neg.core

              // Apply dimming effect
              const opacity = isDimmed ? 0.2 : 1

              ctx.save()
              ctx.globalAlpha = opacity

              // Simple circle - no glow unless selected
              if (isSelected) {
                ctx.shadowBlur = 20
                ctx.shadowColor = coreColor
              }

              ctx.beginPath()
              ctx.arc(x, y, radius, 0, 2 * Math.PI)
              ctx.fillStyle = coreColor
              ctx.fill()

              // Subtle border for definition
              ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
              ctx.lineWidth = 1
              ctx.stroke()

              ctx.restore()

              // --- LABEL ONLY ON SELECTED NODE ---
              if (isSelected && !isDimmed) {
                ctx.shadowBlur = 0
                
                const label = node.label
                const fontSize = 13
                ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                
                const textWidth = ctx.measureText(label).width
                const labelY = y + radius + fontSize + 8
                
                // Glass background pill
                const pillPadding = 8
                const pillHeight = fontSize + pillPadding * 2
                const pillWidth = textWidth + pillPadding * 4
                const pillRadius = pillHeight / 2
                
                ctx.fillStyle = COLORS.glassBg
                ctx.beginPath()
                ctx.roundRect(
                  x - pillWidth / 2, 
                  labelY - pillHeight / 2, 
                  pillWidth, 
                  pillHeight, 
                  pillRadius
                )
                ctx.fill()
                
                // Border
                ctx.strokeStyle = coreColor
                ctx.lineWidth = 1.5
                ctx.stroke()
                
                // Text
                ctx.fillStyle = COLORS.text
                ctx.fillText(label, x, labelY)
              }
            }}
          />
        </div>



        {/* --- SELECTED NODE PANEL (Fixed Position) --- */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-30 animate-in slide-in-from-right-2 fade-in duration-200">
            <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-lg p-4 shadow-2xl w-60">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", 
                    selectedNode.type === 'strategy' ? "bg-indigo-500" : 
                    selectedNode.type === 'setup' ? "bg-blue-500" :
                    selectedNode.type === 'psych_positive' ? "bg-emerald-500" : "bg-rose-500"
                  )} />
                  <span className="font-bold text-sm truncate max-w-[160px]">{selectedNode.label}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => {
                    setSelectedNode(null)
                    fgRef.current?.zoomToFit(400, 60)
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{selectedNode.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Trades</span>
                  <span className="font-medium">{selectedNode.stats?.trades || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className={cn("font-medium", (selectedNode.stats?.winRate || 0) >= 50 ? "text-emerald-500" : "text-muted-foreground")}>
                    {selectedNode.stats?.winRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Net P&L</span>
                  <span className={cn("font-medium", (selectedNode.stats?.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    ${(selectedNode.stats?.pnl || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Connections</span>
                  <span className="font-medium">{connectedIds ? connectedIds.size - 1 : 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CAMERA CONTROLS (Bottom Right) --- */}
        <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
            onClick={handleRecenter}
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        {/* --- LEGEND (Bottom Left) --- */}
        <div className="absolute bottom-4 left-4 z-20 flex gap-3 text-[10px] font-mono text-muted-foreground bg-background/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/30">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]"/>
            <span>Strategy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-500"/>
            <span>Setup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 border border-emerald-500"/>
            <span>+Psych</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50 border border-rose-500"/>
            <span>-Psych</span>
          </div>
        </div>

        {/* --- STATUS INDICATOR (Top Left) --- */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-background/50 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-border/20">
          <div className={cn("w-1.5 h-1.5 rounded-full", loading ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
          <span>{loading ? "SYNCING" : "LIVE"}</span>
          <span className="text-muted-foreground/50">|</span>
          <span>{data.nodes.length} NODES</span>
        </div>

      </CardContent>
    </Card>
  )
}
