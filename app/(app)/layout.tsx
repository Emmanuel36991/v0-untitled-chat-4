"use client"

import type React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
// REMOVED: import { AIChatBubble } from "@/components/ai-chat/ai-chat-bubble"
import { TutorialProvider } from "@/components/tutorial/tutorial-provider"
import { TutorialOrchestrator } from "@/components/tutorial/tutorial-orchestrator"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TutorialProvider>
      <div className={cn("flex flex-col min-h-screen bg-background text-foreground antialiased")}>
        <Navbar />
        <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 overflow-x-hidden relative">
          {children}
        </main>
        <Toaster />
        {/* REMOVED: <AIChatBubble /> */}
        <TutorialOrchestrator />
      </div>
    </TutorialProvider>
  )
}
