"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { Button } from "@/components/ui/button"

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full bg-slate-950/90 backdrop-blur-lg border-b border-indigo-500/20 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <ConcentradeLogo size={40} variant="full" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-slate-400 hover:text-white transition-colors duration-200 font-bold text-sm uppercase tracking-widest"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-slate-400 hover:text-white transition-colors duration-200 font-bold text-sm uppercase tracking-widest"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-slate-400 hover:text-white transition-colors duration-200 font-bold text-sm uppercase tracking-widest"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection("demo")}
              className="text-slate-400 hover:text-white transition-colors duration-200 font-bold text-sm uppercase tracking-widest"
            >
              Demo
            </button>
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white font-bold text-lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 font-bold text-sm uppercase tracking-widest px-6 py-6 rounded-xl"
            >
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-slate-800">
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors font-bold text-lg"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="block w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors font-bold text-lg"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="block w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors font-bold text-lg"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection("demo")}
              className="block w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors font-bold text-lg"
            >
              Demo
            </button>
            <Button asChild variant="ghost" className="w-full justify-start font-bold text-lg py-6">
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold text-lg py-6"
            >
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
