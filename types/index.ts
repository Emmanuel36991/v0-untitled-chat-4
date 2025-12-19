export type TradeOutcome = "win" | "loss" | "breakeven"

// Base interface for categorized concepts
export interface CategorizedConcept {
  id: string
  name: string
  category: string // Main category like "SMC", "ICT", "Wyckoff"
  subCategory: string // Specific sub-category like "Market Structure", "Order Blocks"
}


export type NewTradeInput = Omit<
  Trade,
  "id" | "pnl" | "outcome" | "created_at" | "updated_at" | "risk_reward_ratio"
> & {
  // Existing optional fields
    playbook_strategy_id?: string | null // <--- NEW FIELD
  setupName?: string | null
  notes?: string | null
  screenshotBeforeUrl?: string | null
  screenshotAfterUrl?: string | null
  take_profit?: number | null

  // Enhanced timing fields
  durationMinutes?: number | null
  tradeSession?: string | null
  tradeStartTime?: string | null // HH:MM format
  tradeEndTime?: string | null // HH:MM format
  preciseDurationMinutes?: number | null // Auto-calculated

  // Smart Money Concepts
  smcMarketStructure?: string[] | null
  smcOrderBlocks?: string[] | null
  smcFVG?: string[] | null
  smcFvgClassic?: string[] | null // NEW
  smcFvgIfvg?: string[] | null // NEW
  smcLiquidityConcepts?: string[] | null
  smcBreakerMitigationBlocks?: string[] | null
  smcMitigationFillZones?: string[] | null
  smcWyckoffOverlaps?: string[] | null

  // ICT Concepts (Expanded - some might merge with existing)
  ictMarketStructureShift?: string[] | null
  ictOrderFlowBlocks?: string[] | null
  ictLiquidityPoolsStops?: string[] | null
  ictKillZones?: string[] | null
  ictOTE?: string[] | null
  ictFibonacciClusters?: string[] | null
  ictPowerOfThree?: string[] | null
  ictSMTDivergence?: string[] | null
  ictDailyBiasSessionDynamics?: string[] | null
  ictEntryModel?: string[] | null
  ictLiquidityConcepts?: string[] | null
  ictMarketStructure?: string[] | null
  ictTimeAndPrice?: string[] | null
  ictBiasContext?: string[] | null
  ictLiquidityEvents?: string[] | null
  ictFibonacciLevels?: string[] | null
  ictPriceActionPatterns?: string[] | null
  ictConfluence?: string[] | null

  // Wyckoff Method
  wyckoffPriceVolume?: string[] | null
  wyckoffPhases?: string[] | null
  wyckoffCompositeMan?: string[] | null
  wyckoffSpringUpthrust?: string[] | null
  wyckoffCauseEffect?: string[] | null
  wyckoffSR?: string[] | null
  wyckoffEffortResult?: string[] | null

  // Volume Analysis
  volumeSpikesClusters?: string[] | null
  volumeProfileMarketProfile?: string[] | null
  volumeTrends?: string[] | null
  volumeOBVAD?: string[] | null
  volumeImbalance?: string[] | null

  // Support & Resistance (Expanded)
  srHorizontalLevels?: string[] | null
  srDynamic?: string[] | null
  srSupplyDemandZones?: string[] | null
  srFlip?: string[] | null
  srConfluenceZones?: string[] | null
  srMicroMacro?: string[] | null
  srOrderFlow?: string[] | null
  supportResistanceUsed?: string[] | null

  // Psychology Factors (Keep existing)
  psychologyFactors?: string[] | null
}

export interface Trade {
    id: string
  user_id: string
  // ... existing fields ...
  playbook_strategy_id?: string | null // <--- NEW FIELD
  // ...
  id: string
  user_id?: string | null
  date: string // Keep as string for form compatibility, convert to Date object when needed
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

  // Enhanced timing fields
  duration_minutes?: number | null
  trade_session?: string | null
  trade_start_time?: string | null // HH:MM format
  trade_end_time?: string | null // HH:MM format
  precise_duration_minutes?: number | null // Auto-calculated

