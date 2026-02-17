/**
 * Normalizes instrument/symbol names from various broker formats
 * into canonical short names for consistent grouping.
 *
 * Examples:
 *   CME_MINI:MNQH2026  → MNQ
 *   CME_MINI:ESZ2025   → ES
 *   CME_MINI:NQM2024   → NQ
 *   COINBASE:BTCUSD     → BTCUSD
 *   BLACKBULL:NAS100    → NAS100
 *   ESM4                → ES
 *   MNQZ24              → MNQ
 */

// Futures month codes
const FUTURES_MONTH_CODES = new Set([
    "F", "G", "H", "J", "K", "M", "N", "Q", "U", "V", "X", "Z"
])

/**
 * Known futures base symbols and their canonical names.
 * Ordered longest-first so "MNQ" matches before "NQ".
 */
const FUTURES_SYMBOLS = [
    // Micro contracts (must come before their full-size counterparts)
    "MNQ",  // Micro Nasdaq-100
    "MES",  // Micro S&P 500
    "MYM",  // Micro Dow
    "M2K",  // Micro Russell 2000
    "MGC",  // Micro Gold
    "MSI",  // Micro Silver
    "MCL",  // Micro Crude Oil
    "MBT",  // Micro Bitcoin
    "MET",  // Micro Ether
    // Full-size contracts
    "NQ",   // Nasdaq-100 E-mini
    "ES",   // S&P 500 E-mini
    "YM",   // Dow E-mini
    "RTY",  // Russell 2000 E-mini
    "GC",   // Gold
    "SI",   // Silver
    "CL",   // Crude Oil
    "NG",   // Natural Gas
    "ZB",   // 30-Year Treasury Bond
    "ZN",   // 10-Year Treasury Note
    "ZF",   // 5-Year Treasury Note
    "ZT",   // 2-Year Treasury Note
    "ZS",   // Soybeans
    "ZC",   // Corn
    "ZW",   // Wheat
    "HG",   // Copper
    "PL",   // Platinum
    "PA",   // Palladium
    "HE",   // Lean Hogs
    "LE",   // Live Cattle
    "BTC",  // Bitcoin (CME)
    "ETH",  // Ether (CME)
    "6E",   // Euro FX
    "6J",   // Japanese Yen
    "6B",   // British Pound
    "6A",   // Australian Dollar
    "6C",   // Canadian Dollar
    "6S",   // Swiss Franc
]

/**
 * Known exchange prefixes to strip
 */
const EXCHANGE_PREFIXES = [
    "CME_MINI:",
    "CME_MICRO:",
    "CME:",
    "CBOT:",
    "NYMEX:",
    "COMEX:",
    "CBOE:",
    "COINBASE:",
    "BINANCE:",
    "BLACKBULL:",
    "OANDA:",
    "FXCM:",
    "IBKR:",
    "KRAKEN:",
    "BYBIT:",
    "FTX:",
    "GLOBEX:",
    "ICE:",
    "EUREX:",
    "SGX:",
    "HKEX:",
    "OSE:",
    "NSE:",
    "BSE:",
]

/**
 * Strip the exchange prefix from a symbol.
 * "CME_MINI:MNQH2026" → "MNQH2026"
 */
function stripExchange(symbol: string): string {
    const upper = symbol.toUpperCase()
    for (const prefix of EXCHANGE_PREFIXES) {
        if (upper.startsWith(prefix)) {
            return symbol.slice(prefix.length)
        }
    }
    // Also handle generic "EXCHANGE:" pattern
    const colonIdx = symbol.indexOf(":")
    if (colonIdx > 0 && colonIdx < symbol.length - 1) {
        return symbol.slice(colonIdx + 1)
    }
    return symbol
}

/**
 * Strip the futures contract month+year suffix from a base symbol.
 * Patterns:
 *   MNQH2026 → MNQ   (letter + 4-digit year)
 *   ESM24    → ES    (letter + 2-digit year)
 *   NQZ4     → NQ    (letter + 1-digit year)
 */
function stripFuturesContract(symbol: string): string {
    const upper = symbol.toUpperCase()

    // Try to match a known futures base symbol
    for (const base of FUTURES_SYMBOLS) {
        if (upper.startsWith(base)) {
            const rest = upper.slice(base.length)

            // Check if the remainder is a contract code: MonthCode + Year(1-4 digits)
            if (rest.length >= 2 && rest.length <= 5) {
                const monthCode = rest[0]
                const yearPart = rest.slice(1)

                if (FUTURES_MONTH_CODES.has(monthCode) && /^\d{1,4}$/.test(yearPart)) {
                    return base
                }
            }
        }
    }

    // Fallback: try generic regex pattern for any symbol + month code + year
    // Match: 2+ alpha chars + 1 futures month code + 1-4 digit year
    const match = upper.match(/^([A-Z0-9]{1,5})([FGHJKMNQUVXZ])(\d{1,4})$/)
    if (match) {
        const [, base, monthCode, year] = match
        // Only strip if the base is at least 1 char and the year looks valid
        if (base.length >= 1 && FUTURES_MONTH_CODES.has(monthCode)) {
            return base
        }
    }

    return symbol
}

/**
 * Main normalization function.
 * Strips exchange prefix and futures contract suffix.
 *
 * @param rawSymbol - The raw symbol from the CSV (e.g. "CME_MINI:MNQH2026")
 * @returns Normalized symbol (e.g. "MNQ")
 */
export function normalizeSymbol(rawSymbol: string): string {
    if (!rawSymbol) return rawSymbol

    const trimmed = rawSymbol.trim()
    if (!trimmed) return trimmed

    // Step 1: Strip exchange prefix
    let withoutExchange = stripExchange(trimmed)

    // Strip TOS-style leading "/" for futures (e.g., "/ESM6" -> "ESM6")
    if (withoutExchange.startsWith("/")) {
        withoutExchange = withoutExchange.slice(1)
    }

    // Step 2: Strip futures contract code
    // Also strip TradingView continuous contract suffixes like "!" or "1!"
    if (withoutExchange.endsWith("!") || withoutExchange.endsWith("1!") || withoutExchange.endsWith("2!")) {
        withoutExchange = withoutExchange.replace(/[0-9]?!$/, "")
    }

    const normalized = stripFuturesContract(withoutExchange)

    return normalized
}

/**
 * Get a human-friendly display name for a symbol.
 */
const DISPLAY_NAMES: Record<string, string> = {
    MNQ: "Micro Nasdaq-100",
    MES: "Micro S&P 500",
    MYM: "Micro Dow",
    M2K: "Micro Russell 2000",
    NQ: "Nasdaq-100 E-mini",
    ES: "S&P 500 E-mini",
    YM: "Dow E-mini",
    RTY: "Russell 2000 E-mini",
    GC: "Gold",
    SI: "Silver",
    CL: "Crude Oil",
    NG: "Natural Gas",
    BTC: "Bitcoin",
    ETH: "Ethereum",
    BTCUSD: "Bitcoin/USD",
    ETHUSD: "Ethereum/USD",
    NAS100: "Nasdaq 100 CFD",
    SPX500: "S&P 500 CFD",
    US30: "Dow Jones CFD",
}

export function getSymbolDisplayName(symbol: string): string | undefined {
    return DISPLAY_NAMES[symbol.toUpperCase()]
}
