"use client"

import React from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Define and export the TradeFilters type
export interface TradeFilters {
  tradeId?: string
  tradeType?: "buy" | "sell" | ""
  asset?: string
  counterAsset?: string
  dateFrom?: string
  dateTo?: string
  minPnL?: string
  maxPnL?: string
  outcome?: "win" | "loss" | ""
  setupName?: string
}

interface AdvancedTradeFiltersProps {
  setFilters: (filters: TradeFilters) => void
  initialFilters: TradeFilters
}

// Enhanced Filter Input Component
const FilterInput = React.memo<{
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  icon?: React.ElementType
  className?: string
}>(({ id, label, value, onChange, placeholder, type = "text", icon: Icon, className }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
      {Icon && <Icon className="h-4 w-4 text-gray-500" />}
      <span>{label}</span>
    </Label>
    <div className="relative">
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          "transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600",
          "text-gray-900 dark:text-gray-100",
          className,
        )}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => onChange("")}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  </div>
))

// Enhanced Filter Select Component
const FilterSelect = React.memo<{
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; icon?: React.ElementType }[]
  placeholder?: string
  icon?: React.ElementType
}>(({ id, label, value, onChange, options, placeholder, icon: Icon }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
      {Icon && <Icon className="h-4 w-4 text-gray-500" />}
      <span>{label}</span>
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          "transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600",
          "text-gray-900 dark:text-gray-100",
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700"
          >
            <div className="flex items-center space-x-2">
              {option.icon && <option.icon className="h-4 w-4" />}
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
))

// Active Filter Badge Component
const ActiveFilterBadge = React.memo<{
  label: string
  value: string
  onRemove: () => void
}>(({ label, value, onRemove }) => (
  <Badge
    variant="secondary"
    className={cn(
      "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
      "border border-blue-200 dark:border-blue-800",
      "hover:bg-blue-100 dark:hover:bg-blue-900/30",
      "transition-all duration-200 group cursor-pointer",
      "flex items-center space-x-2 px-3 py-1",
    )}
    onClick={onRemove}
  >
    <span className="text-xs font-medium">
      {label}: {value}
    </span>
    <X className="h-3 w-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
  </Badge>
))

