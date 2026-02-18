import { callGroqAPI, GROQ_MODEL, GROQ_FALLBACK_MODEL, ANALYZE_SYSTEM_PROMPT } from "@/lib/ai/groq"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sanitizeInput } from "@/lib/security/input-validation"
import { rateLimiter, getRateLimitKeyForUser } from "@/lib/security/rate-limiter"

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

// Per-user limits: moderate usage, prevent abuse (e.g. 5 analyses per 15 min)
const ANALYZE_LIMIT = 5
const ANALYZE_WINDOW_SEC = 15 * 60 // 15 minutes

export async function POST(request: NextRequest) {
  try {
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

    const rateLimitKey = getRateLimitKeyForUser("analyze", user.id)
    const limit = rateLimiter({
      key: rateLimitKey,
      limit: ANALYZE_LIMIT,
      window: ANALYZE_WINDOW_SEC,
    })

    if (!limit.allowed) {
      return new Response(
        JSON.stringify({
          error: `AI analysis limit reached (${ANALYZE_LIMIT} per 15 min). Please try again later.`,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      )
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
      systemPrompt = `You are a supportive, process-focused trading mentor. Your core ethic: what matters most is whether the trader did the right things — risk management, stop loss, R:R, following their strategy, good habits — not whether this single trade won or lost.

Rules:
- Write 2–4 sentences MAX. Punchy and direct.
- Process first: If the trade shows good process (stop in place, reasonable R:R, strategy/setup followed, good habits or psychology noted), lead with that. Affirm that they did things right. A loss with good process is not a failure — outcomes are never 100% in our control. Only call out clear process failures (e.g. no stop, revenge/FOMO in notes, ignoring plan).
- Do NOT imply the trader did something wrong just because the trade lost. One trade is never enough to judge. Never shame or "call out" a single loss when execution was disciplined.
- If the data shows a clear process mistake (no stop, oversized size, obvious psychology in notes), mention it constructively. If they followed their plan and lost, reinforce that repeating this process is what leads to long-term edge.
- End with a short, actionable nudge for the next similar trade. No bullet lists, no generic "Key Strengths / Areas for Improvement" templates.
- Be the insight they'd remember — fair, specific, and respectful of good process.`

      const goodHabits = data.good_habits && (Array.isArray(data.good_habits) ? data.good_habits.join(", ") : data.good_habits)
      const psychology = data.psychology_factors && (Array.isArray(data.psychology_factors) ? data.psychology_factors.join(", ") : data.psychology_factors)
      const rr = data.risk_reward_ratio != null ? data.risk_reward_ratio : "—"
      userPrompt = `Single trade to analyze:

Direction: ${data.direction} | Entry: $${data.entry_price} | Exit: $${data.exit_price} | Stop: ${data.stop_loss != null ? "$" + data.stop_loss : "—"} | TP: ${data.take_profit != null ? "$" + data.take_profit : "—"} | Size: ${data.size}
Outcome: ${data.outcome} | P&L: $${data.pnl} | Duration: ${data.duration_minutes ?? "—"} min | R:R: ${rr}
Setup: ${data.setup_name || "—"}
${goodHabits ? `Good habits noted: ${goodHabits}.` : ""}
${psychology ? `Psychology/context: ${psychology}.` : ""}
Notes: ${sanitizeInput(data.notes || "", { maxLength: 500 })}

Give one focused insight and one actionable nudge. If they used a stop, followed a setup, and had good habits, affirm that first — do not treat a single loss as proof they did something wrong. No preamble, no sections.`
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
