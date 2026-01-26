"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft, Calendar, Clock, Target, TrendingUp, TrendingDown,
  Shield, CheckCircle, ChevronRight, ChevronLeft, Search, Save,
  Loader2, Brain, BarChart3, Globe, Zap, Crosshair, MousePointer,
  ImageIcon, Calculator, Info, Plus, Layers, BookOpen, ListChecks,
  CandlestickChart, Activity, Ban, GitBranch, Database, Wallet
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useUserConfig } from "@/hooks/use-user-config"
import {
  calculateInstrumentPnL,
  type CustomInstrument,
  getAllAvailableInstruments,
} from "@/types/instrument-calculations"
import {
  type Trade,
  type NewTradeInput,
  type StrategyRule,
} from "@/types"
import type { TradingAccount } from "@/types/accounts"

// Actions
import { getStrategies, type PlaybookStrategy, type StrategySetup } from "@/app/actions/playbook-actions"
import { logTradePsychology } from "@/app/actions/trade-actions"
import { getTradingAccounts } from "@/app/actions/account-actions"

// --- CONSTANTS ---
const FORM_STORAGE_KEY = "trade_form_draft"

const FACTOR_STYLES = {
  price: { label: "Price Action", icon: CandlestickChart, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  time: { label: "Time/Session", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  indicator: { label: "Indicator", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  structure: { label: "Structure", icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  execution: { label: "Invalidation", icon: Ban, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  default: { label: "Rule", icon: ListChecks, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" }
}

const MOODS = [
  { id: "euphoric", label: "Euphoric", emoji: "🤩", color: "text-green-600 bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800" },
  { id: "confident", label: "Confident", emoji: "😎", color: "text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" },
  { id: "focused", label: "Focused", emoji: "🎯", color: "text-purple-600 bg-purple-100 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700" },
  { id: "cautious", label: "Cautious", emoji: "🤔", color: "text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" },
  { id: "frustrated", label: "Frustrated", emoji: "😤", color: "text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800" },
  { id: "anxious", label: "Anxious", emoji: "😰", color: "text-red-600 bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800" },
]

const TRADING_SESSIONS = [
  { value: "asian", label: "Asian Session", emoji: "🌏", time: "21:00 - 06:00 GMT", description: "Lower volatility, range-bound markets.", borderColor: "border-orange-200 dark:border-orange-800", textColor: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-950/10" },
  { value: "london", label: "London Session", emoji: "🏰", time: "07:00 - 16:00 GMT", description: "High volume, trend establishment.", borderColor: "border-blue-200 dark:border-blue-800", textColor: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/10" },
  { value: "new-york", label: "New York Session", emoji: "🗽", time: "12:00 - 21:00 GMT", description: "Highest volatility, major news releases.", borderColor: "border-green-200 dark:border-green-800", textColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950/10" },
  { value: "overlap", label: "London/NY Overlap", emoji: "⚡", time: "12:00 - 16:00 GMT", description: "Peak liquidity and momentum.", borderColor: "border-purple-200 dark:border-purple-800", textColor: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-950/10" },
]

const EMOTIONAL_TRIGGERS = [
  { id: "large-loss", label: "Large Loss" },
  { id: "consecutive-losses", label: "Consecutive Losses" },
  { id: "time-pressure", label: "Time Pressure" },
  { id: "missed-opportunity", label: "Missing Opportunity" },
  { id: "market-volatility", label: "Market Volatility" },
  { id: "overconfidence", label: "Overconfidence" },
]

const BEHAVIORAL_PATTERNS = [
  { id: "overtrading", label: "Overtrading" },
  { id: "averaging-down", label: "Averaging Down" },
  { id: "cutting-winners", label: "Cutting Winners Early" },
  { id: "ignoring-stops", label: "Ignoring Stop Losses" },
  { id: "revenge-trading", label: "Revenge Trading" },
  { id: "fomo-trading", label: "FOMO Trading" },
]

// --- HELPER FUNCTIONS ---

interface ExtendedTradeInput extends NewTradeInput {
  entry_time?: string;
  exit_time?: string;
}

const getInitialFormState = (initialTrade?: Trade): ExtendedTradeInput => {
  const baseState: ExtendedTradeInput = {
    date: new Date().toISOString().split("T")[0],
    instrument: "",
    account_id: "", // Initial empty account
    direction: "long",
    entry_price: 0,
    exit_price: 0,
    stop_loss: 0,
    size: 0,
    setupName: "",
    notes: "",
    playbook_strategy_id: null,
    executed_rules: [],
    take_profit: undefined,
    durationMinutes: undefined,
    tradeSession: undefined,
    tradeStartTime: undefined,
    tradeEndTime: undefined,
    preciseDurationMinutes: undefined,
    smcMarketStructure: [],
    psychologyFactors: [],
    screenshotBeforeUrl: "",
    screenshotAfterUrl: "",
    entry_time: "",
    exit_time: "",
  }

  if (initialTrade) {
    return {
      ...baseState,
      ...(initialTrade as unknown as ExtendedTradeInput),
      date: typeof initialTrade.date === "string" ? initialTrade.date : new Date(initialTrade.date).toISOString().split("T")[0],
      account_id: initialTrade.account_id || "",
    }
  }
  return baseState
}

// --- COMPONENTS ---

const PriceInput = ({ id, label, value, onChange, icon: Icon, color = "text-foreground", placeholder = "0.00" }: any) => (
  <div className="space-y-1.5 relative group">
    <Label htmlFor={id} className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1.5", color)}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </Label>
    <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
      <Input
        type="number"
        step="any"
        id={id}
        name={id}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="h-12 pl-3 pr-12 bg-background border-2 border-input group-hover:border-primary/30 focus:border-primary font-mono text-lg shadow-sm"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium pointer-events-none">
        USD
      </div>
    </div>
  </div>
)

const SessionCard = ({ session, isSelected, onSelect }: any) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "flex flex-col p-4 rounded-xl border-2 text-left transition-all duration-200 w-full",
      isSelected
        ? cn("bg-background shadow-md ring-1 ring-offset-0", session.borderColor)
        : "border-border bg-card/50 hover:bg-accent/50",
    )}
  >
    <div className="flex items-center justify-between w-full mb-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{session.emoji}</span>
        <div>
          <h4 className={cn("font-bold text-sm", isSelected ? session.textColor : "text-foreground")}>
            {session.label}
          </h4>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
            {session.time}
          </span>
        </div>
      </div>
      {isSelected && (
        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", session.textColor.split(" ")[0].replace("text-", "bg-"))}>
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{session.description}</p>
  </button>
)

const StrategyItemCard = ({ 
  title, 
  description, 
  tags, 
  isSelected, 
  onToggle, 
  winRate 
}: { 
  title: string, 
  description?: string, 
  tags: string[], 
  isSelected: boolean, 
  onToggle: () => void, 
  winRate: number 
}) => {
  let Icon = BookOpen
  if (tags?.some(t => t.toLowerCase().includes("ict"))) Icon = Crosshair
  else if (tags?.some(t => t.toLowerCase().includes("smc"))) Icon = Zap
  else if (tags?.some(t => t.toLowerCase().includes("wyckoff"))) Icon = Layers
  else if (tags?.some(t => t.toLowerCase().includes("volume"))) Icon = BarChart3

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all duration-300 w-full group",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
        isSelected 
          ? "bg-primary/5 border-primary ring-1 ring-primary shadow-lg shadow-primary/10" 
          : "bg-card border-border/60 hover:bg-accent/30 hover:border-primary/30"
      )}
    >
      <div className="flex justify-between w-full mb-3">
        <div className={cn("p-2 rounded-lg border shadow-sm transition-colors", isSelected ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/30 border-border text-muted-foreground group-hover:text-primary")}>
          <Icon className="w-5 h-5" />
        </div>
        {isSelected && (
           <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-sm animate-in zoom-in duration-300">
             <CheckCircle className="w-4 h-4" />
           </div>
        )}
      </div>

      <h4 className={cn("font-bold text-base mb-1 leading-tight tracking-tight", isSelected ? "text-primary" : "text-foreground")}>
        {title}
      </h4>
      
      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8 leading-relaxed font-medium">
        {description || "No description provided."}
      </p>

      <div className="flex items-center justify-between w-full mt-auto pt-3 border-t border-dashed border-border/50">
         <div className="flex gap-1.5 overflow-hidden">
           {tags?.slice(0, 3).map(t => (
             <Badge key={t} variant="secondary" className="text-[9px] px-1.5 h-5 font-bold bg-muted/50 border border-border/50 text-muted-foreground">{t}</Badge>
           ))}
         </div>
         <span className={cn("text-[10px] font-mono font-bold", (winRate || 0) > 50 ? "text-emerald-500" : "text-muted-foreground")}>{winRate || 0}% WR</span>
      </div>
    </button>
  )
}

const RuleItem = ({ rule, isChecked, onToggle }: { rule: StrategyRule, isChecked: boolean, onToggle: () => void }) => {
  const category = (rule as any).category || 'default'
  const style = FACTOR_STYLES[category as keyof typeof FACTOR_STYLES] || FACTOR_STYLES.default
  const Icon = style.icon

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-3 w-full text-left p-2.5 rounded-lg border transition-all duration-200 group",
        isChecked 
          ? "bg-emerald-500/5 border-emerald-500/30" 
          : "bg-card border-border/50 hover:bg-accent/30 hover:border-primary/30"
      )}
    >
      <div className={cn(
        "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
        isChecked 
          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
          : "border-muted-foreground/30 group-hover:border-primary/50 bg-muted/10"
      )}>
        {isChecked && <CheckCircle className="w-3 h-3" />}
      </div>
      
      <div className="flex-1 min-w-0 flex items-center justify-between">
        <span className={cn("text-sm font-medium leading-snug truncate", isChecked ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
          {rule.text}
        </span>
        <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ml-2 flex items-center gap-1", style.bg, style.color)}>
           <Icon className="w-3 h-3"/> {style.label}
        </span>
      </div>
    </button>
  )
}

const renderSection = (title: string, Icon: React.ElementType, children: React.ReactNode, colorClass: string, bgClass: string, borderClass: string) => (
  <div className={cn("border rounded-xl overflow-hidden mb-6", borderClass)}>
    <div className={cn("p-3 border-b flex items-center gap-2", bgClass, borderClass)}>
      <div className={cn("p-1.5 rounded-md", bgClass.replace("/5", "/20"))}>
        <Icon className={cn("w-4 h-4", colorClass)} />
      </div>
      <h3 className={cn("font-bold", colorClass.replace("text-", "text-current"))}>{title}</h3>
    </div>
    <div className="p-4 bg-card">
      {children}
    </div>
  </div>
)

interface TradeFormProps {
  onSubmitTrade: (tradeData: NewTradeInput) => Promise<{ success: boolean; error?: string; tradeId?: string }>
  initialTradeData?: Trade
  mode?: "add" | "edit"
}

/* -------------------------------------------------------------------------- */
/* MAIN FORM COMPONENT                                                        */
/* -------------------------------------------------------------------------- */

const TradeForm = ({ onSubmitTrade, initialTradeData, mode = "add" }: TradeFormProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const strategyIdFromUrl = searchParams.get('strategy_id')
  const { toast } = useToast()
  const { config, isLoaded } = useUserConfig()

  // --- STATE ---
  const [formData, setFormData] = useState<ExtendedTradeInput>(getInitialFormState(initialTradeData))
  const [activeTab, setActiveTab] = useState("setup")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [customInstruments, setCustomInstruments] = useState<CustomInstrument[]>([])
  
  // *** TRADING ACCOUNTS STATE ***
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([])

  // *** STRATEGIES STATE ***
  const [strategies, setStrategies] = useState<PlaybookStrategy[]>([])
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null)

  // Psychology specific
  const [psychologyMood, setPsychologyMood] = useState("")
  const [psychologyTriggers, setPsychologyTriggers] = useState<string[]>([])
  const [psychologyPatterns, setPsychologyPatterns] = useState<string[]>([])
  const [psychologyCustomTags, setPsychologyCustomTags] = useState<string[]>([])
  const [psychologyCustomTagInput, setPsychologyCustomTagInput] = useState("")
  const [psychologyPreThoughts, setPsychologyPreThoughts] = useState("")
  const [psychologyPostThoughts, setPsychologyPostThoughts] = useState("")
  const [psychologyLessons, setPsychologyLessons] = useState("")

  // --- EFFECTS ---

  // 1. Fetch Strategies and Accounts
  useEffect(() => {
    let mounted = true
    async function loadData() {
      try {
        const [loadedStrategies, loadedAccounts] = await Promise.all([
          getStrategies(),
          getTradingAccounts()
        ])
        
        if (mounted) {
          setStrategies(loadedStrategies)
          setTradingAccounts(loadedAccounts)

          // Set default account if one exists and none is selected
          if (loadedAccounts.length > 0 && !formData.account_id) {
            const defaultAcc = loadedAccounts.find(a => a.is_default) || loadedAccounts[0]
            setFormData(prev => ({ ...prev, account_id: defaultAcc.id }))
          }

          // Handle Pre-selection from URL
          if (strategyIdFromUrl && !formData.playbook_strategy_id) {
             const strat = loadedStrategies.find((s: PlaybookStrategy) => s.id === strategyIdFromUrl)
             if (strat) {
               setFormData(prev => ({ 
                 ...prev, 
                 playbook_strategy_id: strat.id,
                 setupName: strat.name || ""
               }))
               setActiveTab("strategy")
             }
          }
        }
      } catch (error) {
        console.error("Failed to load data", error)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [strategyIdFromUrl])

  // Load Draft
  useEffect(() => {
    if (initialTradeData) {
      setFormData(getInitialFormState(initialTradeData))
    } else if (mode === "add") {
      const saved = localStorage.getItem(FORM_STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.formData) setFormData(parsed.formData)
          if (parsed.activeTab) setActiveTab(parsed.activeTab)
        } catch (e) {}
      }
    }
  }, [initialTradeData, mode])

  // Auto-Save Draft
  useEffect(() => {
    if (mode === "add") {
      const timer = setTimeout(() => {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({ formData, activeTab, timestamp: Date.now() }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [formData, activeTab, mode])

  // *** TIME DURATION CALCULATION ***
  useEffect(() => {
    if (formData.entry_time && formData.exit_time) {
      const start = new Date(formData.entry_time)
      const end = new Date(formData.exit_time)
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffMs = end.getTime() - start.getTime()
        const diffMins = Math.max(0, Math.floor(diffMs / 60000))
        setFormData(prev => ({ ...prev, durationMinutes: diffMins, preciseDurationMinutes: diffMins }))
      }
    }
  }, [formData.entry_time, formData.exit_time])

  // --- CALCULATIONS ---
  const pnlResult = useMemo(() => {
    if (!formData.entry_price || !formData.exit_price || !formData.size) return null
    return calculateInstrumentPnL(formData.instrument, formData.direction, formData.entry_price, formData.exit_price, formData.size).adjustedPnL
  }, [formData])

  const riskRewardRatio = useMemo(() => {
    if (!formData.entry_price || !formData.stop_loss || !formData.take_profit) return null
    const risk = Math.abs(formData.entry_price - formData.stop_loss)
    const reward = Math.abs(formData.take_profit - formData.entry_price)
    return risk === 0 ? 0 : reward / risk
  }, [formData])

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const isNumeric = type === "number" || ["entry_price", "exit_price", "stop_loss", "size", "take_profit", "durationMinutes", "preciseDurationMinutes"].includes(name)
    setFormData((prev) => ({ ...prev, [name]: isNumeric ? (value === "" ? undefined : Number.parseFloat(value)) : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleStrategySelect = (strat: PlaybookStrategy) => {
    const isSelected = formData.playbook_strategy_id === strat.id
    setFormData(prev => ({
      ...prev,
      playbook_strategy_id: isSelected ? null : strat.id,
      setupName: isSelected ? "" : strat.name,
      executed_rules: [] // Reset rules
    }))
    setSelectedSetupId(null) // Reset setup
  }

  const handleSetupSelect = (setup: StrategySetup, strategyName: string) => {
    if (selectedSetupId === setup.id) {
       setSelectedSetupId(null)
       setFormData(prev => ({ ...prev, executed_rules: [], setupName: strategyName }))
    } else {
       setSelectedSetupId(setup.id)
       setFormData(prev => ({
          ...prev,
          executed_rules: setup.activeConfluences,
          setupName: `${strategyName} - ${setup.name}`
       }))
    }
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

  // Psychology Handlers
  const addPsychologyCustomTag = () => {
    if (psychologyCustomTagInput.trim() && !psychologyCustomTags.includes(psychologyCustomTagInput.trim())) {
      setPsychologyCustomTags([...psychologyCustomTags, psychologyCustomTagInput.trim()])
      setPsychologyCustomTagInput("")
    }
  }
  const removePsychologyCustomTag = (tag: string) => setPsychologyCustomTags(psychologyCustomTags.filter((t) => t !== tag))
  const togglePsychologyTrigger = (id: string) => setPsychologyTriggers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const togglePsychologyPattern = (id: string) => setPsychologyPatterns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    if (!formData.instrument) newErrors.instrument = "Required"
    if (!formData.entry_price) newErrors.entry_price = "Required"
    if (!formData.exit_price) newErrors.exit_price = "Required"
    if (!formData.size) newErrors.size = "Required"
    // Account validation
    if (!formData.account_id && tradingAccounts.length > 0) newErrors.account_id = "Please select an account"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const submissionData = { ...formData, pnl: formData.pnl || pnlResult || 0 }
      const result = await onSubmitTrade(submissionData)

      if (result.success && result.tradeId) {
        if (psychologyMood || psychologyTriggers.length > 0 || psychologyPatterns.length > 0) {
          await logTradePsychology(result.tradeId, {
            mood: psychologyMood,
            triggers: psychologyTriggers,
            patterns: psychologyPatterns,
            tags: psychologyCustomTags,
            pre_thoughts: psychologyPreThoughts,
            post_thoughts: psychologyPostThoughts + (psychologyLessons ? `\n\nLessons: ${psychologyLessons}` : "")
          })
          toast({ title: "Success", description: "Trade & Psychology Journal saved." })
        } else {
          toast({ title: "Success", description: "Trade logged successfully" })
        }
        
        localStorage.removeItem(FORM_STORAGE_KEY)
        router.push("/dashboard")
      } else {
        toast({ title: "Error", description: result.error || "Failed to save", variant: "destructive" })
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Unexpected error", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background/95 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold tracking-tight">New Trade Entry</h1>
          </div>
          <Button onClick={() => handleSubmit()} disabled={isSubmitting} className="rounded-full px-6 bg-gradient-to-r from-primary to-purple-600">
             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Log
          </Button>
        </div>
      </header>

      <div className="container max-w-7xl py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-center mb-8">
              <TabsList className="h-14 p-1 bg-muted/50 backdrop-blur-sm rounded-2xl border border-border/50 w-full max-w-2xl grid grid-cols-3 shadow-sm">
                <TabsTrigger value="setup" className="rounded-xl text-sm font-semibold">1. Setup & Entry</TabsTrigger>
                <TabsTrigger value="strategy" className="rounded-xl text-sm font-semibold">2. Strategy</TabsTrigger>
                <TabsTrigger value="psychology" className="rounded-xl text-sm font-semibold">3. Psychology</TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: SETUP */}
            <TabsContent value="setup" className="space-y-8">
               <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                  <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-primary"/> Instrument & Account</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                     
                     {/* --- ACCOUNT SELECTOR --- */}
                     {tradingAccounts.length > 0 && (
                        <div className="space-y-2">
                           <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                              <Wallet className="w-3 h-3" /> Select Account
                           </Label>
                           <Select 
                              value={formData.account_id || ""} 
                              onValueChange={(val) => setFormData(prev => ({...prev, account_id: val}))}
                           >
                              <SelectTrigger className={cn("w-full h-11 bg-background border-input", errors.account_id && "border-red-500 ring-1 ring-red-500")}>
                                 <SelectValue placeholder="Select Trading Account (e.g. Topstep, Funded)" />
                              </SelectTrigger>
                              <SelectContent>
                                 {tradingAccounts.map(account => (
                                    <SelectItem key={account.id} value={account.id}>
                                       <span className="font-medium">{account.name}</span>
                                       <span className="ml-2 text-muted-foreground text-xs">({account.type})</span>
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           {errors.account_id && <p className="text-xs text-red-500">{errors.account_id}</p>}
                        </div>
                     )}

                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search Instrument (e.g. ES, BTC)..." className="pl-10 h-12 bg-background" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                     </div>
                     <ScrollArea className="h-[200px] w-full rounded-xl border bg-muted/10 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                           {getAllAvailableInstruments(customInstruments).filter(i => !searchQuery || i.symbol.toLowerCase().includes(searchQuery.toLowerCase())).map(inst => (
                              <button key={inst.symbol} type="button" onClick={() => setFormData(prev => ({ ...prev, instrument: inst.symbol }))} className={cn("flex flex-col items-start p-3 rounded-xl border transition-all text-left", formData.instrument === inst.symbol ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border/40 bg-background")}>
                                 <span className="font-bold text-sm">{inst.symbol}</span>
                                 <span className="text-[10px] text-muted-foreground">{inst.name}</span>
                              </button>
                           ))}
                        </div>
                     </ScrollArea>
                  </CardContent>
               </Card>

               <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                  <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Crosshair className="w-5 h-5 text-primary"/> Execution</CardTitle></CardHeader>
                  <CardContent className="space-y-8">
                     <div className="grid grid-cols-2 gap-4 p-1 bg-muted/50 rounded-2xl">
                        <button type="button" onClick={() => setFormData(prev => ({...prev, direction: 'long'}))} className={cn("flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all", formData.direction === 'long' ? "bg-emerald-500 text-white shadow-lg" : "text-muted-foreground hover:bg-emerald-500/10")}>Long</button>
                        <button type="button" onClick={() => setFormData(prev => ({...prev, direction: 'short'}))} className={cn("flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all", formData.direction === 'short' ? "bg-rose-500 text-white shadow-lg" : "text-muted-foreground hover:bg-rose-500/10")}>Short</button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-xl border border-border/50">
                        <div className="space-y-2">
                           <Label className="text-xs font-bold uppercase text-muted-foreground">Entry Time</Label>
                           <Input type="datetime-local" name="entry_time" value={formData.entry_time || ""} onChange={handleChange} className="bg-background h-10" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-bold uppercase text-muted-foreground">Exit Time</Label>
                           <Input type="datetime-local" name="exit_time" value={formData.exit_time || ""} onChange={handleChange} className="bg-background h-10" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PriceInput id="entry_price" label="Entry Price" value={formData.entry_price} onChange={handleChange} icon={MousePointer} color="text-primary" />
                        <PriceInput id="stop_loss" label="Stop Loss" value={formData.stop_loss} onChange={handleChange} icon={Shield} color="text-rose-500" />
                        <PriceInput id="take_profit" label="Take Profit" value={formData.take_profit} onChange={handleChange} icon={Target} color="text-emerald-500" />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2"><Label className="text-xs font-bold uppercase text-muted-foreground">Exit Price</Label><Input type="number" name="exit_price" value={formData.exit_price || ""} onChange={handleChange} className="h-12 bg-background border-2" /></div>
                        <div className="space-y-2"><Label className="text-xs font-bold uppercase text-muted-foreground">Size</Label><Input type="number" name="size" value={formData.size || ""} onChange={handleChange} className="h-12 bg-background border-2" /></div>
                     </div>
                     <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><Clock className="w-3 h-3"/> Session</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                           {TRADING_SESSIONS.map(session => (
                              <SessionCard key={session.value} session={session} isSelected={formData.tradeSession === session.value} onSelect={() => setFormData(prev => ({...prev, tradeSession: session.value}))} />
                           ))}
                        </div>
                     </div>
                  </CardContent>
                  <CardFooter className="bg-muted/20 border-t p-4 flex justify-end"><Button size="lg" onClick={() => setActiveTab("strategy")} className="rounded-xl px-8">Next <ChevronRight className="ml-2 w-4 h-4"/></Button></CardFooter>
               </Card>
            </TabsContent>

            {/* TAB 2: STRATEGY (Unchanged Logic, just visual) */}
            <TabsContent value="strategy" className="space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Strategy & Confluences</h2>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("setup")}><ChevronLeft className="w-4 h-4 mr-2"/> Back</Button>
               </div>

               {renderSection("Select Strategy", BookOpen, 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {strategies.map(strat => {
                        const isSelected = formData.playbook_strategy_id === strat.id
                        return (
                           <div key={strat.id} className="flex flex-col gap-4">
                              <StrategyItemCard 
                                 title={strat.name} 
                                 description={strat.description || ""} 
                                 tags={strat.tags || []} 
                                 winRate={strat.win_rate || 0}
                                 isSelected={isSelected}
                                 onToggle={() => handleStrategySelect(strat)}
                              />
                              
                              {isSelected && (
                                 <div className="ml-4 pl-4 border-l-2 border-primary/20 space-y-4 animate-in slide-in-from-top-2">
                                    {strat.setups && strat.setups.length > 0 && (
                                       <div className="space-y-2">
                                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-primary tracking-wider">
                                             <GitBranch className="w-3 h-3"/> Active Setups
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                             {strat.setups.map(setup => (
                                                <Badge 
                                                   key={setup.id}
                                                   variant={selectedSetupId === setup.id ? "default" : "outline"}
                                                   className="cursor-pointer px-3 py-1.5 hover:bg-primary/20 transition-colors"
                                                   onClick={() => handleSetupSelect(setup, strat.name)}
                                                >
                                                   {selectedSetupId === setup.id && <CheckCircle className="w-3 h-3 mr-1" />}
                                                   {setup.name}
                                                </Badge>
                                             ))}
                                          </div>
                                       </div>
                                    )}

                                    {strat.rules && strat.rules.length > 0 && (
                                       <div className="space-y-2 pt-2">
                                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                                             <Database className="w-3 h-3"/> Confluence Checklist
                                          </div>
                                          <div className="space-y-2">
                                             {strat.rules.map(rule => (
                                                <RuleItem 
                                                   key={rule.id} 
                                                   rule={rule} 
                                                   isChecked={formData.executed_rules?.includes(rule.id) || false}
                                                   onToggle={() => handleRuleToggle(rule.id)}
                                                />
                                             ))}
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>
                        )
                     })}
                  </div>,
                  "text-indigo-600", "bg-indigo-50/10", "border-indigo-200 dark:border-indigo-900"
               )}

               <Card className="border-0 shadow-md bg-card">
                  <CardContent className="p-6">
                     <Label className="mb-3 block font-bold text-sm uppercase text-muted-foreground">Trade Narrative</Label>
                     <Input value={formData.setupName || ""} onChange={handleChange} name="setupName" className="h-12 text-lg bg-muted/30 border-2" placeholder="e.g. London Silver Bullet..." />
                  </CardContent>
                  <CardFooter className="bg-muted/20 border-t p-4 flex justify-end"><Button size="lg" onClick={() => setActiveTab("psychology")} className="rounded-xl px-8">Next <ChevronRight className="ml-2 w-4 h-4"/></Button></CardFooter>
               </Card>
            </TabsContent>

            {/* TAB 3: PSYCHOLOGY (Unchanged Logic) */}
            <TabsContent value="psychology" className="space-y-8">
               <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Psychology</h2><Button variant="outline" size="sm" onClick={() => setActiveTab("strategy")}><ChevronLeft className="w-4 h-4 mr-2"/> Back</Button></div>
               
               <Card className="border-0 shadow-lg"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Brain className="w-5 h-5 text-primary"/> Emotional State</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 md:grid-cols-7 gap-3">{MOODS.map(m => (<button key={m.id} type="button" onClick={() => setPsychologyMood(m.id)} className={cn("flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:scale-105", psychologyMood === m.id ? m.color : "border-transparent bg-muted/30 hover:bg-muted")}><span className="text-2xl mb-1">{m.emoji}</span><span className="text-xs font-bold">{m.label}</span></button>))}</div></CardContent></Card>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3"><Label className="text-xs font-bold uppercase text-muted-foreground">Triggers</Label><div className="flex flex-wrap gap-2">{EMOTIONAL_TRIGGERS.map(t => (<Badge key={t.id} variant={psychologyTriggers.includes(t.id) ? "destructive" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => togglePsychologyTrigger(t.id)}>{t.label}</Badge>))}</div></div>
                  <div className="space-y-3"><Label className="text-xs font-bold uppercase text-muted-foreground">Patterns</Label><div className="flex flex-wrap gap-2">{BEHAVIORAL_PATTERNS.map(p => (<Badge key={p.id} variant={psychologyPatterns.includes(p.id) ? "default" : "outline"} className="cursor-pointer px-3 py-1.5 bg-blue-500 hover:bg-blue-600 border-transparent text-white" onClick={() => togglePsychologyPattern(p.id)}>{p.label}</Badge>))}</div></div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-md h-full"><CardHeader><CardTitle className="text-base">Pre-Trade</CardTitle></CardHeader><CardContent><Textarea value={psychologyPreThoughts} onChange={(e) => setPsychologyPreThoughts(e.target.value)} className="min-h-[150px] bg-muted/10 border-2" placeholder="Mindset before entering..." /></CardContent></Card>
                  <Card className="border-0 shadow-md h-full"><CardHeader><CardTitle className="text-base">Post-Trade</CardTitle></CardHeader><CardContent><Textarea name="notes" value={formData.notes || ""} onChange={handleChange} className="min-h-[150px] bg-muted/10 border-2" placeholder="Result breakdown..." /></CardContent></Card>
               </div>

               <div className="space-y-3"><Label className="text-xs font-bold uppercase text-muted-foreground">Tags</Label><div className="flex gap-2"><Input value={psychologyCustomTagInput} onChange={(e) => setPsychologyCustomTagInput(e.target.value)} className="max-w-xs" placeholder="Add tag..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPsychologyCustomTag())} /><Button type="button" variant="secondary" onClick={addPsychologyCustomTag}><Plus className="w-4 h-4"/></Button></div><div className="flex flex-wrap gap-2">{psychologyCustomTags.map(t => (<Badge key={t} variant="secondary" onClick={() => removePsychologyCustomTag(t)} className="cursor-pointer hover:bg-destructive/20">{t} &times;</Badge>))}</div></div>

               <Card className="border-dashed border-2 bg-muted/5"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Screenshots</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label className="text-xs uppercase">Before</Label><Input placeholder="https://..." name="screenshotBeforeUrl" value={formData.screenshotBeforeUrl || ""} onChange={handleChange} /></div><div className="space-y-2"><Label className="text-xs uppercase">After</Label><Input placeholder="https://..." name="screenshotAfterUrl" value={formData.screenshotAfterUrl || ""} onChange={handleChange} /></div></CardContent></Card>

               <div className="flex justify-end pt-4"><Button onClick={() => handleSubmit()} disabled={isSubmitting} size="lg" className="w-full md:w-auto px-12 rounded-xl text-lg shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-transform">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <CheckCircle className="w-5 h-5 mr-2"/>} Commit Log</Button></div>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN (Sticky Simulator) */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="sticky top-24 border-0 shadow-2xl bg-background/80 backdrop-blur-xl ring-1 ring-border/50 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-primary to-purple-600" />
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Calculator className="w-5 h-5 text-primary"/> Live Simulation</CardTitle></CardHeader>
              <CardContent className="space-y-6 pt-4">
                 <div className="text-center p-6 bg-muted/30 rounded-2xl border border-border/50">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Estimated P&L</span>
                    <div className={cn("text-5xl font-black tracking-tighter my-2", (pnlResult || 0) > 0 ? "text-emerald-500" : (pnlResult || 0) < 0 ? "text-rose-500" : "text-foreground")}>{(pnlResult || 0) > 0 ? "+" : ""}${(pnlResult || 0).toFixed(2)}</div>
                    {formData.size && formData.size > 0 && (<Badge variant="secondary" className="mt-2">{formData.size} Contracts</Badge>)}
                 </div>
                 
                 {/* DURATION DISPLAY */}
                 {formData.durationMinutes !== undefined && (
                    <div className="flex justify-between text-sm px-2">
                        <span className="font-medium text-muted-foreground">Duration</span>
                        <span className="font-bold font-mono">{formData.durationMinutes} min</span>
                    </div>
                 )}

                 <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="font-medium text-muted-foreground">R:R Ratio</span><span className="font-bold font-mono">{riskRewardRatio ? `1:${riskRewardRatio.toFixed(2)}` : "-"}</span></div>
                    <div className="h-4 w-full bg-muted rounded-full flex overflow-hidden relative"><div className="absolute inset-0 flex"><div className="bg-rose-500 transition-all duration-500" style={{ width: "30%" }} /><div className="bg-emerald-500 transition-all duration-500 flex-1" /></div><div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-white z-10" /></div>
                 </div>
                 <Separator />
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background border text-center"><div className="text-[10px] uppercase text-muted-foreground mb-1">Risk</div><div className="font-mono font-bold text-rose-500">${(Math.abs((formData.entry_price || 0) - (formData.stop_loss || 0)) * (formData.size || 0)).toFixed(2)}</div></div>
                    <div className="p-3 rounded-lg bg-background border text-center"><div className="text-[10px] uppercase text-muted-foreground mb-1">Target</div><div className="font-mono font-bold text-emerald-500">${(Math.abs((formData.take_profit || 0) - (formData.entry_price || 0)) * (formData.size || 0)).toFixed(2)}</div></div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}

export { TradeForm }
export type { TradeFormProps }
export default TradeForm
