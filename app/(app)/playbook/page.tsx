"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Plus, Search, Trash2, Edit2, MoreHorizontal,
  Loader2, TrendingUp, Trophy, Layers, BookOpen,
  Clock, CandlestickChart, Activity, Database,
  GitBranch, Check, ArrowRight, LayoutGrid, BarChart3,
  ChevronRight, Target, Layers as LayersIcon,
  FileText, SlidersHorizontal,
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { PulseIcon } from "@/components/icons/system-icons"
import { EmptyState } from "@/components/empty-state"
import {
  getStrategies,
  upsertStrategy,
  deleteStrategy,
  type PlaybookStrategy,
  type StrategyRule,
  type StrategySetup,
} from "@/app/actions/playbook-actions"
import { VisualMap } from "@/components/playbook/visual-map"
import { EnhancedVisualMap } from "@/components/playbook/enhanced-visual-map"
import { StrategyDesigner } from "@/components/playbook/strategy-designer"

// ---------- CONSTANTS ----------
const CONFLUENCE_CATEGORIES = [
  { id: "price", label: "Price Action", icon: CandlestickChart, color: "text-success", bg: "bg-success/10", border: "border-success/20", dot: "bg-success" },
  { id: "time", label: "Time / Session", icon: Clock, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", dot: "bg-warning" },
  { id: "indicator", label: "Indicator", icon: Activity, color: "text-info", bg: "bg-info/10", border: "border-info/20", dot: "bg-info" },
  { id: "structure", label: "Structure", icon: Layers, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", dot: "bg-primary" },
]

// ---------- SPARKLINE ----------
function MiniEquityCurve({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = useMemo(() => {
    if (!data || data.length < 2) return [{ v: 0 }, { v: 1 }]
    return data.map((v) => ({ v }))
  }, [data])
  const color = positive ? "hsl(var(--success))" : "hsl(var(--destructive))"

  return (
    <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`eq-${positive}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#eq-${positive})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}


// ---------- STAT PILL ----------
function StatPill({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="flex items-center gap-3.5 p-4 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
      <div className={cn("p-2.5 rounded-xl ring-1", accent)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}


// ---------- STRATEGY CARD ----------
function StrategyCard({
  strat,
  onEdit,
  onDelete,
}: {
  strat: PlaybookStrategy
  onEdit: () => void
  onDelete: () => void
}) {
  const isProfitable = (strat.pnl || 0) >= 0
  const winRate = strat.win_rate || 0
  const setupCount = strat.setups?.length || 0
  const ruleCount = strat.rules?.length || 0

  return (
    <div className="group animate-fade-in-up">
      <Card className="h-full border-border bg-card overflow-hidden hover:border-primary/25 transition-all duration-200 flex flex-col relative">
        {/* Subtle equity curve background */}
        <div className="h-28 relative flex flex-col justify-between p-5 border-b border-border">
          <MiniEquityCurve data={strat.equity_curve || []} positive={isProfitable} />

          {/* Top row */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex gap-1.5">
              {setupCount > 0 && (
                <Badge variant="secondary" className="text-[10px] font-mono h-5 bg-primary/10 text-primary border-0">
                  {setupCount} {setupCount === 1 ? "setup" : "setups"}
                </Badge>
              )}
              {ruleCount > 0 && (
                <Badge variant="secondary" className="text-[10px] font-mono h-5 bg-muted text-muted-foreground border-0">
                  {ruleCount} rules
                </Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Strategy name */}
          <div className="relative z-10 mt-auto">
            <h3 className="text-lg font-bold tracking-tight text-foreground truncate leading-tight">{strat.name}</h3>
            {strat.description && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{strat.description}</p>
            )}
          </div>
        </div>

        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            <div className="px-4 py-3 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Win Rate</p>
              <p className={cn("text-lg font-bold tabular-nums", winRate >= 50 ? "text-success" : winRate > 0 ? "text-warning" : "text-muted-foreground")}>{winRate}%</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trades</p>
              <p className="text-lg font-bold text-foreground tabular-nums">{strat.trades_count || 0}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net P&L</p>
              <p className={cn("text-lg font-bold font-mono tabular-nums", isProfitable ? "text-success" : "text-destructive")}>
                {isProfitable ? "+" : ""}${Math.abs(strat.pnl || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Setup progress bar */}
          {setupCount > 0 && (
            <div className="px-4 py-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Setups</span>
                <span className="text-[10px] text-muted-foreground font-mono">{setupCount}</span>
              </div>
              <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-muted/50">
                {(strat.setups || []).slice(0, 8).map((_, i) => (
                  <div key={i} className="h-full flex-1 rounded-full bg-primary/50 first:bg-primary" />
                ))}
              </div>
            </div>
          )}

          {/* Quick-edit footer */}
          <div className="mt-auto px-4 py-3 border-t border-border">
            <button onClick={onEdit} className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-primary transition-colors group/btn">
              <span className="flex items-center gap-1.5">
                <Edit2 className="w-3 h-3" /> Open in Engine
              </span>
              <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


// ---------- MAIN PAGE ----------
export default function PlaybookPage() {
  const [strategies, setStrategies] = useState<PlaybookStrategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<PlaybookStrategy | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await getStrategies()
      setStrategies(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "Failed to load playbook", variant: "destructive" })
      setStrategies([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async (s: Partial<PlaybookStrategy>) => {
    await upsertStrategy(s)
    toast({ title: "Strategy saved", description: `"${s.name}" has been updated in your playbook.` })
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this strategy? This cannot be undone.")) return
    await deleteStrategy(id)
    loadData()
  }

  const filtered = strategies.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const totalPnL = strategies.reduce((acc, s) => acc + (s.pnl || 0), 0)
  const totalTrades = strategies.reduce((acc, s) => acc + (s.trades_count || 0), 0)
  const bestStrategy = strategies.length > 0
    ? strategies.reduce((prev, curr) => ((prev.win_rate || 0) > (curr.win_rate || 0) ? prev : curr), strategies[0])
    : null
  const avgWinRate = strategies.length > 0
    ? Math.round(strategies.reduce((acc, s) => acc + (s.win_rate || 0), 0) / strategies.length)
    : 0

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary hidden md:flex">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">Playbook</h1>
                <p className="text-[11px] text-muted-foreground hidden md:block">Your strategy library and trade systems.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-48 h-8 text-xs bg-card border-border"
                />
              </div>
              <Button size="sm" onClick={() => { setEditingStrategy(null); setIsBuilderOpen(true) }} className="gap-1.5 font-semibold shadow-sm h-8">
                <Plus className="w-4 h-4" /> New Strategy
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 space-y-8">

        {/* Mobile search */}
        <div className="md:hidden relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search strategies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-card" />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatPill icon={Layers} label="Strategies" value={String(strategies.length)} accent="bg-primary/10 text-primary ring-primary/20" />
          <StatPill
            icon={TrendingUp}
            label="Total P&L"
            value={`${totalPnL >= 0 ? "+" : "-"}$${Math.abs(totalPnL).toLocaleString()}`}
            accent={totalPnL >= 0 ? "bg-success/10 text-success ring-success/20" : "bg-destructive/10 text-destructive ring-destructive/20"}
          />
          <StatPill icon={BarChart3} label="Total Trades" value={String(totalTrades)} sub={`${avgWinRate}% avg win rate`} accent="bg-info/10 text-info ring-info/20" />
          <StatPill icon={Trophy} label="Top Performer" value={bestStrategy?.name || "N/A"} sub={bestStrategy ? `${bestStrategy.win_rate}% win rate` : undefined} accent="bg-warning/10 text-warning ring-warning/20" />
        </div>

        {/* Strategy Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Strategies</h2>
            {filtered.length > 0 && (
              <span className="text-xs text-muted-foreground font-mono">{filtered.length} total</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl bg-card/30">
              {searchQuery ? (
                <EmptyState
                  icon={SlidersHorizontal}
                  title="No matching strategies"
                  description="Try a different search term to find your strategies."
                  action={{ label: "Clear search", onClick: () => setSearchQuery(""), variant: "outline" }}
                />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Your playbook is empty"
                  description="Define your first trading system to start tracking performance data across setups."
                  action={{ label: "Create Strategy", onClick: () => { setEditingStrategy(null); setIsBuilderOpen(true) } }}
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((strat) => (
                <StrategyCard
                  key={strat.id}
                  strat={strat}
                  onEdit={() => { setEditingStrategy(strat); setIsBuilderOpen(true) }}
                  onDelete={() => handleDelete(strat.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Ecosystem Maps */}
        {strategies.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <LayersIcon className="w-4 h-4 text-primary" /> Ecosystem Map
              </h2>
            </div>
            <EnhancedVisualMap strategies={strategies as any} />
            <div className="mt-6">
              <VisualMap className="w-full shadow-sm border-border" />
            </div>
          </section>
        )}
      </div>

      <StrategyDesigner
        open={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
        onSave={handleSave}
        initialData={editingStrategy}
      />
    </div>
  )
}
