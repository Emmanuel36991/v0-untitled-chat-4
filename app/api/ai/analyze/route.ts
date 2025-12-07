import { callGroqAPI, GROQ_MODEL, GROQ_FALLBACK_MODEL, ANALYZE_SYSTEM_PROMPT } from "@/lib/ai/groq"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { type, data, context } = await request.json()

    console.log("[v0] Analyze request - Type:", type)

    let systemPrompt = ANALYZE_SYSTEM_PROMPT
    let userPrompt = ""

    if (type === "trade") {
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
- Notes: ${data.notes || "None"}

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

Metric: ${data.name}
Value: ${data.value}
Context: ${data.context || "Trading performance analysis"}
${context ? `Additional Context: ${context}` : ""}

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

      const stream = await callGroqAPI([{ role: "user", content: userPrompt }], systemPrompt, GROQ_MODEL)

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } catch (primaryError) {
      console.warn("[v0] Primary model failed, switching to fallback:", GROQ_FALLBACK_MODEL)

      const stream = await callGroqAPI([{ role: "user", content: userPrompt }], systemPrompt, GROQ_FALLBACK_MODEL)

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }
  } catch (error) {
    console.error("[v0] [AI Analysis Error]", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
