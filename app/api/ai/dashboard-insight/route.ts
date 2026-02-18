import { callGroqAPI, GROQ_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/ai/groq"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimiter, getRateLimitKeyForUser } from "@/lib/security/rate-limiter"

const SYSTEM_PROMPT = `You are a supportive, process-focused trading coach inside a trader's journal. You care more about whether they're doing the right things (risk management, discipline, strategy, good habits) than about single wins or losses.

Your job: look at their recent trades and surface ONE useful observation. It can be a pattern, a strength, or a nudge — but your default tone is respectful and fair. Never shame them for losing a trade. Never imply they're "doing it wrong" based on one or a few losses.

Rules:
- Write 2-3 sentences MAX. Punchy. Direct. Like a text from a mentor who respects them.
- Lead with process when you see it: good stops, consistent R:R, following setups, good habits. Affirm what they're doing right. Only suggest "something might be off" when there is a sustained pattern over many trades (e.g. repeated revenge trades, consistent overtrading after losses, avoiding a market after one bad day).
- Do NOT treat a single loss or a short losing streak as proof they're failing. One trade — or even a bad week — is not enough to judge. If their recent trades show discipline and good habits, say so.
- Sound human. Use contractions. Be conversational and sharp but never cruel or dismissive.
- No bullet points. No headers. No markdown. Just raw insight.
- Don't say "I noticed" — just state it. End with a constructive question or one actionable nudge.
- If the data clearly shows a repeated behavioral pattern over time (e.g. revenge trading, overtrading after losses), mention it constructively — not as an attack. If they're following their plan and still losing lately, remind them that process matters more than short-term outcome.

Examples of good output:
"Your Thursday trades are 3x more profitable than Mondays, but you're taking twice as many trades on Monday. Might be worth seeing if sitting Monday out sharpens your edge the rest of the week."
"You've been sticking to your stops and setups even on the last few losers — that's the right habit. Keep that discipline; the edge shows over many trades, not one."
"If you've had several losses in a row and your next trade keeps coming within minutes of the last exit, slow down. One loss doesn't mean the next setup is revenge — but a pattern of that does."`

const REQUEST_TIMEOUT = 30000

// Per-user limits: moderate usage (e.g. 3 insights per 15 min)
const INSIGHT_LIMIT = 3
const INSIGHT_WINDOW_SEC = 15 * 60 // 15 minutes

export async function POST(request: NextRequest) {
  try {
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

    const rateLimitKey = getRateLimitKeyForUser("dashboard-insight", user.id)
    const limit = rateLimiter({
      key: rateLimitKey,
      limit: INSIGHT_LIMIT,
      window: INSIGHT_WINDOW_SEC,
    })

    if (!limit.allowed) {
      return new Response(
        JSON.stringify({
          error: `AI insight limit reached (${INSIGHT_LIMIT} per 15 min). Try again later.`,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
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

    const userPrompt = `Here are this trader's last ${Math.min(trades.length, 20)} trades:\n\n${tradesContext}\n\nGive one focused observation: a strength (e.g. good process, stops, habits), a pattern worth noting, or a constructive nudge. Be specific and human. Do NOT treat losses alone as proof they're doing something wrong — only point out issues when there's a clear repeated pattern over time.`

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
