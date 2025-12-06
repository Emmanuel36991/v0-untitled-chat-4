import type React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { TutorialProvider } from "@/components/tutorial/tutorial-provider"
import { TutorialOrchestrator } from "@/components/tutorial/tutorial-orchestrator"

// AI Integration Imports
import { TradingAssistant } from "@/components/ai/trading-assistant"
import { getTrades } from "@/app/actions/trade-actions"
import { buildTradingContext } from "@/lib/ai/context-builder"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Fetch data for AI Context (Server-Side for Efficiency)
  let aiContext = ""
  try {
    const trades = await getTrades()
    // Ensure trades is an array before processing
    if (Array.isArray(trades)) {
      const contextData = buildTradingContext(trades)
      aiContext = JSON.stringify(contextData)
    }
  } catch (error) {
    console.error("Failed to load AI context:", error)
    // Bot will still work, just without personalized data initially
  }

  return (
    <TutorialProvider>
      <div className={cn("flex flex-col min-h-screen bg-background text-foreground antialiased")}>
        <Navbar />
        <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 overflow-x-hidden relative">
          {children}
        </main>
        <Toaster />
        
        {/* 2. Floating AI Chat Assistant */}
        <TradingAssistant initialContext={aiContext} />
        
        <TutorialOrchestrator />
      </div>
    </TutorialProvider>
  )
}
