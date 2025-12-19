"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Calendar, Clock, Target, TrendingUp, TrendingDown,
  Shield, CheckCircle, ChevronRight, ChevronLeft, Search, Save,
  Loader2, Brain, BarChart3, Globe, Zap, Crosshair, MousePointer,
  ImageIcon, Calculator, Info, Plus, Layers, Scale, BookOpen,
  ListChecks, CheckSquare
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useUserConfig } from "@/hooks/use-user-config"
import { calculateInstrumentPnL, getAllAvailableInstruments } from "@/types/instrument-calculations"
import { CustomInstrumentDialog } from "@/components/trades/custom-instrument-dialog"
import { createBrowserClient } from "@supabase/ssr"
import {
  type Trade,
  type NewTradeInput,
  AVAILABLE_SMC_CONCEPTS,
  AVAILABLE_ICT_CONCEPTS,
  AVAILABLE_WYCKOFF_CONCEPTS,
  AVAILABLE_VOLUME_CONCEPTS,
  AVAILABLE_SR_CONCEPTS,
  type CategorizedConcept,
  type ChecklistItem,
} from "@/types"

import { getStrategies, type PlaybookStrategy } from "@/app/actions/playbook-actions"

// --- TYPES ---
type SubmitTradeResult = { success: boolean; message?: string; trade?: Trade; tradeId?: string; error?: string }
interface TradeFormProps { onSubmitTrade: (trade: NewTradeInput) => Promise<SubmitTradeResult>; initialTradeData?: Trade; mode?: "add" | "edit" }

// --- CONSTANTS ---
const FORM_STORAGE_KEY = "trade_form_draft"
const MOODS = [
  { id: "euphoric", label: "Euphoric", emoji: "🤩", color: "text-green-600 bg-green-100 border-green-200 dark:bg-green-900/20" },
  { id: "confident", label: "Confident", emoji: "😎", color: "text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/20" },
  { id: "focused", label: "Focused", emoji: "🎯", color: "text-purple-600 bg-purple-100 border-purple-200 dark:bg-purple-900/20" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800" },
  { id: "cautious", label: "Cautious", emoji: "🤔", color: "text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20" },
  { id: "frustrated", label: "Frustrated", emoji: "😤", color: "text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900/20" },
  { id: "anxious", label: "Anxious", emoji: "😰", color: "text-red-600 bg-red-100 border-red-200 dark:bg-red-900/20" },
]
const TRADING_SESSIONS = [
  { value: "asian", label: "Asian", emoji: "🌏", time: "21:00-06:00", borderColor: "border-orange-200", textColor: "text-orange-600", description: "Lower volatility." },
  { value: "london", label: "London", emoji: "🏰", time: "07:00-16:00", borderColor: "border-blue-200", textColor: "text-blue-600", description: "High volume." },
  { value: "new-york", label: "New York", emoji: "🗽", time: "12:00-21:00", borderColor: "border-green-200", textColor: "text-green-600", description: "Highest volatility." },
]

// --- HELPERS ---
const getInitialFormState = (initialTrade?: Trade): NewTradeInput => {
  if (initialTrade) return { ...initialTrade } as any
  return {
    date: new Date().toISOString().split("T")[0],
    instrument: "",
    direction: "long",
    entry_price: 0,
    exit_price: 0,
    stop_loss: 0,
    size: 0,
    playbook_strategy_id: null,
    executed_rules: [], // NEW: Stores checked rule IDs
    smcMarketStructure: [],
    // ... (other arrays)
  }
}

// Reusing ConceptCard style for Strategy Items
const StrategyItemCard = ({ 
  title, description, isSelected, onToggle, badge 
}: { title: string, description?: string, isSelected: boolean, onToggle: () => void, badge?: string }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      "relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200 h-full w-full",
      "hover:shadow-md focus:outline-none",
      isSelected 
        ? "bg-background shadow-md border-indigo-500/50 ring-1 ring-indigo-500 bg-indigo-50/10" 
        : "border-border/40 bg-card/50 hover:bg-accent/50 hover:border-border"
    )}
  >
    {isSelected && (
      <div className="absolute top-3 right-3 p-1 rounded-full bg-indigo-100 dark:bg-indigo-900">
        <CheckCircle className="w-4 h-4 text-indigo-600" />
      </div>
    )}
    <div className="mb-2 flex items-center justify-center w-8 h-8 rounded-lg bg-background border border-border/50 shadow-sm">
      <BookOpen className={cn("w-4 h-4", isSelected ? "text-indigo-600" : "text-muted-foreground")} />
    </div>
    <h4 className={cn("font-bold text-sm mb-1 pr-6", isSelected ? "text-foreground" : "text-muted-foreground")}>{title}</h4>
    {description && <p className="text-[11px] text-muted-foreground/70 leading-snug line-clamp-2">{description}</p>}
    {badge && <Badge variant="secondary" className="mt-2 text-[10px]">{badge}</Badge>}
  </button>
)

