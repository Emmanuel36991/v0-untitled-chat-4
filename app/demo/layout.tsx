"use client"

import type React from "react"

import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"
import "./demo.css"

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Demo Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/marketing"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Marketing
              </Link>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">Concentrade Demo</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                Interactive Demo
              </span>
              <Link
                href="/signup"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
