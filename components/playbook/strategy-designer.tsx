"use client"

import React, { useState, useEffect } from "react"
import {
    GitBranch, Check, Plus, Database, Trash2, Target,
    CandlestickChart, Clock, Activity, Layers, Fingerprint,
    Library, Workflow, ArrowRight, MousePointerClick
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import type { PlaybookStrategy, StrategyRule, StrategySetup } from "@/app/actions/playbook-actions"

// Reusing the constants but they could be passed as props or imported if shared
const CONFLUENCE_CATEGORIES = [
    { id: "price", label: "Price Action", icon: CandlestickChart, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-500", ring: "ring-emerald-500/20" },
    { id: "time", label: "Time / Session", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-500", ring: "ring-amber-500/20" },
    { id: "indicator", label: "Indicator", icon: Activity, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20", dot: "bg-sky-500", ring: "ring-sky-500/20" },
    { id: "structure", label: "Structure", icon: Layers, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", dot: "bg-violet-500", ring: "ring-violet-500/20" },
]

interface StrategyDesignerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (strat: Partial<PlaybookStrategy>) => Promise<void>
    initialData?: PlaybookStrategy | null
}

export function StrategyDesigner({
    open,
    onOpenChange,
    onSave,
    initialData,
}: StrategyDesignerProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [confluences, setConfluences] = useState<StrategyRule[]>([])
    const [newConfluenceText, setNewConfluenceText] = useState("")
    const [newConfluenceType, setNewConfluenceType] = useState("price")
    const [setups, setSetups] = useState<StrategySetup[]>([])
    const [newSetupName, setNewSetupName] = useState("")

    // Visual state for focused setup
    const [focusedSetupId, setFocusedSetupId] = useState<string | null>(null)

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
            setFocusedSetupId(null)
        }
    }, [open, initialData])

    const addConfluence = () => {
        if (!newConfluenceText.trim()) return
        const newRule: StrategyRule = {
            id: Math.random().toString(36).substr(2, 9),
            text: newConfluenceText,
            phase: "setup",
            required: true
        }
        // Using Object.assign to bypass type strictness on 'category' if needed, 
        // though StrategyRule should optionally have it based on actions file
        Object.assign(newRule, { category: newConfluenceType })

        setConfluences((p) => [...p, newRule])
        setNewConfluenceText("")
    }

    const removeConfluence = (id: string) => {
        setConfluences((p) => p.filter((r) => r.id !== id))
        setSetups((p) => p.map((s) => ({
            ...s,
            activeConfluences: s.activeConfluences.filter((cid) => cid !== id)
        })))
    }

    const addSetup = () => {
        if (!newSetupName.trim()) return
        const newId = Math.random().toString(36).substr(2, 9)
        setSetups((p) => [...p, { id: newId, name: newSetupName, activeConfluences: [] }])
        setNewSetupName("")
        setFocusedSetupId(newId) // Auto-focus new setup
    }

    const toggleConfluenceInSetup = (setupId: string, ruleId: string) => {
        setSetups((p) => p.map((s) => {
            if (s.id !== setupId) return s
            const has = s.activeConfluences.includes(ruleId)
            return {
                ...s,
                activeConfluences: has ? s.activeConfluences.filter((x) => x !== ruleId) : [...s.activeConfluences, ruleId]
            }
        }))
    }

    const removeSetup = (id: string) => {
        setSetups((p) => p.filter((s) => s.id !== id))
        if (focusedSetupId === id) setFocusedSetupId(null)
    }

    const handleSaveInternal = async () => {
        if (!name.trim()) return toast({ title: "System Name Required", description: "Please name your trading system.", variant: "destructive" })
        setIsSubmitting(true)
        try {
            await onSave({ id: initialData?.id, name, description, rules: confluences, setups })
            onOpenChange(false)
        } catch {
            toast({ title: "Error", description: "Failed to save system.", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Derived state for rule grouping
    const groupedRules = confluences.reduce((acc, rule) => {
        const cat = (rule as any).category || "price"
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(rule)
        return acc
    }, {} as Record<string, StrategyRule[]>)

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="max-w-[95vw] md:max-w-[1400px] w-full flex flex-col bg-background p-0 border-l border-border shadow-2xl sm:duration-500">

                {/* Header - Document Style */}
                <div className="px-8 py-6 border-b border-border bg-card/30 flex items-start justify-between gap-8 z-10 backdrop-blur-sm support-backdrop-blur:bg-background/60">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 ring-1 ring-inset ring-primary/20">
                                <GitBranch className="w-5 h-5" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Untitled System"
                                    className="text-2xl font-bold bg-transparent border-none p-0 focus:ring-0 placeholder:text-muted-foreground/40 w-full h-auto"
                                />
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
                                    <Fingerprint className="w-3 h-3" /> System Designer
                                </p>
                            </div>
                        </div>
                        <div className="pl-14 max-w-2xl">
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the core philosophy of this trading system..."
                                className="min-h-[60px] resize-none bg-transparent border-none p-0 focus-visible:ring-0 text-muted-foreground/80 placeholder:text-muted-foreground/30 leading-relaxed"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 shrink-0 pt-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="hover:bg-muted/50">Cancel</Button>
                        <Button onClick={handleSaveInternal} disabled={isSubmitting} className="gap-2 font-semibold shadow-lg shadow-primary/20">
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">Saving...</span>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    Save System
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Workspace */}
                <div className="flex-1 flex overflow-hidden">

                    {/* LEFT: Rule Library */}
                    <div className="w-full md:w-[480px] flex flex-col border-r border-border bg-muted/10">
                        <div className="px-6 py-4 border-b border-border bg-background/50 flex items-center justifies-between sticky top-0 z-10 backdrop-blur-md">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Library className="w-4 h-4 text-primary" /> Rule Library
                            </h3>
                            <Badge variant="secondary" className="ml-auto font-mono text-[10px]">{confluences.length} Rules</Badge>
                        </div>

                        <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm">
                            <div className="flex gap-2">
                                <Select value={newConfluenceType} onValueChange={setNewConfluenceType}>
                                    <SelectTrigger className="w-[130px] h-9 text-xs font-medium bg-card">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONFLUENCE_CATEGORIES.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", c.dot)} />
                                                    {c.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex-1 relative">
                                    <Input
                                        value={newConfluenceText}
                                        onChange={(e) => setNewConfluenceText(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addConfluence()}
                                        placeholder="Add a trading rule..."
                                        className="h-9 text-sm pr-9 bg-card"
                                    />
                                    <Button size="icon" onClick={addConfluence} className="h-7 w-7 absolute right-1 top-1 rounded-sm text-primary hover:bg-primary/10 hover:text-primary bg-transparent shadow-none">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-8 pb-12">
                                {confluences.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                                        <Database className="w-8 h-8 text-muted-foreground mb-3" />
                                        <p className="text-sm font-medium">Library is empty</p>
                                        <p className="text-xs text-muted-foreground">Add rules above to start building.</p>
                                    </div>
                                ) : (
                                    CONFLUENCE_CATEGORIES.map(category => {
                                        const rules = groupedRules[category.id]
                                        if (!rules?.length) return null

                                        return (
                                            <div key={category.id} className="space-y-3">
                                                <h4 className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-2", category.color)}>
                                                    <category.icon className="w-3.5 h-3.5" />
                                                    {category.label}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    <AnimatePresence>
                                                        {rules.map((rule) => {
                                                            // Highlight logic
                                                            const isRelevant = focusedSetupId
                                                                ? setups.find(s => s.id === focusedSetupId)?.activeConfluences.includes(rule.id)
                                                                : true

                                                            return (
                                                                <motion.div
                                                                    key={rule.id}
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{
                                                                        opacity: isRelevant ? 1 : 0.3,
                                                                        scale: 1,
                                                                        filter: isRelevant ? "grayscale(0%)" : "grayscale(100%)"
                                                                    }}
                                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                                    layout
                                                                    className={cn(
                                                                        "flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium bg-card shadow-sm transition-all group select-none cursor-grab active:cursor-grabbing",
                                                                        category.border,
                                                                        // If focused setup doesn't have it, make it clickable to add? 
                                                                        // The user requested: "When I click a Setup card... Rules that are active should light up"
                                                                        // We can also allow clicking here to toggle validation if a setup is focused
                                                                        focusedSetupId && "cursor-pointer hover:ring-2 ring-primary/50"
                                                                    )}
                                                                    onClick={() => {
                                                                        if (focusedSetupId) toggleConfluenceInSetup(focusedSetupId, rule.id)
                                                                    }}
                                                                >
                                                                    <span className={cn("w-1.5 h-1.5 rounded-full", category.dot)} />
                                                                    {rule.text}
                                                                    {!focusedSetupId && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); removeConfluence(rule.id) }}
                                                                            className="ml-1.5 text-muted-foreground/50 hover:text-destructive transition-colors"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                    {focusedSetupId && isRelevant && (
                                                                        <Check className="w-3 h-3 ml-1.5 text-primary" />
                                                                    )}
                                                                </motion.div>
                                                            )
                                                        })}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* RIGHT: Entry Models */}
                    <div className="flex-1 flex flex-col bg-background relative">
                        <div className="px-8 py-4 border-b border-border flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md">
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                                    <Workflow className="w-4 h-4 text-primary" /> Entry Models
                                </h3>
                                <p className="text-[10px] text-muted-foreground hidden sm:block">
                                    Recipes for entering the market ("Setups"). Click to edit rules.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newSetupName}
                                    onChange={e => setNewSetupName(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && addSetup()}
                                    placeholder="New Model Name..."
                                    className="h-8 w-48 text-xs bg-muted/30"
                                />
                                <Button size="sm" onClick={addSetup} className="h-8 text-xs gap-1.5">
                                    <Plus className="w-3.5 h-3.5" /> Add Model
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-8 bg-muted/5">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
                                <AnimatePresence>
                                    {setups.map((setup) => {
                                        const isFocused = focusedSetupId === setup.id
                                        return (
                                            <motion.div
                                                key={setup.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    borderColor: isFocused ? "var(--primary)" : ""
                                                }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                onClick={() => setFocusedSetupId(isFocused ? null : setup.id)}
                                                className={cn(
                                                    "bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-md relative ring-offset-2 ring-transparent ring-offset-background",
                                                    isFocused && "ring-2 ring-primary border-primary shadow-lg shadow-primary/5"
                                                )}
                                            >
                                                <div className="px-5 py-4 border-b border-border/50 flex items-start justify-between bg-card/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("p-2 rounded-lg transition-colors", isFocused ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                                                            <Target className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sm tracking-tight">{setup.name}</h4>
                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                {setup.activeConfluences.length} Rules Active
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => { e.stopPropagation(); removeSetup(setup.id) }}
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>

                                                <div className="p-5 min-h-[120px]">
                                                    {setup.activeConfluences.length === 0 ? (
                                                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground/40 space-y-2">
                                                            <MousePointerClick className="w-6 h-6" />
                                                            <p className="text-xs">Click to select rules from the library</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {setup.activeConfluences.map(ruleId => {
                                                                const rule = confluences.find(r => r.id === ruleId)
                                                                if (!rule) return null
                                                                const cat = CONFLUENCE_CATEGORIES.find(c => c.id === ((rule as any).category || 'price')) || CONFLUENCE_CATEGORIES[0]
                                                                return (
                                                                    <div key={ruleId} className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium border bg-background/50", cat.border, cat.color)}>
                                                                        <span className={cn("w-1 h-1 rounded-full", cat.dot)} />
                                                                        {rule.text}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {isFocused && (
                                                    <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none animate-pulse-slow opacity-10" />
                                                )}
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>

                                {setups.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-60">
                                        <div className="p-4 rounded-full bg-muted/50 mb-4">
                                            <Workflow className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold">No Entry Models Defined</h3>
                                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                                            Create setup models like "Silver Bullet" or "Standard Deviation Reversal" to organize your rules into actionable triggers.
                                        </p>
                                        <Button variant="outline" size="sm" onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="New Model Name..."]')?.focus()} className="mt-6 gap-2">
                                            <Plus className="w-4 h-4" /> Create First Model
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
