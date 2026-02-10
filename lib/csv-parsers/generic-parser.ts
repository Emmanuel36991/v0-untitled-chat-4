// Generic/Flexible CSV Parser (Fallback)

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"

export class GenericParser extends BaseCSVParser {
    readonly brokerType: BrokerType = "generic"
    readonly brokerName = "Generic/Unknown Format"

    detect(csvContent: string, headers: string[]): number {
        // Generic parser always returns low confidence
        // It's the fallback option
        return 0.2
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
                            // Use flexible column matching
                            const instrument = this.findColumnValue(row, [
                                "Symbol", "Instrument", "Ticker", "Contract", "Asset", "Pair"
                            ])

                            const dateStr = this.findColumnValue(row, [
                                "Date", "Time", "DateTime", "Timestamp", "Date/Time",
                                "Placing Time", "Exec Time", "Fill Time", "Entry Time"
                            ])

                            const side = this.findColumnValue(row, [
                                "Side", "Direction", "Action", "Type", "Buy/Sell", "Long/Short"
                            ])

                            const qty = this.parseNumber(this.findColumnValue(row, [
                                "Qty", "Quantity", "Size", "Amount", "Contracts", "Shares", "Lots"
                            ]))

                            const entryPrice = this.parseNumber(this.findColumnValue(row, [
                                "Entry Price", "Price", "Fill Price", "Avg Price", "Execution Price", "Open Price"
                            ]))

                            const exitPrice = this.parseNumber(this.findColumnValue(row, [
                                "Exit Price", "Close Price", "Closing Price"
                            ]))

                            const pnl = this.parseNumber(this.findColumnValue(row, [
                                "PnL", "P&L", "Profit", "Loss", "Profit/Loss", "Net PnL", "Realized PnL"
                            ]))

                            const stopLoss = this.parseNumber(this.findColumnValue(row, [
                                "Stop Loss", "Stop", "SL", "Stop Price"
                            ]))

                            const takeProfit = this.parseNumber(this.findColumnValue(row, [
                                "Take Profit", "Target", "TP", "Limit Price"
                            ]))

                            if (!instrument) {
                                errors.push({
                                    row: i + 1,
                                    field: "instrument",
                                    value: instrument,
                                    message: "Missing instrument/symbol",
                                    severity: "error",
                                    suggestion: "Ensure CSV has a Symbol, Instrument, or Ticker column"
                                })
                                continue
                            }

                            const date = this.parseDate(dateStr)
                            if (!date) {
                                errors.push({
                                    row: i + 1,
                                    field: "date",
                                    value: dateStr,
                                    message: "Invalid or missing date",
                                    severity: "error",
                                    suggestion: "Supported formats: YYYY-MM-DD HH:MM:SS, MM/DD/YYYY, ISO 8601"
                                })
                                continue
                            }

                            const direction = this.parseDirection(side)

                            trades.push({
                                date: date.toISOString(),
                                instrument,
                                direction,
                                entry_price: entryPrice || 0,
                                exit_price: exitPrice || entryPrice || 0,
                                size: qty > 0 ? qty : 1,
                                pnl: pnl || 0,
                                stop_loss: stopLoss || undefined,
                                take_profit: takeProfit || undefined,
                                notes: "Imported via CSV (Generic Parser)",
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

                    // Enhanced validation for generic format
                    const validationErrors = this.validate(trades)
                    errors.push(...validationErrors)

                    // Add info message about generic parser
                    if (trades.length > 0) {
                        warnings.push({
                            row: 0,
                            field: "parser",
                            value: "generic",
                            message: "Using generic CSV parser. Some fields may not be mapped optimally.",
                            severity: "warning",
                            suggestion: "If you're using a specific broker, please select it from the dropdown for better accuracy."
                        })
                    }

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
            notes: parsedTrade.notes || "Imported via CSV",
            setup_name: parsedTrade.setup_name,
            account_id: accountId
        } as NewTradeInput
    }
}
