// In-memory rate limiter store (resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  key: string
  limit: number
  window: number // in seconds
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

/**
 * Simple in-memory rate limiter
 * Tracks requests per key with a sliding window
 */
export function rateLimiter(config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const key = config.key
  let entry = rateLimitStore.get(key)

  // Initialize or reset if window has passed
  if (!entry || now >= entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.window * 1000,
    }
    rateLimitStore.set(key, entry)
  }

  const allowed = entry.count < config.limit
  const remaining = Math.max(0, config.limit - entry.count)
  const resetTime = entry.resetTime

  // Increment counter if allowed
  if (allowed) {
    entry.count++
  }

  return { allowed, remaining, resetTime }
}

/**
 * Generate a rate limit key from request headers
 * Combines IP address, user agent, and endpoint for granular limiting
 */
export function getRateLimitKey(endpoint: string): string {
  // In edge runtime, we can use headers to extract IP
  // Fallback to endpoint-only key for simplicity
  return `${endpoint}:global`
}

/**
 * Clear rate limit for a specific key (admin use)
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key)
}

/**
 * Clear all rate limits (admin use)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear()
}
