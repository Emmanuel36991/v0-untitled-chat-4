import { Trade } from "@/types"

export const DEMO_KPI_STATS = {
    totalPnL: 4250.00,
    winRate: 68,
    profitFactor: 2.10,
    avgWin: 350,
    avgLoss: 150,
}

export const DEMO_EQUITY_DATA = Array.from({ length: 30 }, (_, i) => {
    const baseValue = 10000
    // Create a generally upward trend with some volatility
    const randomChange = (Math.random() - 0.4) * 200 // Bias slightly positive
    return {
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        value: baseValue + (i * 150) + randomChange
    }
})

export const DEMO_RECENT_TRADES = [
    { id: "1", symbol: "NQ", side: "Long", setup: "Breakout", pnl: 450.00, date: "2023-10-25 09:30" },
    { id: "2", symbol: "ES", side: "Short", setup: "Reversal", pnl: -125.00, date: "2023-10-25 10:15" },
    { id: "3", symbol: "GC", side: "Long", setup: "Trend", pnl: 320.00, date: "2023-10-24 14:00" },
    { id: "4", symbol: "CL", side: "Short", setup: "Breakout", pnl: 85.00, date: "2023-10-24 11:30" },
    { id: "5", symbol: "NQ", side: "Long", setup: "Trend", pnl: -200.00, date: "2023-10-23 09:45" },
    { id: "6", symbol: "ES", side: "Long", setup: "Reversal", pnl: 550.00, date: "2023-10-23 15:00" },
    { id: "7", symbol: "EURUSD", side: "Short", setup: "Breakout", pnl: 120.00, date: "2023-10-22 08:00" },
]

export const DEMO_ANALYTICS_DATA = {
    totalTrades: 142,
    wins: 97,
    losses: 45,
    breakeven: 0,
    totalPnL: 12450.00,
    avgPnL: 87.67,
    winRate: 68.3,
    profitFactor: 2.4,
    maxDrawdown: 1200.00,
    consistencyScore: 88,
    adaptabilityScore: 76,
    executionScore: 92,
    riskManagementScore: 85,
    efficiencyScore: 79,
    overallScore: 84,
    monthlyData: [
        { month: "Jan 2023", profit: 1200, trades: 12 },
        { month: "Feb 2023", profit: 800, trades: 10 },
        { month: "Mar 2023", profit: -400, trades: 15 },
        { month: "Apr 2023", profit: 1500, trades: 14 },
        { month: "May 2023", profit: 2200, trades: 18 },
        { month: "Jun 2023", profit: 900, trades: 11 },
        { month: "Jul 2023", profit: 3100, trades: 22 },
        { month: "Aug 2023", profit: -200, trades: 9 },
        { month: "Sep 2023", profit: 1800, trades: 16 },
        { month: "Oct 2023", profit: 1450, trades: 15 },
    ],
    dailyData: Array.from({ length: 90 }, (_, i) => {
        const date = new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const pnl = (Math.random() - 0.45) * 500
        return { date, pnl, trades: Math.floor(Math.random() * 5) }
    }),
    setupDistribution: {
        "Breakout": { count: 45, pnl: 4200, winRate: 65 },
        "Reversal": { count: 32, pnl: 1800, winRate: 58 },
        "Trend Following": { count: 55, pnl: 6500, winRate: 72 },
        "Scalp": { count: 10, pnl: -50, winRate: 40 },
    },
    instrumentDistribution: {
        "NQ": { count: 60, pnl: 5500, winRate: 70 },
        "ES": { count: 50, pnl: 4200, winRate: 65 },
        "GC": { count: 20, pnl: 1800, winRate: 60 },
        "CL": { count: 12, pnl: 950, winRate: 55 },
    }
}

export const DEMO_STRATEGIES = [
    {
        id: "strat-1",
        name: "London Open Breakout",
        description: "Capturing the initial move of the European session.",
        win_rate: 72,
        trades_count: 58,
        pnl: 3450,
        setups: [{}, {}, {}], // Dummy array for count
        rules: [{}, {}, {}, {}], // Dummy array for count
        equity_curve: [0, 100, 250, 180, 400, 550, 500, 750, 900, 1200]
    },
    {
        id: "strat-2",
        name: "NY AM Reversal",
        description: "Fading the initial morning drive after liquidity sweep.",
        win_rate: 64,
        trades_count: 42,
        pnl: 2800,
        setups: [{}, {}],
        rules: [{}, {}, {}],
        equity_curve: [0, -50, 100, 300, 250, 450, 600, 550, 800, 1100]
    },
    {
        id: "strat-3",
        name: "Asia Range Continuation",
        description: "Standard trend continuation during low volatility.",
        win_rate: 55,
        trades_count: 25,
        pnl: 850,
        setups: [{}],
        rules: [{}, {}],
        equity_curve: [0, 50, 20, 80, 150, 100, 200, 250, 220, 300]
    }
]
