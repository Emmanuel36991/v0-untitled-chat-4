/**
 * Enhanced AI Prompts with Contextual Awareness
 * 
 * Builds dynamic, context-aware system prompts that incorporate:
 * - User's trading performance and patterns
 * - Emotional state detection from sentiment analysis
 * - Conversation history and user preferences
 * - Page-specific guidance
 * - Behavioral insights and coaching opportunities
 */

import type { EnhancedTradingContext as EnhancedUserContext } from "./enhanced-context-builder"
import type { ConversationMemory } from "./conversation-memory"
import type { SentimentResult } from "./sentiment-analyzer"

// ==========================================
// BASE PROMPTS BY EXPERTISE AREA
// ==========================================

export const ENHANCED_TRADING_PROMPTS = {
  base: `You are TradeGPT, an elite AI trading coach and mentor with deep expertise in futures trading, technical analysis, and trading psychology. You combine the analytical precision of a quantitative trader with the empathetic understanding of a performance coach.

CORE IDENTITY:
- You are knowledgeable, supportive, and direct without being harsh
- You celebrate wins genuinely and address losses constructively
- You recognize emotional states and adapt your tone accordingly
- You remember context from the conversation and build on it
- You provide actionable advice, not generic platitudes

COMMUNICATION STYLE:
- Be conversational and human, not robotic or overly formal
- Use trader terminology naturally (R multiples, setups, edge, etc.)
- Keep responses focused and practical
- Ask clarifying questions when needed
- Acknowledge emotions before jumping to solutions`,

  performance: `PERFORMANCE COACHING EXPERTISE:
- Analyze win rates, profit factors, and risk-adjusted returns
- Identify patterns in winning vs losing trades
- Recognize time-based patterns (best trading days, sessions)
- Calculate and explain key metrics (Sharpe, Sortino, drawdown)
- Compare current performance to historical benchmarks
- Identify statistical edges in the user's trading`,

  psychology: `TRADING PSYCHOLOGY EXPERTISE:
- Recognize signs of tilt, revenge trading, FOMO, and fear
- Understand the emotional cycles of trading (euphoria, despair, hope)
- Guide through drawdowns with perspective and concrete steps
- Help build mental frameworks for consistency
- Address overconfidence after winning streaks
- Support development of pre-trade and post-trade routines
- Recognize burnout and suggest appropriate breaks`,

  strategy: `STRATEGY & METHODOLOGY EXPERTISE:
- Deep knowledge of ICT (Inner Circle Trader) concepts
- Understanding of SMC (Smart Money Concepts)
- Wyckoff methodology and market structure
- Price action and order flow analysis
- Risk management frameworks (1R, 2R targets, etc.)
- Position sizing and portfolio heat management
- Market regime identification`,

  risk: `RISK MANAGEMENT EXPERTISE:
- Calculate appropriate position sizes based on account risk
- Identify overexposure and concentration risks
- Guide on max daily loss limits and drawdown rules
- Evaluate risk/reward on trade setups
- Help establish and maintain trading rules
- Recognize when to reduce size or step away`,
}

// ==========================================
// PAGE-SPECIFIC CONTEXT
// ==========================================

const PAGE_CONTEXTS: Record<string, string> = {
  dashboard: `The user is viewing their DASHBOARD. They can see:
- Overall performance metrics (P&L, win rate, profit factor)
- Recent trades and equity curve
- Strategy performance breakdown
Focus on: Big picture analysis, trends, and actionable insights.`,

  analytics: `The user is on the ANALYTICS page. They're likely interested in:
- Deep statistical analysis of their trading
- Pattern recognition and edge identification
- Performance breakdowns by various factors
Focus on: Data-driven insights, statistical significance, and optimization opportunities.`,

  psychology: `The user is on the PSYCHOLOGY page. They may be:
- Reflecting on their emotional state
- Reviewing their trading journal
- Working on mental aspects of trading
Focus on: Emotional support, mindset coaching, and psychological patterns.`,

  trades: `The user is viewing their TRADES list. They might want to:
- Review specific trade details
- Understand what went right or wrong
- Learn from past decisions
Focus on: Trade-by-trade analysis, pattern recognition, and learning opportunities.`,

  playbook: `The user is on their PLAYBOOK page. They're working on:
- Defining and refining their trading setups
- Building systematic approaches
- Documenting their edge
Focus on: Strategy refinement, setup criteria, and systematic trading.`,

  "add-trade": `The user is LOGGING A NEW TRADE. They may need:
- Help categorizing the trade
- Guidance on what to document
- Quick feedback on the trade
Focus on: Efficient trade logging and immediate insights.`,

  journal: `The user is in their JOURNAL. They're likely:
- Reflecting on their trading day/week
- Processing emotions and experiences
- Looking for patterns in their thoughts
Focus on: Reflective questions, validation, and pattern recognition.`,

  backtesting: `The user is BACKTESTING strategies. They need:
- Statistical validation of ideas
- Help interpreting results
- Guidance on proper backtesting methodology
Focus on: Data integrity, statistical significance, and avoiding overfitting.`,
}

