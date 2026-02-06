"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, AlertCircle } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { createClient } from "@/lib/supabase/client"
import { AnimatedTradingBackground } from "@/components/animated-trading-background"
import { ConcentradeLogo } from "@/components/concentrade-logo"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  // 1. Safe Theme Force (Prevents conflicts with system theme)
  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userConfig } = await supabase
          .from("user_config_settings")
          .select("config")
          .eq("user_id", user.id)
          .maybeSingle()

        const profileSetupComplete = userConfig?.config?.profileSetupComplete ?? false
        
        if (!profileSetupComplete) {
          router.push("/signup/profile-setup?step=1")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const supabase = createClient()
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`
      : `${window.location.origin}/auth/callback?next=/dashboard`
    
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    })
  }

  return (
    // 2. Outer Suppression to catch any stray extension injections
    <div className="min-h-screen relative overflow-hidden bg-white text-slate-900" suppressHydrationWarning>
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-6">
              <div className="flex items-center">
                <ConcentradeLogo size={60} className="drop-shadow-lg" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg font-sans">
                  Welcome Back, Trader
                </h2>
                <p className="text-xl text-white/90 leading-relaxed drop-shadow-md font-sans">
                  Continue your trading journey with advanced analytics.
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="secondary" className="px-4 py-2 bg-emerald-100/90 text-emerald-800 border-emerald-200/50 backdrop-blur-sm">Secure Login</Badge>
                <Badge variant="secondary" className="px-4 py-2 bg-blue-100/90 text-blue-800 border-blue-200/50 backdrop-blur-sm">Real-time Data</Badge>
                <Badge variant="secondary" className="px-4 py-2 bg-purple-100/90 text-purple-800 border-purple-200/50 backdrop-blur-sm">Advanced Analytics</Badge>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader className="space-y-4 pb-6">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold text-slate-900 font-sans">Sign In</CardTitle>
                  <CardDescription className="text-slate-600 mt-2 font-sans">Enter your credentials to access your dashboard</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {/* 3. CRITICAL FIX: Suppress Hydration Warning on Input Wrapper */}
                    <div className="relative" suppressHydrationWarning>
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="pl-10 h-12 border-2 bg-white/80" 
                        disabled={isLoading} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    {/* 3. CRITICAL FIX: Suppress Hydration Warning on Input Wrapper */}
                    <div className="relative" suppressHydrationWarning>
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter your password" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="pl-10 pr-10 h-12 border-2 bg-white/80" 
                        disabled={isLoading} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe} 
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-slate-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                      >
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 underline">Forgot password?</Link>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {isLoading ? "Signing In..." : "Sign In"} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => handleSocialLogin('google')} className="w-full h-11 border-2 hover:bg-slate-50">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Google
                  </Button>
                  <Button variant="outline" onClick={() => handleSocialLogin('github')} className="w-full h-11 border-2 hover:bg-slate-50">
                    <Github className="mr-2 h-4 w-4" /> GitHub
                  </Button>
                </div>

                <div className="text-center mt-4">
                  {/* 4. CRITICAL FIX: Use onClick instead of wrapping Button in Link */}
                  <Button 
                    variant="ghost" 
                    className="w-full text-slate-600" 
                    onClick={() => router.push('/signup')}
                  >
                    Don&apos;t have an account? Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* 5. MOVED TO BOTTOM: Background component is isolated here */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AnimatedTradingBackground />
      </div>
    </div>
  )
}
