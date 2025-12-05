"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  History,
  PlayCircle,
  BarChart2,
  Settings2,
  AlertTriangle,
  Info,
  Save,
  ListCollapse,
  Trash2,
  TrendingDown,
  Sigma,
  FileText,
  HelpCircle,
} from "lucide-react"
import {
  type BacktestParams,
  type BacktestResults,
  AVAILABLE_BACKTEST_STRATEGIES,
  AVAILABLE_TIMEFRAMES,
  AVAILABLE_INSTRUMENTS_BACKTEST,
  type SavedBacktestConfig,
} from "@/types"
import { runBacktest } from "@/app/actions/backtesting-actions"
import { toast } from "sonner"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { v4 as uuidv4 } from "uuid"

const defaultInitialCapital = 10000
const LOCAL_STORAGE_KEY = "backtestConfigs"

const formatUnixTime = (unixTime: number) => {
  return new Date(unixTime * 1000).toLocaleDateString()
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(0)}s`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`
  return `${(seconds / 86400).toFixed(1)}d`
}

export default function BacktestingPage() {
  const [params, setParams] = useState<Partial<BacktestParams>>({
    instrument: AVAILABLE_INSTRUMENTS_BACKTEST[0]?.value,
    strategyId: AVAILABLE_BACKTEST_STRATEGIES[0]?.id,
    timeframe: AVAILABLE_TIMEFRAMES[0]?.value,
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    initialCapital: defaultInitialCapital,
    strategyParams: {},
    riskFreeRate: 0.02,
    stopLossPercent: null,
    takeProfitPercent: null,
  })
  const [useStopLoss, setUseStopLoss] = useState(false)
  const [useTakeProfit, setUseTakeProfit] = useState(false)

  const [results, setResults] = useState<BacktestResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [savedConfigs, setSavedConfigs] = useState<SavedBacktestConfig[]>([])
  const [selectedConfigId, setSelectedConfigId] = useState<string>("")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [newConfigName, setNewConfigName] = useState("")

  useEffect(() => {
    const storedConfigs = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedConfigs) {
      setSavedConfigs(JSON.parse(storedConfigs))
    }
  }, [])

  const currentStrategy = useMemo(() => {
    return AVAILABLE_BACKTEST_STRATEGIES.find((s) => s.id === params.strategyId)
  }, [params.strategyId])

  useEffect(() => {
    const defaultStrategyParams: Record<string, any> = {}
    currentStrategy?.params?.forEach((p) => {
      defaultStrategyParams[p.name] = p.defaultValue
    })
    setParams((prev) => ({ ...prev, strategyParams: defaultStrategyParams }))
  }, [currentStrategy])

  const handleParamChange = (field: keyof BacktestParams, value: any) => {
    setParams((prev) => ({ ...prev, [field]: value }))
  }

  const handleStrategyParamChange = (paramName: string, value: any) => {
    setParams((prev) => ({
      ...prev,
      strategyParams: {
        ...prev.strategyParams,
        [paramName]: value,
      },
    }))
  }

  const handleSaveConfig = () => {
    if (!newConfigName.trim()) {
      toast.error("Configuration name cannot be empty.")
      return
    }
    const newConfig: SavedBacktestConfig = {
      id: uuidv4(),
      name: newConfigName.trim(),
      createdAt: new Date().toISOString(),
      ...params,
      // Ensure all required fields of BacktestParams are present
      instrument: params.instrument || AVAILABLE_INSTRUMENTS_BACKTEST[0]?.value,
      strategyId: params.strategyId || AVAILABLE_BACKTEST_STRATEGIES[0]?.id,
      timeframe: params.timeframe || AVAILABLE_TIMEFRAMES[0]?.value,
      startDate: params.startDate || new Date().toISOString().split("T")[0],
      endDate: params.endDate || new Date().toISOString().split("T")[0],
      initialCapital: params.initialCapital || defaultInitialCapital,
      strategyParams: params.strategyParams || {},
      riskFreeRate: params.riskFreeRate || 0.02,
      stopLossPercent: useStopLoss ? params.stopLossPercent : null,
      takeProfitPercent: useTakeProfit ? params.takeProfitPercent : null,
    }
    const updatedConfigs = [...savedConfigs, newConfig]
    setSavedConfigs(updatedConfigs)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedConfigs))
    toast.success(`Configuration "${newConfig.name}" saved!`)
    setShowSaveModal(false)
    setNewConfigName("")
  }

  const handleLoadConfig = (configId: string) => {
    if (!configId) return
    const configToLoad = savedConfigs.find((c) => c.id === configId)
    if (configToLoad) {
      setParams({
        instrument: configToLoad.instrument,
        strategyId: configToLoad.strategyId,
        timeframe: configToLoad.timeframe,
        startDate: configToLoad.startDate,
        endDate: configToLoad.endDate,
        initialCapital: configToLoad.initialCapital,
        strategyParams: configToLoad.strategyParams,
        riskFreeRate: configToLoad.riskFreeRate,
        stopLossPercent: configToLoad.stopLossPercent,
        takeProfitPercent: configToLoad.takeProfitPercent,
      })
      setUseStopLoss(!!configToLoad.stopLossPercent)
      setUseTakeProfit(!!configToLoad.takeProfitPercent)
      setSelectedConfigId(configId)
      toast.info(`Configuration "${configToLoad.name}" loaded.`)
    }
  }

  const handleDeleteConfig = (configId: string) => {
    const updatedConfigs = savedConfigs.filter((c) => c.id !== configId)
    setSavedConfigs(updatedConfigs)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedConfigs))
    if (selectedConfigId === configId) setSelectedConfigId("")
    toast.success("Configuration deleted.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !params.instrument ||
      !params.strategyId ||
      !params.timeframe ||
      !params.startDate ||
      !params.endDate ||
      !params.initialCapital
    ) {
      toast.error("Please fill in all required backtesting parameters.")
      return
    }
    setIsLoading(true)
    setError(null)
    setResults(null)

    const fullParams: BacktestParams = {
      instrument: params.instrument,
      strategyId: params.strategyId,
      timeframe: params.timeframe,
      startDate: params.startDate,
      endDate: params.endDate,
      initialCapital: params.initialCapital,
      strategyParams: params.strategyParams || {},
      riskFreeRate: params.riskFreeRate,
      stopLossPercent: useStopLoss ? params.stopLossPercent : null,
      takeProfitPercent: useTakeProfit ? params.takeProfitPercent : null,
    }

    try {
      const response = await runBacktest(fullParams)
      if (response.error) {
        setError(response.error)
        toast.error(`Backtest failed: ${response.error}`)
      } else if (response.results) {
        setResults(response.results)
        toast.success("Backtest completed successfully!")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      toast.error(err.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const MetricCard: React.FC<{
    title: string
    value: string | number
    tooltip?: string
    icon?: React.ElementType
    positiveGood?: boolean
    isPercentage?: boolean
  }> = ({ title, value, tooltip, icon: Icon, positiveGood, isPercentage }) => {
    let textColor = "text-foreground"
    if (typeof value === "number" && positiveGood !== undefined) {
      textColor =
        value > 0
          ? positiveGood
            ? "text-green-500"
            : "text-red-500"
          : value < 0
            ? positiveGood
              ? "text-red-500"
              : "text-green-500"
            : "text-foreground"
    }
    const displayValue = typeof value === "number" ? (isPercentage ? `${value.toFixed(2)}%` : value.toFixed(2)) : value

    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div className="p-4 bg-background/50 rounded-lg border border-border/50 hover:border-primary-accent/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">{title}</p>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className={`text-2xl font-bold ${textColor}`}>{displayValue}</p>
            </div>
          </TooltipTrigger>
          {tooltip && (
            <TooltipContent className="bg-popover text-popover-foreground border-border">
              <p>{tooltip}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 space-y-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-primary flex items-center">
            <History className="mr-3 h-10 w-10 text-primary-accent" />
            Advanced Strategy Backtester
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Rigorously test and analyze your trading strategies with comprehensive metrics and visualizations.
          </p>
        </header>

        {/* Save/Load Configurations */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-primary-accent flex items-center">
              <ListCollapse className="mr-2 h-5 w-5" />
              Manage Configurations
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow w-full md:w-auto">
              <Label htmlFor="loadConfig" className="text-muted-foreground">
                Load Saved Configuration
              </Label>
              <Select value={selectedConfigId} onValueChange={handleLoadConfig} disabled={isLoading}>
                <SelectTrigger className="bg-input border-border focus:border-primary-accent focus:ring-primary-accent">
                  <SelectValue placeholder="Select a saved configuration" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {savedConfigs.length === 0 && (
                    <SelectItem value="no-configs" disabled>
                      No saved configurations
                    </SelectItem>
                  )}
                  {savedConfigs.map((conf) => (
                    <SelectItem key={conf.id} value={conf.id}>
                      {conf.name} ({new Date(conf.createdAt).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSaveModal(true)}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              <Save className="mr-2 h-4 w-4" /> Save Current
            </Button>
            {selectedConfigId && (
              <Button
                type="button"
                variant="destructiveOutline"
                onClick={() => handleDeleteConfig(selectedConfigId)}
                disabled={isLoading}
                className="w-full md:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
              </Button>
            )}
          </CardContent>
        </Card>

        {showSaveModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Save Configuration</CardTitle>
                <CardDescription>Enter a name for your current backtest settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Configuration Name (e.g., EURUSD SMA Crossover Daily)"
                  value={newConfigName}
                  onChange={(e) => setNewConfigName(e.target.value)}
                  className="bg-input border-border focus:border-primary-accent focus:ring-primary-accent"
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveConfig}>Save</Button>
              </CardFooter>
            </Card>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="bg-card border-border futuristic-glow-border">
            <CardHeader>
              <CardTitle className="text-xl text-primary-accent flex items-center">
                <Settings2 className="mr-2 h-6 w-6" />
                Backtesting Parameters
              </CardTitle>
              <CardDescription>Define the parameters for your backtest.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Instrument, Strategy, Timeframe */}
                <TooltipItem label="Instrument" tooltip="The financial instrument to backtest (e.g., EURUSD, BTCUSD).">
                  <Select
                    value={params.instrument}
                    onValueChange={(value) => handleParamChange("instrument", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-input border-border focus:border-primary-accent focus:ring-primary-accent">
                      <SelectValue placeholder="Select instrument" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {AVAILABLE_INSTRUMENTS_BACKTEST.map((inst) => (
                        <SelectItem key={inst.value} value={inst.value}>
                          {inst.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipItem>
                <TooltipItem label="Strategy" tooltip="The trading strategy to apply.">
                  <Select
                    value={params.strategyId}
                    onValueChange={(value) => handleParamChange("strategyId", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-input border-border focus:border-primary-accent focus:ring-primary-accent">
                      <SelectValue placeholder="Select a strategy" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {AVAILABLE_BACKTEST_STRATEGIES.map((strat) => (
                        <SelectItem key={strat.id} value={strat.id}>
                          {strat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipItem>
                <TooltipItem label="Timeframe" tooltip="The chart timeframe for historical data (e.g., 1H, 1D).">
                  <Select
                    value={params.timeframe}
                    onValueChange={(value) => handleParamChange("timeframe", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-input border-border focus:border-primary-accent focus:ring-primary-accent">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {AVAILABLE_TIMEFRAMES.map((tf) => (
                        <SelectItem key={tf.value} value={tf.value}>
                          {tf.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipItem>
                {/* Dates & Capital */}
                <TooltipItem label="Start Date" tooltip="The beginning date for the backtest period.">
                  <Input
                    type="date"
                    value={params.startDate}
                    onChange={(e) => handleParamChange("startDate", e.target.value)}
                    className="bg-input border-border focus:border-primary-accent focus:ring-primary-accent"
                    disabled={isLoading}
                  />
                </TooltipItem>
                <TooltipItem label="End Date" tooltip="The ending date for the backtest period.">
                  <Input
                    type="date"
                    value={params.endDate}
                    onChange={(e) => handleParamChange("endDate", e.target.value)}
                    className="bg-input border-border focus:border-primary-accent focus:ring-primary-accent"
                    disabled={isLoading}
                  />
                </TooltipItem>
                <TooltipItem label="Initial Capital" tooltip="The starting capital for the backtest simulation.">
                  <Input
                    type="number"
                    value={params.initialCapital}
                    onChange={(e) => handleParamChange("initialCapital", Number.parseFloat(e.target.value))}
                    className="bg-input border-border focus:border-primary-accent focus:ring-primary-accent"
                    placeholder="e.g. 10000"
                    disabled={isLoading}
                    min="1"
                  />
                </TooltipItem>
              </div>

              {/* Risk Management Parameters */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-medium text-primary-accent mb-4">Risk Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useStopLoss"
                      checked={useStopLoss}
                      onCheckedChange={(checked) => {
                        setUseStopLoss(!!checked)
                        if (!checked) handleParamChange("stopLossPercent", null)
                      }}
                    />
                    <Label htmlFor="useStopLoss" className="text-muted-foreground">
                      Use Stop Loss (%)
                    </Label>
                  </div>
                  {useStopLoss && (
                    <TooltipItem
                      label="Stop Loss %"
                      tooltip="Percentage below entry (long) or above entry (short) to exit trade."
                    >
                      <Input
                        type="number"
                        value={params.stopLossPercent ?? ""}
                        onChange={(e) =>
                          handleParamChange(
                            "stopLossPercent",
                            e.target.value ? Number.parseFloat(e.target.value) : null,
                          )
                        }
                        className="bg-input border-border"
                        placeholder="e.g. 2 for 2%"
                        disabled={isLoading}
                        min="0.1"
                        step="0.1"
                      />
                    </TooltipItem>
                  )}
                  <div /> {/* Spacer */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useTakeProfit"
                      checked={useTakeProfit}
                      onCheckedChange={(checked) => {
                        setUseTakeProfit(!!checked)
                        if (!checked) handleParamChange("takeProfitPercent", null)
                      }}
                    />
                    <Label htmlFor="useTakeProfit" className="text-muted-foreground">
                      Use Take Profit (%)
                    </Label>
                  </div>
                  {useTakeProfit && (
                    <TooltipItem
                      label="Take Profit %"
                      tooltip="Percentage above entry (long) or below entry (short) to exit trade."
                    >
                      <Input
                        type="number"
                        value={params.takeProfitPercent ?? ""}
                        onChange={(e) =>
                          handleParamChange(
                            "takeProfitPercent",
                            e.target.value ? Number.parseFloat(e.target.value) : null,
                          )
                        }
                        className="bg-input border-border"
                        placeholder="e.g. 4 for 4%"
                        disabled={isLoading}
                        min="0.1"
                        step="0.1"
                      />
                    </TooltipItem>
                  )}
                </div>
                <TooltipItem
                  label="Risk-Free Rate (Annual %)"
                  tooltip="Annual risk-free rate for Sharpe Ratio calculation (e.g., 0.02 for 2%)."
                >
                  <Input
                    type="number"
                    value={(params.riskFreeRate ?? 0) * 100}
                    onChange={(e) => handleParamChange("riskFreeRate", Number.parseFloat(e.target.value) / 100)}
                    className="bg-input border-border w-full md:w-1/3 mt-4"
                    placeholder="e.g. 2 for 2%"
                    disabled={isLoading}
                    step="0.01"
                  />
                </TooltipItem>
              </div>

              {currentStrategy?.params && currentStrategy.params.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-medium text-primary-accent mb-4">
                    Strategy: {currentStrategy.name} Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentStrategy.params.map((param) => (
                      <TooltipItem key={param.name} label={param.label} tooltip={param.tooltip}>
                        <Input
                          type={param.type === "number" ? "number" : "text"}
                          value={params.strategyParams?.[param.name] ?? param.defaultValue}
                          onChange={(e) =>
                            handleStrategyParamChange(
                              param.name,
                              param.type === "number" ? Number.parseFloat(e.target.value) : e.target.value,
                            )
                          }
                          className="bg-input border-border focus:border-primary-accent focus:ring-primary-accent"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          disabled={isLoading}
                        />
                      </TooltipItem>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full md:w-auto bg-primary-accent hover:bg-primary-accent/90 text-primary-accent-foreground flex items-center mt-6"
                disabled={isLoading}
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                {isLoading ? "Running Backtest..." : "Run Backtest"}
              </Button>
            </CardContent>
          </Card>
        </form>

        {error && (
          <Card className="bg-destructive/10 border-destructive futuristic-glow-border-error mt-6">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6" />
                Backtest Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">{error}</p>
            </CardContent>
          </Card>
        )}

        {results && !error && (
          <Card className="bg-card border-border futuristic-glow-border mt-10">
            <CardHeader>
              <CardTitle className="text-2xl text-primary-accent flex items-center">
                <BarChart2 className="mr-2 h-7 w-7" />
                Backtesting Results Summary
              </CardTitle>
              <CardDescription>
                Strategy: {AVAILABLE_BACKTEST_STRATEGIES.find((s) => s.id === params.strategyId)?.name} on{" "}
                {params.instrument} ({params.timeframe})
                <br />
                Period: {formatUnixTime(results.startTime)} - {formatUnixTime(results.endTime)} (
                {results.totalDurationDays.toFixed(1)} days)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Key Metrics Section */}
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4">Key Performance Indicators</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Net P&L"
                    value={results.totalPnl}
                    tooltip="Total profit or loss after all trades."
                    icon={Sigma}
                    positiveGood={true}
                  />
                  <MetricCard
                    title="Total P&L %"
                    value={results.totalPnlPercent}
                    tooltip="Total P&L as a percentage of initial capital."
                    icon={Sigma}
                    positiveGood={true}
                    isPercentage
                  />
                  <MetricCard
                    title="Max Drawdown"
                    value={results.maxDrawdown * 100}
                    tooltip="Largest peak-to-trough decline during a specific period."
                    icon={TrendingDown}
                    positiveGood={false}
                    isPercentage
                  />
                  <MetricCard
                    title="Win Rate"
                    value={results.winRate * 100}
                    tooltip="Percentage of trades that were profitable."
                    icon={BarChart2}
                    positiveGood={true}
                    isPercentage
                  />
                  <MetricCard
                    title="Profit Factor"
                    value={results.profitFactor}
                    tooltip="Gross profit divided by gross loss. Higher is better."
                    icon={Sigma}
                    positiveGood={true}
                  />
                  <MetricCard
                    title="Sharpe Ratio"
                    value={results.sharpeRatio ?? "N/A"}
                    tooltip="Risk-adjusted return. Higher is better. (Annualized)"
                    icon={Sigma}
                    positiveGood={true}
                  />
                  <MetricCard
                    title="Total Trades"
                    value={results.totalTrades}
                    tooltip="Total number of trades executed."
                    icon={FileText}
                  />
                  <MetricCard
                    title="Avg. Trade P&L"
                    value={results.expectancy}
                    tooltip="Expected P&L per trade."
                    icon={Sigma}
                    positiveGood={true}
                  />
                </div>
              </div>

              {/* Detailed Metrics Section */}
              <div>
                <h3 className="text-xl font-semibold text-primary mb-4">Detailed Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MetricCard
                    title="Winning Trades"
                    value={results.winningTrades}
                    tooltip="Number of profitable trades."
                  />
                  <MetricCard title="Losing Trades" value={results.losingTrades} tooltip="Number of losing trades." />
                  <MetricCard
                    title="Breakeven Trades"
                    value={results.breakevenTrades}
                    tooltip="Number of trades with zero P&L."
                  />

                  <MetricCard
                    title="Avg. Win P&L"
                    value={results.averageWinPnl}
                    tooltip="Average profit of winning trades."
                    positiveGood={true}
                  />
                  <MetricCard
                    title="Avg. Loss P&L"
                    value={Math.abs(results.averageLossPnl ?? 0)}
                    tooltip="Average loss of losing trades (absolute value)."
                    positiveGood={false}
                  />
                  <MetricCard
                    title="Risk/Reward Ratio"
                    value={results.riskRewardRatio}
                    tooltip="Average win P&L divided by average loss P&L."
                    positiveGood={true}
                  />

                  <MetricCard
                    title="Longest Win Streak"
                    value={results.longestWinningStreak}
                    tooltip="Maximum consecutive winning trades."
                  />
                  <MetricCard
                    title="Longest Loss Streak"
                    value={results.longestLosingStreak}
                    tooltip="Maximum consecutive losing trades."
                  />
                  <MetricCard
                    title="Avg. Trade Duration"
                    value={formatDuration(results.averageTradeDuration ?? 0)}
                    tooltip="Average holding period per trade."
                  />
                </div>
              </div>

              {/* Charts Section */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-medium text-primary-accent mb-2">Equity Curve</h4>
                  <div className="h-[400px] bg-background/30 p-4 rounded-lg border border-border/50">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.equityCurve}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="time"
                          tickFormatter={formatUnixTime}
                          stroke="hsl(var(--muted-foreground))"
                          dy={5}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          dx={-5}
                          domain={["auto", "auto"]}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--popover-foreground))",
                          }}
                          labelFormatter={formatUnixTime}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, "Equity"]}
                        />
                        <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                        <Line
                          type="monotone"
                          dataKey="equity"
                          stroke="hsl(var(--primary-accent))"
                          strokeWidth={2}
                          dot={false}
                          name="Portfolio Equity"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {results.drawdownCurve && results.drawdownCurve.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-primary-accent mb-2">Drawdown Curve</h4>
                    <div className="h-[300px] bg-background/30 p-4 rounded-lg border border-border/50">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={results.drawdownCurve}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="time"
                            tickFormatter={formatUnixTime}
                            stroke="hsl(var(--muted-foreground))"
                            dy={5}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            dx={-5}
                            tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                            domain={[0, "auto"]}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              borderColor: "hsl(var(--border))",
                              color: "hsl(var(--popover-foreground))",
                            }}
                            labelFormatter={formatUnixTime}
                            formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, "Drawdown"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="drawdown"
                            stroke="hsl(var(--destructive))"
                            fill="hsla(var(--destructive-hsl), 0.3)"
                            strokeWidth={2}
                            dot={false}
                            name="Drawdown"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {results.pnlDistribution && results.pnlDistribution.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-primary-accent mb-2">P&L Distribution per Trade</h4>
                    <div className="h-[300px] bg-background/30 p-4 rounded-lg border border-border/50">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={results.pnlDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="pnl"
                            tickFormatter={(value) => `$${value.toFixed(0)}`}
                            stroke="hsl(var(--muted-foreground))"
                            dy={5}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            dx={-5}
                            label={{
                              value: "Number of Trades",
                              angle: -90,
                              position: "insideLeft",
                              fill: "hsl(var(--muted-foreground))",
                            }}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              borderColor: "hsl(var(--border))",
                              color: "hsl(var(--popover-foreground))",
                            }}
                            formatter={(value: number, name, props) => [
                              `${value} trades`,
                              `P&L: $${props.payload.pnl.toFixed(2)}`,
                            ]}
                          />
                          <Bar dataKey="count" name="Trades">
                            {results.pnlDistribution.map((entry, index) => (
                              <div
                                key={`cell-${index}`}
                                style={{
                                  backgroundColor: entry.pnl >= 0 ? "hsl(var(--chart-1))" : "hsl(var(--destructive))",
                                }}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {results.logs && results.logs.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-primary-accent mb-2 flex items-center">
                    <Info className="mr-2 h-5 w-5" />
                    Backtest Logs
                  </h4>
                  <ScrollArea className="h-[200px] w-full rounded-md border border-border bg-background/30 p-4">
                    {results.logs.map((log, index) => (
                      <p key={index} className="text-xs text-muted-foreground mb-1 font-mono">
                        {log}
                      </p>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}

// Helper component for Tooltips on form items
const TooltipItem: React.FC<{ label: string; tooltip?: string; children: React.ReactNode }> = ({
  label,
  tooltip,
  children,
}) => (
  <div>
    <div className="flex items-center mb-1">
      <Label htmlFor={label.toLowerCase().replace(/\s/g, "")} className="text-muted-foreground">
        {label}
      </Label>
      {tooltip && (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground ml-1 cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="bg-popover text-popover-foreground border-border max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
    {children}
  </div>
)
