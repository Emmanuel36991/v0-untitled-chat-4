import { DollarSign, ArrowUpRight, ArrowDownRight, Minus, Scale, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface TradeSummaryBarProps {
    pnl: number | null
    riskReward: number | null
    direction: string
    entryPrice: number
    stopLoss: number
    size: number
}

export const TradeSummaryBar = ({
    pnl,
    riskReward,
    direction,
    entryPrice,
    stopLoss,
    size,
}: TradeSummaryBarProps) => {
    const hasPrice = entryPrice > 0
    const hasPnl = pnl !== null && pnl !== 0
    const outcome = pnl === null ? null : pnl > 0 ? "WIN" : pnl < 0 ? "LOSS" : "BE"

    // Calculate risk in dollars
    const riskDollars = (entryPrice && stopLoss && size)
        ? Math.abs(entryPrice - stopLoss) * size
        : null

    if (!hasPrice && !hasPnl) return null

    return (
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/30 dark:bg-[oklch(0.11_0.02_264)] backdrop-blur-sm">
            {/* Subtle top accent line */}
            <div className={cn(
                "absolute top-0 left-0 right-0 h-[2px] transition-colors duration-500",
                hasPnl
                    ? pnl! > 0 ? "bg-profit" : pnl! < 0 ? "bg-loss" : "bg-muted-foreground/30"
                    : "bg-border/50"
            )} />

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/40">
                {/* PnL Cell */}
                <div className="px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Est. P&L
                    </span>
                    <span className={cn(
                        "font-mono text-lg font-black tracking-tight transition-colors duration-300",
                        hasPnl
                            ? pnl! > 0 ? "text-profit" : pnl! < 0 ? "text-loss" : "text-muted-foreground"
                            : "text-muted-foreground/40"
                    )}>
                        {hasPnl ? (
                            <>
                                {pnl! > 0 ? "+" : ""}{pnl!.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </>
                        ) : (
                            "—"
                        )}
                    </span>
                </div>

                {/* Outcome Cell */}
                <div className="px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
                        {outcome === "WIN" ? <ArrowUpRight className="w-3 h-3" /> : outcome === "LOSS" ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        Outcome
                    </span>
                    <div className="flex items-center gap-2">
                        {outcome ? (
                            <span className={cn(
                                "font-mono text-xs font-black px-2 py-0.5 rounded-md tracking-wider transition-colors duration-300",
                                outcome === "WIN" && "bg-profit/15 text-profit",
                                outcome === "LOSS" && "bg-loss/15 text-loss",
                                outcome === "BE" && "bg-muted text-muted-foreground"
                            )}>
                                {outcome}
                            </span>
                        ) : (
                            <span className="font-mono text-lg text-muted-foreground/40">—</span>
                        )}
                    </div>
                </div>

                {/* R:R Cell */}
                <div className="px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
                        <Scale className="w-3 h-3" /> Risk : Reward
                    </span>
                    <span className={cn(
                        "font-mono text-lg font-black tracking-tight transition-colors duration-300",
                        riskReward !== null
                            ? riskReward >= 2 ? "text-profit" : riskReward >= 1 ? "text-warning" : "text-loss"
                            : "text-muted-foreground/40"
                    )}>
                        {riskReward !== null ? (
                            <>1 : {riskReward.toFixed(1)}</>
                        ) : (
                            "—"
                        )}
                    </span>
                </div>

                {/* Risk $ Cell */}
                <div className="px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Risk
                    </span>
                    <span className={cn(
                        "font-mono text-lg font-black tracking-tight transition-colors duration-300",
                        riskDollars !== null ? "text-foreground" : "text-muted-foreground/40"
                    )}>
                        {riskDollars !== null ? (
                            <>${riskDollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                        ) : (
                            "—"
                        )}
                    </span>
                </div>
            </div>
        </div>
    )
}
