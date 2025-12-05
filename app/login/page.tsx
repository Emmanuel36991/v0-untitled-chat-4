"use client"

import React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AnimatedTradingBackground } from "@/components/animated-trading-background"
import { ConcentradeLogo } from "@/components/concentrade-logo"

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log("[v0] Login error caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
          <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
              <p className="text-slate-600 mb-4">Please refresh the page to try again.</p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: userConfig } = await supabase
          .from("user_config_settings")
          .select("config")
          .eq("user_id", user.id)
          .maybeSingle()

        // Redirect to profile setup if not complete, otherwise to dashboard
        const profileSetupComplete = userConfig?.config?.profileSetupComplete ?? false
        if (!profileSetupComplete) {
          router.push("/signup/profile-setup?step=1")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative overflow-hidden">
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
                    Welcome Back, Trader
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed drop-shadow-md font-sans">
                    Continue your trading journey with advanced analytics and performance tracking.
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="badge-animated px-4 py-2 bg-emerald-100/90 text-emerald-800 border-emerald-200/50 backdrop-blur-sm"
                  >
                    <svg
                      className="w-4 h-4 mr-2 icon-animated"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 6L9 17L4 12L1 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Secure Login
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="badge-animated px-4 py-2 bg-blue-100/90 text-blue-800 border-blue-200/50 backdrop-blur-sm"
                  >
                    <svg
                      className="w-4 h-4 mr-2 icon-animated"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Real-time Data
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="badge-animated px-4 py-2 bg-purple-100/90 text-purple-800 border-purple-200/50 backdrop-blur-sm"
                  >
                    <svg
                      className="w-4 h-4 mr-2 icon-animated"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M23 6L13.5 15.5L8.5 10.5L1 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17 6H23V12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Advanced Analytics
                  </Badge>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-purple-200/40 backdrop-blur-md shadow-lg animate-float">
                  <div className="flex items-center gap-3 mb-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon-animated"
                    >
                      <path
                        d="M23 6L13.5 15.5L8.5 10.5L1 18"
                        stroke="#A855F7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17 6H23V12"
                        stroke="#A855F7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-semibold text-white font-sans">Welcome Back!</span>
                  </div>
                  <p className="text-sm text-white/95 font-sans leading-relaxed">
                    Access your personalized trading dashboard with real-time insights and performance analytics.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex justify-center lg:justify-end">
              <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border-0 shadow-2xl card-enhanced animate-scale-in">
                <CardHeader className="space-y-4 pb-6">
                  <div className="text-center">
                    <CardTitle className="text-2xl font-bold text-slate-900 font-sans">
                      Sign In to Your Account
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-2 font-sans">
                      Enter your credentials to access your trading dashboard
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-5 form-container">
                    {error && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50 animate-slide-fade">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-700 font-sans">{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 font-sans">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-enhanced pl-10 h-12 border-2 focus:border-purple-500 bg-white/80 font-sans"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700 font-sans">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-enhanced pl-10 pr-10 h-12 border-2 focus:border-purple-500 bg-white/80 font-sans"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-sm text-purple-600 hover:text-purple-700 underline font-sans transition-colors"
                      >
                        Forgot your password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="btn-enhanced w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 font-sans"
                    >
                      {isLoading ? (
                        <>
                          <div className="spinner-enhanced animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-5 w-5 icon-animated" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500 font-sans">Don't have an account?</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <Link href="/signup">
                      <Button
                        variant="outline"
                        className="btn-enhanced w-full h-12 border-2 hover:bg-slate-50 bg-transparent font-sans"
                      >
                        Create New Account
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
