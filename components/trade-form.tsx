"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Calendar, Clock, Target, TrendingUp, TrendingDown,
  Shield, CheckCircle, ChevronRight, ChevronLeft, Search, Save,
  Loader2, Brain, BarChart3, Globe, Zap, Crosshair, MousePointer,
  ImageIcon, Calculator, Info, Plus, Layers, BookOpen, ListChecks,
  CandlestickChart, Activity, Ban, GitBranch, Database, Wallet,
  DollarSign, Scale, ArrowUpRight, ArrowDownRight, Minus,
  ChevronDown, CloudOff, Cloud, X
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
  BAD_HABITS,
  GOOD_HABITS,
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
  { value: "asian", label: "Asian Session", icon: Globe, time: "21:00 - 06:00 GMT", description: "Lower volatility, range-bound markets.", borderColor: "border-orange-200 dark:border-orange-800", textColor: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-950/10", iconBg: "bg-orange-500/15" },
  { value: "london", label: "London Session", icon: Layers, time: "07:00 - 16:00 GMT", description: "High volume, trend establishment.", borderColor: "border-blue-200 dark:border-blue-800", textColor: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/10", iconBg: "bg-blue-500/15" },
  { value: "new-york", label: "New York Session", icon: TrendingUp, time: "12:00 - 21:00 GMT", description: "Highest volatility, major news releases.", borderColor: "border-green-200 dark:border-green-800", textColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950/10", iconBg: "bg-green-500/15" },
  { value: "overlap", label: "London/NY Overlap", icon: Zap, time: "12:00 - 16:00 GMT", description: "Peak liquidity and momentum.", borderColor: "border-purple-200 dark:border-purple-800", textColor: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-950/10", iconBg: "bg-purple-500/15" },
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

// Convert a UTC/ISO timestamp to a local datetime-local string (YYYY-MM-DDTHH:mm)
const toLocalDatetimeString = (isoString: string | null | undefined): string => {
  if (!isoString) return ""
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ""
    // Build local YYYY-MM-DDTHH:mm from the Date object (which auto-converts to local)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ""
  }
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
      ...initialTrade as unknown as ExtendedTradeInput,
      date: typeof initialTrade.date === "string" ? initialTrade.date : new Date(initialTrade.date).toISOString().split("T")[0],
      account_id: initialTrade.account_id || "",
      // Convert stored UTC timestamps back to local datetime-local format for the input fields
      entry_time: toLocalDatetimeString(initialTrade.trade_start_time),
      exit_time: toLocalDatetimeString(initialTrade.trade_end_time),
    }
  }
  return baseState
}

// --- HELPERS ---

// Auto-detect trading session from entry time (GMT hours)
const detectSessionFromTime = (localDatetimeStr: string): string | undefined => {
  if (!localDatetimeStr) return undefined
  try {
    const d = new Date(localDatetimeStr)
    if (isNaN(d.getTime())) return undefined
    const gmtHour = d.getUTCHours()
    // Overlap takes priority: 12:00-16:00 GMT
    if (gmtHour >= 12 && gmtHour < 16) return "overlap"
    // New York: 16:00-21:00 GMT (after overlap)
    if (gmtHour >= 16 && gmtHour < 21) return "new-york"
    // London: 07:00-12:00 GMT (before overlap)
    if (gmtHour >= 7 && gmtHour < 12) return "london"
    // Asian: 21:00-06:00 GMT
    if (gmtHour >= 21 || gmtHour < 7) return "asian"
    return undefined
  } catch {
    return undefined
  }
}

// Get size unit label based on instrument category
const getSizeUnit = (instrumentSymbol: string, allInstruments: Array<{ symbol: string; category: string }>): string => {
  const inst = allInstruments.find(i => i.symbol === instrumentSymbol)
  if (!inst) return "Size"
  switch (inst.category) {
    case "futures": return "Contracts"
    case "forex": return "Lots"
    case "crypto": return "Coins"
    default: return "Units"
  }
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

const SessionCard = ({ session, isSelected, onSelect }: any) => {
  const Icon = session.icon
  return (
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
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", session.iconBg)}>
            <Icon className={cn("w-4.5 h-4.5", isSelected ? session.textColor : "text-muted-foreground")} />
          </div>
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
}

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
          <Icon className="w-3 h-3" /> {style.label}
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

// --- LIVE PnL / R:R SUMMARY BAR ---
const TradeSummaryBar = ({
  pnl,
  riskReward,
  direction,
  entryPrice,
  stopLoss,
  size,
}: {
  pnl: number | null
  riskReward: number | null
  direction: string
  entryPrice: number
  stopLoss: number
  size: number
}) => {
  const hasPrice = entryPrice > 0
  const hasPnl = pnl !== null && pnl !== 0
  const outcome = pnl === null ? null : pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "BE"

  // Calculate risk in dollars
  const riskDollars = (entryPrice && stopLoss && size)
    ? Math.abs(entryPrice - stopLoss) * size
    : null

  if (!hasPrice && !hasPnl) return null

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/30 dark:bg-[oklch(0.11_0.02_264)] backdrop-blur-sm">
      {/* Subtle top accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[2px] transition-colors duration-500",
        hasPnl
          ? pnl! > 0 ? "bg-emerald-500" : pnl! < 0 ? "bg-red-500" : "bg-muted-foreground/30"
          : "bg-border/50"
      )} />

      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/40">
        {/* PnL Cell */}
        <div className="px-4 py-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Est. P&L
          </span>
          <span className={cn(
            "font-mono text-lg font-black tracking-tight transition-colors duration-300",
            hasPnl
              ? pnl! > 0 ? "text-emerald-500" : pnl! < 0 ? "text-red-500" : "text-muted-foreground"
              : "text-muted-foreground/40"
          )}>
            {hasPnl ? (
              <>
                {pnl! > 0 ? "+" : ""}{pnl!.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </>
            ) : (
              "—"
            )}
          </span>
        </div>

        {/* Outcome Cell */}
        <div className="px-4 py-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
            {outcome === "WIN" ? <ArrowUpRight className="w-3 h-3" /> : outcome === "LOSS" ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            Outcome
          </span>
          <div className="flex items-center gap-2">
            {outcome ? (
              <span className={cn(
                "font-mono text-xs font-black px-2 py-0.5 rounded-md tracking-wider transition-colors duration-300",
                outcome === "WIN" && "bg-emerald-500/15 text-emerald-500 dark:bg-emerald-500/10",
                outcome === "LOSS" && "bg-red-500/15 text-red-500 dark:bg-red-500/10",
                outcome === "BE" && "bg-muted text-muted-foreground"
              )}>
                {outcome}
              </span>
            ) : (
              <span className="font-mono text-lg text-muted-foreground/40">—</span>
            )}
          </div>
        </div>

        {/* R:R Cell */}
        <div className="px-4 py-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
            <Scale className="w-3 h-3" /> Risk : Reward
          </span>
          <span className={cn(
            "font-mono text-lg font-black tracking-tight transition-colors duration-300",
            riskReward !== null
              ? riskReward >= 2 ? "text-emerald-500" : riskReward >= 1 ? "text-amber-500" : "text-red-500"
              : "text-muted-foreground/40"
          )}>
            {riskReward !== null ? (
              <>1 : {riskReward.toFixed(1)}</>
            ) : (
              "—"
            )}
          </span>
        </div>

        {/* Risk $ Cell */}
        <div className="px-4 py-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
            <Shield className="w-3 h-3" /> Risk
          </span>
          <span className={cn(
            "font-mono text-lg font-black tracking-tight transition-colors duration-300",
            riskDollars !== null ? "text-foreground" : "text-muted-foreground/40"
          )}>
            {riskDollars !== null ? (
              <>${riskDollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
            ) : (
              "—"
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

// --- PRE-SUBMIT REVIEW DIALOG ---
const TradeReviewDialog = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  data,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting: boolean
  data: {
    instrument: string
    direction: string
    entry_price: number
    exit_price: number
    stop_loss: number
    take_profit?: number | null
    size: number
    pnl: number | null
    riskReward: number | null
    session?: string
    strategy?: string
    mood?: string
    moodEmoji?: string
    goodHabitsCount: number
    badHabitsCount: number
    entry_time?: string
    exit_time?: string
  }
}) => {
  const outcome = data.pnl === null ? null : data.pnl > 0 ? "WIN" : data.pnl < 0 ? "LOSS" : "BE"
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtTime = (t?: string) => {
    if (!t) return null
    try {
      return new Date(t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    } catch { return null }
  }

  // Build smart nudges for missing optional fields
  const missingOptional: { label: string; hint: string }[] = []
  if (!data.stop_loss) missingOptional.push({ label: "Stop loss", hint: "helps track risk management" })
  if (!data.take_profit) missingOptional.push({ label: "Take profit", hint: "enables R:R tracking" })
  if (!data.strategy) missingOptional.push({ label: "Strategy", hint: "links to your playbook analytics" })
  if (!data.mood) missingOptional.push({ label: "Mood", hint: "powers psychology insights" })
  if (!data.session) missingOptional.push({ label: "Session", hint: "improves session-based analytics" })
  if (!data.entry_time && !data.exit_time) missingOptional.push({ label: "Entry/exit times", hint: "enables duration tracking" })

  const entryTimeFormatted = fmtTime(data.entry_time)
  const exitTimeFormatted = fmtTime(data.exit_time)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-card">
        {/* Top accent bar — color-coded by outcome */}
        <div className={cn(
          "h-1.5 w-full",
          outcome === "WIN" ? "bg-gradient-to-r from-emerald-400 to-emerald-600" :
          outcome === "LOSS" ? "bg-gradient-to-r from-red-400 to-red-600" :
          "bg-gradient-to-r from-muted-foreground/20 via-muted-foreground/40 to-muted-foreground/20"
        )} />

        {/* Hero section */}
        <div className="px-6 pt-5 pb-4">
          <DialogHeader className="space-y-0 mb-5">
            <DialogTitle className="sr-only">Trade Confirmation</DialogTitle>
            <DialogDescription className="sr-only">Review and confirm your trade details</DialogDescription>
          </DialogHeader>

          {/* Instrument + PnL hero */}
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-3xl font-black tracking-tighter leading-none">{data.instrument || "—"}</span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-md border",
                  data.direction === "long"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                )}>
                  {data.direction}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                {data.size} {data.size === 1 ? "unit" : "units"} &middot; {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>

            {/* PnL display */}
            <div className="text-right">
              {outcome && (
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full inline-block mb-1",
                  outcome === "WIN" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  outcome === "LOSS" && "bg-red-500/10 text-red-600 dark:text-red-400",
                  outcome === "BE" && "bg-muted text-muted-foreground"
                )}>
                  {outcome}
                </span>
              )}
              <div className={cn(
                "font-mono text-2xl font-black tracking-tight leading-none",
                data.pnl !== null
                  ? data.pnl > 0 ? "text-emerald-500" : data.pnl < 0 ? "text-red-500" : "text-muted-foreground"
                  : "text-muted-foreground/30"
              )}>
                {data.pnl !== null ? `${data.pnl > 0 ? "+" : ""}$${fmt(Math.abs(data.pnl))}` : "—"}
              </div>
              {data.riskReward !== null && (
                <p className={cn(
                  "text-[10px] font-mono font-bold mt-0.5",
                  data.riskReward >= 2 ? "text-emerald-500" : data.riskReward >= 1 ? "text-amber-500" : "text-red-400"
                )}>
                  1:{data.riskReward.toFixed(1)} R:R
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Price grid */}
        <div className="mx-6 rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-border/40">
            <div className="px-4 py-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground block mb-0.5">Entry</span>
              <span className="font-mono text-sm font-bold">${fmt(data.entry_price)}</span>
            </div>
            <div className="px-4 py-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground block mb-0.5">Exit</span>
              <span className="font-mono text-sm font-bold">${fmt(data.exit_price)}</span>
            </div>
          </div>
          {(data.stop_loss > 0 || (data.take_profit && data.take_profit > 0)) && (
            <div className="grid grid-cols-2 divide-x divide-border/40 border-t border-border/40">
              <div className="px-4 py-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground block mb-0.5">Stop Loss</span>
                <span className="font-mono text-sm font-bold text-red-500/80">{data.stop_loss ? `$${fmt(data.stop_loss)}` : "—"}</span>
              </div>
              <div className="px-4 py-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground block mb-0.5">Take Profit</span>
                <span className="font-mono text-sm font-bold text-emerald-500/80">{data.take_profit ? `$${fmt(data.take_profit)}` : "—"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Timing + context row */}
        {(entryTimeFormatted || exitTimeFormatted || data.session || data.strategy || data.mood) && (
          <div className="mx-6 mt-3 flex flex-wrap gap-2">
            {entryTimeFormatted && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 rounded-md px-2 py-1 border border-border/30">
                <Clock className="w-3 h-3" /> {entryTimeFormatted}
                {exitTimeFormatted && <> &rarr; {exitTimeFormatted}</>}
              </span>
            )}
            {data.session && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 rounded-md px-2 py-1 border border-border/30">
                <Globe className="w-3 h-3" /> {TRADING_SESSIONS.find(s => s.value === data.session)?.label || data.session}
              </span>
            )}
            {data.strategy && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 rounded-md px-2 py-1 border border-border/30">
                <BookOpen className="w-3 h-3" /> {data.strategy}
              </span>
            )}
            {data.mood && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 rounded-md px-2 py-1 border border-border/30">
                <Brain className="w-3 h-3" /> {data.mood}
              </span>
            )}
            {(data.goodHabitsCount > 0 || data.badHabitsCount > 0) && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted/50 rounded-md px-2 py-1 border border-border/30">
                {data.goodHabitsCount > 0 && <span className="text-emerald-500 font-bold">{data.goodHabitsCount} good</span>}
                {data.goodHabitsCount > 0 && data.badHabitsCount > 0 && <span className="text-muted-foreground/40">/</span>}
                {data.badHabitsCount > 0 && <span className="text-red-500 font-bold">{data.badHabitsCount} bad</span>}
              </span>
            )}
          </div>
        )}

        {/* Smart nudges for missing optional fields */}
        {missingOptional.length > 0 && (
          <div className="mx-6 mt-4 rounded-lg border border-border/30 bg-muted/10 p-3">
            <p className="text-[11px] text-muted-foreground mb-1.5">
              <span className="font-semibold text-foreground/70">Optional &mdash;</span> you can add these anytime, but they unlock deeper insights:
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {missingOptional.slice(0, 4).map(item => (
                <span key={item.label} className="text-[10px] text-muted-foreground/70">
                  <span className="font-medium text-muted-foreground">{item.label}</span> &middot; {item.hint}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="px-6 py-4 mt-2 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-11 rounded-xl border-border/60 text-muted-foreground hover:text-foreground"
          >
            Go Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              "flex-1 h-11 rounded-xl font-bold shadow-lg transition-all hover:shadow-xl hover:scale-[1.01]",
              outcome === "WIN"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                : outcome === "LOSS"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                : ""
            )}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Confirm Trade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
  const [badHabits, setBadHabits] = useState<string[]>([])
  const [goodHabits, setGoodHabits] = useState<string[]>([])
  const [psychologyCustomTags, setPsychologyCustomTags] = useState<string[]>([])
  const [psychologyCustomTagInput, setPsychologyCustomTagInput] = useState("")
  const [psychologyPreThoughts, setPsychologyPreThoughts] = useState("")
  const [psychologyPostThoughts, setPsychologyPostThoughts] = useState("")
  const [psychologyLessons, setPsychologyLessons] = useState("")

  // Review dialog + draft indicator
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null)
  const [hasDraftOnLoad, setHasDraftOnLoad] = useState(false)

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
          // Only restore if draft has meaningful data
          if (parsed.formData && (parsed.formData.instrument || parsed.formData.entry_price)) {
            setFormData(parsed.formData)
            if (parsed.activeTab) setActiveTab(parsed.activeTab)
            if (parsed.timestamp) {
              setDraftSavedAt(parsed.timestamp)
              setHasDraftOnLoad(true)
            }
          }
        } catch (e) { }
      }
    }
  }, [initialTradeData, mode])

  // Auto-Save Draft
  useEffect(() => {
    if (mode === "add") {
      const timer = setTimeout(() => {
        const now = Date.now()
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({ formData, activeTab, timestamp: now }))
        setDraftSavedAt(now)
        // Clear the "loaded draft" banner after first new save
        setHasDraftOnLoad(false)
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

  // *** AUTO-DETECT SESSION FROM ENTRY TIME ***
  useEffect(() => {
    if (formData.entry_time && !formData.tradeSession) {
      const detected = detectSessionFromTime(formData.entry_time)
      if (detected) {
        setFormData(prev => ({ ...prev, tradeSession: detected }))
      }
    }
  }, [formData.entry_time])

  // *** KEYBOARD SHORTCUTS ***
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl+Enter: submit from any tab
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        if (!isSubmitting) handleReviewOpen()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isSubmitting, formData, activeTab])

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

  // Instrument list (for size unit label)
  const allInstruments = useMemo(() => getAllAvailableInstruments(customInstruments), [customInstruments])
  const sizeUnit = useMemo(() => getSizeUnit(formData.instrument, allInstruments), [formData.instrument, allInstruments])

  // Tab completion checks
  const isSetupComplete = !!(formData.instrument && formData.direction && formData.entry_price && formData.exit_price && formData.size)
  const isStrategyComplete = !!(formData.playbook_strategy_id)
  const isPsychologyComplete = !!(psychologyMood)

  // Discard draft
  const discardDraft = useCallback(() => {
    localStorage.removeItem(FORM_STORAGE_KEY)
    setFormData(getInitialFormState())
    setActiveTab("setup")
    setDraftSavedAt(null)
    setHasDraftOnLoad(false)
  }, [])

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
  const toggleBadHabit = (id: string) => setBadHabits((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleGoodHabit = (id: string) => setGoodHabits((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  // Validate and open review dialog (or submit directly if already in dialog)
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    const missingFields: string[] = []

    if (!formData.instrument) { newErrors.instrument = "Required"; missingFields.push("Instrument") }
    if (!formData.direction) { newErrors.direction = "Required"; missingFields.push("Direction (Long/Short)") }
    if (!formData.entry_price) { newErrors.entry_price = "Required"; missingFields.push("Entry Price") }
    if (!formData.exit_price) { newErrors.exit_price = "Required"; missingFields.push("Exit Price") }
    if (!formData.size) { newErrors.size = "Required"; missingFields.push("Position Size") }
    if (!formData.account_id && tradingAccounts.length > 0) { newErrors.account_id = "Please select an account"; missingFields.push("Trading Account") }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const handleReviewOpen = () => {
    if (validateForm()) {
      setShowReviewDialog(true)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // *** CRITICAL FIX: AGGREGATE PSYCHOLOGY FACTORS INTO TRADE DATA ***
      // This ensures the analytics page (which reads 'trades.psychology_factors') works correctly.
      const combinedBadFactors = [
        psychologyMood ? `Mood: ${MOODS.find(m => m.id === psychologyMood)?.label}` : null,
        ...psychologyTriggers.map(id => EMOTIONAL_TRIGGERS.find(t => t.id === id)?.label),
        ...psychologyPatterns.map(id => BEHAVIORAL_PATTERNS.find(p => p.id === id)?.label),
        ...badHabits.map(id => BAD_HABITS.find(h => h.id === id)?.name),
        ...psychologyCustomTags
      ].filter(Boolean) as string[];

      const combinedGoodFactors = [
        ...goodHabits.map(id => GOOD_HABITS.find(h => h.id === id)?.name),
      ].filter(Boolean) as string[];

      // CRITICAL: Convert datetime-local strings to UTC ISO strings ON THE CLIENT.
      // datetime-local inputs give strings like "2026-02-10T16:30" with NO timezone info.
      // new Date() on the CLIENT correctly interprets these as the user's local time.
      // If we let the server do this conversion, it would use UTC as "local", causing a double-offset.
      const entryTimeUTC = formData.entry_time
        ? new Date(formData.entry_time).toISOString()
        : formData.entry_time
      const exitTimeUTC = formData.exit_time
        ? new Date(formData.exit_time).toISOString()
        : formData.exit_time

      const submissionData = {
        ...formData,
        entry_time: entryTimeUTC,
        exit_time: exitTimeUTC,
        pnl: formData.pnl || pnlResult || 0,
        psychologyFactors: combinedBadFactors, // Inject bad habits into trade payload
        goodHabits: combinedGoodFactors // Add good habits separately
      }

      const result = await onSubmitTrade(submissionData)

      if (result.success && result.tradeId) {
        // Also log to the detailed psychology journal if needed for granular tracking
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
        setShowReviewDialog(false)
        router.push("/dashboard")
      } else {
        setShowReviewDialog(false)
        toast({ title: "Error", description: result.error || "Failed to save", variant: "destructive" })
      }
    } catch (err) {
      console.error(err)
      setShowReviewDialog(false)
      toast({ title: "Error", description: "Unexpected error", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  // Determine header button color from PnL
  const submitBtnClass = pnlResult !== null && pnlResult !== 0
    ? pnlResult > 0
      ? "rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
      : "rounded-full px-6 bg-red-600 hover:bg-red-700 text-white"
    : "rounded-full px-6 bg-gradient-to-r from-primary to-purple-600"

  return (
    <div className="min-h-screen bg-background/95 pb-24">
      {/* Review Dialog */}
      <TradeReviewDialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        onConfirm={() => handleSubmit()}
        isSubmitting={isSubmitting}
        data={{
          instrument: formData.instrument,
          direction: formData.direction,
          entry_price: formData.entry_price || 0,
          exit_price: formData.exit_price || 0,
          stop_loss: formData.stop_loss || 0,
          take_profit: formData.take_profit,
          size: formData.size || 0,
          pnl: pnlResult,
          riskReward: riskRewardRatio,
          session: formData.tradeSession,
          strategy: formData.setupName || undefined,
          mood: MOODS.find(m => m.id === psychologyMood)?.label,
          moodEmoji: MOODS.find(m => m.id === psychologyMood)?.emoji,
          goodHabitsCount: goodHabits.length,
          badHabitsCount: badHabits.length,
          entry_time: formData.entry_time,
          exit_time: formData.exit_time,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight">{mode === "edit" ? "Edit Trade" : "New Trade Entry"}</h1>
              {/* Draft saved indicator */}
              {mode === "add" && draftSavedAt && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 -mt-0.5">
                  <Cloud className="w-3 h-3" /> Draft saved
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              {"\u2318"}+Enter to submit
            </span>
            <Button onClick={handleReviewOpen} disabled={isSubmitting} className={submitBtnClass}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Log Trade
            </Button>
          </div>
        </div>
      </header>

      {/* Draft resume banner */}
      {hasDraftOnLoad && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4">
          <div className="container flex items-center justify-between">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              Resuming draft from {draftSavedAt ? new Date(draftSavedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "earlier"}
            </p>
            <Button variant="ghost" size="sm" className="h-6 text-xs text-amber-700 dark:text-amber-300 hover:text-red-600" onClick={discardDraft}>
              <X className="w-3 h-3 mr-1" /> Discard
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* MAIN FORM COLUMN */}
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-center mb-8">
              <TabsList className="h-14 p-1 bg-muted/50 backdrop-blur-sm rounded-2xl border border-border/50 w-full max-w-2xl grid grid-cols-3 shadow-sm">
                <TabsTrigger value="setup" className="rounded-xl text-sm font-semibold gap-1.5">
                  {isSetupComplete && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  1. Setup & Entry
                </TabsTrigger>
                <TabsTrigger value="strategy" className="rounded-xl text-sm font-semibold gap-1.5">
                  {isStrategyComplete && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  2. Strategy
                </TabsTrigger>
                <TabsTrigger value="psychology" className="rounded-xl text-sm font-semibold gap-1.5">
                  {isPsychologyComplete && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  3. Psychology
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: SETUP */}
            <TabsContent value="setup" className="space-y-8">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Instrument & Account</CardTitle></CardHeader>
                <CardContent className="space-y-6">

                  {/* --- ACCOUNT SELECTOR --- */}
                  {tradingAccounts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <Wallet className="w-3 h-3" /> Select Account
                      </Label>
                      <Select
                        value={formData.account_id || ""}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, account_id: val }))}
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
                  <ScrollArea className={cn("h-[200px] w-full rounded-xl border bg-muted/10 p-4", errors.instrument && "border-red-500 ring-2 ring-red-500/20")}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {getAllAvailableInstruments(customInstruments).filter(i => !searchQuery || i.symbol.toLowerCase().includes(searchQuery.toLowerCase())).map(inst => (
                        <button key={inst.symbol} type="button" onClick={() => setFormData(prev => ({ ...prev, instrument: inst.symbol }))} className={cn("flex flex-col items-start p-3 rounded-xl border transition-all text-left", formData.instrument === inst.symbol ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border/40 bg-background")}>
                          <span className="font-bold text-sm">{inst.symbol}</span>
                          <span className="text-[10px] text-muted-foreground">{inst.name}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                  {errors.instrument && <p className="text-xs text-red-500 mt-2 animate-in slide-in-from-top-1">{errors.instrument}</p>}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Crosshair className="w-5 h-5 text-primary" /> Execution</CardTitle></CardHeader>
                <CardContent className="space-y-8">
                  <div className={cn("grid grid-cols-2 gap-4 p-1 bg-muted/50 rounded-2xl", errors.direction && "ring-2 ring-red-500/20 border border-red-500")}>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, direction: 'long' }))} className={cn("flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all", formData.direction === 'long' ? "bg-emerald-500 text-white shadow-lg" : "text-muted-foreground hover:bg-emerald-500/10")}>Long</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, direction: 'short' }))} className={cn("flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all", formData.direction === 'short' ? "bg-rose-500 text-white shadow-lg" : "text-muted-foreground hover:bg-rose-500/10")}>Short</button>
                  </div>
                  {errors.direction && <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1">{errors.direction}</p>}

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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PriceInput id="entry_price" label="Entry Price" value={formData.entry_price} onChange={handleChange} icon={MousePointer} color="text-primary" />
                    <PriceInput id="exit_price" label="Exit Price" value={formData.exit_price} onChange={handleChange} icon={Target} color="text-blue-500" />
                    <PriceInput id="stop_loss" label="Stop Loss" value={formData.stop_loss} onChange={handleChange} icon={Shield} color="text-rose-500" />
                    <PriceInput id="take_profit" label="Take Profit" value={formData.take_profit} onChange={handleChange} icon={TrendingUp} color="text-emerald-500" />
                  </div>
                  {errors.exit_price && <p className="text-xs text-red-500 animate-in slide-in-from-top-1">{errors.exit_price}</p>}

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" /> Position Size
                        {formData.instrument && <span className="normal-case text-[10px] font-normal text-muted-foreground/70">({sizeUnit})</span>}
                      </Label>
                      <Input type="number" name="size" value={formData.size || ""} onChange={handleChange} placeholder="0" className={cn("h-12 bg-background border-2 font-mono text-lg", errors.size && "border-red-500 ring-2 ring-red-500/20")} />
                      {errors.size && <p className="text-xs text-red-500 animate-in slide-in-from-top-1">{errors.size}</p>}
                    </div>
                  </div>

                  {/* Live PnL / R:R Summary */}
                  <TradeSummaryBar
                    pnl={pnlResult}
                    riskReward={riskRewardRatio}
                    direction={formData.direction}
                    entryPrice={formData.entry_price || 0}
                    stopLoss={formData.stop_loss || 0}
                    size={formData.size || 0}
                  />

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><Clock className="w-3 h-3" /> Session</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {TRADING_SESSIONS.map(session => (
                        <SessionCard key={session.value} session={session} isSelected={formData.tradeSession === session.value} onSelect={() => setFormData(prev => ({ ...prev, tradeSession: session.value }))} />
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t p-4 flex justify-end"><Button size="lg" onClick={() => setActiveTab("strategy")} className="rounded-xl px-8">Next <ChevronRight className="ml-2 w-4 h-4" /></Button></CardFooter>
              </Card>
            </TabsContent>

            {/* TAB 2: STRATEGY (Unchanged Logic, just visual) */}
            <TabsContent value="strategy" className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Strategy & Confluences</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("setup")}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
              </div>

              {strategies.length === 0 && (
                <Card className="border-2 border-amber-500/50 bg-amber-50/10 dark:bg-amber-950/10">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-amber-900 dark:text-amber-100">No Playbook Strategies Found</CardTitle>
                        <CardDescription className="text-amber-700 dark:text-amber-300 mt-1">
                          You need to create at least one strategy in your playbook before adding trades.
                          Strategies help you track which setups work best for your trading style.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="bg-amber-50/30 dark:bg-amber-950/20 border-t border-amber-200/30 dark:border-amber-800/30 flex gap-3">
                    <Button
                      variant="default"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => router.push("/playbook")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Strategy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("setup")}
                    >
                      Go Back
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {strategies.length > 0 && renderSection("Select Strategy", BookOpen,
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
                                  <GitBranch className="w-3 h-3" /> Active Setups
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
                                  <Database className="w-3 h-3" /> Confluence Checklist
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

              {strategies.length > 0 && (
                <Card className="border-0 shadow-md bg-card">
                  <CardContent className="p-6">
                    <Label className="mb-3 block font-bold text-sm uppercase text-muted-foreground">Trade Narrative</Label>
                    <Input value={formData.setupName || ""} onChange={handleChange} name="setupName" className="h-12 text-lg bg-muted/30 border-2" placeholder="e.g. London Silver Bullet..." />
                  </CardContent>
                  <CardFooter className="bg-muted/20 border-t p-4 flex justify-end">
                    <Button
                      size="lg"
                      onClick={() => setActiveTab("psychology")}
                      className="rounded-xl px-8"
                    >
                      Next <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            {/* TAB 3: PSYCHOLOGY */}
            <TabsContent value="psychology" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Psychology</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("strategy")}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
              </div>

              {/* Mood — always visible */}
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> Emotional State</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                    {MOODS.map(m => (
                      <button key={m.id} type="button" onClick={() => setPsychologyMood(m.id)} className={cn("flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:scale-105", psychologyMood === m.id ? m.color : "border-transparent bg-muted/30 hover:bg-muted")}>
                        <span className="text-2xl mb-1">{m.emoji}</span>
                        <span className="text-xs font-bold">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Collapsible sections */}
              <Accordion type="multiple" defaultValue={["habits"]} className="space-y-4">
                {/* Habits (good + bad combined) */}
                <AccordionItem value="habits" className="border rounded-xl overflow-hidden bg-card shadow-sm">
                  <AccordionTrigger className="px-5 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-2 text-base font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Habits
                      {(goodHabits.length > 0 || badHabits.length > 0) && (
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          ({goodHabits.length} good, {badHabits.length} bad)
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 space-y-5">
                    {/* Good */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-emerald-500/10 rounded">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Good Habits</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {GOOD_HABITS.map(h => (
                          <Badge
                            key={h.id}
                            variant={goodHabits.includes(h.id) ? "default" : "outline"}
                            className={cn(
                              "cursor-pointer px-3 py-1.5 transition-all hover:scale-105",
                              goodHabits.includes(h.id)
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-sm"
                                : "hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/50"
                            )}
                            onClick={() => toggleGoodHabit(h.id)}
                          >
                            {h.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    {/* Bad */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-red-500/10 rounded">
                          <Ban className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-sm font-semibold text-red-900 dark:text-red-100">Bad Habits</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {BAD_HABITS.map(h => (
                          <Badge
                            key={h.id}
                            variant={badHabits.includes(h.id) ? "destructive" : "outline"}
                            className={cn(
                              "cursor-pointer px-3 py-1.5 transition-all hover:scale-105",
                              badHabits.includes(h.id)
                                ? "bg-red-500 hover:bg-red-600 text-white border-transparent shadow-sm"
                                : "hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/50"
                            )}
                            onClick={() => toggleBadHabit(h.id)}
                          >
                            {h.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Pre/Post Trade Thoughts */}
                <AccordionItem value="thoughts" className="border rounded-xl overflow-hidden bg-card shadow-sm">
                  <AccordionTrigger className="px-5 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-2 text-base font-bold">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Trade Notes
                      {(psychologyPreThoughts || formData.notes) && (
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          (filled)
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Pre-Trade Mindset</Label>
                        <Textarea value={psychologyPreThoughts} onChange={(e) => setPsychologyPreThoughts(e.target.value)} className="min-h-[120px] bg-muted/10 border-2" placeholder="Mindset before entering..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Post-Trade Notes</Label>
                        <Textarea name="notes" value={formData.notes || ""} onChange={handleChange} className="min-h-[120px] bg-muted/10 border-2" placeholder="Result breakdown..." />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Tags */}
                <AccordionItem value="tags" className="border rounded-xl overflow-hidden bg-card shadow-sm">
                  <AccordionTrigger className="px-5 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-2 text-base font-bold">
                      <Plus className="w-4 h-4 text-muted-foreground" />
                      Custom Tags
                      {psychologyCustomTags.length > 0 && (
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          ({psychologyCustomTags.length})
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 space-y-3">
                    <div className="flex gap-2">
                      <Input value={psychologyCustomTagInput} onChange={(e) => setPsychologyCustomTagInput(e.target.value)} className="max-w-xs" placeholder="Add tag..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPsychologyCustomTag())} />
                      <Button type="button" variant="secondary" onClick={addPsychologyCustomTag}><Plus className="w-4 h-4" /></Button>
                    </div>
                    {psychologyCustomTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {psychologyCustomTags.map(t => (
                          <Badge key={t} variant="secondary" onClick={() => removePsychologyCustomTag(t)} className="cursor-pointer hover:bg-destructive/20">{t} &times;</Badge>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Screenshots */}
                <AccordionItem value="screenshots" className="border rounded-xl overflow-hidden bg-card shadow-sm">
                  <AccordionTrigger className="px-5 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-2 text-base font-bold">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      Screenshots
                      {(formData.screenshotBeforeUrl || formData.screenshotAfterUrl) && (
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          (attached)
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Before</Label>
                        <Input placeholder="https://..." name="screenshotBeforeUrl" value={formData.screenshotBeforeUrl || ""} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">After</Label>
                        <Input placeholder="https://..." name="screenshotAfterUrl" value={formData.screenshotAfterUrl || ""} onChange={handleChange} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-end pt-4">
                <Button onClick={handleReviewOpen} disabled={isSubmitting} size="lg" className={cn("w-full md:w-auto px-12 rounded-xl text-lg shadow-xl transition-transform hover:scale-105", submitBtnClass)}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                  Log Trade
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export { TradeForm }
export type { TradeFormProps }
export default TradeForm

