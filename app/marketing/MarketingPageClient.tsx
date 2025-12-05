"use client"

import Link from "next/link"
import { useState } from "react"
import Silk from "@/components/ui/silk-background"
import Carousel from "@/components/ui/carousel-enhanced"
import { ConcentradeLogo } from "@/components/concentrade-logo"

export default function MarketingPageClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo-section")
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <ConcentradeLogo size={32} variant="icon" />
                <span className="text-xl font-bold text-text-primary">Concentrade</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-text-secondary hover:text-accent transition-smooth">
                Features
              </Link>
              <Link href="#pricing" className="text-text-secondary hover:text-accent transition-smooth">
                Pricing
              </Link>
              <Link href="#reviews" className="text-text-secondary hover:text-accent transition-smooth">
                Reviews
              </Link>
              <button onClick={scrollToDemo} className="text-text-secondary hover:text-accent transition-smooth">
                Demo
              </button>
              <Link href="/login" className="text-text-secondary hover:text-accent transition-smooth">
                Login
              </Link>
              <Link href="/signup" className="btn-primary">
                Start Free Trial
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-text-secondary hover:text-accent p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="#features" className="block px-3 py-2 text-text-secondary hover:text-accent">
                  Features
                </Link>
                <Link href="#pricing" className="block px-3 py-2 text-text-secondary hover:text-accent">
                  Pricing
                </Link>
                <Link href="#reviews" className="block px-3 py-2 text-text-secondary hover:text-accent">
                  Reviews
                </Link>
                <button
                  onClick={scrollToDemo}
                  className="block px-3 py-2 text-text-secondary hover:text-accent w-full text-left"
                >
                  Demo
                </button>
                <Link href="/login" className="block px-3 py-2 text-text-secondary hover:text-accent">
                  Login
                </Link>
                <Link href="/signup" className="block mx-3 my-2 btn-primary text-center">
                  Start Free Trial
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Silk Background */}
      <section className="pt-16 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Silk Background Layer */}
        <Silk speed={2} scale={0.8} color="#1e293b" noiseIntensity={0.8} rotation={0.2} className="opacity-30 z-0" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span className="text-sm text-text-secondary">Join 15,000+ profitable traders</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Turn Your Trading <span className="text-accent">Chaos</span>
            <br />
            Into Consistent <span className="text-accent">Profits</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            The only trading journal that combines professional analytics with emotional intelligence to eliminate
            costly mistakes and build winning strategies.
          </p>

          {/* CTA Buttons */}
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

          {/* Stats */}
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
          <div style={{ height: "600px", position: "relative" }}>
            <Carousel
              baseWidth={300}
              autoplay={true}
              autoplayDelay={3000}
              pauseOnHover={true}
              loop={true}
              round={false}
            />
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
            {/* Advanced Analytics */}
            <div className="card p-8">
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Discover hidden patterns in your trading with AI-powered analysis that identifies your most profitable
                setups and costly mistakes.
              </p>
            </div>
            {/* Additional Features Here */}
          </div>
        </div>
      </section>
    </div>
  )
}
