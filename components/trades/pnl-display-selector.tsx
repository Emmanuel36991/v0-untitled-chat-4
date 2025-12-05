"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DollarSign, TrendingUp, Target, Percent, ChevronDown } from "lucide-react"
import type { PnLDisplayFormat } from "@/types/instrument-calculations"

interface PnLDisplaySelectorProps {
  currentFormat: PnLDisplayFormat
  onFormatChange: (format: PnLDisplayFormat) => void
}

const FORMAT_OPTIONS = [
  {
    value: "dollars" as PnLDisplayFormat,
    label: "Dollars",
    icon: DollarSign,
    description: "Show P&L in USD",
  },
  {
    value: "points" as PnLDisplayFormat,
    label: "Points",
    icon: Target,
    description: "Show price movement in points",
  },
  {
    value: "pips" as PnLDisplayFormat,
    label: "Pips",
    icon: TrendingUp,
    description: "Show movement in pips (forex)",
  },
  {
    value: "percentage" as PnLDisplayFormat,
    label: "Percentage",
    icon: Percent,
    description: "Show P&L as percentage",
  },
]

export function PnLDisplaySelector({ currentFormat, onFormatChange }: PnLDisplaySelectorProps) {
  const currentOption = FORMAT_OPTIONS.find((option) => option.value === currentFormat)
  const CurrentIcon = currentOption?.icon || DollarSign

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 hover:border-blue-300 dark:hover:border-blue-600"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">P&L: {currentOption?.label}</span>
          <span className="sm:hidden">{currentOption?.label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {FORMAT_OPTIONS.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onFormatChange(option.value)}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.label}</span>
                  {currentFormat === option.value && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
