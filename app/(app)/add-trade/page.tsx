"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
// CHANGE: Removed curly braces to use default import
import TradeForm from "@/components/trade-form"
import { addTrade } from "@/app/actions/trade-actions"
import type { NewTradeInput, Trade } from "@/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default function AddTradePage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmitTrade = async (
    tradeData: NewTradeInput,
  ): Promise<{ success: boolean; trade?: Trade; tradeId?: string; error?: string }> => {
    try {
      console.log("[v0] handleSubmitTrade called in add-trade page")
      console.log("[v0] Trade data received:", JSON.stringify(tradeData, null, 2))

      const newTradeResult = await addTrade(tradeData)

      console.log("[v0] addTrade result:", JSON.stringify(newTradeResult, null, 2))

      if (newTradeResult.success && newTradeResult.trade) {
        console.log("[v0] Trade added successfully, showing success toast")
        toast({
          title: "🚀 Trade Logged Successfully!",
          description: `Trade for ${newTradeResult.trade.instrument} has been added to your portfolio.`,
          className: "glass-card border-green-500/50 bg-green-500/10",
        })
        // Navigation is now handled by the onSuccess callback passed to TradeForm
        // to ensure the form is reset FIRST.
        return newTradeResult
      } else {
        console.log("[v0] Trade add failed, showing error toast")
        toast({
          title: "❌ Error Adding Trade",
          description: newTradeResult.error || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
        return newTradeResult
      }
    } catch (error: any) {
      console.error("[v0] Exception in handleSubmitTrade:", {
        message: error.message,
        stack: error.stack,
      })
      toast({
        title: "❌ Error Adding Trade",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: error.message || "An unexpected error occurred." }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Floating Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="glass-card border-cyan-500/30 hover:border-cyan-400 hover:neon-glow-cyan transition-all duration-300 bg-transparent"
        >
          <Link href="/trades" aria-label="Back to trades list">
            <ArrowLeft className="h-5 w-5 text-cyan-400" />
          </Link>
        </Button>
      </div>

      <TradeForm
        onSubmitTrade={handleSubmitTrade}
        onSuccess={() => {
          router.push("/trades")
          router.refresh()
        }}
      />
    </div>
  )
}
