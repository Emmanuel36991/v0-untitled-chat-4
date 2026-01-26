"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Network, Minimize2, Maximize2, Layers } from "lucide-react"
import { generateEcosystemData, MapNode } from "@/app/actions/visual-map-actions"
import { cn } from "@/lib/utils"

// No SSR for canvas
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

export function VisualMap({ className }: { className?: string }) {
  const { theme } = useTheme()
  const fgRef = useRef<any>()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [data, setData] = useState<{ nodes: MapNode[], links: any[] }>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const [hoverNode, setHoverNode] = useState<MapNode | null>(null)
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
  const bgColor = isDark ? "#020617" : "#ffffff" // Slate-950 or White
  const gridColor = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"
  
  // Node Colors
  const COLORS = {
    strategy: "#6366f1", // Indigo
    setup: "#3b82f6",    // Blue
    psych_pos: "#10b981", // Emerald
    psych_neg: "#f43f5e", // Rose
    text: isDark ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.8)"
  }

  return (
    <Card className={cn("overflow-hidden border-border/60 bg-card shadow-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-3 bg-muted/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-md text-indigo-500">
            <Network className="w-5 h-5" />
          </div>
          <div>
             <CardTitle className="text-base font-bold">Strategy Ecosystem</CardTitle>
             <CardDescription className="text-xs">Correlations: Strategy ↔ Setup ↔ Psychology</CardDescription>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="h-8 text-xs gap-2">
           <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
           {loading ? "Mapping..." : "Refresh"}
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 relative h-[500px]" ref={containerRef}>
        
        {/* --- CUSTOM GRID BACKGROUND (The "Not Void" Part) --- */}
        <div className="absolute inset-0 pointer-events-none z-0">
            {/* Polar Grid SVG */}
            <svg width="100%" height="100%" className="opacity-[0.15]">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Center Crosshair */}
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1"/>
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1"/>
            </svg>
        </div>

        {/* --- GRAPH --- */}
        <div className="absolute inset-0 z-10">
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.w}
                height={dimensions.h}
                graphData={data}
                backgroundColor="transparent" // Allow grid to show
                
                // Physics
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.4}
                cooldownTicks={100}
                
                // Links
                linkColor={(link: any) => link.type === 'structural' ? (isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)') : (isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.15)')}
                linkWidth={(link: any) => link.type === 'structural' ? 2 : 1}
                linkDirectionalParticles={link => (link as any).type === 'correlation' ? 2 : 0}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}

                // Interactions
                onNodeHover={(node) => setHoverNode(node as MapNode || null)}
                
                // --- INSTITUTIONAL NODE RENDERER ---
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.label;
                    const radius = node.val;
                    const isHovered = hoverNode?.id === node.id;
                    const x = node.x;
                    const y = node.y;

                    // Color Logic
                    let fill = COLORS.text;
                    let stroke = COLORS.text;
                    
                    if (node.type === 'strategy') { fill = COLORS.strategy; stroke = COLORS.strategy; }
                    else if (node.type === 'setup') { fill = COLORS.setup; stroke = COLORS.setup; }
                    else if (node.type === 'psych_positive') { fill = COLORS.psych_pos; stroke = COLORS.psych_pos; }
                    else if (node.type === 'psych_negative') { fill = COLORS.psych_neg; stroke = COLORS.psych_neg; }

                    // 1. Draw "Hollow" Circle (Institutional Look)
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
                    ctx.fillStyle = isHovered ? fill : 'rgba(0,0,0,0)'; // Transparent fill unless hovered
                    ctx.fill();
                    
                    ctx.lineWidth = isHovered ? 2 : 1.5;
                    ctx.strokeStyle = fill;
                    ctx.stroke();

                    // 2. Inner Dot for Strategies
                    if (node.type === 'strategy') {
                        ctx.beginPath();
                        ctx.arc(x, y, 4, 0, 2 * Math.PI, false);
                        ctx.fillStyle = fill;
                        ctx.fill();
                    }

                    // 3. Label (Always for Strategy/Setup, Hover for Psych)
                    const fontSize = 12/globalScale;
                    const showLabel = node.type !== 'psych_negative' && node.type !== 'psych_positive' || isHovered || globalScale > 1.5;

                    if (showLabel) {
                        ctx.font = `${node.type === 'strategy' ? 'bold' : ''} ${Math.max(fontSize, 4)}px monospace`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = COLORS.text;
                        const yOffset = radius + fontSize + 2;
                        
                        // Text Background for readability
                        if (node.type === 'strategy') {
                             const textWidth = ctx.measureText(label).width;
                             ctx.fillStyle = isDark ? "rgba(2, 6, 23, 0.8)" : "rgba(255, 255, 255, 0.8)";
                             ctx.fillRect(x - textWidth/2 - 2, y + radius + 2, textWidth + 4, fontSize + 4);
                        }
                        
                        ctx.fillStyle = COLORS.text;
                        ctx.fillText(label, x, y + yOffset);
                    }
                }}
            />
        </div>

        {/* --- HUD OVERLAY (The "Control Panel" Feel) --- */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
            {hoverNode ? (
                <div className="bg-background/90 backdrop-blur border border-border rounded-lg p-3 shadow-xl w-56 animate-in slide-in-from-right-2">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                        <div className={cn("w-2 h-2 rounded-full", 
                             hoverNode.type === 'strategy' ? "bg-indigo-500" : 
                             hoverNode.type === 'setup' ? "bg-blue-500" :
                             hoverNode.type === 'psych_positive' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <span className="font-bold text-sm truncate">{hoverNode.label}</span>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                           <span className="text-muted-foreground">Trades</span>
                           <span className="font-mono">{hoverNode.stats?.trades}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-muted-foreground">Win Rate</span>
                           <span className={cn("font-mono font-bold", (hoverNode.stats?.winRate || 0) > 50 ? "text-emerald-500" : "text-muted-foreground")}>
                             {hoverNode.stats?.winRate}%
                           </span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-muted-foreground">Net PnL</span>
                           <span className={cn("font-mono font-bold", (hoverNode.stats?.pnl || 0) > 0 ? "text-emerald-500" : "text-rose-500")}>
                             ${hoverNode.stats?.pnl.toLocaleString()}
                           </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2 opacity-50 text-[10px] text-muted-foreground font-mono text-right">
                    <span>ECOSYSTEM STATUS: ONLINE</span>
                    <span>NODES: {data.nodes.length}</span>
                </div>
            )}
        </div>

        {/* --- LEGEND (Bottom Left) --- */}
        <div className="absolute bottom-4 left-4 z-20 flex gap-4 text-[10px] font-mono text-muted-foreground bg-background/50 backdrop-blur px-3 py-1.5 rounded-full border border-border/30">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-indigo-500"/> Strategy</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-blue-500"/> Setup</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-emerald-500"/> +Psych</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-rose-500"/> -Psych</div>
        </div>

      </CardContent>
    </Card>
  )
}
