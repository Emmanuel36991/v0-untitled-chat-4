// Thinkorswim (TD Ameritrade) CSV Parser

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"

export class ThinkorswimParser extends BaseCSVParser {
    readonly brokerType: BrokerType = "thinkorswim"
    readonly brokerName = "Thinkorswim (TD Ameritrade)"

    detect(csvContent: string, headers: string[]): number {
        // Thinkorswim specific headers
        const tosIndicators = [
            "exec time",
            "spread",
            "pos effect",
            "net price",
            "order #"
        ]

        const headerStr = headers.join(" ").toLowerCase()
        const matches = tosIndicators.filter(ind => headerStr.includes(ind))

        // High confidence if we see multiple TOS-specific terms
        if (matches.length >= 3) return 0.95
        if (matches.length >= 2) return 0.7
        if (matches.length === 1) return 0.4
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
                            const instrument = this.findColumnValue(row, [
                                "Symbol", "Instrument", "Spread"
                            ])

                            const dateStr = this.findColumnValue(row, [
                                "Exec Time", "Time", "Date/Time", "Trade Date"
                            ])

                            const side = this.findColumnValue(row, [
                                "Side", "Action", "Type"
                            ])

                            const qty = this.parseNumber(this.findColumnValue(row, [
                                "Qty", "Quantity"
                            ]))

                            const price = this.parseNumber(this.findColumnValue(row, [
                                "Price", "Net Price", "Avg Price"
                            ]))

                            const commission = this.parseNumber(this.findColumnValue(row, [
                                "Commission", "Fees"
                            ]))

                            if (!instrument) {
                                errors.push({
                                    row: i + 1,
                                    field: "instrument",
                                    value: instrument,
                                    message: "Missing symbol",
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
                                    suggestion: "Expected MM/DD/YY HH:MM:SS or similar"
                                })
                                continue
                            }

                            const direction = this.parseDirection(side)

                            // For Thinkorswim, trades are typically already paired
                            // Calculate P&L if not provided
                            const pnl = this.parseNumber(this.findColumnValue(row, [
                                "P&L", "Profit", "Net P/L"
                            ]))

                            trades.push({
                                date: date.toISOString(),
                                instrument: this.normalizeInstrument(instrument),
                                direction,
                                entry_price: price,
                                exit_price: price,
                                size: qty,
                                pnl: pnl || 0,
                                commission,
                                notes: `Imported from Thinkorswim${commission ? ` | Commission: $${commission.toFixed(2)}` : ""}`,
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
            notes: parsedTrade.notes || "Imported from Thinkorswim",
            setup_name: parsedTrade.setup_name,
            account_id: accountId
        } as NewTradeInput
    }
}
