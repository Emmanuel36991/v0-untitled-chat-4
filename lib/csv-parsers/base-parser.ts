// Base parser class with common utilities for all broker parsers

import type { CSVParser, ParsedTrade, ValidationError, ColumnMapping, BrokerType } from "./types"
import { parseISO, parse, isValid } from "date-fns"

/**
 * Abstract base class providing common parsing utilities
 */
export abstract class BaseCSVParser implements CSVParser {
    abstract readonly brokerType: BrokerType
    abstract readonly brokerName: string

    abstract detect(csvContent: string, headers: string[]): number
    abstract parse(csvContent: string): Promise<any>
    abstract validate(trades: ParsedTrade[]): ValidationError[]
    abstract convertToTradeInput(parsedTrade: ParsedTrade, accountId?: string): any

    /**
     * Clean and parse numeric value from string
     * Handles: "$1,234.56", "1234.56", "(1234.56)" for negative
     */
    protected parseNumber(value: any): number {
        if (typeof value === "number") return value
        if (!value) return 0

        const str = String(value).trim()

        // Handle parentheses for negative numbers
        const isNegative = str.startsWith("(") && str.endsWith(")")

        // Remove currency symbols, commas, parentheses
        const cleaned = str.replace(/[$,()]/g, "").trim()

        const num = parseFloat(cleaned)
        return isNaN(num) ? 0 : (isNegative ? -Math.abs(num) : num)
    }

    /**
     * Parse date from multiple possible formats
     */
    protected parseDate(value: any): Date | null {
        if (!value) return null
        if (value instanceof Date) return value

        const str = String(value).trim()

        // Try ISO format first
        let date = parseISO(str)
        if (isValid(date)) return date

        // Try common formats
        const formats = [
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm:ss",
            "MM/dd/yyyy HH:mm:ss",
            "MM/dd/yy HH:mm:ss",
            "dd/MM/yyyy HH:mm:ss",
            "yyyy-MM-dd",
            "MM/dd/yyyy",
            "MM/dd/yy",
        ]

        for (const format of formats) {
            try {
                date = parse(str, format, new Date())
                if (isValid(date)) return date
            } catch {
                continue
            }
        }

        // Fallback to native Date parsing
        date = new Date(str)
        return isValid(date) ? date : null
    }

    /**
     * Normalize direction from various broker formats
     */
    protected parseDirection(value: any): "long" | "short" {
        if (!value) return "long"

        const str = String(value).toLowerCase().trim()

        // Short indicators
        if (str.includes("sell") || str.includes("short") || str === "s") {
            return "short"
        }

        // Long indicators (default)
        return "long"
    }

    /**
     * Find column value from multiple possible names (case-insensitive)
     */
    protected findColumnValue(row: Record<string, any>, possibleNames: string[]): any {
        const keys = Object.keys(row)

        for (const name of possibleNames) {
            const found = keys.find(k =>
                k.toLowerCase().trim().replace(/[_\s]/g, "") ===
                name.toLowerCase().trim().replace(/[_\s]/g, "")
            )
            if (found && row[found] !== null && row[found] !== undefined && row[found] !== "") {
                return row[found]
            }
        }

        return null
    }

    /**
     * Fuzzy match column name to app field
     */
    protected matchColumn(columnName: string): { field: string | null; confidence: number } {
        const normalized = columnName.toLowerCase().trim().replace(/[_\s-]/g, "")

        const mappings: Record<string, string[]> = {
            instrument: ["symbol", "instrument", "ticker", "contract", "asset"],
            date: ["date", "time", "datetime", "timestamp", "placingtime", "exectime", "filltime"],
            direction: ["side", "direction", "action", "type", "buysell"],
            entry_price: ["price", "entryprice", "fillprice", "avgprice", "executionprice"],
            exit_price: ["exitprice", "closeprice", "closingprice"],
            size: ["qty", "quantity", "size", "amount", "shares", "contracts"],
            pnl: ["pnl", "profit", "loss", "netpnl", "realizedpnl", "pl"],
            stop_loss: ["stoploss", "stop", "sl"],
            take_profit: ["takeprofit", "target", "tp", "limitprice"],
            commission: ["commission", "fee", "fees"],
        }

        for (const [field, aliases] of Object.entries(mappings)) {
            for (const alias of aliases) {
                const normalizedAlias = alias.toLowerCase().replace(/[_\s-]/g, "")
                if (normalized.includes(normalizedAlias) || normalizedAlias.includes(normalized)) {
                    // Calculate confidence based on length similarity
                    const lengthRatio = Math.min(normalized.length, normalizedAlias.length) /
                        Math.max(normalized.length, normalizedAlias.length)
                    return { field, confidence: lengthRatio }
                }
            }
        }

        return { field: null, confidence: 0 }
    }

    /**
     * Analyze CSV headers to generate column mappings
     */
    protected analyzeHeaders(headers: string[]): ColumnMapping[] {
        return headers.map(header => {
            const match = this.matchColumn(header)
            return {
                csvColumn: header,
                appField: match.field as any,
                confidence: match.confidence,
                examples: [],
                dataType: this.inferDataType(header)
            }
        })
    }

    /**
     * Infer data type from column name
     */
    protected inferDataType(columnName: string): "string" | "number" | "date" | "boolean" {
        const lower = columnName.toLowerCase()
        if (lower.includes("date") || lower.includes("time")) return "date"
        if (lower.includes("price") || lower.includes("qty") || lower.includes("pnl") ||
            lower.includes("amount") || lower.includes("size")) return "number"
        return "string"
    }

    /**
     * Check for duplicate trades
     */
    protected findDuplicates(trades: ParsedTrade[]): number[] {
        const seen = new Set<string>()
        const duplicateIndices: number[] = []

        trades.forEach((trade, index) => {
            // Create fingerprint: instrument + date + price + size
            const fingerprint = `${trade.instrument}-${trade.date}-${trade.entry_price}-${trade.size}`
            if (seen.has(fingerprint)) {
                duplicateIndices.push(index)
            } else {
                seen.add(fingerprint)
            }
        })

        return duplicateIndices
    }

    /**
     * Common validation logic
     */
    protected commonValidation(trades: ParsedTrade[]): ValidationError[] {
        const errors: ValidationError[] = []

        trades.forEach((trade, index) => {
            const row = index + 1

            // Required fields
            if (!trade.instrument || trade.instrument === "UNKNOWN") {
                errors.push({
                    row,
                    field: "instrument",
                    value: trade.instrument,
                    message: "Missing or invalid instrument/symbol",
                    severity: "error",
                    suggestion: "Ensure your CSV has a Symbol or Instrument column"
                })
            }

            if (!trade.date) {
                errors.push({
                    row,
                    field: "date",
                    value: trade.date,
                    message: "Missing or invalid date",
                    severity: "error",
                    suggestion: "Check date format in your CSV"
                })
            }

            if (trade.entry_price <= 0) {
                errors.push({
                    row,
                    field: "entry_price",
                    value: trade.entry_price,
                    message: "Entry price must be greater than 0",
                    severity: "error"
                })
            }

            if (trade.size <= 0) {
                errors.push({
                    row,
                    field: "size",
                    value: trade.size,
                    message: "Size/quantity must be greater than 0",
                    severity: "error"
                })
            }

            // Warnings
            if (trade.exit_price === trade.entry_price) {
                errors.push({
                    row,
                    field: "exit_price",
                    value: trade.exit_price,
                    message: "Exit price equals entry price",
                    severity: "warning",
                    suggestion: "This will result in 0 P&L"
                })
            }
        })

        return errors
    }
}
