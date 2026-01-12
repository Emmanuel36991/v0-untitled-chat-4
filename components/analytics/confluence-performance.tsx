"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CandlestickChart, Clock, Activity, Layers, Ban, ListChecks, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Visual Styles (Must match Playbook)
const FACTOR_STYLES = {
  price: { label: "Price Action", icon: CandlestickChart, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  time: { label: "Time", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  indicator: { label: "Indicator", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
  structure: { label: "Structure", icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10" },
  execution: { label: "Risk", icon: Ban, color: "text-rose-500", bg: "bg-rose-500/10" },
  default: { label: "Rule", icon: ListChecks, color: "text-slate-500", bg: "bg-slate-500/10" }
}

interface ConfluenceStat {
  id: string
  text: string
  category: string
  count: number
  wins: number
  pnl: number
  winRate: number
}

export function ConfluencePerformance({ data }: { data: ConfluenceStat[] }) {
  // Sort data for different views
  const sortedByFrequency = [...data].sort((a, b) => b.count - a.count)
  const sortedByWinRate = [...data].filter(c => c.count >= 3).sort((a, b) => b.winRate - a.winRate) // Min 3 trades
  const sortedByPnL = [...data].sort((a, b) => b.pnl - a.pnl)

  const renderList = (items: ConfluenceStat[]) => (
    <div className="space-y-3">
      {items.map((item) => {
        const style = FACTOR_STYLES[item.category as keyof typeof FACTOR_STYLES] || FACTOR_STYLES.default
        const Icon = style.icon
        
        return (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className={cn("p-2 rounded-lg shrink-0", style.bg, style.color)}>
                  <Icon className="w-4 h-4" />
               </div>
               <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.text}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.count} trades</p>
               </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
               <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-mono font-bold", item.pnl >= 0 ? "text-emerald-600" : "text-rose-600")}>
                     {item.pnl >= 0 ? "+" : ""}${item.pnl.toLocaleString()}
                  </span>
                  <Badge variant="secondary" className={cn("text-[10px] h-5 px-1.5", item.winRate >= 50 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400")}>
                     {item.winRate.toFixed(0)}%
                  </Badge>
               </div>
               <div className="w-20 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", item.winRate >= 50 ? "bg-emerald-500" : "bg-slate-400")} style={{ width: `${item.winRate}%` }} />
               </div>
            </div>
          </div>
        )
      })}
      {items.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No sufficient data yet.</div>}
    </div>
  )

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center justify-between">
           <div>
              <CardTitle>Playbook Performance</CardTitle>
              <CardDescription>Analyze which confluences drive your edge.</CardDescription>
           </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="frequency" className="w-full">
           <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-4">
              <TabsTrigger value="frequency" className="text-xs">Most Used</TabsTrigger>
              <TabsTrigger value="winrate" className="text-xs">Best Win Rate</TabsTrigger>
              <TabsTrigger value="pnl" className="text-xs">Highest PnL</TabsTrigger>
           </TabsList>

           <ScrollArea className="h-[300px] pr-4">
              <TabsContent value="frequency" className="mt-0">{renderList(sortedByFrequency)}</TabsContent>
              <TabsContent value="winrate" className="mt-0">{renderList(sortedByWinRate)}</TabsContent>
              <TabsContent value="pnl" className="mt-0">{renderList(sortedByPnL)}</TabsContent>
           </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
