"use client"

import type React from "react"
import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { MarketingNav } from "@/components/marketing-nav"
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

function MarketingFooter() {
  return (
    <footer className="py-12 w-full border-t border-gray-800/50 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <ConcentradeLogo size={24} variant="icon" />
          <span className="text-lg font-semibold gradient-text">Concentrade</span>
        </div>

        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Concentrade. Elevate Your Trading Journey.
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
    <div className="marketing-layout">
      <ParticleBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <MarketingNav />
        <main className="flex-1 pt-16">{children}</main>
        <MarketingFooter />
      </div>
    </div>
  )
}
