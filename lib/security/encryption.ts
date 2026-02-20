import crypto from "crypto"

/**
 * AES-256-GCM encryption for sensitive credentials stored in the database.
 *
 * Requires CREDENTIALS_ENCRYPTION_KEY env var (64-char hex = 32 bytes).
 * Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  const key = process.env.CREDENTIALS_ENCRYPTION_KEY
  if (!key) {
    throw new Error(
      "CREDENTIALS_ENCRYPTION_KEY environment variable is required. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    )
  }
  if (key.length !== 64) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)")
  }
  return Buffer.from(key, "hex")
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a base64 string in the format: iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, "utf8", "base64")
  encrypted += cipher.final("base64")

  const authTag = cipher.getAuthTag()

  // Combine iv + authTag + ciphertext, separated by ":"
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`
}

/**
 * Decrypt a string encrypted with encrypt().
 * Expects the format: iv:authTag:ciphertext (all base64)
 */
export function decrypt(encryptedString: string): string {
  const key = getEncryptionKey()
  const parts = encryptedString.split(":")

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted string format")
  }

  const iv = Buffer.from(parts[0], "base64")
  const authTag = Buffer.from(parts[1], "base64")
  const ciphertext = parts[2]

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, "base64", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

/**
 * Encrypt a JSON-serializable object (e.g. API credentials).
 */
export function encryptCredentials(credentials: Record<string, unknown>): string {
  return encrypt(JSON.stringify(credentials))
}

/**
 * Decrypt credentials back to a JSON object.
 */
export function decryptCredentials<T = Record<string, unknown>>(encryptedCredentials: string): T {
  return JSON.parse(decrypt(encryptedCredentials)) as T
}
