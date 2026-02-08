"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, FileText, Shield, HelpCircle, Mail } from "lucide-react"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { cn } from "@/lib/utils"

interface LegalLayoutProps {
    children: React.ReactNode
    title: string
    lastUpdated?: string
}

const legalPages = [
    { name: "Privacy Policy", href: "/privacy", icon: Shield },
    { name: "Terms of Service", href: "/terms", icon: FileText },
    { name: "Support Center", href: "/support", icon: HelpCircle },
    { name: "Contact Us", href: "/contact", icon: Mail },
]

export function LegalLayout({ children, title, lastUpdated }: LegalLayoutProps) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ConcentradeLogo size={36} />
                            <div className="hidden sm:block h-8 w-px bg-slate-300" />
                            <h1 className="text-xl font-semibold text-slate-900 hidden sm:block">Legal Center</h1>
                        </div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back to Home</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="lg:sticky lg:top-24">
                            <nav className="space-y-1 bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                                    Legal Pages
                                </h2>
                                {legalPages.map((page) => {
                                    const Icon = page.icon
                                    const isActive = pathname === page.href
                                    return (
                                        <Link
                                            key={page.href}
                                            href={page.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-purple-50 text-purple-700 shadow-sm"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {page.name}
                                        </Link>
                                    )
                                })}
                            </nav>

                            {/* Quick Links */}
                            <div className="mt-4 bg-slate-50 rounded-lg border border-slate-200 p-4">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Quick Links
                                </h3>
                                <div className="space-y-2">
                                    <Link
                                        href="/accessibility-statement"
                                        className="block text-sm text-slate-600 hover:text-purple-600 transition-colors"
                                    >
                                        Accessibility Statement
                                    </Link>
                                    <a
                                        href="mailto:support@concentrade.com"
                                        className="block text-sm text-slate-600 hover:text-purple-600 transition-colors"
                                    >
                                        Email Support
                                    </a>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 lg:p-12">
                            <div className="mb-8 pb-8 border-b border-slate-200">
                                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">{title}</h1>
                                {lastUpdated && (
                                    <p className="text-sm text-slate-500">Last Updated: {lastUpdated}</p>
                                )}
                            </div>

                            <div className="prose prose-slate prose-lg max-w-none">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
