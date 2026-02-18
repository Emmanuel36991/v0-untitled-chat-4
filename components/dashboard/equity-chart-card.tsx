"use client"

import React from "react"
import { addMonths, subMonths, format } from "date-fns"
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    LineChart,
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    CartesianGrid,
    BarChart,
    Bar,
    Cell,
    ReferenceLine,
} from "recharts"
import type { Trade } from "@/types"
import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap"
import { CustomChartTooltip } from "@/components/dashboard/custom-chart-tooltip"
import { EmptyState } from "@/components/empty-state"
import { Inbox } from "lucide-react"

interface ChartDataPoint {
    date: string
    fullDate: string
    cumulativePnl: number
    tradePnl: number
    volume: number
    outcome: string
}

interface EquityChartCardProps {
    chartData: ChartDataPoint[]
    chartViewMode: "cumulative" | "daily" | "calendar"
    setChartViewMode: (mode: "cumulative" | "daily" | "calendar") => void
    filteredTrades: Trade[]
    calendarMonth: Date
    setCalendarMonth: (date: Date) => void
    displayFormat: string
    selectedCurrency: string
    convert: (value: number) => number
}

export function EquityChartCard({
    chartData,
    chartViewMode,
    setChartViewMode,
    filteredTrades,
    calendarMonth,
    setCalendarMonth,
    displayFormat,
    selectedCurrency,
    convert,
}: EquityChartCardProps) {
    return (
        <Card
            className={cn(
                "border-0 shadow-lg backdrop-blur-sm overflow-hidden flex flex-col ring-1 ring-border card-enhanced glass-card",
                chartViewMode === "calendar" ? "h-auto" : "h-[550px]"
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Equity Curve
                    </CardTitle>
                    <CardDescription>
                        Performance analysis over selected period
                    </CardDescription>
                </div>

                <Tabs
                    value={chartViewMode}
                    onValueChange={(v: any) => setChartViewMode(v)}
                    className="w-auto"
                >
                    <TabsList className="h-9 p-1 bg-muted/50 backdrop-blur-sm rounded-lg border border-border/40">
                        <TabsTrigger
                            value="cumulative"
                            className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
                        >
                            Growth
                        </TabsTrigger>
                        <TabsTrigger
                            value="daily"
                            className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
                        >
                            Daily P&L
                        </TabsTrigger>
                        <TabsTrigger
                            value="calendar"
                            className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
                        >
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>

            <CardContent
                className={cn(
                    "pt-6 pl-0",
                    chartViewMode === "calendar" ? "h-auto pb-3" : "h-[420px]"
                )}
            >
                {chartViewMode === "calendar" ? (
                    <div className="px-6 pb-3">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                                className="h-8 px-3"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold">
                                    {format(calendarMonth, "MMMM yyyy")}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCalendarMonth(new Date())}
                                    className="h-7 px-2 text-xs"
                                >
                                    Today
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                                className="h-8 px-3"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <CalendarHeatmap
                            trades={filteredTrades}
                            currentDate={calendarMonth}
                        />
                    </div>
                ) : chartData.length === 0 ? (
                    <EmptyState
                        icon={Inbox}
                        title="No Trading Data"
                        description="Log your first trade to see your equity curve and performance charts come to life."
                        action={{ label: "Log your first trade", href: "/add-trade" }}
                        className="h-full"
                    />
                ) : (
                    <div className="w-full h-full px-6">
                        <ResponsiveContainer width="100%" height="100%">
                            {(() => {
                                return chartViewMode === "cumulative" ? (
                                    <AreaChart
                                        data={chartData}
                                        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="colorPnLMain"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--primary)"
                                                    stopOpacity={0.2}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--primary)"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="var(--border)"
                                            opacity={0.2}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                            minTickGap={40}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                            tickFormatter={(value) => {
                                                if (displayFormat === "dollars") {
                                                    const symbol = selectedCurrency === "USD" ? "$" : selectedCurrency === "EUR" ? "€" : selectedCurrency === "GBP" ? "£" : selectedCurrency === "JPY" ? "¥" : "$"
                                                    return `${symbol}${convert(value).toFixed(0)}`
                                                } else if (displayFormat === "percentage") {
                                                    return `${value.toFixed(1)}%`
                                                } else if (displayFormat === "privacy") {
                                                    return "•••"
                                                }
                                                return `$${value.toFixed(0)}`
                                            }}
                                            width={60}
                                        />
                                        <RechartsTooltip
                                            content={<CustomChartTooltip currency currencyCode={selectedCurrency} convertFn={convert} />}
                                            cursor={{
                                                stroke: "var(--primary)",
                                                strokeWidth: 1,
                                                strokeDasharray: "4 4",
                                            }}
                                        />
                                        <ReferenceLine
                                            y={0}
                                            stroke="var(--muted-foreground)"
                                            strokeDasharray="3 3"
                                            opacity={0.5}
                                        />
                                        <Area
                                            name="Cumulative P&L"
                                            type="monotone"
                                            dataKey="cumulativePnl"
                                            stroke="var(--primary)"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorPnLMain)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                ) : (
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="var(--border)"
                                            opacity={0.2}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                            minTickGap={40}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                            tickFormatter={(value) => `$${value}`}
                                            width={60}
                                        />
                                        <RechartsTooltip
                                            content={<CustomChartTooltip currency />}
                                            cursor={{ fill: "transparent" }}
                                        />
                                        <ReferenceLine
                                            y={0}
                                            stroke="var(--muted-foreground)"
                                            opacity={0.5}
                                        />
                                        <Bar
                                            name="Daily P&L"
                                            dataKey="tradePnl"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={60}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.tradePnl >= 0 ? "var(--profit)" : "var(--loss)"
                                                    }
                                                    fillOpacity={0.9}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                )
                            })()}
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
