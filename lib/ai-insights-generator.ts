import type { Trade, PlaybookStrategy } from "@/types"
import { GOOD_HABITS, BAD_HABITS } from "@/types"

export type InsightCategory = 'direction' | 'strategy' | 'psychology' | 'trend' | 'instrument'
export type InsightSeverity = 'positive' | 'warning' | 'critical' | 'neutral'

export interface AIInsight {
    id: string
    category: InsightCategory
    title: string
    message: string
    severity: InsightSeverity
    confidence: number // 0-100
    actionable: boolean
    generatedAt: Date
}

/**
 * Calculate win rate from array of trades
 */
function calculateWinRate(trades: Trade[]): number {
    if (trades.length === 0) return 0
    const wins = trades.filter(t => t.outcome === 'win').length
    return (wins / trades.length) * 100
}

/**
 * Calculate average P&L from trades
 */
function calculateAvgPnL(trades: Trade[]): number {
    if (trades.length === 0) return 0
    const total = trades.reduce((sum, t) => sum + t.pnl, 0)
    return total / trades.length
}

/**
 * Analyze direction performance (Long vs Short)
 */
function analyzeDirectionPerformance(trades: Trade[]): AIInsight | null {
    const longTrades = trades.filter(t => t.direction === 'long')
    const shortTrades = trades.filter(t => t.direction === 'short')

    // Need sufficient data
    if (longTrades.length < 5 || shortTrades.length < 5) return null

    const longWinRate = calculateWinRate(longTrades)
    const shortWinRate = calculateWinRate(shortTrades)

    const difference = Math.abs(longWinRate - shortWinRate)

    // Significant difference threshold
    if (difference > 15) {
        const better = longWinRate > shortWinRate ? 'Long' : 'Short'
        const worse = longWinRate > shortWinRate ? 'Short' : 'Long'
        const betterRate = Math.max(longWinRate, shortWinRate)
        const worseRate = Math.min(longWinRate, shortWinRate)

        return {
            id: 'direction-preference',
            category: 'direction',
            title: 'Direction Edge Detected',
            message: `Your ${better} trades show a ${betterRate.toFixed(0)}% win rate vs ${worseRate.toFixed(0)}% for ${worse}. Focus on ${better} setups for better results.`,
            severity: 'positive',
            confidence: 85,
            actionable: true,
            generatedAt: new Date()
        }
    }

    return null
}

/**
 * Analyze session/time-of-day performance
 */
function analyzeSessionPerformance(trades: Trade[]): AIInsight | null {
    if (trades.length < 15) return null

    // Extract hour from date
    const getTradeHour = (trade: Trade) => {
        try {
            return new Date(trade.date).getHours()
        } catch {
            return 12 // Default to noon if parsing fails
        }
    }

    const sessions = {
        morning: trades.filter(t => {
            const hour = getTradeHour(t)
            return hour >= 9 && hour < 12
        }),
        afternoon: trades.filter(t => {
            const hour = getTradeHour(t)
            return hour >= 12 && hour < 16
        }),
        evening: trades.filter(t => {
            const hour = getTradeHour(t)
            return hour >= 16 && hour < 21
        })
    }

    // Calculate stats for each session
    const sessionStats = Object.entries(sessions)
        .map(([name, sessionTrades]) => ({
            name,
            winRate: calculateWinRate(sessionTrades),
            avgPnL: calculateAvgPnL(sessionTrades),
            count: sessionTrades.length
        }))
        .filter(s => s.count >= 5) // Only sessions with sufficient data

    if (sessionStats.length < 2) return null

    const bestSession = sessionStats.reduce((a, b) => a.winRate > b.winRate ? a : b)
    const worstSession = sessionStats.reduce((a, b) => a.winRate < b.winRate ? a : b)

    const winRateDiff = bestSession.winRate - worstSession.winRate

    if (winRateDiff > 15) {
        return {
            id: 'session-preference',
            category: 'direction',
            title: 'Optimal Trading Window',
            message: `You perform ${winRateDiff.toFixed(0)}% better in ${bestSession.name} sessions (${bestSession.winRate.toFixed(0)}% win rate vs ${worstSession.winRate.toFixed(0)}%). Consider focusing your trading then.`,
            severity: 'positive',
            confidence: 78,
            actionable: true,
            generatedAt: new Date()
        }
    }

    return null
}

/**
 * Analyze strategy effectiveness from playbook
 */
