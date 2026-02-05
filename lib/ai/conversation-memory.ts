import { createClient } from "@/lib/supabase/server"

// ==========================================
// TYPES
// ==========================================

export interface ConversationMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
  sentiment?: string
  topics?: string[]
}

export interface ConversationSession {
  id: string
  userId: string
  startedAt: string
  lastMessageAt: string
  messageCount: number
  topics: string[]
  emotionalTone: string
  summary?: string
}

export interface ConversationMemory {
  recentMessages: ConversationMessage[]
  sessions: ConversationSession[]
  frequentTopics: Array<{ topic: string; count: number }>
  userPreferences: UserChatPreferences
  insights: ConversationInsight[]
}

export interface UserChatPreferences {
  preferredDetailLevel: "concise" | "detailed" | "comprehensive"
  preferredTone: "formal" | "casual" | "mentor"
  frequentQuestions: string[]
  helpfulResponses: string[]
  learningStyle: "visual" | "analytical" | "practical"
}

export interface ConversationInsight {
  type: "recurring_question" | "knowledge_gap" | "progress" | "concern"
  description: string
  firstDetected: string
  occurrences: number
}

// ==========================================
// STORAGE FUNCTIONS
// ==========================================

export async function saveConversationMessage(
  message: Omit<ConversationMessage, "timestamp">,
  sessionId?: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  "use server"
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const timestamp = new Date().toISOString()
    
    // Get or create session
    let currentSessionId = sessionId
    if (!currentSessionId) {
      // Check for recent session (within last 30 minutes)
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      
      const { data: recentSession } = await supabase
        .from("ai_conversation_sessions")
        .select("id")
        .eq("user_id", user.id)
        .gte("last_message_at", thirtyMinsAgo)
        .order("last_message_at", { ascending: false })
        .limit(1)
        .single()
      
      if (recentSession) {
        currentSessionId = recentSession.id
      } else {
        // Create new session
        const { data: newSession, error: sessionError } = await supabase
          .from("ai_conversation_sessions")
          .insert({
            user_id: user.id,
            started_at: timestamp,
            last_message_at: timestamp,
            message_count: 0,
            topics: [],
            emotional_tone: "neutral"
          })
          .select("id")
          .single()
        
        if (sessionError) {
          console.error("Error creating session:", sessionError)
          // Continue without session tracking
        } else {
          currentSessionId = newSession.id
        }
      }
    }

    // Save the message
    const { error: messageError } = await supabase
      .from("ai_conversation_messages")
      .insert({
        user_id: user.id,
        session_id: currentSessionId,
        role: message.role,
        content: message.content,
        sentiment: message.sentiment,
        topics: message.topics || [],
        created_at: timestamp
      })

    if (messageError) {
      console.error("Error saving message:", messageError)
      return { success: false, error: messageError.message }
    }

    // Update session
    if (currentSessionId) {
      await supabase
        .from("ai_conversation_sessions")
        .update({
          last_message_at: timestamp,
          message_count: supabase.rpc("increment_message_count", { session_id: currentSessionId })
        })
        .eq("id", currentSessionId)
    }

    return { success: true, sessionId: currentSessionId }
  } catch (error: any) {
    console.error("Exception in saveConversationMessage:", error)
    return { success: false, error: error.message }
  }
}

export async function getConversationHistory(limit: number = 20): Promise<ConversationMessage[]> {
  "use server"
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    const { data, error } = await supabase
      .from("ai_conversation_messages")
      .select("role, content, created_at, sentiment, topics")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching conversation history:", error)
      return []
    }

    return (data || []).reverse().map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      sentiment: msg.sentiment,
      topics: msg.topics
    }))
  } catch (error) {
    console.error("Exception in getConversationHistory:", error)
    return []
  }
}

