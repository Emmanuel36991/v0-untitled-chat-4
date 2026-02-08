

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia", // Updated to match type definition. Wait, error said 2026-01-28.clover. I will try that one.
})

// Use service role key for webhooks since there's no user session
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as any

          const userId = session.metadata?.userId
          if (!userId) {
            console.error("No userId in session metadata")
            break
          }

          // Get price ID to determine tier
          const priceId = subscription.items.data[0]?.price.id
          let tier = "free"

          // Map price IDs to tiers (you'll need to update these with actual Stripe price IDs)
          if (priceId?.includes("pro") || subscription.items.data[0]?.price.unit_amount === 1999) {
            tier = "pro"
          } else if (priceId?.includes("elite") || subscription.items.data[0]?.price.unit_amount === 4999) {
            tier = "elite"
          }

          // Upsert subscription record
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              tier,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_id"
            })

          if (error) {
            console.error("Error upserting subscription:", error)
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any

        // Get price ID to determine tier
        const priceId = subscription.items.data[0]?.price.id
        let tier = "free"

        if (priceId?.includes("pro") || subscription.items.data[0]?.price.unit_amount === 1999) {
          tier = "pro"
        } else if (priceId?.includes("elite") || subscription.items.data[0]?.price.unit_amount === 4999) {
          tier = "elite"
        }

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            tier,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (error) {
          console.error("Error updating subscription:", error)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            tier: "free",
            status: "canceled",
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (error) {
          console.error("Error canceling subscription:", error)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any

        if (invoice.subscription) {
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription as string)

          if (error) {
            console.error("Error updating subscription status:", error)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
