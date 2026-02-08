"use client"

import * as React from "react"
import {
    DollarSign,
    Percent,
    EyeOff,
    TrendingUp,
    Hash,
    Circle,
    Target,
    Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { CURRENCIES, type CurrencyCode } from "@/lib/currency-config"
import type { DisplayFormat } from "@/hooks/use-currency-conversion"

interface CurrencySelectorProps {
    selectedCurrency: CurrencyCode
    displayFormat: DisplayFormat
    onCurrencyChange: (currency: CurrencyCode) => void
    onFormatChange: (format: DisplayFormat) => void
    className?: string
}

const DISPLAY_FORMAT_OPTIONS: Array<{
    value: DisplayFormat
    label: string
    description: string
    icon: React.ElementType
}> = [
        {
            value: "dollars",
            label: "Dollar",
            description: "Show in selected currency",
            icon: DollarSign,
        },
        {
            value: "percentage",
            label: "Percentage",
            description: "% relative to entry",
            icon: Percent,
        },
        {
            value: "privacy",
            label: "Privacy",
            description: "Hide numerical values",
            icon: EyeOff,
        },
        {
            value: "r-multiple",
            label: "R-multiple",
            description: "Risk/reward multiple",
            icon: Target,
        },
        {
            value: "ticks",
            label: "Ticks",
            description: "Minimum tick movements",
            icon: Hash,
        },
        {
            value: "pips",
            label: "Pips",
            description: "For forex trades only",
            icon: Circle,
        },
        {
            value: "points",
            label: "Points",
            description: "Price difference in points",
            icon: TrendingUp,
        },
    ]

export function CurrencySelector({
    selectedCurrency,
    displayFormat,
    onCurrencyChange,
    onFormatChange,
    className,
}: CurrencySelectorProps) {
    const currentFormat = DISPLAY_FORMAT_OPTIONS.find((f) => f.value === displayFormat)
    const currentCurrency = CURRENCIES[selectedCurrency]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                        "bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        className
                    )}
                >
                    {currentFormat?.icon && (
                        <currentFormat.icon className="mr-2 h-3.5 w-3.5" />
                    )}
                    <span>
                        {displayFormat === "dollars"
                            ? currentCurrency.symbol
                            : currentFormat?.label}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-72 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Display Format
                </DropdownMenuLabel>

                {DISPLAY_FORMAT_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const isSelected = displayFormat === option.value

                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => onFormatChange(option.value)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                                "hover:bg-gray-100 dark:hover:bg-gray-800",
                                isSelected && "bg-blue-50 dark:bg-blue-950/30"
                            )}
                        >
                            <div
                                className={cn(
                                    "p-1.5 rounded-lg",
                                    isSelected
                                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            isSelected
                                                ? "text-blue-700 dark:text-blue-400"
                                                : "text-gray-900 dark:text-gray-100"
                                        )}
                                    >
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {option.description}
                                </p>
                            </div>
                        </DropdownMenuItem>
                    )
                })}

                {displayFormat === "dollars" && (
                    <>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Currency
                        </DropdownMenuLabel>

                        {Object.values(CURRENCIES).map((currency) => {
                            const isSelected = selectedCurrency === currency.code

                            return (
                                <DropdownMenuItem
                                    key={currency.code}
                                    onClick={() => onCurrencyChange(currency.code)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 cursor-pointer",
                                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                                        isSelected && "bg-blue-50 dark:bg-blue-950/30"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "text-lg font-bold",
                                                isSelected
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-gray-700 dark:text-gray-300"
                                            )}
                                        >
                                            {currency.symbol}
                                        </span>
                                        <div>
                                            <div
                                                className={cn(
                                                    "text-sm font-medium",
                                                    isSelected
                                                        ? "text-blue-700 dark:text-blue-400"
                                                        : "text-gray-900 dark:text-gray-100"
                                                )}
                                            >
                                                {currency.code}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {currency.name}
                                            </div>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    )}
                                </DropdownMenuItem>
                            )
                        })}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
