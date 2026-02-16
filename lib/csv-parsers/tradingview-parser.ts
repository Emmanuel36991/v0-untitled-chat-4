// TradingView CSV Parser
// Supports: List of Trades, Account History, and Order History exports

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"

export class TradingViewParser extends BaseCSVParser {
    readonly brokerType: BrokerType = "tradingview"
    readonly brokerName = "TradingView"

    detect(csvContent: string, headers: string[]): number {
        // TradingView specific headers across all export formats
        const tvIndicators = [
            // List of Trades format
            "symbol",
            "type",
            "date/time",
            "p&l",
            "cumulative p&l",
            // Account History format
            "realized p&l",
            "balance before",
            "balance after",
            "action",
            // Order History format
            "placing time",
            "closing time",
            "fill price",
            "order id",
            "level id",
            "leverage",
            "margin",
            // Common
            "side",
            "qty",
            "commission",
            "status",
            "stop price",
            "limit price"
        ]

        const headerStr = headers.join(" ").toLowerCase()
        const matches = tvIndicators.filter(ind => headerStr.includes(ind))

        // Check for "TradingView" in content
        const hasTradingViewMention = csvContent.toLowerCase().includes("tradingview")

        // Order History specific: has "Placing Time" + "Symbol" + "Side"
        const isOrderHistory = headerStr.includes("placing time") && headerStr.includes("symbol") && headerStr.includes("side")

        if (isOrderHistory) return 0.95
        if (matches.length >= 3 || hasTradingViewMention) return 0.9
        if (matches.length >= 2) return 0.6
        if (matches.length === 1) return 0.3
        return 0.1
    }

