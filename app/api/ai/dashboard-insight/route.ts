import { callGroqAPI, GROQ_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/ai/groq"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimiter, getRateLimitKey } from "@/lib/security/rate-limiter"

const SYSTEM_PROMPT = `You are a brutally perceptive trading psychologist embedded inside a trader's journal. You speak like a sharp, concise mentor — not a corporate AI. You notice what the trader doesn't.

Your job: look at their recent trades and surface ONE hidden behavioral pattern. Not obvious stuff like "your win rate is low." Find the thing they'd never notice themselves.

Rules:
- Write 2-3 sentences MAX. Punchy. Direct. Like a text from a mentor who knows you.
- Start with a specific observation, not a greeting.
- Reference specific times, days, instruments, or behaviors from the data.
- Sound human. Use contractions. Be conversational but sharp.
- No bullet points. No headers. No markdown formatting. Just raw insight.
- Don't say "I noticed" — just state it.
- End with a provocative question or a single actionable nudge.
- If the data shows a psychological pattern (revenge trading, hesitation, overtrading after wins), call it out directly.
- Never be generic. Never be encouraging just to be nice. Be the insight they need to hear.

Examples of good output:
"Your Thursday trades are 3x more profitable than Mondays, but you take twice as many trades on Monday. You're grinding hardest on your worst day. What if you sat Monday out entirely?"
"Every time you hit a loss over $200, your next trade comes within 4 minutes. That's not a setup — that's a reflex. The market doesn't owe you a recovery."
"You've been avoiding ES since that -$800 day two weeks ago and only trading NQ. Your NQ win rate is 38%. Your ES win rate was 61%. You're letting one bad day keep you away from your edge."`

const REQUEST_TIMEOUT = 30000

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey("dashboard-insight")
    const limit = rateLimiter({
      key: rateLimitKey,
      limit: 5,
      window: 60,
    })

    if (!limit.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const { trades } = await request.json()

    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return new Response(
        JSON.stringify({ error: "No trade data provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const tradesContext = trades
      .slice(0, 20)
      .map((t: any, i: number) => {
        const parts = [
          `Trade ${i + 1}:`,
          `Date: ${t.date}`,
          `Instrument: ${t.instrument || "unknown"}`,
          `Direction: ${t.direction}`,
          `P&L: $${Number(t.pnl).toFixed(2)}`,
          `Outcome: ${t.outcome}`,
          t.entry_price ? `Entry: $${t.entry_price}` : null,
          t.exit_price ? `Exit: $${t.exit_price}` : null,
          t.stop_loss ? `Stop: $${t.stop_loss}` : null,
          t.duration_minutes ? `Duration: ${t.duration_minutes}min` : null,
          t.setup_name ? `Setup: ${t.setup_name}` : null,
          t.psychology_factors?.length
            ? `Psychology: ${t.psychology_factors.join(", ")}`
            : null,
          t.good_habits?.length
            ? `Good habits: ${t.good_habits.join(", ")}`
            : null,
          t.notes ? `Notes: ${t.notes.slice(0, 100)}` : null,
        ]
        return parts.filter(Boolean).join(" | ")
      })
      .join("\n")

    const userPrompt = `Here are this trader's last ${Math.min(trades.length, 20)} trades:\n\n${tradesContext}\n\nFind the one hidden pattern they're missing. Be specific. Be human.`

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT)
      )

      const groqPromise = callGroqAPI(
        [{ role: "user", content: userPrompt }],
        SYSTEM_PROMPT,
        GROQ_MODEL
      )
      const stream = (await Promise.race([groqPromise, timeoutPromise])) as ReadableStream<Uint8Array>

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } catch {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT)
      )

      const groqPromise = callGroqAPI(
        [{ role: "user", content: userPrompt }],
        SYSTEM_PROMPT,
        GROQ_FALLBACK_MODEL
      )
      const stream = (await Promise.race([groqPromise, timeoutPromise])) as ReadableStream<Uint8Array>

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }
  } catch (error) {
    console.error("[AI Dashboard Insight Error]:", error)
    return new Response(
      JSON.stringify({ error: "Failed to generate insight" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
