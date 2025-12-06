import { streamText } from "ai"
import { groq, GROQ_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/ai/groq"
import { TRADING_SYSTEM_PROMPTS } from "@/lib/ai/trading-prompts"

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    // 1. Prepare system prompt
    let systemPrompt = TRADING_SYSTEM_PROMPTS.base
    if (context) {
      systemPrompt += `\n\nCURRENT USER CONTEXT:\n${context}`
    }

    try {
      // 2. Call Primary Model
      const result = streamText({
        model: groq(GROQ_MODEL),
        messages,
        system: systemPrompt,
        temperature: 0.7,
        maxTokens: 1000,
      })
      
      return result.toTextStreamResponse()
    } catch (primaryError) {
      console.warn("Primary Groq model failed, switching to fallback")
      
      // 3. Call Fallback Model
      const result = streamText({
        model: groq(GROQ_FALLBACK_MODEL),
        messages,
        system: systemPrompt,
        temperature: 0.7,
        maxTokens: 1000,
      })
      
      return result.toTextStreamResponse()
    }
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat" }), { 
      status: 500 
    })
  }
}
