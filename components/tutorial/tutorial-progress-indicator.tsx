"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock } from "lucide-react"

interface TutorialProgressIndicatorProps {
  completionPercentage: number
  totalTutorials: number
  completedTutorials: number
  showCompact?: boolean
}

export function TutorialProgressIndicator({
  completionPercentage,
  totalTutorials,
  completedTutorials,
  showCompact = false,
}: TutorialProgressIndicatorProps) {
  if (showCompact) {
    return (
      <div className="flex items-center gap-2">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative">
          <svg width="40" height="40" viewBox="0 0 40 40" className="transform -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" />
            <motion.circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - completionPercentage / 100)}`}
              strokeLinecap="round"
              transition={{ duration: 0.6 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold">{completionPercentage}%</span>
          </div>
        </motion.div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">
            {completedTutorials}/{totalTutorials}
          </span>
          <span className="text-xs text-muted-foreground">completed</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Your Learning Progress
        </h3>
        <Badge variant="secondary">
          {completedTutorials}/{totalTutorials} Completed
        </Badge>
      </div>

      {/* Progress circle and stats */}
      <div className="flex items-center gap-6">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#gradient-large)"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
              strokeLinecap="round"
              transition={{ duration: 0.6 }}
            />
            <defs>
              <linearGradient id="gradient-large" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={completionPercentage}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-foreground"
            >
              {completionPercentage}%
            </motion.span>
            <span className="text-xs text-muted-foreground">complete</span>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm">
              <span className="font-semibold">{completedTutorials}</span>
              <span className="text-muted-foreground"> tutorials completed</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm">
              <span className="font-semibold">{totalTutorials - completedTutorials}</span>
              <span className="text-muted-foreground"> remaining</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Keep learning to unlock advanced features and improve your trading skills.
          </p>
        </div>
      </div>
    </div>
  )
}
