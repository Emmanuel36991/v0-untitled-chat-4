"use client"

import React from "react"
import SimplePsychologyJournal from "@/components/journal/simple-psychology-journal"
import PsychologyAnalytics from "@/components/journal/psychology-analytics"
import type { Trade } from "@/types"
import {
  Brain,
  Target,
  CalendarDays,
  ShieldAlert,
} from "lucide-react"
import { PulseIcon } from "@/components/icons/system-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PsychologyStats {
  disciplineScore: number
  dominantEmotion: string
  winRate: number
  totalEntries: number
  currentStreak: number
  focusScore: number
  riskAlert: string
  totalJournalEntries: number
}

interface Props {
  stats: PsychologyStats | null
  trades: Trade[]
}

interface HUDCardProps {
  label: string
  value: string | number
  subtext?: string
  icon: React.ElementType
  trend?: string
  trendType?: "positive" | "warning" | "neutral"
}

function HUDCard({ label, value, subtext, icon: Icon, trend, trendType = "neutral" }: HUDCardProps) {
  return (
    <Card className="relative overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 group hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground tracking-tight font-mono">{value}</span>
          {subtext && <span className="text-xs text-muted-foreground font-medium">{subtext}</span>}
        </div>
        {trend && (
          <div className="mt-2.5">
            <Badge
              className={cn(
                "text-[10px] font-mono font-medium",
                trendType === "positive" && "badge-animated bg-success/15 text-success border border-success/20",
                trendType === "warning" && "badge-animated bg-warning/15 text-warning border border-warning/20",
                trendType === "neutral" && "badge-animated bg-info/15 text-info border border-info/20"
              )}
            >
              {trend}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function PsychologyPageClient({ stats, trades, initialJournalEntries }: Props & { initialJournalEntries: any[] }) {
  const [entries, setEntries] = React.useState(initialJournalEntries || [])

  const handleAddEntry = (newEntry: any) => {
    // Optimistic UI: instant front-end update
    setEntries(prev => [newEntry, ...prev])
  }

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              Trader Mindset Journal
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Track your emotional state and optimize performance.
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] font-mono text-muted-foreground bg-muted/40 border border-border/40 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            JOURNAL ACTIVE
          </div>
        </div>

        {/* HUD Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
          <HUDCard
            label="Current Streak"
            value={stats?.currentStreak || "0"}
            subtext="DAYS"
            icon={PulseIcon}
            trend={
              stats && stats.currentStreak >= 7
                ? `+${Math.floor(stats.currentStreak / 7)} weeks`
                : stats && stats.currentStreak > 0
                  ? "Building"
                  : "Start Today"
            }
            trendType={stats && stats.currentStreak >= 7 ? "positive" : "warning"}
          />
          <HUDCard
            label="Focus Score"
            value={stats?.focusScore ? stats.focusScore.toFixed(1) : "0.0"}
            subtext="/ 10.0"
            icon={Target}
            trend={
              stats && stats.focusScore >= 7
                ? "Excellent"
                : stats && stats.focusScore >= 5
                  ? "Good"
                  : "Improve"
            }
            trendType={
              stats && stats.focusScore >= 7
                ? "positive"
                : stats && stats.focusScore >= 5
                  ? "neutral"
                  : "warning"
            }
          />
          <HUDCard
            label="Risk Alert"
            value={stats?.riskAlert || "None"}
            subtext={stats?.riskAlert && stats.riskAlert !== "None" ? "DETECTED" : "CLEAR"}
            icon={ShieldAlert}
            trend={stats?.riskAlert && stats.riskAlert !== "None" ? "High Risk" : "Low Risk"}
            trendType={stats?.riskAlert && stats.riskAlert !== "None" ? "warning" : "positive"}
          />
          <HUDCard
            label="Total Entries"
            value={entries.length}
            subtext="LOGS"
            icon={CalendarDays}
            trend={
              entries.length >= 30
                ? "+30 Logs"
                : entries.length > 0
                  ? `+${entries.length}`
                  : "No Data"
            }
            trendType="neutral"
          />
        </div>

        <Separator className="my-2" />

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">

          {/* Left Column: Journal Input (40%) */}
          <div className="lg:col-span-5 w-full animate-fade-in-up stagger-2">
            <div className="sticky top-6">
              <SimplePsychologyJournal
                entries={entries}
                onAddEntry={handleAddEntry}
                onDeleteEntry={handleDeleteEntry}
              />
            </div>
          </div>

          {/* Right Column: Analytics (60%) */}
          <div className="lg:col-span-7 w-full h-full animate-fade-in-up stagger-3">
            <PsychologyAnalytics
              disciplineScore={stats?.disciplineScore || 0}
              dominantEmotion={stats?.dominantEmotion || "Unknown"}
              winRate={stats?.winRate || 0}
              entries={entries}
              trades={trades}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
