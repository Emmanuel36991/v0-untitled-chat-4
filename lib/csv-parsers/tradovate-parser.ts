// Tradovate CSV Parser

import Papa from "papaparse"
import { BaseCSVParser } from "./base-parser"
import type { ParseResult, ParsedTrade, ValidationError, BrokerType } from "./types"
import type { NewTradeInput } from "@/types"
import { getInstrumentMultiplier } from "@/types/instrument-calculations"

type ExecutionSide = "Buy" | "Sell"

interface TradovateExecution {
    timestamp: Date
    instrument: string // normalized root symbol (e.g., ES, NQ, CL)
    rawContract: string // raw contract string from CSV (e.g., ESM6)
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

interface CycleAggregate {
    instrument: string
    direction: "long" | "short"
    entryTime: Date
    exitTime: Date
    totalQty: number
    entryNotional: number
    exitNotional: number
    pnl: number
    matches: number
    notesParts: string[]
    rawContracts: Set<string>
}

export class TradovateParser extends BaseCSVParser {
    readonly brokerType: BrokerType = "tradovate"
    readonly brokerName = "Tradovate"

    detect(csvContent: string, headers: string[]): number {
        const headerStr = headers.join(" ").toLowerCase()

        // Highest-confidence indicators for Tradovate *Orders Module* grid exports
        const rawOrderLogIndicators = ["_priceformat", "_ticksize", "lastcommandid"]
        const hasRawOrderLogFingerprint = rawOrderLogIndicators.every(ind => headerStr.includes(ind))
        if (hasRawOrderLogFingerprint) return 1.0

        // Tradovate *Performance Report* exports (pre-matched round-trips)
        const perfReportIndicators = ["buyprice", "sellprice", "pnl", "boughttimestamp", "soldtimestamp"]
        const perfMatches = perfReportIndicators.filter(ind => headerStr.includes(ind))
        if (perfMatches.length >= 4) return 0.98
        if (perfMatches.length >= 3 && headerStr.includes("symbol")) return 0.95

        // Tradovate "Trades / Executions" style exports/templates
        const tradesTemplateIndicators = ["strategy", "trade date", "trade time", "gross pnl", "net pnl", "order id"]
        const tradesTemplateMatches = tradesTemplateIndicators.filter(ind => headerStr.includes(ind))
        if (tradesTemplateMatches.length >= 4 && headerStr.includes("instrument") && headerStr.includes("side")) {
            return 0.95
        }

        // Secondary indicators (older/performance exports)
        const tradovateIndicators = ["account", "contract", "fill time", "b/s", "filled qty", "avg fill price"]
        const matches = tradovateIndicators.filter(ind => headerStr.includes(ind))

        if (matches.length >= 4) return 0.9
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
            let skippedRows = 0

            Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = results.data as any[]
                    totalRows = rows.length

                    // Detect Performance Report format (pre-matched round-trips)
                    const parsedHeaders = results.meta.fields || []
                    const headersLower = parsedHeaders.map(h => h.toLowerCase())
                    const isPerformanceReport =
                        headersLower.includes("buyprice") &&
                        headersLower.includes("sellprice") &&
                        headersLower.includes("boughttimestamp") &&
                        headersLower.includes("soldtimestamp")

                    if (isPerformanceReport) {
                        const perfResult = this.parsePerformanceReport(rows, totalRows)
                        resolve(perfResult)
                        return
                    }

                    // 1) Pre-process: extract *executions only* from raw Orders log
                    const executions: TradovateExecution[] = []

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i] as Record<string, any>

