import 'server-only'

import crypto from 'crypto'

// Rapyd API configuration
const RAPYD_ACCESS_KEY = process.env.RAPYD_ACCESS_KEY!
const RAPYD_SECRET_KEY = process.env.RAPYD_SECRET_KEY!
const RAPYD_BASE_URL = process.env.RAPYD_BASE_URL || 'https://sandboxapi.rapyd.net'

/**
 * Generate Rapyd signature for API requests
 * @see https://docs.rapyd.net/en/request-signatures.html
 */
function generateSignature(
  httpMethod: string,
  urlPath: string,
  salt: string,
  timestamp: string,
  body: string = ''
): string {
  const toSign = `${httpMethod}${urlPath}${salt}${timestamp}${RAPYD_ACCESS_KEY}${RAPYD_SECRET_KEY}${body}`
  const hash = crypto.createHmac('sha256', RAPYD_SECRET_KEY)
  hash.update(toSign)
  return Buffer.from(hash.digest('hex')).toString('base64')
}

/**
 * Make authenticated request to Rapyd API
 */
export async function rapydRequest<T = any>(
  method: string,
  path: string,
  body?: any
): Promise<T> {
  const salt = crypto.randomBytes(12).toString('hex')
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const bodyString = body ? JSON.stringify(body) : ''
  
  const signature = generateSignature(
    method.toUpperCase(),
    path,
    salt,
    timestamp,
    bodyString
  )

  const headers: Record<string, string> = {
    'access_key': RAPYD_ACCESS_KEY,
    'salt': salt,
    'timestamp': timestamp,
    'signature': signature,
    'Content-Type': 'application/json',
  }

  const url = `${RAPYD_BASE_URL}${path}`
  
  const response = await fetch(url, {
    method: method.toUpperCase(),
    headers,
    body: bodyString || undefined,
  })

  const data = await response.json()

  if (!response.ok || data.status?.status !== 'SUCCESS') {
    throw new Error(data.status?.message || 'Rapyd API request failed')
  }

  return data.data as T
}

/**
 * Create a Rapyd customer
 */
export async function createRapydCustomer(email: string, name?: string) {
  return rapydRequest<{
    id: string
    email: string
  }>('POST', '/v1/customers', {
    email,
    name: name || email.split('@')[0],
    metadata: {
      created_from: 'trading_journal',
    },
  })
}

/**
 * Create a hosted subscription checkout page
 */
export async function createHostedSubscriptionPage(params: {
  customerId: string
  planId: string
  quantity?: number
  trialPeriodDays?: number
  taxPercent?: number
  cancelUrl: string
  completeUrl: string
  metadata?: Record<string, any>
}) {
  return rapydRequest<{
    id: string
    redirect_url: string
    status: string
  }>('POST', '/v1/checkout/subscription', {
    customer: params.customerId,
    subscription_items: [
      {
        plan: params.planId,
        quantity: params.quantity || 1,
      },
    ],
    billing: 'pay_automatically',
    trial_period_days: params.trialPeriodDays,
    tax_percent: params.taxPercent,
    cancel_checkout_url: params.cancelUrl,
    complete_checkout_url: params.completeUrl,
    metadata: params.metadata,
  })
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return rapydRequest<{
    id: string
    status: string
    customer_token: string
    current_period_start: number
    current_period_end: number
    cancel_at_period_end: boolean
    subscription_items: {
      data: Array<{
        plan: {
          id: string
          amount: number
          currency: string
          interval: string
        }
      }>
    }
  }>('GET', `/v1/payments/subscriptions/${subscriptionId}`)
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
) {
  return rapydRequest('DELETE', `/v1/payments/subscriptions/${subscriptionId}`, {
    cancel_at_period_end: cancelAtPeriodEnd,
  })
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  params: {
    planId?: string
    quantity?: number
    cancelAtPeriodEnd?: boolean
  }
) {
  return rapydRequest('POST', `/v1/payments/subscriptions/${subscriptionId}`, params)
}

/**
 * Create a customer portal session (for managing subscriptions)
 */
export async function createCustomerPortalUrl(
  customerId: string,
  returnUrl: string
): Promise<string> {
  // Rapyd doesn't have a built-in customer portal like Stripe
  // You would need to build your own management page
  // For now, return the subscription management page URL
  return returnUrl
}

export const rapyd = {
  createCustomer: createRapydCustomer,
  createHostedSubscriptionPage,
  getSubscription,
  cancelSubscription,
  updateSubscription,
  createCustomerPortalUrl,
}
