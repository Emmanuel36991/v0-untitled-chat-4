// In-memory rate limiter store (resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Counter for periodic cleanup
let invocationCount = 0
const CLEANUP_INTERVAL = 100

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
 * Periodic cleanup of expired entries to prevent memory leak.
 * Runs every CLEANUP_INTERVAL invocations.
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Simple in-memory rate limiter
 * Tracks requests per key with a sliding window
 */
export function rateLimiter(config: RateLimitConfig): RateLimitResult {
  // Periodic cleanup to prevent memory leak from abandoned keys
  invocationCount++
  if (invocationCount % CLEANUP_INTERVAL === 0) {
    cleanupExpiredEntries()
  }

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
 * Generate a rate limit key from request headers (fallback when no user)
 */
export function getRateLimitKey(endpoint: string): string {
  return `${endpoint}:global`
}

/**
 * Per-IP rate limit key (prevents one user from blocking everyone)
 */
export function getRateLimitKeyForIP(endpoint: string, ip: string): string {
  return `${endpoint}:ip:${ip}`
}

/**
 * Per-user rate limit key for authenticated AI endpoints (prevents abuse, fair usage)
 */
export function getRateLimitKeyForUser(endpoint: string, userId: string): string {
  return `${endpoint}:user:${userId}`
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
