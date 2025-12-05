"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, TrendingDown } from "lucide-react"

export const HexagramSelector = ({ hexagrams, selectedHexagram, onHexagramSelect }) => {
  const renderMiniHexagram = (binaryPattern) => {
    if (!binaryPattern || binaryPattern.length !== 6) return null

    return (
      <div className="flex flex-col space-y-0.5">
        {binaryPattern
          .split("")
          .reverse()
          .map((line, index) => (
            <div key={index} className="flex justify-center">
              {line === "1" ? (
                <div className="w-4 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
              ) : (
                <div className="flex space-x-0.5">
                  <div className="w-1.5 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
                  <div className="w-1.5 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
                </div>
              )}
            </div>
          ))}
      </div>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Target className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-white font-medium">Active Hexagram</h3>
              <p className="text-slate-400 text-sm">Select hexagram for detailed analysis</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Select
              value={selectedHexagram?.id || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  onHexagramSelect(null)
                } else {
                  const selected = hexagrams.find((h) => h.id === value)
                  onHexagramSelect(selected)
                }
              }}
            >
              <SelectTrigger className="w-64 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Choose a hexagram" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-slate-400">
                  All Hexagrams
                </SelectItem>
                {hexagrams.map((hex) => (
                  <SelectItem key={hex.id} value={hex.id} className="text-white hover:bg-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {hex.number}
                      </div>
                      <span>{hex.name}</span>
                      <div className="ml-auto">{renderMiniHexagram(hex.binary_pattern)}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedHexagram && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div
                    className={`flex items-center text-sm font-medium ${
                      selectedHexagram.profit_loss >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {selectedHexagram.profit_loss >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    ${Math.abs(selectedHexagram.profit_loss).toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">{selectedHexagram.win_rate}% win rate</div>
                </div>
                <Badge
                  variant={
                    selectedHexagram.market_condition === "bullish"
                      ? "default"
                      : selectedHexagram.market_condition === "bearish"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {selectedHexagram.market_condition?.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
