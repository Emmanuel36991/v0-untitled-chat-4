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

// --- CONSTANTS ---
// Psychology is still useful as a generic list
export interface ChecklistItem {
  id: string
  name: string
  category: "Psychology"
}

export const AVAILABLE_PSYCHOLOGY_FACTORS: ChecklistItem[] = [
  { id: "psy_well_rested", name: "Well Rested", category: "Psychology" },
  { id: "psy_focused", name: "Focused", category: "Psychology" },
  { id: "psy_distracted", name: "Distracted", category: "Psychology" },
  { id: "psy_emotional", name: "Emotional", category: "Psychology" },
  { id: "psy_revenge", name: "Revenge Trading", category: "Psychology" },
  { id: "psy_fomo", name: "FOMO", category: "Psychology" },
]
