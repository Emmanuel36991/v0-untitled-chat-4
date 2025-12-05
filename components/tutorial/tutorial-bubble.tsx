"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { TutorialStep } from "@/types/tutorial"

interface TutorialBubbleProps {
  step: TutorialStep
  stepIndex: number
  totalSteps: number
  tutorialTitle: string
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
}

export function TutorialBubble({
  step,
  stepIndex,
  totalSteps,
  tutorialTitle,
  onNext,
  onPrevious,
  onSkip,
  isFirst,
  isLast,
}: TutorialBubbleProps) {
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 })
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (step.targetElement) {
      const element = document.querySelector(step.targetElement)
      if (element instanceof HTMLElement) {
        const rect = element.getBoundingClientRect()
        // Position bubble to the right of target or bottom-right if too close to edge
        const top = Math.max(20, rect.bottom + 20)
        const left = Math.max(20, Math.min(rect.left + 20, window.innerWidth - 420))
        setBubblePosition({ top, left })
        return
      }
    }
    // Default to bottom-right corner
    setBubblePosition({
      top: window.innerHeight - 360,
      left: window.innerWidth - 400,
    })
  }, [step])

  const progressPercentage = ((stepIndex + 1) / totalSteps) * 100

  return (
    <>
      {/* Spotlight overlay */}
      {step.targetElement && <div className="fixed inset-0 z-40 pointer-events-none" />}

      <motion.div
        ref={bubbleRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed z-50 w-96 pointer-events-auto"
        style={{
          top: `${bubblePosition.top}px`,
          left: `${bubblePosition.left}px`,
        }}
      >
        <div className="bg-card border border-primary/20 rounded-xl shadow-2xl p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-primary/70">
                Step {stepIndex + 1} of {totalSteps}
              </p>
              <h3 className="text-lg font-bold text-foreground mt-1">{step.title}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onSkip} className="h-8 w-8 p-0 flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

          {/* Progress bar */}
          <Progress value={progressPercentage} className="h-1" />

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={onPrevious} className="flex-1 bg-transparent">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={onNext} className="flex-1">
              {isLast ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Skip link */}
          <button
            onClick={onSkip}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tutorial
          </button>
        </div>
      </motion.div>
    </>
  )
}
