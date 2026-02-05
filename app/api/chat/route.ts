import { callGroqAPI, GROQ_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/ai/groq"
import { ENHANCED_TRADING_PROMPTS, buildDynamicSystemPrompt } from "@/lib/ai/enhanced-prompts"
import { buildEnhancedContext } from "@/lib/ai/enhanced-context-builder"
import { analyzeSentiment, getSentimentResponseModifier } from "@/lib/ai/sentiment-analyzer"
import { getConversationMemory, summarizeConversationContext, saveConversationMessage, extractTopics } from "@/lib/ai/conversation-memory"
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

    const { messages, context: pageContext, page } = await req.json()

    console.log("[v0] Chat request received, messages:", messages?.length, "page:", page)

    const sanitizedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: sanitizeInput(msg.content, { maxLength: 5000 }),
    }))

    // Get the latest user message for sentiment analysis
    const latestUserMessage = sanitizedMessages.filter((m: any) => m.role === "user").pop()
    
    // Analyze sentiment of user's message
    let sentimentResult = null
    try {
      sentimentResult = latestUserMessage 
        ? analyzeSentiment(latestUserMessage.content)
        : null
    } catch (sentimentError) {
      console.error("[v0] Sentiment analysis error:", sentimentError)
    }

    // Build enhanced context with all user data (trades, psychology, strategies)
    let enhancedContext
    let conversationMemory
    
    try {
      [enhancedContext, conversationMemory] = await Promise.all([
        buildEnhancedContext(),
        getConversationMemory()
      ])
    } catch (contextError) {
      console.error("[v0] Context building error:", contextError)
      // Fall back to minimal context
      enhancedContext = {
        tradingContext: {
          performance: { totalTrades: 0, winRate: 0, totalPnl: 0, avgPnlPerTrade: 0, profitFactor: 0, maxDrawdown: 0, sharpeRatio: 0 },
          patterns: { bestSetups: [], worstSetups: [], instrumentPerformance: [], timePatterns: [] },
          riskMetrics: { stopLossUsage: 0, avgRiskPerTrade: 0, riskRewardRatio: 0, maxConsecutiveLosses: 0, riskScore: 0 },
          recentTrends: { last10Trades: { winRate: 0, totalPnl: 0, trend: "stable" }, last30Days: { winRate: 0, totalPnl: 0, tradeFrequency: 0 } },
          strengths: [],
          weaknesses: [],
          recommendations: [],
        },
        emotionalState: { currentMood: "neutral", recentMoods: [], stressLevel: "low", emotionalTrend: "stable", riskOfTilt: 0, lastJournalDate: null },
        psychologyAnalysis: { allFactors: [], positiveFactors: [], negativeFactors: [], topKillers: [], topEnablers: [], goodHabits: [], badHabits: [], insights: [] },
        behavioralPatterns: [],
        userProfile: { tradingStyle: "Day Trading", preferredInstruments: [], preferredSessions: [], riskTolerance: "moderate", experienceLevel: "beginner", strengths: [], areasForImprovement: [], goals: [] },
        strategies: { total: 0, topPerforming: [], recentlyUsed: [] },
        recentActivity: { lastTradeDate: null, tradesThisWeek: 0, tradesThisMonth: 0, currentStreak: { type: "none", count: 0 }, daysSinceLastTrade: -1 },
        alerts: [],
        contextSummary: "",
      }
      conversationMemory = {
        recentMessages: [],
        sessions: [],
        frequentTopics: [],
        userPreferences: { preferredDetailLevel: "detailed", preferredTone: "mentor", frequentQuestions: [], helpfulResponses: [], learningStyle: "analytical" },
        insights: []
      }
    }

    // Build dynamic system prompt based on all context
    let systemPrompt
    try {
      systemPrompt = buildDynamicSystemPrompt({
        enhancedContext,
        conversationMemory,
        sentimentResult,
        pageContext: pageContext ? sanitizeInput(pageContext, { maxLength: 1000 }) : undefined,
        currentPage: page
      })
    } catch (promptError) {
      console.error("[v0] Prompt building error:", promptError)
      // Fall back to basic prompt
      systemPrompt = `You are TradeGPT, an expert AI trading coach and mentor. Help the user with their trading questions.`
    }

    console.log("[v0] Enhanced context built - Trades:", enhancedContext?.tradingContext?.performance?.totalTrades || 0)
    console.log("[v0] Sentiment:", sentimentResult?.sentiment, "Urgency:", sentimentResult?.urgency)

    // Save user message to conversation history (async, don't await)
    if (latestUserMessage) {
      const topics = extractTopics(latestUserMessage.content)
      saveConversationMessage({
        role: "user",
        content: latestUserMessage.content,
        sentiment: sentimentResult?.sentiment,
        topics
      }).catch(err => console.error("[v0] Error saving user message:", err))
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
