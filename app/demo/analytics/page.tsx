"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Target, Brain, AlertTriangle, CheckCircle } from "lucide-react"

// Mock analytics data
const performanceData = {
  byTimeOfDay: [
    { time: "9:30-10:30", trades: 45, winRate: 78, avgPnL: 125 },
    { time: "10:30-11:30", trades: 38, winRate: 65, avgPnL: 89 },
    { time: "11:30-12:30", trades: 22, winRate: 55, avgPnL: 45 },
    { time: "12:30-13:30", trades: 15, winRate: 47, avgPnL: -12 },
    { time: "13:30-14:30", trades: 28, winRate: 71, avgPnL: 98 },
    { time: "14:30-15:30", trades: 35, winRate: 69, avgPnL: 112 },
    { time: "15:30-16:00", trades: 41, winRate: 82, avgPnL: 156 },
  ],
  byDayOfWeek: [
    { day: "Monday", trades: 52, winRate: 68, avgPnL: 95 },
    { day: "Tuesday", trades: 48, winRate: 75, avgPnL: 128 },
    { day: "Wednesday", trades: 45, winRate: 71, avgPnL: 102 },
    { day: "Thursday", trades: 51, winRate: 73, avgPnL: 118 },
    { day: "Friday", trades: 28, winRate: 54, avgPnL: 32 },
  ],
  bySetup: [
    { setup: "Breakout", trades: 89, winRate: 76, avgPnL: 145 },
    { setup: "Support Bounce", trades: 67, winRate: 71, avgPnL: 98 },
    { setup: "Gap and Go", trades: 34, winRate: 82, avgPnL: 189 },
    { setup: "Failed Breakdown", trades: 23, winRate: 43, avgPnL: -45 },
    { setup: "Momentum", trades: 56, winRate: 69, avgPnL: 87 },
  ],
  emotionalPatterns: [
    { emotion: "Confident", trades: 78, winRate: 81, avgPnL: 156 },
    { emotion: "Calm", trades: 65, winRate: 75, avgPnL: 112 },
    { emotion: "Excited", trades: 45, winRate: 67, avgPnL: 89 },
    { emotion: "Frustrated", trades: 32, winRate: 34, avgPnL: -78 },
    { emotion: "Fearful", trades: 18, winRate: 28, avgPnL: -145 },
  ],
}

const insights = [
  {
    type: "positive",
    title: "Best Performance Window",
    description: "You perform exceptionally well during market open (9:30-10:30) with 78% win rate",
    action: "Focus more capital during this time window",
  },
  {
    type: "warning",
    title: "Lunch Hour Weakness",
    description: "Performance drops significantly during 12:30-13:30 with only 47% win rate",
    action: "Consider avoiding trades during lunch hour",
  },
  {
    type: "positive",
    title: "Gap and Go Mastery",
    description: "Your gap and go setups have 82% win rate - your strongest strategy",
    action: "Increase position size on high-confidence gap plays",
  },
  {
    type: "warning",
    title: "Emotional Trading Impact",
    description: "Frustrated and fearful states lead to significant losses",
    action: "Implement emotional check-ins before trading",
  },
]

export default function DemoAnalytics() {
  const [activeTab, setActiveTab] = useState("time")

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Advanced Analytics</h1>
        <p className="text-gray-300">AI-powered insights to optimize your trading performance</p>
      </div>

      {/* Key Insights */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {insights.map((insight, index) => (
          <Card key={index} className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {insight.type === "positive" ? (
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">{insight.title}</h3>
                  <p className="text-gray-300 mb-3">{insight.description}</p>
                  <Badge
                    className={`${
                      insight.type === "positive"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {insight.action}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg w-fit">
          {[
            { id: "time", label: "Time Analysis", icon: Clock },
            { id: "day", label: "Day Analysis", icon: Calendar },
            { id: "setup", label: "Setup Analysis", icon: Target },
            { id: "emotion", label: "Emotional Analysis", icon: Brain },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`${activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Analytics Content */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">
            {activeTab === "time" && "Performance by Time of Day"}
            {activeTab === "day" && "Performance by Day of Week"}
            {activeTab === "setup" && "Performance by Setup Type"}
            {activeTab === "emotion" && "Performance by Emotional State"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Time Analysis */}
            {activeTab === "time" &&
              performanceData.byTimeOfDay.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-semibold text-white w-24">{data.time}</div>
                    <div className="text-gray-400">{data.trades} trades</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div
                        className={`font-semibold ${data.winRate > 70 ? "text-green-400" : data.winRate > 50 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {data.winRate}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Avg P&L</div>
                      <div className={`font-semibold ${data.avgPnL > 0 ? "text-green-400" : "text-red-400"}`}>
                        ${data.avgPnL}
                      </div>
                    </div>
                    <div className="w-32 h-2 bg-slate-600 rounded-full">
                      <div
                        className={`h-full rounded-full ${data.winRate > 70 ? "bg-green-400" : data.winRate > 50 ? "bg-yellow-400" : "bg-red-400"}`}
                        style={{ width: `${data.winRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

            {/* Day Analysis */}
            {activeTab === "day" &&
              performanceData.byDayOfWeek.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-semibold text-white w-24">{data.day}</div>
                    <div className="text-gray-400">{data.trades} trades</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div
                        className={`font-semibold ${data.winRate > 70 ? "text-green-400" : data.winRate > 50 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {data.winRate}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Avg P&L</div>
                      <div className={`font-semibold ${data.avgPnL > 0 ? "text-green-400" : "text-red-400"}`}>
                        ${data.avgPnL}
                      </div>
                    </div>
                    <div className="w-32 h-2 bg-slate-600 rounded-full">
                      <div
                        className={`h-full rounded-full ${data.winRate > 70 ? "bg-green-400" : data.winRate > 50 ? "bg-yellow-400" : "bg-red-400"}`}
                        style={{ width: `${data.winRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

            {/* Setup Analysis */}
            {activeTab === "setup" &&
              performanceData.bySetup.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-semibold text-white w-32">{data.setup}</div>
                    <div className="text-gray-400">{data.trades} trades</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div
                        className={`font-semibold ${data.winRate > 70 ? "text-green-400" : data.winRate > 50 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {data.winRate}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Avg P&L</div>
                      <div className={`font-semibold ${data.avgPnL > 0 ? "text-green-400" : "text-red-400"}`}>
                        ${data.avgPnL}
                      </div>
                    </div>
                    <div className="w-32 h-2 bg-slate-600 rounded-full">
                      <div
                        className={`h-full rounded-full ${data.winRate > 70 ? "bg-green-400" : data.winRate > 50 ? "bg-yellow-400" : "bg-red-400"}`}
                        style={{ width: `${data.winRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

            {/* Emotional Analysis */}
            {activeTab === "emotion" &&
              performanceData.emotionalPatterns.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-semibold text-white w-24">{data.emotion}</div>
                    <div className="text-gray-400">{data.trades} trades</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div
                        className={`font-semibold ${data.winRate > 70 ? "text-green-400" : data.winRate > 50 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {data.winRate}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Avg P&L</div>
                      <div className={`font-semibold ${data.avgPnL > 0 ? "text-green-400" : "text-red-400"}`}>
                        ${data.avgPnL}
                      </div>
                    </div>
                    <div className="w-32 h-2 bg-slate-600 rounded-full">
                      <div
                        className={`h-full rounded-full ${data.winRate > 70 ? "bg-green-400" : data.winRate > 50 ? "bg-yellow-400" : "bg-red-400"}`}
                        style={{ width: `${data.winRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
