"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Plus,
  Eye,
  Trash2,
  Calendar,
  Tag,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  Save,
  X,
  History,
  Target,
  Activity
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// --- Data Constants (Preserved) ---
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

// Updated styling for Fintech aesthetic
const MOODS = [
  { id: "euphoric", label: "Euphoric", emoji: "😄", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: "confident", label: "Confident", emoji: "😊", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  { id: "focused", label: "Focused", emoji: "🎯", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
  { id: "cautious", label: "Cautious", emoji: "⚠️", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { id: "frustrated", label: "Frustrated", emoji: "😤", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😰", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  { id: "exhausted", label: "Exhausted", emoji: "😫", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: "anxious", label: "Anxious", emoji: "😟", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
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
  
  // --- Form State ---
  const [activeTab, setActiveTab] = useState("pre")
  const [mood, setMood] = useState("")
  // New States for Sliders
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
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch with trade information if linked
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

      // Combine all data including new sliders into the emotions array for storage compatibility
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

      toast({ 
        title: "Log Recorded", 
        description: "Your mental state has been successfully tracked.",
        className: "bg-emerald-950 border-emerald-900 text-emerald-100"
      })

      // Reset form
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

  // --- Helper Functions ---
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
      <div className="flex items-center justify-center h-[400px] border border-zinc-800 rounded-xl bg-zinc-900/50">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* 1. Header / Toggle */}
      {!showForm ? (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              Journal History
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              {entries.length} RECORDS FOUND
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 border border-indigo-400/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Log
          </Button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100">New Session Log</h3>
              <p className="text-xs text-zinc-500">Recording mental state...</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="hover:bg-zinc-800 text-zinc-400">
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* 2. Main Input Form (Tabs based) */}
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1"
          >
            <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl h-full flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <div className="px-6 pt-6">
                  <TabsList className="grid grid-cols-2 bg-zinc-950/50 p-1 rounded-lg border border-zinc-800/50">
                    <TabsTrigger value="pre" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-indigo-400 font-mono text-xs uppercase tracking-wider">
                      Pre-Session
                    </TabsTrigger>
                    <TabsTrigger value="post" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400 font-mono text-xs uppercase tracking-wider">
                      Post-Session
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <CardContent className="p-6 space-y-6">
                    
                    {/* PRE-SESSION TAB */}
                    <TabsContent value="pre" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                      
                      {/* Mood Selector */}
                      <div className="space-y-3">
                        <Label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Current State</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {MOODS.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setMood(m.id)}
                              className={`
                                flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all duration-200
                                ${mood === m.id 
                                  ? m.color + " shadow-[0_0_15px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-white/10 scale-[1.02]" 
                                  : "bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900"}
                              `}
                            >
                              <span className="text-2xl filter drop-shadow-md">{m.emoji}</span>
                              <span className="text-[10px] font-medium uppercase tracking-wide">{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sliders */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/50">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-2">
                              <Target className="w-3 h-3 text-indigo-500" /> Confidence
                            </Label>
                            <span className="text-sm font-mono text-indigo-400 font-bold">{confidence[0]}/10</span>
                          </div>
                          <Slider 
                            value={confidence} 
                            onValueChange={setConfidence} 
                            max={10} step={1} 
                            className="py-2 [&>.relative>.absolute]:bg-indigo-500" 
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-2">
                              <Zap className="w-3 h-3 text-emerald-500" /> Focus Level
                            </Label>
                            <span className="text-sm font-mono text-emerald-400 font-bold">{focus[0]}/10</span>
                          </div>
                          <Slider 
                            value={focus} 
                            onValueChange={setFocus} 
                            max={10} step={1} 
                            className="py-2 [&>.relative>.absolute]:bg-emerald-500" 
                          />
                        </div>
                      </div>

                      {/* Pre-Trade Notes */}
                      <div className="space-y-2">
                        <Label className="text-xs font-mono text-zinc-500 uppercase">Mindset & Trade Plan</Label>
                        <Textarea 
                          value={preTradeThoughts}
                          onChange={(e) => setPreTradeThoughts(e.target.value)}
                          placeholder="What is your plan? Are you forcing a trade?"
                          className="bg-black/40 border-zinc-800 text-zinc-300 min-h-[100px] focus:ring-indigo-500/20 focus:border-indigo-500/50 placeholder:text-zinc-700 font-sans"
                        />
                      </div>
                    </TabsContent>

                    {/* POST-SESSION TAB */}
                    <TabsContent value="post" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      
                      {/* Triggers & Patterns */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-500" /> Emotional Triggers
                          </Label>
                          <div className="flex flex-wrap gap-1.5">
                            {EMOTIONAL_TRIGGERS.map(t => (
                              <button
                                key={t.id}
                                onClick={() => toggleTrigger(t.id)}
                                className={`
                                  text-[10px] uppercase font-bold tracking-wide px-2.5 py-1.5 rounded-md border transition-all
                                  ${selectedTriggers.includes(t.id) 
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]" 
                                    : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"}
                                `}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                            <Activity className="w-3 h-3 text-rose-500" /> Bad Habits
                          </Label>
                          <div className="flex flex-wrap gap-1.5">
                            {BEHAVIORAL_PATTERNS.map(p => (
                              <button
                                key={p.id}
                                onClick={() => togglePattern(p.id)}
                                className={`
                                  text-[10px] uppercase font-bold tracking-wide px-2.5 py-1.5 rounded-md border transition-all
                                  ${selectedPatterns.includes(p.id) 
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]" 
                                    : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"}
                                `}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Custom Tags */}
                      <div className="space-y-2">
                        <Label className="text-xs font-mono text-zinc-500 uppercase">Custom Tags</Label>
                        <div className="flex gap-2">
                          <Input 
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                            placeholder="Add tag..."
                            className="h-8 text-xs bg-black/40 border-zinc-800"
                          />
                          <Button size="sm" variant="secondary" onClick={addCustomTag} className="h-8">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {customTags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-zinc-400 border-zinc-700 cursor-pointer" onClick={() => removeCustomTag(tag)}>
                              {tag} <X className="w-3 h-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-mono text-zinc-500 uppercase">Post-Trade Review</Label>
                        <Textarea 
                          value={postTradeThoughts}
                          onChange={(e) => setPostTradeThoughts(e.target.value)}
                          placeholder="How did you handle your emotions during the trade?"
                          className="bg-black/40 border-zinc-800 text-zinc-300 min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-yellow-500" /> Key Lesson
                        </Label>
                        <Textarea 
                          value={lessonsLearned}
                          onChange={(e) => setLessonsLearned(e.target.value)}
                          placeholder="One thing to improve tomorrow..."
                          className="bg-yellow-500/5 border-yellow-500/20 text-zinc-300 min-h-[60px] focus:border-yellow-500/50"
                        />
                      </div>
                    </TabsContent>
                  </CardContent>
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                  <Button 
                    onClick={saveEntry} 
                    disabled={!mood} 
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Journal Entry
                  </Button>
                </div>
              </Tabs>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {entries.length === 0 ? (
              <Card className="bg-zinc-900/30 border-dashed border-2 border-zinc-800">
                <CardContent className="py-12 text-center">
                  <Brain className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">No entries yet. Start tracking your mind.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => {
                  const moodData = MOODS.find((m) => m.id === entry.mood)
                  return (
                    <Card 
                      key={entry.id} 
                      className="bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 transition-all group overflow-hidden shadow-sm"
                    >
                      <div className={`h-1 w-full bg-gradient-to-r ${moodData?.color.split(' ')[0].replace('bg-', 'from-').replace('/20', '')} to-transparent opacity-50`} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${moodData?.color}`}>
                              <span className="text-lg">{moodData?.emoji}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-slate-900 dark:text-zinc-200 text-sm">{moodData?.label}</div>
                                {(entry as any).trades && (
                                  <Badge className="text-[9px] px-1.5 py-0 bg-blue-100 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 border-blue-200 dark:border-indigo-500/30">
                                    Trade: {(entry as any).trades.instrument}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-600 dark:text-zinc-500 font-mono flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {new Date(entry.created_at).toLocaleDateString()}
                                {(entry as any).trades && (
                                  <span className={(entry as any).trades.pnl > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                    {(entry as any).trades.pnl > 0 ? "+" : ""}{(entry as any).trades.pnl?.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-indigo-400" onClick={() => setViewingEntry(entry)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400" onClick={() => deleteEntry(entry.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Tags Preview */}
                        {entry.emotions && entry.emotions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {entry.emotions.slice(0, 3).map((e, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700/50">
                                {getEmotionLabel(e)}
                              </span>
                            ))}
                            {entry.emotions.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 text-slate-500 dark:text-zinc-600">+{entry.emotions.length - 3}</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Dialog */}
      <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{MOODS.find(m => m.id === viewingEntry?.mood)?.emoji}</span>
              {MOODS.find(m => m.id === viewingEntry?.mood)?.label} Check-in
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-mono">
              {viewingEntry && new Date(viewingEntry.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {viewingEntry?.emotions && viewingEntry.emotions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {viewingEntry.emotions.map((e, i) => (
                  <Badge key={i} variant="secondary" className="bg-zinc-900 border-zinc-800 text-zinc-400">
                    {getEmotionLabel(e)}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <Label className="text-xs text-indigo-400 uppercase font-bold mb-2 block">Pre-Session</Label>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {viewingEntry?.pre_trade_thoughts || "No notes."}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <Label className="text-xs text-emerald-400 uppercase font-bold mb-2 block">Post-Session</Label>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {viewingEntry?.post_trade_thoughts || "No notes."}
                </p>
              </div>
            </div>

            {viewingEntry?.lessons_learned && (
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <Label className="text-xs text-amber-500 uppercase font-bold mb-2 block flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Key Lesson
                </Label>
                <p className="text-sm text-zinc-300 italic">"{viewingEntry.lessons_learned}"</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
