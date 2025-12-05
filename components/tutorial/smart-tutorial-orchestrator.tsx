"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useTutorialContext } from "@/components/tutorial/tutorial-provider"
// Change import from InteractiveBubble to TutorialSpotlight
import { TutorialSpotlight } from "@/components/tutorial/tutorial-spotlight" 
import type { TutorialStep } from "@/types/tutorial"
import { TUTORIALS } from "@/types/tutorial"

export function SmartTutorialOrchestrator() {
  const pathname = usePathname()
  const { activeTutorial, setActiveTutorial, completeStep, skipTutorial } = useTutorialContext()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)

  // Auto-trigger tutorials logic (Preserved from your code)
  useEffect(() => {
    if (!hasShownWelcome && pathname === "/dashboard" && !activeTutorial) {
      const welcomeTutorial = TUTORIALS["dashboard-welcome"]
      if (welcomeTutorial) {
        setActiveTutorial("dashboard-welcome")
        setHasShownWelcome(true)
        setCurrentStepIndex(0)
      }
    }
    // ... other triggers (trades, analytics) ...
  }, [pathname, activeTutorial, setActiveTutorial, hasShownWelcome])

  if (!activeTutorial) return null

  const tutorial = TUTORIALS[activeTutorial]
  if (!tutorial) return null

  const currentStep = tutorial.steps[currentStepIndex]
  if (!currentStep) return null

  // --- Handlers ---
  const handleNext = () => {
    if (currentStepIndex < tutorial.steps.length - 1) {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      completeStep(activeTutorial, nextIndex)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleSkip = () => {
    skipTutorial(activeTutorial)
    setActiveTutorial(null)
  }

  const handleComplete = () => {
    completeStep(activeTutorial, tutorial.steps.length)
    setActiveTutorial(null)
    setCurrentStepIndex(0)
  }

  // --- Render ---
  return (
    <TutorialSpotlight
      step={currentStep}
      totalSteps={tutorial.steps.length}
      currentStepNumber={currentStepIndex + 1}
      onNext={handleNext}
      onPrevious={currentStepIndex > 0 ? handlePrevious : undefined}
      onSkip={handleSkip}
      onComplete={handleComplete}
      isActive={true}
    />
  )
}
