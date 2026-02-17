// Rithmic (R | Trader Pro) CSV Parser
//
// Expected export: Order History / Completed Orders grid with at least:
// - Account
// - Order Number
// - Symbol
// - Qty Filled
// - Avg Fill Price
// - (optionally) Side or separate Buys/Sells columns
// - Fill Time

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"

type ExecutionSide = "Buy" | "Sell"

export class RithmicParser extends BaseCSVParser {
    readonly brokerType: BrokerType = "rithmic"
    readonly brokerName = "Rithmic (R|Trader Pro)"

    detect(csvContent: string, headers: string[]): number {
        const headerStr = headers.join(" ").toLowerCase()

        // High-confidence: Rithmic R|Trader Pro order history headers
        const primaryIndicators = [
            "order number",
            "qty filled",
            "avg fill price",
            "fill time",
            "r | trader",
            "r-trader",
        ]

        // Rithmic execution report headers (alternative export format)
        const executionIndicators = [
            "executionid",
            "orderid",
            "exectype",
            "executiontime",
            "liquidity",
        ]

        const primaryMatches = primaryIndicators.filter(ind => headerStr.includes(ind))
        const execMatches = executionIndicators.filter(ind => headerStr.includes(ind))

        // If we find Rithmic execution-specific headers, high confidence
        if (execMatches.length >= 3) return 0.95
        if (execMatches.length >= 2 && headerStr.includes("symbol") && headerStr.includes("exchange")) return 0.95

        if (primaryMatches.length >= 3) return 0.95
        if (primaryMatches.length >= 2) return 0.7

        // Combined check: any mix of primary + execution indicators
        const totalMatches = primaryMatches.length + execMatches.length
        if (totalMatches >= 3) return 0.9
        if (totalMatches >= 2) return 0.6
        if (totalMatches === 1) return 0.4
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
                            const symbol = this.findColumnValue(row, ["Symbol", "Instrument", "Contract"])
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

                            // Prefer Qty Filled; fall back to Qty/Quantity
                            const qty = this.parseNumber(this.findColumnValue(row, [
                                "Qty Filled",
                                "QtyFilled",
                                "Filled Qty",
                                "Fill Qty",
                                "Qty",
                                "Quantity"
                            ]))

                            if (qty <= 0) {
                                skippedRows++
                                continue
                            }

                            const side = this.inferSide(row)
                            if (!side) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "Side",
                                    value: row,
                                    message: "Skipped row: could not infer Buy/Sell side",
                                    severity: "warning",
                                    suggestion: "Ensure your Rithmic export includes either a Side column or separate Buys/Sells columns."
                                })
                                continue
                            }

                            const price = this.parseNumber(this.findColumnValue(row, [
                                "Avg Fill Price",
                                "AvgFillPrice",
                                "Fill Price",
                                "Price"
                            ]))
                            if (price <= 0) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "Avg Fill Price",
                                    value: this.findColumnValue(row, ["Avg Fill Price", "AvgFillPrice", "Fill Price", "Price"]),
                                    message: "Skipped row: missing or invalid execution price",
                                    severity: "warning"
                                })
                                continue
                            }

                            const tsRaw = this.findColumnValue(row, [
                                "Fill Time",
                                "ExecutionTime",
                                "Execution Time",
                                "Time",
                                "Timestamp"
                            ])
                            const date = this.parseDate(tsRaw)
                            if (!date) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "Fill Time / ExecutionTime",
                                    value: tsRaw,
                                    message: "Skipped row: invalid or missing Fill Time / ExecutionTime",
                                    severity: "warning"
                                })
                                continue
                            }

                            // Read commission and fee if available
                            const commission = this.parseNumber(this.findColumnValue(row, ["Commission", "Comm"]))
                            const fee = this.parseNumber(this.findColumnValue(row, ["Fee", "Fees", "Misc Fees"]))
                            const totalCommission = commission + fee

                            const direction = this.parseDirection(side)

                            trades.push({
                                date: date.toISOString(),
                                instrument: this.normalizeInstrument(String(symbol)),
                                direction,
                                entry_price: price,
                                exit_price: price,
                                size: qty,
                                pnl: 0,
                                commission: totalCommission > 0 ? totalCommission : undefined,
                                notes: "Imported from Rithmic (execution-level). P&L will be derived from grouped entries/exits.",
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
            // Stop loss is required by schema; if unknown, use entry price.
            stop_loss: parsedTrade.stop_loss ?? parsedTrade.entry_price,
            take_profit: parsedTrade.take_profit,
            size: parsedTrade.size,
            pnl: parsedTrade.pnl,
            outcome: parsedTrade.pnl > 0 ? "win" : parsedTrade.pnl < 0 ? "loss" : "breakeven",
            notes: parsedTrade.notes || "Imported from Rithmic",
            setup_name: parsedTrade.setup_name,
            account_id: accountId
        } as NewTradeInput
    }

    /**
     * Infer side from either explicit Side column or separate Buys/Sells columns.
     */
    private inferSide(row: Record<string, any>): ExecutionSide | null {
        const explicit = this.findColumnValue(row, ["Side", "Action"])
        if (explicit) {
            const s = String(explicit).toLowerCase()
            if (s.includes("buy") || s === "b") return "Buy"
            if (s.includes("sell") || s === "s") return "Sell"
        }

        const buys = this.parseNumber(this.findColumnValue(row, ["Buys", "BuyQty", "Buy"]))
        const sells = this.parseNumber(this.findColumnValue(row, ["Sells", "SellQty", "Sell"]))

        if (buys > 0 && sells === 0) return "Buy"
        if (sells > 0 && buys === 0) return "Sell"

        return null
    }
}

