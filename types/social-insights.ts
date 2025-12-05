// Create this new file to hold specific types for social insights
// if they are not already defined in your main "@/types/index.ts"

export interface InstrumentPopularity {
  instrument: string
  trade_count: number
}

export interface InstrumentSentiment {
  instrument: string
  long_percentage: number
  short_percentage: number
  total_trades: number
}

export interface SetupPopularity {
  setup_name: string
  trade_count: number
}
