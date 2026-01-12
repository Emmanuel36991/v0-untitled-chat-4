"use client"

import React from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, AlertCircle, Filter, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EconomicEvent, EventImpact, EventCategory, EconomicCalendarFilters } from "@/types/economic-calendar"

// Sample data - replace with API call
const SAMPLE_EVENTS: EconomicEvent[] = [
  {
    id: "1",
    title: "Federal Reserve Interest Rate Decision",
    date: new Date("2024-01-20"),
    time: "14:00 EST",
    country: "United States",
    countryCode: "US",
    category: "interest-rate",
    impact: "high",
    description: "The Federal Open Market Committee announces its decision on interest rates",
    previous: "5.25%",
    forecast: "5.50%",
    currency: "USD",
  },
  {
    id: "2",
    title: "Consumer Price Index (CPI)",
    date: new Date("2024-01-18"),
    time: "08:30 EST",
    country: "United States",
    countryCode: "US",
    category: "inflation",
    impact: "high",
    description: "Monthly inflation data measuring price changes",
    previous: "3.2%",
    forecast: "3.1%",
    currency: "USD",
  },
  {
    id: "3",
    title: "Non-Farm Payrolls",
    date: new Date("2024-01-19"),
    time: "08:30 EST",
    country: "United States",
    countryCode: "US",
    category: "employment",
    impact: "high",
    description: "Monthly employment report",
    previous: "199K",
    forecast: "180K",
    currency: "USD",
  },
  {
    id: "4",
    title: "ECB Interest Rate Decision",
    date: new Date("2024-01-22"),
    time: "07:15 EST",
    country: "Euro Zone",
    countryCode: "EU",
    category: "interest-rate",
    impact: "high",
    description: "European Central Bank monetary policy announcement",
    previous: "4.00%",
    forecast: "4.00%",
    currency: "EUR",
  },
  {
    id: "5",
    title: "Retail Sales",
    date: new Date("2024-01-17"),
    time: "08:30 EST",
    country: "United States",
    countryCode: "US",
    category: "retail",
    impact: "medium",
    description: "Monthly retail sales data",
    previous: "0.3%",
    forecast: "0.4%",
    currency: "USD",
  },
]

const IMPACT_CONFIG: Record<EventImpact, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  high: {
    label: "High Impact",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    icon: AlertCircle,
  },
  medium: {
    label: "Medium Impact",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    icon: AlertCircle,
  },
  low: {
    label: "Low Impact",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
    icon: AlertCircle,
  },
}

const CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string }> = {
  "interest-rate": { label: "Interest Rate", color: "bg-blue-500" },
  inflation: { label: "Inflation", color: "bg-purple-500" },
  employment: { label: "Employment", color: "bg-emerald-500" },
  gdp: { label: "GDP", color: "bg-cyan-500" },
  manufacturing: { label: "Manufacturing", color: "bg-amber-500" },
  retail: { label: "Retail", color: "bg-rose-500" },
  housing: { label: "Housing", color: "bg-indigo-500" },
  other: { label: "Other", color: "bg-gray-500" },
}

interface EconomicCalendarWidgetProps {
  className?: string
  maxHeight?: string
}

export function EconomicCalendarWidget({ className, maxHeight = "600px" }: EconomicCalendarWidgetProps) {
  const [filters, setFilters] = React.useState<EconomicCalendarFilters>({})
  const [selectedPeriod, setSelectedPeriod] = React.useState<"today" | "week" | "month">("week")
  const [expandedEvent, setExpandedEvent] = React.useState<string | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)

  const filteredEvents = React.useMemo(() => {
    return SAMPLE_EVENTS.filter((event) => {
      if (filters.impact && filters.impact.length > 0 && !filters.impact.includes(event.impact)) {
        return false
      }
      if (filters.category && filters.category.length > 0 && !filters.category.includes(event.category)) {
        return false
      }
      return true
    })
  }, [filters])

  const toggleFilter = (type: keyof EconomicCalendarFilters, value: string) => {
    setFilters((prev) => {
      const current = prev[type] as string[] | undefined
      if (!current) {
        return { ...prev, [type]: [value] }
      }
      if (current.includes(value)) {
        const updated = current.filter((v) => v !== value)
        return { ...prev, [type]: updated.length > 0 ? updated : undefined }
      }
      return { ...prev, [type]: [...current, value] }
    })
  }

  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (filters.impact && filters.impact.length > 0) count += filters.impact.length
    if (filters.category && filters.category.length > 0) count += filters.category.length
    return count
  }, [filters])

  return (
    <Card className={cn("border-0 shadow-lg hover:shadow-xl transition-all duration-500", className)}>
      <CardHeader className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Economic Calendar</CardTitle>
              <CardDescription className="text-sm">Upcoming market events</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="relative">
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-500">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Period Selection */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(["today", "week", "month"] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="flex-1 text-xs"
            >
              {period === "today" ? "Today" : period === "week" ? "This Week" : "This Month"}
            </Button>
          ))}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
            {/* Impact Filters */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Impact Level</Label>
              <div className="flex flex-wrap gap-2">
                {(["high", "medium", "low"] as EventImpact[]).map((impact) => {
                  const config = IMPACT_CONFIG[impact]
                  const isActive = filters.impact?.includes(impact)
                  return (
                    <Button
                      key={impact}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter("impact", impact)}
                      className="text-xs"
                    >
                      <config.icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Category Filters */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).slice(0, 6).map((category) => {
                  const config = CATEGORY_CONFIG[category]
                  const isActive = filters.category?.includes(category)
                  return (
                    <Button
                      key={category}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter("category", category)}
                      className="text-xs"
                    >
                      {config.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="w-full text-xs">
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <Separator className="bg-gray-200 dark:bg-gray-700" />

      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="p-4 space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events match your filters</p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const impactConfig = IMPACT_CONFIG[event.impact]
                const categoryConfig = CATEGORY_CONFIG[event.category]
                const isExpanded = expandedEvent === event.id
                const ImpactIcon = impactConfig.icon

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "group p-4 bg-white dark:bg-gray-900 rounded-lg border transition-all duration-200",
                      "hover:shadow-md cursor-pointer",
                      impactConfig.bgColor,
                    )}
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  >
                    {/* Event Header */}
                    <div className="flex items-start justify-between space-x-3">
                      <div className="flex-1 space-y-2">
                        {/* Title and Impact */}
                        <div className="flex items-start space-x-2">
                          <ImpactIcon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", impactConfig.color)} />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{event.title}</h4>
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                {event.countryCode}
                              </Badge>
                              <div className={cn("h-2 w-2 rounded-full", categoryConfig.color)} />
                              <span className="text-xs text-gray-500 dark:text-gray-400">{categoryConfig.label}</span>
                            </div>
                          </div>
                        </div>

                        {/* Date and Time */}
                        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {event.date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{event.description}</p>

                        {/* Data Points */}
                        <div className="grid grid-cols-3 gap-3">
                          {event.previous && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Previous</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.previous}</p>
                            </div>
                          )}
                          {event.forecast && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Forecast</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.forecast}</p>
                            </div>
                          )}
                          {event.actual && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Actual</p>
                              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                {event.actual}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn("text-sm font-medium text-gray-700 dark:text-gray-300", className)}>{children}</label>
}
