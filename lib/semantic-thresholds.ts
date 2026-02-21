/**
 * Semantic Threshold Utilities
 * 
 * Used to ensure mathematical consistency when assigning "positive", "neutral", 
 * or "negative" states to financial metrics across the application.
 * This prevents UX dissonance where the same value gets different colors on different cards.
 */

export type ThresholdState = "positive" | "neutral" | "negative";

export function getPnLThreshold(pnl: number): ThresholdState {
    if (pnl > 0) return "positive";
    if (pnl < 0) return "negative";
    return "neutral"; // Exactly breakeven
}

export function getWinRateThreshold(winRate: number): ThresholdState {
    // A win rate above 50% is objectively profitable (assuming 1:1 RR)
    if (winRate > 50) return "positive";
    // A win rate between 40% and 50% *can* be profitable with a high RR, so it's neutral
    if (winRate > 40) return "neutral";
    // Below 40% requires an exceptionally high RR to survive, mathematically negative
    return "negative";
}

export function getProfitFactorThreshold(profitFactor: number): ThresholdState {
    // > 1.5 is excellent/highly profitable
    if (profitFactor >= 1.5) return "positive";
    // 1.0 - 1.49 is breakeven to slightly profitable
    if (profitFactor >= 1.0) return "neutral";
    // < 1.0 is losing money
    return "negative";
}

export function getAvgReturnThreshold(avgReturn: number): ThresholdState {
    if (avgReturn > 0) return "positive";
    if (avgReturn < 0) return "negative";
    return "neutral";
}

export function getStreakThreshold(consecutiveWins: number): boolean {
    // Determines if a streak is "hot" (e.g., triggers the flame icon)
    return consecutiveWins >= 3;
}