  // Smart Money Concepts
  smc_market_structure?: string[] | null
  smc_order_blocks?: string[] | null
  smc_fvg?: string[] | null
  smc_fvg_classic?: string[] | null // NEW
  smc_fvg_ifvg?: string[] | null // NEW
  smc_liquidity_concepts?: string[] | null
  smc_breaker_mitigation_blocks?: string[] | null
  smc_mitigation_fill_zones?: string[] | null
  smc_wyckoff_overlaps?: string[] | null

  // ICT Concepts (Expanded)
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

  // Wyckoff Method
  wyckoff_price_volume?: string[] | null
  wyckoff_phases?: string[] | null
  wyckoff_composite_man?: string[] | null
  wyckoff_spring_upthrust?: string[] | null
  wyckoff_cause_effect?: string[] | null
  wyckoff_sr?: string[] | null
  wyckoff_effort_result?: string[] | null

  // Volume Analysis
  volume_spikes_clusters?: string[] | null
  volume_profile_market_profile?: string[] | null
  volume_trends?: string[] | null
  volume_obv_ad?: string[] | null
  volume_imbalance?: string[] | null

  // Support & Resistance (Expanded)
  sr_horizontal_levels?: string[] | null
  sr_dynamic?: string[] | null
  sr_supply_demand_zones?: string[] | null
  sr_flip?: string[] | null
  sr_confluence_zones?: string[] | null
  sr_micro_macro?: string[] | null
  sr_order_flow?: string[] | null
  support_resistance_used?: string[] | null

  // Psychology Factors (Keep existing)
  psychology_factors?: string[] | null
}

// Simplified analytics interfaces
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

// --- Concept Definitions ---

// Smart Money Concepts (SMC)
export const AVAILABLE_SMC_CONCEPTS = {
  marketStructure: [
    {
      id: "smc_ms_hhhl",
      name: "Higher Highs / Higher Lows (uptrend)",
      label: "HH/HL",
      description: "Bullish market structure with higher highs and higher lows",
      category: "SMC",
      subCategory: "Market Structure",
    },
    {
      id: "smc_ms_lhll",
      name: "Lower Highs / Lower Lows (downtrend)",
      label: "LH/LL",
      description: "Bearish market structure with lower highs and lower lows",
      category: "SMC",
      subCategory: "Market Structure",
    },
  ],
  orderBlocks: [
    {
      id: "smc_ob_bob",
      name: "Bullish Order Block (BOB)",
      label: "BOB",
      description: "Bullish institutional order block acting as support",
      category: "SMC",
      subCategory: "Order Blocks",
    },
    {
      id: "smc_ob_beob",
      name: "Bearish Order Block (BEOB)",
      label: "BEOB",
      description: "Bearish institutional order block acting as resistance",
      category: "SMC",
      subCategory: "Order Blocks",
    },
  ],
  fvg: [
    {
      id: "smc_fvg_gap",
      name: "FVG (Gap between candles)",
      label: "FVG",
      description: "Fair Value Gap - imbalance between candles",
      category: "SMC",
      subCategory: "Fair Value Gaps (FVG)",
    },
    {
      id: "smc_fvg_classic",
      name: "Classic FVG",
      label: "Classic FVG",
      description: "Traditional Fair Value Gap formation",
      category: "SMC",
      subCategory: "Fair Value Gaps (FVG)",
    },
    {
      id: "smc_fvg_ifvg",
      name: "Inverse FVG (IFVG)",
      label: "IFVG",
      description: "Inverse Fair Value Gap - opposite of regular FVG",
      category: "SMC",
      subCategory: "Fair Value Gaps (FVG)",
    },
  ],
  liquidityConcepts: [
    {
      id: "smc_liq_pools",
      name: "Liquidity Pools (highs/lows)",
      label: "Liquidity Pools",
      description: "Areas where liquidity accumulates at swing highs/lows",
      category: "SMC",
      subCategory: "Liquidity Concepts",
    },
    {
      id: "smc_liq_stophunt",
      name: "Stop-hunt areas",
      label: "Stop Hunt",
      description: "Areas where stop losses are likely to be hunted",
      category: "SMC",
      subCategory: "Liquidity Concepts",
    },
  ],
  breakerMitigationBlocks: [
    {
      id: "smc_brk_mit_breaker",
      name: "Breaker Blocks",
      label: "Breaker Blocks",
      description: "Failed order blocks that become opposite polarity zones",
      category: "SMC",
      subCategory: "Breaker Blocks & Mitigation Blocks",
    },
    {
      id: "smc_brk_mit_mitigation",
      name: "Mitigation Blocks",
      label: "Mitigation Blocks",
      description: "Order blocks that have been tested and mitigated",
      category: "SMC",
      subCategory: "Breaker Blocks & Mitigation Blocks",
    },
  ],
  mitigationFillZones: [
    {
      id: "smc_fill_zones",
      name: "Mitigation/Fill Zones (imbalance fill)",
      label: "Fill Zones",
      description: "Areas where price imbalances are expected to be filled",
      category: "SMC",
      subCategory: "Mitigation/Fill Zones",
    },
  ],
  wyckoffOverlaps: [
    {
      id: "smc_wyckoff_sd_ob",
      name: "Wyckoff S/D in Order Block Logic",
      label: "Wyckoff S/D",
      description: "Wyckoff supply/demand principles applied to order block analysis",
      category: "SMC",
      subCategory: "Wyckoff SMC Overlaps",
    },
  ],
} as const

