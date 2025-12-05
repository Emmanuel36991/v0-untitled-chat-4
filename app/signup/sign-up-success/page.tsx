import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { AnimatedTradingBackground } from "@/components/animated-trading-background"
import { ConcentradeLogo } from "@/components/concentrade-logo"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedTradingBackground />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-lg">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader className="text-center space-y-4 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full animate-pulse" />
                    <ConcentradeLogo size={60} className="relative drop-shadow-lg" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-center mb-3">
                    <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-slate-900">Almost There!</CardTitle>
                  <CardDescription className="text-lg text-slate-600">
                    Check your email to confirm your account
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900">Confirmation Email Sent</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        We've sent a confirmation link to your email address. Please click the link in the email to
                        activate your account and complete your profile setup.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-5 space-y-3">
                  <h4 className="font-semibold text-slate-900 text-sm">What happens next?</h4>
                  <ol className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold">
                        1
                      </span>
                      <span>Check your email inbox (and spam folder)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold">
                        2
                      </span>
                      <span>Click the confirmation link in the email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold">
                        3
                      </span>
                      <span>Complete your profile setup and start trading!</span>
                    </li>
                  </ol>
                </div>

                <div className="pt-2">
                  <Link href="/login" className="block">
                    <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                      Go to Login
                    </Button>
                  </Link>
                </div>

                <div className="text-center text-sm text-slate-500">
                  <p>
                    Didn't receive the email?{" "}
                    <button className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                      Resend confirmation
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
