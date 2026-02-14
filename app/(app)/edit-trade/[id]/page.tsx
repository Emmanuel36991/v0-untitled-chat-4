"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { TradeForm } from "@/components/trade-form"
import { getTradeById, updateTrade } from "@/app/actions/trade-actions"
import type { Trade, NewTradeInput } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit3, Orbit } from "lucide-react"
import Link from "next/link"

export default function EditTradePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tradeId = params.id as string

  useEffect(() => {
    const fetchTrade = async () => {
      if (!tradeId) {
        setError("No trade ID provided")
        setIsLoading(false)
        return
      }

      try {
        const fetchedTrade = await getTradeById(tradeId)
        if (fetchedTrade) {
          setTrade(fetchedTrade)
        } else {
          setError("Trade not found")
        }
      } catch (err: any) {
        console.error("Failed to fetch trade:", err)
        setError(err.message || "Failed to load trade")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrade()
  }, [tradeId])

  const handleUpdateTrade = async (
    tradeData: NewTradeInput,
  ): Promise<{ success: boolean; trade?: Trade; error?: string }> => {
    try {
      const result = await updateTrade(tradeId, tradeData)

      if (result.success && result.trade) {
        toast({
          title: "Trade Updated Successfully!",
          description: `Trade for ${result.trade.instrument} has been updated.`,
          className: "glass-card border-green-500/50 bg-green-500/10",
        })
        // Navigation handled by onSuccess
        return result
      } else {
        toast({
          title: "Error Updating Trade",
          description: result.error || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
        return result
      }
    } catch (error: any) {
      console.error("Failed to update trade:", error)
      toast({
        title: "Error Updating Trade",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { success: false, error: error.message || "An unexpected error occurred." }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <Card className="glass-card max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-gradient flex items-center gap-2">
              <Orbit className="h-6 w-6 animate-spin" />
              Loading Trade Data...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="data-stream h-2 rounded-full"></div>
              <p className="text-muted-foreground">Retrieving trade information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !trade) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <Card className="glass-card max-w-md mx-auto border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Edit3 className="h-6 w-6" />
              Trade Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error || "The requested trade could not be found."}</p>
            <Button asChild className="w-full futuristic-button">
              <Link href="/trades">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trades
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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

      {/* Floating Action Indicator */}
      <div className="fixed top-6 right-6 z-50">
        <div className="glass-card px-4 py-2 border-cyan-500/30">
          <div className="flex items-center gap-2 text-cyan-400">
            <Edit3 className="h-4 w-4" />
            <span className="text-sm font-medium">Edit Trade</span>
          </div>
        </div>
      </div>

      <TradeForm
        onSubmitTrade={handleUpdateTrade}
        initialTradeData={trade}
        mode="edit"
        onSuccess={() => {
          router.push("/trades")
          router.refresh()
        }}
      />
    </div>
  )
}
