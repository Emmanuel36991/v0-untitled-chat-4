import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/security/rate-limiter"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const rateLimitResult = checkRateLimit(ip, 30, 60000) // 30 requests per minute

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const finnhubKey = process.env.FINNHUB_API_KEY || "demo"

    // Get date range (today + 7 days)
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + 7)

    const fromStr = from.toISOString().split("T")[0]
    const toStr = to.toISOString().split("T")[0]

    console.log("[v0] Fetching economic calendar from", fromStr, "to", toStr)

    const response = await fetch(
      `https://finnhub.io/api/v1/calendar/economic?from=${fromStr}&to=${toStr}&token=${finnhubKey}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (!response.ok) {
      console.error("[v0] Finnhub API error:", response.status)
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Received economic events:", data.economicCalendar?.length || 0)

    // Transform Finnhub data to our format
    const events = (data.economicCalendar || []).map((event: any) => {
      // Determine impact level based on event type
      let impact: "high" | "medium" | "low" = "low"
      const eventName = event.event?.toLowerCase() || ""

      if (
        eventName.includes("interest rate") ||
        eventName.includes("gdp") ||
        eventName.includes("nonfarm") ||
        eventName.includes("cpi") ||
        eventName.includes("unemployment")
      ) {
        impact = "high"
      } else if (
        eventName.includes("retail") ||
        eventName.includes("pmi") ||
        eventName.includes("consumer confidence")
      ) {
        impact = "medium"
      }

      // Determine category
      let category = "other"
      if (eventName.includes("interest rate") || eventName.includes("fomc")) {
        category = "interest-rate"
      } else if (eventName.includes("cpi") || eventName.includes("ppi") || eventName.includes("inflation")) {
        category = "inflation"
      } else if (eventName.includes("employment") || eventName.includes("nonfarm") || eventName.includes("jobless")) {
        category = "employment"
      } else if (eventName.includes("gdp")) {
        category = "gdp"
      } else if (eventName.includes("retail")) {
        category = "retail"
      } else if (eventName.includes("pmi") || eventName.includes("manufacturing")) {
        category = "manufacturing"
      } else if (eventName.includes("housing")) {
        category = "housing"
      }

      return {
        id: `${event.country}-${event.date}-${event.event}`,
        title: event.event || "Economic Event",
        date: new Date(event.date),
        time: event.time || "TBD",
        country: getCountryName(event.country),
        countryCode: event.country,
        category,
        impact,
        description: event.event || "Economic indicator release",
        previous: event.actual ? String(event.actual) : undefined,
        forecast: event.estimate ? String(event.estimate) : undefined,
        actual: event.previous ? String(event.previous) : undefined,
        currency: getCurrencyForCountry(event.country),
      }
    })

    // Sort by date
    events.sort((a: any, b: any) => a.date.getTime() - b.date.getTime())

    return NextResponse.json({ events })
  } catch (error: any) {
    console.error("[v0] Economic calendar API error:", error.message)
    return NextResponse.json({ error: "Failed to fetch economic events", events: [] }, { status: 500 })
  }
}

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    US: "United States",
    EU: "Euro Zone",
    GB: "United Kingdom",
    JP: "Japan",
    CN: "China",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    CA: "Canada",
    AU: "Australia",
    NZ: "New Zealand",
    CH: "Switzerland",
  }
  return countries[code] || code
}

function getCurrencyForCountry(code: string): string {
  const currencies: Record<string, string> = {
    US: "USD",
    EU: "EUR",
    GB: "GBP",
    JP: "JPY",
    CN: "CNY",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    CA: "CAD",
    AU: "AUD",
    NZ: "NZD",
    CH: "CHF",
  }
  return currencies[code] || "USD"
}
