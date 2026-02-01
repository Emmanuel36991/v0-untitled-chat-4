'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { startCheckoutSession } from '@/app/actions/stripe-actions'
import { Card } from '@/components/ui/card'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutEmbedProps {
  productId: string
}

export function CheckoutEmbed({ productId }: CheckoutEmbedProps) {
  const router = useRouter()

  const fetchClientSecret = useCallback(
    () => startCheckoutSession(productId),
    [productId]
  )

  const handleComplete = useCallback(async () => {
    // Redirect to success page
    router.push('/get-started/success')
  }, [router])

  return (
    <Card className="overflow-hidden">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ 
          fetchClientSecret,
          onComplete: handleComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </Card>
  )
}
