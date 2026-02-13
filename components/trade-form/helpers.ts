import type { Trade, NewTradeInput } from "@/types"

export interface ExtendedTradeInput extends NewTradeInput {
  entry_time?: string;
  exit_time?: string;
}

// Convert a UTC/ISO timestamp to a local datetime-local string (YYYY-MM-DDTHH:mm)
export const toLocalDatetimeString = (isoString: string | null | undefined): string => {
  if (!isoString) return ""
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ""
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

export const getInitialFormState = (initialTrade?: Trade): ExtendedTradeInput => {
  const baseState: ExtendedTradeInput = {
    date: new Date().toISOString().split("T")[0],
    instrument: "",
    account_id: "",
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
    smc_market_structure: [],
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
      entry_time: toLocalDatetimeString(initialTrade.trade_start_time),
      exit_time: toLocalDatetimeString(initialTrade.trade_end_time),
    }
  }
  return baseState
}

// Auto-detect trading session from entry time (GMT hours)
export const detectSessionFromTime = (localDatetimeStr: string): string | undefined => {
  if (!localDatetimeStr) return undefined
  try {
    const d = new Date(localDatetimeStr)
    if (isNaN(d.getTime())) return undefined
    const gmtHour = d.getUTCHours()
    if (gmtHour >= 12 && gmtHour < 16) return "overlap"
    if (gmtHour >= 16 && gmtHour < 21) return "new-york"
    if (gmtHour >= 7 && gmtHour < 12) return "london"
    if (gmtHour >= 21 || gmtHour < 7) return "asian"
    return undefined
  } catch {
    return undefined
  }
}

// Get size unit label based on instrument category
export const getSizeUnit = (instrumentSymbol: string, allInstruments: Array<{ symbol: string; category: string }>): string => {
  const inst = allInstruments.find(i => i.symbol === instrumentSymbol)
  if (!inst) return "Size"
  switch (inst.category) {
    case "futures": return "Contracts"
    case "forex": return "Lots"
    case "crypto": return "Coins"
    default: return "Units"
  }
}
