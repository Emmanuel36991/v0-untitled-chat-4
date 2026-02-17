// NinjaTrader 8 CSV Parser
//
// Expected export: Control Center > Executions tab > right-click > Share > Export > CSV
// Typical headers:
// - Instrument
// - Action (Buy/Sell/Sell Short/Buy to Cover)
// - Quantity
// - Price
// - Time
// - Commission

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"

export class NinjaTraderParser extends BaseCSVParser {
    readonly brokerType: BrokerType = "ninjatrader"
    readonly brokerName = "NinjaTrader 8"

    detect(csvContent: string, headers: string[]): number {
        const headerStr = headers.join(" ").toLowerCase()

        const indicators = [
            "instrument",
            "execution id",
            "action",
            "commission",
            "account",
        ]

        const matches = indicators.filter(ind => headerStr.includes(ind))
        if (matches.length >= 4) return 0.95
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
            let skippedRows = 0

            Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = results.data as any[]
                    totalRows = rows.length

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i] as Record<string, any>

                        try {
                            const instrumentRaw = this.findColumnValue(row, ["Instrument", "Symbol", "Contract"])
                            if (!instrumentRaw) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "Instrument",
                                    value: instrumentRaw,
                                    message: "Skipped row: missing Instrument",
                                    severity: "warning"
                                })
                                continue
                            }

                            const action = this.findColumnValue(row, ["Action", "Side", "Type"])
                            const quantity = this.parseNumber(this.findColumnValue(row, ["Quantity", "Qty", "Size"]))
                            const price = this.parseNumber(this.findColumnValue(row, ["Price", "Avg Price", "Fill Price"]))
                            const tsRaw = this.findColumnValue(row, ["Time", "Execution Time", "Fill Time", "Date/Time"])
                            const commission = this.parseNumber(this.findColumnValue(row, ["Commission", "Comm"]))

                            if (quantity <= 0 || price <= 0) {
                                skippedRows++
                                continue
                            }

                            const date = this.parseDate(tsRaw)
                            if (!date) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "Time",
                                    value: tsRaw,
                                    message: "Skipped row: invalid or missing Time",
                                    severity: "warning"
                                })
                                continue
                            }

                            const direction = this.parseDirection(action)

                            // Normalize future format like "ES 12-24" to "ES12-24" before our root-symbol normalizer.
                            const instrumentNormalized = this.normalizeInstrument(
                                String(instrumentRaw).replace(/\s+/g, "")
                            )

                            trades.push({
                                date: date.toISOString(),
                                instrument: instrumentNormalized,
                                direction,
                                entry_price: price,
                                exit_price: price,
                                size: quantity,
                                pnl: 0,
                                commission: commission || undefined,
                                notes: "Imported from NinjaTrader Executions. P&L will be derived from grouped entries/exits.",
                                rawRow: row,
                                rowIndex: i
                            })
                        } catch (error: any) {
                            skippedRows++
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
                            skippedRows,
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
            date: this.formatDateOnly(parsedTrade.date as any),
            instrument: parsedTrade.instrument,
            direction: parsedTrade.direction,
            entry_price: parsedTrade.entry_price,
            exit_price: parsedTrade.exit_price,
            stop_loss: parsedTrade.stop_loss ?? parsedTrade.entry_price,
            take_profit: parsedTrade.take_profit,
            size: parsedTrade.size,
            pnl: parsedTrade.pnl,
            outcome: parsedTrade.pnl > 0 ? "win" : parsedTrade.pnl < 0 ? "loss" : "breakeven",
            notes: parsedTrade.notes || "Imported from NinjaTrader 8",
            setup_name: parsedTrade.setup_name,
            account_id: accountId
        } as NewTradeInput
    }
}

