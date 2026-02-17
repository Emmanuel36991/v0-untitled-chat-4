// Interactive Brokers (IBKR) CSV Parser
//
// Target: Trade Confirmation / Flex Query CSV exports with fields like:
// - Symbol
// - AssetClass
// - Buy/Sell
// - Quantity
// - Price
// - TradeDate
// - TradeTime
// - Commission
// - Realized P&L

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"

export class InteractiveBrokersParser extends BaseCSVParser {
    readonly brokerType: BrokerType = "interactive-brokers"
    readonly brokerName = "Interactive Brokers (IBKR)"

    detect(csvContent: string, headers: string[]): number {
        const headerStr = headers.join(" ").toLowerCase()

        const indicators = [
            "conid",
            "assetclass",
            "buy/sell",
            "trade date",
            "trade time",
            "ib order id",
            "ibexecid",
            "ibexec id",
            "symbol",
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
                            const symbol = this.findColumnValue(row, ["Symbol", "LocalSymbol", "Underlying"])
                            if (!symbol) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "Symbol",
                                    value: symbol,
                                    message: "Skipped row: missing Symbol",
                                    severity: "warning"
                                })
                                continue
                            }

                            const sideRaw = this.findColumnValue(row, ["Buy/Sell", "Side", "Action"])
                            const qty = this.parseNumber(this.findColumnValue(row, ["Quantity", "Qty", "Shares"]))
                            const price = this.parseNumber(this.findColumnValue(row, [
                                "Price",
                                "TradePrice",
                                "FillPrice",
                                "Execution Price"
                            ]))
                            const tradeDate = this.findColumnValue(row, ["TradeDate", "Date"])
                            const tradeTime = this.findColumnValue(row, ["TradeTime", "Time"])
                            const commission = this.parseNumber(this.findColumnValue(row, ["Commission"]))
                            const realizedPnl = this.parseNumber(this.findColumnValue(row, [
                                "Realized P&L",
                                "RealizedPnL",
                                "Realized PnL",
                                "Realized P/L"
                            ]))

                            if (!sideRaw || qty <= 0 || price <= 0) {
                                skippedRows++
                                continue
                            }

                            // Merge TradeDate + TradeTime where present
                            let date: Date | null = null
                            if (tradeDate && tradeTime) {
                                const combined = `${tradeDate} ${tradeTime}`
                                date = this.parseDate(combined)
                            } else {
                                const dtRaw = tradeDate || tradeTime
                                date = this.parseDate(dtRaw)
                            }

                            if (!date) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "TradeDate/TradeTime",
                                    value: `${tradeDate ?? ""} ${tradeTime ?? ""}`.trim(),
                                    message: "Skipped row: invalid or missing trade date/time",
                                    severity: "warning"
                                })
                                continue
                            }

                            const direction = this.parseDirection(sideRaw)

                            trades.push({
                                date: date.toISOString(),
                                instrument: this.normalizeInstrument(String(symbol)),
                                direction,
                                entry_price: price,
                                exit_price: price,
                                size: qty,
                                pnl: realizedPnl || 0,
                                commission: commission || undefined,
                                notes: "Imported from Interactive Brokers Flex/Statement.",
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
            notes: parsedTrade.notes || "Imported from Interactive Brokers",
            setup_name: parsedTrade.setup_name,
            account_id: accountId
        } as NewTradeInput
    }
}

