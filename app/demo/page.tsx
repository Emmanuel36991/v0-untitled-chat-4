"use client"

import Link from "next/link"
import { LayoutDashboard, TrendingUp, Brain, LineChart, ArrowRight, CheckCircle } from "lucide-react"
import { ConcentradeLogo } from "@/components/concentrade-logo"

export default function DemoHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ConcentradeLogo size={48} variant="full" />
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold text-foreground">Concentrade</span>
              <span className="text-xs text-muted-foreground">Demo Environment</span>
            </div>
          </div>
          <Link
            href="/marketing"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            ← Back
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          {/* Hero Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Interactive Demo Ready</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-center text-foreground mb-6 leading-tight">
            Experience Professional Trading Excellence
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-center text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Explore how traders use Concentrade to eliminate emotional mistakes, track performance patterns, and build
            consistent, profitable results.
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { icon: CheckCircle, label: "Real Trading Data" },
              { icon: CheckCircle, label: "Psychology Insights" },
              { icon: CheckCircle, label: "Advanced Analytics" },
            ].map((tag, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm"
              >
                <tag.icon className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">{tag.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Dashboard Card */}
          <Link href="/demo/dashboard" className="group h-full">
            <div className="relative h-full bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-primary/15 rounded-xl group-hover:bg-primary/25 transition-colors">
                    <LayoutDashboard className="h-7 w-7 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">Trading Dashboard</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Real-time performance overview with P&L, win rates, profit factors, and key metrics all in one
                  comprehensive dashboard.
                </p>

                <div className="flex items-center text-primary font-semibold text-sm">Explore Dashboard</div>
              </div>
            </div>
          </Link>

          {/* Trades Card */}
          <Link href="/demo/trades" className="group h-full">
            <div className="relative h-full bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-primary/15 rounded-xl group-hover:bg-primary/25 transition-colors">
                    <TrendingUp className="h-7 w-7 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">Trade Journal</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Detailed trade entries with screenshots, setup notes, emotion tracking, and comprehensive analysis for
                  every trade.
                </p>

                <div className="flex items-center text-primary font-semibold text-sm">View Trades</div>
              </div>
            </div>
          </Link>

          {/* Analytics Card */}
          <Link href="/demo/analytics" className="group h-full">
            <div className="relative h-full bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-primary/15 rounded-xl group-hover:bg-primary/25 transition-colors">
                    <LineChart className="h-7 w-7 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Deep pattern analysis by time, day, and setup type. Performance calendars and insights to identify
                  your best trading conditions.
                </p>

                <div className="flex items-center text-primary font-semibold text-sm">See Analytics</div>
              </div>
            </div>
          </Link>

          {/* Psychology Card */}
          <Link href="/demo/psychology" className="group h-full">
            <div className="relative h-full bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-primary/15 rounded-xl group-hover:bg-primary/25 transition-colors">
                    <Brain className="h-7 w-7 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">Psychology Tracker</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Track emotional patterns like confidence, stress, and focus. Understand how your psychology directly
                  impacts trading success.
                </p>

                <div className="flex items-center text-primary font-semibold text-sm">Track Psychology</div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border border-primary/20 p-12 md:p-16">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-4">Demo Account Performance</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">
            See sample results from professional traders using all Concentrade features
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { value: "+$47K", label: "Total P&L", highlight: true },
              { value: "73%", label: "Win Rate" },
              { value: "2.4", label: "Profit Factor" },
              { value: "1,247", label: "Total Trades" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-xl transition-all ${stat.highlight ? "bg-primary/20 border border-primary/40" : "bg-background/60 border border-border"}`}
              >
                <div className={`text-4xl font-bold mb-2 ${stat.highlight ? "text-primary" : "text-foreground"}`}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Ready to Master Your Trading?</h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Join professional traders using Concentrade to build consistent profits, manage emotions, and achieve
            trading excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:shadow-xl hover:scale-105 active:scale-95"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="/marketing"
              className="px-8 py-4 border-2 border-primary text-primary hover:bg-primary/5 rounded-xl font-semibold transition-all"
            >
              Learn More About Concentrade
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Concentrade. All rights reserved. This is a demo environment.</p>
        </div>
      </footer>
    </div>
  )
}
