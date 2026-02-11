import type { Trade } from "@/types"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PatternStat {
  label: string
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  avgPnl: number
  totalPnl: number
}

export interface PatternGroup {
  category: string       // "Instrument", "Entry Hour", "Direction", "Session", "Day of Week", "Setup"
  patterns: PatternStat[]
}

export interface SmartRecommendation {
  type: "strength" | "warning" | "tip"
  title: string
  body: string
}

export interface PatternRecognitionResult {
  groups: PatternGroup[]
  topWinningPatterns: PatternStat[]
  topLosingPatterns: PatternStat[]
  recommendations: SmartRecommendation[]
  streaks: { currentStreak: number; bestWinStreak: number; worstLossStreak: number }
  weeklyHeatmap: { day: string; hour: number; winRate: number; count: number }[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildStats(label: string, trades: Trade[]): PatternStat {
  const wins = trades.filter(t => t.pnl > 0).length
  const losses = trades.filter(t => t.pnl <= 0).length
  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0)
  return {
    label,
    totalTrades: trades.length,
    wins,
    losses,
    winRate: trades.length > 0 ? wins / trades.length : 0,
    avgPnl: trades.length > 0 ? totalPnl / trades.length : 0,
    totalPnl,
  }
}

function groupBy(trades: Trade[], keyFn: (t: Trade) => string | null): Map<string, Trade[]> {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const key = keyFn(t)
    if (key === null) continue
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  return map
}

function extractHour(raw: string | null | undefined): number | null {
  if (!raw) return null
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.getHours()
  if (raw.includes(":")) {
    const h = parseInt(raw.split(":")[0], 10)
    if (!isNaN(h) && h >= 0 && h <= 23) return h
  }
  return null
}

function formatHour(h: number): string {
  const ampm = h >= 12 ? "PM" : "AM"
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${display}:00 ${ampm}`
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function getDayOfWeek(dateStr: string): string | null {
  const d = new Date(dateStr + "T12:00:00")
  if (isNaN(d.getTime())) return null
  return DAY_NAMES[d.getDay()]
}

// ── Main Analysis ──────────────────────────────────────────────────────────────

export function analyzePatterns(trades: Trade[]): PatternRecognitionResult {
  if (!trades.length) {
    return {
      groups: [],
      topWinningPatterns: [],
      topLosingPatterns: [],
      recommendations: [],
      streaks: { currentStreak: 0, bestWinStreak: 0, worstLossStreak: 0 },
      weeklyHeatmap: [],
    }
  }

  const groups: PatternGroup[] = []

  // 1. Instrument
  const instrMap = groupBy(trades, t => t.instrument || null)
  if (instrMap.size > 0) {
    groups.push({
      category: "Instrument",
      patterns: Array.from(instrMap.entries())
        .map(([k, v]) => buildStats(k, v))
        .sort((a, b) => b.totalTrades - a.totalTrades),
    })
  }

  // 2. Direction
  const dirMap = groupBy(trades, t => t.direction === "long" ? "Long" : t.direction === "short" ? "Short" : null)
  if (dirMap.size > 0) {
    groups.push({
      category: "Direction",
      patterns: Array.from(dirMap.entries()).map(([k, v]) => buildStats(k, v)),
    })
  }

  // 3. Entry Hour
  const hourMap = groupBy(trades, t => {
    const h = extractHour(t.trade_start_time)
    return h !== null ? String(h) : null
  })
  if (hourMap.size > 0) {
    groups.push({
      category: "Entry Hour",
      patterns: Array.from(hourMap.entries())
        .map(([k, v]) => buildStats(formatHour(parseInt(k)), v))
        .sort((a, b) => {
          const ha = parseInt(a.label)
          const hb = parseInt(b.label)
          return ha - hb
        }),
    })
  }

  // 4. Day of Week
  const dayMap = groupBy(trades, t => getDayOfWeek(t.date))
  if (dayMap.size > 0) {
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    groups.push({
      category: "Day of Week",
      patterns: Array.from(dayMap.entries())
        .map(([k, v]) => buildStats(k, v))
        .sort((a, b) => dayOrder.indexOf(a.label) - dayOrder.indexOf(b.label)),
    })
  }

  // 5. Session
  const sessionMap = groupBy(trades, t => t.trade_session || null)
  if (sessionMap.size > 0) {
    groups.push({
      category: "Session",
      patterns: Array.from(sessionMap.entries()).map(([k, v]) => buildStats(k, v)),
    })
  }

  // 6. Setup Name
  const setupMap = groupBy(trades, t => t.setup_name || null)
  if (setupMap.size > 0) {
    groups.push({
      category: "Setup",
      patterns: Array.from(setupMap.entries())
        .map(([k, v]) => buildStats(k, v))
        .sort((a, b) => b.totalTrades - a.totalTrades),
    })
  }

  // ── Top Patterns (min 2 trades to qualify) ───────────────────────────────────
  const allPatterns = groups.flatMap(g =>
    g.patterns
      .filter(p => p.totalTrades >= 2)
      .map(p => ({ ...p, label: `${g.category}: ${p.label}` }))
  )

  const topWinningPatterns = [...allPatterns]
    .sort((a, b) => b.winRate - a.winRate || b.totalPnl - a.totalPnl)
    .slice(0, 5)

  const topLosingPatterns = [...allPatterns]
    .sort((a, b) => a.winRate - b.winRate || a.totalPnl - b.totalPnl)
    .slice(0, 5)

  // ── Streaks ──────────────────────────────────────────────────────────────────
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  let currentStreak = 0
  let bestWinStreak = 0
  let worstLossStreak = 0
  let winRun = 0
  let lossRun = 0

  for (const t of sorted) {
    if (t.pnl > 0) {
      winRun++
      lossRun = 0
      if (winRun > bestWinStreak) bestWinStreak = winRun
    } else {
      lossRun++
      winRun = 0
      if (lossRun > worstLossStreak) worstLossStreak = lossRun
    }
  }
  // Current streak: positive = wins, negative = losses
  const last = sorted[sorted.length - 1]
  if (last) {
    currentStreak = last.pnl > 0 ? winRun : -lossRun
  }

  // ── Weekly Heatmap ──────────────────────────────────────────────────────────
  const heatmapMap = new Map<string, { wins: number; total: number }>()
  for (const t of trades) {
    const day = getDayOfWeek(t.date)
    const hour = extractHour(t.trade_start_time)
    if (!day || hour === null) continue
    const key = `${day}-${hour}`
    const entry = heatmapMap.get(key) || { wins: 0, total: 0 }
    entry.total++
    if (t.pnl > 0) entry.wins++
    heatmapMap.set(key, entry)
  }

  const weeklyHeatmap = Array.from(heatmapMap.entries()).map(([key, val]) => {
    const [day, hourStr] = key.split("-")
    return {
      day,
      hour: parseInt(hourStr),
      winRate: val.total > 0 ? val.wins / val.total : 0,
      count: val.total,
    }
  })

  // ── Smart Recommendations ──────────────────────────────────────────────────
  const recommendations = generateRecommendations(groups, topWinningPatterns, topLosingPatterns, trades)

  return {
    groups,
    topWinningPatterns,
    topLosingPatterns,
    recommendations,
    streaks: { currentStreak, bestWinStreak, worstLossStreak },
    weeklyHeatmap,
  }
}

// ── Recommendations ────────────────────────────────────────────────────────────

function generateRecommendations(
  groups: PatternGroup[],
  topWinning: PatternStat[],
  topLosing: PatternStat[],
  trades: Trade[],
): SmartRecommendation[] {
  const recs: SmartRecommendation[] = []
  const overallWinRate = trades.length > 0
    ? trades.filter(t => t.pnl > 0).length / trades.length
    : 0

  // Strength: best patterns
  if (topWinning.length > 0) {
    const best = topWinning[0]
    recs.push({
      type: "strength",
      title: `${best.label} is your edge`,
      body: `${(best.winRate * 100).toFixed(0)}% win rate across ${best.totalTrades} trades with $${best.totalPnl.toFixed(0)} total P&L. Double down on this pattern.`,
    })
  }

  // Warning: worst patterns
  if (topLosing.length > 0) {
    const worst = topLosing[0]
    if (worst.winRate < 0.35) {
      recs.push({
        type: "warning",
        title: `Avoid ${worst.label}`,
        body: `Only ${(worst.winRate * 100).toFixed(0)}% win rate across ${worst.totalTrades} trades. Consider removing this from your playbook or refining the setup criteria.`,
      })
    }
  }

  // Direction bias
  const dirGroup = groups.find(g => g.category === "Direction")
  if (dirGroup && dirGroup.patterns.length === 2) {
    const longP = dirGroup.patterns.find(p => p.label === "Long")
    const shortP = dirGroup.patterns.find(p => p.label === "Short")
    if (longP && shortP && Math.abs(longP.winRate - shortP.winRate) > 0.15) {
      const better = longP.winRate > shortP.winRate ? longP : shortP
      const worse = longP.winRate > shortP.winRate ? shortP : longP
      recs.push({
        type: "tip",
        title: `${better.label} bias detected`,
        body: `Your ${better.label} trades win ${(better.winRate * 100).toFixed(0)}% vs ${(worse.winRate * 100).toFixed(0)}% for ${worse.label}. Consider sizing down on ${worse.label} entries.`,
      })
    }
  }

  // Entry hour edge
  const hourGroup = groups.find(g => g.category === "Entry Hour")
  if (hourGroup) {
    const qualified = hourGroup.patterns.filter(p => p.totalTrades >= 2)
    const bestHour = qualified.sort((a, b) => b.winRate - a.winRate)[0]
    const worstHour = qualified.sort((a, b) => a.winRate - b.winRate)[0]
    if (bestHour && worstHour && bestHour.label !== worstHour.label) {
      recs.push({
        type: "tip",
        title: `Best window: ${bestHour.label}`,
        body: `Your entries at ${bestHour.label} win ${(bestHour.winRate * 100).toFixed(0)}% of the time. Entries at ${worstHour.label} only win ${(worstHour.winRate * 100).toFixed(0)}%. Consider restricting trading to your peak hours.`,
      })
    }
  }

  // Low sample size warning
  if (trades.length < 20) {
    recs.push({
      type: "warning",
      title: "Small sample size",
      body: `You have ${trades.length} trades logged. Patterns become more reliable after 30+ trades. Keep logging consistently.`,
    })
  }

  return recs
}