// ICT (Inner Circle Trader) - Restructured as categorized object
export const AVAILABLE_ICT_CONCEPTS = {
  marketStructureShift: [
    {
      id: "ict_mss_bos",
      name: "Break of Structure (BOS)",
      label: "BOS",
      description: "Price breaks previous structure level",
      category: "ICT",
      subCategory: "Market Structure Shifts (MSS)",
    },
    {
      id: "ict_mss_choch",
      name: "Change of Character (ChoCH)",
      label: "ChoCH",
      description: "Market character shifts from bullish to bearish or vice versa",
      category: "ICT",
      subCategory: "Market Structure Shifts (MSS)",
    },
  ],
  orderFlowBlocks: [
    {
      id: "ict_ob_institutional",
      name: "Institutional Order Blocks",
      label: "Institutional OB",
      description: "Large institutional order blocks that act as support/resistance",
      category: "ICT",
      subCategory: "Order Flow & Order Blocks",
    },
  ],
  liquidityPoolsStops: [
    {
      id: "ict_liq_hidden",
      name: "Hidden Liquidity",
      label: "Hidden Liquidity",
      description: "Liquidity pools above/below key support/resistance levels",
      category: "ICT",
      subCategory: "Liquidity Pools & Stops",
    },
  ],
  killZones: [
    {
      id: "ict_kz_asian",
      name: "Asian Kill Zone",
      label: "Asian KZ",
      description: "Asian trading session kill zone (7-10 PM EST)",
      category: "ICT",
      subCategory: "Kill Zones (KZ)",
    },
    {
      id: "ict_kz_london_open",
      name: "London Open Kill Zone",
      label: "London Open KZ",
      description: "London session opening kill zone (2-5 AM EST)",
      category: "ICT",
      subCategory: "Kill Zones (KZ)",
    },
    {
      id: "ict_kz_london_close",
      name: "London Close Kill Zone",
      label: "London Close KZ",
      description: "London session closing kill zone (10 AM-12 PM EST)",
      category: "ICT",
      subCategory: "Kill Zones (KZ)",
    },
    {
      id: "ict_kz_ny_open",
      name: "New York Open Kill Zone",
      label: "NY Open KZ",
      description: "New York session opening kill zone (8:30-11 AM EST)",
      category: "ICT",
      subCategory: "Kill Zones (KZ)",
    },
    {
      id: "ict_kz_silver_bullet",
      name: "Silver Bullet Window",
      label: "Silver Bullet",
      description: "High probability trading window (10-11 AM EST)",
      category: "ICT",
      subCategory: "Kill Zones (KZ)",
    },
  ],
  ote: [
    {
      id: "ict_ote_fib",
      name: "Optimal Trade Entry (OTE 61.8-79%)",
      label: "OTE Fib",
      description: "Optimal entry zone between 61.8% and 79% Fibonacci levels",
      category: "ICT",
      subCategory: "Optimal Trade Entry (OTE)",
    },
  ],
  fibonacciClusters: [
    {
      id: "ict_fib_clusters",
      name: "Fibonacci Clusters Alignment",
      label: "Fib Clusters",
      description: "Multiple Fibonacci levels aligning at same price area",
      category: "ICT",
      subCategory: "Fibonacci Clusters",
    },
  ],
  powerOfThree: [
    {
      id: "ict_p3_amd",
      name: "Power of Three (Accumulation, Markup/Markdown, Distribution)",
      label: "Power of 3",
      description: "Three-phase market cycle: Accumulation → Markup/Markdown → Distribution",
      category: "ICT",
      subCategory: "Power of Three",
    },
  ],
  smtDivergence: [
    {
      id: "ict_smt_divergence",
      name: "SMT Divergence (correlated markets)",
      label: "SMT Divergence",
      description: "Smart Money Timing divergence between correlated markets",
      category: "ICT",
      subCategory: "SMT Divergence",
    },
  ],
  dailyBiasSessionDynamics: [
    {
      id: "ict_bias_daily",
      name: "Daily Bias Confirmed",
      label: "Daily Bias",
      description: "Daily directional bias confirmed by market structure",
      category: "ICT",
      subCategory: "Daily Bias / Session Dynamics",
    },
    {
      id: "ict_bias_session",
      name: "Asia/London/NY Session Dynamics",
      label: "Session Dynamics",
      description: "Understanding how different trading sessions interact",
      category: "ICT",
      subCategory: "Daily Bias / Session Dynamics",
    },
  ],
} as const

