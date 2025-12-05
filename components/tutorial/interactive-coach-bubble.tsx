"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { TutorialStep } from "@/types/tutorial"

interface InteractiveCoachBubbleProps {
  step: TutorialStep
  stepIndex: number
  totalSteps: number
  tutorialTitle: string
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
  position?: { x: number; y: number }
}

export function InteractiveCoachBubble({
  step,
  stepIndex,
  totalSteps,
  tutorialTitle,
  onNext,
  onPrevious,
  onSkip,
  isFirst,
  isLast,
  position,
}: InteractiveCoachBubbleProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add entrance animation delay
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [stepIndex])

  useEffect(() => {
    if (step.targetElement) {
      const element = document.querySelector(step.targetElement) as HTMLElement
      setTargetElement(element)

      if (element) {
        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [step])

  // Calculate bubble position based on target element
  let positionClasses = "bottom-4 right-4"
  if (step.position === "top") {
    positionClasses = "top-4 right-4"
  } else if (step.position === "left") {
    positionClasses = "bottom-4 left-4"
  }

  const progressPercentage = ((stepIndex + 1) / totalSteps) * 100

  return (
    <>
      {/* Spotlight overlay for target element */}
      {step.targetElement && targetElement && (
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            background: "radial-gradient(circle 300px at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)",
          }}
        >
          <div
            className="absolute border-2 border-yellow-400 rounded-xl shadow-lg animate-pulse"
            style={{
              top: targetElement.getBoundingClientRect().top - 8,
              left: targetElement.getBoundingClientRect().left - 8,
              width: targetElement.getBoundingClientRect().width + 16,
              height: targetElement.getBoundingClientRect().height + 16,
              boxShadow: "0 0 30px rgba(250, 204, 21, 0.5), inset 0 0 20px rgba(250, 204, 21, 0.2)",
            }}
          />
        </div>
      )}

      {/* Coach Bubble */}
      <div
        ref={bubbleRef}
        className={cn(
          "fixed z-50 max-w-md pointer-events-auto",
          positionClasses,
          "transform transition-all duration-500",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Main bubble card */}
        <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 backdrop-blur-sm p-6 group">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-3xl -z-10" />

          {/* Header with step counter and close */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{tutorialTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Step {stepIndex + 1} of {totalSteps}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <Progress value={progressPercentage} className="h-1.5 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Step title */}
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <span>{step.title}</span>
          </h4>

          {/* Step description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{step.description}</p>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={isFirst}
              className="flex-1 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              className="flex-1 transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent"
            >
              Skip
            </Button>

            <Button
              size="sm"
              onClick={onNext}
              className={cn(
                "flex-1 transition-all duration-200 font-semibold",
                isLast
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg",
              )}
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Helpful tip */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <span className="font-medium">Pro tip:</span> You can pause this tutorial anytime and come back later.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
