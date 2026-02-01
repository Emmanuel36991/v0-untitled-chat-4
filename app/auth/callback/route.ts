import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // "next" is where to redirect after successful login (default to dashboard)
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // We need to set cookies before redirecting
            request.cookies.set(name, value, options)
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.delete(name)
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user has completed profile setup
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user_config exists and profileSetupComplete is true
        const { data: configData } = await supabase
          .from("user_config_settings")
          .select("config")
          .eq("user_id", user.id)
          .maybeSingle()
        
        // If no config record exists, this is a new user - redirect to profile setup
        // If config exists but profileSetupComplete is false, also redirect to profile setup
        const config = configData?.config as any
        const profileSetupComplete = config?.profileSetupComplete ?? false
        
        if (!configData || !profileSetupComplete) {
          const response = NextResponse.redirect(`${origin}/signup/profile-setup?step=1`)
          return response
        }
      }
      
      // Profile setup is complete, proceed to dashboard
      const response = NextResponse.redirect(`${origin}${next}`)
      return response
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
