"use client"

import { useState, useEffect } from "react"
import { ConcentradeLogo } from "@/components/concentrade-logo"

const LOADING_MESSAGES = [
  "Connecting to your workspace...",
  "Syncing trade data...",
  "Preparing your dashboard...",
]

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background animate-fade-in-up">
      <div className="flex flex-col items-center gap-6">
        <ConcentradeLogo size={80} variant="icon" className="animate-float" />
        <div className="h-1 w-[120px] rounded-full overflow-hidden bg-muted">
          <div className="h-full w-full loading-shimmer rounded-full" />
        </div>
        <div className="flex flex-col items-center gap-2 min-h-[2.5rem]">
          <p
            key={messageIndex}
            className="text-sm text-muted-foreground font-medium text-center animate-fade-in-up"
          >
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  )
}
