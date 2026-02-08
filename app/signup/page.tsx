"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, AlertCircle, Check, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { createClient } from "@/lib/supabase/client"
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

const getStrengthLabel = (strength: number) => {
  switch (strength) {
    case 0: return { label: "Too weak", color: "text-slate-400" }
    case 1: return { label: "Weak", color: "text-red-500" }
    case 2: return { label: "Fair", color: "text-orange-500" }
    case 3: return { label: "Good", color: "text-yellow-500" }
    case 4: return { label: "Strong", color: "text-emerald-500" }
    default: return { label: "", color: "" }
  }
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
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  useEffect(() => {
    setIsMounted(true)
    setTheme("light")
  }, [setTheme])

  useEffect(() => {
    setStrength(calculatePasswordStrength(password))
  }, [password])

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-purple-400/30"></div>
        </div>
      </div>
    )
  }

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

  const handleSocialLogin = async (provider: 'google' | 'github') => {
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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>



        {/* Main Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <div className="mb-12">
            <ConcentradeLogo size={60} theme="dark" />
          </div>

          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Start Your
            <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Trading Success
            </span>
          </h1>


        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <ConcentradeLogo size={48} />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-500">Start your 14-day free trial. No credit card required.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800 animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
              <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-purple-500' : 'text-slate-400'}`}>
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="pl-12 h-12 bg-white border-slate-200 text-slate-900 rounded-xl transition-all duration-300 focus:border-purple-500 focus:ring-purple-500/20 focus:ring-4 focus:shadow-lg focus:shadow-purple-500/10"
                  disabled={isLoading}
                  suppressHydrationWarning
                />
              </div>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-purple-500' : 'text-slate-400'}`}>
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="pl-12 pr-12 h-12 bg-white border-slate-200 text-slate-900 rounded-xl transition-all duration-300 focus:border-purple-500 focus:ring-purple-500/20 focus:ring-4 focus:shadow-lg focus:shadow-purple-500/10"
                  disabled={isLoading}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Enhanced Password Strength Indicator */}
              {password && (
                <div className="space-y-2 pt-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${strength >= level
                          ? level === 1 ? 'bg-red-500'
                            : level === 2 ? 'bg-orange-500'
                              : level === 3 ? 'bg-yellow-500'
                                : 'bg-emerald-500'
                          : 'bg-slate-200'
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
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm password</Label>
              <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'confirmPassword' ? 'text-purple-500' : 'text-slate-400'}`}>
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  className={`pl-12 pr-12 h-12 bg-white border-slate-200 text-slate-900 rounded-xl transition-all duration-300 focus:border-purple-500 focus:ring-purple-500/20 focus:ring-4 focus:shadow-lg focus:shadow-purple-500/10 ${confirmPassword && (passwordsMatch ? 'border-emerald-500' : 'border-red-400')
                    }`}
                  disabled={isLoading}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {confirmPassword && (
                  <div className={`absolute right-12 top-1/2 -translate-y-1/2 transition-all duration-300 ${passwordsMatch ? 'text-emerald-500' : 'text-red-400'
                    }`}>
                    {passwordsMatch ? <Check className="h-5 w-5" /> : null}
                  </div>
                )}
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create account
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <p className="text-xs text-slate-500">
                  Bank-grade encryption & 256-bit security
                </p>
              </div>

              <p className="text-xs text-center text-slate-500 mt-3">
                By creating an account, you agree to our{" "}
                <button type="button" className="text-purple-600 hover:underline">Terms of Service</button>
                {" "}and{" "}
                <button type="button" className="text-purple-600 hover:underline">Privacy Policy</button>
              </p>
            </motion.div>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-400 font-medium">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Github className="mr-2 h-5 w-5" /> GitHub
            </Button>
          </div>

          <p className="text-center mt-8 text-slate-600">
            Already have an account?{" "}
            <button
              onClick={() => router.push('/login')}
              className="font-semibold text-purple-600 hover:text-purple-700 transition-colors hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-2deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
