"use client"

import Link from "next/link"
import {
  BarChart3,
  Brain,
  Calculator,
  TrendingUp,
  Check,
  ArrowRight,
  Play,
  FileText,
  AlertTriangle,
  RotateCcw,
  Shield,
  Award,
  Minus,
  X,
  Users,
  Zap,
  Star,
  Lock,
  Globe,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { Button } from "@/components/ui/button"
import { MarketingNav } from "@/components/marketing/marketing-nav"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function MarketingPageClient() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      <MarketingNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-medium text-indigo-300 backdrop-blur-md"
          >
            <Users className="w-4 h-4" />
            <span>Trusted by 1,240+ professional traders this month</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tight"
          >
            Stop Trading <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Blindly</span>.
            <br />
            Start Trading <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Masterfully</span>.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            The institutional-grade trading journal that uses AI to decode your psychology, eliminate revenge trades, and scale your edge.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20"
          >
            <Button
              asChild
              size="lg"
              className="h-16 px-10 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95"
            >
              <Link href="/signup">
                Start Your Free Edge <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-16 px-10 text-lg font-bold border-slate-800 bg-slate-900/50 backdrop-blur-md hover:bg-slate-800 text-slate-300 rounded-2xl transition-all"
            >
              <Link href="/demo">
                <Play className="mr-2 w-5 h-5 fill-current" /> Watch Live Demo
              </Link>
            </Button>
          </motion.div>

          {/* Trust Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto py-10 border-y border-slate-900/50"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Retention Rate</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl font-bold text-white">14 Days</div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Free Access</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-2xl font-bold text-white">
                <Lock className="w-4 h-4 text-indigo-500" /> AES-256
              </div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Bank-Level Security</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-2xl font-bold text-white">
                <Globe className="w-4 h-4 text-indigo-500" /> Global
              </div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Multi-Broker Sync</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The "Aha!" Moment: Comparison Section */}
      <section className="py-32 px-4 bg-slate-950 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              The Gap Between <span className="text-red-500">Guessing</span> and <span className="text-indigo-400">Knowing</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Most traders aren't failing because of their strategy—they're failing because of their data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* The Old Way */}
            <div className="p-10 rounded-3xl bg-slate-900/30 border border-slate-900 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <X className="w-8 h-8 text-red-500/20" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-slate-500">Traditional Journaling</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-slate-500">
                  <div className="mt-1 p-1 bg-red-500/10 rounded-full"><Minus className="w-4 h-4 text-red-500" /></div>
                  <div>
                    <p className="font-bold">Friction-Heavy Logging</p>
                    <p className="text-sm">Manual entry leads to skipped days and incomplete data sets.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 text-slate-500">
                  <div className="mt-1 p-1 bg-red-500/10 rounded-full"><Minus className="w-4 h-4 text-red-500" /></div>
                  <div>
                    <p className="font-bold">Static Analysis</p>
                    <p className="text-sm">Spreadsheets show what happened, but never tell you why.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 text-slate-500">
                  <div className="mt-1 p-1 bg-red-500/10 rounded-full"><Minus className="w-4 h-4 text-red-500" /></div>
                  <div>
                    <p className="font-bold">Blind Spots</p>
                    <p className="text-sm">Hidden behavioral leaks remain undetected for months.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* The Concentrade Way */}
            <div className="p-10 rounded-3xl bg-indigo-600/5 border border-indigo-500/20 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(79,70,229,0.2)]">
              <div className="absolute top-0 right-0 p-4">
                <Zap className="w-8 h-8 text-indigo-500/40 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-indigo-400">The Concentrade Standard</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-indigo-500/20 rounded-full"><Check className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <p className="font-bold text-white">Automated Pipeline</p>
                    <p className="text-sm text-slate-400">Direct broker integration ensures 100% data integrity with zero effort.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-indigo-500/20 rounded-full"><Check className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <p className="font-bold text-white">Behavioral Intelligence</p>
                    <p className="text-sm text-slate-400">Neural analysis decodes the psychology behind every execution.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-indigo-500/20 rounded-full"><Check className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <p className="font-bold text-white">Actionable Alpha</p>
                    <p className="text-sm text-slate-400">Identify your highest-expectancy setups and scale with confidence.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Outcome-Focused Features */}
      <section id="features" className="py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <div>
              <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Master Your <span className="text-indigo-400">Psychology</span>.
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                The hardest part of trading isn't the charts—it's you. Our Neural Insight engine identifies the behavioral triggers that lead to revenge trading and over-leveraging.
              </p>
              <ul className="space-y-4">
                {["Real-time emotional state tracking", "Revenge trade alerts", "Psychology-based performance scoring"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <div className="p-1 bg-indigo-500/20 rounded-full"><Check className="w-3 h-3 text-indigo-400" /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full opacity-20" />
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">AI Neural Insight</span>
                  </div>
                  <Badge variant="outline" className="border-red-500/50 text-red-400">High Risk Detected</Badge>
                </div>
                <p className="text-lg text-white font-medium mb-4">"You've logged 3 consecutive losses. Your average hold time has decreased by 60%. You are likely revenge trading. Step away for 2 hours."</p>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[85%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full opacity-20" />
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Win Rate", value: "68%", color: "text-emerald-400" },
                    { label: "Profit Factor", value: "2.4", color: "text-emerald-400" },
                    { label: "Avg Win", value: "$420", color: "text-emerald-400" },
                    { label: "Expectancy", value: "$124", color: "text-emerald-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">{stat.label}</p>
                      <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Quantify Your <span className="text-emerald-400">Edge</span>.
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Institutional performance requires institutional data. Concentrade provides a granular breakdown of your expectancy by strategy, session, and asset class.
              </p>
              <ul className="space-y-4">
                {["Strategy-Specific Expectancy", "Session & Time Performance", "Asset Class Profitability"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <div className="p-1 bg-emerald-500/20 rounded-full"><Check className="w-3 h-3 text-emerald-400" /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof: Testimonial Wall */}
      <section className="py-32 px-4 bg-slate-900/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Built for <span className="text-indigo-400">Serious</span> Traders</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">The platform of choice for prop firm professionals and independent alpha-seekers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Rivera",
                role: "Full-time Scalper",
                text: "The behavioral analysis caught a specific tilt pattern I had after taking three losses in a row. It's the only tool that actually improved my discipline.",
                avatar: "AR"
              },
              {
                name: "Sarah Chen",
                role: "Prop Firm Trader",
                text: "Manual journaling was my biggest bottleneck. Concentrade's automated sync gives me back 5 hours a week to focus on actual chart work.",
                avatar: "SC"
              },
              {
                name: "Marcus Thorne",
                role: "Swing Trader",
                text: "I realized through the strategy breakdown that my 'Breakout' setup was actually net-negative. I cut it and my P&L immediately stabilized.",
                avatar: "MT"
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
                <p className="text-slate-300 italic leading-relaxed">"{t.text}"</p>
                <div className="flex gap-1 mt-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-indigo-500 text-indigo-500" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Simple, <span className="text-indigo-400">Transparent</span> Pricing</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your trading journey. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "Perfect for beginners",
                features: ["Manual Trade Logging", "Basic Analytics", "1 Portfolio", "7-Day History"],
                cta: "Get Started",
                popular: false
              },
              {
                name: "Professional",
                price: "$29",
                desc: "For serious traders",
                features: ["Automated Broker Sync", "AI Neural Insights", "Unlimited Portfolios", "Full History", "Strategy Breakdown"],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Institutional",
                price: "$99",
                desc: "For teams & funds",
                features: ["Team Collaboration", "Advanced Risk API", "Custom Reporting", "Priority Support", "White-labeling"],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, i) => (
              <div 
                key={i}
                className={cn(
                  "p-10 rounded-3xl border transition-all relative",
                  plan.popular 
                    ? "bg-indigo-600/10 border-indigo-500 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] scale-105 z-10" 
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <p className="text-sm text-slate-400 mb-8">{plan.desc}</p>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-indigo-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild
                  className={cn(
                    "w-full h-12 rounded-xl font-bold transition-all",
                    plan.popular ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                  )}
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="p-16 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Ready to Find Your <span className="text-indigo-200 underline decoration-indigo-300/50 underline-offset-8">Edge</span>?</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                Join 1,240+ traders who are already using Concentrade to master their psychology and scale their accounts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="h-16 px-10 text-lg font-bold bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all hover:scale-105">
                  <Link href="/signup">Start Your 14-Day Free Trial</Link>
                </Button>
                <p className="text-sm text-indigo-200 font-medium">No credit card required.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 border-t border-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <ConcentradeLogo className="mb-6" />
              <p className="text-slate-500 max-w-sm leading-relaxed">
                The institutional-grade trading journal designed to help you master your psychology and scale your edge.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white">Product</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><Link href="#features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-indigo-400 transition-colors">Live Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white">Company</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-900/50">
            <p className="text-slate-600 text-sm">© 2026 Concentrade. All rights reserved.</p>
            <div className="flex gap-6">
              {/* Social Links would go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: "outline", className?: string }) {
  return (
    <div className={cn(
      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
      variant === "outline" ? "bg-transparent" : "bg-slate-800 border-slate-700",
      className
    )}>
      {children}
    </div>
  )
}
