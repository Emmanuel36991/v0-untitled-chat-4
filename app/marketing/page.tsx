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
  Menu,
  X,
  Shield,
  Award,
  Minus,
} from "lucide-react"
import { useState } from "react"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import "./marketing.css"

export default function MarketingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="marketing-nav">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <ConcentradeLogo size={32} variant="full" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection("features")} className="nav-link">
                Features
              </button>
              <button onClick={() => scrollToSection("pricing")} className="nav-link">
                Pricing
              </button>
              <button onClick={() => scrollToSection("testimonials")} className="nav-link">
                Reviews
              </button>
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/signup" className="btn-primary">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden text-text-primary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <button onClick={() => scrollToSection("features")} className="block w-full text-left nav-link">
                Features
              </button>
              <button onClick={() => scrollToSection("pricing")} className="block w-full text-left nav-link">
                Pricing
              </button>
              <button onClick={() => scrollToSection("testimonials")} className="block w-full text-left nav-link">
                Reviews
              </button>
              <Link href="/login" className="block w-full text-left nav-link">
                Login
              </Link>
              <Link href="/signup" className="btn-primary mt-4">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Candlestick Background */}
      <section className="hero-section py-20 px-4 text-center pt-32">
        <div className="hero-content container mx-auto max-w-6xl">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm font-medium text-accent">
              <ConcentradeLogo size={16} variant="icon" />
              Join thousands of traders worldwide
            </span>
          </div>

          <h1 className="hero-title">
            Turn Your Trading <span className="gradient-text">Chaos</span>
            <br />
            Into Consistent <span className="gradient-text">Profits</span>
          </h1>

          <p className="hero-subtitle max-w-3xl mx-auto">
            The only trading journal that combines professional analytics with emotional intelligence to eliminate
            costly mistakes and build winning strategies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <a href="/signup" className="btn-primary">
              <TrendingUp className="h-5 w-5 mr-2" />
              Get Started Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </div>

          <div className="stats-container mt-16">
            <div className="stat-item">
              <span className="stat-number">1,000+</span>
              <span className="stat-label">Active Traders</span>
            </div>

            <div className="stat-item flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-accent" />
              <div>
                <span className="stat-number text-lg">SSL</span>
                <span className="stat-label">Secured</span>
              </div>
            </div>
            <div className="stat-item flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-accent" />
              <div>
                <span className="stat-number text-lg">Bank-Level</span>
                <span className="stat-label">Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - "Tired of Losing Money" */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Are You Tired of <span className="text-red-gradient">Losing Money</span> to the Same Mistakes?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Many retail traders struggle because they can't identify patterns in their losses. Sound familiar?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="problem-card animate-fade-in-up">
              <div className="problem-icon">
                <FileText className="h-8 w-8 text-error" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Scattered Records</h3>
              <p className="text-gray-300 mb-6">
                Trading notes across multiple spreadsheets, apps, and sticky notes make it impossible to spot profitable
                patterns.
              </p>
              <div className="text-error font-bold text-lg">Can't track performance</div>
            </div>

            <div className="problem-card animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="problem-icon">
                <AlertTriangle className="h-8 w-8 text-error" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Emotional Decisions</h3>
              <p className="text-gray-300 mb-6">
                Fear and greed drive your trades instead of data, leading to revenge trading and blown accounts.
              </p>
              <div className="text-error font-bold text-lg">Costly emotional mistakes</div>
            </div>

            <div className="problem-card animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="problem-icon">
                <RotateCcw className="h-8 w-8 text-error" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Repeated Mistakes</h3>
              <p className="text-gray-300 mb-6">
                Without proper analysis, you keep making the same costly errors that drain your account.
              </p>
              <div className="text-error font-bold text-lg">Same mistakes repeated</div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-8">Which Challenge Hits Closest to Home?</h3>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <a href="/signup" className="challenge-button">
                <div className="font-semibold mb-2">Poor Record-Keeping</div>
                <div className="text-sm text-gray-400">Can't track what's working</div>
              </a>
              <a href="/signup" className="challenge-button">
                <div className="font-semibold mb-2">Emotional Trading</div>
                <div className="text-sm text-gray-400">FOMO and revenge trades</div>
              </a>
              <a href="/signup" className="challenge-button">
                <div className="font-semibold mb-2">Tax Complications</div>
                <div className="text-sm text-gray-400">Nightmare at tax time</div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Professional-grade tools that transform scattered data into actionable insights.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card animate-fade-in-up">
              <div className="feature-card-icon">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
              <p className="text-gray-300 mb-6">
                Discover hidden patterns in your trading with AI-powered analysis that identifies your most profitable
                setups and costly mistakes.
              </p>
              <div className="bg-secondary/30 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Win Rate Trend</span>
                  <span className="text-accent font-semibold">+12% this month</span>
                </div>
                <div className="flex gap-1">
                  {[40, 60, 45, 70, 85, 75, 90].map((height, i) => (
                    <div key={i} className="bg-accent/70 rounded-sm flex-1" style={{ height: `${height / 2}px` }} />
                  ))}
                </div>
              </div>
              <Link href="#" className="text-accent hover:underline font-medium">
                Explore Analytics →
              </Link>
            </div>

            <div className="feature-card animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="feature-card-icon">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Emotional Intelligence</h3>
              <p className="text-gray-300 mb-6">
                Track your emotional state during trades and discover how fear, greed, and confidence impact your
                performance.
              </p>
              <div className="bg-secondary/30 p-4 rounded-lg mb-4">
                <div className="mb-3">
                  <span className="text-sm font-medium">Today's Emotional State</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confident</span>
                    <div className="w-24 h-2 bg-secondary rounded-full">
                      <div className="w-4/5 h-full bg-accent rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fearful</span>
                    <div className="w-24 h-2 bg-secondary rounded-full">
                      <div className="w-1/4 h-full bg-warning rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="#" className="text-accent hover:underline font-medium">
                Learn More →
              </Link>
            </div>

            <div className="feature-card animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="feature-card-icon">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Automated Tax Reporting</h3>
              <p className="text-gray-300 mb-6">
                Generate IRS-compliant reports instantly. No more spreadsheet nightmares at tax time.
              </p>
              <div className="bg-secondary/30 p-4 rounded-lg mb-4">
                <div className="mb-3">
                  <span className="text-sm font-medium">2025 Tax Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Short-term gains:</span>
                    <span className="text-accent">$12,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Long-term gains:</span>
                    <span className="text-accent">$8,230</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wash sales:</span>
                    <span className="text-error">-$1,200</span>
                  </div>
                </div>
              </div>
              <Link href="#" className="text-accent hover:underline font-medium">
                View Tax Features →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Real Traders, Real Results</h2>
            <p className="text-xl text-gray-300">See how Concentrade transformed their trading</p>
            <p className="text-sm text-gray-400 mt-2">Individual results may vary. Past performance is not indicative of future results.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "Concentrade helped me identify my emotional trading patterns. I've significantly reduced my losses and
                improved my win rate. The insights have been invaluable for my trading discipline."
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">MC</div>
                <div>
                  <div className="font-semibold">Mike Chen</div>
                  <div className="text-sm text-gray-400">Day Trader, 3 years</div>
                  <div className="text-sm text-accent">Improved trading consistency</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                "The analytics are incredible. I discovered I was overtrading on Fridays and losing money consistently.
                Identifying that pattern helped me improve my strategy significantly."
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SR</div>
                <div>
                  <div className="font-semibold">Sarah Rodriguez</div>
                  <div className="text-sm text-gray-400">Swing Trader, 5 years</div>
                  <div className="text-sm text-accent">Better pattern recognition</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                "Tax season used to be a nightmare. Now I generate my reports in seconds. The automated wash sale
                detection helps me stay compliant and organized."
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">DJ</div>
                <div>
                  <div className="font-semibold">David Johnson</div>
                  <div className="text-sm text-gray-400">Options Trader, 7 years</div>
                  <div className="text-sm text-accent">Streamlined tax reporting</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional testimonials row */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "I was struggling for months until I started using Concentrade. The emotional tracking showed me I
                was revenge trading after losses. Understanding my patterns has helped me trade more consistently."
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AL</div>
                <div>
                  <div className="font-semibold">Alex Liu</div>
                  <div className="text-sm text-gray-400">Forex Trader, 2 years</div>
                  <div className="text-sm text-accent">More consistent results</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                "The ROI tracking is game-changing. I can see exactly which strategies work and which don't. The data-driven
                insights have significantly improved my risk-adjusted returns."
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">JM</div>
                <div>
                  <div className="font-semibold">Jessica Martinez</div>
                  <div className="text-sm text-gray-400">Crypto Trader, 4 years</div>
                  <div className="text-sm text-accent">Improved risk management</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-300">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="pricing-card">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Up to 50 trades/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Trade journal</span>
                </li>
              </ul>
              <Link href="/signup" className="btn-secondary w-full">
                Get Started Free
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Unlimited trades</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Emotional intelligence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Tax reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Priority support</span>
                </li>
              </ul>
              <a href="/signup" className="btn-primary w-full">
                Get Started
              </a>
            </div>

            <div className="pricing-card">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">$99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <a href="/signup" className="btn-secondary w-full">
                Contact Sales
              </a>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8">Concentrade vs. Spreadsheets</h3>
            <div className="bg-secondary/30 rounded-2xl overflow-hidden border border-accent/20 shadow-xl">
              <div className="comparison-table-grid">
                {/* Header Row */}
                <div className="comparison-table-header rounded-tl-2xl">Feature</div>
                <div className="comparison-table-header">Spreadsheets</div>
                <div className="comparison-table-header rounded-tr-2xl text-accent">Concentrade</div>

                {/* Row 1: Setup Time */}
                <div className="comparison-table-row group">
                  <div className="comparison-table-cell">Setup Time</div>
                  <div className="comparison-table-cell text-error">
                    <Minus className="h-5 w-5 mr-2" />
                    Hours
                  </div>
                  <div className="comparison-table-cell concentrade-advantage text-accent">
                    <Check className="h-5 w-5 mr-2" />2 minutes
                  </div>
                </div>

                {/* Row 2: Pattern Recognition */}
                <div className="comparison-table-row group">
                  <div className="comparison-table-cell">Pattern Recognition</div>
                  <div className="comparison-table-cell text-error">
                    <Minus className="h-5 w-5 mr-2" />
                    Manual
                  </div>
                  <div className="comparison-table-cell concentrade-advantage text-accent">
                    <Check className="h-5 w-5 mr-2" />
                    AI-Powered
                  </div>
                </div>

                {/* Row 3: Emotional Tracking */}
                <div className="comparison-table-row group">
                  <div className="comparison-table-cell">Emotional Tracking</div>
                  <div className="comparison-table-cell text-error">
                    <X className="h-5 w-5 mr-2" />
                    None
                  </div>
                  <div className="comparison-table-cell concentrade-advantage text-accent">
                    <Check className="h-5 w-5 mr-2" />
                    Advanced
                  </div>
                </div>

                {/* Row 4: Tax Reports */}
                <div className="comparison-table-row group">
                  <div className="comparison-table-cell">Tax Reports</div>
                  <div className="comparison-table-cell text-error">
                    <Minus className="h-5 w-5 mr-2" />
                    Manual
                  </div>
                  <div className="comparison-table-cell concentrade-advantage text-accent">
                    <Check className="h-5 w-5 mr-2" />
                    Automated
                  </div>
                </div>

                {/* Row 5: Mobile Access */}
                <div className="comparison-table-row group">
                  <div className="comparison-table-cell">Mobile Access</div>
                  <div className="comparison-table-cell text-error">
                    <Minus className="h-5 w-5 mr-2" />
                    Limited
                  </div>
                  <div className="comparison-table-cell concentrade-advantage text-accent">
                    <Check className="h-5 w-5 mr-2" />
                    Full App
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Trading?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of traders who've eliminated costly mistakes and built consistent profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="btn-primary text-lg px-8 py-4">
              <TrendingUp className="h-6 w-6 mr-2" />
              Start Your Journey
              <ArrowRight className="h-5 w-5 ml-2" />
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary/50 py-12 px-4 border-t border-accent/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ConcentradeLogo size={24} variant="icon" />
                <span className="text-lg font-bold">Concentrade</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transform your trading chaos into consistent profits with professional analytics and emotional
                intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-accent">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-accent">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-accent">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-accent">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-accent">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-accent">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent">
                    API Docs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-accent/20 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Concentrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
