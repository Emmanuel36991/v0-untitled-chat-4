import type { Trade } from "@/types"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface StrategyRuleDef {
  id: string
  text: string
  phase: string
  category?: string
  required: boolean
}

export interface StrategyWithRules {
  id: string
  name: string
  rules: StrategyRuleDef[]
}

export interface TradeComplianceScore {
  tradeId: string
  tradeDate: string
  instrument: string
  strategyName: string
  executedRuleIds: string[]
  totalRules: number
  followedRules: number
  score: number            // 0-1
  missedRules: string[]    // Rule texts that were NOT followed
  pnl: number
  outcome: string
}

export interface ComplianceAnalysis {
  overallScore: number           // 0-1 average compliance across all trades
  tradeScores: TradeComplianceScore[]
  complianceVsOutcome: {
    highCompliance: { trades: number; winRate: number; avgPnl: number }
    lowCompliance: { trades: number; winRate: number; avgPnl: number }
  }
  mostMissedRules: { ruleText: string; missCount: number; totalTrades: number }[]
  recommendation: string
}

// ── Main Analysis ──────────────────────────────────────────────────────────────

export function analyzeRuleCompliance(
  trades: Trade[],
  strategies: StrategyWithRules[],
): ComplianceAnalysis {
  const empty: ComplianceAnalysis = {
    overallScore: 0,
    tradeScores: [],
    complianceVsOutcome: {
      highCompliance: { trades: 0, winRate: 0, avgPnl: 0 },
      lowCompliance: { trades: 0, winRate: 0, avgPnl: 0 },
    },
    mostMissedRules: [],
    recommendation: "Link trades to playbook strategies and check off rules during execution for compliance tracking.",
  }

  if (!trades.length || !strategies.length) return empty

  // Build a lookup of strategy -> rules
  const stratMap = new Map<string, StrategyWithRules>()
  for (const s of strategies) {
    stratMap.set(s.id, s)
  }

  // Score each trade
  const tradeScores: TradeComplianceScore[] = []
  const missedRuleCount = new Map<string, { text: string; count: number; total: number }>()

  for (const trade of trades) {
    if (!trade.playbook_strategy_id) continue
    const strategy = stratMap.get(trade.playbook_strategy_id)
    if (!strategy || !strategy.rules.length) continue

    const executedIds = new Set(trade.executed_rules || [])
    const totalRules = strategy.rules.length
    const followedRules = strategy.rules.filter(r => executedIds.has(r.id)).length
    const missedRules = strategy.rules
      .filter(r => !executedIds.has(r.id))
      .map(r => r.text)

    // Track missed rules globally
    for (const rule of strategy.rules) {
      const key = rule.id
      const entry = missedRuleCount.get(key) || { text: rule.text, count: 0, total: 0 }
      entry.total++
      if (!executedIds.has(rule.id)) entry.count++
      missedRuleCount.set(key, entry)
    }

    tradeScores.push({
      tradeId: trade.id,
      tradeDate: trade.date,
      instrument: trade.instrument,
      strategyName: strategy.name,
      executedRuleIds: Array.from(executedIds),
      totalRules,
      followedRules,
      score: totalRules > 0 ? followedRules / totalRules : 0,
      missedRules,
      pnl: trade.pnl,
      outcome: trade.outcome,
    })
  }

  if (!tradeScores.length) return empty

  // Overall score
  const overallScore = tradeScores.reduce((s, t) => s + t.score, 0) / tradeScores.length

  // Compliance vs Outcome (threshold: 70%)
  const highCompliance = tradeScores.filter(t => t.score >= 0.7)
  const lowCompliance = tradeScores.filter(t => t.score < 0.7)

  const statsFor = (arr: TradeComplianceScore[]) => {
    if (!arr.length) return { trades: 0, winRate: 0, avgPnl: 0 }
    const wins = arr.filter(t => t.pnl > 0).length
    const avgPnl = arr.reduce((s, t) => s + t.pnl, 0) / arr.length
    return { trades: arr.length, winRate: wins / arr.length, avgPnl }
  }

  // Most missed rules (sorted by miss frequency)
  const mostMissedRules = Array.from(missedRuleCount.values())
    .map(r => ({ ruleText: r.text, missCount: r.count, totalTrades: r.total }))
    .sort((a, b) => (b.missCount / b.totalTrades) - (a.missCount / a.totalTrades))
    .slice(0, 5)

  // Recommendation
  const highStats = statsFor(highCompliance)
  const lowStats = statsFor(lowCompliance)
  let recommendation = ""

  if (highStats.trades > 0 && lowStats.trades > 0) {
    if (highStats.winRate > lowStats.winRate) {
      recommendation = `When you follow 70%+ of your rules, you win ${(highStats.winRate * 100).toFixed(0)}% of trades vs ${(lowStats.winRate * 100).toFixed(0)}% when you don't. Discipline pays.`
    } else {
      recommendation = `Your compliance score doesn't yet correlate with better outcomes. Review whether your rules accurately reflect your edge, or collect more data.`
    }
  } else if (tradeScores.length < 10) {
    recommendation = `You have ${tradeScores.length} scored trades. Log at least 10 linked trades for reliable compliance analysis.`
  } else {
    recommendation = "Link more trades to strategies and check off executed rules for deeper compliance insights."
  }

  return {
    overallScore,
    tradeScores,
    complianceVsOutcome: {
      highCompliance: highStats,
      lowCompliance: lowStats,
    },
    mostMissedRules,
    recommendation,
  }
}
