"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { useSubscription } from "@/hooks/use-subscription"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { subscription, isLoading, refetch } = useSubscription()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Poll for subscription status
    const interval = setInterval(() => {
      refetch()
    }, 2000) // Check every 2 seconds

    return () => clearInterval(interval)
  }, [refetch])

  useEffect(() => {
    // If subscription is active, start countdown
    if (subscription?.status === 'active') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/dashboard')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [subscription, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center border-0 shadow-2xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <ConcentradeLogo size={60} />
          </div>
          
          {subscription?.status === 'active' ? (
            <>
              <div className="flex justify-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold">Welcome to Concentrade!</CardTitle>
              <CardDescription className="text-base">
                Your subscription is now active. Get ready to transform your trading journey!
              </CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold">Processing Your Payment...</CardTitle>
              <CardDescription className="text-base">
                Please wait while we activate your subscription
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {subscription?.status === 'active' ? (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">You now have access to:</span>
                </div>
                <ul className="space-y-2 text-sm text-left max-w-xs mx-auto">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Advanced trading analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>AI-powered insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Unlimited trade tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              <p className="text-xs text-muted-foreground">
                Redirecting in {countdown} seconds...
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This should only take a few moments
              </p>
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
