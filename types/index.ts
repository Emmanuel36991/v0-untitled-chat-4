export type TradeOutcome = "win" | "loss" | "breakeven"

// --- PLAYBOOK TYPES ---
export type StrategyPhase = "setup" | "confirmation" | "execution" | "management"

export interface StrategyRule {
  id: string
  text: string
  phase: StrategyPhase
  required: boolean
}

export interface PlaybookStrategy {
  id: string
  user_id: string
  name: string
  description: string | null
  rules: StrategyRule[] // Stored as JSONB in DB
  win_rate: number
  profit_factor: number
  trades_count: number
  pnl: number
  tags: string[]
  equity_curve: number[]
  created_at: string
}

// --- TRADE INTERFACE (Unified) ---
export interface Trade {
  id: string
  user_id: string
  date: string
  instrument: string
  direction: "long" | "short"
  entry_price: number
  exit_price: number
  stop_loss: number
  take_profit?: number | null
  size: number
  outcome: TradeOutcome
  pnl: number
  risk_reward_ratio?: string | null
  setup_name?: string | null
  notes?: string | null
  created_at: Date
  updated_at: Date
  screenshot_before_url?: string | null
  screenshot_after_url?: string | null

  // *** THE UNIFIED ENGINE FIELDS ***
  // These are now the primary way we track what strategy was used and what rules were followed.
  playbook_strategy_id?: string | null
  executed_rules?: string[] | null // Array of Rule IDs checked

  // Legacy/Fallback fields (Optional, kept for backward compatibility if needed)
  duration_minutes?: number | null
  trade_session?: string | null
  trade_start_time?: string | null
  trade_end_time?: string | null
  precise_duration_minutes?: number | null

  // Legacy Arrays (Kept optional to prevent build errors during migration, but UI will ignore them)
  smc_market_structure?: string[] | null
  smc_order_blocks?: string[] | null
  smc_fvg?: string[] | null
  smc_fvg_classic?: string[] | null
  smc_fvg_ifvg?: string[] | null
  smc_liquidity_concepts?: string[] | null
  smc_breaker_mitigation_blocks?: string[] | null
  smc_mitigation_fill_zones?: string[] | null
  smc_wyckoff_overlaps?: string[] | null

  ict_market_structure_shift?: string[] | null
  ict_order_flow_blocks?: string[] | null
  ict_liquidity_pools_stops?: string[] | null
  ict_kill_zones?: string[] | null
  ict_ote?: string[] | null
  ict_fibonacci_clusters?: string[] | null
  ict_power_of_three?: string[] | null
  ict_smt_divergence?: string[] | null
  ict_daily_bias_session_dynamics?: string[] | null
  ict_entry_model?: string[] | null
  ict_liquidity_concepts?: string[] | null
  ict_market_structure?: string[] | null
  ict_time_and_price?: string[] | null
  ict_bias_context?: string[] | null
  ict_liquidity_events?: string[] | null
  ict_fibonacci_levels?: string[] | null
  ict_price_action_patterns?: string[] | null
  ict_confluence?: string[] | null

  wyckoff_price_volume?: string[] | null
  wyckoff_phases?: string[] | null
  wyckoff_composite_man?: string[] | null
  wyckoff_spring_upthrust?: string[] | null
  wyckoff_cause_effect?: string[] | null
  wyckoff_sr?: string[] | null
  wyckoff_effort_result?: string[] | null

  volume_spikes_clusters?: string[] | null
  volume_profile_market_profile?: string[] | null
  volume_trends?: string[] | null
  volume_obv_ad?: string[] | null
  volume_imbalance?: string[] | null

  sr_horizontal_levels?: string[] | null
  sr_dynamic?: string[] | null
  sr_supply_demand_zones?: string[] | null
  sr_flip?: string[] | null
  sr_confluence_zones?: string[] | null
  sr_micro_macro?: string[] | null
  sr_order_flow?: string[] | null
  support_resistance_used?: string[] | null

  psychology_factors?: string[] | null
  good_habits?: string[] | null
}

export type NewTradeInput = Omit<
  Trade,
  "id" | "user_id" | "pnl" | "outcome" | "created_at" | "updated_at" | "risk_reward_ratio"
> & {
  pnl?: number | null
  outcome?: TradeOutcome

  // Form specific fields
  setupName?: string | null
  screenshotBeforeUrl?: string | null
  screenshotAfterUrl?: string | null

  durationMinutes?: number | null
  tradeSession?: string | null
  tradeStartTime?: string | null
  tradeEndTime?: string | null
  preciseDurationMinutes?: number | null

  psychologyFactors?: string[] | null
  goodHabits?: string[] | null
}

// --- ANALYTICS TYPES ---
export interface DurationAnalytics {
  durationCategory: string
  totalTrades: number
  winCount: number
  lossCount: number
  winRate: number
  avgPnl: number
}

