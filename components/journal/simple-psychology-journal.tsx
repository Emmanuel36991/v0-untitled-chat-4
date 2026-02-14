"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Eye,
  Trash2,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Brain,
  Save,
  X,
  History,
  Target,
  Activity,
  Loader2,
} from "lucide-react"
import { PulseIcon } from "@/components/icons/system-icons"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// --- Data Constants ---
const EMOTIONAL_TRIGGERS = [
  { id: "large-loss", label: "Large Loss" },
  { id: "consecutive-losses", label: "Consecutive Losses" },
  { id: "time-pressure", label: "Time Pressure" },
  { id: "personal-stress", label: "Personal Stress" },
  { id: "comparison-others", label: "Comparison to Others" },
  { id: "missed-opportunity", label: "Missing Opportunity" },
  { id: "market-volatility", label: "Market Volatility" },
  { id: "overconfidence", label: "Overconfidence" },
  { id: "account-drawdown", label: "Account Drawdown" },
]

const BEHAVIORAL_PATTERNS = [
  { id: "overtrading", label: "Overtrading" },
  { id: "averaging-down", label: "Averaging Down" },
  { id: "cutting-winners", label: "Cutting Winners Early" },
  { id: "ignoring-stops", label: "Ignoring Stop Losses" },
  { id: "trading-without-plan", label: "Trading Without Plan" },
  { id: "revenge-trading", label: "Revenge Trading" },
  { id: "fomo-trading", label: "FOMO Trading" },
  { id: "holding-losers", label: "Holding Losers" },
  { id: "position-size-large", label: "Oversizing" },
]

