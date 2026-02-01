'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startCheckoutSession } from '@/app/actions/rapyd-actions'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface CheckoutEmbedProps {
  productId: string
}

export function CheckoutEmbed({ productId }: CheckoutEmbedProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeCheckout() {
      try {
        setLoading(true)
        const url = await startCheckoutSession(productId)
        setCheckoutUrl(url)
      } catch (err) {
        console.error('Failed to initialize checkout:', err)
        setError(err instanceof Error ? err.message : 'Failed to load checkout')
      } finally {
        setLoading(false)
      }
    }

    initializeCheckout()
  }, [productId])

  if (loading) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading secure checkout...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="text-destructive">Failed to load checkout</div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </Card>
    )
  }

  if (!checkoutUrl) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground">Unable to load checkout</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <iframe
        src={checkoutUrl}
        className="w-full min-h-[600px] border-0"
        title="Rapyd Checkout"
        style={{ height: '600px' }}
      />
    </Card>
  )
}