export async function getConversationMemory(): Promise<ConversationMemory> {
  "use server"
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return getEmptyMemory()
    }

    // Fetch recent messages
    const recentMessages = await getConversationHistory(50)

    // Fetch recent sessions
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: sessionsData } = await supabase
      .from("ai_conversation_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("started_at", thirtyDaysAgo)
      .order("started_at", { ascending: false })
      .limit(20)

    const sessions: ConversationSession[] = (sessionsData || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      startedAt: s.started_at,
      lastMessageAt: s.last_message_at,
      messageCount: s.message_count,
      topics: s.topics || [],
      emotionalTone: s.emotional_tone || "neutral",
      summary: s.summary
    }))

    // Analyze frequent topics
    const topicCounts = new Map<string, number>()
    recentMessages.forEach(msg => {
      (msg.topics || []).forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
      })
    })
    
    const frequentTopics = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get user preferences (from user_chat_preferences table or infer from history)
    const userPreferences = await getUserChatPreferences(supabase, user.id, recentMessages)

    // Generate insights from conversation patterns
    const insights = generateConversationInsights(recentMessages, sessions)

    return {
      recentMessages,
      sessions,
      frequentTopics,
      userPreferences,
      insights
    }
  } catch (error) {
    console.error("Exception in getConversationMemory:", error)
    return getEmptyMemory()
  }
}

async function getUserChatPreferences(
  supabase: any, 
  userId: string,
  messages: ConversationMessage[]
): Promise<UserChatPreferences> {
  // Try to fetch stored preferences
  const { data: stored } = await supabase
    .from("user_chat_preferences")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (stored) {
    return {
      preferredDetailLevel: stored.preferred_detail_level || "detailed",
      preferredTone: stored.preferred_tone || "mentor",
      frequentQuestions: stored.frequent_questions || [],
      helpfulResponses: stored.helpful_responses || [],
      learningStyle: stored.learning_style || "analytical"
    }
  }

  // Infer from message patterns
  const userMessages = messages.filter(m => m.role === "user")
  
  // Analyze message length to infer detail preference
  const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / Math.max(1, userMessages.length)
  let preferredDetailLevel: UserChatPreferences["preferredDetailLevel"] = "detailed"
  if (avgLength < 50) preferredDetailLevel = "concise"
  else if (avgLength > 200) preferredDetailLevel = "comprehensive"

  // Extract questions
  const frequentQuestions = userMessages
    .map(m => m.content)
    .filter(c => c.includes("?"))
    .slice(0, 5)

  return {
    preferredDetailLevel,
    preferredTone: "mentor",
    frequentQuestions,
    helpfulResponses: [],
    learningStyle: "analytical"
  }
}

function generateConversationInsights(
  messages: ConversationMessage[],
  sessions: ConversationSession[]
): ConversationInsight[] {
  const insights: ConversationInsight[] = []
  const userMessages = messages.filter(m => m.role === "user")

  // Detect recurring questions
  const questionPatterns = new Map<string, { count: number; firstSeen: string }>()
  
  const questionKeywords = [
    "how do i", "what is", "why does", "when should", "can you explain",
    "help me", "don't understand", "confused about"
  ]
  
  userMessages.forEach(msg => {
    const lower = msg.content.toLowerCase()
    for (const keyword of questionKeywords) {
      if (lower.includes(keyword)) {
        const existing = questionPatterns.get(keyword)
        if (existing) {
          existing.count++
        } else {
          questionPatterns.set(keyword, { count: 1, firstSeen: msg.timestamp })
        }
      }
    }
  })

  // Add recurring question insights
  for (const [pattern, data] of questionPatterns.entries()) {
    if (data.count >= 2) {
      insights.push({
        type: "recurring_question",
        description: `User frequently asks "${pattern}" questions (${data.count} times)`,
        firstDetected: data.firstSeen,
        occurrences: data.count
      })
    }
  }

  // Detect knowledge gaps from confusion signals
  const confusionSignals = userMessages.filter(m => 
    m.content.toLowerCase().includes("don't understand") ||
    m.content.toLowerCase().includes("confused") ||
    m.content.toLowerCase().includes("makes no sense")
  )
  
  if (confusionSignals.length >= 2) {
    insights.push({
      type: "knowledge_gap",
      description: "User shows recurring confusion - may benefit from foundational explanations",
      firstDetected: confusionSignals[0].timestamp,
      occurrences: confusionSignals.length
    })
  }

  // Detect progress indicators
  const progressSignals = userMessages.filter(m =>
    m.content.toLowerCase().includes("finally") ||
    m.content.toLowerCase().includes("makes sense now") ||
    m.content.toLowerCase().includes("got it") ||
    m.content.toLowerCase().includes("understand now")
  )
  
  if (progressSignals.length > 0) {
    insights.push({
      type: "progress",
      description: `User has shown ${progressSignals.length} breakthrough moment(s)`,
      firstDetected: progressSignals[0].timestamp,
      occurrences: progressSignals.length
    })
  }

  return insights.slice(0, 5) // Limit to top 5 insights
}