    async parse(csvContent: string): Promise<ParseResult> {
        return new Promise((resolve) => {
            const errors: ValidationError[] = []
            const warnings: ValidationError[] = []
            const trades: ParsedTrade[] = []
            let totalRows = 0
            let skippedNonFilled = 0

            Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = results.data as any[]
                    totalRows = rows.length

                    // Detect which format this is based on headers
                    const headers = results.meta.fields || []
                    const headersLower = headers.map(h => h.toLowerCase())
                    const isOrderHistory = headersLower.some(h => h.includes("placing time") || h.includes("closing time"))

                    console.log(`[TradingView Parser] Format: ${isOrderHistory ? "Order History" : "List of Trades / Account History"}`)
                    console.log(`[TradingView Parser] CSV columns:`, headers)

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i]

                        try {
                            // --- Order Status filter (Order History format) ---
                            const status = this.findColumnValue(row, [
                                "Status"
                            ])

                            if (status) {
                                const statusLower = status.toLowerCase()
                                // Skip non-filled orders
                                if (statusLower === "rejected" || statusLower === "cancelled" || statusLower === "canceled" || statusLower === "expired") {
                                    skippedNonFilled++
                                    continue
                                }
                            }

                            // --- Instrument ---
                            const instrument = this.findColumnValue(row, [
                                "Symbol", "Instrument", "Ticker"
                            ])

                            // --- Date/Time (support all TradingView formats) ---
                            const dateStr = this.findColumnValue(row, [
                                "Closing Time",    // Order History - prefer closing time
                                "Placing Time",    // Order History - fallback
                                "Date/Time",       // List of Trades
                                "DateTime",
                                "Time",
                                "Date"
                            ])

                            // --- Side / Direction ---
                            const type = this.findColumnValue(row, [
                                "Side", "Type", "Action"
                            ])

                            // --- Quantity ---
                            const qty = this.parseNumber(this.findColumnValue(row, [
                                "Qty", "Quantity", "Size", "Contracts"
                            ]))

                            // --- Price ---
                            const fillPrice = this.parseNumber(this.findColumnValue(row, [
                                "Fill Price",        // Order History
                                "Price",             // List of Trades
                                "Execution Price"
                            ]))

                            // --- Stop / Limit (Order History) ---
                            const stopPrice = this.parseNumber(this.findColumnValue(row, [
                                "Stop Price"
                            ]))

                            const limitPrice = this.parseNumber(this.findColumnValue(row, [
                                "Limit Price"
                            ]))

                            // --- P&L ---
                            const pnl = this.parseNumber(this.findColumnValue(row, [
                                "P&L", "PnL", "Profit/Loss", "Profit", "Realized P&L"
                            ]))

                            // --- Commission ---
                            const commission = this.parseNumber(this.findColumnValue(row, [
                                "Commission", "Fee"
                            ]))

                            // --- Instrument validation ---
                            if (!instrument) {
                                // Fallback for Account History export which lacks Symbol
                                if (pnl !== 0 || type) {
                                    warnings.push({
                                        row: i + 1,
                                        field: "instrument",
                                        value: "Unknown",
                                        message: "Missing symbol in CSV",
                                        severity: "warning",
                                        suggestion: "Defaulting to 'Unknown'. Use 'List of Trades' export for full details."
                                    })
                                } else {
                                    // Skip empty rows or non-trade rows
                                    continue;
                                }
                            }

                            // --- Date validation ---
                            const date = this.parseDate(dateStr)
                            if (!date) {
                                errors.push({
                                    row: i + 1,
                                    field: "date",
                                    value: dateStr,
                                    message: `Invalid date format: "${dateStr}"`,
                                    severity: "error",
                                    suggestion: "Expected YYYY-MM-DD HH:MM:SS"
                                })
                                continue
                            }

                            // --- Normalize direction ---
                            let direction: "long" | "short" = "long"
                            if (type) {
                                const typeLower = type.toLowerCase()
                                if (typeLower.includes("short") || typeLower.includes("sell")) direction = "short"
                            }

                            // Use the best price available
                            const price = fillPrice || limitPrice || stopPrice || 0

                            // --- Build notes ---
                            const noteParts = ["Imported from TradingView"]
                            if (isOrderHistory) noteParts.push("(Order History)")
                            if (!instrument) noteParts[noteParts.length - 1] = "(Account History)"
                            if (commission) noteParts.push(`Commission: $${commission.toFixed(2)}`)
                            if (status) noteParts.push(`Status: ${status}`)

                            const orderIdValue = this.findColumnValue(row, ["Order ID"])
                            if (orderIdValue) noteParts.push(`Order: ${orderIdValue}`)

                            trades.push({
                                date: date.toISOString(),
                                instrument: instrument || "Unknown",
                                direction,
                                entry_price: price,
                                exit_price: price,
                                stop_loss: stopPrice || undefined,
                                take_profit: limitPrice || undefined,
                                size: qty > 0 ? qty : 1,
                                pnl: pnl || 0,
                                commission,
                                notes: noteParts.join(" | "),
                                rawRow: row,
                                rowIndex: i
                            })
                        } catch (error: any) {
                            errors.push({
                                row: i + 1,
                                field: "parse",
                                value: row,
                                message: error.message || "Failed to parse row",
                                severity: "error"
                            })
                        }
                    }

                    if (skippedNonFilled > 0) {
                        warnings.push({
                            row: 0,
                            field: "status",
                            value: `${skippedNonFilled} orders`,
                            message: `Skipped ${skippedNonFilled} non-filled orders (Rejected/Cancelled)`,
                            severity: "warning"
                        })
                        console.log(`[TradingView Parser] Skipped ${skippedNonFilled} non-filled orders`)
                    }

                    const validationErrors = this.validate(trades)
                    errors.push(...validationErrors)

                    console.log(`[TradingView Parser] Result: ${trades.length} trades parsed, ${errors.length} errors, ${warnings.length} warnings`)

                    resolve({
                        success: errors.filter(e => e.severity === "error").length === 0,
                        broker: this.brokerType,
                        trades,
                        errors,
                        warnings,
                        stats: {
                            totalRows,
                            validTrades: trades.length,
                            skippedRows: totalRows - trades.length,
                            duplicates: this.findDuplicates(trades).length
                        }
                    })
                }
            })
        })
    }

    validate(trades: ParsedTrade[]): ValidationError[] {
        return this.commonValidation(trades)
    }

    convertToTradeInput(parsedTrade: ParsedTrade, accountId?: string): NewTradeInput {
        return {
            date: typeof parsedTrade.date === "string" ? parsedTrade.date : parsedTrade.date.toISOString(),
            instrument: parsedTrade.instrument,
            direction: parsedTrade.direction,
            entry_price: parsedTrade.entry_price,
            exit_price: parsedTrade.exit_price,
            stop_loss: parsedTrade.stop_loss || 0,
            take_profit: parsedTrade.take_profit,
            size: parsedTrade.size,
            pnl: parsedTrade.pnl,
            outcome: parsedTrade.pnl > 0 ? "win" : parsedTrade.pnl < 0 ? "loss" : "breakeven",
            notes: parsedTrade.notes || "Imported from TradingView",
            setup_name: parsedTrade.setup_name,
            account_id: accountId
        } as NewTradeInput
    }
}
