import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // In Edge Runtime, we need to use NEXT_PUBLIC_ prefixed variables
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

  // Refresh session if expired
  await supabase.auth.getSession()

  // FIXED: Removed the profile setup check block entirely.
  // The middleware now simply refreshes the session and allows navigation to proceed.

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - marketing (public marketing page)
     * - login (auth page)
     * - signup (auth page)
     * - auth (auth callbacks)
     */
    "/((?!_next/static|_next/image|favicon.ico|marketing|login|signup|auth).*)",
  ],
}
