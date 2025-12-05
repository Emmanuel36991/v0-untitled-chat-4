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
    // Return early without Supabase auth check if credentials are missing
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

  // Refresh session if expired - important for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user) {
    // Skip profile setup check if already on signup/login pages
    const isAuthPage =
      request.nextUrl.pathname.startsWith("/signup") ||
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/auth")

    if (!isAuthPage) {
      const { data: userConfig } = await supabase
        .from("user_config_settings")
        .select("config")
        .eq("user_id", session.user.id)
        .maybeSingle()

      // If profile setup is not complete, redirect to profile setup
      const profileSetupComplete = userConfig?.config?.profileSetupComplete ?? false
      if (!profileSetupComplete) {
        const profileSetupUrl = new URL("/signup/profile-setup?step=1", request.url)
        return NextResponse.redirect(profileSetupUrl)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|marketing|login|signup|auth).*)",
  ],
}
