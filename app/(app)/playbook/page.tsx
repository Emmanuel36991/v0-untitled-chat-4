"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Search, Trash2, Edit2, Shield, MoreHorizontal,
  Loader2, X, ListChecks, TrendingUp,
  Trophy, Zap, Layers, ArrowDown
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose
} from "@/components/ui/sheet"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  getStrategies,
  upsertStrategy,
  deleteStrategy,
  type PlaybookStrategy,
  type StrategyRule,
  type StrategyPhase,
} from "@/app/actions/playbook-actions"

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
          <Area
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${color})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// --- STRATEGY BUILDER (REDESIGNED) ---
function StrategyBuilder({
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
  const [formData, setFormData] = useState<Partial<PlaybookStrategy>>({
    name: "",
    description: "",
    rules: [],
    tags: [],
  })
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (open) {
      setFormData(initialData || { name: "", description: "", rules: [], tags: [] })
    }
  }, [open, initialData])

  const addRule = (phase: StrategyPhase) => {
    const rule: StrategyRule = {
      id: Math.random().toString(36).substr(2, 9),
      text: "",
      phase,
      required: true,
    }
    setFormData((prev) => ({ ...prev, rules: [...(prev.rules || []), rule] }))
  }

  const updateRuleText = (id: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules?.map((r) => (r.id === id ? { ...r, text } : r)),
    }))
  }

  const removeRule = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules?.filter((r) => r.id !== id),
    }))
  }

  const handleSaveInternal = async () => {
    if (!formData.name) return toast({ title: "Name Required", description: "Please name your strategy.", variant: "destructive" })
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (e) {
      toast({ title: "Error", description: "Failed to save strategy.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (!newTag.trim() || formData.tags?.includes(newTag.trim())) return
    setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTag.trim()] }))
    setNewTag("")
  }

  // Group rules for display
  const rulesByPhase = {
    setup: formData.rules?.filter(r => r.phase === "setup") || [],
    confirmation: formData.rules?.filter(r => r.phase === "confirmation") || [],
    execution: formData.rules?.filter(r => r.phase === "execution") || [],
  }

  const renderPhaseSection = (phase: StrategyPhase, title: string, colorClass: string, number: string) => (
    <div className="relative pl-6 pb-6 last:pb-0">
      {/* Connector Line */}
      {phase !== 'execution' && (
        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-border/50" />
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 bg-background z-10", colorClass)}>
            {number}
          </div>
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => addRule(phase)}
          className="h-6 text-[10px] uppercase font-bold hover:bg-muted text-muted-foreground"
        >
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>
      
      <div className="space-y-2 ml-2">
        {rulesByPhase[phase as keyof typeof rulesByPhase]?.map((rule) => (
          <motion.div 
            key={rule.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="group flex gap-2 items-center"
          >
             <Input 
               value={rule.text} 
               onChange={(e) => updateRuleText(rule.id, e.target.value)}
               className="bg-card/50 border-border/60 focus:bg-background h-9 text-sm"
               placeholder="Enter rule..."
               autoFocus={!rule.text}
             />
             <Button
               variant="ghost"
               size="icon"
               onClick={() => removeRule(rule.id)}
               className="h-9 w-9 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
             >
               <X className="w-4 h-4" />
             </Button>
          </motion.div>
        ))}
        {rulesByPhase[phase as keyof typeof rulesByPhase]?.length === 0 && (
          <div 
            onClick={() => addRule(phase)}
            className="h-9 border border-dashed border-border/50 rounded-md flex items-center justify-center text-xs text-muted-foreground/60 cursor-pointer hover:bg-muted/30 transition-all"
          >
            + Add condition
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col bg-background p-0 border-l border-border shadow-2xl">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
               {initialData ? <Edit2 className="w-4 h-4"/> : <Shield className="w-4 h-4"/>}
             </div>
             <div>
                <SheetTitle className="text-lg font-bold">
                  {initialData ? "Edit Strategy" : "New Strategy"}
                </SheetTitle>
             </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-8">
            
            {/* 1. Identity */}
            <div className="space-y-4">
               <div className="space-y-2">
                 <Label className="text-xs font-semibold text-muted-foreground uppercase">Name</Label>
                 <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. ICT Silver Bullet" 
                    className="font-medium"
                 />
               </div>
               
               <div className="space-y-2">
                 <Label className="text-xs font-semibold text-muted-foreground uppercase">Description</Label>
                 <Textarea 
                    value={formData.description || ""}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="What is the edge?"
                    className="bg-card h-20 resize-none"
                 />
               </div>

               <div className="space-y-2">
                 <Label className="text-xs font-semibold text-muted-foreground uppercase">Tags</Label>
                 <div className="flex flex-wrap gap-2">
                    {formData.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="px-2 h-7 font-normal">
                        {tag} <X className="ml-1 w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFormData(prev => ({...prev, tags: prev.tags?.filter(t => t !== tag)}))} />
                      </Badge>
                    ))}
                    <Input 
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTag()}
                      placeholder="+ Tag"
                      className="w-24 h-7 text-xs px-2"
                    />
                 </div>
               </div>
            </div>

            <div className="w-full h-px bg-border/50" />

            {/* 2. Visual Logic Builder */}
            <div>
               <Label className="text-xs font-semibold text-muted-foreground uppercase mb-4 block">Execution Logic</Label>
               <div className="bg-card/30 rounded-xl border p-4">
                 {renderPhaseSection("setup", "Setup Phase", "border-blue-500 text-blue-500", "1")}
                 {renderPhaseSection("confirmation", "Confirmation", "border-purple-500 text-purple-500", "2")}
                 {renderPhaseSection("execution", "Execution Trigger", "border-emerald-500 text-emerald-500", "3")}
               </div>
            </div>

          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t bg-background">
          <SheetClose asChild><Button variant="ghost" className="w-full sm:w-auto">Cancel</Button></SheetClose>
          <Button onClick={handleSaveInternal} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : "Save Strategy"}
          </Button>
        </SheetFooter>
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

  // Stats
  const totalPnL = strategies.reduce((acc, s) => acc + (s.pnl || 0), 0)
  const bestStrategy = strategies.length > 0 ? strategies.reduce((prev, current) => (prev.win_rate > current.win_rate ? prev : current)) : null

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await getStrategies()
      setStrategies(data)
    } catch (e) {
      toast({ title: "Error", description: "Failed to load playbook", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async (s: Partial<PlaybookStrategy>) => {
    await upsertStrategy(s)
    toast({ title: "Success", description: "Strategy saved." })
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
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-background">
      
      {/* 1. Command Center Header */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Playbook</h1>
                <p className="text-muted-foreground mt-1 text-sm">Design and refine your trading systems.</p>
              </div>
              <div className="flex gap-3">
                 <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search strategies..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 w-64 bg-background border-input hover:border-primary/50 transition-colors" 
                    />
                 </div>
                 <Button onClick={() => { setEditingStrategy(null); setIsBuilderOpen(true) }} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    <Plus className="w-5 h-5 mr-2" /> New Strategy
                 </Button>
              </div>
           </div>

           {/* Metrics Strip */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/50">
                 <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-500"><Layers className="w-6 h-6"/></div>
                 <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground">Active Models</div>
                    <div className="text-2xl font-bold text-foreground">{strategies.length}</div>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/50">
                 <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500"><TrendingUp className="w-6 h-6"/></div>
                 <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground">Net PnL</div>
                    <div className={cn("text-2xl font-bold font-mono", totalPnL >= 0 ? "text-emerald-500" : "text-rose-500")}>
                       ${totalPnL.toLocaleString()}
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/50">
                 <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500"><Trophy className="w-6 h-6"/></div>
                 <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground">Top Performer</div>
                    <div className="text-lg font-bold text-foreground truncate max-w-[150px]">{bestStrategy?.name || "N/A"}</div>
                    {bestStrategy && <div className="text-xs text-muted-foreground">{bestStrategy.win_rate}% Win Rate</div>}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Strategy Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
         {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
         ) : filtered.length === 0 ? (
            <div className="text-center py-32 border-2 border-dashed rounded-3xl bg-card/30">
               <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
               <h3 className="text-xl font-bold text-foreground">Playbook Empty</h3>
               <p className="text-muted-foreground mt-2 mb-8">Define your first edge to start tracking data.</p>
               <Button onClick={() => { setEditingStrategy(null); setIsBuilderOpen(true) }}>Create Strategy</Button>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <AnimatePresence>
                  {filtered.map(strat => {
                     const isProfitable = (strat.pnl || 0) >= 0
                     const winRate = strat.win_rate || 0
                     
                     return (
                       <motion.div 
                          key={strat.id} 
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -4 }}
                          className="group h-full"
                       >
                          <Card className="h-full border-border/60 bg-card overflow-hidden hover:shadow-xl hover:border-indigo-500/20 transition-all duration-300">
                             
                             {/* Card Header area */}
                             <div className="h-32 relative p-6 flex flex-col justify-between border-b border-border/40 bg-gradient-to-b from-background to-card">
                                <Sparkline data={strat.equity_curve} color={isProfitable ? "#10b981" : "#ef4444"} />
                                
                                <div className="relative z-10 flex justify-between items-start">
                                   <div className="flex gap-2">
                                      {strat.tags?.slice(0,2).map(tag => (
                                         <Badge key={tag} variant="outline" className="bg-background/80 backdrop-blur text-[10px] uppercase font-bold text-muted-foreground border-border/80">{tag}</Badge>
                                      ))}
                                   </div>
                                   
                                   <DropdownMenu>
                                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/80 -mr-2 -mt-2"><MoreHorizontal className="w-4 h-4 text-muted-foreground"/></Button></DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                         <DropdownMenuItem onClick={() => { setEditingStrategy(strat); setIsBuilderOpen(true) }}><Edit2 className="w-4 h-4 mr-2"/> Edit Strategy</DropdownMenuItem>
                                         <DropdownMenuSeparator />
                                         <DropdownMenuItem className="text-rose-600" onClick={() => handleDelete(strat.id)}><Trash2 className="w-4 h-4 mr-2"/> Delete</DropdownMenuItem>
                                      </DropdownMenuContent>
                                   </DropdownMenu>
                                </div>
                                
                                <div className="relative z-10 mt-auto">
                                   <h3 className="text-lg font-bold tracking-tight text-foreground truncate">{strat.name}</h3>
                                </div>
                             </div>

                             <CardContent className="p-6 space-y-6">
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                                   {strat.description || "No description provided."}
                                </p>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 py-2">
                                   <div className="text-center">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Win Rate</div>
                                      <div className={cn("text-lg font-bold", winRate > 50 ? "text-emerald-500" : "text-muted-foreground")}>{winRate}%</div>
                                   </div>
                                   <div className="text-center border-l border-border/50">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trades</div>
                                      <div className="text-lg font-bold text-foreground">{strat.trades_count}</div>
                                   </div>
                                   <div className="text-center border-l border-border/50">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net PnL</div>
                                      <div className={cn("text-lg font-bold font-mono", isProfitable ? "text-emerald-500" : "text-rose-500")}>${(strat.pnl || 0).toLocaleString()}</div>
                                   </div>
                                </div>

                                {/* Rules Structure Visualization */}
                                <div className="space-y-2">
                                   <div className="flex justify-between items-end">
                                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Strategy Structure</span>
                                      <span className="text-[10px] text-muted-foreground">{strat.rules?.length || 0} Steps</span>
                                   </div>
                                   <div className="flex gap-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                      {(strat.rules || []).map((r, i) => {
                                         let color = "bg-slate-300"
                                         if (r.phase === 'setup') color = "bg-blue-500"
                                         if (r.phase === 'confirmation') color = "bg-purple-500"
                                         if (r.phase === 'execution') color = "bg-emerald-500"
                                         return <div key={i} className={cn("flex-1 transition-all", color)} style={{ opacity: 0.8 }} />
                                      })}
                                      {(!strat.rules || strat.rules.length === 0) && <div className="flex-1 bg-muted-foreground/20" />}
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

      {/* Editor Sheet */}
      <StrategyBuilder 
         open={isBuilderOpen} 
         onOpenChange={setIsBuilderOpen} 
         onSave={handleSave} 
         initialData={editingStrategy} 
      />
    </div>
  )
}
