"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TradingPreferences } from "@/types/user-config"

interface StrategyVisibilityStepProps {
  tradingPreferences: TradingPreferences
  onUpdate: (preferences: Partial<TradingPreferences>) => void
}

// Define available trading strategies
const TRADING_STRATEGIES = [
  {
    id: "trend_following",
    name: "Trend Following",
    description: "Trade in the direction of established trends using higher timeframes",
    icon: "📈",
    category: "momentum",
  },
  {
    id: "mean_reversion",
    name: "Mean Reversion",
    description: "Fade extremes and trade back to average prices",
    icon: "↕️",
    category: "oscillator",
  },
  {
    id: "breakout",
    name: "Breakout Trading",
    description: "Trade breaks above resistance or below support levels",
    icon: "🔨",
    category: "volatility",
  },
  {
    id: "range_trading",
    name: "Range Trading",
    description: "Buy at support and sell at resistance within defined ranges",
    icon: "📦",
    category: "consolidation",
  },
  {
    id: "scalping",
    name: "Scalping",
    description: "Quick trades capturing small moves on lower timeframes",
    icon: "⚡",
    category: "intraday",
  },
  {
    id: "swing_trading",
    name: "Swing Trading",
    description: "Hold positions for days to weeks capturing swings",
    icon: "🌊",
    category: "multi_day",
  },
  {
    id: "arbitrage",
    name: "Arbitrage",
    description: "Exploit price differences across markets or timeframes",
    icon: "🔄",
    category: "risk_free",
  },
  {
    id: "ichimoku",
    name: "Ichimoku Cloud",
    description: "Japanese technical analysis method using cloud formations",
    icon: "☁️",
    category: "indicator",
  },
]

export function TradingStrategiesVisibilityStep({ tradingPreferences, onUpdate }: StrategyVisibilityStepProps) {
  const visibleStrategies = tradingPreferences.visibleStrategies || []
  const enabledMethodologies = tradingPreferences.methodologies || []

  const toggleStrategyVisibility = (strategyId: string) => {
    const newVisible = visibleStrategies.includes(strategyId)
      ? visibleStrategies.filter((s) => s !== strategyId)
      : [...visibleStrategies, strategyId]
    onUpdate({ visibleStrategies: newVisible })
  }

  const groupedStrategies = TRADING_STRATEGIES.reduce(
    (acc, strategy) => {
      if (!acc[strategy.category]) {
        acc[strategy.category] = []
      }
      acc[strategy.category].push(strategy)
      return acc
    },
    {} as Record<string, typeof TRADING_STRATEGIES>,
  )

  const categoryLabels: Record<string, string> = {
    momentum: "Momentum Strategies",
    oscillator: "Oscillator Strategies",
    volatility: "Volatility Strategies",
    consolidation: "Consolidation Strategies",
    intraday: "Intraday Strategies",
    multi_day: "Multi-Day Strategies",
    risk_free: "Risk-Free Strategies",
    indicator: "Indicator-Based Strategies",
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Trading Strategies Visibility</h3>
        <p className="text-muted-foreground mb-6">
          Select which trading strategies will be available when adding trades. This helps you focus on your preferred
          trading methods and keeps your trade entry form organized.
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visible Strategies: {visibleStrategies.length} of {TRADING_STRATEGIES.length}
          </p>
        </CardContent>
      </Card>

      {/* Strategies by Category */}
      <div className="space-y-6">
        {Object.entries(groupedStrategies).map(([category, strategies]) => {
          const categoryVisibleCount = strategies.filter((s) => visibleStrategies.includes(s.id)).length

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">{categoryLabels[category]}</h4>
                <Badge variant="outline" className="text-xs">
                  {categoryVisibleCount} of {strategies.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strategies.map((strategy) => {
                  const isVisible = visibleStrategies.includes(strategy.id)

                  return (
                    <div
                      key={strategy.id}
                      onClick={() => toggleStrategyVisibility(strategy.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all cursor-pointer",
                        isVisible
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
                          : "border-border bg-card hover:border-primary/50 hover:shadow-sm",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{strategy.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-foreground text-sm">{strategy.name}</h5>
                            {isVisible && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{strategy.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
