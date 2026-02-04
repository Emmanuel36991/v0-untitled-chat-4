/**
 * Sentiment Analyzer Module
 * Analyzes user messages for emotional cues and provides context-aware responses
 */

// ==========================================
// TYPES
// ==========================================

export interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral" | "mixed"
  confidence: number // 0-1
  emotions: EmotionDetection[]
  urgency: "low" | "medium" | "high"
  needsSupport: boolean
  suggestedTone: "encouraging" | "empathetic" | "analytical" | "cautionary" | "celebratory"
  contextualFlags: ContextualFlag[]
}

export interface EmotionDetection {
  emotion: string
  intensity: "low" | "medium" | "high"
  indicators: string[]
}

export interface ContextualFlag {
  flag: string
  description: string
  responseGuidance: string
}

// ==========================================
// EMOTION PATTERNS
// ==========================================

const EMOTION_PATTERNS: Record<string, {
  keywords: string[]
  phrases: string[]
  intensity: "low" | "medium" | "high"
}> = {
  frustration: {
    keywords: ["frustrated", "angry", "annoyed", "hate", "stupid", "useless", "impossible", "sick of", "fed up"],
    phrases: ["can't win", "keeps happening", "every time", "nothing works", "what's wrong", "don't understand"],
    intensity: "high"
  },
  anxiety: {
    keywords: ["worried", "scared", "nervous", "afraid", "anxious", "uncertain", "doubt", "fear"],
    phrases: ["what if", "should i", "is it safe", "am i doing", "losing money", "can't afford", "worried about"],
    intensity: "medium"
  },
  excitement: {
    keywords: ["excited", "amazing", "awesome", "great", "fantastic", "incredible", "wow", "yes"],
    phrases: ["can't believe", "so happy", "finally", "it worked", "nailed it", "crushing it"],
    intensity: "medium"
  },
  confidence: {
    keywords: ["confident", "sure", "certain", "know", "believe", "ready", "prepared"],
    phrases: ["i know", "i'm sure", "definitely", "no doubt", "i've got this"],
    intensity: "low"
  },
  despair: {
    keywords: ["hopeless", "devastated", "destroyed", "ruined", "blown", "wiped", "quit", "give up"],
    phrases: ["blew my account", "lost everything", "should quit", "can't do this", "what's the point", "no hope"],
    intensity: "high"
  },
  confusion: {
    keywords: ["confused", "lost", "unclear", "don't get", "makes no sense", "help"],
    phrases: ["i don't understand", "what does", "how do i", "can you explain", "why is"],
    intensity: "low"
  },
  pride: {
    keywords: ["proud", "accomplished", "achieved", "milestone", "breakthrough", "progress"],
    phrases: ["first time", "finally did", "managed to", "i did it", "reached my"],
    intensity: "medium"
  },
  regret: {
    keywords: ["regret", "mistake", "shouldn't have", "wish", "if only", "wrong"],
    phrases: ["should have", "could have", "why did i", "i knew", "ignored my"],
    intensity: "medium"
  }
}

// Trading-specific emotional indicators
const TRADING_EMOTIONAL_INDICATORS = {
  revenge_trading: {
    patterns: ["need to make it back", "one more trade", "double down", "get it back", "revenge"],
    risk: "high",
    response: "empathetic"
  },
  fomo: {
    patterns: ["missed the move", "should have entered", "too late", "left money", "everyone else"],
    risk: "medium",
    response: "analytical"
  },
  overconfidence: {
    patterns: ["can't lose", "easy money", "guaranteed", "free money", "sure thing"],
    risk: "medium",
    response: "cautionary"
  },
  tilt: {
    patterns: ["keep losing", "nothing works", "market is rigged", "manipulation", "they're hunting stops"],
    risk: "high",
    response: "empathetic"
  },
  breakthrough: {
    patterns: ["finally clicked", "makes sense now", "seeing clearly", "understood", "got it"],
    risk: "low",
    response: "encouraging"
  }
}

// ==========================================
// MAIN ANALYSIS FUNCTION
// ==========================================

