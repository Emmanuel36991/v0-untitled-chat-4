"use client"

import React, { useState, useMemo } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  ArrowLeft, Clock, Target, BarChart2, Calendar as CalendarIcon, Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types"

interface JournalCalendarProps {
  trades: Trade[]
  dailyData: Array<{ date: string; pnl: number; trades: number }>
}

export function JournalCalendar({ trades, dailyData }: JournalCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [view, setView] = useState<"month" | "day">("month")

  // --- Derived State ---
  const monthStats = useMemo(() => {
    const monthKey = format(currentMonth, "yyyy-MM")
    const days = dailyData.filter(d => d.date.startsWith(monthKey))
    const totalPnL = days.reduce((acc, d) => acc + d.pnl, 0)
    const totalTrades = days.reduce((acc, d) => acc + d.trades, 0)
    const winRate = days.length ? (days.filter(d => d.pnl > 0).length / days.length) * 100 : 0
    return { totalPnL, totalTrades, winRate }
  }, [currentMonth, dailyData])

  const calendarGrid = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    const padding = Array(getDay(start)).fill(null)
    return { days, padding }
  }, [currentMonth])

  // --- Handlers ---
  const handleDaySelect = (day: Date) => {
    setSelectedDay(day)
    setView("day")
  }

  const handleBack = () => {
    setView("month")
    setTimeout(() => setSelectedDay(null), 300) // Clear after animation
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-[#0B0D12] overflow-hidden relative">
      <AnimatePresence mode="wait">

        {/* VIEW 1: MONTHLY HEATMAP */}
        {view === "month" && (
          <motion.div
            key="month-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-bold w-24 text-center">{format(currentMonth, "MMMM")}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm font-mono text-slate-400">{format(currentMonth, "yyyy")}</div>
              </div>

              <div className="flex gap-4 text-right">
                <div>
                  <p className="text-2xs uppercase font-bold text-slate-400">Net PnL</p>
                  <p className={cn("text-sm font-mono font-bold", monthStats.totalPnL >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    {monthStats.totalPnL >= 0 ? "+" : ""}${monthStats.totalPnL.toLocaleString()}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-2xs uppercase font-bold text-slate-400">Win Rate</p>
                  <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{monthStats.winRate.toFixed(0)}%</p>
                </div>
              </div>
            </div>

            {/* Grid */}
            <ScrollArea className="flex-1 p-6">
              <div className="grid grid-cols-7 gap-4 max-w-5xl mx-auto">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-2xs uppercase font-bold text-slate-400 pb-2">{day}</div>
                ))}

                {calendarGrid.padding.map((_, i) => <div key={`pad-${i}`} className="aspect-square" />)}

                {calendarGrid.days.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd")
                  const data = dailyData.find(d => d.date === dateStr)
                  const isToday = isSameDay(day, new Date())

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDaySelect(day)}
                      className={cn(
                        "relative aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all shadow-sm",
                        isToday ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950" : "hover:border-indigo-300 dark:hover:border-indigo-700",
                        !data ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800" :
                          data.pnl > 0 ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30" :
                            "bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-bold absolute top-3 left-3",
                        !data ? "text-slate-300" : "text-slate-500"
                      )}>{format(day, "d")}</span>

                      {data ? (
                        <>
                          <span className={cn(
                            "text-sm font-mono font-bold tracking-tight",
                            data.pnl > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          )}>
                            {data.pnl > 0 ? "+" : ""}{Math.abs(data.pnl) >= 1000 ? `${(data.pnl / 1000).toFixed(1)}k` : data.pnl}
                          </span>
                          <span className="text-2xs text-slate-400 font-medium px-1.5 py-0.5 bg-white/50 dark:bg-black/20 rounded-full">
                            {data.trades} trades
                          </span>
                        </>
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {/* VIEW 2: DAILY DOSSIER */}
        {view === "day" && selectedDay && (
          <motion.div
            key="day-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-full bg-white dark:bg-slate-950"
          >
            <div className="flex items-center gap-4 px-6 py-6 border-b border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={handleBack} className="group pl-2 pr-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {format(selectedDay, "EEEE, MMMM do")}
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <DailyDossier
                date={selectedDay}
                trades={trades.filter(t => isSameDay(new Date(t.date), selectedDay))}
              />
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DailyDossier({ date, trades }: { date: Date, trades: Trade[] }) {
  const stats = useMemo(() => {
    const pnl = trades.reduce((a, b) => a + b.pnl, 0)
    const wins = trades.filter(t => t.pnl > 0).length
    return {
      pnl,
      count: trades.length,
      winRate: trades.length ? (wins / trades.length) * 100 : 0
    }
  }, [trades])

  if (trades.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-4">
          <CalendarIcon className="w-10 h-10 opacity-20" />
        </div>
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No trading activity</p>
        <p className="text-sm opacity-60">This day is empty.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn("p-6 rounded-2xl border flex flex-col justify-between h-32", stats.pnl >= 0 ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100")}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net PnL</span>
          <span className={cn("text-4xl font-mono font-bold tracking-tighter", stats.pnl >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {stats.pnl >= 0 ? "+" : ""}${stats.pnl.toFixed(2)}
          </span>
        </div>
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-32">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Win Rate</span>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-mono font-bold text-slate-900 dark:text-white">{stats.winRate.toFixed(0)}%</span>
            <span className="text-sm text-slate-400 mb-1.5">{stats.count} Trades</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-32">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Best Setup</span>
          <div className="flex items-center gap-2 mt-auto">
            <Target className="w-5 h-5 text-indigo-500" />
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">Silver Bullet</span>
          </div>
        </div>
      </div>

      {/* Trade Feed */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session Log</h3>
        </div>

        <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
          {trades.map((trade) => (
            <div key={trade.id} className="relative pl-12">
              <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-slate-300 dark:bg-slate-700 z-10" />
              <div className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
                    trade.pnl >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  )}>
                    {trade.direction === "long" ? "L" : "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{trade.instrument}</span>
                      <Badge variant="secondary" className="text-2xs h-5">{trade.setup_name || "Discretionary"}</Badge>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{format(new Date(trade.date), "HH:mm:ss")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-mono font-bold", trade.pnl >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {trade.entry_price} <span className="text-slate-300">→</span> {trade.exit_price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
