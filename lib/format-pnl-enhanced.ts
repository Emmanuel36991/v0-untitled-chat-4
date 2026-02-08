/**
 * Enhanced PnL formatting with currency conversion and all display modes
 */

import type {
    PnLCalculationResult,
    InstrumentConfig,
    CustomInstrument,
} from "@/types/instrument-calculations"
import { INSTRUMENT_CONFIGS } from "@/types/instrument-calculations"
import { formatCurrencyValue, type CurrencyCode } from "@/lib/currency-config"
import type { DisplayFormat } from "@/hooks/use-currency-conversion"

export interface EnhancedFormatOptions {
    displayFormat: DisplayFormat
    currency?: CurrencyCode
    riskAmount?: number // For R-multiple calculation
    convertedAmount?: number // Pre-converted amount if using currency conversion
}

/**
 * Format PnL with support for all display modes and currency conversion
 */
export function formatPnLEnhanced(
    pnlResult: PnLCalculationResult,
    instrument: string,
    options: EnhancedFormatOptions,
    customConfig?: CustomInstrument
): string {
    const {
        displayFormat,
        currency = "USD",
        riskAmount,
        convertedAmount,
    } = options

    const config = customConfig || INSTRUMENT_CONFIGS[instrument.toUpperCase()]

    switch (displayFormat) {
        case "dollars": {
            const amount = convertedAmount ?? pnlResult.adjustedPnL
            return formatCurrencyValue(amount, currency, { showSign: true })
        }

        case "points": {
            const decimals = config?.displayDecimals ?? 2
            const sign = pnlResult.points >= 0 ? "+" : ""
            return `${sign}${pnlResult.points.toFixed(decimals)} pts`
        }

        case "pips": {
            const sign = pnlResult.pips >= 0 ? "+" : ""
            if (config?.category === "forex") {
                return `${sign}${pnlResult.pips.toFixed(1)} pips`
            }
            // For futures/other instruments, show as points
            return `${sign}${pnlResult.pips.toFixed(2)} pts`
        }

        case "ticks": {
            const sign = pnlResult.points >= 0 ? "+" : ""
            if (config?.tickSize) {
                const numTicks = pnlResult.points / config.tickSize
                return `${sign}${numTicks.toFixed(1)} ticks`
            }
            // Fallback to points if tick size not defined
            return `${sign}${pnlResult.points.toFixed(2)} ticks`
        }

        case "percentage": {
            const sign = pnlResult.percentage >= 0 ? "+" : ""
            return `${sign}${pnlResult.percentage.toFixed(2)}%`
        }

        case "r-multiple": {
            if (!riskAmount || riskAmount === 0) {
                return "N/A"
            }
            const rMultiple = pnlResult.adjustedPnL / riskAmount
            const sign = rMultiple >= 0 ? "+" : ""
            return `${sign}${rMultiple.toFixed(2)}R`
        }

        case "privacy": {
            // Show direction but hide amount
            if (pnlResult.adjustedPnL > 0) {
                return "+•••"
            } else if (pnlResult.adjustedPnL < 0) {
                return "-•••"
            } else {
                return "•••"
            }
        }

        default:
            return formatCurrencyValue(pnlResult.adjustedPnL, "USD", { showSign: true })
    }
}
