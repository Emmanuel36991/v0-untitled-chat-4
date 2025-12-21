"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  Save,
  Loader2,
  Brain,
  BarChart3,
  Globe,
  Zap,
  Crosshair,
  MousePointer,
  ImageIcon,
  Calculator,
  Info,
  Plus,
  Layers,
  Scale,
  BookOpen,
  ListChecks,
  CheckSquare
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
import {
  calculateInstrumentPnL,
  type CustomInstrument,
  getAllAvailableInstruments,
} from "@/types/instrument-calculations"
import { CustomInstrumentDialog } from "@/components/trades/custom-instrument-dialog"
import { createBrowserClient } from "@supabase/ssr"
import {
  type Trade,
  type NewTradeInput,
  type StrategyRule,
  AVAILABLE_PSYCHOLOGY_FACTORS,
} from "@/types"

import { getStrategies, type PlaybookStrategy } from "@/app/actions/playbook-actions"

/* -------------------------------------------------------------------------- */
/* CONSTANTS & CONFIG                                                         */
/* -------------------------------------------------------------------------- */

const FORM_STORAGE_KEY = "trade_form_draft"

const MOODS = [
  {
    id: "euphoric",
    label: "Euphoric",
    emoji: "🤩",
    color: "text-green-600 bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800",
  },
  {
    id: "confident",
    label: "Confident",
    emoji: "😎",
    color: "text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  },
  {
    id: "focused",
    label: "Focused",
    emoji: "🎯",
    color: "text-purple-600 bg-purple-100 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
  },
  {
    id: "neutral",
    label: "Neutral",
    emoji: "😐",
    color: "text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700",
  },
  {
    id: "cautious",
    label: "Cautious",
    emoji: "🤔",
    color: "text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
  },
  {
    id: "frustrated",
    label: "Frustrated",
    emoji: "😤",
    color: "text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
  },
  {
    id: "anxious",
    label: "Anxious",
    emoji: "😰",
    color: "text-red-600 bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  },
]

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

const TRADING_SESSIONS = [
  {
    value: "asian",
    label: "Asian Session",
    emoji: "🌏",
    time: "21:00 - 06:00 GMT",
    description: "Lower volatility, range-bound markets.",
    borderColor: "border-orange-200 dark:border-orange-800",
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/10",
  },
  {
    value: "london",
    label: "London Session",
    emoji: "🏰",
    time: "07:00 - 16:00 GMT",
    description: "High volume, trend establishment.",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/10",
  },
  {
    value: "new-york",
    label: "New York Session",
    emoji: "🗽",
    time: "12:00 - 21:00 GMT",
    description: "Highest volatility, major news releases.",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/10",
  },
  {
    value: "overlap",
    label: "London/NY Overlap",
    emoji: "⚡",
    time: "12:00 - 16:00 GMT",
    description: "Peak liquidity and momentum.",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/10",
  },
]

/* -------------------------------------------------------------------------- */
/* HELPER FUNCTIONS                                                           */
/* -------------------------------------------------------------------------- */

const getInitialFormState = (initialTrade?: Trade): NewTradeInput => {
  const baseState: NewTradeInput = {
    date: new Date().toISOString().split("T")[0],
    instrument: "",
    direction: "long" as "long" | "short",
    entry_price: 0,
    exit_price: 0,
    stop_loss: 0,
    size: 0,
    setupName: "",
    notes: "",
    playbook_strategy_id: null,
    executed_rules: [], // Initialize executed rules array
    take_profit: undefined,
    durationMinutes: undefined,
    tradeSession: undefined,
    tradeStartTime: undefined,
    tradeEndTime: undefined,
    preciseDurationMinutes: undefined,
    // Initialize legacy arrays just in case (though unused in new logic)
    smcMarketStructure: [],
    psychologyFactors: [],
    screenshotBeforeUrl: "",
    screenshotAfterUrl: "",
  }

  if (initialTrade) {
    return {
      ...baseState,
      ...(initialTrade as unknown as NewTradeInput),
      date:
        typeof initialTrade.date === "string"
          ? initialTrade.date
          : new Date(initialTrade.date).toISOString().split("T")[0],
    }
  }
  return baseState
}

// 1. Strategy Item Card (Renamed to match usage)
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
  
  // Dynamic Icon Selection based on tags/name
  let Icon = BookOpen
  if (tags.some(t => t.toLowerCase().includes("ict"))) Icon = Crosshair
  else if (tags.some(t => t.toLowerCase().includes("smc"))) Icon = Zap
  else if (tags.some(t => t.toLowerCase().includes("wyckoff"))) Icon = Layers
  else if (tags.some(t => t.toLowerCase().includes("volume"))) Icon = BarChart3

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200 h-full w-full",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500",
        isSelected 
          ? "bg-indigo-50/50 border-indigo-500 ring-1 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-500" 
          : "bg-card border-border/40 hover:bg-accent/50 hover:border-indigo-200 dark:hover:border-indigo-800"
      )}
    >
      <div className="flex justify-between w-full mb-3">
        <div className={cn("p-2 rounded-lg border shadow-sm", isSelected ? "bg-indigo-100 border-indigo-200 dark:bg-indigo-900 dark:border-indigo-800" : "bg-background border-border")}>
          <Icon className={cn("w-5 h-5", isSelected ? "text-indigo-600" : "text-muted-foreground")} />
        </div>
        {isSelected && (
           <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-full p-1">
             <CheckCircle className="w-4 h-4" />
           </div>
        )}
      </div>

      <h4 className={cn("font-bold text-sm mb-1 leading-tight", isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-foreground")}>
        {title}
      </h4>
      
      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 h-8 leading-snug">
        {description || "No description provided."}
      </p>

      <div className="flex items-center justify-between w-full mt-auto pt-3 border-t border-dashed border-border/50">
         <div className="flex gap-1 overflow-hidden">
           {tags.slice(0, 2).map(t => (
             <Badge key={t} variant="secondary" className="text-[9px] px-1.5 h-5 font-normal bg-muted/50 border-0">{t}</Badge>
           ))}
         </div>
         <span className="text-[10px] font-mono font-bold text-muted-foreground">{winRate}% WR</span>
      </div>
    </button>
  )
}

