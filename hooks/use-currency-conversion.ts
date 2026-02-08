"use client"

import { useState, useEffect, useCallback } from "react"
import type { CurrencyCode, ExchangeRates } from "@/lib/currency-config"
import { fetchExchangeRates, STATIC_EXCHANGE_RATES, convertCurrency } from "@/lib/currency-config"
import type { PnLDisplayFormat } from "@/types/instrument-calculations"

export type DisplayFormat = PnLDisplayFormat | "r-multiple" | "privacy"

interface CurrencyState {
    selectedCurrency: CurrencyCode
    displayFormat: DisplayFormat
    exchangeRates: ExchangeRates | null
    isLoading: boolean
}

const STORAGE_KEYS = {
    CURRENCY: "dashboard-selected-currency",
    FORMAT: "dashboard-display-format",
}

export function useCurrencyConversion() {
    const [state, setState] = useState<CurrencyState>({
        selectedCurrency: "USD",
        displayFormat: "dollars",
        exchangeRates: null,
        isLoading: false,
    })

    // Load saved preferences from localStorage
    useEffect(() => {
        const savedCurrency = localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyCode | null
        const savedFormat = localStorage.getItem(STORAGE_KEYS.FORMAT) as DisplayFormat | null

        if (savedCurrency && ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"].includes(savedCurrency)) {
            setState((prev) => ({ ...prev, selectedCurrency: savedCurrency }))
        }

        if (savedFormat) {
            setState((prev) => ({ ...prev, displayFormat: savedFormat }))
        }
    }, [])

    // Fetch exchange rates on mount and periodically
    useEffect(() => {
        const loadRates = async () => {
            setState((prev) => ({ ...prev, isLoading: true }))
            const rates = await fetchExchangeRates()
            setState((prev) => ({ ...prev, exchangeRates: rates, isLoading: false }))
        }

        loadRates()

        // Refresh rates every hour
        const interval = setInterval(loadRates, 60 * 60 * 1000)

        return () => clearInterval(interval)
    }, [])

    // Set currency
    const setCurrency = useCallback((currency: CurrencyCode) => {
        setState((prev) => ({ ...prev, selectedCurrency: currency }))
        localStorage.setItem(STORAGE_KEYS.CURRENCY, currency)
    }, [])

    // Set display format
    const setDisplayFormat = useCallback((format: DisplayFormat) => {
        setState((prev) => ({ ...prev, displayFormat: format }))
        localStorage.setItem(STORAGE_KEYS.FORMAT, format)
    }, [])

    // Convert amount from USD to selected currency
    const convert = useCallback(
        (amountUSD: number): number => {
            return convertCurrency(amountUSD, state.selectedCurrency, state.exchangeRates || undefined)
        },
        [state.selectedCurrency, state.exchangeRates]
    )

    return {
        selectedCurrency: state.selectedCurrency,
        displayFormat: state.displayFormat,
        exchangeRates: state.exchangeRates,
        isLoading: state.isLoading,
        setCurrency,
        setDisplayFormat,
        convert,
    }
}
