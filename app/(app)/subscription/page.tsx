'use client'

import { useRouter } from 'next/navigation'
import { Construction, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// TEMPORARY: Payment system disabled for testing
// Remove this comment and restore full functionality when ready

export default function SubscriptionPage() {
  const router = useRouter()

  return (
    <div className="max-w-3xl mx-auto py-20">
      <Card className="border-2">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-muted">
              <Construction className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl">Subscription System Temporarily Disabled</CardTitle>
          <CardDescription className="text-lg mt-2">
            Payment features are currently disabled for testing purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            The subscription and payment system is temporarily unavailable while we conduct testing. 
            All premium features are currently accessible for testing purposes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push('/dashboard')} variant="default" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ORIGINAL CODE - RESTORE WHEN RE-ENABLING PAYMENTS
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, 
  Calendar, 
  Settings, 
  ExternalLink, 
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { PricingTable } from '@/components/subscription/pricing-table'
import { CheckoutEmbed } from '@/components/subscription/checkout-embed'
import { SubscriptionBadge } from '@/components/subscription/subscription-badge'
import { getSubscriptionStatus, createCustomerPortalSession } from '@/app/actions/stripe-actions'
import { cn } from '@/lib/utils'

interface SubscriptionData {
  status: string
  plan: string
  isActive: boolean
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
}

export default function SubscriptionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [checkoutProductId, setCheckoutProductId] = useState<string | null>(null)

  const loadSubscription = useCallback(async () => {
    try {
      const data = await getSubscriptionStatus()
      setSubscription(data)
    } catch (error) {
      console.error('Failed to load subscription:', error)
      toast({
        title: "Error",
        description: "Failed to load subscription status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadSubscription()
  }, [loadSubscription])

  const handleManageSubscription = async () => {
    setIsPortalLoading(true)
    try {
      const url = await createCustomerPortalSession()
      window.location.href = url
    } catch (error) {
      console.error('Failed to create portal session:', error)
      toast({
        title: "Error",
        description: "Failed to open subscription management portal",
        variant: "destructive",
      })
    } finally {
      setIsPortalLoading(false)
    }
  }

  const handleSelectPlan = (productId: string) => {
    setCheckoutProductId(productId)
  }

  const handleCheckoutSuccess = () => {
    setCheckoutProductId(null)
    loadSubscription()
    router.refresh()
  }

  const isPro = subscription?.plan?.startsWith('pro') || false
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <SubscriptionBadge plan={subscription?.plan || 'free'} isLoading={isLoading} size="md" />
        </div>
        <p className="text-muted-foreground">
          Manage your subscription and billing preferences
        </p>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription status and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-40" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold">
                      {isPro ? 'Pro Plan' : 'Free Plan'}
                    </h3>
                    {subscription?.isActive && (
                      <Badge variant="outline" className="text-xs gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                    {subscription?.cancelAtPeriodEnd && (
                      <Badge variant="outline" className="text-xs gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                        <AlertCircle className="h-3 w-3" />
                        Cancels Soon
                      </Badge>
                    )}
                  </div>
                  {isPro && subscription?.currentPeriodEnd && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {subscription.cancelAtPeriodEnd 
                        ? `Access until ${formatDate(subscription.currentPeriodEnd)}`
                        : `Renews on ${formatDate(subscription.currentPeriodEnd)}`
                      }
                    </p>
                  )}
                </div>
                
                {isPro && (
                  <Button
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={isPortalLoading}
                    className="gap-2"
                  >
                    {isPortalLoading ? (
                      <span className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    ) : (
                      <Settings className="h-4 w-4" />
                    )}
                    Manage Subscription
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {isPro && (
                <>
                  <Separator />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Plan</p>
                      <p className="font-medium">
                        {subscription?.plan === 'pro-yearly' ? 'Annual' : 'Monthly'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <p className="font-medium capitalize">{subscription?.status}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Next Billing</p>
                      <p className="font-medium">{formatDate(subscription?.currentPeriodEnd)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pro Features Highlight (for free users) */}
      {!isLoading && !isPro && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Unlock Your Full Trading Potential</h3>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro for AI-powered insights, unlimited backtesting, and advanced analytics.
                </p>
              </div>
              <Button 
                onClick={() => handleSelectPlan('pro-monthly')}
                className="gap-2 shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Plans & Pricing</CardTitle>
          <CardDescription>
            Choose the plan that best fits your trading needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricingTable
            currentPlan={subscription?.plan || 'free'}
            onSelectPlan={handleSelectPlan}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-muted">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">Secure Payment Processing</h3>
              <p className="text-sm text-muted-foreground">
                All payments are processed securely through Stripe with 256-bit SSL encryption. 
                We never store your card details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Modal */}
      {checkoutProductId && (
        <CheckoutEmbed
          productId={checkoutProductId}
          open={!!checkoutProductId}
          onOpenChange={(open) => !open && setCheckoutProductId(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  )
}