// 2. Rule Checklist Item
const RuleItem = ({ rule, isChecked, onToggle }: { rule: StrategyRule, isChecked: boolean, onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      "flex items-start gap-3 w-full text-left p-3 rounded-lg border transition-all duration-200 group",
      isChecked 
        ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800" 
        : "bg-background border-border hover:border-emerald-200 dark:hover:border-emerald-800"
    )}
  >
    <div className={cn(
      "mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0",
      isChecked 
        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
        : "border-muted-foreground/30 group-hover:border-emerald-400 bg-muted/20"
    )}>
      {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
    </div>
    
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <span className={cn("text-sm font-medium leading-snug", isChecked ? "text-emerald-900 dark:text-emerald-100" : "text-foreground")}>
          {rule.text}
        </span>
        <Badge variant="outline" className="text-[9px] uppercase tracking-wider text-muted-foreground ml-2 shrink-0 bg-transparent">
          {rule.phase}
        </Badge>
      </div>
      {rule.required && (
        <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mt-1 block">
          Required Rule
        </span>
      )}
    </div>
  </button>
)

// 3. Price Input Field
const PriceInput = ({
  id,
  label,
  value,
  onChange,
  icon: Icon,
  color = "text-foreground",
  placeholder = "0.00",
}: {
  id: string
  label: string
  value: number | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon: any
  color?: string
  placeholder?: string
}) => (
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

// 4. Session Card
const SessionCard = ({
  session,
  isSelected,
  onSelect,
}: { session: any; isSelected: boolean; onSelect: () => void }) => (
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
        <div
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center",
            session.textColor.split(" ")[0].replace("text-", "bg-"),
          )}
        >
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{session.description}</p>
  </button>
)

