'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { startCheckoutSession, syncSubscriptionFromStripe } from '@/app/actions/stripe-actions'
import { useToast } from '@/hooks/use-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutEmbedProps {
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CheckoutEmbed({ productId, open, onOpenChange, onSuccess }: CheckoutEmbedProps) {
  const { toast } = useToast()
  const [checkoutComplete, setCheckoutComplete] = useState(false)

  const fetchClientSecret = useCallback(
    () => startCheckoutSession(productId),
    [productId]
  )

  const handleComplete = useCallback(async () => {
    setCheckoutComplete(true)
    toast({
      title: "Payment successful!",
      description: "Welcome to Concentrade Pro. Your account has been upgraded.",
    })
    onSuccess?.()
  }, [toast, onSuccess])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setCheckoutComplete(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto p-0">
        <DialogTitle className="sr-only">Checkout</DialogTitle>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Complete Your Purchase</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div id="checkout" className="p-4">
          {!checkoutComplete ? (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ 
                fetchClientSecret,
                onComplete: handleComplete,
              }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary checkmark-animated" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
              <p className="text-muted-foreground mb-4">
                Your subscription has been activated. Enjoy all Pro features!
              </p>
              <Button onClick={() => onOpenChange(false)}>
                Continue to Dashboard
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