const PriceInput = ({ id, label, value, onChange, icon: Icon, color }: any) => (
  <div className="space-y-1.5 relative group">
    <Label htmlFor={id} className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1.5", color)}><Icon className="w-3.5 h-3.5" /> {label}</Label>
    <div className="relative"><Input type="number" step="any" id={id} name={id} value={value || ""} onChange={onChange} className="h-12 pl-3 bg-background border-2 font-mono" /></div>
  </div>
)

const SessionCard = ({ session, isSelected, onSelect }: any) => (
  <button type="button" onClick={onSelect} className={cn("flex flex-col p-4 rounded-xl border-2 text-left transition-all w-full", isSelected ? cn("bg-background shadow-md", session.borderColor) : "border-border bg-card/50")}>
    <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{session.emoji}</span><span className="font-bold text-sm">{session.label}</span></div>
    <span className="text-[10px] text-muted-foreground">{session.time}</span>
  </button>
)

// --- MAIN COMPONENT ---
export default function TradeForm({ onSubmitTrade, initialTradeData, mode = "add" }: TradeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { config, isLoaded } = useUserConfig()

  const [formData, setFormData] = useState<NewTradeInput>(getInitialFormState(initialTradeData))
  const [activeTab, setActiveTab] = useState("setup")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [strategies, setStrategies] = useState<PlaybookStrategy[]>([])
  
  // Psychology State (Simplified)
  const [psychologyMood, setPsychologyMood] = useState("")
  const [psychologyNote, setPsychologyNote] = useState("")

  useEffect(() => {
    async function load() {
      const data = await getStrategies()
      setStrategies(data)
    }
    load()
  }, [])

  // Calc Logic
  const pnlResult = useMemo(() => {
    if (!formData.entry_price || !formData.exit_price || !formData.size) return null
    return calculateInstrumentPnL(formData.instrument, formData.direction, formData.entry_price, formData.exit_price, formData.size).adjustedPnL
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const val = type === "number" ? parseFloat(value) : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  const handleStrategySelect = (strat: PlaybookStrategy) => {
    const isSelected = formData.playbook_strategy_id === strat.id
    setFormData(prev => ({
      ...prev,
      playbook_strategy_id: isSelected ? null : strat.id,
      setupName: isSelected ? "" : strat.name,
      executed_rules: [] // Reset rules when switching strategy
    }))
  }

  const handleRuleToggle = (ruleId: string) => {
    setFormData(prev => {
      const current = prev.executed_rules || []
      return {
        ...prev,
        executed_rules: current.includes(ruleId) ? current.filter(id => id !== ruleId) : [...current, ruleId]
      }
    })
  }

  const handleSubmit = async () => {
    if (!formData.instrument || !formData.entry_price) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const result = await onSubmitTrade({ ...formData, pnl: formData.pnl || pnlResult || 0 })
      if (result.success) {
        toast({ title: "Success", description: "Trade logged" })
        router.push("/dashboard")
      }
    } catch (e) { console.error(e) } finally { setIsSubmitting(false) }
  }

  // --- RENDER SECTION HELPERS ---
  
  // Generic Section Renderer (Used for SMC, ICT, and now Strategies)
  const renderSection = (title: string, Icon: any, children: React.ReactNode, colorClass: string, bgClass: string, borderClass: string) => (
    <div className={cn("border rounded-xl overflow-hidden mb-6", borderClass)}>
      <div className={cn("p-3 border-b flex items-center gap-2", bgClass, borderClass)}>
        <div className={cn("p-1.5 rounded-md", bgClass.replace("/5", "/20"))}><Icon className={cn("w-4 h-4", colorClass)} /></div>
        <h3 className={cn("font-bold", colorClass.replace("text-", "text-current"))}>{title}</h3>
      </div>
      <div className="p-4 bg-card">{children}</div>
    </div>
  )

  if (!isLoaded) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-background/95 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md p-4 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5"/></Button>
          <h1 className="text-lg font-bold">{initialTradeData ? "Edit Trade" : "New Trade"}</h1>
        </div>
        <div className="flex gap-4 items-center">
           <span className={cn("font-mono font-bold", (pnlResult || 0) >= 0 ? "text-green-500" : "text-red-500")}>{(pnlResult || 0) >= 0 ? "+" : ""}${pnlResult?.toFixed(2) || "0.00"}</span>
           <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4"/>} Save</Button>
        </div>
      </header>

      <div className="container max-w-7xl py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-8 h-14">
              <TabsTrigger value="setup">1. Setup</TabsTrigger>
              <TabsTrigger value="strategy">2. Strategy</TabsTrigger>
              <TabsTrigger value="psychology">3. Psychology</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Trade Setup</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <Input placeholder="Instrument (e.g. ES, BTC)..." value={formData.instrument} onChange={e => setFormData({...formData, instrument: e.target.value.toUpperCase()})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant={formData.direction === 'long' ? 'default' : 'outline'} onClick={() => setFormData({...formData, direction: 'long'})} className={formData.direction === 'long' ? 'bg-emerald-600' : ''}><TrendingUp className="mr-2 h-4 w-4"/> Long</Button>
                    <Button variant={formData.direction === 'short' ? 'default' : 'outline'} onClick={() => setFormData({...formData, direction: 'short'})} className={formData.direction === 'short' ? 'bg-rose-600' : ''}><TrendingDown className="mr-2 h-4 w-4"/> Short</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <PriceInput id="entry_price" label="Entry" value={formData.entry_price} onChange={handleChange} icon={MousePointer} />
                    <PriceInput id="stop_loss" label="Stop" value={formData.stop_loss} onChange={handleChange} icon={Shield} color="text-rose-500" />
                    <PriceInput id="take_profit" label="Target" value={formData.take_profit} onChange={handleChange} icon={Target} color="text-emerald-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <PriceInput id="exit_price" label="Exit" value={formData.exit_price} onChange={handleChange} icon={CheckCircle} />
                    <PriceInput id="size" label="Size" value={formData.size} onChange={handleChange} icon={Scale} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TRADING_SESSIONS.map(s => <SessionCard key={s.value} session={s} isSelected={formData.tradeSession === s.value} onSelect={() => setFormData({...formData, tradeSession: s.value})} />)}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end"><Button onClick={() => setActiveTab("strategy")}>Next</Button></CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-6">
              
              {/* --- 1. PLAYBOOK STRATEGIES SECTION (Matches other sections) --- */}
              {renderSection(
                "My Playbook Strategies", 
                BookOpen, 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategies.length === 0 ? (
                    <div className="col-span-full text-center p-4 border border-dashed rounded-lg text-muted-foreground text-sm">
                      No strategies found. Go to Playbook to create one.
                    </div>
                  ) : (
                    strategies.map(strat => (
                      <StrategyItemCard 
                        key={strat.id}
                        title={strat.name}
                        description={strat.description || ""}
                        isSelected={formData.playbook_strategy_id === strat.id}
                        onToggle={() => handleStrategySelect(strat)}
                        badge={`${strat.win_rate}% WR`}
                      />
                    ))
                  )}
                </div>,
                "text-indigo-600", "bg-indigo-50/10", "border-indigo-200 dark:border-indigo-900"
              )}

              {/* --- 2. DYNAMIC RULES CHECKLIST (Appears when strategy is selected) --- */}
              {formData.playbook_strategy_id && strategies.find(s => s.id === formData.playbook_strategy_id)?.rules?.length ? (
                renderSection(
                  "Strategy Rules Checklist",
                  ListChecks,
                  <div className="grid grid-cols-1 gap-2">
                    {strategies.find(s => s.id === formData.playbook_strategy_id)?.rules.map((rule) => {
                      const isChecked = formData.executed_rules?.includes(rule.id)
                      return (
                        <button
                          key={rule.id}
                          type="button"
                          onClick={() => handleRuleToggle(rule.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                            isChecked ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20" : "bg-card hover:bg-accent/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", isChecked ? "bg-indigo-600 border-indigo-600" : "border-muted-foreground")}>
                              {isChecked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="flex flex-col">
                              <span className={cn("text-sm font-medium", isChecked ? "text-indigo-900 dark:text-indigo-100" : "text-muted-foreground")}>{rule.text}</span>
                              <span className="text-[10px] uppercase text-muted-foreground/60">{rule.phase}</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>,
                  "text-emerald-600", "bg-emerald-50/10", "border-emerald-200 dark:border-emerald-900"
                )
              ) : null}

              {/* --- 3. OTHER CONCEPTS (Example Only) --- */}
              {config?.tradingPreferences?.showAllConceptsInForm && renderSection(
                "Smart Money Concepts", Zap, 
                <div className="text-sm text-muted-foreground">Select SMC concepts here... (Existing Logic)</div>, 
                "text-purple-600", "bg-purple-50/10", "border-purple-200"
              )}

              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent><Textarea value={formData.notes || ""} name="notes" onChange={handleChange} placeholder="Trade narrative..." /></CardContent>
                <CardFooter className="flex justify-end"><Button onClick={() => setActiveTab("psychology")}>Next</Button></CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="psychology" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Psychology</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                    {MOODS.map(m => (
                      <button key={m.id} type="button" onClick={() => setPsychologyMood(m.id)} className={cn("flex flex-col items-center p-3 rounded-xl border transition-all", psychologyMood === m.id ? m.color : "bg-muted/20")}>
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-[10px] font-bold mt-1">{m.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label>Mindset Notes</Label>
                    <Textarea value={psychologyNote} onChange={e => setPsychologyNote(e.target.value)} placeholder="How were you feeling?" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("strategy")}>Back</Button>
                  <Button onClick={handleSubmit} className="bg-indigo-600">Commit Trade</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column Simulator */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-24">
            <CardHeader><CardTitle>Simulator</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-muted/30 rounded-xl mb-4">
                <div className={cn("text-4xl font-bold", (pnlResult || 0) >= 0 ? "text-green-500" : "text-red-500")}>{(pnlResult || 0) >= 0 ? "+" : ""}${pnlResult?.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Est. P&L</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
