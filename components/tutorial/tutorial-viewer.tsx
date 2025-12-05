"use client"

import { useState, useRef } from "react"
import { TutorialSpotlight } from "./tutorial-spotlight"
import { TUTORIALS } from "@/types/tutorial"
import { useTutorialContext } from "./tutorial-provider"

interface TutorialViewerProps {
  tutorialId: string
}

export function TutorialViewer({ tutorialId }: TutorialViewerProps) {
  const { completeTutorial, skipTutorial, updateTutorialProgress } = useTutorialContext()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const startTimeRef = useRef<number>(Date.now())

  const tutorial = TUTORIALS[tutorialId]
  if (!tutorial) return null

  const currentStep = tutorial.steps[currentStepIndex]
  const totalSteps = tutorial.steps.length

  const handleNext = async () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
      const progress = Math.round(((currentStepIndex + 2) / totalSteps) * 100)
      await updateTutorialProgress(tutorialId, progress)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleComplete = async () => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 60000)
    await completeTutorial(tutorialId, timeSpent)
  }

  const handleSkip = async () => {
    await skipTutorial(tutorialId)
  }

  return (
    <TutorialSpotlight
      step={currentStep}
      totalSteps={totalSteps}
      currentStepNumber={currentStepIndex + 1}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      onComplete={handleComplete}
    />
  )
}
