"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export default function MarketingPageClient() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo-section")
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span className="text-sm text-text-secondary">Join 15,000+ profitable traders</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Turn Your Trading <span className="text-accent">Chaos</span>
            <br />
            Into Consistent <span className="text-accent">Profits</span>
          </h1>

          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            The only trading journal that combines professional analytics with emotional intelligence to eliminate
            costly mistakes and build winning strategies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
              Start Free 14-Day Trial →
            </Link>
            <button
              onClick={scrollToDemo}
              className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-smooth text-lg px-8 py-4 border border-border rounded-lg hover:border-accent w-full sm:w-auto justify-center"
            >
              <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
              </div>
              <span>Watch Live Demo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">15,000+</div>
              <div className="text-text-secondary">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">+127%</div>
              <div className="text-text-secondary">Avg Profit Improvement</div>
            </div>
            <div className="text-center flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-accent rounded-full"></div>
              <span className="text-text-secondary">SSL Secured</span>
            </div>
            <div className="text-center flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-accent rounded-full"></div>
              <span className="text-text-secondary">SOC 2 Compliant</span>
            </div>
          </div>

          <div style={{ height: "100px", position: "relative" }}>
            {/* Carousel removed due to missing dependency */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Professional-grade tools that transform scattered data into actionable insights.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8">
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Discover hidden patterns in your trading with AI-powered analysis that identifies your most profitable setups and costly mistakes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
