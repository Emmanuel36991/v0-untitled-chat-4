"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Shield, TrendingUp, BarChart3 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AlpacaConnectionForm } from "./alpaca-connection-form"

interface SimpleConnectionModalProps {
  onConnectionCreated?: () => void
  onClose?: () => void
}

interface ConnectionOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
  available: boolean
  action: () => void
}

export function SimpleConnectionModal({ onConnectionCreated, onClose }: SimpleConnectionModalProps) {
  const router = useRouter()
  const [activeForm, setActiveForm] = useState<string | null>(null)

  const CONNECTION_OPTIONS: ConnectionOption[] = [
    {
      id: "alpaca",
      name: "Alpaca",
      description: "Commission-free trading API for stocks and crypto",
      icon: <BarChart3 className="h-8 w-8 text-green-400" />,
      features: ["API Key Auth", "Paper & Live Trading", "Stocks & Crypto", "Auto-sync trades"],
      available: true,
      action: () => setActiveForm("alpaca"),
    },
    {
      id: "tradovate",
      name: "Tradovate",
      description: "Professional futures trading platform with full API integration",
      icon: <div className="text-2xl">🚀</div>,
      features: ["Real-time sync", "Order history", "Position tracking", "P&L calculation"],
      available: true,
      action: () => {
        onClose?.()
        router.push("/tradovate/login")
      },
    },
    {
      id: "tradingview",
      name: "TradingView",
      description: "Connect TradingView alerts via webhooks for automated trade logging",
      icon: <TrendingUp className="h-8 w-8 text-orange-400" />,
      features: ["Webhook alerts", "Strategy automation", "Real-time signals", "Custom alerts"],
      available: false,
      action: () => {
        toast({
          title: "Coming Soon",
          description: "TradingView integration is currently in development and will be available soon.",
          variant: "default",
        })
      },
    },
  ]

  // If a broker form is active, render it instead of the broker list
  if (activeForm === "alpaca") {
    return (
      <AlpacaConnectionForm
        onBack={() => setActiveForm(null)}
        onConnectionCreated={onConnectionCreated}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gradient mb-2">Connect Your Trading Platform</h3>
        <p className="text-muted-foreground">Choose how you want to sync your trades automatically</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CONNECTION_OPTIONS.map((option) => (
          <Card
            key={option.id}
            className={`glass-card cursor-pointer transition-all duration-300 hover:border-blue-400/50 hover:bg-blue-500/5 ${
              !option.available ? "opacity-75" : ""
            }`}
            onClick={option.action}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {option.icon}
                  <div>
                    <h4 className="font-semibold text-lg">{option.name}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <Badge
                  variant={option.available ? "default" : "outline"}
                  className={
                    option.available
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }
                >
                  {option.available ? "Available" : "Coming Soon"}
                </Badge>
              </div>

              <div className="space-y-2">
                {option.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {!option.available && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-300">
                    This integration is in development. Click to learn more about upcoming features.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="border-blue-500/30 bg-blue-500/10">
        <Shield className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <strong>Secure Integration:</strong> All connections use industry-standard security practices to protect your
          trading account information. Your credentials are encrypted and never stored permanently.
        </AlertDescription>
      </Alert>
    </div>
  )
}
