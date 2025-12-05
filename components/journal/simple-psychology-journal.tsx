"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Plus,
  Eye,
  Trash2,
  Calendar,
  Tag,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Define our options
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
  { id: "holding-losers", label: "Holding Losers Too Long" },
  { id: "position-size-large", label: "Position Size Too Large" },
  { id: "emotional-decisions", label: "Emotional Decision Making" },
]

const MOODS = [
  { id: "euphoric", label: "Euphoric", emoji: "😄", color: "from-green-500 to-emerald-500" },
  { id: "confident", label: "Confident", emoji: "😊", color: "from-blue-500 to-cyan-500" },
  { id: "focused", label: "Focused", emoji: "🎯", color: "from-purple-500 to-violet-500" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "from-gray-500 to-slate-500" },
  { id: "cautious", label: "Cautious", emoji: "⚠️", color: "from-yellow-500 to-amber-500" },
  { id: "frustrated", label: "Frustrated", emoji: "😤", color: "from-orange-500 to-red-500" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😰", color: "from-red-500 to-rose-500" },
  { id: "exhausted", label: "Exhausted", emoji: "😫", color: "from-indigo-500 to-purple-500" },
  { id: "anxious", label: "Anxious", emoji: "😟", color: "from-pink-500 to-rose-500" },
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
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  // Form state
  const [mood, setMood] = useState("")
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

  // Load entries on mount
  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("psychology_journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      console.log("[v0] Loaded entries:", data)
      if (data && data.length > 0) {
        console.log("[v0] First entry emotions:", data[0].emotions)
        console.log("[v0] Emotions type:", typeof data[0].emotions)
        console.log("[v0] Is array:", Array.isArray(data[0].emotions))
      }

      setEntries(data || [])
    } catch (error) {
      console.error("Error loading entries:", error)
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function saveEntry() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save entries",
          variant: "destructive",
        })
        return
      }

      // Combine all selections into emotions array
      const emotionsArray = [...selectedTriggers, ...selectedPatterns, ...customTags]

      const entryData = {
        user_id: user.id,
        entry_date: new Date().toISOString().split("T")[0],
        mood,
        emotions: emotionsArray,
        pre_trade_thoughts: preTradeThoughts,
        post_trade_thoughts: postTradeThoughts,
        lessons_learned: lessonsLearned,
      }

      const { data, error } = await supabase.from("psychology_journal_entries").insert(entryData).select().single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Journal entry saved successfully",
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
      setShowForm(false)

      // Reload entries
      loadEntries()
    } catch (error) {
      console.error("Error saving entry:", error)
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      })
    }
  }

  async function deleteEntry(id: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("psychology_journal_entries").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Entry deleted successfully",
      })

      loadEntries()
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      })
    }
  }

  function toggleTrigger(triggerId: string) {
    setSelectedTriggers((prev) =>
      prev.includes(triggerId) ? prev.filter((id) => id !== triggerId) : [...prev, triggerId],
    )
  }

  function togglePattern(patternId: string) {
    setSelectedPatterns((prev) =>
      prev.includes(patternId) ? prev.filter((id) => id !== patternId) : [...prev, patternId],
    )
  }

  function addCustomTag() {
    if (customTagInput.trim() && !customTags.includes(customTagInput.trim())) {
      setCustomTags([...customTags, customTagInput.trim()])
      setCustomTagInput("")
    }
  }

  function removeCustomTag(tag: string) {
    setCustomTags(customTags.filter((t) => t !== tag))
  }

  // Helper function to get label for an emotion ID
  function getEmotionLabel(emotionId: string): string {
    const trigger = EMOTIONAL_TRIGGERS.find((t) => t.id === emotionId)
    if (trigger) return trigger.label

    const pattern = BEHAVIORAL_PATTERNS.find((p) => p.id === emotionId)
    if (pattern) return pattern.label

    return emotionId // Return the ID itself if not found (custom tag)
  }

  const stats = {
    totalEntries: entries.length,
    thisWeek: entries.filter((e) => {
      const entryDate = new Date(e.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    }).length,
    mostCommonMood:
      entries.length > 0
        ? entries
            .map((e) => e.mood)
            .sort((a, b) => entries.filter((e) => e.mood === b).length - entries.filter((e) => e.mood === a).length)[0]
        : null,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading your journal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
          <Card className="glass-card border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalEntries}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-3xl font-bold mt-1">{stats.thisWeek}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-chart-1/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Common Mood</p>
                  <div className="flex items-center gap-2 mt-1">
                    {stats.mostCommonMood && (
                      <>
                        <span className="text-2xl">{MOODS.find((m) => m.id === stats.mostCommonMood)?.emoji}</span>
                        <p className="text-lg font-semibold">
                          {MOODS.find((m) => m.id === stats.mostCommonMood)?.label}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between animate-fade-in-up stagger-1">
        <div>
          <h2 className="text-2xl font-bold">Your Journal Entries</h2>
          <p className="text-muted-foreground mt-1">Track and reflect on your trading psychology</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {showForm && (
        <Card className="glass-card border-primary/20 animate-slide-fade">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              New Journal Entry
            </CardTitle>
            <CardDescription>Reflect on your trading mindset and emotional state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <span className="text-2xl">😊</span>
                How are you feeling?
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MOODS.map((moodOption) => (
                  <button
                    key={moodOption.id}
                    type="button"
                    onClick={() => setMood(moodOption.id)}
                    className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-300 hover:scale-105 ${
                      mood === moodOption.id
                        ? "border-primary shadow-lg shadow-primary/20 bg-primary/10"
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">{moodOption.emoji}</span>
                      <span className="font-medium text-sm">{moodOption.label}</span>
                    </div>
                    {mood === moodOption.id && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${moodOption.color} opacity-10 -z-10`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Emotional Triggers
              </Label>
              <div className="flex flex-wrap gap-2">
                {EMOTIONAL_TRIGGERS.map((trigger) => (
                  <button
                    key={trigger.id}
                    type="button"
                    onClick={() => toggleTrigger(trigger.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedTriggers.includes(trigger.id)
                        ? "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-2 border-orange-500/50 shadow-md"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground border-2 border-transparent hover:border-border"
                    }`}
                  >
                    {trigger.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Behavioral Patterns
              </Label>
              <div className="flex flex-wrap gap-2">
                {BEHAVIORAL_PATTERNS.map((pattern) => (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => togglePattern(pattern.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedPatterns.includes(pattern.id)
                        ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500/50 shadow-md"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground border-2 border-transparent hover:border-border"
                    }`}
                  >
                    {pattern.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-500" />
                Custom Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a custom tag..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addCustomTag()
                    }
                  }}
                  className="input-enhanced"
                />
                <Button type="button" onClick={addCustomTag} variant="secondary">
                  Add
                </Button>
              </div>
              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-3 py-1 text-sm badge-animated cursor-pointer"
                      onClick={() => removeCustomTag(tag)}
                    >
                      {tag}
                      <button className="ml-2 hover:text-destructive transition-colors">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="pre-trade" className="text-base font-semibold">
                Pre-Trade Thoughts
              </Label>
              <Textarea
                id="pre-trade"
                placeholder="What were you thinking before the trade? What was your mental state?"
                value={preTradeThoughts}
                onChange={(e) => setPreTradeThoughts(e.target.value)}
                rows={4}
                className="resize-none input-enhanced"
              />
              <p className="text-xs text-muted-foreground">{preTradeThoughts.length} characters</p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="post-trade" className="text-base font-semibold">
                Post-Trade Reflections
              </Label>
              <Textarea
                id="post-trade"
                placeholder="How do you feel after the trade? What emotions are you experiencing?"
                value={postTradeThoughts}
                onChange={(e) => setPostTradeThoughts(e.target.value)}
                rows={4}
                className="resize-none input-enhanced"
              />
              <p className="text-xs text-muted-foreground">{postTradeThoughts.length} characters</p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="lessons" className="text-base font-semibold">
                Lessons Learned
              </Label>
              <Textarea
                id="lessons"
                placeholder="What did you learn from this experience? How will you improve?"
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
                rows={4}
                className="resize-none input-enhanced"
              />
              <p className="text-xs text-muted-foreground">{lessonsLearned.length} characters</p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={saveEntry} disabled={!mood} className="btn-enhanced flex-1">
                Save Entry
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card className="glass-card border-dashed border-2 animate-fade-in-up">
            <CardContent className="py-16 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                  <Brain className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Start Your Psychology Journey</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No journal entries yet. Begin tracking your trading psychology to identify patterns and improve your
                  mental game.
                </p>
                <Button onClick={() => setShowForm(true)} className="gap-2 mt-4">
                  <Plus className="h-4 w-4" />
                  Create First Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => {
              const moodData = MOODS.find((m) => m.id === entry.mood)
              const isExpanded = expandedEntry === entry.id
              return (
                <Card
                  key={entry.id}
                  className="glass-card hover:shadow-xl transition-all duration-300 animate-fade-in-up border-l-4"
                  style={{
                    borderLeftColor: moodData ? `hsl(var(--primary))` : "transparent",
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`p-4 rounded-2xl bg-gradient-to-br ${moodData?.color || "from-gray-500 to-slate-500"} bg-opacity-10 shadow-lg`}
                        >
                          <span className="text-4xl">{moodData?.emoji || "😐"}</span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{moodData?.label || "Unknown Mood"}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(entry.created_at).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingEntry(entry)}
                          className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteEntry(entry.id)}
                          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {entry.emotions && entry.emotions.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          Tags & Patterns
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {entry.emotions.slice(0, isExpanded ? undefined : 5).map((emotion) => (
                            <Badge key={emotion} variant="secondary" className="badge-animated">
                              {getEmotionLabel(emotion)}
                            </Badge>
                          ))}
                          {!isExpanded && entry.emotions.length > 5 && (
                            <Badge
                              variant="outline"
                              className="cursor-pointer"
                              onClick={() => setExpandedEntry(entry.id)}
                            >
                              +{entry.emotions.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {entry.pre_trade_thoughts && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Pre-Trade Thoughts</p>
                        <p className={`text-sm leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                          {entry.pre_trade_thoughts}
                        </p>
                      </div>
                    )}

                    {(entry.post_trade_thoughts || entry.lessons_learned) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                        className="w-full gap-2"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Show More
                          </>
                        )}
                      </Button>
                    )}

                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t animate-fade-in-up">
                        {entry.post_trade_thoughts && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Post-Trade Reflections</p>
                            <p className="text-sm leading-relaxed">{entry.post_trade_thoughts}</p>
                          </div>
                        )}
                        {entry.lessons_learned && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Lessons Learned</p>
                            <p className="text-sm leading-relaxed">{entry.lessons_learned}</p>
                          </div>
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

      <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {viewingEntry && MOODS.find((m) => m.id === viewingEntry.mood) && (
                <span className="text-4xl">{MOODS.find((m) => m.id === viewingEntry.mood)?.emoji}</span>
              )}
              Journal Entry Details
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              {viewingEntry &&
                new Date(viewingEntry.created_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </DialogDescription>
          </DialogHeader>

          {viewingEntry && (
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Mood
                </h3>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-br ${MOODS.find((m) => m.id === viewingEntry.mood)?.color || "from-gray-500 to-slate-500"} bg-opacity-10`}
                  >
                    <span className="text-3xl">{MOODS.find((m) => m.id === viewingEntry.mood)?.emoji}</span>
                  </div>
                  <Badge variant="default" className="text-lg py-2 px-4">
                    {MOODS.find((m) => m.id === viewingEntry.mood)?.label || "Unknown"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Selected Tags & Patterns
                </h3>
                {viewingEntry.emotions && Array.isArray(viewingEntry.emotions) && viewingEntry.emotions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {viewingEntry.emotions.map((emotion, index) => (
                      <Badge key={`${emotion}-${index}`} variant="default" className="text-sm py-2 px-4 badge-animated">
                        {getEmotionLabel(emotion)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tags selected</p>
                )}
              </div>

              {viewingEntry.pre_trade_thoughts && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Pre-Trade Thoughts</h3>
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewingEntry.pre_trade_thoughts}</p>
                  </div>
                </div>
              )}

              {viewingEntry.post_trade_thoughts && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Post-Trade Reflections</h3>
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewingEntry.post_trade_thoughts}</p>
                  </div>
                </div>
              )}

              {viewingEntry.lessons_learned && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Lessons Learned
                  </h3>
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewingEntry.lessons_learned}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