                        try {
                            const statusRaw = this.findColumnValue(row, ["Status"])
                            const status = String(statusRaw || "").trim().toLowerCase()
                            const hasStatus = statusRaw !== null && statusRaw !== undefined && String(statusRaw).trim() !== ""

                            // Quantity: prefer filled quantity columns, but fall back to Qty/Quantity for other Tradovate exports
                            const qty = this.parseNumber(this.findColumnValue(row, [
                                "Filled Qty", "filledQty", "Fill Qty", "filledqty",
                                "Qty", "Quantity"
                            ]))

                            // Execution filter: filled-like statuses (if Status exists) AND positive qty
                            if ((hasStatus && !this.isFilledLikeStatus(status)) || qty <= 0) {
                                skippedRows++
                                continue
                            }

                            const rawContract = this.findColumnValue(row, ["Contract", "Symbol", "Instrument"])
                            if (!rawContract) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "Contract",
                                    value: rawContract,
                                    message: "Skipped row: missing Contract/Symbol",
                                    severity: "warning",
                                    suggestion: "Ensure you exported the Tradovate Orders grid with the Contract column visible."
                                })
                                continue
                            }

                            const sideRaw = this.findColumnValue(row, ["B/S", "Side", "Action", "Buy/Sell"])
                            const side = this.parseExecutionSide(sideRaw)
                            if (!side) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "B/S",
                                    value: sideRaw,
                                    message: "Skipped row: could not determine Buy/Sell side",
                                    severity: "warning",
                                    suggestion: "Expected values like Buy/Sell or B/S."
                                })
                                continue
                            }

                            const price = this.parseNumber(this.findColumnValue(row, [
                                "Avg Fill Price", "avgPrice", "Fill Price", "Avg Price", "Price"
                            ]))
                            if (price <= 0) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "Avg Fill Price",
                                    value: this.findColumnValue(row, ["Avg Fill Price", "avgPrice", "Fill Price", "Avg Price", "Price"]),
                                    message: "Skipped row: missing or invalid fill price",
                                    severity: "warning"
                                })
                                continue
                            }

                            // Timestamp: prefer Fill Time, else combine date+time style exports
                            const tradeDate = this.findColumnValue(row, ["Trade Date", "Date"])
                            const tradeTime = this.findColumnValue(row, ["Trade Time", "Time"])
                            const combinedDateTime =
                                tradeDate && tradeTime ? `${tradeDate} ${tradeTime}` : null

                            const tsRaw = this.findColumnValue(row, [
                                "Fill Time",
                                "Timestamp",
                                "Placing Time",
                                "Closing Time",
                            ]) ?? combinedDateTime

                            const timestamp = this.parseTradovateTimestamp(tsRaw)
                            if (!timestamp) {
                                skippedRows++
                                warnings.push({
                                    row: i + 1,
                                    field: "Fill Time",
                                    value: tsRaw,
                                    message: "Skipped row: invalid or missing timestamp",
                                    severity: "warning",
                                    suggestion: "Expected ISO 8601 or MM/DD/YY HH:MM:SS-like values."
                                })
                                continue
                            }

                            const instrument = this.normalizeInstrument(String(rawContract))

                            executions.push({
                                timestamp,
                                instrument,
                                rawContract: String(rawContract),
                                side,
                                price,
                                qty,
                                rowIndex: i,
                                rawRow: row
                            })
                        } catch (error: any) {
                            // Row-level parsing failures shouldn't abort the import; capture as warning.
                            skippedRows++
                            warnings.push({
                                row: i + 1,
                                field: "parse",
                                value: row,
                                message: error.message || "Failed to parse row",
                                severity: "warning"
                            })

                            // Descriptive error logs for debugging mismatched broker exports.
                            // eslint-disable-next-line no-console
                            console.warn("[TradovateParser] Skipped row due to parse error", {
                                row: i + 1,
                                error: error?.message,
                                sample: {
                                    Status: row?.Status,
                                    Contract: row?.Contract,
                                    "Fill Time": row?.["Fill Time"],
                                    Timestamp: row?.Timestamp,
                                    "Filled Qty": row?.["Filled Qty"],
                                    filledQty: row?.filledQty,
                                    "Avg Fill Price": row?.["Avg Fill Price"],
                                    avgPrice: row?.avgPrice,
                                    "B/S": row?.["B/S"]
                                }
                            })
                        }
                    }

                    // 2) FIFO match executions into completed, flat-to-flat trades (per instrument)
                    const tradesFromExecutions = this.matchExecutionsFIFO(executions, warnings)
                    trades.push(...tradesFromExecutions)

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
        const rawRow = parsedTrade.rawRow || {}
        const tradeStart = typeof rawRow.__entryTimeISO === "string" ? rawRow.__entryTimeISO : undefined
        const tradeEnd = typeof rawRow.__exitTimeISO === "string" ? rawRow.__exitTimeISO : undefined
        const durationMinutes =
            typeof rawRow.__durationMinutes === "number" && isFinite(rawRow.__durationMinutes)
                ? rawRow.__durationMinutes
                : undefined

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
            notes: parsedTrade.notes || "Imported from Tradovate",
            setup_name: parsedTrade.setup_name,
            account_id: accountId,

            // Legacy/unified duration fields (optional)
            trade_start_time: tradeStart,
            trade_end_time: tradeEnd,
            duration_minutes: durationMinutes,
            precise_duration_minutes: durationMinutes,

            // Form-friendly duplicates (optional)
            tradeStartTime: tradeStart,
            tradeEndTime: tradeEnd,
            durationMinutes: durationMinutes,
            preciseDurationMinutes: durationMinutes
        } as NewTradeInput
    }

    /**
     * Parse Tradovate timestamps, defaulting to UTC when ambiguous.
     * Supports:
     * - ISO 8601 (with or without timezone)
     * - "yyyy-MM-dd HH:mm:ss" (assumed UTC)
     * - "MM/dd/yyyy HH:mm:ss" and "MM/dd/yy HH:mm:ss" (assumed UTC)
     */
    private parseTradovateTimestamp(value: any): Date | null {
        if (!value) return null
        if (value instanceof Date) return isNaN(value.getTime()) ? null : value

        // Epoch timestamps (ms or seconds)
        if (typeof value === "number" && isFinite(value)) {
            const ms = value > 1e12 ? value : value * 1000
            const d = new Date(ms)
            return isNaN(d.getTime()) ? null : d
        }

        const str = String(value).trim()
        if (!str) return null

        // Epoch timestamps provided as strings
        if (/^\d{10,13}$/.test(str)) {
            const n = Number(str)
            if (isFinite(n)) {
                const ms = str.length === 13 ? n : n * 1000
                const d = new Date(ms)
                return isNaN(d.getTime()) ? null : d
            }
        }

        // If timezone is explicitly provided, trust native parsing.
        const hasExplicitTz = /[zZ]$/.test(str) || /[+-]\d{2}:\d{2}$/.test(str)
        if (hasExplicitTz) {
            const d = new Date(str)
            return isNaN(d.getTime()) ? null : d
        }

        // yyyy-MM-dd HH:mm:ss or yyyy-MM-dd'T'HH:mm:ss (assume UTC)
        let m = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/)
        if (m) {
            const [, yy, mo, dd, hh, mi, ss, msRaw] = m
            const ms = msRaw ? Number(msRaw.padEnd(3, "0")) : 0
            const d = new Date(Date.UTC(Number(yy), Number(mo) - 1, Number(dd), Number(hh), Number(mi), Number(ss), ms))
            return isNaN(d.getTime()) ? null : d
        }

        // MM/dd/yyyy HH:mm:ss or MM/dd/yy HH:mm:ss (assume UTC)
        m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?$/)
        if (m) {
            const [, mm, dd, yyRaw, hh, mi, ssRaw, msRaw] = m
            const yyNum = Number(yyRaw)
            const year = yyRaw.length === 2 ? (yyNum >= 70 ? 1900 + yyNum : 2000 + yyNum) : yyNum
            const sec = ssRaw ? Number(ssRaw) : 0
            const ms = msRaw ? Number(msRaw.padEnd(3, "0")) : 0
            const d = new Date(Date.UTC(year, Number(mm) - 1, Number(dd), Number(hh), Number(mi), sec, ms))
            return isNaN(d.getTime()) ? null : d
        }

        // Last resort: try BaseCSVParser date parser (local), then convert as-is.
        // Note: This may interpret ambiguous timestamps in local time, but it's better than dropping the row.
        const fallback = this.parseDate(str)
        return fallback && !isNaN(fallback.getTime()) ? fallback : null
    }

    private isFilledLikeStatus(statusLower: string): boolean {
        if (!statusLower) return false
        if (statusLower.includes("reject")) return false
        if (statusLower.includes("cancel")) return false
        if (statusLower.includes("expire")) return false
        return statusLower === "filled" || statusLower.includes("filled")
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
        return getInstrumentMultiplier(instrument)
    }

    /**
     * Parse Tradovate Performance Report CSV (pre-matched round-trip trades).
     * Each row already has buyPrice, sellPrice, pnl, boughtTimestamp, soldTimestamp, qty.
     */
    private parsePerformanceReport(rows: any[], totalRows: number): ParseResult {
        const errors: ValidationError[] = []
        const warnings: ValidationError[] = []
        const trades: ParsedTrade[] = []
        let skippedRows = 0

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] as Record<string, any>

            try {
                const symbol = this.findColumnValue(row, ["symbol", "Symbol", "Contract", "Instrument"])
                if (!symbol) {
                    skippedRows++
                    warnings.push({
                        row: i + 1,
                        field: "symbol",
                        value: symbol,
                        message: "Skipped row: missing symbol",
                        severity: "warning"
                    })
                    continue
                }

                const qty = this.parseNumber(this.findColumnValue(row, ["qty", "Qty", "Quantity", "Size"]))
                if (qty <= 0) {
                    skippedRows++
                    continue
                }

                const buyPrice = this.parseNumber(this.findColumnValue(row, ["buyPrice", "BuyPrice", "Buy Price"]))
                const sellPrice = this.parseNumber(this.findColumnValue(row, ["sellPrice", "SellPrice", "Sell Price"]))

                if (buyPrice <= 0 || sellPrice <= 0) {
                    skippedRows++
                    warnings.push({
                        row: i + 1,
                        field: "buyPrice/sellPrice",
                        value: { buyPrice, sellPrice },
                        message: "Skipped row: missing or invalid buy/sell prices",
                        severity: "warning"
                    })
                    continue
                }

                const boughtTsRaw = this.findColumnValue(row, ["boughtTimestamp", "BoughtTimestamp", "Bought Timestamp", "Buy Time"])
                const soldTsRaw = this.findColumnValue(row, ["soldTimestamp", "SoldTimestamp", "Sold Timestamp", "Sell Time"])

                const boughtTs = this.parseTradovateTimestamp(boughtTsRaw)
                const soldTs = this.parseTradovateTimestamp(soldTsRaw)

                if (!boughtTs || !soldTs) {
                    skippedRows++
                    warnings.push({
                        row: i + 1,
                        field: "timestamp",
                        value: { boughtTsRaw, soldTsRaw },
                        message: "Skipped row: invalid or missing bought/sold timestamp",
                        severity: "warning"
                    })
                    continue
                }

                // Direction: if bought before sold -> long, else short
                const isLong = boughtTs.getTime() <= soldTs.getTime()
                const direction: "long" | "short" = isLong ? "long" : "short"
                const entryTime = isLong ? boughtTs : soldTs
                const exitTime = isLong ? soldTs : boughtTs
                const entryPrice = isLong ? buyPrice : sellPrice
                const exitPrice = isLong ? sellPrice : buyPrice

                // Parse P&L: handles formats like "$(1,740.00)", "$375.00", "-1740.00"
                const pnlRaw = this.findColumnValue(row, ["pnl", "Pnl", "PnL", "P&L", "Profit/Loss"])
                const pnl = this.parsePnlValue(pnlRaw)

                // Parse duration string like "4min 52sec"
                const durationRaw = this.findColumnValue(row, ["duration", "Duration"])
                const durationMinutes = this.parseDurationString(durationRaw)

                const instrument = this.normalizeInstrument(String(symbol))

                trades.push({
                    date: entryTime.toISOString(),
                    instrument,
                    direction,
                    entry_price: entryPrice,
                    exit_price: exitPrice,
                    size: qty,
                    pnl,
                    notes: [
                        "Imported from Tradovate Performance Report",
                        `Contract: ${symbol}`,
                        `Entry: ${entryTime.toISOString()}`,
                        `Exit: ${exitTime.toISOString()}`,
                        durationRaw ? `Duration: ${durationRaw}` : null,
                    ].filter(Boolean).join(" | "),
                    rawRow: {
                        ...row,
                        __entryTimeISO: entryTime.toISOString(),
                        __exitTimeISO: exitTime.toISOString(),
                        __durationMinutes: durationMinutes,
                    },
                    rowIndex: i
                })
            } catch (error: any) {
                skippedRows++
                warnings.push({
                    row: i + 1,
                    field: "parse",
                    value: row,
                    message: error.message || "Failed to parse performance row",
                    severity: "warning"
                })
            }
        }

        const validationErrors = this.validate(trades)
        errors.push(...validationErrors)

        return {
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
        }
    }

    /**
     * Parse Tradovate P&L values. Handles:
     * - "$(1,740.00)" -> -1740
     * - "$375.00" -> 375
     * - "-1740.00" -> -1740
     * - Plain numbers
     */
    private parsePnlValue(value: any): number {
        if (typeof value === "number") return value
        if (!value) return 0

        let str = String(value).trim()
        if (!str) return 0

        // Check for parenthetical negatives: $(1,740.00) or (1,740.00)
        const isParenNeg = str.includes("(") && str.includes(")")

        // Strip $, commas, parens
        str = str.replace(/[$,()]/g, "").trim()

        const num = parseFloat(str)
        if (isNaN(num)) return 0

        return isParenNeg ? -Math.abs(num) : num
    }

    /**
     * Parse Tradovate duration strings like "4min 52sec", "1hr 20min 5sec", "30sec"
     * Returns fractional minutes.
     */
    private parseDurationString(value: any): number {
        if (!value) return 0
        if (typeof value === "number") return value

        const str = String(value).trim().toLowerCase()
        if (!str) return 0

        let totalMinutes = 0

        const hrMatch = str.match(/(\d+)\s*hr/)
        if (hrMatch) totalMinutes += Number(hrMatch[1]) * 60

        const minMatch = str.match(/(\d+)\s*min/)
        if (minMatch) totalMinutes += Number(minMatch[1])

        const secMatch = str.match(/(\d+)\s*sec/)
        if (secMatch) totalMinutes += Number(secMatch[1]) / 60

        return totalMinutes
    }

    /**
     * Core FIFO matching engine.
     * - Groups executions by instrument
     * - Processes chronologically
     * - Matches opposite-side executions against open lots FIFO
     * - Aggregates flat-to-flat cycles into a single ParsedTrade per instrument cycle
     */
    private matchExecutionsFIFO(
        executions: TradovateExecution[],
        warnings: ValidationError[]
    ): ParsedTrade[] {
        const byInstrument = new Map<string, TradovateExecution[]>()
        for (const exec of executions) {
            const list = byInstrument.get(exec.instrument) || []
            list.push(exec)
            byInstrument.set(exec.instrument, list)
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
            let currentCycle: CycleAggregate | null = null

            const startCycleIfNeeded = (openingExec: TradovateExecution) => {
                if (currentCycle) return
                currentCycle = {
                    instrument,
                    direction: openingExec.side === "Buy" ? "long" : "short",
                    entryTime: openingExec.timestamp,
                    exitTime: openingExec.timestamp, // will be updated on matches
                    totalQty: 0,
                    entryNotional: 0,
                    exitNotional: 0,
                    pnl: 0,
                    matches: 0,
                    notesParts: [],
                    rawContracts: new Set([openingExec.rawContract]),
                }
            }

            const finalizeCycleIfFlat = () => {
                if (!currentCycle) return
                if (queue.length > 0) return

                const avgEntry = currentCycle.totalQty > 0 ? currentCycle.entryNotional / currentCycle.totalQty : 0
                const avgExit = currentCycle.totalQty > 0 ? currentCycle.exitNotional / currentCycle.totalQty : 0
                const durationMinutes = (currentCycle.exitTime.getTime() - currentCycle.entryTime.getTime()) / 60000

                // If we somehow have a cycle with no matches, don't emit a trade.
                if (currentCycle.totalQty <= 0) {
                    currentCycle = null
                    return
                }

                out.push({
                    date: currentCycle.entryTime.toISOString(),
                    instrument,
                    direction: currentCycle.direction,
                    entry_price: avgEntry,
                    exit_price: avgExit,
                    size: currentCycle.totalQty,
                    pnl: currentCycle.pnl,
                    notes: [
                        `Imported from Tradovate Orders (FIFO matched)`,
                        `Contracts: ${Array.from(currentCycle.rawContracts).join(", ")}`,
                        `Matches: ${currentCycle.matches}`,
                        `Multiplier: ${multiplier}`,
                        `Start: ${currentCycle.entryTime.toISOString()}`,
                        `End: ${currentCycle.exitTime.toISOString()}`,
                        `Duration(min): ${durationMinutes.toFixed(2)}`,
                        ...currentCycle.notesParts
                    ].join(" | "),
                    rawRow: {
                        __entryTimeISO: currentCycle.entryTime.toISOString(),
                        __exitTimeISO: currentCycle.exitTime.toISOString(),
                        __durationMinutes: durationMinutes,
                        __multiplier: multiplier
                    },
                })

                currentCycle = null
            }

            for (const exec of execs) {
                let qtyToProcess = exec.qty

                // Keep a record of raw contract strings that contributed to this cycle.
                if (currentCycle) currentCycle.rawContracts.add(exec.rawContract)

                while (qtyToProcess > 0) {
                    const queueSide = queue[0]?.side

                    // Opening (or adding) position: push to queue
                    if (!queueSide || queueSide === exec.side) {
                        startCycleIfNeeded(exec)

                        queue.push({
                            side: exec.side,
                            price: exec.price,
                            qtyRemaining: qtyToProcess,
                            timestamp: exec.timestamp,
                            rowIndex: exec.rowIndex
                        })

                        if (currentCycle) currentCycle.rawContracts.add(exec.rawContract)
                        qtyToProcess = 0
                        break
                    }

                    // Closing position: match against FIFO lots
                    const lot = queue[0]
                    const matchedQty = Math.min(qtyToProcess, lot.qtyRemaining)

                    // Ensure we have a cycle (should always be true if there's an open lot)
                    startCycleIfNeeded(exec)
                    if (!currentCycle) {
                        // Defensive: should never happen
                        warnings.push({
                            row: exec.rowIndex + 1,
                            field: "fifo",
                            value: exec.rawRow,
                            message: "Internal FIFO state error: closing execution without an active cycle",
                            severity: "warning"
                        })
                        break
                    }

                    currentCycle.exitTime = exec.timestamp
                    currentCycle.matches += 1
                    currentCycle.totalQty += matchedQty
                    currentCycle.entryNotional += lot.price * matchedQty
                    currentCycle.exitNotional += exec.price * matchedQty

                    const direction: "long" | "short" = lot.side === "Buy" ? "long" : "short"
                    const pnlPoints =
                        direction === "long"
                            ? (exec.price - lot.price) * matchedQty
                            : (lot.price - exec.price) * matchedQty
                    currentCycle.pnl += pnlPoints * multiplier

                    // Reduce quantities
                    lot.qtyRemaining -= matchedQty
                    qtyToProcess -= matchedQty

                    if (lot.qtyRemaining <= 0) {
                        queue.shift()
                    }

                    // If we flattened, finalize the aggregated trade.
                    if (queue.length === 0) {
                        finalizeCycleIfFlat()

                        // If there's remaining qty on this execution, the loop continues,
                        // and we'll open a new cycle in the next iteration (position flip).
                    }
                }
            }

            // Any remaining open lots mean the user ended the period with an open position.
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
