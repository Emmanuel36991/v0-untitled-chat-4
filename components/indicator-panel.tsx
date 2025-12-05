"use client"

import { SheetTrigger } from "@/components/ui/sheet"

import { useState, Fragment } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Trash2, Settings2 } from "lucide-react"
import type { ActiveIndicator, Strategy, IndicatorParam } from "@/types"
import { AVAILABLE_INDICATORS } from "@/types" // Import the definitions

interface IndicatorPanelProps {
  activeIndicators: ActiveIndicator[]
  onAddIndicator: (indicator: Omit<ActiveIndicator, "id" | "seriesIds">) => void
  onRemoveIndicator: (id: string) => void
  availableStrategies: Strategy[] // Keep this for future use or remove if not needed
  onSelectStrategy: (strategy: Strategy) => void // Keep or remove
}

// Basic ICT/Wyckoff conceptual strategies (can be updated or removed)
const defaultStrategies: Strategy[] = [
  {
    id: "ict_basic",
    name: "ICT Basics (Conceptual)",
    description: "Focus on Order Blocks & Fair Value Gaps",
    indicators: [{ type: "MA", label: "FVG Highlighter", params: { period: 1, color: "#FFEB3B" } }],
  },
  {
    id: "wyckoff_accumulation",
    name: "Wyckoff Accumulation (Conceptual)",
    description: "Identify accumulation phases",
    indicators: [{ type: "MA", label: "Volume Profile Area", params: { period: 1, color: "#4CAF50" } }],
  },
]

export function IndicatorPanel({
  activeIndicators,
  onAddIndicator,
  onRemoveIndicator,
  availableStrategies = defaultStrategies,
  onSelectStrategy,
}: IndicatorPanelProps) {
  const [selectedIndicatorType, setSelectedIndicatorType] = useState<string>("")
  const [currentParams, setCurrentParams] = useState<Record<string, any>>({})

  const handleIndicatorTypeChange = (type: string) => {
    setSelectedIndicatorType(type)
    const indicatorDef = AVAILABLE_INDICATORS[type]
    if (indicatorDef) {
      const defaultP: Record<string, any> = {}
      Object.keys(indicatorDef.params).forEach((key) => {
        defaultP[key] = indicatorDef.params[key].defaultValue
      })
      setCurrentParams(defaultP)
    } else {
      setCurrentParams({})
    }
  }

  const handleParamChange = (paramName: string, value: string | number | boolean) => {
    setCurrentParams((prev) => ({ ...prev, [paramName]: value }))
  }

  const handleAddIndicatorClick = () => {
    if (!selectedIndicatorType) return
    const indicatorDef = AVAILABLE_INDICATORS[selectedIndicatorType]
    if (indicatorDef) {
      // Construct a more descriptive label
      const paramValues = Object.entries(currentParams)
        .map(([key, value]) => {
          const paramDef = indicatorDef.params[key]
          if (paramDef && paramDef.type === "color" && typeof value === "string" && value.startsWith("#")) return "" // Don't show color hex in label
          return value
        })
        .filter((v) => v !== "") // Filter out empty strings (from colors)
        .join(", ")
      const displayLabel = `${indicatorDef.label}${paramValues ? ` (${paramValues})` : ""}`

      onAddIndicator({
        type: selectedIndicatorType,
        label: displayLabel,
        params: { ...currentParams },
      })
      // Optionally reset form:
      // setSelectedIndicatorType("");
      // setCurrentParams({});
    }
  }

  const renderParamInput = (paramKey: string, paramDef: IndicatorParam) => {
    const value = currentParams[paramKey] ?? paramDef.defaultValue
    switch (paramDef.type) {
      case "number":
        return (
          <Input
            id={`${selectedIndicatorType}-${paramKey}`}
            type="number"
            value={value}
            onChange={(e) => handleParamChange(paramKey, Number.parseFloat(e.target.value))}
            min={paramDef.min}
            max={paramDef.max}
            step={paramDef.step}
            className="bg-input border-border"
          />
        )
      case "color":
        return (
          <Input
            id={`${selectedIndicatorType}-${paramKey}`}
            type="color"
            value={value}
            onChange={(e) => handleParamChange(paramKey, e.target.value)}
            className="bg-input border-border h-10 w-full"
          />
        )
      case "boolean":
        // Implement Checkbox if needed
        return <p>Boolean input TBD</p>
      case "select":
        // Implement Select if needed
        return <p>Select input TBD</p>
      default:
        return null
    }
  }

  const selectedIndicatorDef = AVAILABLE_INDICATORS[selectedIndicatorType]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="bg-primary hover:bg-primary/80 text-primary-foreground fixed bottom-4 right-4 z-50 shadow-lg shadow-primary/30 futuristic-glow-border"
        >
          <Settings2 className="mr-2 h-5 w-5" /> Indicators & Strategies
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-card text-card-foreground border-border flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-xl text-primary">Customize Chart Analysis</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow p-1">
          <div className="space-y-6 p-4">
            {/* Add Indicator Section */}
            <div className="space-y-4 p-4 border border-border/50 rounded-lg bg-muted/20">
              <h3 className="text-lg font-semibold text-secondary">Add Indicator</h3>
              <Select onValueChange={handleIndicatorTypeChange} value={selectedIndicatorType}>
                <SelectTrigger className="w-full bg-input border-border text-foreground">
                  <SelectValue placeholder="Select Indicator Type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  {Object.values(AVAILABLE_INDICATORS).map((itDef) => (
                    <SelectItem key={itDef.type} value={itDef.type}>
                      {itDef.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedIndicatorDef && (
                <div className="space-y-3 mt-3">
                  {Object.entries(selectedIndicatorDef.params).map(([paramKey, paramDef]) => (
                    <Fragment key={paramKey}>
                      <Label htmlFor={`${selectedIndicatorType}-${paramKey}`} className="text-sm text-muted-foreground">
                        {paramDef.label}
                      </Label>
                      {renderParamInput(paramKey, paramDef)}
                    </Fragment>
                  ))}
                </div>
              )}

              <Button
                onClick={handleAddIndicatorClick}
                disabled={!selectedIndicatorType}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add to Chart
              </Button>
            </div>

            {/* Active Indicators Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-secondary">Active Indicators</h3>
              {activeIndicators.length === 0 && <p className="text-sm text-muted-foreground">No active indicators.</p>}
              <ul className="space-y-2">
                {activeIndicators.map((ind) => (
                  <li key={ind.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md text-sm">
                    <span className="text-foreground truncate" title={ind.label}>
                      {ind.label}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveIndicator(ind.id)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Confluence Strategies Section (Conceptual) */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-secondary">Strategy Templates (Conceptual)</h3>
              <Select
                onValueChange={(stratId) => {
                  const strategy = availableStrategies.find((s) => s.id === stratId)
                  if (strategy) onSelectStrategy(strategy)
                }}
              >
                <SelectTrigger className="w-full bg-input border-border text-foreground">
                  <SelectValue placeholder="Load Strategy Template" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  {availableStrategies.map((strat) => (
                    <SelectItem key={strat.id} value={strat.id}>
                      {strat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Templates can pre-configure indicators. Full strategy logic is complex.
              </p>
            </div>
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t border-border">
          <SheetClose asChild>
            <Button type="button" className="bg-primary hover:bg-primary/80 text-primary-foreground">
              Done
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
