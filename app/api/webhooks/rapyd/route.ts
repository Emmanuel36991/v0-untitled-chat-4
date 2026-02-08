

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// Use service role key for webhooks since there's no user session
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RAPYD_WEBHOOK_SECRET = process.env.RAPYD_WEBHOOK_SECRET!

/**
 * Verify Rapyd webhook signature
 * @see https://docs.rapyd.net/en/webhook-security.html
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  salt: string,
  timestamp: string
): boolean {
  const toVerify = `${salt}${timestamp}${body}`
  const expectedSignature = crypto
    .createHmac('sha256', RAPYD_WEBHOOK_SECRET)
    .update(toVerify)
    .digest('hex')

  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("signature")
  const salt = request.headers.get("salt")
  const timestamp = request.headers.get("timestamp")

  if (!signature || !salt || !timestamp) {
    return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 })
  }

  // Verify webhook signature
  if (!verifyWebhookSignature(body, signature, salt, timestamp)) {
    console.error("Webhook signature verification failed")
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  let event
  try {
    event = JSON.parse(body)
  } catch (err) {
    console.error("Failed to parse webhook body:", err)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const eventType = event.type
  const eventData = event.data

  try {
    switch (eventType) {
      case "PAYMENT_SUCCEEDED": {
        // Payment successful - could be initial payment or recurring
        const subscriptionId = eventData.subscription_id
        const customerId = eventData.customer_id

        console.log(`[v0] Payment succeeded for subscription: ${subscriptionId}`)

        if (subscriptionId) {
          // Update subscription status to active
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("rapyd_subscription_id", subscriptionId)

          if (error) {
            console.error("Error updating subscription after payment:", error)
          }
        }
        break
      }

      case "CUSTOMER_SUBSCRIPTION_CREATED": {
        const subscription = eventData

        console.log(`[v0] Subscription created: ${subscription.id}`)

        // Determine tier from plan amount
        const planAmount = subscription.subscription_items?.data?.[0]?.plan?.amount || 0
        let tier = "free"

        if (planAmount === 1999) {
          tier = "pro"
        } else if (planAmount === 4999) {
          tier = "elite"
        }

        // Find user by customer ID
        const { data: existingSubscription } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("rapyd_customer_id", subscription.customer_token)
          .single()

        if (existingSubscription) {
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              rapyd_subscription_id: subscription.id,
              tier,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existingSubscription.user_id)

          if (error) {
            console.error("Error creating/updating subscription:", error)
          }
        }
        break
      }

      case "SUBSCRIPTION_UPDATED": {
        const subscription = eventData

        console.log(`[v0] Subscription updated: ${subscription.id}`)

        // Determine tier from plan amount
        const planAmount = subscription.subscription_items?.data?.[0]?.plan?.amount || 0
        let tier = "free"

        if (planAmount === 1999) {
          tier = "pro"
        } else if (planAmount === 4999) {
          tier = "elite"
        }

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            tier,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            updated_at: new Date().toISOString(),
          })
          .eq("rapyd_subscription_id", subscription.id)

        if (error) {
          console.error("Error updating subscription:", error)
        }
        break
      }

      case "SUBSCRIPTION_CANCELED": {
        const subscription = eventData

        console.log(`[v0] Subscription canceled: ${subscription.id}`)

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            tier: "free",
            status: "canceled",
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("rapyd_subscription_id", subscription.id)

        if (error) {
          console.error("Error canceling subscription:", error)
        }
        break
      }

      case "INVOICE_PAYMENT_FAILED":
      case "PAYMENT_FAILED": {
        const subscriptionId = eventData.subscription_id

        console.log(`[v0] Payment failed for subscription: ${subscriptionId}`)

        if (subscriptionId) {
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("rapyd_subscription_id", subscriptionId)

          if (error) {
            console.error("Error updating subscription status after failed payment:", error)
          }
        }
        break
      }

      case "SUBSCRIPTION_PAST_DUE": {
        const subscription = eventData

        console.log(`[v0] Subscription past due: ${subscription.id}`)

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("rapyd_subscription_id", subscription.id)

        if (error) {
          console.error("Error updating subscription to past_due:", error)
        }
        break
      }

      case "SUBSCRIPTION_UNPAID": {
        const subscription = eventData

        console.log(`[v0] Subscription unpaid: ${subscription.id}`)

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "unpaid",
            updated_at: new Date().toISOString(),
          })
          .eq("rapyd_subscription_id", subscription.id)

        if (error) {
          console.error("Error updating subscription to unpaid:", error)
        }
        break
      }

      default:
        console.log(`[v0] Unhandled Rapyd webhook event type: ${eventType}`)
    }
  } catch (error) {
    console.error("Error processing Rapyd webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