// Wyckoff Method
export const AVAILABLE_WYCKOFF_CONCEPTS: CategorizedConcept[] = [
  // Price–Volume Relationship
  {
    id: "wyckoff_pv_spikes",
    name: "Volume Spikes on Key Moves",
    category: "Wyckoff",
    subCategory: "Price–Volume Relationship",
  },

  // Phases of Accumulation & Distribution
  { id: "wyckoff_phase_a", name: "Phase A (Stopping Trend)", category: "Wyckoff", subCategory: "Phases" },
  { id: "wyckoff_phase_b", name: "Phase B (Building Cause)", category: "Wyckoff", subCategory: "Phases" },
  { id: "wyckoff_phase_c", name: "Phase C (Testing - Spring/Upthrust)", category: "Wyckoff", subCategory: "Phases" },
  { id: "wyckoff_phase_d", name: "Phase D (Markup/Markdown)", category: "Wyckoff", subCategory: "Phases" },
  { id: "wyckoff_phase_e", name: "Phase E (Trend Continuation)", category: "Wyckoff", subCategory: "Phases" },

  // Composite Man
  { id: "wyckoff_cm_concept", name: "Composite Man Logic Applied", category: "Wyckoff", subCategory: "Composite Man" },

  // Spring & Upthrust
  {
    id: "wyckoff_spring",
    name: "Spring (False break below support)",
    category: "Wyckoff",
    subCategory: "Spring & Upthrust",
  },
  {
    id: "wyckoff_upthrust",
    name: "Upthrust (False break above resistance)",
    category: "Wyckoff",
    subCategory: "Spring & Upthrust",
  },

  // Cause & Effect (Point & Figure analysis)
  {
    id: "wyckoff_cause_effect_p&f",
    name: "Cause & Effect (P&F Horizontal Count)",
    category: "Wyckoff",
    subCategory: "Cause & Effect",
  },

  // S/R in Wyckoff
  {
    id: "wyckoff_sr_global",
    name: "Global S/R (Composite Man Defined)",
    category: "Wyckoff",
    subCategory: "S/R in Wyckoff",
  },

  // Effort vs. Result
  {
    id: "wyckoff_effort_result_vol",
    name: "Effort vs. Result (Volume vs. Price)",
    category: "Wyckoff",
    subCategory: "Effort vs. Result",
  },
]

