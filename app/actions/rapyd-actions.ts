'use server'

import { headers } from 'next/headers'
import { rapyd } from '@/lib/rapyd'
import { PRODUCTS, getProductById } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

// Mapping of product IDs to Rapyd plan IDs
// You'll need to create these plans in Rapyd dashboard first
const PRODUCT_TO_PLAN_MAP: Record<string, string> = {
  'pro-monthly': process.env.RAPYD_PLAN_PRO_MONTHLY || 'plan_pro_monthly',
  'elite-monthly': process.env.RAPYD_PLAN_ELITE_MONTHLY || 'plan_elite_monthly',
}

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

  // Check if user already has a Rapyd customer ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('rapyd_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = subscription?.rapyd_customer_id

  // Create Rapyd customer if doesn't exist
  if (!customerId) {
    const customer = await rapyd.createCustomer(
      user.email!,
      user.user_metadata?.full_name
    )
    customerId = customer.id

    // Store customer ID
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        rapyd_customer_id: customerId,
        status: 'incomplete',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
  }

  // Get Rapyd plan ID from our product mapping
  const planId = PRODUCT_TO_PLAN_MAP[productId]
  if (!planId) {
    throw new Error(`No Rapyd plan configured for product: ${productId}`)
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  // Create hosted checkout page
  const checkoutPage = await rapyd.createHostedSubscriptionPage({
    customerId,
    planId,
    quantity: 1,
    cancelUrl: `${origin}/get-started`,
    completeUrl: `${origin}/get-started/success`,
    metadata: {
      user_id: user.id,
      product_id: product.id,
    },
  })

  return checkoutPage.redirect_url
}

export async function createCustomerPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Get user's Rapyd customer ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('rapyd_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.rapyd_customer_id) {
    throw new Error('No subscription found for user')
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  // Since Rapyd doesn't have a built-in portal, redirect to our subscription management page
  return `${origin}/subscription`
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

export async function syncSubscriptionFromRapyd(subscriptionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Retrieve the subscription from Rapyd
  const rapydSubscription = await rapyd.getSubscription(subscriptionId)

  // Upsert subscription data
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      rapyd_customer_id: rapydSubscription.customer_token,
      rapyd_subscription_id: rapydSubscription.id,
      status: rapydSubscription.status,
      plan_id: 'pro-monthly', // You'll need to map this based on the plan
      current_period_start: new Date(rapydSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(rapydSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: rapydSubscription.cancel_at_period_end || false,
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

export async function cancelUserSubscription(cancelAtPeriodEnd: boolean = true) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('rapyd_subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.rapyd_subscription_id) {
    throw new Error('No active subscription found')
  }

  await rapyd.cancelSubscription(subscription.rapyd_subscription_id, cancelAtPeriodEnd)

  // Update local database
  await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  return { success: true }
}
