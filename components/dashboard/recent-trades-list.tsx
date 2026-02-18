"use client"

import React from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    ChevronRight,
    ArrowRight,
    Calendar,
    Inbox,
} from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/empty-state"
import type { Trade } from "@/types"

interface RecentTradesListProps {
    trades: Trade[]
    calculatePnL: (
        instrument: string,
        direction: "long" | "short",
        entry: number,
        exit: number,
        size: number
    ) => { adjustedPnL: number }
    getStrategyIcon: (name: string) => React.ElementType
}

export function RecentTradesList({
    trades,
    calculatePnL,
    getStrategyIcon,
}: RecentTradesListProps) {
    return (
        <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden bg-card ring-1 ring-border card-enhanced glass-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/30 py-5">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-chart-1" />
                        Recent Execution Log
                    </CardTitle>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="group border-border hover:bg-muted"
                >
                    <Link href="/trades" className="text-xs font-semibold">
                        View All{" "}
                        <ArrowRight className="ml-2 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                {trades.slice(0, 5).map((trade) => {
                    const isWin = trade.outcome === "win"
                    const isLong = trade.direction === "long"
                    const StrategyIcon = getStrategyIcon(trade.setup_name || "")
                    const tradePnl = trade.pnl !== undefined
                        ? trade.pnl
                        : calculatePnL(trade.instrument, trade.direction, trade.entry_price, trade.exit_price, trade.size).adjustedPnL

                    return (
                        <div
                            key={trade.id}
                            className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted/50 transition-all border-b last:border-0 border-border group cursor-pointer hover:pl-6"
                        >
                            <div className="flex items-center gap-5">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-colors",
                                        isWin
                                            ? "bg-profit/10 border-profit/20 text-profit"
                                            : "bg-loss/10 border-loss/20 text-loss"
                                    )}
                                >
                                    {isLong ? (
                                        <ArrowUpRight className="w-6 h-6" />
                                    ) : (
                                        <ArrowDownRight className="w-6 h-6" />
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5">
                                        <span className="font-bold text-foreground text-base">
                                            {trade.instrument}
                                        </span>
                                        <Badge
                                            variant={isLong ? "default" : "destructive"}
                                            className={cn(
                                                "text-xs px-1.5 py-0 h-5 font-bold uppercase tracking-wide opacity-80",
                                                isLong ? "bg-long" : "bg-short"
                                            )}
                                        >
                                            {trade.direction}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(trade.date), "MMM dd • HH:mm")}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                                            <StrategyIcon className="w-3 h-3" />
                                            {trade.setup_name || "Discretionary"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="hidden md:block text-right space-y-1">
                                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                                        Prices
                                    </p>
                                    <p className="text-xs font-mono font-medium text-foreground/80">
                                        <span className="opacity-60">
                                            {trade.entry_price}
                                        </span>{" "}
                                        <span className="mx-1">→</span>{" "}
                                        <span>{trade.exit_price}</span>
                                    </p>
                                </div>

                                <div className="text-right min-w-[90px] space-y-1">
                                    <p
                                        className={cn(
                                            "font-bold text-base font-mono",
                                            isWin
                                                ? "text-profit"
                                                : "text-loss"
                                        )}
                                    >
                                        {tradePnl > 0 ? "+" : ""}
                                        ${tradePnl.toFixed(2)}
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-xs h-4 px-1.5 border-0 uppercase font-bold",
                                            isWin
                                                ? "bg-profit/15 text-profit"
                                                : "bg-loss/15 text-loss"
                                        )}
                                    >
                                        {trade.outcome}
                                    </Badge>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-muted text-muted-foreground"
                                    asChild
                                >
                                    <Link href={`/trade-details/${trade.id}`}>
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )
                })}

                {trades.length === 0 && (
                    <EmptyState
                        icon={Inbox}
                        title="No recent executions"
                        description="Trades logged within your selected time period will appear here."
                        action={{ label: "Log your first trade", href: "/add-trade" }}
                        compact
                    />
                )}
            </CardContent>
        </Card>
    )
}