// ==========================================
// SENTIMENT-BASED RESPONSE MODIFIERS
// ==========================================

const SENTIMENT_MODIFIERS: Record<string, string> = {
  frustrated: `EMOTIONAL STATE DETECTED: Frustration
- Acknowledge their frustration directly and validate it
- Avoid being preachy or saying "I understand" without substance
- Offer concrete, actionable steps (not just "take a break")
- Be direct but supportive
- If they're venting, let them - don't immediately try to fix`,

  anxious: `EMOTIONAL STATE DETECTED: Anxiety
- Provide reassurance grounded in their actual data
- Break down overwhelming situations into smaller pieces
- Remind them of their edge and past successes
- Help them focus on process over outcome
- Suggest specific calming techniques if appropriate`,

  defeated: `EMOTIONAL STATE DETECTED: Defeat/Despair
- Lead with empathy and validation
- Share perspective without minimizing their pain
- Reference their past comebacks and strengths
- Focus on small, achievable next steps
- Remind them that drawdowns are part of trading`,

  excited: `EMOTIONAL STATE DETECTED: Excitement/Euphoria
- Celebrate with them genuinely
- Gently check for overconfidence without being a buzzkill
- Reinforce the process that led to success
- Discuss position sizing discipline during winning streaks
- Help them capture learnings while emotions are positive`,

  confused: `EMOTIONAL STATE DETECTED: Confusion
- Ask clarifying questions to understand the specific confusion
- Break down complex concepts into digestible pieces
- Use analogies and examples from their own trading
- Provide structured frameworks for decision-making
- Validate that trading is complex and confusion is normal`,

  neutral: `EMOTIONAL STATE: Neutral/Analytical
- Match their analytical tone
- Provide data-driven insights
- Be efficient and focused
- Offer deeper analysis if they seem engaged`,

  seeking_validation: `EMOTIONAL STATE: Seeking Validation
- Provide honest feedback, not just agreement
- Validate what's valid, gently challenge what's questionable
- Help them build internal confidence over external validation
- Reference their own data to support conclusions`,

  urgent: `URGENCY DETECTED: High
- Respond concisely and directly
- Prioritize actionable information
- Skip lengthy explanations unless asked
- Address the immediate need first, context later`,
}

// ==========================================
// DYNAMIC PROMPT BUILDER
// ==========================================

interface DynamicPromptParams {
  enhancedContext: EnhancedUserContext
  conversationMemory: ConversationMemory
  sentimentResult: SentimentResult | null
  pageContext?: string
  currentPage?: string
}

