// Tradovate CSV Parser

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"

export class TradovateParser extends BaseCSVParser {
    readonly brokerType: BrokerType = "tradovate"
    readonly brokerName = "Tradovate"

    detect(csvContent: string, headers: string[]): number {
        // Tradovate specific headers
        const tradovateIndicators = [
            "account",
            "contract",
            "realized pnl",
            "account spec"
        ]

        const headerStr = headers.join(" ").toLowerCase()
        const matches = tradovateIndicators.filter(ind => headerStr.includes(ind))

        // High confidence if we see multiple Tradovate-specific terms
        if (matches.length >= 2) return 0.9
        if (matches.length === 1) return 0.5
        return 0.1
    }

    async parse(csvContent: string): Promise<ParseResult> {
        return new Promise((resolve) => {
            const errors: ValidationError[] = []
            const warnings: ValidationError[] = []
            const trades: ParsedTrade[] = []
            let totalRows = 0

            Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = results.data as any[]
                    totalRows = rows.length

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i]

                        try {
                            // Find values using Tradovate column names
                            const instrument = this.findColumnValue(row, [
                                "Contract", "Symbol", "Instrument"
                            ])

                            const dateStr = this.findColumnValue(row, [
                                "Time", "Date", "Timestamp", "Fill Time"
                            ])

                            const side = this.findColumnValue(row, [
                                "Side", "Action", "Buy/Sell"
                            ])

                            const qty = this.parseNumber(this.findColumnValue(row, [
                                "Qty", "Quantity", "Size"
                            ]))

                            const price = this.parseNumber(this.findColumnValue(row, [
                                "Price", "Fill Price", "Avg Price"
                            ]))

                            const realizedPnl = this.parseNumber(this.findColumnValue(row, [
                                "Realized PnL", "PnL", "Profit/Loss"
                            ]))

                            if (!instrument) {
                                errors.push({
                                    row: i + 1,
                                    field: "instrument",
                                    value: instrument,
                                    message: "Missing instrument/contract",
                                    severity: "error"
                                })
                                continue
                            }

                            const date = this.parseDate(dateStr)
                            if (!date) {
                                errors.push({
                                    row: i + 1,
                                    field: "date",
                                    value: dateStr,
                                    message: "Invalid date format",
                                    severity: "error",
                                    suggestion: "Expected ISO format or MM/DD/YYYY HH:MM:SS"
                                })
                                continue
                            }

                            const direction = this.parseDirection(side)

                            trades.push({
                                date: date.toISOString(),
                                instrument,
                                direction,
                                entry_price: price,
                                exit_price: price, // Tradovate fills don't have exit, we pair them
                                size: qty,
                                pnl: realizedPnl,
                                notes: `Imported from Tradovate | Order: ${this.findColumnValue(row, ["Order ID", "ID"]) || "N/A"}`,
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

                    // Validate parsed trades
                    const validationErrors = this.validate(trades)
                    errors.push(...validationErrors)

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
            notes: parsedTrade.notes || "Imported from Tradovate",
            setup_name: parsedTrade.setup_name,
            account_id: accountId
        } as NewTradeInput
    }
}
