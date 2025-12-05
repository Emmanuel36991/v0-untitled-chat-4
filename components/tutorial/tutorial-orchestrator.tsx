"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { SmartPageOrchestrator } from "./smart-page-orchestrator"
import { TutorialWelcomeOverlay } from "./tutorial-welcome-overlay"
import { useTutorialContext } from "./tutorial-provider"
import { useUserConfig } from "@/hooks/use-user-config"

export function TutorialOrchestrator() {
  const pathname = usePathname()
  const { currentTutorialId } = useTutorialContext()
  const { config, isLoaded } = useUserConfig()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (!isLoaded || !pathname) return

    const hasSeenWelcome = localStorage.getItem("tutorial-welcome-shown")
    const isNewUser = !config?.profileSetupComplete

    if (!hasSeenWelcome && isNewUser && pathname === "/dashboard") {
      localStorage.setItem("tutorial-welcome-shown", "true")
      setShowWelcome(true)
    }
  }, [isLoaded, config?.profileSetupComplete, pathname])

  return (
    <>
      {/* Smart page-based tutorial orchestrator */}
      <SmartPageOrchestrator />

      {/* Welcome overlay for brand new users */}
      {showWelcome && <TutorialWelcomeOverlay onClose={() => setShowWelcome(false)} />}
    </>
  )
}
