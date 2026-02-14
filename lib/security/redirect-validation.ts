import { headers } from "next/headers"

/**
 * Validates a redirect URL against an allowlist.
 * Ensures the URL is relative or matches the allowed domains.
 */
export function getSafeRedirectUrl(url: string | null, defaultUrl: string = "/dashboard"): string {
    if (!url) return defaultUrl

    // 1. Check for relative URLs (must start with / and NOT //)
    if (url.startsWith("/") && !url.startsWith("//")) {
        return url
    }

    // 2. Check for absolute URLs match the current origin or allowed domains
    try {
        const urlObj = new URL(url)

        // Allow if it matches the site URL
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        if (siteUrl && url.startsWith(siteUrl)) {
            return url
        }

        // Allow internal calls (sanity check, usually caught by relative check)
        // We can't easily get request origin here without passing it in, 
        // so we rely on relative paths for internal redirects mostly.

        // If strict validation is needed for absolute URLs from other domains:
        // const allowedDomains = ["example.com", "sub.example.com"]
        // if (allowedDomains.includes(urlObj.hostname)) return url;

    } catch (e) {
        // Invalid URL
    }

    // Default to safe path
    return defaultUrl
}

/**
 * Helper to ensure the redirect URL is safe to use in NextResponse.redirect()
 * It combines the origin with the safe path.
 */
export function getAbsoluteRedirectUrl(path: string, origin: string): string {
    const safePath = getSafeRedirectUrl(path)
    return new URL(safePath, origin).toString()
}
