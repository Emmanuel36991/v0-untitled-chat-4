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
    <div className="min-h-screen relative overflow-hidden bg-white text-slate-900" suppressHydrationWarning>
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
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
                    Google
                  </Button>
                  <Button variant="outline" onClick={() => handleSocialLogin('github')} className="w-full h-11 border-2 hover:bg-slate-50">
                    <Github className="mr-2 h-4 w-4" /> GitHub
                  </Button>
                </div>

                <div className="text-center mt-4">
                  {/* FIX IS HERE: Button with onClick, NO LINK WRAPPER */}
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
      <AnimatedTradingBackground />
    </div>
  )
}
