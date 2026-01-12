import { createHash, randomBytes } from "crypto"

/**
 * CSRF token generation and validation
 * Creates cryptographically secure tokens for form protection
 */

const CSRF_TOKEN_LENGTH = 32
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

// In-memory store for CSRF tokens (should use Redis in production)
const csrfTokenStore = new Map<
  string,
  {
    token: string
    hash: string
    createdAt: number
  }
>()

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(userId?: string): string {
  const randomPart = randomBytes(CSRF_TOKEN_LENGTH).toString("hex")
  const timestamp = Date.now().toString()
  const token = `${randomPart}.${timestamp}`

  // Create hash of token
  const hash = createHash("sha256").update(token).digest("hex")

  // Store token with expiry
  const key = userId || "guest"
  csrfTokenStore.set(hash, {
    token,
    hash,
    createdAt: Date.now(),
  })

  return token
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  if (!token || typeof token !== "string") {
    return false
  }

  const hash = createHash("sha256").update(token).digest("hex")
  const entry = csrfTokenStore.get(hash)

  if (!entry) {
    return false
  }

  // Check expiry
  const age = Date.now() - entry.createdAt
  if (age > CSRF_TOKEN_EXPIRY) {
    csrfTokenStore.delete(hash)
    return false
  }

  // Token is valid, remove it (one-time use)
  csrfTokenStore.delete(hash)

  return true
}

/**
 * Clear expired CSRF tokens (call periodically)
 */
export function clearExpiredCSRFTokens(): void {
  const now = Date.now()

  for (const [key, entry] of csrfTokenStore.entries()) {
    if (now - entry.createdAt > CSRF_TOKEN_EXPIRY) {
      csrfTokenStore.delete(key)
    }
  }
}

/**
 * Clear all CSRF tokens for a user (on logout)
 */
export function clearUserCSRFTokens(userId: string): void {
  for (const [key] of csrfTokenStore.entries()) {
    csrfTokenStore.delete(key)
  }
}
