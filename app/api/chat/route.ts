import { callGroqAPI, GROQ_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/ai/groq"
import { TRADING_SYSTEM_PROMPTS } from "@/lib/ai/trading-prompts"
import { createClient } from "@/lib/supabase/server"
import { sanitizeInput } from "@/lib/security/input-validation"
import { rateLimiter, getRateLimitKey } from "@/lib/security/rate-limiter"

const REQUEST_TIMEOUT = 30000 // 30 seconds

export async function POST(req: Request) {
  try {
    const rateLimitKey = getRateLimitKey("chat")
    const limit = rateLimiter({
      key: rateLimitKey,
      limit: 20,
      window: 60, // 20 requests per minute per IP
    })

    if (!limit.allowed) {
      return new Response(JSON.stringify({ error: "Chat rate limit exceeded. Please try again later." }), {
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
      return new Response(JSON.stringify({ error: "Unauthorized. Please log in to use AI chat." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { messages, context } = await req.json()

    console.log("[v0] Chat request received, messages:", messages?.length)

    const sanitizedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: sanitizeInput(msg.content, { maxLength: 5000 }),
    }))

    let systemPrompt = TRADING_SYSTEM_PROMPTS.TRADING_MENTOR
    if (context) {
      systemPrompt += `\n\nCURRENT USER CONTEXT:\n${sanitizeInput(context, { maxLength: 1000 })}`
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT),
      )

      const groqPromise = callGroqAPI(sanitizedMessages, systemPrompt, GROQ_MODEL)
      const stream = await Promise.race([groqPromise, timeoutPromise])

      return new Response(stream as any, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } catch (primaryError) {
      console.error("[v0] Primary Groq model error:", primaryError)
      console.warn("[v0] Primary Groq model failed, switching to fallback")

      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT),
        )

        const groqPromise = callGroqAPI(sanitizedMessages, systemPrompt, GROQ_FALLBACK_MODEL)
        const stream = await Promise.race([groqPromise, timeoutPromise])

        return new Response(stream as any, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        })
      } catch (fallbackError) {
        console.error("[v0] Fallback model error:", fallbackError)
        console.error("[v0] Both models failed")
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
