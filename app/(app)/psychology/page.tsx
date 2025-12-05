"use client"

import { useState } from "react"
import SimplePsychologyJournal from "@/components/journal/simple-psychology-journal"
import PsychologyAnalytics from "@/components/journal/psychology-analytics"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LayoutDashboard, BookText, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils" // Assuming you have a cn utility, otherwise standard string implementation fits

export default function PsychologyPage() {
  const [activeTab, setActiveTab] = useState<"analytics" | "entries">("analytics")

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Subtle Background Pattern - Professional & Minimal */}
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#444cf7_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-10">
        
        {/* --- Header Section: Clean, Typographic, Purposeful --- */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span>Trading Psychology</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Master Your Mindset.
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Understanding the "why" behind your trades is just as important as the "how". 
              Track your emotional state and build the discipline needed for consistency.
            </p>
          </div>

          <div className="flex items-start pt-2">
            <Link href="/trades">
              <Button 
                variant="ghost" 
                className="group text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 -ml-4 md:ml-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* --- Tab Navigation: Segmented Control Style --- */}
        <div className="space-y-6">
          <div className="inline-flex p-1 bg-slate-200/60 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-out",
                activeTab === "analytics"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Analytics Overview
            </button>
            <button
              onClick={() => setActiveTab("entries")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-out",
                activeTab === "entries"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              )}
            >
              <BookText className="h-4 w-4" />
              Journal Entries
            </button>
          </div>

          {/* --- Main Content Area --- */}
          <div className="relative min-h-[500px]">
            {activeTab === "analytics" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Assuming the component inside handles its own card styling, 
                    but we ensure the wrapper is clean */}
                <PsychologyAnalytics />
              </div>
            )}
            
            {activeTab === "entries" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SimplePsychologyJournal />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
