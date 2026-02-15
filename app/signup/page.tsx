"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, Github, AlertCircle, Check } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { createClient } from "@/lib/supabase/client"
import { ConcentradeLogo } from "@/components/concentrade-logo"

const calculatePasswordStrength = (pass: string) => {
  let score = 0
  if (!pass) return 0
  if (pass.length >= 8) score++
  if (/[0-9]/.test(pass)) score++
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++
  return score
}

const getStrengthLabel = (strength: number) => {
  switch (strength) {
    case 0:
      return { label: "Too weak", color: "text-slate-600" }
    case 1:
      return { label: "Weak", color: "text-red-400" }
    case 2:
      return { label: "Fair", color: "text-amber-400" }
    case 3:
      return { label: "Good", color: "text-amber-400" }
    case 4:
      return { label: "Strong", color: "text-emerald-400" }
    default:
      return { label: "", color: "" }
  }
}

const strengthBarColors: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-amber-500",
  3: "bg-amber-500",
  4: "bg-emerald-500",
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
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
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

  const handleSocialLogin = async (provider: "google" | "github") => {
    const supabase = createClient()
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`
      : `${window.location.origin}/auth/callback?next=/dashboard`

    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl },
    })
  }

  const strengthInfo = getStrengthLabel(strength)
  const passwordsMatch = confirmPassword && password === confirmPassword

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 border-r border-slate-800/50">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Animated gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px]">
          <div
            className="absolute inset-0 rounded-full opacity-[0.08] animate-pulse"
            style={{
              background: "radial-gradient(circle, rgb(99,102,241) 0%, rgb(79,70,229) 30%, transparent 70%)",
              animationDuration: "4s",
            }}
          />
        </div>

        {/* Accent line */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent" />

        <motion.div
          className="relative z-10 flex flex-col justify-center px-16 py-12"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-12">
            <ConcentradeLogo size={60} theme="dark" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
            Start Your
            <span className="block bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Trading Success
            </span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md leading-relaxed mt-2">
            Join thousands of traders using AI-powered analytics to sharpen their edge.
          </p>
        </motion.div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="lg:hidden flex justify-center mb-8">
            <ConcentradeLogo size={48} />
          </div>

          {/* Card */}
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Create your account</h2>
              <p className="text-slate-500 text-sm">Join Concentrade and unlock your trading potential</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-5">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-4 h-11 bg-slate-950/60 border-slate-800 text-slate-200 rounded-xl placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                  disabled={isLoading}
                  suppressHydrationWarning
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-4 pr-11 h-11 bg-slate-950/60 border-slate-800 text-slate-200 rounded-xl placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                    disabled={isLoading}
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1.5 pt-1.5">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                            strength >= level
                              ? strengthBarColors[level] || "bg-slate-700"
                              : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strengthInfo.color}`}>
                      Password strength: {strengthInfo.label}
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-4 pr-11 h-11 bg-slate-950/60 border-slate-800 text-slate-200 rounded-xl placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${
                      confirmPassword && (passwordsMatch ? "border-emerald-500/50" : "border-red-500/50")
                    }`}
                    disabled={isLoading}
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {confirmPassword && passwordsMatch && (
                    <div className="absolute right-11 top-1/2 -translate-y-1/2 text-emerald-400">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-400 font-medium">Passwords do not match</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Button
                  type="submit"
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
                <p className="text-xs text-center text-slate-600 mt-3">
                  By creating an account, you agree to our{" "}
                  <button type="button" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button type="button" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    Privacy Policy
                  </button>
                </p>
              </motion.div>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800/80" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900/50 px-4 text-slate-600 font-medium">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
                className="h-11 bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("github")}
                disabled={isLoading}
                className="h-11 bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all"
              >
                <Github className="mr-2 h-4 w-4" /> GitHub
              </Button>
            </div>
          </div>

          <p className="text-center mt-6 text-slate-600 text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
