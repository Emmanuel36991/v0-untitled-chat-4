"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Filter, TrendingUp, TrendingDown, Target, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TradeFilters {
  instrument?: string
  outcome?: "win" | "loss" | "breakeven" | "any" | ""
  setupName?: string
  direction?: "long" | "short" | ""
  dateRange?: {
    from?: Date
    to?: Date
  }
  minPnl?: number
  maxPnl?: number
  /** Used by TradeTable (e.g. ICT concept filter). */
  ictConcept?: string
}

interface AdvancedTradeFiltersProps {
  setFilters: (filters: TradeFilters) => void
  initialFilters: TradeFilters
}

function toDateInputValue(d: Date | undefined): string {
  if (!d) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function AdvancedTradeFilters({ setFilters, initialFilters }: AdvancedTradeFiltersProps) {
  const [instrument, setInstrument] = useState(initialFilters.instrument ?? "")
  const [outcome, setOutcome] = useState<string>(initialFilters.outcome && initialFilters.outcome !== "any" ? initialFilters.outcome : "any")
  const [setupName, setSetupName] = useState(initialFilters.setupName ?? "")
  const [direction, setDirection] = useState<string>(initialFilters.direction ?? "any")
  const [dateFrom, setDateFrom] = useState(toDateInputValue(initialFilters.dateRange?.from))
  const [dateTo, setDateTo] = useState(toDateInputValue(initialFilters.dateRange?.to))
  const [minPnlInput, setMinPnlInput] = useState(
    initialFilters.minPnl != null ? String(initialFilters.minPnl) : ""
  )
  const [maxPnlInput, setMaxPnlInput] = useState(
    initialFilters.maxPnl != null ? String(initialFilters.maxPnl) : ""
  )

  useEffect(() => {
    setInstrument(initialFilters.instrument ?? "")
    setOutcome(initialFilters.outcome && initialFilters.outcome !== "any" ? initialFilters.outcome : "any")
    setSetupName(initialFilters.setupName ?? "")
    setDirection(initialFilters.direction ?? "any")
    setDateFrom(toDateInputValue(initialFilters.dateRange?.from))
    setDateTo(toDateInputValue(initialFilters.dateRange?.to))
    setMinPnlInput(initialFilters.minPnl != null ? String(initialFilters.minPnl) : "")
    setMaxPnlInput(initialFilters.maxPnl != null ? String(initialFilters.maxPnl) : "")
  }, [initialFilters])

  const buildAppliedFilters = (): TradeFilters => {
    const applied: TradeFilters = {}
    if (instrument.trim()) applied.instrument = instrument.trim()
    if (outcome && outcome !== "any") applied.outcome = outcome as "win" | "loss" | "breakeven"
    if (setupName.trim()) applied.setupName = setupName.trim()
    if (direction && direction !== "any") applied.direction = direction as "long" | "short"
    const from = dateFrom ? new Date(dateFrom + "T00:00:00") : undefined
    const to = dateTo ? new Date(dateTo + "T23:59:59.999") : undefined
    if (from || to) applied.dateRange = { from, to }
    const min = minPnlInput.trim() === "" ? undefined : Number(minPnlInput)
    const max = maxPnlInput.trim() === "" ? undefined : Number(maxPnlInput)
    if (min != null && !Number.isNaN(min)) applied.minPnl = min
    if (max != null && !Number.isNaN(max)) applied.maxPnl = max
    return applied
  }

  const handleApply = () => {
    setFilters(buildAppliedFilters())
  }

  const handleClear = () => {
    setInstrument("")
    setOutcome("any")
    setSetupName("")
    setDirection("any")
    setDateFrom("")
    setDateTo("")
    setMinPnlInput("")
    setMaxPnlInput("")
    setFilters({})
  }

  const outcomeOptions = [
    { value: "any", label: "All outcomes" },
    { value: "win", label: "Wins", icon: TrendingUp },
    { value: "loss", label: "Losses", icon: TrendingDown },
    { value: "breakeven", label: "Breakeven" },
  ]

  const directionOptions = [
    { value: "any", label: "All directions" },
    { value: "long", label: "Long" },
    { value: "short", label: "Short" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="filter-instrument" className="text-sm font-medium text-foreground">
            Instrument / Symbol
          </Label>
          <Input
            id="filter-instrument"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            placeholder="e.g. ES, NQ, AAPL"
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-outcome" className="text-sm font-medium text-foreground">
            Outcome
          </Label>
          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger id="filter-outcome" className="bg-background border-border">
              <SelectValue placeholder="All outcomes" />
            </SelectTrigger>
            <SelectContent>
              {outcomeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    {opt.icon && <opt.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="filter-setup" className="text-sm font-medium text-foreground">
            Setup name
          </Label>
          <Input
            id="filter-setup"
            value={setupName}
            onChange={(e) => setSetupName(e.target.value)}
            placeholder="e.g. Breakout, ICT FVG"
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-direction" className="text-sm font-medium text-foreground">
            Direction
          </Label>
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger id="filter-direction" className="bg-background border-border">
              <SelectValue placeholder="All directions" />
            </SelectTrigger>
            <SelectContent>
              {directionOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-date-from" className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            Date from
          </Label>
          <Input
            id="filter-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-date-to" className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            Date to
          </Label>
          <Input
            id="filter-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-min-pnl" className="text-sm font-medium text-foreground">
            Min P&L ($)
          </Label>
          <Input
            id="filter-min-pnl"
            type="number"
            step="any"
            value={minPnlInput}
            onChange={(e) => setMinPnlInput(e.target.value)}
            placeholder="e.g. -500"
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-max-pnl" className="text-sm font-medium text-foreground">
            Max P&L ($)
          </Label>
          <Input
            id="filter-max-pnl"
            type="number"
            step="any"
            value={maxPnlInput}
            onChange={(e) => setMaxPnlInput(e.target.value)}
            placeholder="e.g. 1000"
            className="bg-background border-border"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button onClick={handleApply} size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Apply filters
        </Button>
        <Button onClick={handleClear} variant="outline" size="sm" className="gap-2">
          <X className="h-4 w-4" />
          Clear all
        </Button>
      </div>
    </div>
  )
}

export default AdvancedTradeFilters