function analyzeStrategyEffectiveness(
    trades: Trade[],
    strategies: PlaybookStrategy[]
): AIInsight | null {
    if (strategies.length === 0 || trades.length < 10) return null

    // Find best performing strategy
    const strategyWithTrades = strategies
        .filter(s => s.trades_count >= 5)
        .sort((a, b) => b.win_rate - a.win_rate)

    if (strategyWithTrades.length === 0) return null

    const bestStrategy = strategyWithTrades[0]

    if (bestStrategy.win_rate > 70) {
        return {
            id: 'strategy-strength',
            category: 'strategy',
            title: 'High-Performance Strategy',
            message: `Your "${bestStrategy.name}" strategy has a ${bestStrategy.win_rate.toFixed(0)}% win rate over ${bestStrategy.trades_count} trades. Keep prioritizing it!`,
            severity: 'positive',
            confidence: 90,
            actionable: true,
            generatedAt: new Date()
        }
    }

    // Check for underperforming strategy
    const worstStrategy = strategyWithTrades[strategyWithTrades.length - 1]
    if (worstStrategy.win_rate < 40 && worstStrategy.trades_count >= 5) {
        return {
            id: 'strategy-weakness',
            category: 'strategy',
            title: 'Strategy Needs Review',
            message: `Your "${worstStrategy.name}" strategy is underperforming at ${worstStrategy.win_rate.toFixed(0)}% win rate. Review your execution or adjust the rules.`,
            severity: 'warning',
            confidence: 85,
            actionable: true,
            generatedAt: new Date()
        }
    }

    return null
}

/**
 * Analyze psychology correlation with outcomes
 */
function analyzePsychologyCorrelation(trades: Trade[]): AIInsight | null {
    if (trades.length < 10) return null

    const goodHabitsMap = new Map<string, { wins: number, total: number }>()
    const badHabitsMap = new Map<string, { wins: number, total: number }>()

    trades.forEach(trade => {
        const isWin = trade.outcome === 'win'

        // Track good habits
        trade.good_habits?.forEach(habit => {
            const current = goodHabitsMap.get(habit) || { wins: 0, total: 0 }
            goodHabitsMap.set(habit, {
                wins: current.wins + (isWin ? 1 : 0),
                total: current.total + 1
            })
        })

        // Track bad habits
        trade.psychology_factors?.forEach(factor => {
            const current = badHabitsMap.get(factor) || { wins: 0, total: 0 }
            badHabitsMap.set(factor, {
                wins: current.wins + (isWin ? 1 : 0),
                total: current.total + 1
            })
        })
    })

    // Find most impactful good habit
    let bestHabit: { id: string, name: string, winRate: number, count: number } | null = null
    goodHabitsMap.forEach((stats, habitId) => {
        if (stats.total >= 5) {
            const winRate = (stats.wins / stats.total) * 100
            if (!bestHabit || winRate > bestHabit.winRate) {
                const habitName = GOOD_HABITS.find(h => h.id === habitId)?.name || habitId
                bestHabit = { id: habitId, name: habitName, winRate, count: stats.total }
            }
        }
    })

    // Find most damaging bad habit
    let worstHabit: { id: string, name: string, winRate: number, count: number } | null = null
    badHabitsMap.forEach((stats, habitId) => {
        if (stats.total >= 3) {
            const winRate = (stats.wins / stats.total) * 100
            if (!worstHabit || winRate < worstHabit.winRate) {
                const habitName = BAD_HABITS.find(h => h.id === habitId)?.name || habitId
                worstHabit = { id: habitId, name: habitName, winRate, count: stats.total }
            }
        }
    })

    // Prioritize bad habit warnings (more actionable)
    if (worstHabit && worstHabit.winRate < 30) {
        return {
            id: 'psychology-warning',
            category: 'psychology',
            title: 'Destructive Pattern Found',
            message: `When experiencing "${worstHabit.name}", you only win ${worstHabit.winRate.toFixed(0)}% of trades (${worstHabit.count} instances). Implement safeguards against this.`,
            severity: 'critical',
            confidence: 90,
            actionable: true,
            generatedAt: new Date()
        }
    }

    if (bestHabit && bestHabit.winRate > 75) {
        return {
            id: 'psychology-strength',
            category: 'psychology',
            title: 'Mental Edge Identified',
            message: `Trades when you're "${bestHabit.name}" win ${bestHabit.winRate.toFixed(0)}% of the time (${bestHabit.count} trades). Prioritize this mental state.`,
            severity: 'positive',
            confidence: 85,
            actionable: true,
            generatedAt: new Date()
        }
    }

    return null
}

/**
 * Analyze recent trend and momentum
 */
