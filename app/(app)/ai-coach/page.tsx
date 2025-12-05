"use client"

import { useState } from "react"
// Fixed: Import EnhancedChatInterface instead of ChatInterface
import { EnhancedChatInterface } from "@/components/ai-chat/enhanced-chat-interface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bot,
  Brain,
  TrendingUp,
  Target,
  Shield,
  Lightbulb,
  BarChart3,
  Zap,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"

const AI_FEATURES = [
  {
    icon: Brain,
    title: "Performance Analysis",
    description: "Deep dive into your trading statistics and identify patterns",
    color: "text-purple-600",
  },
  {
    icon: Target,
    title: "Strategy Optimization",
    description: "Get recommendations to improve your best setups",
    color: "text-blue-600",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Personalized advice on position sizing and stop losses",
    color: "text-orange-600",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Trading opportunities based on your preferred instruments",
    color: "text-green-600",
  },
]

const COACHING_AREAS = [
  "Trading Psychology & Discipline",
  "Risk Management Strategies",
  "Setup Optimization",
  "Market Analysis Techniques",
  "Performance Improvement",
  "Trading Plan Development",
]

export default function AICoachPage() {
  const [showChat, setShowChat] = useState(false)

  if (showChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowChat(false)}
              className="mb-4 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ← Back to Overview
            </Button>
          </div>
          {/* Fixed: Use EnhancedChatInterface */}
          <EnhancedChatInterface />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-xl">
            <Bot className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Trading Coach
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
            Get personalized trading insights and recommendations powered by Groq AI with Llama 3.3, tailored
            specifically to your trading performance and statistics.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
              <Zap className="h-3 w-3 mr-1" />
              Powered by Groq • Llama 3.3
            </Badge>
            <Badge
              variant="outline"
              className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
            >
              <Star className="h-3 w-3 mr-1" />
              Personalized Analysis
            </Badge>
          </div>
          <Button
            onClick={() => setShowChat(true)}
            className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg font-medium shadow-xl"
          >
            Start Coaching Session
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {AI_FEATURES.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg bg-white dark:bg-slate-800 hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What You'll Learn */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              What You'll Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COACHING_AREAS.map((area, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Data Analysis</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI analyzes your complete trading history, performance metrics, and patterns
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Personalized Insights</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get tailored recommendations based on your specific strengths and weaknesses
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Actionable Advice</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Receive specific, actionable steps to improve your trading performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