export function analyzeSentiment(message: string): SentimentResult {
  const lowerMessage = message.toLowerCase()
  const words = lowerMessage.split(/\s+/)
  
  // Detect emotions
  const emotions = detectEmotions(lowerMessage, words)
  
  // Detect contextual flags
  const contextualFlags = detectContextualFlags(lowerMessage)
  
  // Calculate overall sentiment
  const sentiment = calculateOverallSentiment(emotions)
  
  // Calculate confidence based on indicator count
  const indicatorCount = emotions.reduce((sum, e) => sum + e.indicators.length, 0) + contextualFlags.length
  const confidence = Math.min(0.95, 0.3 + (indicatorCount * 0.1))
  
  // Determine urgency
  const urgency = determineUrgency(emotions, contextualFlags)
  
  // Check if user needs emotional support
  const needsSupport = emotions.some(e => 
    ["frustration", "despair", "anxiety"].includes(e.emotion) && e.intensity !== "low"
  ) || contextualFlags.some(f => f.flag === "tilt" || f.flag === "revenge_trading")
  
  // Suggest response tone
  const suggestedTone = determineTone(emotions, contextualFlags, needsSupport)
  
  return {
    sentiment,
    confidence,
    emotions,
    urgency,
    needsSupport,
    suggestedTone,
    contextualFlags
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function detectEmotions(message: string, words: string[]): EmotionDetection[] {
  const detected: EmotionDetection[] = []
  
  for (const [emotion, patterns] of Object.entries(EMOTION_PATTERNS)) {
    const indicators: string[] = []
    
    // Check keywords
    for (const keyword of patterns.keywords) {
      if (message.includes(keyword)) {
        indicators.push(keyword)
      }
    }
    
    // Check phrases
    for (const phrase of patterns.phrases) {
      if (message.includes(phrase)) {
        indicators.push(phrase)
      }
    }
    
    if (indicators.length > 0) {
      // Adjust intensity based on punctuation and capitalization
      let intensity = patterns.intensity
      const hasExclamation = message.includes("!")
      const hasAllCaps = words.some(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w))
      const hasMultiplePunctuation = /[!?]{2,}/.test(message)
      
      if (hasAllCaps || hasMultiplePunctuation) {
        intensity = "high"
      } else if (hasExclamation && intensity === "low") {
        intensity = "medium"
      }
      
      detected.push({
        emotion,
        intensity,
        indicators
      })
    }
  }
  
  return detected
}

function detectContextualFlags(message: string): ContextualFlag[] {
  const flags: ContextualFlag[] = []
  
  for (const [flag, config] of Object.entries(TRADING_EMOTIONAL_INDICATORS)) {
    for (const pattern of config.patterns) {
      if (message.includes(pattern)) {
        flags.push({
          flag,
          description: getContextDescription(flag),
          responseGuidance: getResponseGuidance(flag, config.response)
        })
        break // Only add each flag once
      }
    }
  }
  
  return flags
}

function getContextDescription(flag: string): string {
  const descriptions: Record<string, string> = {
    revenge_trading: "User may be attempting to recover losses through aggressive trading",
    fomo: "User is experiencing fear of missing out on market moves",
    overconfidence: "User may be overestimating their edge or taking excessive risk",
    tilt: "User appears to be in an emotional state affecting their judgment",
    breakthrough: "User has achieved a positive learning milestone"
  }
  return descriptions[flag] || "Emotional state detected"
}

function getResponseGuidance(flag: string, baseResponse: string): string {
  const guidance: Record<string, string> = {
    revenge_trading: "Acknowledge the loss, validate feelings, then gently redirect to risk management and the importance of stepping away",
    fomo: "Help user understand that missing trades is part of trading, focus on their own strategy and opportunities that fit their plan",
    overconfidence: "Subtly remind of risk management principles without being condescending, perhaps share statistics about expectancy",
    tilt: "Lead with empathy, acknowledge the difficulty, suggest a break, and offer to review trades together when ready",
    breakthrough: "Celebrate the progress, reinforce the learning, and help solidify the insight"
  }
  return guidance[flag] || `Use ${baseResponse} tone in response`
}

function calculateOverallSentiment(emotions: EmotionDetection[]): SentimentResult["sentiment"] {
  if (emotions.length === 0) return "neutral"
  
  const positive = emotions.filter(e => 
    ["excitement", "confidence", "pride"].includes(e.emotion)
  )
  const negative = emotions.filter(e => 
    ["frustration", "anxiety", "despair", "regret"].includes(e.emotion)
  )
  
  if (positive.length > 0 && negative.length > 0) return "mixed"
  if (positive.length > negative.length) return "positive"
  if (negative.length > positive.length) return "negative"
  return "neutral"
}

function determineUrgency(emotions: EmotionDetection[], flags: ContextualFlag[]): SentimentResult["urgency"] {
  // High urgency conditions
  if (
    emotions.some(e => e.emotion === "despair" && e.intensity === "high") ||
    flags.some(f => f.flag === "tilt" || f.flag === "revenge_trading")
  ) {
    return "high"
  }
  
  // Medium urgency conditions
  if (
    emotions.some(e => ["frustration", "anxiety"].includes(e.emotion) && e.intensity !== "low") ||
    flags.length > 0
  ) {
    return "medium"
  }
  
  return "low"
}

function determineTone(
  emotions: EmotionDetection[], 
  flags: ContextualFlag[],
  needsSupport: boolean
): SentimentResult["suggestedTone"] {
  // Priority: Support > Caution > Celebration > Analysis > Encouragement
  
  if (needsSupport) return "empathetic"
  
  if (flags.some(f => f.flag === "overconfidence")) return "cautionary"
  
  if (emotions.some(e => ["excitement", "pride"].includes(e.emotion) && e.intensity !== "low")) {
    return "celebratory"
  }
  
  if (emotions.some(e => e.emotion === "confusion")) return "analytical"
  
  if (flags.some(f => f.flag === "breakthrough")) return "encouraging"
  
  return "analytical" // Default to analytical
}

// ==========================================
// RESPONSE MODIFIERS
// ==========================================

export function getSentimentResponseModifier(result: SentimentResult): string {
  const modifiers: string[] = []
  
  // Base tone instruction
  switch (result.suggestedTone) {
    case "empathetic":
      modifiers.push("Lead with empathy and understanding. Acknowledge the user's feelings before offering advice.")
      break
    case "cautionary":
      modifiers.push("Gently introduce risk awareness. Be supportive but help ground expectations in reality.")
      break
    case "celebratory":
      modifiers.push("Share in the user's excitement while reinforcing good practices that led to success.")
      break
    case "encouraging":
      modifiers.push("Be supportive and reinforce positive progress. Help build confidence through recognition.")
      break
    case "analytical":
      modifiers.push("Focus on data and actionable insights. Be direct and informative.")
      break
  }
  
  // Add urgency modifiers
  if (result.urgency === "high") {
    modifiers.push("This is a high-priority emotional situation. Address the emotional state first before any technical advice.")
  }
  
  // Add specific flag guidance
  for (const flag of result.contextualFlags) {
    modifiers.push(flag.responseGuidance)
  }
  
  // Support modifier
  if (result.needsSupport) {
    modifiers.push("The user appears to need emotional support. Prioritize their wellbeing over trading advice.")
  }
  
  return modifiers.join(" ")
}

// ==========================================
// PROACTIVE SUGGESTIONS
// ==========================================

export function getProactiveSuggestions(result: SentimentResult): string[] {
  const suggestions: string[] = []
  
  if (result.contextualFlags.some(f => f.flag === "tilt")) {
    suggestions.push("Would you like to talk through what happened?")
    suggestions.push("Sometimes stepping away for a few hours can provide clarity.")
    suggestions.push("Want me to help you review your recent trades objectively?")
  }
  
  if (result.contextualFlags.some(f => f.flag === "revenge_trading")) {
    suggestions.push("The urge to recover losses quickly is natural, but let's think about this together.")
    suggestions.push("What does your trading plan say about trading after a loss?")
  }
  
  if (result.contextualFlags.some(f => f.flag === "breakthrough")) {
    suggestions.push("This is a great insight! Would you like to document this in your trading journal?")
    suggestions.push("Let's make sure you can replicate this understanding.")
  }
  
  if (result.emotions.some(e => e.emotion === "confusion")) {
    suggestions.push("I'm happy to break this down step by step.")
    suggestions.push("Would a specific example help clarify this?")
  }
  
  return suggestions
}