const MOODS = [
  { id: "euphoric", label: "Euphoric", emoji: "😄", activeClass: "bg-success/20 text-success border-success/30" },
  { id: "confident", label: "Confident", emoji: "😊", activeClass: "bg-primary/20 text-primary border-primary/30" },
  { id: "focused", label: "Focused", emoji: "🎯", activeClass: "bg-info/20 text-info border-info/30" },
  { id: "neutral", label: "Neutral", emoji: "😐", activeClass: "bg-muted text-muted-foreground border-border" },
  { id: "cautious", label: "Cautious", emoji: "⚠️", activeClass: "bg-warning/20 text-warning border-warning/30" },
  { id: "frustrated", label: "Frustrated", emoji: "😤", activeClass: "bg-warning/20 text-warning border-warning/30" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😰", activeClass: "bg-destructive/20 text-destructive border-destructive/30" },
  { id: "exhausted", label: "Exhausted", emoji: "😫", activeClass: "bg-destructive/15 text-destructive border-destructive/25" },
  { id: "anxious", label: "Anxious", emoji: "😟", activeClass: "bg-destructive/15 text-destructive border-destructive/25" },
]

interface JournalEntry {
  id: string
  created_at: string
  entry_date: string
  mood: string
  emotions: string[]
  pre_trade_thoughts: string
  post_trade_thoughts: string
  lessons_learned: string
}

export default function SimplePsychologyJournal() {
  const { toast } = useToast()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null)

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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data, error } = await supabase
        .from("psychology_journal_entries")
        .select("*, trades!psychology_journal_entries_trade_id_fkey(instrument, pnl, outcome)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("Error loading entries:", error)
      toast({ title: "Error", description: "Failed to load journal.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function saveEntry() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: "Error", description: "Login required.", variant: "destructive" })
        return
      }

      const emotionsArray = [
        ...selectedTriggers,
        ...selectedPatterns,
        ...customTags,
        `Confidence: ${confidence[0]}`,
        `Focus: ${focus[0]}`
      ]

      const entryData = {
        user_id: user.id,
        entry_date: new Date().toISOString().split("T")[0],
        mood,
        emotions: emotionsArray,
        pre_trade_thoughts: preTradeThoughts,
        post_trade_thoughts: postTradeThoughts,
        lessons_learned: lessonsLearned,
      }

      const { error } = await supabase.from("psychology_journal_entries").insert(entryData)
      if (error) throw error

      toast({ title: "Log Recorded", description: "Your mental state has been successfully tracked." })

      setMood("")
      setSelectedTriggers([])
      setSelectedPatterns([])
      setCustomTags([])
      setCustomTagInput("")
      setPreTradeThoughts("")
      setPostTradeThoughts("")
      setLessonsLearned("")
      setConfidence([5])
      setFocus([5])
      setShowForm(false)
      setActiveTab("pre")
      loadEntries()
    } catch (error) {
      console.error("Error saving entry:", error)
      toast({ title: "Error", description: "Failed to save entry.", variant: "destructive" })
    }
  }

  async function deleteEntry(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("psychology_journal_entries").delete().eq("id", id).eq("user_id", user.id)
      if (error) throw error

      toast({ title: "Deleted", description: "Journal entry removed." })
      loadEntries()
    } catch (error) {
      console.error("Error deleting:", error)
      toast({ title: "Error", description: "Could not delete entry.", variant: "destructive" })
    }
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

  function getEmotionLabel(id: string): string {
    const trigger = EMOTIONAL_TRIGGERS.find(t => t.id === id)
    if (trigger) return trigger.label
    const pattern = BEHAVIORAL_PATTERNS.find(p => p.id === id)
    if (pattern) return pattern.label
    return id
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] border border-border rounded-xl bg-card">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading journal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">

      {/* Header / Toggle */}
      {!showForm ? (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <History className="w-4 h-4 text-primary" />
              </div>
              Journal History
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {entries.length} RECORDS FOUND
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            New Log
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">New Session Log</h3>
              <p className="text-xs text-muted-foreground">Recording mental state...</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Main Form / History */}
      {showForm ? (
        <div className="flex-1 animate-fade-in-up">
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
                            onClick={() => setMood(m.id)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all duration-200",
                              mood === m.id
                                ? cn(m.activeClass, "ring-1 ring-inset ring-white/10 shadow-sm")
                                : "bg-muted/30 border-border/50 text-muted-foreground hover:border-border hover:bg-muted/50"
                            )}
                          >
                            <span className="text-2xl">{m.emoji}</span>
                            <span className="text-[10px] font-medium uppercase tracking-wide">{m.label}</span>
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
                        <div className="flex flex-wrap gap-1.5">
                          {EMOTIONAL_TRIGGERS.map(t => (
                            <button
                              key={t.id}
                              onClick={() => toggleTrigger(t.id)}
                              className={cn(
                                "text-[10px] uppercase font-bold tracking-wide px-2.5 py-1.5 rounded-md border transition-all",
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
                        <div className="flex flex-wrap gap-1.5">
                          {BEHAVIORAL_PATTERNS.map(p => (
                            <button
                              key={p.id}
                              onClick={() => togglePattern(p.id)}
                              className={cn(
                                "text-[10px] uppercase font-bold tracking-wide px-2.5 py-1.5 rounded-md border transition-all",
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
                        />
                        <Button size="sm" variant="secondary" onClick={addCustomTag} className="h-8">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {customTags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-muted-foreground border-border cursor-pointer hover:border-destructive/50 hover:text-destructive transition-colors" onClick={() => removeCustomTag(tag)}>
                            {tag} <X className="w-3 h-3 ml-1" />
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
                      />
                    </div>
                  </TabsContent>
                </CardContent>
              </div>

              <div className="p-4 border-t border-border bg-muted/30">
                <Button onClick={saveEntry} disabled={!mood} className="w-full gap-2 shadow-sm">
                  <Save className="w-4 h-4" />
                  Save Journal Entry
                </Button>
              </div>
            </Tabs>
          </Card>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.length === 0 ? (
            <Card className="border-dashed border-2 border-border bg-card/50">
              <CardContent className="py-12 text-center">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl ring-1 ring-primary/10 w-fit mx-auto mb-4">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No entries yet</p>
                <p className="text-xs text-muted-foreground">Start tracking your mind to unlock insights.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => {
                const moodData = MOODS.find((m) => m.id === entry.mood)
                return (
                  <Card
                    key={entry.id}
                    className={cn(
                      "border-border bg-card hover:border-primary/20 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden",
                      `animate-fade-in-up stagger-${Math.min(index + 1, 6)}`
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", moodData?.activeClass || "bg-muted")}>
                            <span className="text-lg">{moodData?.emoji}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-foreground text-sm">{moodData?.label}</div>
                              {(entry as any).trades && (
                                <Badge className="badge-animated text-[9px] px-1.5 py-0 bg-info/15 text-info border border-info/20">
                                  Trade: {(entry as any).trades.instrument}
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(entry.created_at).toLocaleDateString()}
                              {(entry as any).trades && (
                                <span className={(entry as any).trades.pnl > 0 ? "text-success" : "text-destructive"}>
                                  {(entry as any).trades.pnl > 0 ? "+" : ""}{(entry as any).trades.pnl?.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setViewingEntry(entry)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteEntry(entry.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Tags Preview */}
                      {entry.emotions && entry.emotions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {entry.emotions.slice(0, 3).map((e, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border/40">
                              {getEmotionLabel(e)}
                            </span>
                          ))}
                          {entry.emotions.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">+{entry.emotions.length - 3}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{MOODS.find(m => m.id === viewingEntry?.mood)?.emoji}</span>
              {MOODS.find(m => m.id === viewingEntry?.mood)?.label} Check-in
            </DialogTitle>
            <DialogDescription className="font-mono">
              {viewingEntry && new Date(viewingEntry.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {viewingEntry?.emotions && viewingEntry.emotions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {viewingEntry.emotions.map((e, i) => (
                  <Badge key={i} variant="secondary" className="border border-border/40">
                    {getEmotionLabel(e)}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                <Label className="text-xs text-primary uppercase font-bold mb-2 block">Pre-Session</Label>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {viewingEntry?.pre_trade_thoughts || "No notes."}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                <Label className="text-xs text-success uppercase font-bold mb-2 block">Post-Session</Label>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {viewingEntry?.post_trade_thoughts || "No notes."}
                </p>
              </div>
            </div>

            {viewingEntry?.lessons_learned && (
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <Label className="text-xs text-warning uppercase font-bold mb-2 block flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" /> Key Lesson
                </Label>
                <p className="text-sm text-foreground italic">&ldquo;{viewingEntry.lessons_learned}&rdquo;</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
