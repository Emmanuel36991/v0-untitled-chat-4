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
  Zap,
  Star,
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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 font-sans">
      <MarketingNav />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-4 overflow-hidden min-h-screen flex items-center">
        {/* Candlestick Background - Increased visibility */}
        <div 
          className="absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage: "url('/hero-chart.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Refined Gradient Overlay for better image visibility while keeping text readable */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950" />

        <div className="container mx-auto max-w-6xl relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold tracking-[0.2em] text-indigo-300 uppercase backdrop-blur-sm">
              Join 1,000+ Active Traders
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold mb-10 tracking-tight leading-[1.05]"
          >
            Turn Your Trading <span className="text-[#f43f5e]">Chaos</span>
            <br />
            Into Consistent <span className="text-indigo-400">Profits</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-14 leading-relaxed font-medium drop-shadow-sm"
          >
            The only trading journal that combines institutional-grade analytics with emotional intelligence to eliminate costly mistakes and build winning strategies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24"
          >
            <Button
              asChild
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-8 text-lg font-bold rounded-xl shadow-2xl shadow-indigo-500/20 transition-all hover:-translate-y-1"
            >
              <Link href="/signup" className="flex items-center gap-2">
                Start Free 14-Day Trial <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-800 bg-slate-950/50 backdrop-blur-sm hover:bg-slate-900 text-slate-300 px-10 py-8 text-lg font-bold rounded-xl transition-all"
            >
              <Link href="/demo" className="flex items-center gap-2">
                <Play className="h-5 w-5 fill-current" /> Watch Live Demo
              </Link>
            </Button>
          </motion.div>

          {/* Trust Bar - Clean & Minimal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-x-16 gap-y-8 max-w-5xl mx-auto pt-12 border-t border-slate-900"
          >
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="text-2xl font-bold text-white">1,000+</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Active Traders</span>
            </div>
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="text-2xl font-bold text-white">14 Days</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Free Trial</span>
            </div>
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-500/50" />
                <span className="text-2xl font-bold text-white">SSL</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Bank-Level Encryption</span>
            </div>
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-500/50" />
                <span className="text-2xl font-bold text-white">SOC 2</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Compliant</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-32 px-4 bg-slate-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              The Gap Between <span className="text-[#f43f5e]">Guessing</span> and <span className="text-indigo-400">Knowing</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Most traders aren't failing because of their strategy—they're failing because of their data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <motion.div 
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -20 }}
              viewport={{ once: true }}
              className="p-10 rounded-3xl bg-slate-900/30 border border-slate-900 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6">
                <X className="w-10 h-10 text-rose-500/10" />
              </div>
              <h3 className="text-2xl font-bold mb-8 text-slate-500 uppercase tracking-widest text-sm">Traditional Journaling</h3>
              <ul className="space-y-8">
                <li className="flex items-start gap-4 text-slate-500">
                  <div className="mt-1 p-1 bg-rose-500/10 rounded-full"><Minus className="w-4 h-4 text-rose-500" /></div>
                  <div>
                    <p className="font-bold text-lg text-slate-400">Friction-Heavy Logging</p>
                    <p className="text-slate-600">Manual entry leads to skipped days and incomplete data sets.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 text-slate-500">
                  <div className="mt-1 p-1 bg-rose-500/10 rounded-full"><Minus className="w-4 h-4 text-rose-500" /></div>
                  <div>
                    <p className="font-bold text-lg text-slate-400">Static Analysis</p>
                    <p className="text-slate-600">Spreadsheets show what happened, but never tell you why.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 text-slate-500">
                  <div className="mt-1 p-1 bg-rose-500/10 rounded-full"><Minus className="w-4 h-4 text-rose-500" /></div>
                  <div>
                    <p className="font-bold text-lg text-slate-400">Blind Spots</p>
                    <p className="text-slate-600">Hidden behavioral leaks remain undetected for months.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* The Concentrade Way */}
            <motion.div 
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 20 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="p-10 rounded-3xl bg-indigo-600/5 border border-indigo-500/20 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(79,70,229,0.1)]"
            >
              <div className="absolute top-0 right-0 p-6">
                <Zap className="w-10 h-10 text-indigo-500/20 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-8 text-indigo-400 uppercase tracking-widest text-sm">The Concentrade Standard</h3>
              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-indigo-500/20 rounded-full"><Check className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <p className="font-bold text-white text-lg">Automated Pipeline</p>
                    <p className="text-slate-400">Direct broker integration ensures 100% data integrity with zero effort.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-indigo-500/20 rounded-full"><Check className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <p className="font-bold text-white text-lg">Behavioral Intelligence</p>
                    <p className="text-slate-400">AI decodes the psychology behind every execution and decision.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-indigo-500/20 rounded-full"><Check className="w-4 h-4 text-indigo-400" /></div>
                  <div>
                    <p className="font-bold text-white text-lg">Actionable Alpha</p>
                    <p className="text-slate-400">Identify your highest-expectancy setups and scale with confidence.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Deep-Dives */}
      <section id="features" className="py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          {/* Feature A */}
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/20">
                <Brain className="w-7 h-7 text-indigo-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-white">
                Master Your <span className="text-indigo-400">Psychology</span>.
              </h2>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                The hardest part of trading isn't the charts—it's you. Our Neural Insight engine identifies the behavioral triggers that lead to revenge trading and over-leveraging.
              </p>
              <ul className="space-y-5">
                {[
                  "Real-time emotional state tracking",
                  "Revenge trade alerts",
                  "Psychology-based performance scoring"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-slate-300 font-medium">
                    <div className="p-1 bg-indigo-500/20 rounded-full"><Check className="w-3.5 h-3.5 text-indigo-400" /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full opacity-30" />
              <div className="relative bg-slate-900 border border-slate-800 rounded-[2rem] p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">AI Neural Insight</span>
                  <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest">
                    High Risk Detected
                  </div>
                </div>
                <p className="text-xl text-white font-medium mb-8 leading-relaxed">
                  "You've logged 3 consecutive losses. Your average hold time has decreased by 60%. You are likely revenge trading. Step away for 2 hours."
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                    <span className="text-slate-500">Emotional Tilt Risk</span>
                    <span className="text-rose-500">85%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-rose-500" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature B */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 relative"
            >
              <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full opacity-30" />
              <div className="relative bg-slate-900 border border-slate-800 rounded-[2rem] p-10 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Win Rate", value: "68%", color: "text-emerald-400" },
                    { label: "Profit Factor", value: "2.4", color: "text-emerald-400" },
                    { label: "Avg Win", value: "$420", color: "text-emerald-400" },
                    { label: "Expectancy", value: "$124", color: "text-emerald-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                      <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20">
                <TrendingUp className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-white">
                Quantify Your <span className="text-emerald-400">Edge</span>.
              </h2>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                Institutional performance requires institutional data. Concentrade provides a granular breakdown of your expectancy by strategy, session, and asset class.
              </p>
              <ul className="space-y-5">
                {[
                  "Strategy-Specific Expectancy",
                  "Session & Time Performance",
                  "Asset Class Profitability"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-slate-300 font-medium">
                    <div className="p-1 bg-emerald-500/20 rounded-full"><Check className="w-3.5 h-3.5 text-emerald-400" /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="testimonials" className="py-32 px-4 bg-slate-900/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white">Built for <span className="text-indigo-400">Serious</span> Traders</h2>
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
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-10 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{t.role}</p>
                  </div>
                </div>
                <p className="text-slate-300 italic leading-relaxed text-lg mb-8">"{t.text}"</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-indigo-500 text-indigo-500" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-32 px-4 bg-slate-950">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">See How We <span className="text-indigo-400">Stack Up</span></h2>
            <p className="text-xl text-slate-400">The rational choice for data-driven traders.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-6 px-4 text-left text-slate-500 font-bold uppercase tracking-widest text-[10px]">Feature</th>
                  <th className="py-6 px-4 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Spreadsheets</th>
                  <th className="py-6 px-4 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tradezella</th>
                  <th className="py-6 px-4 text-center text-indigo-400 font-bold uppercase tracking-widest text-[10px] bg-indigo-500/5 rounded-t-2xl">Concentrade</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: "Automated Broker Sync", s: false, t: "muted", c: true },
                  { name: "AI Behavioral Insights", s: false, t: false, c: true },
                  { name: "Emotional State Tracking", s: false, t: false, c: true },
                  { name: "Strategy-Level Breakdown", s: false, t: "partial", c: true },
                  { name: "Tax Report Generation", s: false, t: false, c: true },
                  { name: "Risk Management Scoring", s: false, t: "partial", c: true },
                  { name: "Mobile App", s: false, t: true, c: true },
                  { name: "Free Tier Available", s: true, t: false, c: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-900/50">
                    <td className="py-6 px-4 font-medium text-slate-300">{row.name}</td>
                    <td className="py-6 px-4 text-center">
                      {row.s === true ? <Check className="w-5 h-5 text-slate-600 mx-auto" /> : <X className="w-5 h-5 text-rose-500/20 mx-auto" />}
                    </td>
                    <td className="py-6 px-4 text-center">
                      {row.t === true ? <Check className="w-5 h-5 text-slate-600 mx-auto" /> : row.t === "partial" ? <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Partial</span> : <X className="w-5 h-5 text-rose-500/20 mx-auto" />}
                    </td>
                    <td className="py-6 px-4 text-center bg-indigo-500/5 font-bold text-white">
                      <Check className="w-6 h-6 text-indigo-400 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white">Simple, <span className="text-indigo-400">Transparent</span> Pricing</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your trading journey. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
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
                features: ["Team Collaboration", "Advanced API", "Custom Reporting", "Priority Support", "White-labeling"],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, i) => (
              <motion.div 
                key={i}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-10 rounded-[2.5rem] border transition-all relative",
                  plan.popular 
                    ? "bg-indigo-600/10 border-indigo-500 shadow-[0_0_50px_-12px_rgba(79,70,229,0.2)] scale-105 z-10 py-14" 
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full uppercase tracking-[0.2em]">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">/mo</span>
                </div>
                <p className="text-sm text-slate-400 mb-10 font-medium">{plan.desc}</p>
                <ul className="space-y-5 mb-12">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                      <Check className="w-4 h-4 text-indigo-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild
                  className={cn(
                    "w-full h-14 rounded-xl font-bold text-base transition-all",
                    plan.popular ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "bg-slate-800 hover:bg-slate-700 text-white"
                  )}
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.98 }}
            viewport={{ once: true }}
            className="p-16 md:p-24 rounded-[3.5rem] bg-indigo-600 relative overflow-hidden shadow-2xl text-center"
          >
            {/* Grain Texture Overlay */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-white">Ready to Find Your <span className="underline decoration-white/30 underline-offset-8">Edge</span>?</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                Join 1,240+ traders who are already using Concentrade to master their psychology and scale their accounts.
              </p>
              <div className="flex flex-col items-center gap-6">
                <Button asChild size="lg" className="h-18 px-12 text-xl font-bold bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all hover:scale-105 shadow-xl">
                  <Link href="/signup">Start Your 14-Day Free Trial</Link>
                </Button>
                <p className="text-sm text-indigo-200 font-bold uppercase tracking-widest">No credit card required.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-4 border-t border-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2">
              <ConcentradeLogo className="mb-8" size={48} />
              <p className="text-slate-500 max-w-sm leading-relaxed text-lg">
                The institutional-grade trading journal designed to help you master your psychology and scale your edge.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-8 text-white uppercase tracking-widest text-[10px]">Product</h4>
              <ul className="space-y-5 text-slate-500 text-sm font-medium">
                <li><Link href="#features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-indigo-400 transition-colors">Live Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-8 text-white uppercase tracking-widest text-[10px]">Company</h4>
              <ul className="space-y-5 text-slate-500 text-sm font-medium">
                <li><Link href="/marketing#features" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-slate-900/50">
            <p className="text-slate-600 text-sm font-medium">© 2026 Concentrade. All rights reserved.</p>
            <div className="flex gap-8">
              {/* Social Links */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
