"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Wallet,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Circle,
  X,
  ListChecks,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "concentrade-onboarding-dismissed"

interface OnboardingStep {
  id: string
  label: string
  description: string
  icon: React.ElementType
  href: string
  completed: boolean
  color: string
}

interface OnboardingChecklistProps {
  hasAccounts: boolean
  hasStrategies: boolean
  hasTrades: boolean
}

export function OnboardingChecklist({
  hasAccounts,
  hasStrategies,
  hasTrades,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(true) // default hidden to prevent flash
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    setDismissed(stored === "true")
  }, [])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, "true")
  }, [])

  // Don't render on server or while checking localStorage
  if (!mounted) return null

  // If all steps are complete, auto-dismiss
  const allComplete = hasAccounts && hasStrategies && hasTrades
  if (allComplete || dismissed) return null

  const steps: OnboardingStep[] = [
    {
      id: "account",
      label: "Create your first Trading Account",
      description: "Set up a portfolio to organize your trades",
      icon: Wallet,
      href: "/trades",
      completed: hasAccounts,
      color: "text-blue-500",
    },
    {
      id: "strategy",
      label: "Define a Strategy",
      description: "Build your trading playbook with rules and setups",
      icon: BookOpen,
      href: "/playbook",
      completed: hasStrategies,
      color: "text-purple-500",
    },
    {
      id: "trade",
      label: "Log your first Trade",
      description: "Record an execution to start tracking performance",
      icon: CandlestickPattern,
      href: "/add-trade",
      completed: hasTrades,
      color: "text-emerald-500",
    },
  ]

  const completedCount = steps.filter((s) => s.completed).length
  const progressPercent = Math.round((completedCount / steps.length) * 100)

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-gray-900/80 dark:to-purple-950/40 ring-1 ring-indigo-200/50 dark:ring-indigo-800/30">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

      <CardContent className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Getting Started
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete these steps to unlock your full trading journal
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 text-muted-foreground hover:text-foreground -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-5">
          <Progress value={progressPercent} className="h-2 flex-1 bg-indigo-100 dark:bg-indigo-900/40 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-500" />
          <span className="text-xs font-bold text-muted-foreground tabular-nums whitespace-nowrap">
            {completedCount}/{steps.length}
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-9">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <Link key={step.id} href={step.completed ? "#" : step.href}>
                <div
                  className={cn(
                    "group flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-200",
                    step.completed
                      ? "bg-emerald-50/60 dark:bg-emerald-900/10"
                      : "bg-white/60 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800/60 hover:shadow-sm cursor-pointer"
                  )}
                >
                  {/* Status indicator */}
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "p-1.5 rounded-lg shrink-0",
                      step.completed
                        ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        step.completed ? "text-emerald-500" : (step.icon === CandlestickPattern ? "" : step.color)
                      )}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        step.completed
                          ? "text-emerald-700 dark:text-emerald-400 line-through decoration-emerald-300 dark:decoration-emerald-700"
                          : "text-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow for incomplete */}
                  {!step.completed && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function CandlestickPattern({ className }: { className?: string }) {
  // Extract width/height if needed, but we pass className to svg
  // We want to ignore text-emerald-500 color if it's passed, so we use explicit stroke/fill colors
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Bearish candle (Red) */}
      <path d="M16 3v18" className="text-rose-500 stroke-current" strokeWidth="1.5" />
      <rect x="14" y="6" width="4" height="6" rx="1" className="text-rose-500 fill-current stroke-current" strokeWidth="1.5" />

      {/* Bullish candle (Green) */}
      <path d="M8 3v18" className="text-emerald-500 stroke-current" strokeWidth="1.5" />
      <rect x="6" y="12" width="4" height="6" rx="1" className="text-emerald-500 fill-current stroke-current" strokeWidth="1.5" />
    </svg>
  )
}
