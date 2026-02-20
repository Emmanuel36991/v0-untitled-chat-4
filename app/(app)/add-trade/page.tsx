"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import TradeForm from "@/components/trade-form"
import { addTrade } from "@/app/actions/trade-actions"
import type { NewTradeInput, Trade } from "@/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"

export const dynamic = "force-dynamic"

export default function AddTradePage() {
  const router = useRouter()
  const { toast } = useToast()

  const fireConfetti = () => {
    const end = Date.now() + 1.5 * 1000 // 1.5 seconds

    // Emerald green and primary colors for the burst
    const colors = ["#10b981", "#34d399", "#8b5cf6"]

      ; (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        })
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      })()
  }

  const handleSubmitTrade = async (
    tradeData: NewTradeInput,
  ): Promise<{ success: boolean; trade?: Trade; tradeId?: string; error?: string }> => {
    try {

      const newTradeResult = await addTrade(tradeData)

      if (newTradeResult.success && newTradeResult.trade) {
        // Fire celebration confetti!
        fireConfetti()

        toast({
          title: "🚀 Trade Logged Successfully!",
          description: `Trade for ${newTradeResult.trade.instrument} has been added to your portfolio.`,
          className: "glass-card border-emerald-500/50 bg-emerald-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]",
        })
        return newTradeResult
      } else {
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
          className="glass-card border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300 bg-transparent backdrop-blur-md"
        >
          <Link href="/trades" aria-label="Back to trades list">
            <ArrowLeft className="h-5 w-5 text-cyan-400 drop-shadow-md" />
          </Link>
        </Button>
      </div>

      <TradeForm
        onSubmitTrade={handleSubmitTrade}
        onSuccess={(tradeId) => {
          // Add a small delay so the user can enjoy the confetti before routing
          setTimeout(() => {
            router.push(tradeId ? `/trades?highlight=${tradeId}` : "/trades")
            router.refresh()
          }, 1500)
        }}
      />
    </div>
  )
}