export interface SessionAnalytics {
  sessionName: string
  totalTrades: number
  winCount: number
  lossCount: number
  winRate: number
  avgPnl: number
}

// --- CHART AND INDICATOR TYPES ---
export interface IndicatorParam {
  type: "number" | "color" | "boolean" | "select"
  label: string
  defaultValue: any
  min?: number
  max?: number
  step?: number
  options?: string[]
}

export interface IndicatorDefinition {
  id: string
  label: string
  params: Record<string, IndicatorParam>
}

export interface ActiveIndicator {
  id: string
  type: string
  label: string
  params: Record<string, any>
  seriesIds?: string[]
}

export interface Strategy {
  id: string
  name: string
  description: string
  indicators: Array<{
    type: string
    label: string
    params: Record<string, any>
  }>
}

export interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// --- AVAILABLE INDICATORS ---
export const AVAILABLE_INDICATORS: Record<string, IndicatorDefinition> = {
  MA: {
    id: "MA",
    label: "Moving Average",
    params: {
      period: {
        type: "number",
        label: "Period",
        defaultValue: 20,
        min: 1,
        max: 200,
        step: 1,
      },
      color: {
        type: "color",
        label: "Color",
        defaultValue: "#2196F3",
      },
    },
  },
  EMA: {
    id: "EMA",
    label: "Exponential Moving Average",
    params: {
      period: {
        type: "number",
        label: "Period",
        defaultValue: 20,
        min: 1,
        max: 200,
        step: 1,
      },
      color: {
        type: "color",
        label: "Color",
        defaultValue: "#FF9800",
      },
    },
  },
  RSI: {
    id: "RSI",
    label: "Relative Strength Index",
    params: {
      period: {
        type: "number",
        label: "Period",
        defaultValue: 14,
        min: 2,
        max: 50,
        step: 1,
      },
      overbought: {
        type: "number",
        label: "Overbought Level",
        defaultValue: 70,
        min: 50,
        max: 100,
        step: 1,
      },
      oversold: {
        type: "number",
        label: "Oversold Level",
        defaultValue: 30,
        min: 0,
        max: 50,
        step: 1,
      },
      color: {
        type: "color",
        label: "Color",
        defaultValue: "#9C27B0",
      },
    },
  },
  BOLLINGER: {
    id: "BOLLINGER",
    label: "Bollinger Bands",
    params: {
      period: {
        type: "number",
        label: "Period",
        defaultValue: 20,
        min: 2,
        max: 100,
        step: 1,
      },
      stdDev: {
        type: "number",
        label: "Standard Deviations",
        defaultValue: 2,
        min: 1,
        max: 3,
        step: 0.5,
      },
      color: {
        type: "color",
        label: "Color",
        defaultValue: "#4CAF50",
      },
    },
  },
  MACD: {
    id: "MACD",
    label: "MACD",
    params: {
      fastPeriod: {
        type: "number",
        label: "Fast Period",
        defaultValue: 12,
        min: 2,
        max: 50,
        step: 1,
      },
      slowPeriod: {
        type: "number",
        label: "Slow Period",
        defaultValue: 26,
        min: 2,
        max: 100,
        step: 1,
      },
      signalPeriod: {
        type: "number",
        label: "Signal Period",
        defaultValue: 9,
        min: 2,
        max: 50,
        step: 1,
      },
      color: {
        type: "color",
        label: "Color",
        defaultValue: "#F44336",
      },
    },
  },
}

// --- BACKTESTING TYPES ---
export interface BacktestParams {
  instrument: string
  strategyId: string
  timeframe: string
  startDate: string
  endDate: string
  initialCapital: number
  strategyParams?: Record<string, any>
  riskFreeRate?: number
  stopLossPercent?: number
  takeProfitPercent?: number
}

export interface BacktestTrade {
  entryTime: string
  exitTime: string
  direction: "long" | "short"
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPercent: number
  outcome: "win" | "loss" | "breakeven"
}

export interface EquityDataPoint {
  time: string
  equity: number
}

export interface DrawdownPoint {
  time: string
  drawdown: number
}

export interface PnlDistributionPoint {
  range: string
  count: number
}

export interface BacktestResults {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnl: number
  totalPnlPercent: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  maxDrawdownPercent: number
  finalEquity: number
  trades: BacktestTrade[]
  equityCurve: EquityDataPoint[]
  drawdownCurve: DrawdownPoint[]
  pnlDistribution: PnlDistributionPoint[]
  logs: string[]
}

export interface BacktestStrategyDefinition {
  id: string
  name: string
  description: string
  params: Record<string, IndicatorParam>
}

