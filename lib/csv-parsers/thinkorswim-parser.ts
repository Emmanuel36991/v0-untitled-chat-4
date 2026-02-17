// Thinkorswim (TD Ameritrade) CSV Parser
//
// Supports full Account Statement exports by isolating the "Account Trade History" /
// "Trade History" section, as well as simple trade-history-only CSVs.

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"

export class ThinkorswimParser extends BaseCSVParser {
    readonly brokerType: BrokerType = "thinkorswim"
    readonly brokerName = "Thinkorswim (TD Ameritrade)"

    detect(csvContent: string, headers: string[]): number {
        const headerStr = headers.join(" ").toLowerCase()
        const tosIndicators = [
            "exec time",
            "pos effect",
            "spread",
            "net price",
            "order #",
            "account trade history",
        ]

        const matches = tosIndicators.filter(ind => headerStr.includes(ind))
        if (matches.length >= 3) return 0.95
        if (matches.length >= 2) return 0.7

        // For composite Account Statement files, the first-line headers won't match.
        // Scan the full CSV content (first ~20 lines) for TOS-specific markers.
        const contentLower = csvContent.slice(0, 3000).toLowerCase()
        const bodyIndicators = [
            "account statement for",
            "account trade history",
            "exec time",
            "pos effect",
            "net price",
        ]
        const bodyMatches = bodyIndicators.filter(ind => contentLower.includes(ind))
        if (bodyMatches.length >= 3) return 0.95
        if (bodyMatches.length >= 2 && contentLower.includes("account statement")) return 0.92

        if (matches.length === 1) return 0.4
        if (bodyMatches.length >= 1) return 0.3
        return 0.1
    }

    async parse(csvContent: string): Promise<ParseResult> {
        return new Promise((resolve) => {
            const errors: ValidationError[] = []
            const warnings: ValidationError[] = []
            const trades: ParsedTrade[] = []
            let totalRows = 0

            // Many TOS exports are composite Account Statements. Extract only the
            // "Account Trade History" / "Trade History" section before parsing.
            const sectionCsv = this.extractTradeHistorySection(csvContent)

            Papa.parse(sectionCsv, {
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
            // DB column is DATE, so always store YYYY-MM-DD
            date: this.formatDateOnly(parsedTrade.date as any),
            instrument: parsedTrade.instrument,
            direction: parsedTrade.direction,
            entry_price: parsedTrade.entry_price,
            exit_price: parsedTrade.exit_price,
            // Stop loss is required by your DB schema; if unknown, default to entry_price (risk = 0)
            stop_loss: parsedTrade.stop_loss ?? parsedTrade.entry_price,
            take_profit: parsedTrade.take_profit,
            size: parsedTrade.size,
            pnl: parsedTrade.pnl,
            outcome: parsedTrade.pnl > 0 ? "win" : parsedTrade.pnl < 0 ? "loss" : "breakeven",
            notes: parsedTrade.notes || "Imported from Thinkorswim",
            setup_name: parsedTrade.setup_name,
            account_id: accountId
        } as NewTradeInput
    }

    /**
     * Extract only the Thinkorswim "Trade History" / "Account Trade History" section
     * from a composite Account Statement CSV.
     */
    private extractTradeHistorySection(csvContent: string): string {
        const lines = csvContent.split(/\r\n|\n|\r/)

        let startIdx = -1
        for (let i = 0; i < lines.length; i++) {
            const lower = lines[i].toLowerCase()
            if (
                lower.includes("exec time") &&
                lower.includes("pos effect") &&
                lower.includes("symbol")
            ) {
                startIdx = i
                break
            }
        }

        // If we didn't find the trade history header, fall back to the original content.
        if (startIdx === -1) {
            return csvContent
        }

        // Collect rows until a blank line or a new section header (e.g., "Profits and Losses").
        let endIdx = lines.length
        for (let i = startIdx + 1; i < lines.length; i++) {
            const trimmed = lines[i].trim()
            const lower = trimmed.toLowerCase()

            if (!trimmed) {
                endIdx = i
                break
            }

            if (
                lower.startsWith("profits and losses") ||
                lower.startsWith("profit and loss") ||
                lower.startsWith("cash balances") ||
                lower.startsWith("balances") ||
                lower.startsWith("account summary")
            ) {
                endIdx = i
                break
            }
        }

        return lines.slice(startIdx, endIdx).join("\n")
    }
}

