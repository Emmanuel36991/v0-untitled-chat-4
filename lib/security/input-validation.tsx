/**
 * Input validation and sanitization utilities
 * Prevents XSS, injection attacks, and malformed input
 */

export interface SanitizeOptions {
  maxLength?: number
  allowHtml?: boolean
  allowNewlines?: boolean
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string, options: SanitizeOptions = {}): string {
  if (!input || typeof input !== "string") {
    return ""
  }

  const { maxLength = 10000, allowHtml = false, allowNewlines = true } = options

  let sanitized = input

  // Trim whitespace
  sanitized = sanitized.trim()

  // Enforce max length
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Remove/escape HTML if not allowed
  if (!allowHtml) {
    sanitized = sanitized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
  }

  // Remove control characters except newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\n\r\t]/g, " ")
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "")

  // Remove script-like patterns
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, "")
  sanitized = sanitized.replace(/javascript:/gi, "")
  sanitized = sanitized.replace(/on\w+\s*=/gi, "")

  return sanitized
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password)

  return hasUppercase && hasLowercase && hasNumbers && hasSpecialChar
}

/**
 * Sanitize field names and prevent SQL injection patterns
 */
export function sanitizeFieldName(field: string): string {
  if (!field || typeof field !== "string") {
    return ""
  }

  // Allow only alphanumeric and underscore
  return field.replace(/[^a-zA-Z0-9_]/g, "").substring(0, 100)
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "file"
  }

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/\.{2,}/g, ".")
    .substring(0, 255)
}