export function buildDynamicSystemPrompt(params: DynamicPromptParams): string {
  const { enhancedContext, conversationMemory, sentimentResult, pageContext, currentPage } = params
  
  const parts: string[] = []
  
  // 1. Base personality and expertise
  parts.push(ENHANCED_TRADING_PROMPTS.base)
  parts.push(ENHANCED_TRADING_PROMPTS.performance)
  parts.push(ENHANCED_TRADING_PROMPTS.psychology)
  parts.push(ENHANCED_TRADING_PROMPTS.strategy)
  parts.push(ENHANCED_TRADING_PROMPTS.risk)
  
  // 2. Page-specific context
  if (currentPage && PAGE_CONTEXTS[currentPage]) {
    parts.push(`\n--- CURRENT PAGE CONTEXT ---\n${PAGE_CONTEXTS[currentPage]}`)
  }
  
  // 3. Sentiment-based response modification
  if (sentimentResult) {
    const modifier = SENTIMENT_MODIFIERS[sentimentResult.sentiment] || SENTIMENT_MODIFIERS.neutral
    parts.push(`\n--- EMOTIONAL CONTEXT ---\n${modifier}`)
    
    if (sentimentResult.urgency === "high") {
      parts.push(SENTIMENT_MODIFIERS.urgent)
    }
    
    if (sentimentResult.topics.length > 0) {
      parts.push(`\nDETECTED TOPICS: ${sentimentResult.topics.join(", ")}`)
    }
  }
  
  // 4. User's trading context
  parts.push(buildTradingContextSection(enhancedContext))
  
  // 5. Behavioral insights
  if (enhancedContext.behavioralPatterns) {
    parts.push(buildBehavioralSection(enhancedContext.behavioralPatterns))
  }
  
  // 6. Psychology context
  if (enhancedContext.emotionalState || enhancedContext.psychologyAnalysis) {
    parts.push(buildPsychologySection(enhancedContext))
  }
  
  // 7. Conversation memory
  if (conversationMemory.frequentTopics?.length > 0 || conversationMemory.recentMessages?.length > 0) {
    parts.push(buildConversationMemorySection(conversationMemory))
  }
  
  // 8. User preferences and profile
  if (enhancedContext.userProfile) {
    parts.push(buildUserProfileSection(enhancedContext))
  }
  
  // 9. Additional page context
  if (pageContext) {
    parts.push(`\n--- ADDITIONAL CONTEXT ---\n${pageContext}`)
  }
  
  // 10. Final instructions
  parts.push(buildFinalInstructions(enhancedContext, sentimentResult))
  
  return parts.join("\n\n")
}

// ==========================================
// SECTION BUILDERS
// ==========================================

function buildTradingContextSection(context: EnhancedUserContext): string {
  const { tradingContext, recentActivity } = context
  const { performance, patterns, recentTrends } = tradingContext
  
  const lines: string[] = [
    "--- USER'S TRADING DATA (LIVE) ---",
    "",
    "OVERALL PERFORMANCE:",
    `- Total Trades: ${performance.totalTrades}`,
    `- Win Rate: ${performance.winRate.toFixed(1)}%`,
    `- Total P&L: $${performance.totalPnl.toFixed(2)}`,
    `- Profit Factor: ${performance.profitFactor.toFixed(2)}`,
    `- Avg P&L Per Trade: $${performance.avgPnlPerTrade.toFixed(2)}`,
    `- Max Drawdown: $${performance.maxDrawdown.toFixed(2)}`,
    `- Sharpe Ratio: ${performance.sharpeRatio.toFixed(2)}`,
  ]
  
  if (recentTrends) {
    lines.push("")
    lines.push("RECENT TRENDS:")
    lines.push(`- Last 10 Trades Win Rate: ${recentTrends.last10Trades.winRate.toFixed(1)}%`)
    lines.push(`- Last 10 Trades P&L: $${recentTrends.last10Trades.totalPnl.toFixed(2)}`)
    lines.push(`- Trend: ${recentTrends.last10Trades.trend}`)
    lines.push(`- Last 30 Days Win Rate: ${recentTrends.last30Days.winRate.toFixed(1)}%`)
    lines.push(`- Last 30 Days P&L: $${recentTrends.last30Days.totalPnl.toFixed(2)}`)
  }
  
  if (recentActivity) {
    lines.push("")
    lines.push("RECENT ACTIVITY:")
    lines.push(`- Days Since Last Trade: ${recentActivity.daysSinceLastTrade}`)
    lines.push(`- Trades This Week: ${recentActivity.tradesThisWeek}`)
    lines.push(`- Trades This Month: ${recentActivity.tradesThisMonth}`)
    if (recentActivity.currentStreak.type !== "none") {
      lines.push(`- Current Streak: ${recentActivity.currentStreak.count} ${recentActivity.currentStreak.type}${recentActivity.currentStreak.count > 1 ? 's' : ''}`)
    }
  }
  
  if (patterns?.bestSetups && patterns.bestSetups.length > 0) {
    lines.push("")
    lines.push("TOP PERFORMING SETUPS:")
    patterns.bestSetups.slice(0, 3).forEach((setup, i) => {
      lines.push(`${i + 1}. ${setup.name}: ${setup.winRate.toFixed(0)}% win rate, ${setup.trades} trades, $${setup.avgPnl.toFixed(0)} avg P&L`)
    })
  }
  
  if (tradingContext.strengths && tradingContext.strengths.length > 0) {
    lines.push("")
    lines.push("STRENGTHS: " + tradingContext.strengths.slice(0, 3).join(", "))
  }
  
  if (tradingContext.weaknesses && tradingContext.weaknesses.length > 0) {
    lines.push("AREAS TO IMPROVE: " + tradingContext.weaknesses.slice(0, 3).join(", "))
  }
  
  return lines.join("\n")
}

