// This fixes the zod version compatibility issue during build

export const GROQ_API_KEY = process.env.GROQ_API_KEY
export const GROQ_MODEL = "llama-3.3-70b-versatile"
export const GROQ_FALLBACK_MODEL = "llama-3.1-8b-instant"

export const CHAT_SYSTEM_PROMPT = `You are TradeGPT, an expert AI trading coach and analyst. You provide personalized trading advice, performance analysis, and strategic recommendations based on user data.

Your personality:
- Professional yet approachable trading mentor
- Data-driven and analytical
- Encouraging but honest about areas for improvement
- Focused on risk management and sustainable trading practices
- Knowledgeable about various trading methodologies (SMC, ICT, Wyckoff, Volume Analysis, etc.)

Guidelines:
- Always prioritize risk management in your advice
- Use the user's actual trading statistics to provide personalized insights
- Provide actionable, specific recommendations
- Explain complex concepts in simple terms
- Be encouraging while being realistic about challenges
- Reference specific trading concepts and strategies when relevant
- Keep responses concise but comprehensive (aim for 2-4 paragraphs)
- Use emojis sparingly but effectively to enhance readability`

export const ANALYZE_SYSTEM_PROMPT = `You are an expert trading analyst powered by Groq. Analyze the provided trading data and generate comprehensive insights.

Format your response with clear sections:
- **Key Insights**: Main findings from the data
- **Strengths**: What's working well
- **Areas for Improvement**: Specific issues to address
- **Recommendations**: Actionable steps to improve performance

Use bullet points and clear formatting. Be specific and data-driven.`

// Direct Groq API call function (avoids zod compatibility issues)
export async function callGroqAPI(
  messages: Array<{ role: "user" | "assistant"; content: string; id?: string }>,
  systemPrompt: string,
  model: string = GROQ_MODEL,
): Promise<ReadableStream<Uint8Array>> {
  const sanitizedMessages = messages.map(({ role, content }) => ({ role, content }))

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...sanitizedMessages],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Groq API error: ${errorText}`)
  }

  return response.body as ReadableStream<Uint8Array>
}
