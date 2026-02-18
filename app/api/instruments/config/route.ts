import { NextResponse } from "next/server"
import { INSTRUMENT_CONFIGS } from "@/types/instrument-calculations"

/**
 * GET /api/instruments/config
 *
 * Returns the canonical instrument configs used for PnL and trade chart calculations.
 * Use this as the single source of truth for point value, multiplier, and tick size
 * for all supported instruments (futures, forex, stocks, crypto, etc.).
 *
 * PnL formula: points × contracts × multiplier = dollar PnL
 * Example: MNQ 20 points, 3 contracts → 20 × 3 × 2 = $120
 */
export async function GET() {
  const configs = Object.values(INSTRUMENT_CONFIGS).map((c) => ({
    symbol: c.symbol,
    name: c.name,
    category: c.category,
    multiplier: c.multiplier,
    tickSize: c.tickSize,
    tickValue: c.tickValue,
    currency: c.currency,
    displayDecimals: c.displayDecimals,
  }))
  return NextResponse.json({ instruments: configs })
}