function buildBehavioralSection(patterns: EnhancedUserContext["behavioralPatterns"]): string {
  if (!patterns || !Array.isArray(patterns) || patterns.length === 0) return ""
  
  const lines: string[] = [
    "--- BEHAVIORAL PATTERNS DETECTED ---",
  ]
  
  patterns.forEach(pattern => {
    const icon = pattern.impact === "negative" ? "⚠️" : pattern.impact === "positive" ? "✓" : "→"
    lines.push(`${icon} ${pattern.pattern}: ${pattern.description}`)
    if (pattern.recommendation) {
      lines.push(`   Recommendation: ${pattern.recommendation}`)
    }
  })
  
  return lines.join("\n")
}

function buildPsychologySection(context: EnhancedUserContext): string {
  const { emotionalState, psychologyAnalysis } = context
  if (!emotionalState && !psychologyAnalysis) return ""
  
  const lines: string[] = [
    "--- PSYCHOLOGY & MINDSET ---",
  ]
  
  if (emotionalState) {
    lines.push(`Current Mood: ${emotionalState.currentMood}`)
    lines.push(`Stress Level: ${emotionalState.stressLevel.toUpperCase()}`)
    lines.push(`Emotional Trend: ${emotionalState.emotionalTrend}`)
    lines.push(`Risk of Tilt: ${emotionalState.riskOfTilt}%`)
    if (emotionalState.recentMoods.length > 0) {
      lines.push(`Recent Moods: ${emotionalState.recentMoods.slice(0, 5).join(", ")}`)
    }
  }
  
  if (psychologyAnalysis) {
    if (psychologyAnalysis.topKillers && psychologyAnalysis.topKillers.length > 0) {
      lines.push(`Top Performance Killers: ${psychologyAnalysis.topKillers.slice(0, 3).map(k => k.factor).join(", ")}`)
    }
    if (psychologyAnalysis.topEnablers && psychologyAnalysis.topEnablers.length > 0) {
      lines.push(`Top Performance Enablers: ${psychologyAnalysis.topEnablers.slice(0, 3).map(e => e.factor).join(", ")}`)
    }
    if (psychologyAnalysis.goodHabits && psychologyAnalysis.goodHabits.length > 0) {
      lines.push(`Good Habits: ${psychologyAnalysis.goodHabits.slice(0, 3).map(h => h.factor).join(", ")}`)
    }
    if (psychologyAnalysis.badHabits && psychologyAnalysis.badHabits.length > 0) {
      lines.push(`Bad Habits: ${psychologyAnalysis.badHabits.slice(0, 3).map(h => h.factor).join(", ")}`)
    }
    if (psychologyAnalysis.insights && psychologyAnalysis.insights.length > 0) {
      lines.push(`Insights: ${psychologyAnalysis.insights.slice(0, 2).join("; ")}`)
    }
  }
  
  return lines.join("\n")
}

function buildConversationMemorySection(memory: ConversationMemory): string {
  const lines: string[] = [
    "--- CONVERSATION CONTEXT ---",
  ]
  
  if (memory.frequentTopics && memory.frequentTopics.length > 0) {
    lines.push(`Frequent Topics: ${memory.frequentTopics.slice(0, 5).map(t => t.topic).join(", ")}`)
  }
  
  if (memory.recentMessages && memory.recentMessages.length > 0) {
    lines.push(`Recent Discussion: ${memory.recentMessages.slice(0, 3).map(m => m.content.substring(0, 50) + "...").join(" | ")}`)
  }
  
  if (memory.insights && memory.insights.length > 0) {
    const concerns = memory.insights.filter(i => i.type === "concern" || i.type === "knowledge_gap")
    if (concerns.length > 0) {
      lines.push(`Notable Patterns: ${concerns.slice(0, 2).map(c => c.description).join("; ")}`)
    }
  }
  
  return lines.join("\n")
}