// 5. Generic Section Renderer (Used for wrapping unified sections)
const renderSection = (
  title: string,
  Icon: React.ElementType,
  children: React.ReactNode,
  colorClass: string,
  bgClass: string,
  borderClass: string,
) => {
  return (
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
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

const TradeForm = ({ onSubmitTrade, initialTradeData, mode = "add" }: TradeFormProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const strategyIdFromUrl = searchParams.get('strategy_id')
  const { toast } = useToast()
  const { config, isLoaded } = useUserConfig()

  // --- STATE ---
  const [formData, setFormData] = useState<NewTradeInput>(getInitialFormState(initialTradeData))
  const [activeTab, setActiveTab] = useState("setup")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [customInstruments, setCustomInstruments] = useState<CustomInstrument[]>([])

  // *** STRATEGIES STATE ***
  const [strategies, setStrategies] = useState<PlaybookStrategy[]>([])

  // Psychology specific
  const [showPsychologyForm, setShowPsychologyForm] = useState(true) // Default open to encourage use
  const [psychologyMood, setPsychologyMood] = useState("")
  const [psychologyTriggers, setPsychologyTriggers] = useState<string[]>([])
  const [psychologyPatterns, setPsychologyPatterns] = useState<string[]>([])
  const [psychologyCustomTags, setPsychologyCustomTags] = useState<string[]>([])
  const [psychologyCustomTagInput, setPsychologyCustomTagInput] = useState("")
  const [psychologyPreThoughts, setPsychologyPreThoughts] = useState("")
  const [psychologyPostThoughts, setPsychologyPostThoughts] = useState("")
  const [psychologyLessons, setPsychologyLessons] = useState("")

  // --- EFFECTS ---

  // 1. Fetch Strategies
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await getStrategies()
        if (mounted) {
          setStrategies(data)
          // Handle Pre-selection from URL
          if (strategyIdFromUrl && !formData.playbook_strategy_id) {
             const strat = data.find((s: PlaybookStrategy) => s.id === strategyIdFromUrl)
             if (strat) {
               setFormData(prev => ({ 
                 ...prev, 
                 playbook_strategy_id: strat.id,
                 setupName: strat.name || ""
               }))
               setActiveTab("strategy") // Jump to strategy tab
             }
          }
        }
      } catch (error) {
        console.error("Failed to load strategies", error)
      }
    }
    load()
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
        } catch (e) {
          console.error("Draft load error", e)
        }
      }
    }
  }, [initialTradeData, mode])

  // Auto-Save Draft
  useEffect(() => {
    if (mode === "add") {
      const timer = setTimeout(() => {
        localStorage.setItem(
          FORM_STORAGE_KEY,
          JSON.stringify({
            formData,
            activeTab,
            timestamp: Date.now(),
          }),
        )
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [formData, activeTab, mode])

  // --- CALCULATIONS ---

  const pnlResult = useMemo(() => {
    if (!formData.entry_price || !formData.exit_price || !formData.size) return null
    return calculateInstrumentPnL(
      formData.instrument,
      formData.direction,
      formData.entry_price,
      formData.exit_price,
      formData.size,
    ).adjustedPnL
  }, [formData])

  const riskRewardRatio = useMemo(() => {
    if (!formData.entry_price || !formData.stop_loss || !formData.take_profit) return null
    const risk = Math.abs(formData.entry_price - formData.stop_loss)
    const reward = Math.abs(formData.take_profit - formData.entry_price)
    return risk === 0 ? 0 : reward / risk
  }, [formData])

  const availableInstruments = useMemo(() => {
    let all = getAllAvailableInstruments(customInstruments)
    if (selectedCategory !== "all") all = all.filter((i) => i.category === selectedCategory)
    if (searchQuery)
      all = all.filter(
        (i) =>
          i.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    return all
  }, [customInstruments, selectedCategory, searchQuery])

  // --- HANDLERS ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const isNumeric =
      type === "number" ||
      [
        "entry_price",
        "exit_price",
        "stop_loss",
        "size",
        "take_profit",
        "durationMinutes",
        "preciseDurationMinutes",
      ].includes(name)

    setFormData((prev) => ({
      ...prev,
      [name]: isNumeric ? (value === "" ? undefined : Number.parseFloat(value)) : value,
    }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleStrategySelect = (strat: PlaybookStrategy) => {
    const isSelected = formData.playbook_strategy_id === strat.id
    setFormData(prev => ({
      ...prev,
      playbook_strategy_id: isSelected ? null : strat.id,
      setupName: isSelected ? "" : strat.name,
      executed_rules: [] // Reset checked rules when switching
    }))
  }

  const handleRuleToggle = (ruleId: string) => {
    setFormData(prev => {
      const current = prev.executed_rules || []
      return {
        ...prev,
        executed_rules: current.includes(ruleId) 
          ? current.filter(id => id !== ruleId) 
          : [...current, ruleId]
      }
    })
  }

  const addPsychologyCustomTag = () => {
    if (psychologyCustomTagInput.trim() && !psychologyCustomTags.includes(psychologyCustomTagInput.trim())) {
      setPsychologyCustomTags([...psychologyCustomTags, psychologyCustomTagInput.trim()])
      setPsychologyCustomTagInput("")
    }
  }

  const removePsychologyCustomTag = (tag: string) => {
    setPsychologyCustomTags(psychologyCustomTags.filter((t) => t !== tag))
  }

  const togglePsychologyTrigger = (id: string) => {
    setPsychologyTriggers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  const togglePsychologyPattern = (id: string) => {
    setPsychologyPatterns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const createPsychologyEntry = async (tradeId: string) => {
    if (!psychologyMood) return null

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      const emotionsArray = [...psychologyTriggers, ...psychologyPatterns, ...psychologyCustomTags]

      const entryData = {
        user_id: user.id,
        trade_id: tradeId,
        entry_date: formData.date,
        mood: psychologyMood,
        emotions: emotionsArray,
        pre_trade_thoughts: psychologyPreThoughts,
        post_trade_thoughts: psychologyPostThoughts,
        lessons_learned: psychologyLessons,
      }

      const { data, error } = await supabase.from("psychology_journal_entries").insert(entryData).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating psychology entry:", error)
      toast({
        title: "Psychology Save Error",
        description: "Could not save psychology journal. Trade was saved.",
        variant: "destructive",
      })
      return null
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!formData.instrument) newErrors.instrument = "Required"
    if (!formData.entry_price) newErrors.entry_price = "Required"
    if (!formData.exit_price) newErrors.exit_price = "Required"
    if (!formData.size) newErrors.size = "Required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Save Trade with auto-calc PnL if needed
      const submissionData = {
        ...formData,
        pnl: formData.pnl || pnlResult || 0
      }
      const result = await onSubmitTrade(submissionData)

      if (result.success) {
        // 2. If Psychology data exists, save Journal Entry linked to Trade ID
        if (psychologyMood && result.tradeId) {
          await createPsychologyEntry(result.tradeId)
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
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="min-h-screen bg-background/95 pb-24">
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                {initialTradeData ? "Edit Trade" : "New Trade Entry"}
                <Badge variant="secondary" className="text-[10px] font-normal hidden sm:inline-flex">
                  {mode === "add" ? "Draft" : "Revision"}
                </Badge>
              </h1>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date().toLocaleDateString()}
                <Separator orientation="vertical" className="mx-2 h-3" />
                <Clock className="mr-1 h-3 w-3" />
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4 mr-4 px-4 py-2 bg-muted/30 rounded-full border border-border/50">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Est. P&L</span>
                <span
                  className={cn(
                    "text-sm font-mono font-bold",
                    (pnlResult || 0) >= 0 ? "text-green-500" : "text-red-500",
                  )}
                >
                  {(pnlResult || 0) >= 0 ? "+" : ""}${pnlResult?.toFixed(2) || "0.00"}
                </span>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">R:R</span>
                <span className="text-sm font-mono font-bold">
                  {riskRewardRatio ? `1:${riskRewardRatio.toFixed(2)}` : "-"}
                </span>
              </div>
            </div>

            <Button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="rounded-full px-6 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 border-0"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Log
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT COLUMN (Main Form) --- */}
        <div className="lg:col-span-8 space-y-8">
          {/* TABS NAVIGATION */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-center mb-8">
              <TabsList className="h-14 p-1 bg-muted/50 backdrop-blur-sm rounded-2xl border border-border/50 w-full max-w-2xl grid grid-cols-3 shadow-sm">
                <TabsTrigger
                  value="setup"
                  className="rounded-xl text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                >
                  1. Setup & Entry
                </TabsTrigger>
                <TabsTrigger
                  value="strategy"
                  className="rounded-xl text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                >
                  2. Strategy
                </TabsTrigger>
                <TabsTrigger
                  value="psychology"
                  className="rounded-xl text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                >
                  3. Psychology
                </TabsTrigger>
              </TabsList>
            </div>

            {/* === TAB 1: SETUP & ENTRY === */}
            <TabsContent value="setup" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Instrument Card */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" /> Instrument Selection
                      </CardTitle>
                      <CardDescription>Search or select from your watchlist.</CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {formData.instrument || "None Selected"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search (e.g. ES, BTC, AAPL)..."
                      className="pl-10 h-12 rounded-xl bg-background border-border/60 focus:ring-primary/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <ScrollArea className="h-[220px] w-full rounded-xl border bg-muted/10 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {getAllAvailableInstruments(customInstruments)
                        .filter((i) => !searchQuery || i.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((inst) => (
                          <button
                            key={inst.symbol}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, instrument: inst.symbol }))}
                            className={cn(
                              "flex flex-col items-start p-3 rounded-xl border transition-all text-left hover:shadow-md group relative overflow-hidden",
                              formData.instrument === inst.symbol
                                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                : "border-border/40 bg-background hover:border-primary/30",
                            )}
                          >
                            <span className="font-bold text-sm relative z-10">{inst.symbol}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1 relative z-10">
                              {inst.name}
                            </span>
                            {formData.instrument === inst.symbol && (
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                            )}
                          </button>
                        ))}
                      <CustomInstrumentDialog
                        onSave={(i) => setCustomInstruments((prev) => [...prev, i])}
                        trigger={
                          <button
                            type="button"
                            className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
                          >
                            <Plus className="w-5 h-5 mb-1" />
                            <span className="text-xs font-bold">Custom</span>
                          </button>
                        }
                      />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Execution Details Card */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Crosshair className="w-5 h-5 text-primary" /> Execution Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Direction Toggle */}
                  <div className="grid grid-cols-2 gap-4 p-1 bg-muted/50 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, direction: "long" }))}
                      className={cn(
                        "flex items-center justify-center gap-2 py-4 rounded-xl transition-all font-bold text-lg relative overflow-hidden",
                        formData.direction === "long"
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10",
                      )}
                    >
                      <TrendingUp className="w-5 h-5" /> Long
                      {formData.direction === "long" && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, direction: "short" }))}
                      className={cn(
                        "flex items-center justify-center gap-2 py-4 rounded-xl transition-all font-bold text-lg relative overflow-hidden",
                        formData.direction === "short"
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                          : "text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10",
                      )}
                    >
                      <TrendingDown className="w-5 h-5" /> Short
                      {formData.direction === "short" && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                    </button>
                  </div>

                  {/* Price Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PriceInput
                      id="entry_price"
                      label="Entry Price"
                      value={formData.entry_price}
                      onChange={handleChange}
                      icon={MousePointer}
                      color="text-primary"
                    />
                    <PriceInput
                      id="stop_loss"
                      label="Stop Loss"
                      value={formData.stop_loss}
                      onChange={handleChange}
                      icon={Shield}
                      color="text-rose-500"
                    />
                    <PriceInput
                      id="take_profit"
                      label="Take Profit"
                      value={formData.take_profit}
                      onChange={handleChange}
                      icon={Target}
                      color="text-emerald-500"
                    />
                  </div>

                  {/* Secondary Inputs */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        Exit Price (If Closed)
                      </Label>
                      <Input
                        type="number"
                        name="exit_price"
                        value={formData.exit_price || ""}
                        onChange={handleChange}
                        className="h-12 bg-background border-2"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Position Size</Label>
                      <Input
                        type="number"
                        name="size"
                        value={formData.size || ""}
                        onChange={handleChange}
                        className="h-12 bg-background border-2"
                        placeholder="Units/Lots"
                      />
                    </div>
                  </div>

                  {/* Session Selector */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Session
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {TRADING_SESSIONS.map((session) => (
                        <SessionCard
                          key={session.value}
                          session={session}
                          isSelected={formData.tradeSession === session.value}
                          onSelect={() => setFormData((prev) => ({ ...prev, tradeSession: session.value }))}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t border-border/50 p-4 flex justify-end">
                  <Button size="lg" onClick={() => setActiveTab("strategy")} className="rounded-xl px-8">
                    Next Step <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* === TAB 2: STRATEGY (Updated with consistent styling) === */}
            <TabsContent value="strategy" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Strategy Definition</h2>
                  <p className="text-muted-foreground text-sm">
                    Select the active strategy and verify executed rules.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("setup")}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>

              {/* *** UNIFIED STRATEGY SELECTOR *** */}
              {renderSection(
                "Playbook Strategies",
                BookOpen,
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategies.length === 0 ? (
                    <div className="col-span-full text-center p-6 border-2 border-dashed rounded-xl">
                      <p className="text-sm text-muted-foreground mb-4">No strategies found in your playbook.</p>
                      <Button variant="outline" size="sm" onClick={() => router.push('/playbook')}>Go to Playbook</Button>
                    </div>
                  ) : (
                    strategies.map(strat => {
                      const isSelected = formData.playbook_strategy_id === strat.id
                      return (
                        <div key={strat.id} className="h-full flex flex-col gap-2">
                          {/* Strategy Card */}
                          <StrategyItemCard 
                            title={strat.name} 
                            description={strat.description || ""}
                            tags={strat.tags}
                            winRate={strat.win_rate}
                            isSelected={isSelected}
                            onToggle={() => handleStrategySelect(strat)}
                          />

                          {/* Dynamic Rules Checklist (Appears below selected card) */}
                          {isSelected && strat.rules && strat.rules.length > 0 && (
                            <div className="ml-2 pl-4 border-l-2 border-indigo-200/50 dark:border-indigo-800/50 py-2 animate-in slide-in-from-left-2 duration-300">
                              <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase text-indigo-500 tracking-wider">
                                <ListChecks className="w-3 h-3" /> Execution Rules
                              </div>
                              <div className="space-y-2">
                                {strat.rules.map((rule) => {
                                  const isChecked = formData.executed_rules?.includes(rule.id) || false
                                  return (
                                    <RuleItem
                                      key={rule.id}
                                      rule={rule}
                                      isChecked={isChecked}
                                      onToggle={() => handleRuleToggle(rule.id)}
                                    />
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>,
                "text-indigo-600", "bg-indigo-50/10", "border-indigo-200 dark:border-indigo-900"
              )}

              <Card className="border-0 shadow-md bg-card">
                <CardContent className="p-6">
                  <Label className="mb-3 block font-bold text-sm uppercase text-muted-foreground">
                    Trade Narrative / Setup Name
                  </Label>
                  <Input
                    value={formData.setupName || ""}
                    onChange={handleChange}
                    name="setupName"
                    className="h-12 text-lg bg-muted/30 border-2 focus:border-primary"
                    placeholder="e.g. London Silver Bullet Long..."
                  />
                </CardContent>
                <CardFooter className="bg-muted/20 border-t p-4 flex justify-end">
                  <Button size="lg" onClick={() => setActiveTab("psychology")} className="rounded-xl px-8">
                    Next Step <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* === TAB 3: PSYCHOLOGY === */}
            <TabsContent
              value="psychology"
              className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Psychology & Review</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("strategy")}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>

              {/* Mood Selection */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" /> Emotional State
                  </CardTitle>
                  <CardDescription>
                    How did you feel during execution? This data will be saved to your Psychology Journal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPsychologyMood(m.id)}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:scale-105",
                          psychologyMood === m.id ? m.color : "border-transparent bg-muted/30 hover:bg-muted",
                        )}
                      >
                        <span className="text-2xl mb-1">{m.emoji}</span>
                        <span className="text-xs font-bold">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Triggers */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Emotional Triggers</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOTIONAL_TRIGGERS.map((t) => (
                      <Badge
                        key={t.id}
                        variant={psychologyTriggers.includes(t.id) ? "destructive" : "outline"}
                        className="cursor-pointer px-3 py-1.5"
                        onClick={() => togglePsychologyTrigger(t.id)}
                      >
                        {t.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Behavioral Patterns */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Behavioral Patterns</Label>
                  <div className="flex flex-wrap gap-2">
                    {BEHAVIORAL_PATTERNS.map((p) => (
                      <Badge
                        key={p.id}
                        variant={psychologyPatterns.includes(p.id) ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1.5 bg-blue-500 hover:bg-blue-600 border-transparent text-white"
                        onClick={() => togglePsychologyPattern(p.id)}
                      >
                        {p.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Journal Entry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Pre-Trade Thoughts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={psychologyPreThoughts}
                      onChange={(e) => setPsychologyPreThoughts(e.target.value)}
                      className="min-h-[150px] resize-none bg-muted/10 border-2 focus:border-primary"
                      placeholder="What was your mindset before entering?"
                    />
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Post-Trade Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      name="notes"
                      value={formData.notes || ""}
                      onChange={handleChange}
                      className="min-h-[150px] resize-none bg-muted/10 border-2 focus:border-primary"
                      placeholder="Detailed breakdown of result. What went right? What went wrong?"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Custom Tags */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Custom Journal Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={psychologyCustomTagInput}
                    onChange={(e) => setPsychologyCustomTagInput(e.target.value)}
                    className="max-w-xs"
                    placeholder="Add tag..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPsychologyCustomTag())}
                  />
                  <Button type="button" variant="secondary" onClick={addPsychologyCustomTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {psychologyCustomTags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      onClick={() => removePsychologyCustomTag(t)}
                      className="cursor-pointer hover:bg-destructive/20"
                    >
                      {t} &times;
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Screenshot Upload Placeholders */}
              <Card className="border-dashed border-2 bg-muted/5">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Screenshots
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase">Before Entry</Label>
                    <Input
                      placeholder="https://..."
                      name="screenshotBeforeUrl"
                      value={formData.screenshotBeforeUrl || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase">After Exit</Label>
                    <Input
                      placeholder="https://..."
                      name="screenshotAfterUrl"
                      value={formData.screenshotAfterUrl || ""}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full md:w-auto px-12 rounded-xl text-lg shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-transform"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  Commit Trade Log
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* --- RIGHT COLUMN (Sticky Simulator) --- */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-24 border-0 shadow-2xl bg-background/80 backdrop-blur-xl ring-1 ring-border/50 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-primary to-purple-600" />

            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="w-5 h-5 text-primary" /> Live Simulation
              </CardTitle>
              <CardDescription>Real-time risk & reward calculation</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              {/* P&L Big Display */}
              <div className="text-center p-6 bg-muted/30 rounded-2xl border border-border/50">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Estimated P&L</span>
                <div
                  className={cn(
                    "text-5xl font-black tracking-tighter my-2",
                    (pnlResult || 0) > 0
                      ? "text-emerald-500"
                      : (pnlResult || 0) < 0
                        ? "text-rose-500"
                        : "text-foreground",
                  )}
                >
                  {(pnlResult || 0) > 0 ? "+" : ""}${(pnlResult || 0).toFixed(2)}
                </div>
                {formData.size && formData.size > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    {formData.size} Contracts @ {formData.entry_price}
                  </Badge>
                )}
              </div>

              {/* R:R Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">Risk/Reward Ratio</span>
                  <span className="font-bold font-mono">
                    {riskRewardRatio ? `1:${riskRewardRatio.toFixed(2)}` : "-"}
                  </span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full flex overflow-hidden relative">
                  {/* Dynamic Bar */}
                  <div className="absolute inset-0 flex">
                    <div className="bg-rose-500 transition-all duration-500" style={{ width: "30%" }} />
                    <div className="bg-emerald-500 transition-all duration-500 flex-1" />
                  </div>
                  {/* Markers */}
                  <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-white z-10" />
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground px-1">
                  <span>Stop Loss</span>
                  <span>Take Profit</span>
                </div>
              </div>

              <Separator />

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-background border text-center">
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">Risk Amount</div>
                  <div className="font-mono font-bold text-rose-500">
                    $
                    {(Math.abs((formData.entry_price || 0) - (formData.stop_loss || 0)) * (formData.size || 0)).toFixed(
                      2,
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background border text-center">
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">Target Profit</div>
                  <div className="font-mono font-bold text-emerald-500">
                    $
                    {(
                      Math.abs((formData.take_profit || 0) - (formData.entry_price || 0)) * (formData.size || 0)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-600 dark:text-blue-400 text-xs flex gap-3">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Tip: A risk/reward ratio above 1:2 is recommended for long-term profitability. Ensure your stop loss
                  is placed at a technical invalidation point.
                </p>
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
