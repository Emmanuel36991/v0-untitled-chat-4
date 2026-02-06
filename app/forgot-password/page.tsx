"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { AnimatedTradingBackground } from "@/components/animated-trading-background"
import { ConcentradeLogo } from "@/components/concentrade-logo"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden" suppressHydrationWarning>
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Left Side - Branding */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center">
                  <ConcentradeLogo size={60} className="drop-shadow-lg" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg font-sans">
                    Check Your Email
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed drop-shadow-md font-sans">
                    We've sent you a secure link to reset your password and get back to trading.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-600/20 border border-emerald-200/40 backdrop-blur-md shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-300" />
                    <span className="font-semibold text-white font-sans">Email Sent Successfully</span>
                  </div>
                  <p className="text-sm text-white/95 font-sans leading-relaxed">
                    Please check your inbox and follow the instructions to reset your password securely.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Success Message */}
            <div className="flex justify-center lg:justify-end">
              <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
                <CardHeader className="space-y-4 pb-6">
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 font-sans">Reset Link Sent</CardTitle>
                    <CardDescription className="text-slate-600 mt-2 font-sans">
                      Check your email for password reset instructions
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-slate-600 font-sans">We've sent a password reset link to:</p>
                    <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-lg font-sans">{email}</p>
                    <p className="text-xs text-slate-500 font-sans">
                      Didn't receive the email? Check your spam folder or try again with a different email address.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500 font-sans">Next steps</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => setSuccess(false)}
                      variant="outline"
                      className="w-full h-12 border-2 hover:bg-slate-50 bg-transparent font-sans"
                    >
                      Try Different Email
                    </Button>

                    <Link href="/login">
                      <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 font-sans">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back to Sign In
                      </Button>
                  </Link>
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

  return (
    <div className="min-h-screen relative overflow-hidden" suppressHydrationWarning>
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Branding */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center">
                <ConcentradeLogo size={60} className="drop-shadow-lg" />
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg font-sans">
                  Reset Your Password
                </h2>
                <p className="text-xl text-white/90 leading-relaxed drop-shadow-md font-sans">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <Badge
                  variant="secondary"
                  className="px-4 py-2 bg-blue-100/90 text-blue-800 border-blue-200/50 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Secure Reset
                </Badge>
                <Badge
                  variant="secondary"
                  className="px-4 py-2 bg-emerald-100/90 text-emerald-800 border-emerald-200/50 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Quick & Easy
                </Badge>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-purple-200/40 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                      stroke="#A855F7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11"
                      stroke="#A855F7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-semibold text-white font-sans">Secure Process</span>
                </div>
                <p className="text-sm text-white/95 font-sans leading-relaxed">
                  We'll send you a secure, time-limited link to reset your password safely. Your account security is our
                  priority.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Reset Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader className="space-y-4 pb-6">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold text-slate-900 font-sans">Forgot Your Password?</CardTitle>
                  <CardDescription className="text-slate-600 mt-2 font-sans">
                    Enter your email to receive a password reset link
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleResetPassword} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-700 font-sans">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 font-sans">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-2 focus:border-purple-500 bg-white/80 font-sans"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 font-sans"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <Mail className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500 font-sans">Remember your password?</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 hover:bg-slate-50 bg-transparent font-sans"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back to Sign In
                    </Button>
                  </Link>
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
