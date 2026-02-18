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
              Why 90% of Traders <span className="text-red-500">Fail</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              It's not the market. It's the lack of clarity. See how Concentrade transforms your process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* The Old Way */}
            <div className="p-10 rounded-3xl bg-slate-900/30 border border-slate-900 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <X className="w-8 h-8 text-red-500/20" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-slate-500">The Spreadsheet Chaos</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-slate-500">
                  <div className="mt-1 p-1 bg-red-500/10 rounded-full"><Minus className="w-4 h-4 text-red-500" /></div>
                  <div>
                    <p className="font-bold">Manual Data Entry</p>
                    <p className="text-sm">Hours wasted typing numbers instead of analyzing charts.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 text-slate-500">
                  <div className="mt-1 p-1 bg-red-500/10 rounded-full"><Minus className="w-4 h-4 text-red-500" /></div>
                  <div>
                    <p className="font-bold">Invisible Patterns</p>
                    <p className="text-sm">You can't see that you lose 80% of your trades on Tuesday mornings.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 text-slate-500">
                  <div className="mt-1 p-1 bg-red-500/10 rounded-full"><Minus className="w-4 h-4 text-red-500" /></div>
                  <div>
                    <p className="font-bold">Emotional Blindness</p>
                    <p className="text-sm">No way to track how FOMO or revenge trading is draining your account.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* The Concentrade Way */}
            <div className="p-10 rounded-3xl bg-indigo-600/5 border border-indigo-500/20 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(79,70,229,0.2)]">
              <div className="absolute top-0 right-0 p-4">
                <Zap className="w-8 h-8 text-indigo-500/40 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-indigo-400">The Concentrade Edge</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-indigo-500/20 rounded-full"><Check className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <p className="font-bold text-white">Instant Broker Sync</p>
                    <p className="text-sm text-slate-400">Your trades are imported automatically. Zero manual work.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-indigo-500/20 rounded-full"><Check className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <p className="font-bold text-white">AI Pattern Recognition</p>
                    <p className="text-sm text-slate-400">Our AI identifies exactly which setups are making you money.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-indigo-500/20 rounded-full"><Check className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <p className="font-bold text-white">Psychology Decoding</p>
                    <p className="text-sm text-slate-400">Track your mindset and eliminate the emotional errors that kill accounts.</p>
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
                Eliminate <span className="text-indigo-400">Revenge Trading</span> Forever.
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Our AI Neural Insight doesn't just track numbers; it tracks your mind. Identify the emotional triggers that lead to overtrading and stop the bleed before it starts.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Real-time emotional state tracking</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>AI-generated "Cool Down" alerts</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Psychology-based performance metrics</span>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Neural Insight</div>
                  <div className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-full animate-pulse">High Risk Detected</div>
                </div>
                <div className="space-y-6">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-red-500 to-orange-500" />
                  </div>
                  <p className="text-lg font-medium text-white italic">
                    "You've taken 4 trades in the last 20 minutes after a loss. Your win rate in this state is 12%. Step away for 30 minutes."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Strategy Edge</div>
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full">+24.5% Edge</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Morning Breakouts</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><ArrowUpRight className="w-4 h-4" /> 68% WR</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Afternoon Reversals</span>
                    <span className="text-red-400 font-bold flex items-center gap-1"><ArrowDownRight className="w-4 h-4" /> 22% WR</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Know Exactly <span className="text-emerald-400">What Works</span>.
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Stop guessing. Our Strategy Breakdown automatically categorizes your trades to show you which setups are printing money and which are just noise.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Automatic setup categorization</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Time-of-day profitability analysis</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Risk-to-reward optimization engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof: Wall of Love */}
      <section className="py-32 px-4 bg-slate-900/20">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-20 tracking-tight">
            Trusted by the <span className="text-indigo-400">Best</span>.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Rivera",
                role: "Full-time Crypto Scalper",
                text: "Concentrade's AI insights literally saved my account. It identified a revenge trading pattern I didn't even know I had.",
                avatar: "AR"
              },
              {
                name: "Sarah Chen",
                role: "Prop Firm Trader",
                text: "The broker sync is flawless. I spend zero time on data entry now and 100% of my time refining my edge.",
                avatar: "SC"
              },
              {
                name: "Marcus Thorne",
                role: "Options Strategist",
                text: "The most professional trading journal I've ever used. The UI is stunning and the data is actually actionable.",
                avatar: "MT"
              }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-left hover:border-indigo-500/30 transition-all group">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-indigo-500 text-indigo-500" />)}
                </div>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Simple, Transparent Pricing.</h2>
            <p className="text-xl text-slate-400">Join the elite 10% of traders who treat their trading like a business.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-10 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col">
              <h3 className="text-xl font-bold mb-2 text-white">Starter</h3>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-500">/forever</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <Check className="w-4 h-4 text-indigo-500" /> 50 Trades / Month
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <Check className="w-4 h-4 text-indigo-500" /> Basic Analytics
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <Check className="w-4 h-4 text-indigo-500" /> Manual Entry
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full h-12 rounded-xl border-slate-800 hover:bg-slate-800">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="p-10 rounded-3xl bg-indigo-600 border border-indigo-400 relative shadow-[0_0_60px_-15px_rgba(79,70,229,0.6)] flex flex-col transform scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-indigo-600 text-xs font-bold rounded-full uppercase tracking-widest">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Professional</h3>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-indigo-200">/month</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-white text-sm">
                  <Check className="w-4 h-4 text-white" /> Unlimited Trades
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                  <Check className="w-4 h-4 text-white" /> AI Neural Insights
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                  <Check className="w-4 h-4 text-white" /> Automatic Broker Sync
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                  <Check className="w-4 h-4 text-white" /> Strategy Optimizer
                </li>
              </ul>
              <Button asChild className="w-full h-12 rounded-xl bg-white text-indigo-600 hover:bg-slate-100 font-bold">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-10 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col">
              <h3 className="text-xl font-bold mb-2 text-white">Enterprise</h3>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <Check className="w-4 h-4 text-indigo-500" /> Everything in Pro
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <Check className="w-4 h-4 text-indigo-500" /> Team Collaboration
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <Check className="w-4 h-4 text-indigo-500" /> Custom Integrations
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full h-12 rounded-xl border-slate-800 hover:bg-slate-800">
                <Link href="/signup">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/10 blur-3xl rounded-full -translate-y-1/2" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Ready to Scale Your Edge?</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Join 1,240+ traders who have already transformed their trading chaos into consistent profits.
          </p>
          <div className="flex flex-col items-center gap-6">
            <Button
              asChild
              size="lg"
              className="h-16 px-12 text-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-[0_0_50px_-10px_rgba(79,70,229,0.5)] transition-all hover:scale-105"
            >
              <Link href="/signup">Start Your Free Edge Now</Link>
            </Button>
            <p className="text-sm text-slate-500 font-medium">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 border-t border-slate-900 bg-slate-950">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 md:col-span-1">
              <ConcentradeLogo size={32} variant="full" className="mb-6" />
              <p className="text-slate-500 text-sm leading-relaxed">
                The institutional-grade trading journal for disciplined, data-driven performance.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Live Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-900 text-slate-600 text-xs font-bold uppercase tracking-widest">
            <p>© 2026 Concentrade. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors">Discord</Link>
              <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
