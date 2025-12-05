"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { INSTRUMENT_MAPPINGS } from "@/types/user-config"
import type { TradingPreferences } from "@/types/user-config"

interface InstrumentVisibilityStepProps {
  tradingPreferences: TradingPreferences
  onUpdate: (preferences: Partial<TradingPreferences>) => void
}

export function InstrumentVisibilityStep({ tradingPreferences, onUpdate }: InstrumentVisibilityStepProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["futures", "forex"]))

  const visibleInstruments = tradingPreferences.visibleInstruments || []
  const selectedInstruments = tradingPreferences.specificInstruments || []

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleInstrumentVisibility = (symbol: string) => {
    const newVisible = visibleInstruments.includes(symbol)
      ? visibleInstruments.filter((s) => s !== symbol)
      : [...visibleInstruments, symbol]
    onUpdate({ visibleInstruments: newVisible })
  }

  const toggleCategoryVisibility = (category: string, show: boolean) => {
    const categoryInstruments = (INSTRUMENT_MAPPINGS[category] || []).map((i) => i.symbol)
    let newVisible = [...visibleInstruments]

    if (show) {
      newVisible = [...new Set([...newVisible, ...categoryInstruments])]
    } else {
      newVisible = newVisible.filter((s) => !categoryInstruments.includes(s))
    }

    onUpdate({ visibleInstruments: newVisible })
  }

  const getFilteredInstruments = (category: string) => {
    return (INSTRUMENT_MAPPINGS[category] || []).filter(
      (instrument) =>
        instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instrument.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const getCategoryVisibilityCount = (category: string) => {
    const categoryInstruments = (INSTRUMENT_MAPPINGS[category] || []).map((i) => i.symbol)
    const visibleCount = categoryInstruments.filter((s) => visibleInstruments.includes(s)).length
    return { visible: visibleCount, total: categoryInstruments.length }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Instrument Visibility Control</h3>
        <p className="text-muted-foreground mb-6">
          Choose which instruments will be displayed when adding trades. Only visible instruments will appear in the
          trade entry form dropdown.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search instruments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Toggle Info */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Click the eye icon to toggle entire categories, or select individual instruments
          </p>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="space-y-4">
        {Object.keys(INSTRUMENT_MAPPINGS).map((category) => {
          const instruments = getFilteredInstruments(category)
          const { visible, total } = getCategoryVisibilityCount(category)
          const allVisible = visible === total && total > 0

          if (instruments.length === 0 && searchQuery) return null

          return (
            <div key={category} className="border border-border rounded-lg overflow-hidden bg-card">
              {/* Category Header */}
              <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between cursor-pointer hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 flex-1" onClick={() => toggleCategory(category)}>
                  <div
                    className={cn(
                      "w-6 h-6 rounded border border-border flex items-center justify-center transition-all",
                      expandedCategories.has(category) ? "rotate-90" : "",
                    )}
                  >
                    <span>›</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground capitalize">{category}</h4>
                    <p className="text-xs text-muted-foreground">
                      {visible} of {total} visible
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleCategoryVisibility(category, true)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      visible === total && total > 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80",
                    )}
                    title="Show all in category"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleCategoryVisibility(category, false)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    title="Hide all in category"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Instruments List */}
              {expandedCategories.has(category) && (
                <div className="p-4 space-y-2">
                  {instruments.map((instrument) => {
                    const isVisible = visibleInstruments.includes(instrument.symbol)
                    const isSelected = selectedInstruments.includes(instrument.symbol)

                    return (
                      <div
                        key={instrument.symbol}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between",
                          isVisible
                            ? "border-primary bg-primary/5"
                            : "border-border bg-muted/30 hover:border-primary/50",
                        )}
                        onClick={() => toggleInstrumentVisibility(instrument.symbol)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{instrument.symbol}</span>
                            {isSelected && (
                              <Badge variant="secondary" className="text-xs">
                                Trading
                              </Badge>
                            )}
                            {isVisible && <Eye className="w-4 h-4 text-primary flex-shrink-0 ml-auto" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{instrument.name}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
