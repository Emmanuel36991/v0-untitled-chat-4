"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Mail, Lock, Eye, EyeOff, ArrowRight, Github, Check, X } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AnimatedTradingBackground } from "@/components/animated-trading-background"
import { ConcentradeLogo } from "@/components/concentrade-logo"

// Password strength calculation helper
const calculatePasswordStrength = (pass: string) => {
  let score = 0
  if (!pass) return 0
  if (pass.length >= 8) score++
  if (/[0-9]/.test(pass)) score++
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++
  return score
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [strength, setStrength] = useState(0)
  
  const router = useRouter()

  // Force light mode on mount
  React.useEffect(() => {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
    return () => {
      document.documentElement.classList.remove('light')
    }
  }, [])

  useEffect(() => {
    setStrength(calculatePasswordStrength(password))
  }, [password])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (strength < 2) {
       setError("Please choose a stronger password")
       setIsLoading(false)
       return
    }

    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirect to paywall after signup
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/get-started`,
        },
      })

      if (error) throw error

      if (data?.user) {
        router.push("/signup/sign-up-success")
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const supabase = createClient()
    
    // Use production URL or fallback to current origin
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
    <div className="min-h-screen relative overflow-hidden bg-white text-slate-900">
      <AnimatedTradingBackground />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Branding */}
          <div className="space-y-8 branding-section">
            <div className="space-y-6">
              <div className="flex items-center animate-bounce-in">
                <ConcentradeLogo size={60} className="drop-shadow-lg" />
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg font-sans">
                  Start Your Trading Journey
                </h2>
                <p className="text-xl text-white/90 leading-relaxed drop-shadow-md font-sans">
                  Join thousands of traders using advanced analytics to improve their performance.
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="secondary" className="px-4 py-2 bg-emerald-100/90 text-emerald-800 border-emerald-200/50 backdrop-blur-sm">Free to Start</Badge>
                <Badge variant="secondary" className="px-4 py-2 bg-blue-100/90 text-blue-800 border-blue-200/50 backdrop-blur-sm">Instant Setup</Badge>
                <Badge variant="secondary" className="px-4 py-2 bg-purple-100/90 text-purple-800 border-purple-200/50 backdrop-blur-sm">Pro Analytics</Badge>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border-0 shadow-2xl card-enhanced animate-scale-in">
              <CardHeader className="space-y-4 pb-6">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold text-slate-900 font-sans">Create Account</CardTitle>
                  <CardDescription className="text-slate-600 mt-2 font-sans">
                    Sign up to start tracking your trading performance
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 animate-slide-fade">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-700 font-sans">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 border-2 focus:border-purple-500 bg-white/80 font-sans"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 border-2 focus:border-purple-500 bg-white/80 font-sans"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {password && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex gap-1 h-1.5">
                          <div className={`flex-1 rounded-full transition-colors duration-300 ${strength >= 1 ? 'bg-red-500' : 'bg-slate-200'}`} />
                          <div className={`flex-1 rounded-full transition-colors duration-300 ${strength >= 2 ? 'bg-orange-500' : 'bg-slate-200'}`} />
                          <div className={`flex-1 rounded-full transition-colors duration-300 ${strength >= 3 ? 'bg-yellow-500' : 'bg-slate-200'}`} />
                          <div className={`flex-1 rounded-full transition-colors duration-300 ${strength >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 border-2 focus:border-purple-500 bg-white/80 font-sans"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 font-sans"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
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
                  <Link href="/login">
                    <Button variant="ghost" className="w-full text-slate-600 hover:text-purple-600">Already have an account? Sign In</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