function analyzeTrendMomentum(trades: Trade[]): AIInsight | null {
    if (trades.length < 5) return null

    // Sort by date descending (most recent first)
    const recentTrades = [...trades]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)

    // Check for winning streak
    let winStreak = 0
    for (const trade of recentTrades) {
        if (trade.outcome === 'win') winStreak++
        else break
    }

    if (winStreak >= 4) {
        const totalPnL = recentTrades.slice(0, winStreak).reduce((sum, t) => sum + t.pnl, 0)
        return {
            id: 'winning-streak',
            category: 'trend',
            title: 'Hot Streak Active!',
            message: `You're on a ${winStreak}-trade winning streak with +$${totalPnL.toFixed(2)}. Your discipline is working—keep it up!`,
            severity: 'positive',
            confidence: 95,
            actionable: false,
            generatedAt: new Date()
        }
    }

    // Check for losing streak
    let lossStreak = 0
    for (const trade of recentTrades) {
        if (trade.outcome === 'loss') lossStreak++
        else break
    }

    if (lossStreak >= 3) {
        return {
            id: 'losing-streak',
            category: 'trend',
            title: 'Warning: Losing Streak',
            message: `${lossStreak} consecutive losses detected. Take a break, review your edge, and reset mentally before continuing.`,
            severity: 'warning',
            confidence: 90,
            actionable: true,
            generatedAt: new Date()
        }
    }

    return null
}

/**
 * Analyze instrument preference
 */
function analyzeInstrumentPreference(trades: Trade[]): AIInsight | null {
    if (trades.length < 15) return null

    // Group by instrument
    const instrumentMap = new Map<string, Trade[]>()
    trades.forEach(trade => {
        const current = instrumentMap.get(trade.instrument) || []
        instrumentMap.set(trade.instrument, [...current, trade])
    })

    // Calculate stats for each instrument
    const instrumentStats = Array.from(instrumentMap.entries())
        .map(([instrument, instrumentTrades]) => ({
            instrument,
            winRate: calculateWinRate(instrumentTrades),
            avgPnL: calculateAvgPnL(instrumentTrades),
            count: instrumentTrades.length
        }))
        .filter(s => s.count >= 5)

    if (instrumentStats.length < 2) return null

    const bestInstrument = instrumentStats.reduce((a, b) => a.winRate > b.winRate ? a : b)
    const worstInstrument = instrumentStats.reduce((a, b) => a.winRate < b.winRate ? a : b)

    const winRateDiff = bestInstrument.winRate - worstInstrument.winRate

    if (winRateDiff > 20) {
        return {
            id: 'instrument-preference',
            category: 'instrument',
            title: 'Instrument Edge Found',
            message: `Your ${bestInstrument.instrument} trades show ${bestInstrument.winRate.toFixed(0)}% win rate vs ${worstInstrument.winRate.toFixed(0)}% on ${worstInstrument.instrument}. Consider specializing in ${bestInstrument.instrument}.`,
            severity: 'positive',
            confidence: 80,
            actionable: true,
            generatedAt: new Date()
        }
    }

    return null
}

/**
 * Prioritize insights by importance and actionability
 */
function prioritizeInsights(insights: AIInsight[]): AIInsight[] {
    // Sort by: severity (critical > warning > positive), then confidence, then actionability
    return insights.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, positive: 2, neutral: 3 }

        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
            return severityOrder[a.severity] - severityOrder[b.severity]
        }

        if (a.confidence !== b.confidence) {
            return b.confidence - a.confidence
        }

        if (a.actionable !== b.actionable) {
            return a.actionable ? -1 : 1
        }

        return 0
    })
}

/**
 * Main function to generate AI insights from trade data
 */
export function generateAIInsights(
    trades: Trade[],
    strategies: PlaybookStrategy[] = [],
    recentDays: number = 30
): AIInsight[] {
    if (trades.length === 0) return []

    // Filter to recent trades
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - recentDays)

    const recentTrades = trades.filter(t => {
        try {
            return new Date(t.date) >= cutoffDate
        } catch {
            return true // Include if date parsing fails
        }
    })

    if (recentTrades.length === 0) return []

    // Generate all possible insights
    const allInsights: AIInsight[] = [
        analyzeDirectionPerformance(recentTrades),
        analyzeSessionPerformance(recentTrades),
        analyzeStrategyEffectiveness(recentTrades, strategies),
        analyzePsychologyCorrelation(recentTrades),
        analyzeTrendMomentum(recentTrades),
        analyzeInstrumentPreference(recentTrades),
    ].filter((insight): insight is AIInsight => insight !== null)

    // Prioritize and return
    return prioritizeInsights(allInsights)
}
