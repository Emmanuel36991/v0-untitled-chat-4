"use client"
import { useState, useEffect } from "react"
import { useUserConfig } from "@/hooks/use-user-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { METHODOLOGY_OPTIONS, INSTRUMENT_CATEGORIES, INSTRUMENT_MAPPINGS, TIMEFRAME_OPTIONS } from "@/types/user-config"
import { Save, CheckCircle2 } from "lucide-react"

export default function TradingConfigurationPage() {
  const { config, updateConfig, isLoaded } = useUserConfig()
  const [mounted, setMounted] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [searchQuery, setSearchQuery] = useState("")

  // Local state for form
  const [visibleMethodologies, setVisibleMethodologies] = useState<string[]>([])
  const [visibleInstruments, setVisibleInstruments] = useState<string[]>([])
  const [visibleTimeframes, setVisibleTimeframes] = useState<string[]>([])
  const [riskTolerance, setRiskTolerance] = useState("moderate")
  const [tradingHoursStart, setTradingHoursStart] = useState("09:00")
  const [tradingHoursEnd, setTradingHoursEnd] = useState("17:00")
  const [accountSizeTracking, setAccountSizeTracking] = useState(false)
  const [defaultRRRatio, setDefaultRRRatio] = useState("1:2")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isLoaded && config) {
      setVisibleMethodologies(config.tradingPreferences?.methodologies || [])
      setVisibleInstruments(config.tradingPreferences?.visibleInstruments || [])
      setVisibleTimeframes(
        config.tradingPreferences?.typicalTimeframe ? [config.tradingPreferences.typicalTimeframe] : [],
      )
      setRiskTolerance(config.tradingPreferences?.riskToleranceLevel || "moderate")
      setTradingHoursStart(config.tradingPreferences?.tradingHoursStart || "09:00")
      setTradingHoursEnd(config.tradingPreferences?.tradingHoursEnd || "17:00")
      setAccountSizeTracking(config.tradingPreferences?.accountSizeTracking || false)
      setDefaultRRRatio(String(config.tradingPreferences?.defaultRiskRewardRatio || "1:2"))
    }
  }, [config, isLoaded])

  const handleSaveConfiguration = async () => {
    setSaveStatus("saving")
    try {
      await updateConfig({
        tradingPreferences: {
          ...config?.tradingPreferences,
          methodologies: visibleMethodologies,
          visibleInstruments: visibleInstruments,
          typicalTimeframe: visibleTimeframes[0],
          riskToleranceLevel: riskTolerance as "conservative" | "moderate" | "aggressive",
          tradingHoursStart,
          tradingHoursEnd,
          accountSizeTracking,
          defaultRiskRewardRatio:
            Number.parseFloat(defaultRRRatio.split(":")[0]) / Number.parseFloat(defaultRRRatio.split(":")[1] || "1"),
        },
      })
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      console.error("Failed to save configuration:", error)
      setSaveStatus("idle")
    }
  }

  const toggleMethodology = (methodId: string) => {
    setVisibleMethodologies((prev) =>
      prev.includes(methodId) ? prev.filter((m) => m !== methodId) : [...prev, methodId],
    )
  }

  const toggleInstrument = (symbol: string) => {
    setVisibleInstruments((prev) => (prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]))
  }

  const toggleCategory = (categoryId: string) => {
    const categoryInstruments = INSTRUMENT_MAPPINGS[categoryId]?.map((i) => i.symbol) || []
    const allSelected = categoryInstruments.every((s) => visibleInstruments.includes(s))

    if (allSelected) {
      setVisibleInstruments((prev) => prev.filter((s) => !categoryInstruments.includes(s)))
    } else {
      setVisibleInstruments((prev) => [...new Set([...prev, ...categoryInstruments])])
    }
  }

  const getFilteredInstruments = (categoryId: string) => {
    const instruments = INSTRUMENT_MAPPINGS[categoryId] || []
    if (!searchQuery) return instruments
    return instruments.filter(
      (i) =>
        i.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  if (!isLoaded || !mounted) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Trading Configuration</CardTitle>
            <CardDescription>Loading your settings...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center min-h-[200px]">
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Trading Configuration</h1>
        <p className="text-muted-foreground">
          Customize your trading preferences, visible instruments, methodologies, and account settings
        </p>
      </div>

      <Tabs defaultValue="methodologies" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="methodologies">Methodologies</TabsTrigger>
          <TabsTrigger value="instruments">Instruments</TabsTrigger>
          <TabsTrigger value="timeframes">Timeframes</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Methodologies Tab */}
        <TabsContent value="methodologies">
          <Card>
            <CardHeader>
              <CardTitle>Trading Methodologies</CardTitle>
              <CardDescription>
                Select which trading methodologies will be visible when adding trades. Only checked methodologies will
                appear in your trade entry form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {METHODOLOGY_OPTIONS.map((methodology) => (
                  <div
                    key={methodology.id}
                    className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition"
                  >
                    <Checkbox
                      id={`method-${methodology.id}`}
                      checked={visibleMethodologies.includes(methodology.id)}
                      onCheckedChange={() => toggleMethodology(methodology.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={`method-${methodology.id}`} className="text-base font-semibold cursor-pointer">
                        {methodology.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{methodology.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Visibility:</strong> When you add a new trade, only the methodologies you check above will
                  appear as options in the methodology dropdown. This helps keep your form clean and focused on what you
                  actually trade.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instruments Tab */}
        <TabsContent value="instruments">
          <Card>
            <CardHeader>
              <CardTitle>Visible Instruments</CardTitle>
              <CardDescription>
                Choose which instruments will appear when adding trades. Organize by category or search for specific
                symbols.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div>
                <Label htmlFor="instrument-search" className="mb-2 block">
                  Search Instruments
                </Label>
                <Input
                  id="instrument-search"
                  placeholder="Search by symbol (ES, EURUSD, AAPL) or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
              </div>

              {/* Categories */}
              <div className="space-y-6">
                {INSTRUMENT_CATEGORIES.map((category) => {
                  const instruments = getFilteredInstruments(category.id)
                  if (instruments.length === 0 && searchQuery) return null

                  const categoryInstruments = INSTRUMENT_MAPPINGS[category.id]?.map((i) => i.symbol) || []
                  const allSelected = categoryInstruments.every((s) => visibleInstruments.includes(s))
                  const someSelected = categoryInstruments.some((s) => visibleInstruments.includes(s))

                  return (
                    <div key={category.id} className="border border-border rounded-lg p-4">
                      {/* Category Header */}
                      <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-border">
                        <Checkbox
                          id={`cat-${category.id}`}
                          checked={allSelected}
                          ref={(node) => {
                            if (node) {
                              node.indeterminate = someSelected && !allSelected
                            }
                          }}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`cat-${category.id}`} className="text-base font-semibold cursor-pointer">
                            {category.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {categoryInstruments.filter((s) => visibleInstruments.includes(s)).length}/
                          {categoryInstruments.length}
                        </span>
                      </div>

                      {/* Category Instruments */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {instruments.map((instrument) => (
                          <div key={instrument.symbol} className="flex items-start space-x-2">
                            <Checkbox
                              id={`inst-${instrument.symbol}`}
                              checked={visibleInstruments.includes(instrument.symbol)}
                              onCheckedChange={() => toggleInstrument(instrument.symbol)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <Label
                                htmlFor={`inst-${instrument.symbol}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {instrument.symbol}
                              </Label>
                              <p className="text-xs text-muted-foreground truncate">{instrument.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Visibility:</strong> Only instruments you select will appear in the instrument dropdown when
                  adding a new trade. Use categories to quickly select multiple instruments at once.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeframes Tab */}
        <TabsContent value="timeframes">
          <Card>
            <CardHeader>
              <CardTitle>Trading Timeframes</CardTitle>
              <CardDescription>Select your primary trading timeframe(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {TIMEFRAME_OPTIONS.map((timeframe) => (
                  <div
                    key={timeframe.id}
                    className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition"
                  >
                    <Checkbox
                      id={`tf-${timeframe.id}`}
                      checked={visibleTimeframes.includes(timeframe.id)}
                      onCheckedChange={() => {
                        setVisibleTimeframes((prev) =>
                          prev.includes(timeframe.id) ? prev.filter((t) => t !== timeframe.id) : [timeframe.id],
                        )
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={`tf-${timeframe.id}`} className="text-base font-semibold cursor-pointer">
                        {timeframe.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Your primary trading timeframe helps personalize your trading experience and analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Configure your trading account preferences and risk management settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Tolerance */}
              <div className="space-y-3">
                <Label htmlFor="risk-tolerance" className="text-base font-semibold">
                  Risk Tolerance Level
                </Label>
                <p className="text-sm text-muted-foreground">How much risk are you comfortable taking per trade?</p>
                <select
                  id="risk-tolerance"
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="conservative">Conservative (0.5-1% per trade)</option>
                  <option value="moderate">Moderate (1-2% per trade)</option>
                  <option value="aggressive">Aggressive (2-5% per trade)</option>
                </select>
              </div>

              <Separator />

              {/* Default R:R Ratio */}
              <div className="space-y-3">
                <Label htmlFor="rr-ratio" className="text-base font-semibold">
                  Default Risk-Reward Ratio
                </Label>
                <p className="text-sm text-muted-foreground">Your preferred risk-to-reward ratio for trades</p>
                <Input
                  id="rr-ratio"
                  placeholder="e.g., 1:2"
                  value={defaultRRRatio}
                  onChange={(e) => setDefaultRRRatio(e.target.value)}
                />
              </div>

              <Separator />

              {/* Trading Hours */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Preferred Trading Hours</h3>
                <p className="text-sm text-muted-foreground">Set your typical trading session times</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time" className="text-sm mb-2 block">
                      Start Time
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={tradingHoursStart}
                      onChange={(e) => setTradingHoursStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time" className="text-sm mb-2 block">
                      End Time
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={tradingHoursEnd}
                      onChange={(e) => setTradingHoursEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account Size Tracking */}
              <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                <Checkbox
                  id="account-tracking"
                  checked={accountSizeTracking}
                  onCheckedChange={(checked) => setAccountSizeTracking(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="account-tracking" className="text-base font-semibold cursor-pointer">
                    Account Size Tracking
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track your account size changes over time and calculate precise position sizes based on your account
                  </p>
                </div>
              </div>

              <Separator />

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-900 dark:text-green-100">
                  <strong>Pro Tip:</strong> These account settings help personalize your trading experience. Your risk
                  tolerance influences position sizing recommendations, and trading hours help filter entries to your
                  preferred session.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex gap-3 justify-end sticky bottom-6">
        <Button onClick={handleSaveConfiguration} size="lg" disabled={saveStatus === "saving"} className="gap-2">
          {saveStatus === "saved" && <CheckCircle2 className="h-4 w-4" />}
          {saveStatus === "saving" && (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          )}
          {saveStatus !== "saving" && <Save className="h-4 w-4" />}
          {saveStatus === "idle" && "Save Configuration"}
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "Saved!"}
        </Button>
      </div>
    </div>
  )
}
