import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { rateLimiter, getRateLimitKey } from "@/lib/security/rate-limiter"

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimitKey = getRateLimitKey("api")
    const limit = rateLimiter({
      key: rateLimitKey,
      limit: 100,
      window: 60, // 100 requests per minute
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
    request.nextUrl.pathname.startsWith("/reset-password")

  // 5. Block unauthenticated access to protected routes
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // --- REMOVED: Redirect authenticated users away from auth pages ---
  // The block that forced logged-in users to /dashboard has been deleted.

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
