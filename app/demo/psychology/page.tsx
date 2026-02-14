"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, TrendingDown, Heart, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react"
import { PulseIcon } from "@/components/icons/system-icons"

// Mock psychology data
const emotionalData = {
  currentState: {
    confidence: 85,
    stress: 25,
    focus: 78,
    patience: 92,
  },
  recentMoods: [
    { date: "2025-01-21", mood: "Confident", trades: 3, pnl: 450, color: "green" },
    { date: "2025-01-20", mood: "Excited", trades: 4, pnl: 320, color: "yellow" },
    { date: "2025-01-19", mood: "Calm", trades: 2, pnl: 180, color: "blue" },
    { date: "2025-01-18", mood: "Frustrated", trades: 5, pnl: -240, color: "red" },
    { date: "2025-01-17", mood: "Confident", trades: 3, pnl: 380, color: "green" },
  ],
  patterns: [
    {
      pattern: "Overtrading when excited",
      frequency: "High",
      impact: "Negative",
      description: "You tend to take more trades when excited, leading to lower quality setups",
    },
    {
      pattern: "Best performance when calm",
      frequency: "Medium",
      impact: "Positive",
      description: "Your most profitable trades occur when you're in a calm, focused state",
    },
    {
      pattern: "Revenge trading after losses",
      frequency: "Low",
      impact: "Negative",
      description: "Occasional tendency to chase losses with larger position sizes",
    },
  ],
  recommendations: [
    {
      title: "Pre-trade Emotional Check",
      description: "Rate your emotional state before each trade on a 1-10 scale",
      priority: "High",
    },
    {
      title: "Meditation Practice",
      description: "5-minute mindfulness session before market open",
      priority: "Medium",
    },
    {
      title: "Trade Limit Rules",
      description: "Set maximum daily trade limits when feeling excited or frustrated",
      priority: "High",
    },
  ],
}

export default function DemoPsychology() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1W")

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Psychology Tracker</h1>
        <p className="text-gray-300">Monitor your emotional state and its impact on trading performance</p>
      </div>

      {/* Current Emotional State */}
      <Card className="bg-slate-800/50 border-purple-500/20 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Current Emotional State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - emotionalData.currentState.confidence / 100)}`}
                    className="text-green-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{emotionalData.currentState.confidence}%</span>
                </div>
              </div>
              <div className="text-gray-300">Confidence</div>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - emotionalData.currentState.stress / 100)}`}
                    className="text-red-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{emotionalData.currentState.stress}%</span>
                </div>
              </div>
              <div className="text-gray-300">Stress</div>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - emotionalData.currentState.focus / 100)}`}
                    className="text-blue-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{emotionalData.currentState.focus}%</span>
                </div>
              </div>
              <div className="text-gray-300">Focus</div>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - emotionalData.currentState.patience / 100)}`}
                    className="text-purple-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{emotionalData.currentState.patience}%</span>
                </div>
              </div>
              <div className="text-gray-300">Patience</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Mood History */}
      <Card className="bg-slate-800/50 border-purple-500/20 mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-400" />
              Recent Mood & Performance
            </CardTitle>
            <div className="flex gap-2">
              {["1W", "1M", "3M"].map((period) => (
                <Button
                  key={period}
                  variant={selectedTimeframe === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(period)}
                  className={selectedTimeframe === period ? "bg-purple-600" : "border-purple-500/30 text-purple-400"}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emotionalData.recentMoods.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-white font-medium">{entry.date}</div>
                  <Badge
                    className={`${
                      entry.color === "green"
                        ? "bg-green-500/20 text-green-400"
                        : entry.color === "yellow"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : entry.color === "blue"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {entry.mood}
                  </Badge>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Trades</div>
                    <div className="text-white font-semibold">{entry.trades}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">P&L</div>
                    <div
                      className={`font-semibold flex items-center gap-1 ${
                        entry.pnl > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {entry.pnl > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {entry.pnl > 0 ? "+" : ""}${entry.pnl}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Patterns */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Behavioral Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emotionalData.patterns.map((pattern, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{pattern.pattern}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                        {pattern.frequency}
                      </Badge>
                      <Badge
                        className={`${
                          pattern.impact === "Positive"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {pattern.impact}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{pattern.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PulseIcon className="h-5 w-5 text-purple-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emotionalData.recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{rec.title}</h4>
                    <Badge
                      className={`${
                        rec.priority === "High" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm">{rec.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emotional Impact Analysis */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Emotional Impact on Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-400 mb-2">+$2,340</div>
              <div className="text-gray-300">Profit from calm/confident states</div>
            </div>
            <div className="text-center p-6 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-red-400 mb-2">-$890</div>
              <div className="text-gray-300">Losses from emotional states</div>
            </div>
            <div className="text-center p-6 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Brain className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-400 mb-2">73%</div>
              <div className="text-gray-300">Emotional awareness score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
