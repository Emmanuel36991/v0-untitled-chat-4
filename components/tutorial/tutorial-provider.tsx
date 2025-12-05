"use client"

import { type ReactNode, createContext, useContext } from "react"
import { useTutorial } from "@/hooks/use-tutorial"
import type { TutorialProgress } from "@/types/tutorial"

interface TutorialContextType {
  tutorialProgress: Record<string, TutorialProgress>
  isLoading: boolean
  currentTutorialId: string | null
  currentStepIndex: number
  setCurrentStepIndex: (index: number) => void
  startTutorial: (tutorialId: string) => Promise<void>
  skipTutorial: (tutorialId: string) => Promise<void>
  completeTutorial: (tutorialId: string, timeSpentMinutes?: number) => Promise<void>
  updateTutorialProgress: (tutorialId: string, progressPercentage: number) => Promise<void>
  getNextTutorial: () => string | null
  getCompletionPercentage: () => number
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: ReactNode }) {
  const tutorial = useTutorial()

  return <TutorialContext.Provider value={tutorial}>{children}</TutorialContext.Provider>
}

export function useTutorialContext() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error("useTutorialContext must be used within TutorialProvider")
  }
  return context
}
