// TradingView CSV Parser

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"

export class TradingViewParser extends BaseCSVParser {
    readonly brokerType: BrokerType = "tradingview"
    readonly brokerName = "TradingView"

    detect(csvContent: string, headers: string[]): number {
        // TradingView Paper Trading specific headers
        const tvIndicators = [
            "symbol",
            "type",
            "date/time",
            "p&l",
            "cumulative p&l"
        ]

        const headerStr = headers.join(" ").toLowerCase()
        const matches = tvIndicators.filter(ind => headerStr.includes(ind))

        // Check for "TradingView" in content
        const hasTradingViewMention = csvContent.toLowerCase().includes("tradingview")

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
                                "Symbol", "Instrument", "Ticker"
                            ])

                            const dateStr = this.findColumnValue(row, [
                                "Date/Time", "DateTime", "Time", "Date"
                            ])

                            const type = this.findColumnValue(row, [
                                "Type", "Side", "Action"
                            ])

                            const qty = this.parseNumber(this.findColumnValue(row, [
                                "Qty", "Quantity", "Size", "Contracts"
                            ]))

                            const price = this.parseNumber(this.findColumnValue(row, [
                                "Price", "Execution Price", "Fill Price"
                            ]))

                            const pnl = this.parseNumber(this.findColumnValue(row, [
                                "P&L", "PnL", "Profit/Loss", "Profit"
                            ]))

                            const commission = this.parseNumber(this.findColumnValue(row, [
                                "Commission", "Fee"
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
                                    suggestion: "Expected YYYY-MM-DD HH:MM:SS"
                                })
                                continue
                            }

                            const direction = this.parseDirection(type)

                            trades.push({
                                date: date.toISOString(),
                                instrument,
                                direction,
                                entry_price: price,
                                exit_price: price,
                                size: qty > 0 ? qty : 1,
                                pnl: pnl || 0,
                                commission,
                                notes: `Imported from TradingView${commission ? ` | Commission: $${commission.toFixed(2)}` : ""}`,
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
            notes: parsedTrade.notes || "Imported from TradingView",
            setup_name: parsedTrade.setup_name,
            account_id: accountId
        } as NewTradeInput
    }
}
