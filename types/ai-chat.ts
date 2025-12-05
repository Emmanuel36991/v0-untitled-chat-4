export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export interface UserTradingContext {
  totalTrades: number
  winRate: number
  totalPnl: number
  avgPnlPerTrade: number
  maxDrawdown: number
  profitFactor: number
  bestSetup: string
  worstSetup: string
  favoriteInstrument: string
  recentPerformance: string
  riskManagement: string
  tradingFrequency: string
  preferredMethodologies: string[]
  tradingExperience: string
}

export interface AIInsight {
  type: "performance" | "risk" | "strategy" | "psychology" | "market"
  title: string
  description: string
  actionItems: string[]
  priority: "high" | "medium" | "low"
  confidence: number
}

export interface ChatSession {
  id: string
  userId: string
  messages: ChatMessage[]
  context: UserTradingContext
  insights: AIInsight[]
  createdAt: Date
  updatedAt: Date
}
