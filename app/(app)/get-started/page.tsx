"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Sparkles, TrendingUp, Brain, BarChart3, Shield, Zap, Lock } from "lucide-react"
import { PRODUCTS, type Product } from "@/lib/products"
import { CheckoutEmbed } from "@/components/subscription/checkout-embed"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { useSubscription } from "@/hooks/use-subscription"
import Image from "next/image"

export default function GetStartedPage() {
  const router = useRouter()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedProductId(null)
                setIsProcessing(false)
              }}
              className="mb-6 hover:bg-white/50 dark:hover:bg-slate-900/50"
            >
              ← Back to plans
            </Button>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Complete Your Subscription
              </h1>
              <p className="text-lg text-muted-foreground">
                Secure checkout powered by Stripe • Your payment info is encrypted
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <CheckoutEmbed productId={selectedProductId} />
            </div>
          </div>
          
          {/* Security Info Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="grid md:grid-cols-3 gap-6 text-center text-sm">
              <div className="space-y-2">
                <Shield className="w-5 h-5 mx-auto text-blue-600" />
                <p className="font-medium text-slate-700 dark:text-slate-300">256-bit SSL</p>
                <p className="text-xs text-muted-foreground">Bank-level encryption</p>
              </div>
              <div className="space-y-2">
                <Lock className="w-5 h-5 mx-auto text-green-600" />
                <p className="font-medium text-slate-700 dark:text-slate-300">PCI Compliant</p>
                <p className="text-xs text-muted-foreground">Your data is safe</p>
              </div>
              <div className="space-y-2">
                <Check className="w-5 h-5 mx-auto text-purple-600" />
                <p className="font-medium text-slate-700 dark:text-slate-300">Instant Access</p>
                <p className="text-xs text-muted-foreground">Activate immediately</p>
              </div>
            </div>
          </div>
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
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {paidProducts.map((product) => {
            const isPopular = product.id === 'pro'
            
            return (
              <Card
                key={product.id}
                className={`relative overflow-hidden transition-all duration-500 backdrop-blur-xl ${
                  isPopular
                    ? 'border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20 scale-105 md:scale-110 bg-gradient-to-br from-blue-50/90 to-purple-50/90 dark:from-blue-950/90 dark:to-purple-950/90'
                    : 'border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 hover:border-slate-300/50 dark:hover:border-slate-600/50'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-bl-lg shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mb-4">
                    <Badge 
                      className={`text-sm font-semibold ${
                        isPopular 
                          ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' 
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {product.name}
                    </Badge>
                  </div>
                  <CardTitle className={`text-5xl font-bold ${
                    isPopular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                      : ''
                  }`}>
                    ${(product.priceInCents / 100).toFixed(0)}
                    <span className="text-lg font-normal text-muted-foreground block mt-1">/month</span>
                  </CardTitle>
                  <CardDescription className="text-base mt-3 text-slate-600 dark:text-slate-300">
                    {product.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-8">
                  <Separator className={isPopular ? 'bg-blue-200/30 dark:bg-blue-800/30' : ''} />
                  
                  <div className="space-y-4">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isPopular ? 'text-blue-600 dark:text-blue-400' : 'text-green-600'
                        }`} />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => {
                      setIsProcessing(true)
                      setSelectedProductId(product.id)
                    }}
                    disabled={isProcessing}
                    className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                      isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                    }`}
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Started with {product.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center space-y-6">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              TRUSTED BY TRADERS WORLDWIDE
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">SSL Encrypted</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Lock className="w-6 h-6 text-green-600" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Stripe Secure</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Zap className="w-6 h-6 text-purple-600" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Cancel Anytime</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Check className="w-6 h-6 text-amber-600" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Money-back 30d</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-6">
              <span className="text-xs text-muted-foreground">Accepted cards:</span>
              <div className="flex gap-3">
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-300">Visa</div>
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-300">Mastercard</div>
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-300">Amex</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
