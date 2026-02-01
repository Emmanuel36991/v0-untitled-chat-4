'use client'

import { useState } from 'react'
import { Check, Shield, Lock, Zap, Crown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { PRODUCTS, type Product } from '@/lib/products'

interface PricingTableProps {
  currentPlan?: string
  onSelectPlan: (productId: string) => void
  isLoading?: boolean
}

export function PricingTable({ currentPlan = 'free', onSelectPlan, isLoading }: PricingTableProps) {
  const [isAnnual, setIsAnnual] = useState(false)

  const freePlan = PRODUCTS.find(p => p.id === 'free')!
  const monthlyPlan = PRODUCTS.find(p => p.id === 'pro-monthly')!
  const yearlyPlan = PRODUCTS.find(p => p.id === 'pro-yearly')!
  
  const proPlan = isAnnual ? yearlyPlan : monthlyPlan
  const isPro = currentPlan.startsWith('pro')

  const formatPrice = (cents: number, interval: string) => {
    const dollars = cents / 100
    if (interval === 'year') {
      return `$${(dollars / 12).toFixed(2)}`
    }
    return `$${dollars.toFixed(0)}`
  }

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label 
          htmlFor="billing-toggle" 
          className={cn(
            "cursor-pointer transition-colors",
            !isAnnual ? "text-foreground font-medium" : "text-muted-foreground"
          )}
        >
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <Label 
          htmlFor="billing-toggle" 
          className={cn(
            "cursor-pointer transition-colors flex items-center gap-2",
            isAnnual ? "text-foreground font-medium" : "text-muted-foreground"
          )}
        >
          Annual
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
            Save 20%
          </Badge>
        </Label>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className={cn(
          "relative overflow-hidden transition-all duration-300",
          currentPlan === 'free' && "ring-2 ring-primary/50"
        )}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">{freePlan.name}</CardTitle>
              {currentPlan === 'free' && (
                <Badge variant="outline" className="text-xs">Current Plan</Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {freePlan.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3">
              {freePlan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              disabled={currentPlan === 'free'}
            >
              {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={cn(
          "relative overflow-hidden transition-all duration-300 border-primary/50",
          isPro && "ring-2 ring-primary",
          proPlan.popular && "shadow-lg shadow-primary/10"
        )}>
          {proPlan.popular && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
              Most Popular
            </div>
          )}
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-semibold">{monthlyPlan.name}</CardTitle>
              </div>
              {isPro && (
                <Badge className="text-xs bg-primary text-primary-foreground">Current Plan</Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {proPlan.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">{formatPrice(proPlan.priceInCents, proPlan.interval)}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            {isAnnual && (
              <p className="text-sm text-muted-foreground mb-6">
                Billed annually (${(proPlan.priceInCents / 100).toFixed(0)}/year)
              </p>
            )}
            {!isAnnual && <div className="mb-6" />}
            <ul className="space-y-3">
              {proPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => onSelectPlan(proPlan.id)}
              disabled={isPro || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isPro ? (
                'Current Plan'
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>256-bit SSL Encryption</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Secure Payment via Stripe</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span>Cancel Anytime</span>
        </div>
      </div>
    </div>
  )
}