// --- AVAILABLE BACKTEST STRATEGIES ---
export const AVAILABLE_BACKTEST_STRATEGIES: BacktestStrategyDefinition[] = [
  {
    id: "sma_crossover",
    name: "SMA Crossover",
    description: "Buy when fast SMA crosses above slow SMA, sell when it crosses below",
    params: {
      shortMAPeriod: {
        type: "number",
        label: "Fast SMA Period",
        defaultValue: 10,
        min: 2,
        max: 50,
        step: 1,
      },
      longMAPeriod: {
        type: "number",
        label: "Slow SMA Period",
        defaultValue: 20,
        min: 5,
        max: 200,
        step: 1,
      },
    },
  },
  {
    id: "rsi_threshold",
    name: "RSI Threshold",
    description: "Buy when RSI crosses below oversold, sell when it crosses above overbought",
    params: {
      rsiPeriod: {
        type: "number",
        label: "RSI Period",
        defaultValue: 14,
        min: 2,
        max: 50,
        step: 1,
      },
      oversoldThreshold: {
        type: "number",
        label: "Oversold Threshold",
        defaultValue: 30,
        min: 10,
        max: 40,
        step: 1,
      },
      overboughtThreshold: {
        type: "number",
        label: "Overbought Threshold",
        defaultValue: 70,
        min: 60,
        max: 90,
        step: 1,
      },
    },
  },
  {
    id: "bollinger_breakout",
    name: "Bollinger Band Breakout",
    description: "Buy when price breaks above upper band, sell when it breaks below lower band",
    params: {
      period: {
        type: "number",
        label: "BB Period",
        defaultValue: 20,
        min: 5,
        max: 100,
        step: 1,
      },
      stdDev: {
        type: "number",
        label: "Standard Deviations",
        defaultValue: 2,
        min: 1,
        max: 3,
        step: 0.5,
      },
    },
  },
  {
    id: "macd_crossover",
    name: "MACD Crossover",
    description: "Buy when MACD crosses above signal, sell when it crosses below",
    params: {
      fastPeriod: {
        type: "number",
        label: "Fast Period",
        defaultValue: 12,
        min: 2,
        max: 50,
        step: 1,
      },
      slowPeriod: {
        type: "number",
        label: "Slow Period",
        defaultValue: 26,
        min: 5,
        max: 100,
        step: 1,
      },
      signalPeriod: {
        type: "number",
        label: "Signal Period",
        defaultValue: 9,
        min: 2,
        max: 50,
        step: 1,
      },
    },
  },
]

// --- CONSTANTS ---
// Psychology is still useful as a generic list
export interface ChecklistItem {
  id: string
  name: string
  category: "Psychology"
}

// Bad Habits / Negative Psychological Factors
export const BAD_HABITS: ChecklistItem[] = [
  { id: "bad_distracted", name: "Distracted", category: "Psychology" },
  { id: "bad_emotional", name: "Emotional/Impulsive", category: "Psychology" },
  { id: "bad_revenge", name: "Revenge Trading", category: "Psychology" },
  { id: "bad_fomo", name: "FOMO (Fear of Missing Out)", category: "Psychology" },
  { id: "bad_overtrading", name: "Overtrading", category: "Psychology" },
  { id: "bad_ignored_plan", name: "Ignored Trading Plan", category: "Psychology" },
  { id: "bad_moved_sl", name: "Moved Stop Loss", category: "Psychology" },
  { id: "bad_oversized", name: "Position Too Large", category: "Psychology" },
  { id: "bad_tired", name: "Fatigued/Tired", category: "Psychology" },
  { id: "bad_stressed", name: "Stressed/Anxious", category: "Psychology" },
]

// Good Habits / Positive Psychological Factors
export const GOOD_HABITS: ChecklistItem[] = [
  { id: "good_well_rested", name: "Well Rested", category: "Psychology" },
  { id: "good_focused", name: "Focused & Alert", category: "Psychology" },
  { id: "good_followed_plan", name: "Followed Trading Plan", category: "Psychology" },
  { id: "good_patient", name: "Patient Entry", category: "Psychology" },
  { id: "good_disciplined", name: "Disciplined Risk Management", category: "Psychology" },
  { id: "good_calm", name: "Calm & Composed", category: "Psychology" },
  { id: "good_proper_sizing", name: "Proper Position Sizing", category: "Psychology" },
  { id: "good_stuck_to_sl", name: "Stuck to Stop Loss", category: "Psychology" },
  { id: "good_took_profit", name: "Took Profit at Target", category: "Psychology" },
  { id: "good_pre_market", name: "Did Pre-Market Analysis", category: "Psychology" },
  { id: "good_journal_review", name: "Reviewed Journal Before Trade", category: "Psychology" },
  { id: "good_no_distractions", name: "Eliminated Distractions", category: "Psychology" },
]

// Legacy export for backward compatibility
export const AVAILABLE_PSYCHOLOGY_FACTORS: ChecklistItem[] = BAD_HABITS
