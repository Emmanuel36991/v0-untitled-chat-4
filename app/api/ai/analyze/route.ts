import { callGroqAPI, GROQ_MODEL, GROQ_FALLBACK_MODEL, ANALYZE_SYSTEM_PROMPT } from "@/lib/ai/groq"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sanitizeInput } from "@/lib/security/input-validation"
import { rateLimiter, getRateLimitKey } from "@/lib/security/rate-limiter"

// Helper to format stats for the prompt
function formatPeriodStats(period: string, stats: any) {
  if (!stats) return `**${period}**: No data available`

  const pnl = stats.totalPnl ?? stats.pnl ?? 0
  const winRate = stats.winRate ?? 0
  const trades = stats.totalTrades ?? stats.trades ?? 0
  const profitFactor = stats.profitFactor ?? 0
  const drawdown = stats.maxDrawdown ?? 0

  return `**${period} Performance**
- P&L: $${Number(pnl).toFixed(2)}
- Win Rate: ${Number(winRate).toFixed(1)}%
- Trades: ${Number(trades)}
- Profit Factor: ${Number(profitFactor).toFixed(2)}
- Max Drawdown: $${Number(drawdown).toFixed(2)}`
}

const REQUEST_TIMEOUT = 45000 // 45 seconds for analysis

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey("analyze")
    const limit = rateLimiter({
      key: rateLimitKey,
      limit: 10,
      window: 60, // 10 requests per minute per IP
    })

    if (!limit.allowed) {
      return new Response(JSON.stringify({ error: "Analysis rate limit exceeded. Please try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized. Please log in to use AI analysis." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { type, data, context } = await request.json()

    console.log("[v0] Analyze request - Type:", type, "Data:", !!data)

    let systemPrompt = ANALYZE_SYSTEM_PROMPT
    let userPrompt = ""

    if (type === "summary") {
      systemPrompt =
        "You are a strategic trading performance analyst. Analyze the trader's performance across Daily, Weekly, Monthly, and Yearly timeframes. Identify trends, consistency, and alignment with long-term goals. Provide a strategic executive summary."

      userPrompt = `Analyze this multi-timeframe trading performance summary:

${formatPeriodStats("Daily", data.daily)}

${formatPeriodStats("Weekly", data.weekly)}

${formatPeriodStats("Monthly", data.monthly)}

${formatPeriodStats("Yearly", data.yearly)}

${context ? `Additional Context: ${sanitizeInput(context, { maxLength: 1000 })}` : ""}

Please provide:
1. **Executive Summary** - A holistic view of performance.
2. **Trend Analysis** - How performance is evolving from short to long term.
3. **Consistency Check** - Assessment of performance stability.
4. **Risk Assessment** - Evaluation of drawdowns and profit factors.
5. **Strategic Recommendations** - 2-3 specific actions to improve or maintain performance.

Be data-driven and concise.`
    } else if (type === "trade") {
      systemPrompt =
        "You are an expert trading advisor powered by Groq's Llama 3.3. Analyze trades thoroughly with deep knowledge of technical analysis, risk management, and trading psychology. Provide actionable insights. Be specific and reference the trade metrics provided."

      userPrompt = `Analyze this trade and provide insights:

Trade Details:
- Direction: ${data.direction}
- Entry Price: $${data.entry_price}
- Exit Price: $${data.exit_price}
- Stop Loss: $${data.stop_loss}
- Take Profit: ${data.take_profit || "Not Set"}
- Size: ${data.size}
- Outcome: ${data.outcome}
- P&L: $${data.pnl}
- Duration: ${data.duration_minutes || "N/A"} minutes
- Setup: ${data.setup_name || "Not specified"}
- Notes: ${sanitizeInput(data.notes || "", { maxLength: 1000 })}

Please provide:
1. **Trade Analysis** - Why this trade worked or failed
2. **Key Strengths** - What was done right
3. **Areas for Improvement** - What could be better
4. **Educational Insights** - Lessons from this trade
5. **Recommendations** - Actionable steps for similar trades

Be specific, educational, and practical.`
    } else if (type === "statistic") {
      systemPrompt =
        "You are a trading performance advisor powered by Groq's Llama 3.3. Explain trading metrics clearly and provide actionable recommendations to improve trading performance."

      userPrompt = `Analyze this trading metric:

Metric: ${sanitizeInput(data.name, { maxLength: 100 })}
Value: ${data.value}
Context: ${sanitizeInput(data.context || "Trading performance analysis", { maxLength: 500 })}
${context ? `Additional Context: ${sanitizeInput(context, { maxLength: 1000 })}` : ""}

Please provide:
1. **What This Metric Means** - Clear explanation
2. **Performance Assessment** - Is this good, neutral, or needs work?
3. **Industry Benchmarks** - Typical ranges for comparison
4. **Why It Matters** - Impact on overall trading success
5. **Actionable Improvements** - Specific ways to improve this metric
6. **Related Metrics** - Other metrics that influence this one

Be clear, educational, and provide practical trading wisdom.`
    }

    if (!userPrompt) {
      return new Response(JSON.stringify({ error: "Invalid analysis type" }), { status: 400 })
    }

    try {
      console.log("[v0] Streaming analysis with model:", GROQ_MODEL)

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT),
      )

      const groqPromise = callGroqAPI([{ role: "user", content: userPrompt }], systemPrompt, GROQ_MODEL)
      const stream = await Promise.race([groqPromise, timeoutPromise])

      return new Response(stream as any, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } catch (primaryError) {
      console.error("[v0] Primary model error:", primaryError)
      console.warn("[v0] Primary model failed, switching to fallback:", GROQ_FALLBACK_MODEL)

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT),
      )

      const groqPromise = callGroqAPI([{ role: "user", content: userPrompt }], systemPrompt, GROQ_FALLBACK_MODEL)
      const stream = await Promise.race([groqPromise, timeoutPromise])

      return new Response(stream as any, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }
  } catch (error) {
    console.error("[v0] [AI Analysis Error]:", error)
    return new Response(JSON.stringify({ error: "Failed to process analysis request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
