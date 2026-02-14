"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

// ---------- CONSTANTS ----------
const CONFLUENCE_CATEGORIES = [
  { id: "price", label: "Price Action", icon: CandlestickChart, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-500" },
  { id: "time", label: "Time / Session", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-500" },
  { id: "indicator", label: "Indicator", icon: Activity, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", dot: "bg-sky-500" },
  { id: "structure", label: "Structure", icon: Layers, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", dot: "bg-violet-500" },
]

// ---------- SPARKLINE ----------
function MiniEquityCurve({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = useMemo(() => {
    if (!data || data.length < 2) return [{ v: 0 }, { v: 1 }]
    return data.map((v) => ({ v }))
  }, [data])
  const color = positive ? "#10b981" : "#ef4444"

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

// ---------- STRATEGY ENGINE (Sheet Builder) ----------
function StrategyEngine({
  open,
  onOpenChange,
  onSave,
  initialData,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (strat: Partial<PlaybookStrategy>) => Promise<void>
  initialData?: PlaybookStrategy | null
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [confluences, setConfluences] = useState<StrategyRule[]>([])
  const [newConfluenceText, setNewConfluenceText] = useState("")
  const [newConfluenceType, setNewConfluenceType] = useState("price")
  const [setups, setSetups] = useState<StrategySetup[]>([])
  const [newSetupName, setNewSetupName] = useState("")

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name)
        let desc = initialData.description || ""
        if (desc.trim().startsWith("{")) desc = ""
        setDescription(desc)
        setConfluences(initialData.rules || [])
        setSetups(initialData.setups || [])
      } else {
        setName(""); setDescription(""); setConfluences([]); setSetups([])
      }
    }
  }, [open, initialData])

  const addConfluence = () => {
    if (!newConfluenceText.trim()) return
    const newRule: StrategyRule = { id: Math.random().toString(36).substr(2, 9), text: newConfluenceText, phase: "setup", required: true }
    Object.assign(newRule, { category: newConfluenceType })
    setConfluences((p) => [...p, newRule])
    setNewConfluenceText("")
  }

  const removeConfluence = (id: string) => {
    setConfluences((p) => p.filter((r) => r.id !== id))
    setSetups((p) => p.map((s) => ({ ...s, activeConfluences: s.activeConfluences.filter((cid) => cid !== id) })))
  }

  const addSetup = () => {
    if (!newSetupName.trim()) return
    setSetups((p) => [...p, { id: Math.random().toString(36).substr(2, 9), name: newSetupName, activeConfluences: [] }])
    setNewSetupName("")
  }

  const toggleConfluenceInSetup = (setupId: string, ruleId: string) => {
    setSetups((p) => p.map((s) => {
      if (s.id !== setupId) return s
      const has = s.activeConfluences.includes(ruleId)
      return { ...s, activeConfluences: has ? s.activeConfluences.filter((x) => x !== ruleId) : [...s.activeConfluences, ruleId] }
    }))
  }

  const removeSetup = (id: string) => setSetups((p) => p.filter((s) => s.id !== id))

  const handleSaveInternal = async () => {
    if (!name) return toast({ title: "Name Required", description: "Give your strategy a name.", variant: "destructive" })
    setIsSubmitting(true)
    try {
      await onSave({ id: initialData?.id, name, description, rules: confluences, setups })
      onOpenChange(false)
    } catch {
      toast({ title: "Error", description: "Failed to save strategy.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[95vw] md:max-w-[1400px] w-full flex flex-col bg-background p-0 border-l border-border shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-card/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-xl font-bold tracking-tight">Strategy Engine</SheetTitle>
              <p className="text-xs text-muted-foreground truncate">Define confluences, then combine them into actionable setups.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveInternal} disabled={isSubmitting} className="gap-1.5 font-semibold shadow-sm">
              {isSubmitting ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              Save
            </Button>
          </div>
        </div>

        {/* Split workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Confluence Pool */}
          <div className="w-full md:w-[420px] border-r border-border flex flex-col bg-card/30">
            {/* Identity */}
            <div className="p-5 border-b border-border space-y-3">
              <div>
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Strategy Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ICT Silver Bullet" className="font-bold text-base h-10 bg-background" />
              </div>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Core thesis or philosophy..." className="bg-background min-h-[48px] resize-none text-xs leading-relaxed" />
            </div>

            {/* Pool header */}
            <div className="px-5 py-3 border-b border-border flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-primary" /> Confluence Pool
              </h3>
              <Badge variant="secondary" className="text-[10px] font-mono h-5">{confluences.length}</Badge>
            </div>

            {/* Add confluence */}
            <div className="p-4 border-b border-border bg-background/50">
              <div className="flex gap-1.5">
                <Select value={newConfluenceType} onValueChange={setNewConfluenceType}>
                  <SelectTrigger className="w-[110px] h-8 text-[11px] font-semibold bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONFLUENCE_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-1.5">
                          <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
                          {c.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1 relative">
                  <Input value={newConfluenceText} onChange={(e) => setNewConfluenceText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addConfluence()} placeholder="Add factor..." className="h-8 text-xs pr-8 bg-card" />
                  <Button size="icon" onClick={addConfluence} className="h-6 w-6 absolute right-1 top-1 bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground rounded-md">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Confluence list */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-1.5">
                <AnimatePresence>
                  {confluences.map((rule) => {
                    const cat = CONFLUENCE_CATEGORIES.find((c) => c.id === (rule as any).category) || CONFLUENCE_CATEGORIES[0]
                    return (
                      <motion.div key={rule.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm group hover:border-primary/30 transition-colors", cat.border, "bg-card/60")}>
                        <span className={cn("w-2 h-2 rounded-full shrink-0", cat.dot)} />
                        <span className="flex-1 font-medium truncate text-foreground/90 text-xs">{rule.text}</span>
                        <button onClick={() => removeConfluence(rule.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-0.5">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {confluences.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-3 rounded-xl bg-muted/50 mb-3">
                      <Layers className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">No confluences yet</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">Add your raw trading concepts above</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: Setup Builder */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-6 py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                  <PulseIcon className="w-4 h-4 text-primary" /> Setups
                </h2>
                <p className="text-xs text-muted-foreground">Combine confluences into actionable trade setups.</p>
              </div>
              <div className="flex gap-2">
                <Input value={newSetupName} onChange={(e) => setNewSetupName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSetup()} placeholder="e.g. Silver Bullet" className="w-52 h-8 text-xs bg-card" />
                <Button size="sm" onClick={addSetup} className="gap-1.5 h-8 text-xs shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AnimatePresence>
                  {setups.map((setup) => (
                    <motion.div key={setup.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col bg-card border border-border rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0">
                            <Target className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-sm truncate">{setup.name}</span>
                          {setup.activeConfluences.length > 0 && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5 shrink-0">{setup.activeConfluences.length} active</Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeSetup(setup.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="p-3 space-y-1">
                        {confluences.length === 0 ? (
                          <div className="text-center py-6 text-xs text-muted-foreground/60 italic">Add confluences to the pool first</div>
                        ) : (
                          confluences.map((rule) => {
                            const isActive = setup.activeConfluences.includes(rule.id)
                            const cat = CONFLUENCE_CATEGORIES.find((c) => c.id === (rule as any).category) || CONFLUENCE_CATEGORIES[0]
                            return (
                              <div key={rule.id} onClick={() => toggleConfluenceInSetup(setup.id, rule.id)} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all select-none text-xs", isActive ? "bg-primary/5 border-primary/30" : "bg-transparent border-transparent hover:bg-muted/50 opacity-50 hover:opacity-80")}>
                                <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors", isActive ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/25")}>
                                  {isActive && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cat.dot)} />
                                <span className={cn("font-medium truncate", isActive ? "text-foreground" : "text-muted-foreground")}>{rule.text}</span>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {setups.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20">
                    <div className="p-4 rounded-2xl bg-muted/30 mb-4">
                      <LayoutGrid className="w-8 h-8 text-muted-foreground/25" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">No setups yet</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs text-center leading-relaxed">Create trade setups like "Silver Bullet" or "London Killzone" by combining your confluences.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="group">
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
              <p className={cn("text-lg font-bold tabular-nums", winRate >= 50 ? "text-emerald-500" : winRate > 0 ? "text-amber-500" : "text-muted-foreground")}>{winRate}%</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trades</p>
              <p className="text-lg font-bold text-foreground tabular-nums">{strat.trades_count || 0}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net P&L</p>
              <p className={cn("text-lg font-bold font-mono tabular-nums", isProfitable ? "text-emerald-500" : "text-rose-500")}>
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
    </motion.div>
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
            accent={totalPnL >= 0 ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20" : "bg-rose-500/10 text-rose-500 ring-rose-500/20"}
          />
          <StatPill icon={BarChart3} label="Total Trades" value={String(totalTrades)} sub={`${avgWinRate}% avg win rate`} accent="bg-sky-500/10 text-sky-500 ring-sky-500/20" />
          <StatPill icon={Trophy} label="Top Performer" value={bestStrategy?.name || "N/A"} sub={bestStrategy ? `${bestStrategy.win_rate}% win rate` : undefined} accent="bg-amber-500/10 text-amber-500 ring-amber-500/20" />
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
            <EnhancedVisualMap strategies={strategies} />
            <div className="mt-6">
              <VisualMap className="w-full shadow-sm border-border" />
            </div>
          </section>
        )}
      </div>

      <StrategyEngine
        open={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
        onSave={handleSave}
        initialData={editingStrategy}
      />
    </div>
  )
}