// Volume Analysis
export const AVAILABLE_VOLUME_CONCEPTS: CategorizedConcept[] = [
  // Volume Spikes & Clusters
  { id: "vol_spikes", name: "Volume Spikes / Clusters", category: "Volume", subCategory: "Volume Spikes & Clusters" },
  {
    id: "vol_poc_va",
    name: "Volume Profile (POC, VA H/L)",
    category: "Volume",
    subCategory: "Volume Spikes & Clusters",
  },

  // Volume Profile / Market Profile
  { id: "vol_vwap", name: "VWAP Interaction", category: "Volume", subCategory: "Volume Profile / Market Profile" },
  {
    id: "vol_price_levels",
    name: "Volume by Price Levels (HDP/LDP)",
    category: "Volume",
    subCategory: "Volume Profile / Market Profile",
  },

  // Volume Trends
  { id: "vol_trends_confirm", name: "Increasing Volume on Trend", category: "Volume", subCategory: "Volume Trends" },
  { id: "vol_trends_diverge", name: "Decreasing Volume on Pullback", category: "Volume", subCategory: "Volume Trends" },

  // On‐Balance Volume (OBV) & Accumulation/Distribution (A/D) Lines
  { id: "vol_obv", name: "OBV Confirmation/Divergence", category: "Volume", subCategory: "OBV & A/D Lines" },
  { id: "vol_ad_line", name: "A/D Line Confirmation/Divergence", category: "Volume", subCategory: "OBV & A/D Lines" },

  // Volume Imbalance
  {
    id: "vol_imbalance_candle",
    name: "Volume Imbalance in Candle",
    category: "Volume",
    subCategory: "Volume Imbalance",
  },
]

// Support & Resistance (S&R)
export const AVAILABLE_SR_CONCEPTS: CategorizedConcept[] = [
  // Horizontal Levels
  { id: "sr_horiz_swing_hl", name: "Prior Swing Highs/Lows", category: "S&R", subCategory: "Horizontal Levels" },
  { id: "sr_horiz_round_nums", name: "Round Numbers", category: "S&R", subCategory: "Horizontal Levels" },

  // Dynamic S/R
  { id: "sr_dyn_ma", name: "Moving Averages (e.g., 50/200 EMA)", category: "S&R", subCategory: "Dynamic S/R" },
  { id: "sr_dyn_trendline", name: "Trendlines & Channels", category: "S&R", subCategory: "Dynamic S/R" },

  // Supply/Demand Zones
  { id: "sr_sd_zones", name: "Supply/Demand Zones", category: "S&R", subCategory: "Supply/Demand Zones" },

  // S/R Flip (Role Reversal)
  { id: "sr_flip_reversal", name: "S/R Flip (Role Reversal)", category: "S&R", subCategory: "S/R Flip" },

  // Confluence Zones
  { id: "sr_conf_overlap", name: "Confluence Zones (Multiple S/R)", category: "S&R", subCategory: "Confluence Zones" },

  // Micro vs. Macro S/R
  {
    id: "sr_micro_macro_levels",
    name: "Micro vs. Macro S/R Levels",
    category: "S&R",
    subCategory: "Micro vs. Macro S/R",
  },

  // Order Flow S/R
  {
    id: "sr_orderflow_inst",
    name: "Order Flow S/R (Institutional Levels)",
    category: "S&R",
    subCategory: "Order Flow S/R",
  },
]

// Psychology Factors (Keep existing structure if it works, or adapt to CategorizedConcept)
export interface ChecklistItem {
  id: string
  name: string
  category: "Psychology"
}

export const AVAILABLE_PSYCHOLOGY_FACTORS: ChecklistItem[] = [
  // Pre-Trade Psychology
  { id: "psy_well_rested", name: "Well-Rested & Alert", category: "Psychology" },
  { id: "psy_clear_mind", name: "Clear Mind (No Distractions)", category: "Psychology" },
  { id: "psy_no_fomo", name: "No FOMO Present", category: "Psychology" },
  { id: "psy_confident", name: "Confident in Analysis", category: "Psychology" },

  // During-Trade Psychology
  { id: "psy_asset_understanding", name: "Understood Asset Class (Focus)", category: "Psychology" },
  { id: "psy_independent_analysis", name: "Independent Analysis (No Noise)", category: "Psychology" },
  { id: "psy_adhered_to_plan", name: "Adhered to Trade Profile & Plan", category: "Psychology" },
  { id: "psy_equity_management", name: "Impeccable Equity Management (Risk %)", category: "Psychology" },
  { id: "psy_no_revenge", name: "No Revenge Trading", category: "Psychology" },
  { id: "psy_patient", name: "Patient Entry & Exit", category: "Psychology" },

  // Post-Trade Psychology
  { id: "psy_anticipated_not_predicted", name: "Anticipated, Not Predicted (Setups)", category: "Psychology" },
  { id: "psy_probabilistic_mindset", name: "Probabilistic Mindset (No Absolutes)", category: "Psychology" },
  { id: "psy_emotional_control", name: "Maintained Emotional Control", category: "Psychology" },
  { id: "psy_lessons_learned", name: "Identified Lessons Learned", category: "Psychology" },
  { id: "psy_would_repeat", name: "Would Take This Trade Again", category: "Psychology" },
]

