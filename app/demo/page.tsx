"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Percent,
  ArrowUpRight,
  Filter,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts"
import { DEMO_EQUITY_DATA, DEMO_RECENT_TRADES } from "@/lib/mock-demo-data"
import { cn } from "@/lib/utils"

const KPICard = ({ title, value, subValue, icon: Icon, trend, trendValue, colorClass }: any) => {
  return (
    <Card className="relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 backdrop-blur-xl hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2.5 rounded-xl bg-opacity-10 transition-transform group-hover:scale-110", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <Badge variant="secondary" className={cn("font-mono text-xs", trend === "up" ? "text-green-600 bg-green-500/10" : "text-red-600 bg-red-500/10")}>
              {trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {trendValue}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight">{value}</span>
            {subValue && <span className="text-sm text-muted-foreground">{subValue}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Icon wrapper for Scale (Avg Win/Loss)
const ScaleIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
)

export default function DemoPage() {
  const [timeframe, setTimeframe] = useState("30d")

  return (
    <main className="container mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back, Demo User. Here's what's happening with your trading today.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          {["7d", "30d", "90d", "YTD"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                timeframe === tf
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total P&L"
          value="+$4,250.00"
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          colorClass="bg-green-500 text-green-500"
        />
        <KPICard
          title="Win Rate"
          value="68%"
          subValue="29W - 13L"
          icon={Activity}
          trend="up"
          trendValue="+2.1%"
          colorClass="bg-blue-500 text-blue-500"
        />
        <KPICard
          title="Profit Factor"
          value="2.10"
          icon={Percent}
          trend="up"
          trendValue="+0.15"
          colorClass="bg-purple-500 text-purple-500"
        />
        <KPICard
          title="Avg Win / Loss"
          value="$350"
          subValue="/ -$150"
          icon={ScaleIcon}
          trend="neutral"
          colorClass="bg-orange-500 text-orange-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Equity Chart - Spans 2 cols */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Equity Curve</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-3.5 w-3.5 mr-2" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="h-3.5 w-3.5 mr-2" /> Export
              </Button>
            </div>
          </div>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm">
            <CardContent className="p-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DEMO_EQUITY_DATA}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderColor: "#374151",
                        color: "#f3f4f6",
                        borderRadius: "0.5rem"
                      }}
                      itemStyle={{ color: "#10b981" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades - Spans 1 col */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Trades</h2>
            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 h-8">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm h-[450px] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium">Symbol</th>
                    <th className="px-4 py-3 font-medium">Setup</th>
                    <th className="px-4 py-3 font-medium text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {DEMO_RECENT_TRADES.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{trade.symbol}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className={trade.side === "Long" ? "text-green-500" : "text-red-500"}>
                            {trade.side}
                          </span>
                          <span>•</span>
                          <span>{trade.date.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-normal text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {trade.setup}
                        </Badge>
                      </td>
                      <td className={cn("px-4 py-3 text-right font-mono font-medium", trade.pnl > 0 ? "text-green-500" : "text-red-500")}>
                        {trade.pnl > 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Promo / Call to Action specific to Demo */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-1">Like what you see?</h3>
            <p className="text-sm text-indigo-100 mb-3">
              Start your own trading journal today and get professional analytics instantly.
            </p>
            <Button asChild size="sm" variant="secondary" className="w-full font-semibold shadow-md hover:scale-[1.02] transition-transform">
              <Link href="/signup">
                Create Free Account
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </main>
  )
}
