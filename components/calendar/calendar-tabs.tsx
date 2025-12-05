"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradingCalendar } from "./trading-calendar"
import { TradeDetailsTab } from "./trade-details-tab"
import { Calendar, BarChart3, TrendingUp } from "lucide-react"
import type { Trade } from "@/types"

interface CalendarTabsProps {
  trades: Trade[]
  dailyData: Array<{ date: string; pnl: number; trades: number }>
}

export function CalendarTabs({ trades, dailyData }: CalendarTabsProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTrades, setSelectedTrades] = useState<Trade[]>([])
  const [activeTab, setActiveTab] = useState("calendar")

  const handleDateSelect = (date: string, dayTrades: Trade[]) => {
    setSelectedDate(date)
    setSelectedTrades(dayTrades)
    // Auto-switch to trade details tab when a date is selected
    setActiveTab("details")
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* Header with premium styling */}
      <div className="relative z-10 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Trade Calendar</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {dailyData.length > 0 ? `${dailyData.length} trading days` : "No trading data"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation with smooth styling */}
      <div className="relative z-10 px-6 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100/60 dark:bg-slate-700/60 p-1 rounded-xl backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60">
            <TabsTrigger
              value="calendar"
              className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all duration-300 rounded-lg"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-semibold">Calendar</span>
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all duration-300 rounded-lg"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-semibold">Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md transition-all duration-300 rounded-lg"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-semibold">Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* Calendar View Tab */}
          <TabsContent value="calendar" className="mt-6 space-y-4">
            <TradingCalendar trades={trades} onDateSelect={handleDateSelect} />
          </TabsContent>

          {/* Trade Details Tab */}
          <TabsContent value="details" className="mt-6">
            {selectedDate && selectedTrades.length > 0 ? (
              <TradeDetailsTab date={selectedDate} trades={selectedTrades} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium text-center">
                  Select a date from the calendar to view trade details
                </p>
              </div>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedDate && selectedTrades.length > 0 ? (
                <>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Total Trades
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{selectedTrades.length}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Wins
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {selectedTrades.filter((t) => t.outcome === "win").length}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Losses
                    </p>
                    <p className="text-3xl font-bold text-rose-600">
                      {selectedTrades.filter((t) => t.outcome === "loss").length}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Win Rate
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedTrades.length > 0
                        ? (
                            (selectedTrades.filter((t) => t.outcome === "win").length / selectedTrades.length) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Total P&L
                    </p>
                    <p
                      className={`text-3xl font-bold ${selectedTrades.reduce((sum, t) => sum + t.pnl, 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      ${selectedTrades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Avg P&L
                    </p>
                    <p
                      className={`text-3xl font-bold ${(selectedTrades.reduce((sum, t) => sum + t.pnl, 0) / selectedTrades.length) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      ${(selectedTrades.reduce((sum, t) => sum + t.pnl, 0) / selectedTrades.length).toFixed(2)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 px-6">
                  <TrendingUp className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-center">
                    Select a date to view performance statistics
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="relative z-10 px-6 pb-6 pt-2" />
    </div>
  )
}
