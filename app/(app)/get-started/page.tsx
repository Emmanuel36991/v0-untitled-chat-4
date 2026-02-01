"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Sparkles, TrendingUp, Brain, BarChart3, Shield, Zap } from "lucide-react"
import { PRODUCTS, type Product } from "@/lib/products"
import { CheckoutEmbed } from "@/components/subscription/checkout-embed"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { useSubscription } from "@/hooks/use-subscription"

export default function GetStartedPage() {
  const router = useRouter()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  // Redirect if already has active subscription
  useEffect(() => {
    if (!subscriptionLoading && subscription?.status === 'active') {
      router.push('/dashboard')
    }
  }, [subscription, subscriptionLoading, router])

  // Only show paid plans (filter out free tier)
  const paidProducts = PRODUCTS.filter(p => p.id !== 'free')

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12 space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (selectedProductId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedProductId(null)}
              className="mb-4"
            >
              ← Back to plans
            </Button>
            <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
            <p className="text-muted-foreground">Secure checkout powered by Stripe</p>
          </div>
          <CheckoutEmbed productId={selectedProductId} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex justify-center mb-4">
            <ConcentradeLogo size={60} />
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Welcome to Concentrade
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Choose Your Plan to Get Started
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a plan to unlock advanced trading analytics and start improving your performance
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: TrendingUp, title: "Advanced Analytics", description: "Deep insights into your trading performance" },
            { icon: Brain, title: "AI-Powered Insights", description: "Get personalized trading recommendations" },
            { icon: BarChart3, title: "Detailed Reports", description: "Comprehensive P&L and risk analysis" },
            { icon: Shield, title: "Secure & Private", description: "Bank-level encryption for your data" },
            { icon: Zap, title: "Real-Time Sync", description: "Connect with TradingView & brokers" },
            { icon: Check, title: "Cancel Anytime", description: "No long-term commitment required" },
          ].map((feature, idx) => (
            <Card key={idx} className="border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <feature.icon className="w-8 h-8 mb-3 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {paidProducts.map((product) => {
            const isPopular = product.id === 'pro'
            
            return (
              <Card
                key={product.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isPopular
                    ? 'border-2 border-blue-500 shadow-lg scale-105'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="mb-4">
                    <Badge variant="outline" className="text-sm">
                      {product.name}
                    </Badge>
                  </div>
                  <CardTitle className="text-4xl font-bold">
                    ${(product.priceInCents / 100).toFixed(0)}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Separator />
                  
                  <div className="space-y-3">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setSelectedProductId(product.id)}
                    className={`w-full h-12 text-base font-semibold ${
                      isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : ''
                    }`}
                    size="lg"
                  >
                    Get Started with {product.name}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Trust Badges */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            🔒 Secure payment powered by Stripe • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  )
}
