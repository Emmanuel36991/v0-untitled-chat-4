"use client"

import { Loader2 } from "lucide-react"
import { ConcentradeLogo } from "@/components/concentrade-logo"

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <ConcentradeLogo size={80} variant="icon" className="animate-pulse" />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading your workspace...</p>
        </div>
      </div>
    </div>
  )
}
