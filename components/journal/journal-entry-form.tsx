"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Target, Activity, Lightbulb, AlertTriangle, Save, X } from "lucide-react"
import { PulseIcon } from "@/components/icons/system-icons"
import { cn } from "@/lib/utils"
import { MOODS, EMOTIONAL_TRIGGERS, BEHAVIORAL_PATTERNS } from "./journal-constants"

interface JournalEntryFormProps {
    onSave: (entryData: any) => void
}

export function JournalEntryForm({ onSave }: JournalEntryFormProps) {
    const [activeTab, setActiveTab] = useState("pre")
    const [mood, setMood] = useState("")
    const [confidence, setConfidence] = useState([5])
    const [focus, setFocus] = useState([5])
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
    const [selectedPatterns, setSelectedPatterns] = useState<string[]>([])
    const [customTags, setCustomTags] = useState<string[]>([])
    const [customTagInput, setCustomTagInput] = useState("")
    const [preTradeThoughts, setPreTradeThoughts] = useState("")
    const [postTradeThoughts, setPostTradeThoughts] = useState("")
    const [lessonsLearned, setLessonsLearned] = useState("")

    function handleSave() {
        const emotionsArray = [
            ...selectedTriggers,
            ...selectedPatterns,
            ...customTags,
            `Confidence: ${confidence[0]}`,
            `Focus: ${focus[0]}`
        ]

        onSave({
            entry_date: new Date().toISOString().split("T")[0],
            mood,
            emotions: emotionsArray,
            pre_trade_thoughts: preTradeThoughts,
            post_trade_thoughts: postTradeThoughts,
            lessons_learned: lessonsLearned,
        })
    }

    function toggleTrigger(id: string) {
        setSelectedTriggers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    function togglePattern(id: string) {
        setSelectedPatterns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    function addCustomTag() {
        if (customTagInput.trim() && !customTags.includes(customTagInput.trim())) {
            setCustomTags([...customTags, customTagInput.trim()])
            setCustomTagInput("")
        }
    }

    function removeCustomTag(tag: string) {
        setCustomTags(customTags.filter(t => t !== tag))
    }

    return (
        <Card className="border-border bg-card shadow-lg h-full flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <div className="px-6 pt-6">
                    <TabsList className="grid grid-cols-2 bg-muted/50 p-1 rounded-lg border border-border/50">
                        <TabsTrigger value="pre" className="data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-xs font-medium">
                            Pre-Session
                        </TabsTrigger>
                        <TabsTrigger value="post" className="data-[state=active]:bg-card data-[state=active]:text-success data-[state=active]:shadow-sm text-xs font-medium">
                            Post-Session
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <CardContent className="p-6 space-y-6">

                        {/* PRE-SESSION TAB */}
                        <TabsContent value="pre" className="mt-0 space-y-6">

                            {/* Mood Selector */}
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current State</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {MOODS.map((m) => (
                                        <button
                                            key={m.id}
                                            role="radio"
                                            aria-checked={mood === m.id}
                                            onClick={() => setMood(m.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all duration-200",
                                                mood === m.id
                                                    ? cn(m.activeClass, "ring-1 ring-inset ring-white/10 shadow-sm")
                                                    : "bg-muted/30 border-border/50 text-muted-foreground hover:border-border hover:bg-muted/50"
                                            )}
                                        >
                                            <span className="text-2xl" aria-hidden="true">{m.emoji}</span>
                                            <span className="text-2xs font-medium uppercase tracking-wide">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sliders */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-xl border border-border/40">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                                            <Target className="w-3 h-3 text-primary" /> Confidence
                                        </Label>
                                        <span className="text-sm font-mono text-primary font-bold">{confidence[0]}/10</span>
                                    </div>
                                    <Slider
                                        value={confidence}
                                        onValueChange={setConfidence}
                                        max={10} step={1}
                                        className="py-2"
                                        aria-label="Confidence level from 1 to 10"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                                            <PulseIcon className="w-3 h-3 text-success" /> Focus Level
                                        </Label>
                                        <span className="text-sm font-mono text-success font-bold">{focus[0]}/10</span>
                                    </div>
                                    <Slider
                                        value={focus}
                                        onValueChange={setFocus}
                                        max={10} step={1}
                                        className="py-2"
                                        aria-label="Focus level from 1 to 10"
                                    />
                                </div>
                            </div>

                            {/* Pre-Trade Notes */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mindset & Trade Plan</Label>
                                <Textarea
                                    value={preTradeThoughts}
                                    onChange={(e) => setPreTradeThoughts(e.target.value)}
                                    placeholder="What is your plan? Are you forcing a trade?"
                                    className="bg-background/50 border-border/60 text-foreground min-h-[100px] placeholder:text-muted-foreground/50"
                                    aria-label="Pre-trade thoughts"
                                />
                            </div>
                        </TabsContent>

                        {/* POST-SESSION TAB */}
                        <TabsContent value="post" className="mt-0 space-y-6">

                            {/* Triggers & Patterns */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3 text-warning" /> Emotional Triggers
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Emotional Triggers">
                                        {EMOTIONAL_TRIGGERS.map(t => (
                                            <button
                                                key={t.id}
                                                role="switch"
                                                aria-checked={selectedTriggers.includes(t.id)}
                                                onClick={() => toggleTrigger(t.id)}
                                                className={cn(
                                                    "text-2xs uppercase font-bold tracking-wide px-2.5 py-1.5 rounded-md border transition-all",
                                                    selectedTriggers.includes(t.id)
                                                        ? "bg-warning/15 text-warning border-warning/30"
                                                        : "bg-muted/30 border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                                                )}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-destructive" /> Bad Habits
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Bad Habits">
                                        {BEHAVIORAL_PATTERNS.map(p => (
                                            <button
                                                key={p.id}
                                                role="switch"
                                                aria-checked={selectedPatterns.includes(p.id)}
                                                onClick={() => togglePattern(p.id)}
                                                className={cn(
                                                    "text-2xs uppercase font-bold tracking-wide px-2.5 py-1.5 rounded-md border transition-all",
                                                    selectedPatterns.includes(p.id)
                                                        ? "bg-destructive/15 text-destructive border-destructive/30"
                                                        : "bg-muted/30 border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                                                )}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Custom Tags */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custom Tags</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={customTagInput}
                                        onChange={(e) => setCustomTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                                        placeholder="Add tag..."
                                        className="h-8 text-xs bg-background/50 border-border/60"
                                        aria-label="Add custom tag"
                                    />
                                    <Button size="sm" variant="secondary" onClick={addCustomTag} className="h-8">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {customTags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-muted-foreground border-border cursor-pointer hover:border-destructive/50 hover:text-destructive transition-colors" onClick={() => removeCustomTag(tag)}>
                                            {tag} <X className="w-3 h-3 ml-1" aria-hidden="true" />
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Post-Trade Review</Label>
                                <Textarea
                                    value={postTradeThoughts}
                                    onChange={(e) => setPostTradeThoughts(e.target.value)}
                                    placeholder="How did you handle your emotions during the trade?"
                                    className="bg-background/50 border-border/60 text-foreground min-h-[80px] placeholder:text-muted-foreground/50"
                                    aria-label="Post-trade review comments"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Lightbulb className="w-3 h-3 text-warning" /> Key Lesson
                                </Label>
                                <Textarea
                                    value={lessonsLearned}
                                    onChange={(e) => setLessonsLearned(e.target.value)}
                                    placeholder="One thing to improve tomorrow..."
                                    className="bg-warning/5 border-warning/20 text-foreground min-h-[60px] focus:border-warning/40 placeholder:text-muted-foreground/50"
                                    aria-label="Key lesson learned"
                                />
                            </div>
                        </TabsContent>
                    </CardContent>
                </div>

                <div className="p-4 border-t border-border bg-muted/30">
                    <Button onClick={handleSave} disabled={!mood} className="w-full gap-2 shadow-sm">
                        <Save className="w-4 h-4" />
                        Save Journal Entry
                    </Button>
                </div>
            </Tabs>
        </Card>
    )
}
