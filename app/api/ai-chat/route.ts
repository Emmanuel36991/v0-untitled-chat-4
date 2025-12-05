import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { groq, GROQ_MODEL, GROQ_FALLBACK_MODEL, CHAT_SYSTEM_PROMPT } from "@/lib/ai/groq"

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const messages: UIMessage[] = body.messages || []

    // Initialize Groq client
    const groqClient = groq

    // 1. Fetch User Context (AGGRESSIVELY OPTIMIZED)
    let contextPrompt = ""
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // LIMIT TO 5 TRADES ONLY to save tokens
      const { data: trades, error } = await supabase
        .from("trades")
        .select("outcome, pnl, setup_name")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5)

      if (!error && trades && trades.length > 0) {
        const wins = trades.filter((t) => t.outcome === "win").length

        // Concise summary
        contextPrompt = `
User Stats (Last 5 Trades):
- Win Rate: ${wins}/5
- Recent Results: ${trades.map((t) => `${t.outcome.toUpperCase()}($${t.pnl})`).join(", ")}
`
      } else if (error) {
        console.error("[v0] [AI Chat] Database error fetching trades:", error.message)
        contextPrompt = `User has no recorded trades.`
      } else {
        contextPrompt = `User has no recorded trades.`
      }
    }

    // 2. SIMPLIFICATION: Only use the LAST message
    // This prevents the context from growing too large and crashing the free tier
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage) {
      return new Response("No message provided", { status: 400 })
    }

    // 3. Compact System Prompt
    const systemMessage = {
      role: "system" as const,
      content: `${CHAT_SYSTEM_PROMPT}\n${contextPrompt}\nKeep answer under 3 sentences.`,
    }

    // Only send System Prompt + 1 User Message
    const modelMessages = [systemMessage, ...convertToModelMessages([lastMessage])]

    try {
      // 4. Try Primary Model (70B)
      const result = streamText({
        model: groqClient(GROQ_MODEL),
        messages: modelMessages,
        maxOutputTokens: 600,
        temperature: 0.7,
      })
      return result.toUIMessageStreamResponse()
    } catch (primaryError) {
      // 5. Auto-Fallback to Fast Model (8B) if Primary fails
      console.warn("[v0] Primary model failed, switching to fallback:", GROQ_FALLBACK_MODEL)
      const result = streamText({
        model: groqClient(GROQ_FALLBACK_MODEL),
        messages: modelMessages,
        maxOutputTokens: 600,
        temperature: 0.7,
      })
      return result.toUIMessageStreamResponse()
    }
  } catch (error) {
    console.error("[v0] [AI Chat Error]", error instanceof Error ? error.message : error)
    return new Response(JSON.stringify({ error: "High traffic. Please try again in 1 minute." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}
