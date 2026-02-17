// TradingView CSV Parser
// Supports: List of Trades, Account History, and Order History exports

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"

type ExecutionSide = "Buy" | "Sell"

interface TVExecution {
    timestamp: Date
    instrument: string
    side: ExecutionSide
    price: number
    qty: number
    rowIndex: number
    rawRow: Record<string, any>
}

interface OpenLot {
    side: ExecutionSide
    price: number
    qtyRemaining: number
    timestamp: Date
    rowIndex: number
}

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
            let skippedRows = 0

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

                    // If Order History: treat rows as executions and FIFO match to round-trip trades
                    const executions: TVExecution[] = []

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
                                    skippedRows++
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
                                skippedRows++
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

                            // --- FIFO path (Order History) ---
                            if (isOrderHistory) {
                                const side = this.parseExecutionSide(this.findColumnValue(row, ["Side", "Type", "Action"]))
                                const normalizedInstrument = instrument ? this.normalizeInstrument(instrument) : "Unknown"
                                const execQty = qty > 0 ? qty : 0

                                // Only accept true executions: must have instrument, side, qty, and fill price
                                if (!instrument || !side || execQty <= 0 || fillPrice <= 0) {
                                    skippedRows++
                                    continue
                                }

                                executions.push({
                                    timestamp: date,
                                    instrument: normalizedInstrument,
                                    side,
                                    price: fillPrice,
                                    qty: execQty,
                                    rowIndex: i,
                                    rawRow: row
                                })

                                continue
                            }

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
                                instrument: instrument ? this.normalizeInstrument(instrument) : "Unknown",
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
                            skippedRows++
                        }
                    }

                    if (isOrderHistory && executions.length > 0) {
                        const fifoTrades = this.matchExecutionsFIFO(executions, warnings)
                        trades.push(...fifoTrades)
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
                            skippedRows: isOrderHistory ? skippedRows : (totalRows - trades.length),
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
            notes: parsedTrade.notes || "Imported from TradingView",
            setup_name: parsedTrade.setup_name,
            account_id: accountId
        } as NewTradeInput
    }

    private parseExecutionSide(value: any): ExecutionSide | null {
        if (!value) return null
        const str = String(value).trim().toLowerCase()
        if (!str) return null
        if (str === "b" || str === "buy" || str.includes("buy")) return "Buy"
        if (str === "s" || str === "sell" || str.includes("sell")) return "Sell"
        return null
    }

    private getContractMultiplier(instrument: string): number {
        const key = instrument.toUpperCase()
        const multipliers: Record<string, number> = {
            ES: 50,
            NQ: 20,
            CL: 1000,
            GC: 100,
            MES: 5,
            MNQ: 2,
            MCL: 100,
            MGC: 10,
            MYM: 0.5,
        }
        return multipliers[key] ?? 1
    }

    private matchExecutionsFIFO(executions: TVExecution[], warnings: ValidationError[]): ParsedTrade[] {
        const byInstrument = new Map<string, TVExecution[]>()
        for (const e of executions) {
            const list = byInstrument.get(e.instrument) || []
            list.push(e)
            byInstrument.set(e.instrument, list)
        }

        const out: ParsedTrade[] = []

        for (const [instrument, execs] of byInstrument.entries()) {
            execs.sort((a, b) => {
                const dt = a.timestamp.getTime() - b.timestamp.getTime()
                if (dt !== 0) return dt
                return a.rowIndex - b.rowIndex
            })

            const multiplier = this.getContractMultiplier(instrument)
            const queue: OpenLot[] = []

            let cycleEntryTime: Date | null = null
            let cycleExitTime: Date | null = null
            let cycleDirection: "long" | "short" | null = null
            let totalQty = 0
            let entryNotional = 0
            let exitNotional = 0
            let pnl = 0
            let matches = 0

            const finalizeIfFlat = () => {
                if (queue.length > 0) return
                if (!cycleEntryTime || !cycleExitTime || !cycleDirection || totalQty <= 0) {
                    cycleEntryTime = null
                    cycleExitTime = null
                    cycleDirection = null
                    totalQty = 0
                    entryNotional = 0
                    exitNotional = 0
                    pnl = 0
                    matches = 0
                    return
                }

                const avgEntry = entryNotional / totalQty
                const avgExit = exitNotional / totalQty
                const durationMinutes = (cycleExitTime.getTime() - cycleEntryTime.getTime()) / 60000

                out.push({
                    date: cycleEntryTime.toISOString(),
                    instrument,
                    direction: cycleDirection,
                    entry_price: avgEntry,
                    exit_price: avgExit,
                    size: totalQty,
                    pnl,
                    notes: [
                        "Imported from TradingView (Order History, FIFO matched)",
                        `Matches: ${matches}`,
                        `Multiplier: ${multiplier}`,
                        `Start: ${cycleEntryTime.toISOString()}`,
                        `End: ${cycleExitTime.toISOString()}`,
                        `Duration(min): ${durationMinutes.toFixed(2)}`
                    ].join(" | "),
                    rawRow: {
                        __entryTimeISO: cycleEntryTime.toISOString(),
                        __exitTimeISO: cycleExitTime.toISOString(),
                        __durationMinutes: durationMinutes,
                        __multiplier: multiplier
                    }
                })

                cycleEntryTime = null
                cycleExitTime = null
                cycleDirection = null
                totalQty = 0
                entryNotional = 0
                exitNotional = 0
                pnl = 0
                matches = 0
            }

            for (const exec of execs) {
                let qtyToProcess = exec.qty

                while (qtyToProcess > 0) {
                    const queueSide = queue[0]?.side

                    // Open/add
                    if (!queueSide || queueSide === exec.side) {
                        if (!cycleEntryTime) {
                            cycleEntryTime = exec.timestamp
                            cycleDirection = exec.side === "Buy" ? "long" : "short"
                        }

                        queue.push({
                            side: exec.side,
                            price: exec.price,
                            qtyRemaining: qtyToProcess,
                            timestamp: exec.timestamp,
                            rowIndex: exec.rowIndex
                        })
                        qtyToProcess = 0
                        break
                    }

                    // Close/match
                    const lot = queue[0]
                    const matchedQty = Math.min(qtyToProcess, lot.qtyRemaining)

                    if (!cycleEntryTime) {
                        cycleEntryTime = lot.timestamp
                        cycleDirection = lot.side === "Buy" ? "long" : "short"
                    }

                    cycleExitTime = exec.timestamp
                    matches++
                    totalQty += matchedQty
                    entryNotional += lot.price * matchedQty
                    exitNotional += exec.price * matchedQty

                    const direction: "long" | "short" = lot.side === "Buy" ? "long" : "short"
                    const pnlPoints =
                        direction === "long"
                            ? (exec.price - lot.price) * matchedQty
                            : (lot.price - exec.price) * matchedQty
                    pnl += pnlPoints * multiplier

                    lot.qtyRemaining -= matchedQty
                    qtyToProcess -= matchedQty

                    if (lot.qtyRemaining <= 0) queue.shift()

                    if (queue.length === 0) finalizeIfFlat()
                }
            }

            if (queue.length > 0) {
                const openQty = queue.reduce((s, l) => s + l.qtyRemaining, 0)
                const openSide = queue[0]?.side
                warnings.push({
                    row: 0,
                    field: "open_position",
                    value: { instrument, openSide, openQty },
                    message: `Unmatched open position remains for ${instrument}: ${openSide} ${openQty}. No trade emitted until it is closed.`,
                    severity: "warning",
                    suggestion: "Import a wider date range or ensure the position was closed within the exported period."
                })
            }
        }

        return out
    }
}