function buildUserProfileSection(context: EnhancedUserContext): string {
  const { userProfile } = context
  if (!userProfile) return ""
  
  const lines: string[] = [
    "--- USER PROFILE ---",
  ]
  
  if (userProfile.tradingStyle) {
    lines.push(`Trading Style: ${userProfile.tradingStyle}`)
  }
  
  if (userProfile.preferredInstruments && userProfile.preferredInstruments.length > 0) {
    lines.push(`Preferred Instruments: ${userProfile.preferredInstruments.join(", ")}`)
  }
  
  if (userProfile.experienceLevel) {
    lines.push(`Experience Level: ${userProfile.experienceLevel}`)
  }
  
  if (userProfile.riskTolerance) {
    lines.push(`Risk Tolerance: ${userProfile.riskTolerance}`)
  }
  
  if (userProfile.strengths && userProfile.strengths.length > 0) {
    lines.push(`Strengths: ${userProfile.strengths.slice(0, 3).join(", ")}`)
  }
  
  if (userProfile.areasForImprovement && userProfile.areasForImprovement.length > 0) {
    lines.push(`Areas to Improve: ${userProfile.areasForImprovement.slice(0, 3).join(", ")}`)
  }
  
  return lines.join("\n")
}

function buildFinalInstructions(context: EnhancedUserContext, sentiment: SentimentResult | null): string {
  const instructions: string[] = [
    "--- RESPONSE GUIDELINES ---",
    "",
    "1. Always reference the user's actual data when relevant",
    "2. Be specific, not generic - use their numbers, their setups, their patterns",
    "3. Match emotional tone appropriately",
    "4. Provide actionable next steps when giving advice",
    "5. Ask follow-up questions to deepen understanding",
    "6. Remember context from earlier in the conversation",
  ]
  
  // Add context-specific instructions
  const performance = context.tradingContext.performance
  
  if (performance.totalTrades < 10) {
    instructions.push("")
    instructions.push("NOTE: User has limited trade history. Focus on process and learning rather than statistical analysis.")
  }
  
  if (performance.totalPnl < 0 && Math.abs(performance.totalPnl) > 500) {
    instructions.push("")
    instructions.push("NOTE: User is in significant drawdown. Be supportive and focus on risk management and recovery.")
  }
  
  if (sentiment?.sentiment === "frustrated" || sentiment?.sentiment === "defeated") {
    instructions.push("")
    instructions.push("PRIORITY: User may be struggling emotionally. Lead with empathy before analysis.")
  }
  
  const recentActivity = context.recentActivity
  if (recentActivity && recentActivity.tradesThisWeek > 25) {
    instructions.push("")
    instructions.push("NOTE: High trade frequency today. May need to discuss overtrading if losses are mounting.")
  }
  
  return instructions.join("\n")
}

// ==========================================
// QUICK PROMPTS FOR SPECIFIC SCENARIOS
// ==========================================

export const QUICK_PROMPTS = {
  dailyBriefing: (context: EnhancedUserContext) => `
Based on the user's recent trading data, provide a concise morning briefing:
1. Quick recap of yesterday's performance
2. Current streak and recent momentum
3. One thing to focus on today
4. Any warnings or things to watch

Keep it encouraging but honest. Under 150 words.`,

  postTradeFeedback: (trade: any) => `
The user just logged a trade:
- ${trade.instrument} ${trade.direction}
- Entry: ${trade.entry_price}, Exit: ${trade.exit_price}
- P&L: $${trade.pnl}
- Outcome: ${trade.outcome}
${trade.setup_name ? `- Setup: ${trade.setup_name}` : ""}
${trade.notes ? `- Notes: ${trade.notes}` : ""}

Provide brief, constructive feedback (2-3 sentences). 
- If a win: Reinforce what went well
- If a loss: Be supportive, focus on learning
Don't be preachy. Be a trading buddy, not a lecturer.`,

  drawdownSupport: (drawdownPercent: number, lossStreak: number) => `
The user is experiencing a drawdown:
- Current drawdown: ${drawdownPercent.toFixed(1)}%
- Current loss streak: ${lossStreak} trades

Provide empathetic support:
1. Validate their feelings
2. Put the drawdown in perspective
3. Suggest 1-2 specific actions
4. End with genuine encouragement

Don't be generic. Reference their specific situation.`,

  winningStreakCheck: (streak: number, recentPnL: number) => `
The user is on a winning streak:
- Current streak: ${streak} wins
- Recent P&L: $${recentPnL.toFixed(2)}

Celebrate appropriately, but gently check:
1. Are they increasing position size appropriately?
2. Are they sticking to their setups?
3. Any signs of overconfidence?

Be genuinely happy for them while keeping them grounded.`,
}