function getEmptyMemory(): ConversationMemory {
  return {
    recentMessages: [],
    sessions: [],
    frequentTopics: [],
    userPreferences: {
      preferredDetailLevel: "detailed",
      preferredTone: "mentor",
      frequentQuestions: [],
      helpfulResponses: [],
      learningStyle: "analytical"
    },
    insights: []
  }
}

// ==========================================
// CONTEXT SUMMARIZATION
// ==========================================

export function summarizeConversationContext(memory: ConversationMemory): string {
  const lines: string[] = []
  
  // Recent conversation summary
  if (memory.recentMessages.length > 0) {
    const recentCount = Math.min(5, memory.recentMessages.length)
    lines.push(`=== RECENT CONVERSATION (Last ${recentCount} exchanges) ===`)
    
    memory.recentMessages.slice(-recentCount * 2).forEach(msg => {
      const prefix = msg.role === "user" ? "User" : "Assistant"
      const preview = msg.content.length > 100 
        ? msg.content.substring(0, 100) + "..."
        : msg.content
      lines.push(`${prefix}: ${preview}`)
    })
  }
  
  // User preferences
  lines.push("")
  lines.push("=== USER PREFERENCES ===")
  lines.push(`Detail Level: ${memory.userPreferences.preferredDetailLevel}`)
  lines.push(`Tone: ${memory.userPreferences.preferredTone}`)
  lines.push(`Learning Style: ${memory.userPreferences.learningStyle}`)
  
  // Frequent topics
  if (memory.frequentTopics.length > 0) {
    lines.push("")
    lines.push("=== FREQUENTLY DISCUSSED TOPICS ===")
    memory.frequentTopics.slice(0, 5).forEach(t => {
      lines.push(`- ${t.topic} (${t.count} times)`)
    })
  }
  
  // Insights
  if (memory.insights.length > 0) {
    lines.push("")
    lines.push("=== CONVERSATION INSIGHTS ===")
    memory.insights.forEach(i => {
      lines.push(`[${i.type}] ${i.description}`)
    })
  }
  
  return lines.join("\n")
}

// ==========================================
// TOPIC EXTRACTION
// ==========================================

export function extractTopics(message: string): string[] {
  const topics: string[] = []
  const lower = message.toLowerCase()
  
  const topicPatterns: Record<string, string[]> = {
    "risk_management": ["stop loss", "risk", "position size", "risk reward", "r:r", "drawdown"],
    "psychology": ["emotion", "revenge", "fomo", "fear", "greed", "discipline", "tilt", "mental"],
    "strategy": ["setup", "entry", "exit", "strategy", "system", "edge", "backtest"],
    "analysis": ["chart", "technical", "indicator", "price action", "support", "resistance"],
    "performance": ["win rate", "profit", "loss", "pnl", "performance", "results"],
    "market_structure": ["smc", "ict", "wyckoff", "order block", "fvg", "liquidity"],
    "journaling": ["journal", "review", "reflection", "log", "note"]
  }
  
  for (const [topic, keywords] of Object.entries(topicPatterns)) {
    if (keywords.some(kw => lower.includes(kw))) {
      topics.push(topic)
    }
  }
  
  return topics
}
