import { callGroqAPI, GROQ_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/ai/groq"
import { TRADING_SYSTEM_PROMPTS } from "@/lib/ai/trading-prompts"

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    // Prepare system prompt with context
    let systemPrompt = TRADING_SYSTEM_PROMPTS.base
    if (context) {
      systemPrompt += `\n\nCURRENT USER CONTEXT:\n${context}`
    }

    try {
      // Call primary Groq model
      const stream = await callGroqAPI(messages, systemPrompt, GROQ_MODEL)
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } catch (primaryError) {
      console.warn("[v0] Primary Groq model failed, switching to fallback")

      // Fallback to faster model
      try {
        const stream = await callGroqAPI(messages, systemPrompt, GROQ_FALLBACK_MODEL)
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        })
      } catch (fallbackError) {
        console.error("[v0] Both models failed:", fallbackError)
        return new Response(JSON.stringify({ error: "Chat service unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      }
    }
  } catch (error) {
    console.error("[v0] Chat API Error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