// Charting related types (keep as is)
export interface CandlestickData {
  time: number // Ensure this is UNIX timestamp (seconds)
  open: number
  high: number
  low: number
  close: number
  volume?: number // Optional volume data
}

export interface IndicatorParam {
  name: string
  type: "number" | "color" | "boolean" | "select"
  defaultValue: any
  label: string
  options?: { value: string | number; label: string }[]
  min?: number
  max?: number
  step?: number
  tooltip?: string // New: For tooltips
}

export interface IndicatorDefinition {
  type: string
  label: string
  params: Record<string, IndicatorParam>
  defaultSeriesSettings?: Record<string, any>
  pane?: "price" | "separate"
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
  indicators: Omit<ActiveIndicator, "id" | "seriesIds">[]
}

export const AVAILABLE_INDICATORS: Record<string, IndicatorDefinition> = {
  MA: {
    type: "MA",
    label: "Moving Average",
    pane: "price",
    params: {
      period: {
        name: "period",
        type: "number",
        defaultValue: 20,
        label: "Period",
        min: 1,
        step: 1,
        tooltip: "Number of candles for MA calculation.",
      },
      color: { name: "color", type: "color", defaultValue: "#9c27b0", label: "Color" },
    },
    defaultSeriesSettings: { lineWidth: 2, lastValueVisible: false, priceLineVisible: false },
  },
  RSI: {
    type: "RSI",
    label: "Relative Strength Index",
    pane: "separate",
    params: {
      period: {
        name: "period",
        type: "number",
        defaultValue: 14,
        label: "Period",
        min: 1,
        step: 1,
        tooltip: "Number of candles for RSI calculation.",
      },
      color: { name: "color", type: "color", defaultValue: "#FF9800", label: "RSI Line Color" },
      overboughtLevel: {
        name: "overboughtLevel",
        type: "number",
        defaultValue: 70,
        label: "Overbought",
        min: 0,
        max: 100,
        step: 1,
        tooltip: "RSI level considered as overbought.",
      },
      oversoldLevel: {
        name: "oversoldLevel",
        type: "number",
        defaultValue: 30,
        label: "Oversold",
        min: 0,
        max: 100,
        step: 1,
        tooltip: "RSI level considered as oversold.",
      },
      bandColor: { name: "bandColor", type: "color", defaultValue: "#E0E0E0", label: "OB/OS Band Color" },
    },
    defaultSeriesSettings: { lineWidth: 2, lastValueVisible: true, priceLineVisible: true },
  },
  MACD: {
    type: "MACD",
    label: "MACD",
    pane: "separate",
    params: {
      fastPeriod: {
        name: "fastPeriod",
        type: "number",
        defaultValue: 12,
        label: "Fast Period",
        min: 1,
        step: 1,
        tooltip: "Period for the fast EMA.",
      },
      slowPeriod: {
        name: "slowPeriod",
        type: "number",
        defaultValue: 26,
        label: "Slow Period",
        min: 1,
        step: 1,
        tooltip: "Period for the slow EMA.",
      },
      signalPeriod: {
        name: "signalPeriod",
        type: "number",
        defaultValue: 9,
        label: "Signal Period",
        min: 1,
        step: 1,
        tooltip: "Period for the signal line EMA.",
      },
      macdLineColor: { name: "macdLineColor", type: "color", defaultValue: "#2196F3", label: "MACD Line" },
      signalLineColor: { name: "signalLineColor", type: "color", defaultValue: "#FF6D00", label: "Signal Line" },
      histogramColorPositive: {
        name: "histogramColorPositive",
        type: "color",
        defaultValue: "#4CAF50",
        label: "Hist. Positive",
      },
      histogramColorNegative: {
        name: "histogramColorNegative",
        type: "color",
        defaultValue: "#F44336",
        label: "Hist. Negative",
      },
    },
    defaultSeriesSettings: { lineWidth: 2 },
  },
  BB: {
    type: "BB",
    label: "Bollinger Bands",
    pane: "price",
    params: {
      period: {
        name: "period",
        type: "number",
        defaultValue: 20,
        label: "Period",
        min: 1,
        step: 1,
        tooltip: "Period for MA and standard deviation.",
      },
      stdDev: {
        name: "stdDev",
        type: "number",
        defaultValue: 2,
        label: "Std. Deviations",
        min: 0.1,
        step: 0.1,
        tooltip: "Number of standard deviations for bands.",
      },
      upperColor: { name: "upperColor", type: "color", defaultValue: "#2962FF", label: "Upper Band" },
      middleColor: { name: "middleColor", type: "color", defaultValue: "#FF6D00", label: "Middle Band (SMA)" },
      lowerColor: { name: "lowerColor", type: "color", defaultValue: "#2962FF", label: "Lower Band" },
      fillColor: { name: "fillColor", type: "color", defaultValue: "rgba(33, 150, 243, 0.1)", label: "Fill Color" },
    },
    defaultSeriesSettings: { lineWidth: 1, lastValueVisible: false, priceLineVisible: false },
  },
}

