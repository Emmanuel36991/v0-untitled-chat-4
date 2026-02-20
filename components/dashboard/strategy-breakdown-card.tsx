"use client"

import React from "react"
import { PieChartIcon } from "@/components/icons/system-icons"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
} from "recharts"
import { CustomChartTooltip } from "@/components/dashboard/custom-chart-tooltip"

interface StrategyEntry {
    name: string
    pnl: number
    wins: number
    total: number
    winRate: number
    chartValue: number
}

interface StrategyColor {
    bg: string
    stroke: string
}

interface StrategyBreakdownCardProps {
    strategyData: StrategyEntry[]
    strategyColors: StrategyColor[]
}

export function StrategyBreakdownCard({
    strategyData,
    strategyColors,
}: StrategyBreakdownCardProps) {
    return (
        <Card className="flex-1 border-0 shadow-lg ring-1 ring-border backdrop-blur-sm card-enhanced glass-card">
            <CardHeader className="pb-2 border-b border-border">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-chart-5" />
                    Strategy Edge
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[250px] p-6">
                <div className="relative w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                            <Pie
                                data={strategyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={85}
                                paddingAngle={4}
                                dataKey="chartValue"
                                cornerRadius={4}
                            >
                                {strategyData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            strategyColors[index % strategyColors.length]
                                                .stroke
                                        }
                                        strokeWidth={0}
                                    />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<CustomChartTooltip currency />} />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold tracking-tighter text-foreground">
                            {strategyData.length}
                        </span>
                        <span className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
                            Setups
                        </span>
                    </div>
                </div>

                <div className="w-full mt-6 space-y-3">
                    {strategyData.slice(0, 4).map((strategy, idx) => {
                        const color = strategyColors[idx % strategyColors.length]
                        return (
                            <div
                                key={strategy.name}
                                className="flex items-center justify-between gap-4 text-sm group p-2 rounded-lg hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-border/40"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div
                                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.bg}`}
                                    />
                                    <span className="font-medium text-foreground/80 truncate" title={strategy.name}>
                                        {strategy.name}
                                    </span>
                                </div>
                                <div className="text-right flex items-center gap-3 shrink-0">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {strategy.winRate.toFixed(0)}% WR
                                    </span>
                                    <span
                                        className={cn(
                                            "font-mono font-bold",
                                            strategy.pnl >= 0
                                                ? "text-profit"
                                                : "text-loss"
                                        )}
                                    >
                                        ${strategy.pnl.toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
