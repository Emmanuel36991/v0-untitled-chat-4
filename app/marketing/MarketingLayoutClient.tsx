"use client"

import type React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { Button } from "@/components/ui/button"
import "./marketing.css"

function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId)
  if (el) el.scrollIntoView({ behavior: "smooth" })
}

function MarketingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "testimonials", label: "Reviews" },
  ]

  return (
    <header className="marketing-nav px-4 lg:px-6 h-20 flex items-center sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <ConcentradeLogo size={40} variant="full" />
        </Link>

        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToSection(link.id)}
              className="nav-link text-sm font-medium"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button asChild variant="ghost" className="nav-link text-sm font-medium text-[#a5b4fc] hover:text-white">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="btn-primary">
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-slate-400 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-20 left-0 right-0 marketing-nav border-t border-slate-800/50 md:hidden py-4 px-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => {
                scrollToSection(link.id)
                setIsMenuOpen(false)
              }}
              className="block w-full text-left py-3 nav-link text-base"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 space-y-2 border-t border-slate-800/50">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
            </Button>
            <Button asChild className="w-full btn-primary">
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Start Free Trial</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

function MarketingFooter() {
  return (
    <footer className="py-12 w-full border-t border-slate-800/50 bg-slate-950">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <ConcentradeLogo size={32} variant="full" />
        </div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Concentrade. All rights reserved.
        </p>
        <nav className="flex gap-6">
          <Link
            href="/terms"
            className="text-sm text-slate-500 hover:text-white underline-offset-4 transition-colors"
            prefetch={false}
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-slate-500 hover:text-white underline-offset-4 transition-colors"
            prefetch={false}
          >
            Privacy
          </Link>
          <Link
            href="/contact"
            className="text-sm text-slate-500 hover:text-white underline-offset-4 transition-colors"
            prefetch={false}
          >
            Contact
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
    <div className="marketing-layout dark min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
