export interface UserProfile {
  fullName?: string
  email?: string
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert"
  accountType?: "day_trader" | "swing_trader" | "position_trader" | "institution"
  tradingGoals?: string // e.g., "Consistent profitability, risk management"
}

export interface TradingPreferences {
  // Trading Methodologies
  methodologies?: string[] // e.g., ["smc", "ict", "wyckoff", "volume", "sr"]

  // Primary Instruments & Specific Instruments
  primaryInstruments?: string[] // e.g., ["futures", "forex", "stocks"]
  specificInstruments?: string[] // e.g., ["ES", "NQ", "EURUSD", "GBPUSD"]

  // Visibility controls for instruments and strategies
  visibleInstruments?: string[] // Instruments shown when adding trades
  visibleStrategies?: string[] // Strategies shown when adding trades

  // Trading Timeframe
  typicalTimeframe?: string // e.g., "day_trading"

  // Display Preferences
  showAllConceptsInForm?: boolean // Key preference for concept display
  showAllInstrumentsInForm?: boolean // Key preference for instrument display
  use24HourFormat?: boolean

  // Additional configuration options
  riskToleranceLevel?: "conservative" | "moderate" | "aggressive" // Risk preference
  accountSizeTracking?: boolean // Track account size
  tradingHoursStart?: string // Trading hours in HH:mm format
  tradingHoursEnd?: string
  enableAutoTags?: boolean // Auto-tagging based on methodology
  defaultRiskRewardRatio?: number // Default R:R for trades

  // Features
  importantFeatures?: string[]

  // Specific concept preferences
  enabledConcepts?: {
    smc?: boolean
    ict?: boolean
    wyckoff?: boolean
    volume?: boolean
    supportResistance?: boolean
    psychology?: boolean
  }
}

export interface NotificationPreferences {
  emailNewFeatures?: boolean
  emailTradeMilestones?: boolean
  emailWeeklyDigest?: boolean
  emailCommunityInsights?: boolean
  tradeAlerts?: boolean
}

export interface PrivacyPreferences {
  allowAnonymousUsageData?: boolean
  termsAccepted?: boolean
  privacyPolicyAccepted?: boolean
  dataCollectionConsent?: boolean
  marketingEmailsOptIn?: boolean
}

export interface UserConfiguration {
  version: number
  userProfile: UserProfile
  tradingPreferences: TradingPreferences
  notificationPreferences: NotificationPreferences
  privacyPreferences: PrivacyPreferences
  profileSetupComplete: boolean
}

export const LATEST_CONFIG_VERSION = 1
export const USER_CONFIG_STORAGE_KEY = "tradeTrackUserConfig"

export const DEFAULT_USER_CONFIGURATION: UserConfiguration = {
  version: LATEST_CONFIG_VERSION,
  userProfile: {},
  tradingPreferences: {
    showAllConceptsInForm: false,
    showAllInstrumentsInForm: false,
    use24HourFormat: false,
    enabledConcepts: {
      psychology: true,
    },
  },
  notificationPreferences: {
    emailNewFeatures: true,
    emailTradeMilestones: false,
    emailWeeklyDigest: false,
    emailCommunityInsights: false,
    tradeAlerts: false,
  },
  privacyPreferences: {
    allowAnonymousUsageData: true,
    termsAccepted: false,
    privacyPolicyAccepted: false,
    dataCollectionConsent: false,
    marketingEmailsOptIn: false,
  },
  profileSetupComplete: false,
}

// Enhanced methodology options
export const METHODOLOGY_OPTIONS = [
  {
    id: "smc",
    label: "Smart Money Concepts (SMC)",
    description: "Institutional order flow, market structure, and liquidity concepts",
    icon: "🏛️",
  },
  {
    id: "ict",
    label: "Inner Circle Trader (ICT)",
    description: "Advanced price action, kill zones, and market maker models",
    icon: "🎯",
  },
  {
    id: "wyckoff",
    label: "Wyckoff Method",
    description: "Price-volume analysis and market phases",
    icon: "📊",
  },
  {
    id: "volume",
    label: "Volume Analysis",
    description: "Volume profile, clusters, and flow analysis",
    icon: "📈",
  },
  {
    id: "sr",
    label: "Support & Resistance",
    description: "Horizontal levels, dynamic S&R, and supply/demand zones",
    icon: "📏",
  },
  {
    id: "chart_patterns",
    label: "Classic Chart Patterns",
    description: "Traditional technical analysis patterns",
    icon: "📐",
  },
  {
    id: "indicators",
    label: "Technical Indicators",
    description: "Moving averages, oscillators, and custom indicators",
    icon: "🔢",
  },
]

