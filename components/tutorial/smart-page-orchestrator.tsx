"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useTutorial } from "@/hooks/use-tutorial"
import { InteractiveCoachBubble } from "./interactive-coach-bubble"
import { TUTORIALS } from "@/types/tutorial"

const PAGE_TUTORIAL_MAP: Record<string, string> = {
  "/dashboard": "dashboard-welcome",
  "/add-trade": "first-trade-guide",
  "/analytics": "analytics-dashboard",
  "/psychology": "psychology-tracker",
}

export function SmartPageOrchestrator() {
  const pathname = usePathname()
  const {
    currentTutorialId,
    currentStepIndex,
    setCurrentStepIndex,
    startTutorial,
    completeTutorial,
    skipTutorial,
    tutorialProgress,
  } = useTutorial()

  const startTimeRef = useRef<number>(0)
  const activePageTutorialRef = useRef<string | null>(null)

  // Auto-trigger tutorial based on page
  useEffect(() => {
    const tutorialId = PAGE_TUTORIAL_MAP[pathname]

    // If we're on a page with a tutorial and haven't started it yet
    if (tutorialId && tutorialId !== activePageTutorialRef.current) {
      const progress = tutorialProgress[tutorialId]

      // Only auto-start if not started or completed
      if (!progress || progress.status === "not_started") {
        // Small delay to ensure page is rendered
        const timer = setTimeout(() => {
          activePageTutorialRef.current = tutorialId
          startTutorial(tutorialId)
          startTimeRef.current = Date.now()
        }, 800)

        return () => clearTimeout(timer)
      } else if (progress.status === "completed") {
        activePageTutorialRef.current = null
      }
    }
  }, [pathname, tutorialProgress, startTutorial])

  // Get current tutorial and step
  const tutorial = currentTutorialId ? TUTORIALS[currentTutorialId] : null
  const currentStep = tutorial?.steps[currentStepIndex]

  if (!tutorial || !currentStep) {
    return null
  }

  const handleNext = () => {
    if (currentStepIndex < tutorial.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      // Tutorial complete
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000 / 60)
      completeTutorial(currentTutorialId, timeSpent)
      activePageTutorialRef.current = null
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleSkip = () => {
    skipTutorial(currentTutorialId)
    activePageTutorialRef.current = null
  }

  return (
    <InteractiveCoachBubble
      step={currentStep}
      stepIndex={currentStepIndex}
      totalSteps={tutorial.steps.length}
      tutorialTitle={tutorial.title}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      isFirst={currentStepIndex === 0}
      isLast={currentStepIndex === tutorial.steps.length - 1}
    />
  )
}
