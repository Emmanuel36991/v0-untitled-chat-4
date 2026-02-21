"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Eye, Trash2, Calendar, Lightbulb, Brain, X, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { JournalEntryForm } from "./journal-entry-form"
import { MOODS, EMOTIONAL_TRIGGERS, BEHAVIORAL_PATTERNS } from "./journal-constants"

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

interface Props {
  entries: JournalEntry[]
  onAddEntry: (entry: JournalEntry) => void
  onDeleteEntry: (id: string) => void
}

export default function SimplePsychologyJournal({ entries, onAddEntry, onDeleteEntry }: Props) {
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSave(newEntryData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: "Error", description: "Login required.", variant: "destructive" })
        return
      }

      // 1. Optimistic UI Update
      const tempId = `temp-${Date.now()}`
      const optimisticEntry: JournalEntry = {
        ...newEntryData,
        id: tempId,
        user_id: user.id,
        created_at: new Date().toISOString(),
      }

      onAddEntry(optimisticEntry)
      setShowForm(false)
      toast({ title: "Log Recorded", description: "Your mental state has been successfully tracked." })

      // 2. Background Network Request
      const entryDataToInsert = { ...newEntryData, user_id: user.id }
      const { data: insertedData, error } = await supabase
        .from("psychology_journal_entries")
        .insert(entryDataToInsert)
        .select()
        .single()

      if (error) throw error

      // Optionally swap the ID in the state with the real db ID here if needed, 
      // but typical Optimistic UI allows full page refresh eventually or swapping.
      // For now, onAddEntry just pushed the temp one, which is fine for the session.

    } catch (error) {
      console.error("Error saving entry:", error)
      toast({ title: "Error", description: "Failed to save entry. It may not have persisted.", variant: "destructive" })
    }
  }

  async function deleteEntry(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Optimistic delete
      onDeleteEntry(id)
      toast({ title: "Deleted", description: "Journal entry removed." })

      if (!id.startsWith("temp-")) { // Don't try to delete unsaved temp rows
        const { error } = await supabase.from("psychology_journal_entries").delete().eq("id", id).eq("user_id", user.id)
        if (error) throw error
      }
    } catch (error) {
      console.error("Error deleting:", error)
      toast({ title: "Error", description: "Could not delete entry.", variant: "destructive" })
    }
  }

  function getEmotionLabel(id: string): string {
    const trigger = EMOTIONAL_TRIGGERS.find(t => t.id === id)
    if (trigger) return trigger.label
    const pattern = BEHAVIORAL_PATTERNS.find(p => p.id === id)
    if (pattern) return pattern.label
    return id
  }

  function formatEntryDate(createdAt: string, entryDate?: string): string {
    const d = new Date(createdAt)
    if (isNaN(d.getTime())) return entryDate || "Invalid date"
    const y = d.getFullYear()
    if (y > 2030 || y < 1990) return entryDate || `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${y}`
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${y}`
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
          <JournalEntryForm onSave={handleSave} />
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
                            <div className="text-2xs text-muted-foreground font-mono flex items-center gap-2 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {formatEntryDate(entry.created_at, entry.entry_date)}
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
                            <span key={i} className="text-2xs px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border/40">
                              {getEmotionLabel(e)}
                            </span>
                          ))}
                          {entry.emotions.length > 3 && (
                            <span className="text-2xs px-1.5 py-0.5 text-muted-foreground">+{entry.emotions.length - 3}</span>
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
              {viewingEntry && formatEntryDate(viewingEntry.created_at, viewingEntry.entry_date) + " " + new Date(viewingEntry.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
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
