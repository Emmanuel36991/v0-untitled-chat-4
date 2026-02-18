import type React from "react"
import { Navbar } from "@/components/layout/navbar"
import { AppFooter } from "@/components/layout/app-footer"
import { Toaster } from "@/components/ui/toaster"
import { ThemeSyncFromUserConfig } from "@/components/theme-sync-from-config"
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
  // 1. Fetch data for AI Context (last 500 trades only to avoid blocking layout with 5k+ rows)
  let aiContext = ""
  try {
    const tradesDesc = await getTrades({ limit: 500, order: "desc" })
    if (Array.isArray(tradesDesc) && tradesDesc.length > 0) {
      const tradesChrono = [...tradesDesc].reverse()
      const contextData = buildTradingContext(tradesChrono)
      aiContext = JSON.stringify(contextData)
    }
  } catch (error) {
    console.error("Failed to load AI context:", error)
  }

  return (
    <div className={cn("flex flex-col min-h-screen bg-background text-foreground antialiased")}>
      <ThemeSyncFromUserConfig />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 overflow-x-hidden relative outline-none">
        {children}
      </main>
      <AppFooter />
      <Toaster />

      {/* Floating AI Chat Assistant */}
      <TradingAssistant initialContext={aiContext} />
    </div>
  )
}
