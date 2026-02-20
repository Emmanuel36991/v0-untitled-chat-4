"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CandlestickChart, Clock, Activity, Layers, Ban, ListChecks, TrendingUp, TrendingDown, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// Visual Styles (Must match Playbook)
const FACTOR_STYLES = {
   price: { label: "Price Action", icon: CandlestickChart, color: "text-emerald-500", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" },
   time: { label: "Time", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 dark:bg-amber-500/20" },
   indicator: { label: "Indicator", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10 dark:bg-blue-500/20" },
   structure: { label: "Structure", icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10 dark:bg-purple-500/20" },
   execution: { label: "Risk", icon: Ban, color: "text-rose-500", bg: "bg-rose-500/10 dark:bg-rose-500/20" },
   default: { label: "Rule", icon: ListChecks, color: "text-slate-500", bg: "bg-slate-500/10 dark:bg-slate-500/20" }
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
   const sortedByFrequency = [...data].sort((a, b) => b.count - a.count)
   const sortedByWinRate = [...data].filter(c => c.count >= 3).sort((a, b) => b.winRate - a.winRate) // Min 3 trades
   const sortedByPnL = [...data].sort((a, b) => b.pnl - a.pnl)

   const renderList = (items: ConfluenceStat[]) => (
      <div className="space-y-3 relative min-h-[200px]">
         <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
               const style = FACTOR_STYLES[item.category as keyof typeof FACTOR_STYLES] || FACTOR_STYLES.default
               const Icon = style.icon

               return (
                  <motion.div
                     layout
                     initial={{ opacity: 0, y: 15, scale: 0.98 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                     transition={{ duration: 0.3, delay: index * 0.05, type: "spring", bounce: 0.3 }}
                     whileHover={{ y: -2, scale: 1.01, transition: { duration: 0.2 } }}
                     whileTap={{ scale: 0.98 }}
                     key={item.id}
                     className="flex items-center justify-between p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
                  >
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn("p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110", style.bg, style.color)}>
                           <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.text}</p>
                           <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium">{item.count} trades</p>
                        </div>
                     </div>

                     <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2">
                           <span className={cn("text-xs font-mono font-bold tracking-tight", item.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                              {item.pnl >= 0 ? "+" : ""}${item.pnl.toLocaleString()}
                           </span>
                           <Badge variant="secondary" className={cn("text-2xs h-5 px-1.5 border backdrop-blur-sm", item.winRate >= 50 ? "bg-emerald-100/50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30" : "bg-slate-100/50 text-slate-600 border-slate-200/50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50")}>
                              {item.winRate.toFixed(0)}%
                           </Badge>
                        </div>
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.winRate}%` }}
                              transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                              className={cn("h-full rounded-full", item.winRate >= 50 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-400 dark:bg-slate-500")}
                           />
                        </div>
                     </div>
                  </motion.div>
               )
            })}
         </AnimatePresence>

         {items.length === 0 && (
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 py-8"
            >
               <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-3"
               >
                  <Inbox className="w-6 h-6 text-slate-400 dark:text-slate-500" />
               </motion.div>
               <p className="text-sm font-medium">No sufficient data yet.</p>
               <p className="text-xs text-slate-500 mt-1">Record more trades to see insights.</p>
            </motion.div>
         )}
      </div>
   )

   return (
      <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-black/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden relative">
         <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
         <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="text-lg font-bold">Playbook Performance</CardTitle>
                  <CardDescription className="font-medium text-slate-500">Analyze which confluences drive your edge.</CardDescription>
               </div>
            </div>
         </CardHeader>
         <CardContent>
            <Tabs defaultValue="frequency" className="w-full">
               <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md p-1 rounded-xl mb-4 border border-slate-200/50 dark:border-slate-700/50">
                  <TabsTrigger value="frequency" className="text-xs rounded-lg transition-all data-[state=active]:shadow-sm">Most Used</TabsTrigger>
                  <TabsTrigger value="winrate" className="text-xs rounded-lg transition-all data-[state=active]:shadow-sm">Best Win Rate</TabsTrigger>
                  <TabsTrigger value="pnl" className="text-xs rounded-lg transition-all data-[state=active]:shadow-sm">Highest PnL</TabsTrigger>
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
