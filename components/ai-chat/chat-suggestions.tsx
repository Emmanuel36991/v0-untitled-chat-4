"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Target, Brain, Shield, BarChart3, Lightbulb, AlertTriangle, CheckCircle2, Zap } from "lucide-react"

interface ChatSuggestionsProps {
  userStats?: {
    totalTrades: number
    winRate: number
    totalPnl: number
    profitFactor: number
    riskManagement: string
  }
  onSuggestionClick: (suggestion: string) => void
}

export function ChatSuggestions({ userStats, onSuggestionClick }: ChatSuggestionsProps) {
  // Generate dynamic suggestions based on user stats
  const generateSuggestions = () => {
    if (!userStats || userStats.totalTrades === 0) {
      return [
        {
          icon: Lightbulb,
          text: "How do I start trading with proper risk management?",
          color: "text-yellow-600",
          category: "Getting Started",
        },
        {
          icon: Shield,
          text: "What's the best position sizing strategy for beginners?",
          color: "text-orange-600",
          category: "Risk Management",
        },
        {
          icon: Target,
          text: "Help me create my first trading plan",
          color: "text-blue-600",
          category: "Strategy",
        },
        {
          icon: Brain,
          text: "What trading psychology principles should I know?",
          color: "text-purple-600",
          category: "Psychology",
        },
      ]
    }

    const suggestions = []

    // Performance-based suggestions
    if (userStats.winRate < 50) {
      suggestions.push({
        icon: TrendingUp,
        text: "How can I improve my win rate from " + userStats.winRate.toFixed(1) + "%?",
        color: "text-red-600",
        category: "Performance",
      })
    } else if (userStats.winRate > 70) {
      suggestions.push({
        icon: CheckCircle2,
        text: "My win rate is great! How can I increase my profit per trade?",
        color: "text-green-600",
        category: "Optimization",
      })
    }

    // P&L-based suggestions
    if (userStats.totalPnl < 0) {
      suggestions.push({
        icon: AlertTriangle,
        text: "I'm in drawdown. What should I do to recover?",
        color: "text-red-600",
        category: "Recovery",
      })
    } else {
      suggestions.push({
        icon: TrendingUp,
        text: "How can I scale up my profitable trading?",
        color: "text-green-600",
        category: "Growth",
      })
    }

    // Profit factor suggestions
    if (userStats.profitFactor < 1.5) {
      suggestions.push({
        icon: BarChart3,
        text: "My profit factor is " + userStats.profitFactor.toFixed(2) + ". How can I improve it?",
        color: "text-orange-600",
        category: "Metrics",
      })
    }

    // Risk management suggestions
    if (userStats.riskManagement === "Poor" || userStats.riskManagement === "Fair") {
      suggestions.push({
        icon: Shield,
        text: "Help me improve my risk management practices",
        color: "text-red-600",
        category: "Risk",
      })
    }

    // Always include some general suggestions
    suggestions.push(
      {
        icon: Target,
        text: "Analyze my best trading setups and patterns",
        color: "text-blue-600",
        category: "Analysis",
      },
      {
        icon: Brain,
        text: "What trading psychology tips do you have for me?",
        color: "text-purple-600",
        category: "Psychology",
      },
      {
        icon: Zap,
        text: "What should I focus on next to improve?",
        color: "text-indigo-600",
        category: "Next Steps",
      },
    )

    return suggestions.slice(0, 6) // Limit to 6 suggestions
  }

  const suggestions = generateSuggestions()

  return (
    <Card className="border-0 shadow-sm bg-slate-50 dark:bg-slate-900">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Suggested Questions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => onSuggestionClick(suggestion.text)}
              className="h-auto p-3 text-left justify-start hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start gap-3 w-full">
                <suggestion.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${suggestion.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{suggestion.category}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
                    {suggestion.text}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
