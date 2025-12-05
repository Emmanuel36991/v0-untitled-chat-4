"use client"

import { useState, useCallback, useEffect } from "react"
import type { TutorialProgress } from "@/types/tutorial"
import { TUTORIALS } from "@/types/tutorial"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"

const STORAGE_KEY = "concentrade_tutorial_progress"

function getLocalProgress(): Record<string, TutorialProgress> {
  try {
    if (typeof window === "undefined") return {}
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveLocalProgress(data: Record<string, TutorialProgress>) {
  try {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    console.error("[v0] Error saving tutorial progress to localStorage")
  }
}

export function useTutorial() {
  const [tutorialProgress, setTutorialProgress] = useState<Record<string, TutorialProgress>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentTutorialId, setCurrentTutorialId] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const supabase = createSupabaseBrowserClient()

  const fetchTutorialProgress = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        const localProgress = getLocalProgress()
        setTutorialProgress(localProgress)
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.from("tutorial_progress").select("*").eq("user_id", session.user.id)

      if (error) {
        console.warn("[v0] Tutorial table not available, using localStorage")
        const localProgress = getLocalProgress()
        setTutorialProgress(localProgress)
        setIsLoading(false)
        return
      }

      const progressMap: Record<string, TutorialProgress> = {}
      data?.forEach((progress) => {
        progressMap[progress.tutorial_id] = progress
      })
      setTutorialProgress(progressMap)
    } catch (error) {
      console.error("[v0] Error fetching tutorial progress:", error)
      const localProgress = getLocalProgress()
      setTutorialProgress(localProgress)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTutorialProgress()
  }, [fetchTutorialProgress])

  const saveProgress = useCallback(
    async (tutorialId: string, newProgress: Partial<TutorialProgress>) => {
      try {
        const updated = {
          ...tutorialProgress[tutorialId],
          ...newProgress,
          last_accessed_at: new Date().toISOString(),
        } as TutorialProgress

        setTutorialProgress((prev) => ({
          ...prev,
          [tutorialId]: updated,
        }))

        // Always save to localStorage first (instant)
        const allProgress = { ...tutorialProgress, [tutorialId]: updated }
        saveLocalProgress(allProgress)

        // Try to sync to Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          await supabase.from("tutorial_progress").upsert(
            {
              user_id: session.user.id,
              tutorial_id: tutorialId,
              ...updated,
            },
            {
              onConflict: "user_id,tutorial_id",
            },
          )
        }
      } catch (error) {
        console.error("[v0] Error saving tutorial progress:", error)
      }
    },
    [supabase, tutorialProgress],
  )

  const startTutorial = useCallback(
    (tutorialId: string) => {
      saveProgress(tutorialId, {
        status: "in_progress",
        progress_percentage: 0,
        started_at: new Date().toISOString(),
      })
      setCurrentTutorialId(tutorialId)
      setCurrentStepIndex(0)
    },
    [saveProgress],
  )

  const nextStep = useCallback(
    (tutorialId: string, stepIndex: number, totalSteps: number) => {
      const progressPercentage = Math.round(((stepIndex + 1) / totalSteps) * 100)
      saveProgress(tutorialId, { progress_percentage: progressPercentage })
      setCurrentStepIndex(stepIndex + 1)
    },
    [saveProgress],
  )

  const completeTutorial = useCallback(
    (tutorialId: string) => {
      saveProgress(tutorialId, {
        status: "completed",
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
      })
      setCurrentTutorialId(null)
      setCurrentStepIndex(0)
    },
    [saveProgress],
  )

  const skipTutorial = useCallback(
    (tutorialId: string) => {
      saveProgress(tutorialId, {
        status: "skipped",
      })
      setCurrentTutorialId(null)
      setCurrentStepIndex(0)
    },
    [saveProgress],
  )

  // Get next available tutorial
  const getNextTutorial = useCallback(() => {
    const tutorialIds = Object.keys(TUTORIALS)
    for (const id of tutorialIds) {
      const progress = tutorialProgress[id]
      if (!progress || progress.status === "not_started") {
        return id
      }
    }
    return null
  }, [tutorialProgress])

  const getCompletionPercentage = useCallback(() => {
    const totalTutorials = Object.keys(TUTORIALS).length
    const completedTutorials = Object.values(tutorialProgress).filter((p) => p.status === "completed").length
    return totalTutorials > 0 ? Math.round((completedTutorials / totalTutorials) * 100) : 0
  }, [tutorialProgress])

  return {
    tutorialProgress,
    isLoading,
    currentTutorialId,
    currentStepIndex,
    setCurrentStepIndex,
    startTutorial,
    skipTutorial,
    completeTutorial,
    nextStep,
    getCompletionPercentage,
    TUTORIALS,
  }
}
