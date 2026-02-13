"use client"

import type React from "react"
import Link from "next/link"
import { BarChart3, Menu, X } from "lucide-react"
import { useState } from "react"
import "./marketing.css"

// Modern Particle Background Component
const ParticleBackground = () => {
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 3 + 2}px`,
    delay: `${Math.random() * 10}s`,
    duration: `${8 + Math.random() * 8}s`,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-float"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}

function MarketingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#pricing", label: "Pricing" },
    { href: "#demo", label: "Demo" },
  ]

  return (
    <header className="marketing-nav px-4 lg:px-6 h-16 flex items-center sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/marketing" className="flex items-center justify-center group" prefetch={false}>
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-md group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-500"></div>
            <div className="relative p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="ml-3 text-xl font-bold gradient-text tracking-tight">TradeOkev</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="nav-link text-sm font-medium" prefetch={false}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a href="/login" className="nav-link text-sm font-medium">
            Login
          </a>
          <a href="/signup" className="btn-primary">
            Start Free Trial
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-gray-800/50 md:hidden">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block nav-link text-base"
                onClick={() => setIsMenuOpen(false)}
                prefetch={false}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <a href="/login" className="block nav-link text-base" onClick={() => setIsMenuOpen(false)}>
                Login
              </a>
              <a href="/signup" className="btn-primary block text-center" onClick={() => setIsMenuOpen(false)}>
                Start Free Trial
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function MarketingFooter() {
  return (
    <footer className="py-12 w-full border-t border-gray-800/50 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-6">
        <div className="flex items-center">
          <div className="relative">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="ml-3 text-lg font-semibold gradient-text">TradeOkev</span>
        </div>

        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} TradeOkev Systems. Elevate Your Trading Journey.
        </p>

        <nav className="flex gap-6">
          <Link
            href="/terms"
            className="text-sm text-gray-400 hover:text-white hover:underline underline-offset-4 transition-colors duration-300"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-gray-400 hover:text-white hover:underline underline-offset-4 transition-colors duration-300"
            prefetch={false}
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  )
}

export default function MarketingLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-layout dark">
      {children}
    </div>
  )
}
