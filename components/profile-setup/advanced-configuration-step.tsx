"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { Settings, TrendingUp, Clock, Zap } from "lucide-react"
import type { TradingPreferences } from "@/types/user-config"

interface AdvancedConfigurationStepProps {
  tradingPreferences: TradingPreferences
  onUpdate: (preferences: Partial<TradingPreferences>) => void
}

export function AdvancedConfigurationStep({ tradingPreferences, onUpdate }: AdvancedConfigurationStepProps) {
  const handleToggle = (field: keyof TradingPreferences, value: boolean) => {
    onUpdate({ [field]: value })
  }

  const handleSelect = (field: keyof TradingPreferences, value: string) => {
    onUpdate({ [field]: value })
  }

  const handleNumberChange = (field: keyof TradingPreferences, value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue)) {
      onUpdate({ [field]: numValue })
    }
  }

  const handleTimeChange = (field: keyof TradingPreferences, value: string) => {
    onUpdate({ [field]: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Advanced Configuration</h3>
        <p className="text-muted-foreground mb-6">
          Fine-tune your trading environment with advanced settings for risk management, account tracking, and
          automation.
        </p>
      </div>

      {/* Risk Tolerance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Risk Tolerance</h4>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Define your risk appetite for position sizing recommendations
        </p>
        <Select
          value={tradingPreferences.riskToleranceLevel || "moderate"}
          onValueChange={(value) => handleSelect("riskToleranceLevel", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conservative">
              <span className="flex items-center gap-2">🛡️ Conservative - Low risk tolerance, small position sizes</span>
            </SelectItem>
            <SelectItem value="moderate">
              <span className="flex items-center gap-2">⚖️ Moderate - Balanced risk/reward approach</span>
            </SelectItem>
            <SelectItem value="aggressive">
              <span className="flex items-center gap-2">🚀 Aggressive - Higher risk tolerance for larger gains</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Default Risk-Reward Ratio */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Default Risk-Reward Ratio
        </label>
        <p className="text-sm text-muted-foreground mb-3">Set your target R:R for new trades (e.g., 2 = 1:2 ratio)</p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">1 :</span>
          <Input
            type="number"
            step="0.1"
            min="0.1"
            value={tradingPreferences.defaultRiskRewardRatio || "2"}
            onChange={(e) => handleNumberChange("defaultRiskRewardRatio", e.target.value)}
            placeholder="2.0"
            className="w-24"
          />
        </div>
      </div>

      {/* Trading Hours */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Preferred Trading Hours</h4>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Set your typical trading session times (24-hour format)</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm mb-2 block">Start Time</Label>
            <Input
              type="time"
              value={tradingPreferences.tradingHoursStart || "09:30"}
              onChange={(e) => handleTimeChange("tradingHoursStart", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm mb-2 block">End Time</Label>
            <Input
              type="time"
              value={tradingPreferences.tradingHoursEnd || "16:00"}
              onChange={(e) => handleTimeChange("tradingHoursEnd", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Features Toggle */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Feature Toggles</h4>
        </div>

        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Account Size Tracking</p>
                <p className="text-sm text-muted-foreground">Track account balance over time for performance metrics</p>
              </div>
              <Toggle
                pressed={tradingPreferences.accountSizeTracking ?? false}
                onPressedChange={(pressed) => handleToggle("accountSizeTracking", pressed)}
                className="data-[state=on]:bg-primary"
              >
                {tradingPreferences.accountSizeTracking ? "ON" : "OFF"}
              </Toggle>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-Tagging</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically tag trades based on your selected methodology
                  </p>
                </div>
                <Toggle
                  pressed={tradingPreferences.enableAutoTags ?? false}
                  onPressedChange={(pressed) => handleToggle("enableAutoTags", pressed)}
                  className="data-[state=on]:bg-primary"
                >
                  {tradingPreferences.enableAutoTags ? "ON" : "OFF"}
                </Toggle>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="p-4">
          <h5 className="font-semibold text-foreground mb-2">Pro Tips</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Set conservative risk tolerance if you're still building your trading system</li>
            <li>• Default R:R helps maintain consistency across your trading journal</li>
            <li>• Enable account tracking to monitor equity curve and growth</li>
            <li>• Auto-tagging helps you quickly identify your best-performing strategies</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
