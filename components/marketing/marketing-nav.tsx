"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 py-4" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ConcentradeLogo size={32} variant="full" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <button
              onClick={() => scrollToSection("features")}
              className="text-slate-400 hover:text-white transition-colors duration-200 font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-slate-400 hover:text-white transition-colors duration-200 font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-slate-400 hover:text-white transition-colors duration-200 font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection("demo")}
              className="text-slate-400 hover:text-white transition-colors duration-200 font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              Demo
            </button>
            <div className="h-4 w-px bg-slate-800 mx-2" />
            <Link 
              href="/login" 
              className="text-slate-400 hover:text-white transition-colors duration-200 font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              Login
            </Link>
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/10 transition-all duration-200 font-bold text-[10px] uppercase tracking-[0.2em] px-6 py-5 rounded-xl"
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
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-8 space-y-6 border-t border-slate-900 mt-4 bg-slate-950 rounded-2xl p-4 shadow-2xl">
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="block w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="block w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection("demo")}
              className="block w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-colors font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              Demo
            </button>
            <div className="pt-4 space-y-4">
              <Button asChild variant="outline" className="w-full border-slate-800 font-bold text-[10px] uppercase tracking-[0.2em] py-6">
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold text-[10px] uppercase tracking-[0.2em] py-6"
              >
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
