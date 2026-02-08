/**
 * Currency Configuration and Conversion System
 * Handles multi-currency support with exchange rates and formatting
 */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF"

export interface CurrencyInfo {
    code: CurrencyCode
    symbol: string
    name: string
    decimals: number
    symbolPosition: "before" | "after"
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
    USD: {
        code: "USD",
        symbol: "$",
        name: "US Dollar",
        decimals: 2,
        symbolPosition: "before",
    },
    EUR: {
        code: "EUR",
        symbol: "€",
        name: "Euro",
        decimals: 2,
        symbolPosition: "before",
    },
    GBP: {
        code: "GBP",
        symbol: "£",
        name: "British Pound",
        decimals: 2,
        symbolPosition: "before",
    },
    JPY: {
        code: "JPY",
        symbol: "¥",
        name: "Japanese Yen",
        decimals: 0,
        symbolPosition: "before",
    },
    CAD: {
        code: "CAD",
        symbol: "CA$",
        name: "Canadian Dollar",
        decimals: 2,
        symbolPosition: "before",
    },
    AUD: {
        code: "AUD",
        symbol: "A$",
        name: "Australian Dollar",
        decimals: 2,
        symbolPosition: "before",
    },
    CHF: {
        code: "CHF",
        symbol: "CHF",
        name: "Swiss Franc",
        decimals: 2,
        symbolPosition: "after",
    },
}

/**
 * Static exchange rates (fallback)
 * Updated: 2026-02-08
 * Base currency: USD
 */
export const STATIC_EXCHANGE_RATES: Record<CurrencyCode, number> = {
    USD: 1.0,
    EUR: 0.92, // 1 USD = 0.92 EUR
    GBP: 0.79, // 1 USD = 0.79 GBP
    JPY: 149.5, // 1 USD = 149.5 JPY
    CAD: 1.35, // 1 USD = 1.35 CAD
    AUD: 1.53, // 1 USD = 1.53 AUD
    CHF: 0.88, // 1 USD = 0.88 CHF
}

export interface ExchangeRates {
    rates: Record<CurrencyCode, number>
    base: CurrencyCode
    lastUpdated: Date
}

/**
 * Converts amount from USD to target currency
 */
export function convertCurrency(
    amountUSD: number,
    targetCurrency: CurrencyCode,
    exchangeRates?: ExchangeRates
): number {
    if (targetCurrency === "USD") return amountUSD

    const rates = exchangeRates?.rates || STATIC_EXCHANGE_RATES
    const rate = rates[targetCurrency]

    if (!rate) {
        console.warn(`Exchange rate not found for ${targetCurrency}, using USD`)
        return amountUSD
    }

    return amountUSD * rate
}

/**
 * Formats currency value with proper symbol and decimals
 */
export function formatCurrencyValue(
    value: number,
    currency: CurrencyCode,
    options: {
        showSign?: boolean
        compact?: boolean
    } = {}
): string {
    const { showSign = true, compact = false } = options
    const currencyInfo = CURRENCIES[currency]

    // Format number with proper decimals
    const absValue = Math.abs(value)
    let formattedNumber: string

    if (compact && absValue >= 1000000) {
        formattedNumber = (absValue / 1000000).toFixed(1) + "M"
    } else if (compact && absValue >= 1000) {
        formattedNumber = (absValue / 1000).toFixed(1) + "K"
    } else {
        formattedNumber = absValue.toLocaleString("en-US", {
            minimumFractionDigits: currencyInfo.decimals,
            maximumFractionDigits: currencyInfo.decimals,
        })
    }

    // Add sign
    const sign = value >= 0 ? (showSign ? "+" : "") : "-"

    // Add currency symbol
    if (currencyInfo.symbolPosition === "before") {
        return `${sign}${currencyInfo.symbol}${formattedNumber}`
    } else {
        return `${sign}${formattedNumber} ${currencyInfo.symbol}`
    }
}

/**
 * Fetch live exchange rates from free API
 * Falls back to static rates on error
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
    try {
        // Using exchangerate-api.com free tier
        const response = await fetch(
            "https://api.exchangerate-api.com/v4/latest/USD",
            {
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        )

        if (!response.ok) throw new Error("Failed to fetch exchange rates")

        const data = await response.json()

        return {
            rates: {
                USD: 1.0,
                EUR: data.rates.EUR || STATIC_EXCHANGE_RATES.EUR,
                GBP: data.rates.GBP || STATIC_EXCHANGE_RATES.GBP,
                JPY: data.rates.JPY || STATIC_EXCHANGE_RATES.JPY,
                CAD: data.rates.CAD || STATIC_EXCHANGE_RATES.CAD,
                AUD: data.rates.AUD || STATIC_EXCHANGE_RATES.AUD,
                CHF: data.rates.CHF || STATIC_EXCHANGE_RATES.CHF,
            },
            base: "USD",
            lastUpdated: new Date(data.time_last_updated || Date.now()),
        }
    } catch (error) {
        console.warn("Failed to fetch live exchange rates, using static rates:", error)
        return {
            rates: STATIC_EXCHANGE_RATES,
            base: "USD",
            lastUpdated: new Date(),
        }
    }
}
