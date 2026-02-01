'use server'

import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { PRODUCTS, getProductById } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

export async function startCheckoutSession(productId: string) {
  const product = getProductById(productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  if (product.priceInCents === 0) {
    throw new Error('Cannot checkout free product')
  }

  // Get current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to start checkout')
  }

  // Check if user already has a Stripe customer ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    customer: subscription?.stripe_customer_id || undefined,
    customer_email: !subscription?.stripe_customer_id ? user.email : undefined,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          recurring: product.interval !== 'one_time' ? {
            interval: product.interval,
          } : undefined,
        },
        quantity: 1,
      },
    ],
    mode: product.interval !== 'one_time' ? 'subscription' : 'payment',
    metadata: {
      user_id: user.id,
      product_id: product.id,
    },
  })

  return session.client_secret
}

export async function createCustomerPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Get user's Stripe customer ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    throw new Error('No subscription found for user')
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${origin}/subscription`,
  })

  return portalSession.url
}

export async function getSubscriptionStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      status: 'free' as const,
      plan: 'free',
      isActive: false,
    }
  }

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !subscription) {
    return {
      status: 'free' as const,
      plan: 'free',
      isActive: false,
    }
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing'

  return {
    status: subscription.status,
    plan: subscription.plan_id || 'free',
    isActive,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  }
}

export async function syncSubscriptionFromStripe(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Retrieve the checkout session
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  })

  if (session.payment_status !== 'paid') {
    throw new Error('Payment not completed')
  }

  const subscription = session.subscription as Stripe.Subscription | null
  const customer = session.customer as Stripe.Customer | null

  // Upsert subscription data
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      stripe_customer_id: customer?.id || session.customer as string,
      stripe_subscription_id: subscription?.id || null,
      status: subscription?.status || 'active',
      plan_id: session.metadata?.product_id || 'pro-monthly',
      current_period_start: subscription?.current_period_start 
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : new Date().toISOString(),
      current_period_end: subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription?.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })

  if (error) {
    console.error('Failed to sync subscription:', error)
    throw new Error('Failed to sync subscription')
  }

  return { success: true }
}
