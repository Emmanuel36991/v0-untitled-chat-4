import {
  CandlestickChart, Clock, Activity, Layers, Ban, ListChecks,
  Globe, TrendingUp, Zap
} from "lucide-react"

export const FORM_STORAGE_KEY = "trade_form_draft"

export const FACTOR_STYLES = {
  price: { label: "Price Action", icon: CandlestickChart, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  time: { label: "Time/Session", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  indicator: { label: "Indicator", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  structure: { label: "Structure", icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  execution: { label: "Invalidation", icon: Ban, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  default: { label: "Rule", icon: ListChecks, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" }
} as const

export const MOODS = [
  { id: "euphoric", label: "Euphoric", emoji: "🤩", color: "text-green-600 bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800" },
  { id: "confident", label: "Confident", emoji: "😎", color: "text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" },
  { id: "focused", label: "Focused", emoji: "🎯", color: "text-purple-600 bg-purple-100 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700" },
  { id: "cautious", label: "Cautious", emoji: "🤔", color: "text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" },
  { id: "frustrated", label: "Frustrated", emoji: "😤", color: "text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800" },
  { id: "anxious", label: "Anxious", emoji: "😰", color: "text-red-600 bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800" },
]

export const TRADING_SESSIONS = [
  { value: "asian", label: "Asian Session", icon: Globe, time: "21:00 - 06:00 GMT", description: "Lower volatility, range-bound markets.", borderColor: "border-orange-200 dark:border-orange-800", textColor: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-950/10", iconBg: "bg-orange-500/15" },
  { value: "london", label: "London Session", icon: Layers, time: "07:00 - 16:00 GMT", description: "High volume, trend establishment.", borderColor: "border-blue-200 dark:border-blue-800", textColor: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/10", iconBg: "bg-blue-500/15" },
  { value: "new-york", label: "New York Session", icon: TrendingUp, time: "12:00 - 21:00 GMT", description: "Highest volatility, major news releases.", borderColor: "border-green-200 dark:border-green-800", textColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950/10", iconBg: "bg-green-500/15" },
  { value: "overlap", label: "London/NY Overlap", icon: Zap, time: "12:00 - 16:00 GMT", description: "Peak liquidity and momentum.", borderColor: "border-purple-200 dark:border-purple-800", textColor: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-950/10", iconBg: "bg-purple-500/15" },
]

export const EMOTIONAL_TRIGGERS = [
  { id: "large-loss", label: "Large Loss" },
  { id: "consecutive-losses", label: "Consecutive Losses" },
  { id: "time-pressure", label: "Time Pressure" },
  { id: "missed-opportunity", label: "Missing Opportunity" },
  { id: "market-volatility", label: "Market Volatility" },
  { id: "overconfidence", label: "Overconfidence" },
]

export const BEHAVIORAL_PATTERNS = [
  { id: "overtrading", label: "Overtrading" },
  { id: "averaging-down", label: "Averaging Down" },
  { id: "cutting-winners", label: "Cutting Winners Early" },
  { id: "ignoring-stops", label: "Ignoring Stop Losses" },
  { id: "revenge-trading", label: "Revenge Trading" },
  { id: "fomo-trading", label: "FOMO Trading" },
]