// --- Backtesting Enhancements ---
export interface BacktestParams {
  instrument: string
  strategyId: string
  timeframe: string // e.g., "1H", "4H", "1D"
  startDate: string // ISO string
  endDate: string // ISO string
  initialCapital: number
  strategyParams?: Record<string, any> // For strategy-specific parameters like MA periods
  riskFreeRate?: number // Annualized, e.g., 0.02 for 2%
  stopLossPercent?: number | null // e.g., 2 for 2%
  takeProfitPercent?: number | null // e.g., 4 for 4%
}

export interface BacktestTrade {
  entryTime: number // timestamp
  exitTime: number // timestamp
  entryPrice: number
  exitPrice: number
  direction: "long" | "short"
  size: number // In units of base currency or contracts
  pnl: number
  pnlPercent: number // P&L as a percentage of trade size or capital at risk
  exitReason: "signal" | "sl" | "tp" | "end_of_data"
}

export interface EquityDataPoint {
  time: number // timestamp
  equity: number
}

export interface DrawdownPoint {
  time: number
  drawdown: number // Percentage
}

export interface PnlDistributionPoint {
  pnl: number // Mid-point of the P&L bin
  count: number // Number of trades in this bin
}

export interface BacktestResults {
  // Core Metrics
  totalPnl: number
  totalPnlPercent: number // Total P&L as % of initial capital
  winRate: number // 0-1
  lossRate: number // 0-1 (derived)
  breakevenRate: number // 0-1 (derived)
  totalTrades: number
  winningTrades: number
  losingTrades: number
  breakevenTrades: number

  // Risk & Reward
  maxDrawdown: number // Percentage
  sharpeRatio?: number
  profitFactor?: number // Gross Profit / Gross Loss
  averageWinPnl?: number // Average P&L of winning trades
  averageLossPnl?: number // Average P&L of losing trades
  averageWinPnlPercent?: number
  averageLossPnlPercent?: number
  riskRewardRatio?: number // Avg Win / Avg Loss (absolute values)
  expectancy?: number // (WinRate * AvgWin) - (LossRate * AvgLoss)

  // Streaks & Duration
  longestWinningStreak?: number
  longestLosingStreak?: number
  averageTradeDuration?: number // In seconds or minutes/hours/days
  averageHoldingPeriodWin?: number
  averageHoldingPeriodLoss?: number

  // Data for Charts
  trades: BacktestTrade[]
  equityCurve: EquityDataPoint[]
  drawdownCurve?: DrawdownPoint[] // New
  pnlDistribution?: PnlDistributionPoint[] // New for histogram

  // Other
  logs?: string[] // For debugging or verbose output
  startTime: number // Timestamp of first data point used
  endTime: number // Timestamp of last data point used
  totalDurationDays: number // Duration of the backtest period in days
}

// Simple strategy definition for now
export interface BacktestStrategy {
  id: string
  name: string
  description: string
  params?: IndicatorParam[] // Re-use IndicatorParam for strategy parameters
}

