"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

export type SubscriptionTier = "free" | "pro" | "elite"
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "paused" | "unpaid"

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  tier: SubscriptionTier
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

const fetcher = async (): Promise<Subscription | null> => {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription:", error)
    return null
  }

  return data as Subscription | null
}

export function useSubscription() {
  const { data: subscription, error, isLoading, mutate } = useSWR<Subscription | null>(
    "subscription",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const isPro = subscription?.tier === "pro" || subscription?.tier === "elite"
  const isElite = subscription?.tier === "elite"
  const isActive = subscription?.status === "active" || subscription?.status === "trialing"
  const hasActiveSubscription = isPro && isActive

  return {
    subscription,
    isLoading,
    error,
    isPro,
    isElite,
    isActive,
    hasActiveSubscription,
    tier: subscription?.tier || "free",
    refresh: mutate,
  }
}

// Feature flags based on subscription tier
export function useFeatureAccess() {
  const { tier, hasActiveSubscription } = useSubscription()

  return {
    // Free tier features
    canAddTrades: true,
    canViewDashboard: true,
    canViewBasicAnalytics: true,
    maxTradesPerMonth: tier === "free" ? 50 : tier === "pro" ? 500 : Infinity,
    
    // Pro tier features
    canAccessAICoach: hasActiveSubscription,
    canAccessAdvancedAnalytics: hasActiveSubscription,
    canAccessBacktesting: hasActiveSubscription,
    canExportData: hasActiveSubscription,
    canAccessPsychologyJournal: hasActiveSubscription,
    
    // Elite tier features
    canAccessSocialInsights: tier === "elite",
    canAccessPrioritySupport: tier === "elite",
    canAccessCustomReports: tier === "elite",
    unlimitedTrades: tier === "elite",
  }
}
