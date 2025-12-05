"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, ChevronRight, Play, CheckCircle2 } from "lucide-react"
import type { Tutorial } from "@/types/tutorial"
import type { TutorialProgress } from "@/types/tutorial"

interface TutorialCarouselItemProps {
  tutorial: Tutorial
  progress?: TutorialProgress
  onStart: (tutorialId: string) => void
  onResume?: (tutorialId: string) => void
}

export function TutorialCarouselItem({ tutorial, progress, onStart, onResume }: TutorialCarouselItemProps) {
  const isCompleted = progress?.status === "completed"
  const isInProgress = progress?.status === "in_progress"
  const showProgress = isInProgress || isCompleted

  const difficultyColors = {
    beginner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    intermediate: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const categoryIcons: Record<string, string> = {
    dashboard: "📊",
    trading: "📈",
    analytics: "📉",
    psychology: "🧠",
    community: "👥",
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border">
      {/* Header with icon */}
      <div className="h-12 bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between px-4">
        <span className="text-xl">{categoryIcons[tutorial.category] || "📚"}</span>
        {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
      </div>

      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2">{tutorial.title}</h3>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={difficultyColors[tutorial.difficulty]}>
            {tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1)}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {tutorial.estimatedDuration} min
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-foreground">{progress.progress_percentage}%</span>
            </div>
            <Progress value={progress.progress_percentage} className="h-2" />
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">{tutorial.description}</p>

        {/* Action Button */}
        <Button
          onClick={() => (isInProgress ? onResume?.(tutorial.id) : onStart(tutorial.id))}
          size="sm"
          className="w-full flex items-center justify-center gap-2 mt-2"
          variant={isCompleted ? "outline" : "default"}
          disabled={isCompleted}
        >
          <Play className="h-4 w-4" />
          {isCompleted ? "Completed" : isInProgress ? "Resume" : "Start"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
