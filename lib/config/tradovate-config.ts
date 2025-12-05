export const TRADOVATE_CONFIG = {
  DEMO_URL: "https://demo-api-d.tradovate.com/v1",
  LIVE_URL: "https://api.tradovate.com/v1",
  APP_ID: "TradingTracker",
  APP_VERSION: "1.0.0",
  CID: 1,
  SEC: "MainAccount",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MAX_REQUESTS_PER_MINUTE: 60,
  DEFAULT_PAGE_SIZE: 100,
  MAX_PAGE_SIZE: 500,
}

export function validateTradovateConfig() {
  const missing: string[] = []

  // Check if we have the basic configuration
  if (!TRADOVATE_CONFIG.DEMO_URL) missing.push("DEMO_URL")
  if (!TRADOVATE_CONFIG.LIVE_URL) missing.push("LIVE_URL")
  if (!TRADOVATE_CONFIG.APP_ID) missing.push("APP_ID")

  return {
    isValid: missing.length === 0,
    missing,
    config: TRADOVATE_CONFIG,
  }
}