// Primary instrument categories
export const INSTRUMENT_CATEGORIES = [
  { id: "futures", label: "Futures", icon: "📋", description: "Index futures, commodities, and energy" },
  { id: "forex", label: "Forex", icon: "💱", description: "Currency pairs and cross rates" },
  { id: "stocks", label: "Stocks", icon: "📈", description: "Individual equities and ETFs" },
  { id: "crypto", label: "Cryptocurrencies", icon: "₿", description: "Digital assets and tokens" },
  { id: "commodities", label: "Commodities", icon: "🥇", description: "Physical commodities and metals" },
  { id: "options", label: "Options", icon: "🎲", description: "Options contracts and derivatives" },
]

// Detailed instrument mappings
export const INSTRUMENT_MAPPINGS: Record<
  string,
  Array<{
    symbol: string
    name: string
    description: string
    category: string
    subcategory: string
    tickSize: string
    contractSize: string
    tradingHours: string
  }>
> = {
  futures: [
    // Index Futures
    {
      symbol: "ES",
      name: "E-mini S&P 500",
      description: "Most liquid equity index future",
      category: "futures",
      subcategory: "US Indices",
      tickSize: "0.25 pts ($12.50)",
      contractSize: "$50 × S&P 500 Index",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "MES",
      name: "Micro E-mini S&P 500",
      description: "1/10th size of ES contract",
      category: "futures",
      subcategory: "US Indices",
      tickSize: "0.25 pts ($1.25)",
      contractSize: "$5 × S&P 500 Index",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "NQ",
      name: "E-mini NASDAQ-100",
      description: "Tech-heavy index future",
      category: "futures",
      subcategory: "US Indices",
      tickSize: "0.25 pts ($5.00)",
      contractSize: "$20 × NASDAQ-100 Index",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "MNQ",
      name: "Micro E-mini NASDAQ-100",
      description: "1/10th size of NQ contract",
      category: "futures",
      subcategory: "US Indices",
      tickSize: "0.25 pts ($0.50)",
      contractSize: "$2 × NASDAQ-100 Index",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "RTY",
      name: "E-mini Russell 2000",
      description: "Small-cap index future",
      category: "futures",
      subcategory: "US Indices",
      tickSize: "0.1 pts ($5.00)",
      contractSize: "$50 × Russell 2000 Index",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "M2K",
      name: "Micro E-mini Russell 2000",
      description: "1/10th size of RTY contract",
      category: "futures",
      subcategory: "US Indices",
      tickSize: "0.1 pts ($0.50)",
      contractSize: "$5 × Russell 2000 Index",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "YM",
      name: "E-mini Dow Jones",
      description: "Blue-chip index future",
      category: "futures",
      subcategory: "US Indices",
      tickSize: "1 pt ($5.00)",
      contractSize: "$5 × Dow Jones Index",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "MYM",
      name: "Micro E-mini Dow Jones",
      description: "1/10th size of YM contract",
      category: "futures",
      subcategory: "US Indices",
      tickSize: "1 pt ($0.50)",
      contractSize: "$0.50 × Dow Jones Index",
      tradingHours: "23:00-22:00 ET",
    },
    // Energy Futures
    {
      symbol: "CL",
      name: "Crude Oil",
      description: "WTI crude oil futures",
      category: "futures",
      subcategory: "Energy",
      tickSize: "$0.01 ($10.00)",
      contractSize: "1,000 barrels",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "MCL",
      name: "Micro Crude Oil",
      description: "1/10th size of CL contract",
      category: "futures",
      subcategory: "Energy",
      tickSize: "$0.01 ($1.00)",
      contractSize: "100 barrels",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "NG",
      name: "Natural Gas",
      description: "Henry Hub natural gas",
      category: "futures",
      subcategory: "Energy",
      tickSize: "$0.001 ($10.00)",
      contractSize: "10,000 MMBtu",
      tradingHours: "23:00-22:00 ET",
    },
    // Metals
    {
      symbol: "GC",
      name: "Gold",
      description: "COMEX gold futures",
      category: "futures",
      subcategory: "Metals",
      tickSize: "$0.10 ($10.00)",
      contractSize: "100 troy ounces",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "MGC",
      name: "Micro Gold",
      description: "1/10th size of GC contract",
      category: "futures",
      subcategory: "Metals",
      tickSize: "$0.10 ($1.00)",
      contractSize: "10 troy ounces",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "SI",
      name: "Silver",
      description: "COMEX silver futures",
      category: "futures",
      subcategory: "Metals",
      tickSize: "$0.005 ($25.00)",
      contractSize: "5,000 troy ounces",
      tradingHours: "23:00-22:00 ET",
    },
  ],
  forex: [
    // Major Pairs
    {
      symbol: "EURUSD",
      name: "Euro / US Dollar",
      description: "Most traded currency pair globally",
      category: "forex",
      subcategory: "Major Pairs",
      tickSize: "0.00001 (0.1 pip)",
      contractSize: "100,000 EUR",
      tradingHours: "24/5",
    },
    {
      symbol: "GBPUSD",
      name: "British Pound / US Dollar",
      description: "Cable - High volatility pair",
      category: "forex",
      subcategory: "Major Pairs",
      tickSize: "0.00001 (0.1 pip)",
      contractSize: "100,000 GBP",
      tradingHours: "24/5",
    },
    {
      symbol: "USDJPY",
      name: "US Dollar / Japanese Yen",
      description: "Safe haven currency pair",
      category: "forex",
      subcategory: "Major Pairs",
      tickSize: "0.001 (0.1 pip)",
      contractSize: "100,000 USD",
      tradingHours: "24/5",
    },
    {
      symbol: "USDCHF",
      name: "US Dollar / Swiss Franc",
      description: "Swissie - Safe haven pair",
      category: "forex",
      subcategory: "Major Pairs",
      tickSize: "0.00001 (0.1 pip)",
      contractSize: "100,000 USD",
      tradingHours: "24/5",
    },
    {
      symbol: "AUDUSD",
      name: "Australian Dollar / US Dollar",
      description: "Aussie - Commodity currency",
      category: "forex",
      subcategory: "Major Pairs",
      tickSize: "0.00001 (0.1 pip)",
      contractSize: "100,000 AUD",
      tradingHours: "24/5",
    },
    {
      symbol: "USDCAD",
      name: "US Dollar / Canadian Dollar",
      description: "Loonie - Oil-correlated pair",
      category: "forex",
      subcategory: "Major Pairs",
      tickSize: "0.00001 (0.1 pip)",
      contractSize: "100,000 USD",
      tradingHours: "24/5",
    },
    {
      symbol: "NZDUSD",
      name: "New Zealand Dollar / US Dollar",
      description: "Kiwi - Risk-sensitive pair",
      category: "forex",
      subcategory: "Major Pairs",
      tickSize: "0.00001 (0.1 pip)",
      contractSize: "100,000 NZD",
      tradingHours: "24/5",
    },
    // Cross Pairs
    {
      symbol: "EURJPY",
      name: "Euro / Japanese Yen",
      description: "Popular cross pair",
      category: "forex",
      subcategory: "Cross Pairs",
      tickSize: "0.001 (0.1 pip)",
      contractSize: "100,000 EUR",
      tradingHours: "24/5",
    },
    {
      symbol: "GBPJPY",
      name: "British Pound / Japanese Yen",
      description: "Volatile cross pair",
      category: "forex",
      subcategory: "Cross Pairs",
      tickSize: "0.001 (0.1 pip)",
      contractSize: "100,000 GBP",
      tradingHours: "24/5",
    },
    {
      symbol: "EURGBP",
      name: "Euro / British Pound",
      description: "European cross pair",
      category: "forex",
      subcategory: "Cross Pairs",
      tickSize: "0.00001 (0.1 pip)",
      contractSize: "100,000 EUR",
      tradingHours: "24/5",
    },
  ],
  stocks: [
    // Tech Giants
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      description: "iPhone maker - Tech leader",
      category: "stocks",
      subcategory: "Tech Giants",
      tickSize: "$0.01",
      contractSize: "100 shares",
      tradingHours: "9:30-16:00 ET",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      description: "Software and cloud leader",
      category: "stocks",
      subcategory: "Tech Giants",
      tickSize: "$0.01",
      contractSize: "100 shares",
      tradingHours: "9:30-16:00 ET",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      description: "Google parent company",
      category: "stocks",
      subcategory: "Tech Giants",
      tickSize: "$0.01",
      contractSize: "100 shares",
      tradingHours: "9:30-16:00 ET",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      description: "E-commerce and cloud giant",
      category: "stocks",
      subcategory: "Tech Giants",
      tickSize: "$0.01",
      contractSize: "100 shares",
      tradingHours: "9:30-16:00 ET",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      description: "Electric vehicle pioneer",
      category: "stocks",
      subcategory: "Growth Stocks",
      tickSize: "$0.01",
      contractSize: "100 shares",
      tradingHours: "9:30-16:00 ET",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      description: "AI and graphics chip leader",
      category: "stocks",
      subcategory: "Tech Giants",
      tickSize: "$0.01",
      contractSize: "100 shares",
      tradingHours: "9:30-16:00 ET",
    },
    // Financial Sector
    {
      symbol: "JPM",
      name: "JPMorgan Chase & Co.",
      description: "Largest US bank",
      category: "stocks",
      subcategory: "Financials",
      tickSize: "$0.01",
      contractSize: "100 shares",
      tradingHours: "9:30-16:00 ET",
    },
    {
      symbol: "BAC",
      name: "Bank of America Corp.",
      description: "Major US bank",
      category: "stocks",
      subcategory: "Financials",
      tickSize: "$0.01",
      contractSize: "100 shares",
      tradingHours: "9:30-16:00 ET",
    },
  ],
  crypto: [
    {
      symbol: "BTCUSD",
      name: "Bitcoin",
      description: "Digital gold - Leading cryptocurrency",
      category: "crypto",
      subcategory: "Major Crypto",
      tickSize: "$0.01",
      contractSize: "1 BTC",
      tradingHours: "24/7",
    },
    {
      symbol: "ETHUSD",
      name: "Ethereum",
      description: "Smart contract platform",
      category: "crypto",
      subcategory: "Major Crypto",
      tickSize: "$0.01",
      contractSize: "1 ETH",
      tradingHours: "24/7",
    },
    {
      symbol: "ADAUSD",
      name: "Cardano",
      description: "Proof-of-stake blockchain",
      category: "crypto",
      subcategory: "Altcoins",
      tickSize: "$0.0001",
      contractSize: "1 ADA",
      tradingHours: "24/7",
    },
    {
      symbol: "SOLUSD",
      name: "Solana",
      description: "High-performance blockchain",
      category: "crypto",
      subcategory: "Altcoins",
      tickSize: "$0.01",
      contractSize: "1 SOL",
      tradingHours: "24/7",
    },
  ],
  commodities: [
    {
      symbol: "GOLD",
      name: "Gold Spot",
      description: "Precious metal spot price",
      category: "commodities",
      subcategory: "Metals",
      tickSize: "$0.01",
      contractSize: "1 oz",
      tradingHours: "23:00-22:00 ET",
    },
    {
      symbol: "SILVER",
      name: "Silver Spot",
      description: "Industrial precious metal",
      category: "commodities",
      subcategory: "Metals",
      tickSize: "$0.001",
      contractSize: "1 oz",
      tradingHours: "23:00-22:00 ET",
    },
  ],
  options: [
    {
      symbol: "SPY",
      name: "SPDR S&P 500 ETF Options",
      description: "Most liquid ETF options",
      category: "options",
      subcategory: "Index Options",
      tickSize: "$0.01",
      contractSize: "100 shares",
      tradingHours: "9:30-16:00 ET",
    },
    {
      symbol: "QQQ",
      name: "Invesco QQQ ETF Options",
      description: "NASDAQ-100 ETF options",
      category: "options",
      subcategory: "Index Options",
      tickSize: "$0.01",
      contractSize: "100 shares",
      tradingHours: "9:30-16:00 ET",
    },
  ],
}

export const TIMEFRAME_OPTIONS = [
  { id: "scalping", label: "Scalping (Seconds to Minutes)", icon: "⚡" },
  { id: "day_trading", label: "Day Trading (Minutes to Hours, intraday)", icon: "🌅" },
  { id: "swing_trading", label: "Swing Trading (Days to Weeks)", icon: "🌊" },
  { id: "position_trading", label: "Position Trading (Weeks to Months)", icon: "🏔️" },
]

export const FEATURE_OPTIONS = [
  { id: "advanced_analytics", label: "Advanced Performance Analytics", icon: "📊" },
  { id: "screenshot_management", label: "Screenshot Upload & Management", icon: "📸" },
  { id: "strategy_backtesting", label: "Strategy Backtesting Tools", icon: "🔄" },
  { id: "trade_import", label: "Bulk Trade Import", icon: "📥" },
  { id: "custom_tags", label: "Customizable Tagging System", icon: "🏷️" },
  { id: "community_features", label: "Community Sharing / Insights", icon: "👥" },
  { id: "goal_setting", label: "Goal Setting & Progress Tracking", icon: "🎯" },
  { id: "mobile_access", label: "Mobile-Friendly Access", icon: "📱" },
]
