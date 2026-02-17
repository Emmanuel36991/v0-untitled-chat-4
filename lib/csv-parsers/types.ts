// Common types and interfaces for CSV import parsers

import type { NewTradeInput } from "@/types"

/**
 * Supported broker types
 */
export type BrokerType =
    | "tradovate"
    | "thinkorswim"
    | "tradingview"
    | "interactive-brokers"
    | "rithmic"
    | "ninjatrader"
    | "generic"
    | "auto"

/**
 * Intermediate parsed trade before conversion to NewTradeInput
 */
export interface ParsedTrade {
    // Core fields
    date: string | Date
    instrument: string
    direction: "long" | "short"
    entry_price: number
    exit_price: number
    size: number
    pnl: number

    // Optional fields
    stop_loss?: number
    take_profit?: number
    commission?: number
    notes?: string
    setup_name?: string

    // Metadata
    rawRow?: Record<string, any>
    rowIndex?: number
}

/**
 * Column mapping for flexible field matching
 */
export interface ColumnMapping {
    csvColumn: string      // Original CSV column name
    appField: keyof ParsedTrade | null  // Target field in ParsedTrade
    confidence: number     // 0-1 match confidence score
    examples: string[]     // Sample values from this column
    dataType: "string" | "number" | "date" | "boolean"
}

/**
 * Validation error details
 */
export interface ValidationError {
    row: number
    field: string
    value: any
    message: string
    severity: "error" | "warning"
    suggestion?: string
}

/**
 * Result of CSV parsing and validation
 */
export interface ParseResult {
    success: boolean
    broker: BrokerType
    trades: ParsedTrade[]
    errors: ValidationError[]
    warnings: ValidationError[]
    stats: {
        totalRows: number
        validTrades: number
        skippedRows: number
        duplicates: number
    }
    columnMappings?: ColumnMapping[]
}

/**
 * CSV Parser interface that all broker parsers must implement
 */
export interface CSVParser {
    /**
     * Broker identifier
     */
    readonly brokerType: BrokerType

    /**
     * Broker display name
     */
    readonly brokerName: string

    /**
     * Detect if this parser can handle the given CSV content
     * @returns confidence score 0-1 (1 = definitely this broker)
     */
    detect(csvContent: string, headers: string[]): number

    /**
     * Parse CSV content into intermediate trade format
     */
    parse(csvContent: string): Promise<ParseResult>

    /**
     * Validate parsed trades
     */
    validate(trades: ParsedTrade[]): ValidationError[]

    /**
     * Convert parsed trades to NewTradeInput format
     */
    convertToTradeInput(parsedTrade: ParsedTrade, accountId?: string): NewTradeInput
}

/**
 * Options for CSV import
 */
export interface ImportOptions {
    broker?: BrokerType
    accountId?: string
    skipValidation?: boolean
    allowPartialImport?: boolean // Import valid rows even if some fail
}

/**
 * Broker detection result
 */
export interface DetectionResult {
    broker: BrokerType
    confidence: number
    reason: string
}
