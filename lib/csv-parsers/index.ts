// Parser Registry - Central entry point for CSV parsing

import Papa from "papaparse"
import type { CSVParser, BrokerType, DetectionResult, ParseResult, ImportOptions } from "./types"
import { TradovateParser } from "./tradovate-parser"
import { ThinkorswimParser } from "./thinkorswim-parser"
import { TradingViewParser } from "./tradingview-parser"
import { RithmicParser } from "./rithmic-parser"
import { NinjaTraderParser } from "./ninjatrader-parser"
import { InteractiveBrokersParser } from "./interactive-brokers-parser"
import { GenericParser } from "./generic-parser"
import type { NewTradeInput } from "@/types"

// Registry of all available parsers
const parsers: CSVParser[] = [
    new TradovateParser(),
    new ThinkorswimParser(),
    new TradingViewParser(),
    new InteractiveBrokersParser(),
    new RithmicParser(),
    new NinjaTraderParser(),
    new GenericParser()
]

/**
 * Auto-detect broker format from CSV content
 */
export function detectBrokerFormat(csvContent: string): DetectionResult {
    // Extract headers
    const lines = csvContent.split(/\r\n|\n|\r/)
    let headerLine = lines[0]

    // Try to find header row (might not be first line)
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i].toLowerCase()
        if (line.includes("symbol") || line.includes("date") || line.includes("instrument")) {
            headerLine = lines[i]
            break
        }
    }

    const headers = headerLine.split(",").map(h => h.trim().replace(/"/g, ""))

    console.log('[Broker Detection] Detected headers:', headers)

    // Run detection for all parsers
    const results = parsers.map(parser => ({
        broker: parser.brokerType,
        confidence: parser.detect(csvContent, headers),
        name: parser.brokerName
    }))

    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence)

    console.log('[Broker Detection] Confidence scores:', results.map(r => `${r.name}: ${(r.confidence * 100).toFixed(0)}%`).join(', '))

    const best = results[0]

    return {
        broker: best.broker,
        confidence: best.confidence,
        reason: `Detected as ${best.name} with ${(best.confidence * 100).toFixed(0)}% confidence`
    }
}

/**
 * Get parser instance by broker type
 */
export function getParser(broker: BrokerType): CSVParser {
    const parser = parsers.find(p => p.brokerType === broker)
    if (!parser) {
        // Fallback to generic parser
        return parsers.find(p => p.brokerType === "generic")!
    }
    return parser
}

/**
 * Parse CSV with auto-detection or specified broker
 */
export async function parseCSV(
    csvContent: string,
    options: ImportOptions = {}
): Promise<ParseResult> {
    let broker = options.broker || "auto"

    // Auto-detect if needed
    if (broker === "auto") {
        const detection = detectBrokerFormat(csvContent)
        broker = detection.broker
    }

    const parser = getParser(broker)
    const result = await parser.parse(csvContent)

    return result
}

/**
 * Convert parsed trades to NewTradeInput format
 */
export function convertTradesToInput(
    parseResult: ParseResult,
    accountId?: string
): NewTradeInput[] {
    const parser = getParser(parseResult.broker)

    return parseResult.trades
        .filter(trade => {
            // Filter out trades with errors
            const hasError = parseResult.errors.some(
                err => err.row === (trade.rowIndex || 0) + 1 && err.severity === "error"
            )
            return !hasError
        })
        .map(trade => parser.convertToTradeInput(trade, accountId))
}

/**
 * Get list of all supported brokers
 */
export function getSupportedBrokers(): Array<{ value: BrokerType; label: string }> {
    return parsers
        .filter(p => p.brokerType !== "generic")
        .map(p => ({
            value: p.brokerType,
            label: p.brokerName
        }))
}

// Export all parsers and types
export * from "./types"
export {
    TradovateParser,
    ThinkorswimParser,
    TradingViewParser,
    InteractiveBrokersParser,
    RithmicParser,
    NinjaTraderParser,
    GenericParser
}
