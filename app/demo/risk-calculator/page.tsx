"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, Target, DollarSign, AlertTriangle, Shield, BarChart3 } from "lucide-react"

export default function DemoRiskCalculator() {
  const [accountSize, setAccountSize] = useState("50000")
  const [riskPercent, setRiskPercent] = useState("2")
  const [entryPrice, setEntryPrice] = useState("150.00")
  const [stopLoss, setStopLoss] = useState("147.50")
  const [targetPrice, setTargetPrice] = useState("156.00")

  // Calculations
  const accountValue = Number.parseFloat(accountSize) || 0
  const riskPercentage = Number.parseFloat(riskPercent) || 0
  const entry = Number.parseFloat(entryPrice) || 0
  const stop = Number.parseFloat(stopLoss) || 0
  const target = Number.parseFloat(targetPrice) || 0

  const riskAmount = (accountValue * riskPercentage) / 100
  const riskPerShare = Math.abs(entry - stop)
  const positionSize = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0
  const potentialProfit = (target - entry) * positionSize
  const riskRewardRatio = riskPerShare > 0 ? Math.abs(target - entry) / riskPerShare : 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Risk Calculator</h1>
        <p className="text-gray-300">Calculate optimal position sizes and manage your trading risk</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-400" />
              Trade Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountSize" className="text-gray-300">
                  Account Size
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="accountSize"
                    value={accountSize}
                    onChange={(e) => setAccountSize(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-purple-500/20 text-white"
                    placeholder="50000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="riskPercent" className="text-gray-300">
                  Risk %
                </Label>
                <Input
                  id="riskPercent"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="bg-slate-700/50 border-purple-500/20 text-white"
                  placeholder="2"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="entryPrice" className="text-gray-300">
                  Entry Price
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="entryPrice"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-purple-500/20 text-white"
                    placeholder="150.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="stopLoss" className="text-gray-300">
                  Stop Loss
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="stopLoss"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-purple-500/20 text-white"
                    placeholder="147.50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="targetPrice" className="text-gray-300">
                  Target Price
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="targetPrice"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-purple-500/20 text-white"
                    placeholder="156.00"
                  />
                </div>
              </div>
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700">Calculate Position Size</Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">{positionSize.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Shares to Buy</div>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">${riskAmount.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Risk Amount</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">${potentialProfit.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Potential Profit</div>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{riskRewardRatio.toFixed(2)}:1</div>
                <div className="text-gray-300 text-sm">Risk/Reward</div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-gray-300">Position Value</span>
                <span className="text-white font-semibold">${(entry * positionSize).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-gray-300">% of Account at Risk</span>
                <span className="text-white font-semibold">{riskPercent}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-gray-300">Risk per Share</span>
                <span className="text-white font-semibold">${riskPerShare.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Management Tips */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Conservative Risk</h3>
            <p className="text-gray-300 text-sm mb-3">Risk 1-2% of account per trade for steady growth</p>
            <div className="text-green-400 font-bold">Recommended</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-yellow-500/20">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Moderate Risk</h3>
            <p className="text-gray-300 text-sm mb-3">Risk 2-3% for more aggressive growth with higher volatility</p>
            <div className="text-yellow-400 font-bold">Acceptable</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-red-500/20">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">High Risk</h3>
            <p className="text-gray-300 text-sm mb-3">
              Risk &gt;3% can lead to significant drawdowns and account damage
            </p>
            <div className="text-red-400 font-bold">Dangerous</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Presets */}
      <Card className="bg-slate-800/50 border-purple-500/20 mt-8">
        <CardHeader>
          <CardTitle className="text-white">Quick Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="border-purple-500/30 text-purple-400 bg-transparent"
              onClick={() => {
                setAccountSize("25000")
                setRiskPercent("1")
                setEntryPrice("100.00")
                setStopLoss("98.00")
                setTargetPrice("106.00")
              }}
            >
              Conservative
            </Button>
            <Button
              variant="outline"
              className="border-purple-500/30 text-purple-400 bg-transparent"
              onClick={() => {
                setAccountSize("50000")
                setRiskPercent("2")
                setEntryPrice("150.00")
                setStopLoss("147.50")
                setTargetPrice("156.00")
              }}
            >
              Balanced
            </Button>
            <Button
              variant="outline"
              className="border-purple-500/30 text-purple-400 bg-transparent"
              onClick={() => {
                setAccountSize("100000")
                setRiskPercent("2.5")
                setEntryPrice("200.00")
                setStopLoss("195.00")
                setTargetPrice("212.50")
              }}
            >
              Aggressive
            </Button>
            <Button
              variant="outline"
              className="border-purple-500/30 text-purple-400 bg-transparent"
              onClick={() => {
                setAccountSize("10000")
                setRiskPercent("1.5")
                setEntryPrice("50.00")
                setStopLoss("48.50")
                setTargetPrice("54.00")
              }}
            >
              Small Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
