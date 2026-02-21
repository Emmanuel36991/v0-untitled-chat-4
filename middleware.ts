import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { rateLimiter, getRateLimitKeyForIP } from "@/lib/security/rate-limiter"

// Endpoint-specific rate limit configs
const ENDPOINT_LIMITS: { path: string; limit: number; window: number }[] = [
  { path: "/api/tradovate/auth", limit: 5, window: 900 },   // 5 per 15 min (brute-force protection)
  { path: "/api/trades/sample", limit: 3, window: 900 },    // 3 per 15 min (prevent DB flooding)
  { path: "/api/ohlc", limit: 30, window: 60 },             // 30 per min (protect Finnhub API key)
]

function getClientIP(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.ip || "unknown"
}

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const clientIP = getClientIP(request)

    // Check endpoint-specific limits first
    for (const ep of ENDPOINT_LIMITS) {
      if (request.nextUrl.pathname.startsWith(ep.path)) {
        const epLimit = rateLimiter({
          key: getRateLimitKeyForIP(ep.path, clientIP),
          limit: ep.limit,
          window: ep.window,
        })
        if (!epLimit.allowed) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { "Content-Type": "application/json", "Retry-After": String(ep.window) },
          })
        }
        break
      }
    }

    // General per-IP rate limit: 100 requests per minute
    const limit = rateLimiter({
      key: getRateLimitKeyForIP("api", clientIP),
      limit: 100,
      window: 60,
    })

    if (!limit.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Supabase Setup
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options) {
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options) {
        response.cookies.delete({
          name,
          ...options,
        })
      },
    },
  })

  // 3. Refresh Session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 4. Define Public Routes
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/marketing") ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/forgot-password") ||
    request.nextUrl.pathname.startsWith("/reset-password") ||
    request.nextUrl.pathname.startsWith("/api/webhooks") // Allow webhooks

  // 5. Block unauthenticated access to protected routes
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 6. Paywall: Check subscription status for authenticated users
  // TEMPORARY: Paywall disabled for testing - Uncomment when re-enabling payments
  /*
  if (session && !isPublicRoute) {
    const isPaywallRoute = request.nextUrl.pathname.startsWith("/get-started")
    const isWebhook = request.nextUrl.pathname.startsWith("/api/webhooks")
    
    // Skip paywall check for paywall page itself and webhooks
    if (!isPaywallRoute && !isWebhook) {
      try {
        // Check if user has active subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', session.user.id)
          .single()

        // If no subscription or inactive, redirect to paywall
        if (!subscriptionData || subscriptionData.status !== 'active') {
          return NextResponse.redirect(new URL("/get-started", request.url))
        }
      } catch (error) {
        // If error checking subscription (e.g., table doesn't exist), redirect to paywall
        console.error("Error checking subscription:", error)
        return NextResponse.redirect(new URL("/get-started", request.url))
      }
    }
  }
  */

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