export const AVAILABLE_BACKTEST_STRATEGIES: BacktestStrategy[] = [
  {
    id: "sma_crossover",
    name: "Simple Moving Average (SMA) Crossover",
    description:
      "Trades on the crossover of two SMAs. Buys when short MA crosses above long MA, sells when short MA crosses below long MA.",
    params: [
      {
        name: "shortMAPeriod",
        type: "number",
        defaultValue: 10,
        label: "Short MA Period",
        min: 1,
        step: 1,
        tooltip: "Period for the shorter moving average.",
      },
      {
        name: "longMAPeriod",
        type: "number",
        defaultValue: 20,
        label: "Long MA Period",
        min: 1,
        step: 1,
        tooltip: "Period for the longer moving average.",
      },
    ],
  },
  {
    id: "rsi_threshold",
    name: "RSI Threshold",
    description:
      "Trades based on RSI overbought/oversold levels. Buys when RSI crosses above oversold, sells when RSI crosses below overbought.",
    params: [
      {
        name: "rsiPeriod",
        type: "number",
        defaultValue: 14,
        label: "RSI Period",
        min: 1,
        step: 1,
        tooltip: "Lookback period for RSI calculation.",
      },
      {
        name: "oversoldLevel",
        type: "number",
        defaultValue: 30,
        label: "Oversold Level",
        min: 1,
        max: 100,
        step: 1,
        tooltip: "RSI level to trigger buy signals.",
      },
      {
        name: "overboughtLevel",
        type: "number",
        defaultValue: 70,
        label: "Overbought Level",
        min: 1,
        max: 100,
        step: 1,
        tooltip: "RSI level to trigger sell signals.",
      },
    ],
  },
  {
    id: "bb_breakout",
    name: "Bollinger Band Breakout/Reversal",
    description:
      "Trades on price breakouts of Bollinger Bands. Buys on close above upper band, Sells on close below lower band. Reverses position on opposite signal.",
    params: [
      {
        name: "bbPeriod",
        type: "number",
        defaultValue: 20,
        label: "BB Period",
        min: 2,
        step: 1,
        tooltip: "Lookback period for Bollinger Bands calculation (for SMA and StdDev).",
      },
      {
        name: "bbStdDev",
        type: "number",
        defaultValue: 2,
        label: "BB StdDev Multiplier",
        min: 0.1,
        step: 0.1,
        tooltip: "Number of standard deviations for the bands.",
      },
    ],
  },
  {
    id: "macd_crossover",
    name: "MACD Crossover",
    description:
      "Trades on MACD line crossing its signal line. Buys when MACD crosses above signal, Sells when MACD crosses below signal.",
    params: [
      {
        name: "macdFastPeriod",
        type: "number",
        defaultValue: 12,
        label: "MACD Fast EMA Period",
        min: 1,
        step: 1,
        tooltip: "Period for the fast Exponential Moving Average.",
      },
      {
        name: "macdSlowPeriod",
        type: "number",
        defaultValue: 26,
        label: "MACD Slow EMA Period",
        min: 1,
        step: 1,
        tooltip: "Period for the slow Exponential Moving Average.",
      },
      {
        name: "macdSignalPeriod",
        type: "number",
        defaultValue: 9,
        label: "MACD Signal EMA Period",
        min: 1,
        step: 1,
        tooltip: "Period for the EMA of the MACD line (Signal Line).",
      },
    ],
  },
]

export const AVAILABLE_TIMEFRAMES = [
  { value: "1m", label: "1 Minute" },
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "1H", label: "1 Hour" },
  { value: "4H", label: "4 Hours" },
  { value: "1D", label: "1 Day" },
]

export const AVAILABLE_INSTRUMENTS_BACKTEST = [
  { value: "EURUSD", label: "EUR/USD" },
  { value: "BTCUSD", label: "BTC/USD" },
  { value: "AAPL", label: "Apple Inc." },
  { value: "SPY", label: "S&P 500 ETF" },
  { value: "TSLA", label: "Tesla Inc." },
]

// For Save/Load Configurations
export interface SavedBacktestConfig extends BacktestParams {
  name: string
  id: string // Unique ID for the saved config
  createdAt: string // ISO date string
}
