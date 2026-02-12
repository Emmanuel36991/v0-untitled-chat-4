"use client"

import React, { useState } from "react"
import {
    Plus, Search, Edit2, MoreHorizontal,
    TrendingUp, Trophy, Layers, BookOpen,
    BarChart3,
    ChevronRight,
    Layers as LayersIcon
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { DEMO_STRATEGIES } from "@/lib/mock-demo-data"

// ---------- SPARKLINE ----------
function MiniEquityCurve({ data, positive }: { data: number[]; positive: boolean }) {
    const chartData = React.useMemo(() => {
        if (!data || data.length < 2) return [{ v: 0 }, { v: 1 }]
        return data.map((v) => ({ v }))
    }, [data])
    const color = positive ? "#10b981" : "#ef4444"

    return (
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`eq-${positive}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#eq-${positive})`} isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

// ---------- STAT PILL ----------
function StatPill({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub?: string; accent: string }) {
    return (
        <div className="flex items-center gap-3.5 p-4 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
            <div className={cn("p-2.5 rounded-xl ring-1", accent)}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
                {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

// ---------- STRATEGY CARD ----------
function StrategyCard({ strat }: { strat: any }) {
    const isProfitable = (strat.pnl || 0) >= 0
    const winRate = strat.win_rate || 0
    const setupCount = strat.setups?.length || 0
    const ruleCount = strat.rules?.length || 0

    return (
        <div className="group animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="h-full border-border bg-card overflow-hidden hover:border-primary/25 transition-all duration-200 flex flex-col relative">
                {/* Subtle equity curve background */}
                <div className="h-28 relative flex flex-col justify-between p-5 border-b border-border">
                    <MiniEquityCurve data={strat.equity_curve || []} positive={isProfitable} />

                    {/* Top row */}
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex gap-1.5">
                            {setupCount > 0 && (
                                <Badge variant="secondary" className="text-[10px] font-mono h-5 bg-primary/10 text-primary border-0">
                                    {setupCount} {setupCount === 1 ? "setup" : "setups"}
                                </Badge>
                            )}
                            {ruleCount > 0 && (
                                <Badge variant="secondary" className="text-[10px] font-mono h-5 bg-muted text-muted-foreground border-0">
                                    {ruleCount} rules
                                </Badge>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1">
                                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem disabled>
                                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Strategy name */}
                    <div className="relative z-10 mt-auto">
                        <h3 className="text-lg font-bold tracking-tight text-foreground truncate leading-tight">{strat.name}</h3>
                        {strat.description && (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{strat.description}</p>
                        )}
                    </div>
                </div>

                <CardContent className="p-0 flex-1 flex flex-col">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                        <div className="px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Win Rate</p>
                            <p className={cn("text-lg font-bold tabular-nums", winRate >= 50 ? "text-emerald-500" : winRate > 0 ? "text-amber-500" : "text-muted-foreground")}>{winRate}%</p>
                        </div>
                        <div className="px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trades</p>
                            <p className="text-lg font-bold text-foreground tabular-nums">{strat.trades_count || 0}</p>
                        </div>
                        <div className="px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net P&L</p>
                            <p className={cn("text-lg font-bold font-mono tabular-nums", isProfitable ? "text-emerald-500" : "text-rose-500")}>
                                {isProfitable ? "+" : ""}${Math.abs(strat.pnl || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Setup progress bar */}
                    {setupCount > 0 && (
                        <div className="px-4 py-3">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Setups</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{setupCount}</span>
                            </div>
                            <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-muted/50">
                                {(strat.setups || []).slice(0, 8).map((_: any, i: number) => (
                                    <div key={i} className="h-full flex-1 rounded-full bg-primary/50 first:bg-primary" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick-edit footer */}
                    <div className="mt-auto px-4 py-3 border-t border-border">
                        <button className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground cursor-not-allowed opacity-70">
                            <span className="flex items-center gap-1.5">
                                <Edit2 className="w-3 h-3" /> Open in Engine
                            </span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// ---------- MAIN PAGE ----------
export default function DemoPlaybookPage() {
    const strategies = DEMO_STRATEGIES
    const [searchQuery, setSearchQuery] = useState("")

    const totalPnL = strategies.reduce((acc, s) => acc + (s.pnl || 0), 0)
    const totalTrades = strategies.reduce((acc, s) => acc + (s.trades_count || 0), 0)
    const bestStrategy = strategies.length > 0
        ? strategies.reduce((prev, curr) => ((prev.win_rate || 0) > (curr.win_rate || 0) ? prev : curr), strategies[0])
        : null
    const avgWinRate = strategies.length > 0
        ? Math.round(strategies.reduce((acc, s) => acc + (s.win_rate || 0), 0) / strategies.length)
        : 0

    return (
        <div className="min-h-screen bg-transparent pb-20">
            {/* Header */}
            <div className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary hidden md:flex">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">Playbook <Badge variant="secondary" className="ml-2">Demo</Badge></h1>
                                <p className="text-[11px] text-muted-foreground hidden md:block">Your strategy library and trade systems.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 w-48 h-8 text-xs bg-card border-border"
                                />
                            </div>
                            <Button size="sm" className="gap-1.5 font-semibold shadow-sm h-8 pointer-events-none opacity-50">
                                <Plus className="w-4 h-4" /> New Strategy
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 space-y-8">

                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatPill icon={Layers} label="Strategies" value={String(strategies.length)} accent="bg-primary/10 text-primary ring-primary/20" />
                    <StatPill
                        icon={TrendingUp}
                        label="Total P&L"
                        value={`${totalPnL >= 0 ? "+" : "-"}$${Math.abs(totalPnL).toLocaleString()}`}
                        accent={totalPnL >= 0 ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20" : "bg-rose-500/10 text-rose-500 ring-rose-500/20"}
                    />
                    <StatPill icon={BarChart3} label="Total Trades" value={String(totalTrades)} sub={`${avgWinRate}% avg win rate`} accent="bg-sky-500/10 text-sky-500 ring-sky-500/20" />
                    <StatPill icon={Trophy} label="Top Performer" value={bestStrategy?.name || "N/A"} sub={bestStrategy ? `${bestStrategy.win_rate}% win rate` : undefined} accent="bg-amber-500/10 text-amber-500 ring-amber-500/20" />
                </div>

                {/* Strategy Cards */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Strategies</h2>
                        <span className="text-xs text-muted-foreground font-mono">{strategies.length} total</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {strategies.map((strat) => (
                            <StrategyCard
                                key={strat.id}
                                strat={strat}
                            />
                        ))}
                    </div>
                </section>

                {/* Ecosystem Maps Placeholder */}
                <section className="opacity-70 pointer-events-none grayscale">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <LayersIcon className="w-4 h-4 text-primary" /> Ecosystem Map
                        </h2>
                    </div>
                    <div className="w-full h-64 border-2 border-dashed border-muted rounded-xl flex items-center justify-center bg-card/20">
                        <p className="text-muted-foreground font-medium">Visual Strategy Map Available in Full Version</p>
                    </div>
                </section>
            </div>
        </div>
    )
}
