import type React from "react"
import { Navbar } from "@/components/layout/navbar"
import { AppFooter } from "@/components/layout/app-footer"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

// AI Integration Imports
import { TradingAssistant } from "@/components/ai/trading-assistant"
import { getTrades } from "@/app/actions/trade-actions"
import { buildTradingContext } from "@/lib/ai/context-builder"

// FORCE DYNAMIC: This layout fetches user-specific data (trades) via cookies.
// It cannot be statically generated.
export const dynamic = "force-dynamic"

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
    <div className={cn("flex flex-col min-h-screen bg-background text-foreground antialiased")}>
      <Navbar />
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 overflow-x-hidden relative">
        {children}
      </main>
      <AppFooter />
      <Toaster />

      {/* Floating AI Chat Assistant */}
      <TradingAssistant initialContext={aiContext} />
    </div>
  )
}
