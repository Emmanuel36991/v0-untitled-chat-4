"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Search, Trash2, Edit2, MoreHorizontal,
  Loader2, X, TrendingUp, Trophy, Layers, BookOpen,
  Clock, CandlestickChart, Activity, Globe, Ban, 
  Zap, Database, GitBranch, Check, ArrowRight, LayoutGrid
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
import {
  getStrategies,
  upsertStrategy,
  deleteStrategy,
  type PlaybookStrategy,
  type StrategyRule,
  type StrategySetup,
} from "@/app/actions/playbook-actions"
import { VisualMap } from "@/components/playbook/visual-map"

// --- CONSTANTS ---
const CONFLUENCE_CATEGORIES = [
  { id: "price", label: "Price Action", icon: CandlestickChart, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "time", label: "Time/Session", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "indicator", label: "Indicator", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "structure", label: "Structure", icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
]

// --- SPARKLINE CHART ---
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [{ val: 0 }, { val: 0 }]
    return data.map((val, i) => ({ i, val }))
  }, [data])

  return (
    <div className="h-full w-full absolute inset-0 opacity-[0.06] pointer-events-none z-0 mix-blend-multiply dark:mix-blend-screen">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="val" stroke={color} strokeWidth={2} fill={`url(#grad-${color})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// --- STRATEGY ENGINE (The Builder) ---
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
  
  // Strategy Identity
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  
  // 1. The Confluence Pool (Ingredients)
  const [confluences, setConfluences] = useState<StrategyRule[]>([])
  const [newConfluenceText, setNewConfluenceText] = useState("")
  const [newConfluenceType, setNewConfluenceType] = useState("price")

  // 2. The Setups (Recipes)
  const [setups, setSetups] = useState<StrategySetup[]>([])
  const [newSetupName, setNewSetupName] = useState("")

  // Load Data
  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name)
        // Clean description if it contains JSON artifacts
        let desc = initialData.description || ""
        if (desc.trim().startsWith("{")) desc = "" 
        setDescription(desc)
        
        setConfluences(initialData.rules || [])
        setSetups(initialData.setups || [])
      } else {
        setName("")
        setDescription("")
        setConfluences([])
        setSetups([])
      }
    }
  }, [open, initialData])

  // --- ACTIONS: CONFLUENCE POOL ---
  const addConfluence = () => {
    if (!newConfluenceText.trim()) return
    
    // Generate UUID locally for temporary use
    const newId = Math.random().toString(36).substr(2, 9)
    
    const newRuleObj: StrategyRule = {
      id: newId,
      text: newConfluenceText,
      phase: "setup", 
      required: true,
    }
    // Attach category for UI rendering
    Object.assign(newRuleObj, { category: newConfluenceType })

    setConfluences(prev => [...prev, newRuleObj])
    setNewConfluenceText("")
  }

  const removeConfluence = (id: string) => {
    setConfluences(prev => prev.filter(r => r.id !== id))
    // Also remove from any setups using it to keep integrity
    setSetups(prev => prev.map(s => ({
      ...s,
      activeConfluences: s.activeConfluences.filter(cid => cid !== id)
    })))
  }

  // --- ACTIONS: SETUPS ---
  const addSetup = () => {
    if (!newSetupName.trim()) return
    
    const newSetupId = Math.random().toString(36).substr(2, 9)
    const newSetup: StrategySetup = {
      id: newSetupId,
      name: newSetupName,
      activeConfluences: []
    }
    setSetups(prev => [...prev, newSetup])
    setNewSetupName("")
  }

  const toggleConfluenceInSetup = (setupId: string, confluenceId: string) => {
    setSetups(prev => prev.map(s => {
      if (s.id !== setupId) return s
      const isActive = s.activeConfluences.includes(confluenceId)
      return {
        ...s,
        activeConfluences: isActive 
          ? s.activeConfluences.filter(id => id !== confluenceId)
          : [...s.activeConfluences, confluenceId]
      }
    }))
  }

  const removeSetup = (id: string) => {
    setSetups(prev => prev.filter(s => s.id !== id))
  }

  // --- SAVE ---
  const handleSaveInternal = async () => {
    if (!name) return toast({ title: "Name Required", description: "Name your strategy.", variant: "destructive" })
    setIsSubmitting(true)
    
    const strategyData: Partial<PlaybookStrategy> = {
      id: initialData?.id,
      name,
      description,
      rules: confluences,
      setups: setups
    }

    try {
      await onSave(strategyData)
      onOpenChange(false)
    } catch (e) {
      toast({ title: "Error", description: "Failed to save strategy.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[95vw] md:max-w-[1400px] w-full flex flex-col bg-background p-0 border-l border-border shadow-2xl">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b bg-background sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-primary/10 rounded-xl text-primary">
               <GitBranch className="w-6 h-6"/>
             </div>
             <div>
                <SheetTitle className="text-2xl font-bold tracking-tight">
                  Strategy Engine
                </SheetTitle>
                <p className="text-sm text-muted-foreground">Define your strategy's vocabulary (left), then build setups (right).</p>
             </div>
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
             <Button onClick={handleSaveInternal} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 w-32 font-bold shadow-lg shadow-primary/20">
               {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : "Save Engine"}
             </Button>
          </div>
        </div>

        {/* WORKSPACE - SPLIT VIEW */}
        <div className="flex-1 flex overflow-hidden">
            
           {/* LEFT PANEL: CONFLUENCE POOL (THE LIBRARY) */}
           <div className="w-[450px] border-r border-border/40 bg-card/20 flex flex-col">
              <div className="p-6 border-b border-border/40 bg-muted/10">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Strategy Name</Label>
                       <Input 
                          value={name} 
                          onChange={e => setName(e.target.value)}
                          placeholder="e.g. ICT Concepts" 
                          className="font-black text-xl h-12 bg-background border-border/60"
                       />
                    </div>
                    <Textarea 
                       value={description}
                       onChange={e => setDescription(e.target.value)}
                       placeholder="Core philosophy (e.g. Algo delivery based on time & price)"
                       className="bg-background min-h-[60px] resize-none text-xs"
                    />
                 </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                 <div className="p-4 border-b border-border/40 flex justify-between items-center bg-background/50">
                    <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                       <Database className="w-4 h-4 text-primary" /> Confluence Pool
                    </h3>
                    <Badge variant="outline">{confluences.length} Factors</Badge>
                 </div>

                 {/* ADD CONFLUENCE INPUT */}
                 <div className="p-4 border-b border-border/40 bg-background">
                    <div className="flex gap-2 mb-2">
                       <Select value={newConfluenceType} onValueChange={setNewConfluenceType}>
                          <SelectTrigger className="w-[120px] h-9 text-xs font-bold bg-muted/50 border-border/60">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             {CONFLUENCE_CATEGORIES.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                       <div className="flex-1 relative">
                          <Input 
                             value={newConfluenceText}
                             onChange={e => setNewConfluenceText(e.target.value)}
                             onKeyDown={e => e.key === 'Enter' && addConfluence()}
                             placeholder="Add factor (e.g. 9:30 Open)"
                             className="h-9 text-xs pr-8"
                          />
                          <Button 
                             size="icon" 
                             onClick={addConfluence} 
                             className="h-7 w-7 absolute right-1 top-1 bg-primary/20 text-primary hover:bg-primary hover:text-white"
                          >
                             <Plus className="w-4 h-4"/>
                          </Button>
                       </div>
                    </div>
                 </div>

                 {/* CONFLUENCE LIST */}
                 <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                       <AnimatePresence>
                          {confluences.map(rule => {
                             const type = CONFLUENCE_CATEGORIES.find(c => c.id === (rule as any).category) || CONFLUENCE_CATEGORIES[0]
                             return (
                                <motion.div 
                                   key={rule.id}
                                   initial={{ opacity: 0, x: -10 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   exit={{ opacity: 0, height: 0 }}
                                   className={cn("flex items-center gap-3 p-2.5 rounded-lg border bg-card text-sm group select-none hover:border-primary/30 transition-all", type.border)}
                                >
                                   <div className={cn("p-1.5 rounded-md", type.bg, type.color)}>
                                      <type.icon className="w-3.5 h-3.5" />
                                   </div>
                                   <span className="flex-1 font-medium truncate" title={rule.text}>{rule.text}</span>
                                   <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                      <Button variant="ghost" size="icon" onClick={() => removeConfluence(rule.id)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                                         <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                   </div>
                                </motion.div>
                             )
                          })}
                       </AnimatePresence>
                       {confluences.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-muted/5">
                             <Layers className="w-8 h-8 text-muted-foreground/20 mb-2" />
                             <p className="text-xs text-muted-foreground font-medium">Pool Empty</p>
                             <p className="text-[10px] text-muted-foreground/60">Add raw concepts here.</p>
                          </div>
                       )}
                    </div>
                 </ScrollArea>
              </div>
           </div>

           {/* RIGHT PANEL: SETUP BUILDER (THE FACTORY) */}
           <div className="flex-1 flex flex-col bg-muted/5">
              <div className="p-6 border-b border-border/40">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                       <h2 className="text-xl font-bold tracking-tight">Setups</h2>
                       <p className="text-sm text-muted-foreground">Construct actionable setups by enabling confluences.</p>
                    </div>
                    <div className="flex gap-2">
                       <Input 
                          value={newSetupName}
                          onChange={e => setNewSetupName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addSetup()}
                          placeholder="New Setup Name (e.g. Silver Bullet)"
                          className="w-64 bg-background shadow-sm"
                       />
                       <Button onClick={addSetup} className="gap-2 shadow-sm">
                          <Plus className="w-4 h-4" /> Create Setup
                       </Button>
                    </div>
                 </div>
              </div>

              <ScrollArea className="flex-1 p-8">
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnimatePresence>
                       {setups.map(setup => (
                          <motion.div 
                             key={setup.id}
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="flex flex-col bg-card border border-border/60 rounded-xl shadow-sm overflow-hidden"
                          >
                             {/* Setup Header */}
                             <div className="p-4 border-b border-border/40 bg-muted/20 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                   <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                      <Zap className="w-4 h-4" />
                                   </div>
                                   <span className="font-bold">{setup.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeSetup(setup.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                   <Trash2 className="w-4 h-4" />
                                </Button>
                             </div>

                             {/* Setup Body - Confluence Selector */}
                             <div className="p-4 flex-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                   <ArrowRight className="w-3 h-3" /> Select Required Factors
                                </p>
                                
                                {confluences.length === 0 ? (
                                   <div className="text-center py-8 text-xs text-muted-foreground italic border border-dashed rounded-lg">
                                      Populate the Confluence Pool (Left) first.
                                   </div>
                                ) : (
                                   <div className="space-y-2">
                                      {confluences.map(rule => {
                                         const isActive = setup.activeConfluences.includes(rule.id)
                                         const type = CONFLUENCE_CATEGORIES.find(c => c.id === (rule as any).category) || CONFLUENCE_CATEGORIES[0]
                                         
                                         return (
                                            <div 
                                               key={rule.id}
                                               onClick={() => toggleConfluenceInSetup(setup.id, rule.id)}
                                               className={cn(
                                                  "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all select-none group",
                                                  isActive 
                                                     ? "bg-primary/5 border-primary/40 shadow-sm" 
                                                     : "bg-background border-border/40 hover:bg-muted/50 opacity-60 hover:opacity-100"
                                               )}
                                            >
                                               <div className={cn(
                                                  "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                                                  isActive ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 group-hover:border-primary/50"
                                               )}>
                                                  {isActive && <Check className="w-3 h-3" />}
                                               </div>
                                               
                                               <div className={cn("p-1 rounded bg-muted/50", type.color)}>
                                                  <type.icon className="w-3 h-3" />
                                               </div>
                                               
                                               <span className={cn("text-xs font-medium truncate", isActive ? "text-foreground" : "text-muted-foreground")}>
                                                  {rule.text}
                                               </span>
                                            </div>
                                         )
                                      })}
                                   </div>
                                )}
                             </div>
                             
                             <div className="p-3 bg-muted/10 border-t border-border/40 flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground font-mono">
                                   {setup.activeConfluences.length} Rules Active
                                </span>
                                {setup.activeConfluences.length > 0 && (
                                   <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5 h-5">Valid Setup</Badge>
                                )}
                             </div>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                    
                    {setups.length === 0 && (
                       <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/60 rounded-xl bg-muted/5">
                          <LayoutGrid className="w-12 h-12 text-muted-foreground/20 mb-4" />
                          <h3 className="text-lg font-medium text-foreground">No Setups Defined</h3>
                          <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">Create specific trade setups (e.g. 'Silver Bullet') by combining confluences from your strategy pool.</p>
                          <Button variant="secondary" onClick={() => document.querySelector('input[placeholder*="New Setup Name"]')?.focus()}>
                             Create Your First Setup
                          </Button>
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

// --- MAIN PAGE ---
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
    toast({ title: "Success", description: "Strategy saved to playbook." })
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete strategy? This action cannot be undone.")) return
    await deleteStrategy(id)
    loadData()
  }

  const filtered = strategies.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const totalPnL = strategies.reduce((acc, s) => acc + (s.pnl || 0), 0)
  const bestStrategy = strategies.length > 0 
    ? strategies.reduce((prev, current) => ((prev.win_rate || 0) > (current.win_rate || 0) ? prev : current), strategies[0]) 
    : null

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header with Glassmorphism */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary hidden md:block" />
                <div>
                   <h1 className="text-2xl font-bold tracking-tight text-foreground">Playbook</h1>
                   <p className="text-muted-foreground text-xs md:text-sm hidden md:block">Architect your trading systems.</p>
                </div>
             </div>
             <div className="flex gap-3">
                <div className="relative hidden md:block">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input 
                     placeholder="Search strategies..." 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="pl-9 w-64 bg-background/50 border-input hover:border-primary/50 transition-colors" 
                   />
                </div>
                <Button onClick={() => { setEditingStrategy(null); setIsBuilderOpen(true) }} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-bold">
                   <Plus className="w-5 h-5 mr-2" /> New Strategy
                </Button>
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-8 mt-8">
           
           {/* SECTION 1: METRICS GRID */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl border bg-card/40 hover:bg-card/60 transition-colors shadow-sm">
                 <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-500 ring-1 ring-indigo-500/20"><Layers className="w-6 h-6"/></div>
                 <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Active Systems</div>
                    <div className="text-2xl font-bold text-foreground">{strategies.length}</div>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl border bg-card/40 hover:bg-card/60 transition-colors shadow-sm">
                 <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 ring-1 ring-emerald-500/20"><TrendingUp className="w-6 h-6"/></div>
                 <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Total PnL</div>
                    <div className={cn("text-2xl font-bold font-mono", totalPnL >= 0 ? "text-emerald-500" : "text-rose-500")}>
                       ${totalPnL.toLocaleString()}
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl border bg-card/40 hover:bg-card/60 transition-colors shadow-sm">
                 <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500 ring-1 ring-amber-500/20"><Trophy className="w-6 h-6"/></div>
                 <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Top Performer</div>
                    <div className="text-lg font-bold text-foreground truncate max-w-[150px]">{bestStrategy?.name || "N/A"}</div>
                    {bestStrategy && <div className="text-xs text-muted-foreground">{bestStrategy.win_rate}% Win Rate</div>}
                 </div>
              </div>
           </div>

           {/* SECTION 2: VISUAL MAP */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Ecosystem Map
                 </h2>
              </div>
              <VisualMap className="w-full shadow-lg border-border/60" />
           </div>

           {/* SECTION 3: STRATEGY CARDS */}
           <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold tracking-tight">Active Strategies</h2>
              
              {isLoading ? (
                 <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
              ) : filtered.length === 0 ? (
                 <div className="text-center py-32 border-2 border-dashed rounded-3xl bg-card/30">
                    <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-foreground">Playbook Empty</h3>
                    <p className="text-muted-foreground mt-2 mb-8">Define your first system to start tracking data.</p>
                    <Button onClick={() => { setEditingStrategy(null); setIsBuilderOpen(true) }}>Create Strategy</Button>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                       {filtered.map(strat => {
                          const isProfitable = (strat.pnl || 0) >= 0
                          return (
                             <motion.div 
                                key={strat.id} 
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -4 }}
                                className="group h-full"
                             >
                                <Card className="h-full border-border/60 bg-card overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col">
                                   <div className="h-32 relative p-6 flex flex-col justify-between border-b border-border/40 bg-gradient-to-b from-background to-card/50">
                                      <Sparkline data={strat.equity_curve || []} color={isProfitable ? "#10b981" : "#ef4444"} />
                                      <div className="relative z-10 flex justify-between items-start">
                                         <div className="flex gap-2">
                                            <Badge variant="outline" className="bg-background/50 backdrop-blur text-[10px] uppercase font-bold text-muted-foreground border-border/50">Strategy</Badge>
                                         </div>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/80 -mr-2 -mt-2"><MoreHorizontal className="w-4 h-4 text-muted-foreground"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                               <DropdownMenuItem onClick={() => { setEditingStrategy(strat); setIsBuilderOpen(true) }}><Edit2 className="w-4 h-4 mr-2"/> Edit</DropdownMenuItem>
                                               <DropdownMenuSeparator />
                                               <DropdownMenuItem className="text-rose-600" onClick={() => handleDelete(strat.id)}><Trash2 className="w-4 h-4 mr-2"/> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                         </DropdownMenu>
                                      </div>
                                      <div className="relative z-10 mt-auto">
                                         <h3 className="text-lg font-bold tracking-tight text-foreground truncate">{strat.name}</h3>
                                      </div>
                                   </div>

                                   <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/40">
                                         <div className="text-center py-2">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Win Rate</div>
                                            <div className={cn("text-lg font-bold", (strat.win_rate || 0) > 50 ? "text-emerald-500" : "text-muted-foreground")}>{strat.win_rate || 0}%</div>
                                         </div>
                                         <div className="text-center py-2 border-l border-border/40">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trades</div>
                                            <div className="text-lg font-bold text-foreground">{strat.trades_count || 0}</div>
                                         </div>
                                         <div className="text-center py-2 border-l border-border/40">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net PnL</div>
                                            <div className={cn("text-lg font-bold font-mono", isProfitable ? "text-emerald-500" : "text-rose-500")}>${(strat.pnl || 0).toLocaleString()}</div>
                                         </div>
                                      </div>

                                      <div className="space-y-3 mt-auto">
                                         <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Active Setups</span>
                                            <span className="text-[10px] text-muted-foreground">{strat.setups?.length || 0}</span>
                                         </div>
                                         {/* Visualize Setup Counts */}
                                         <div className="flex gap-1 h-2 overflow-hidden rounded-full bg-secondary/50">
                                            {(strat.setups || []).slice(0,8).map((s,i) => {
                                               return <div key={i} className="h-full flex-1 bg-primary/40 first:bg-primary/60" />
                                            })}
                                            {(strat.setups || []).length === 0 && <div className="h-full w-full bg-muted" />}
                                         </div>
                                      </div>
                                   </CardContent>
                                </Card>
                             </motion.div>
                          )
                       })}
                    </AnimatePresence>
                 </div>
              )}
           </div>
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