export function AdvancedTradeFilters({ setFilters, initialFilters }: AdvancedTradeFiltersProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [currentFilters, setCurrentFilters] = React.useState<TradeFilters>(initialFilters)

  React.useEffect(() => {
    setCurrentFilters(initialFilters)
  }, [initialFilters])

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  const handleChange = (name: keyof TradeFilters, value: string) => {
    setCurrentFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    setFilters(currentFilters)
  }

  const handleResetFilters = () => {
    const emptyFilters: TradeFilters = {}
    setCurrentFilters(emptyFilters)
    setFilters(emptyFilters)
  }

  const removeFilter = (filterKey: keyof TradeFilters) => {
    const updatedFilters = { ...currentFilters }
    delete updatedFilters[filterKey]
    setCurrentFilters(updatedFilters)
    setFilters(updatedFilters)
  }

  // Get active filters for display
  const activeFilters = Object.entries(currentFilters).filter(([_, value]) => value && value.trim() !== "")

  const tradeTypeOptions = [
    { value: "any", label: "All Types" },
    { value: "buy", label: "Buy", icon: TrendingUp },
    { value: "sell", label: "Sell", icon: TrendingDown },
  ]

  const outcomeOptions = [
    { value: "any", label: "All Outcomes" },
    { value: "win", label: "Winning Trades", icon: TrendingUp },
    { value: "loss", label: "Losing Trades", icon: TrendingDown },
  ]

  return (
    <Card
      className={cn(
        "bg-white dark:bg-gray-900 border-0 shadow-lg hover:shadow-xl",
        "transition-all duration-500 group",
        "backdrop-blur-sm border border-gray-200 dark:border-gray-800",
      )}
    >
      <CardHeader
        className="flex flex-row items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
        onClick={handleExpandClick}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Filter className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white drop-shadow-sm">Advanced Trade Filters</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {expanded
                ? "Configure your filter criteria below"
                : `${activeFilters.length} active filter${activeFilters.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        >
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </CardHeader>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && !expanded && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => (
              <ActiveFilterBadge
                key={key}
                label={key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                value={String(value)}
                onRemove={() => removeFilter(key as keyof TradeFilters)}
              />
            ))}
          </div>
        </div>
      )}

      {expanded && (
        <CardContent className="p-6 pt-0 space-y-6">
          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Search and Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FilterInput
              id="tradeId"
              label="Trade ID"
              value={currentFilters.tradeId || ""}
              onChange={(value) => handleChange("tradeId", value)}
              placeholder="Search by trade ID..."
              icon={Search}
            />

            <FilterSelect
              id="tradeType"
              label="Trade Type"
              /* map '' in state to 'any' for the Select component */
              value={currentFilters.tradeType || "any"}
              onChange={(value) => handleChange("tradeType", value === "any" ? "" : value)}
              options={tradeTypeOptions}
              placeholder="Select trade type"
              icon={Target}
            />

            <FilterSelect
              id="outcome"
              label="Trade Outcome"
              value={currentFilters.outcome || "any"}
              onChange={(value) => handleChange("outcome", value === "any" ? "" : value)}
              options={outcomeOptions}
              placeholder="Select outcome"
              icon={Sparkles}
            />
          </div>

          {/* Asset Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FilterInput
              id="asset"
              label="Asset"
              value={currentFilters.asset || ""}
              onChange={(value) => handleChange("asset", value)}
              placeholder="e.g., AAPL, TSLA, BTC..."
            />

            <FilterInput
              id="counterAsset"
              label="Counter Asset"
              value={currentFilters.counterAsset || ""}
              onChange={(value) => handleChange("counterAsset", value)}
              placeholder="e.g., USD, EUR, USDT..."
            />
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FilterInput
              id="dateFrom"
              label="Date From"
              type="date"
              value={currentFilters.dateFrom || ""}
              onChange={(value) => handleChange("dateFrom", value)}
              icon={Calendar}
            />

            <FilterInput
              id="dateTo"
              label="Date To"
              type="date"
              value={currentFilters.dateTo || ""}
              onChange={(value) => handleChange("dateTo", value)}
              icon={Calendar}
            />
          </div>

          {/* P&L Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FilterInput
              id="minPnL"
              label="Min P&L ($)"
              type="number"
              value={currentFilters.minPnL || ""}
              onChange={(value) => handleChange("minPnL", value)}
              placeholder="Minimum profit/loss"
            />

            <FilterInput
              id="maxPnL"
              label="Max P&L ($)"
              type="number"
              value={currentFilters.maxPnL || ""}
              onChange={(value) => handleChange("maxPnL", value)}
              placeholder="Maximum profit/loss"
            />
          </div>

          {/* Setup Name Filter */}
          <div className="grid grid-cols-1 gap-6">
            <FilterInput
              id="setupName"
              label="Setup Name"
              value={currentFilters.setupName || ""}
              onChange={(value) => handleChange("setupName", value)}
              placeholder="Search by setup name..."
            />
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              onClick={handleApplyFilters}
              className={cn(
                "bg-gradient-to-r from-blue-600 to-purple-600",
                "hover:from-blue-700 hover:to-purple-700",
                "shadow-lg hover:shadow-xl transition-all duration-300",
                "text-white font-medium px-8 py-2.5",
                "flex-1 sm:flex-none",
              )}
            >
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>

            <Button
              variant="outline"
              onClick={handleResetFilters}
              className={cn(
                "border-gray-300 dark:border-gray-600",
                "hover:bg-gray-50 dark:hover:bg-gray-800",
                "text-gray-700 dark:text-gray-300",
                "transition-all duration-300 px-8 py-2.5",
                "flex-1 sm:flex-none",
              )}
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>

            {activeFilters.length > 0 && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 px-2">
                <span>
                  {activeFilters.length} active filter{activeFilters.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default AdvancedTradeFilters
