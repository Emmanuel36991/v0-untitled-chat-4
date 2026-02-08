"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { cn } from "@/lib/utils"
import { ArrowLeft, FileText, Shield, HelpCircle, Mail, Scale } from "lucide-react"

interface LegalLayoutProps {
    children: React.ReactNode
    title: string
    lastUpdated?: string
}

export function LegalLayout({ children, title, lastUpdated }: LegalLayoutProps) {
    const pathname = usePathname()

    const legalPages = [
        {
            name: "Privacy Policy",
            href: "/privacy",
            icon: Shield,
            description: "How we protect your data",
        },
        {
            name: "Terms of Service",
            href: "/terms",
            icon: FileText,
            description: "Rules and guidelines",
        },
        {
            name: "Support Center",
            href: "/support",
            icon: HelpCircle,
            description: "Get help and answers",
        },
        {
            name: "Contact Us",
            href: "/contact",
            icon: Mail,
            description: "Get in touch",
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo and Title */}
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-3 group">
                                <ConcentradeLogo size={36} />
                                <div>
                                    <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                                        Concentrade
                                    </span>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Scale className="w-3 h-3" />
                                        Legal Center
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Back to Home */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 transition-colors duration-200 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-72 flex-shrink-0">
                        <div className="lg:sticky lg:top-24">
                            <nav className="space-y-2 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                                    Legal Documents
                                </h2>
                                {legalPages.map((page) => {
                                    const Icon = page.icon
                                    const isActive = pathname === page.href

                                    return (
                                        <Link
                                            key={page.href}
                                            href={page.href}
                                            className={cn(
                                                "flex items-start gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                                                isActive
                                                    ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md shadow-purple-500/20"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "w-5 h-5 flex-shrink-0 mt-0.5",
                                                    isActive ? "text-white" : "text-slate-400 group-hover:text-purple-500"
                                                )}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className={cn("font-semibold", isActive ? "text-white" : "text-slate-900")}>
                                                    {page.name}
                                                </div>
                                                <div
                                                    className={cn(
                                                        "text-xs mt-0.5",
                                                        isActive ? "text-purple-100" : "text-slate-500"
                                                    )}
                                                >
                                                    {page.description}
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </nav>

                            {/* Quick Links */}
                            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                                    Quick Links
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <a
                                        href="/accessibility-statement"
                                        className="block text-slate-600 hover:text-purple-600 transition-colors duration-200"
                                    >
                                        Accessibility Statement
                                    </a>
                                    <a
                                        href="mailto:support@concentrade.com"
                                        className="block text-slate-600 hover:text-purple-600 transition-colors duration-200"
                                    >
                                        Email Support
                                    </a>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Article Header */}
                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-8 lg:px-12 py-8 border-b border-slate-200">
                                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">{title}</h1>
                                {lastUpdated && (
                                    <p className="text-sm text-slate-600 flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
                                        Last Updated: {lastUpdated}
                                    </p>
                                )}
                            </div>

                            {/* Article Content */}
                            <div className="px-8 lg:px-12 py-8 lg:py-10">
                                <div className="prose prose-slate prose-lg max-w-none leading-relaxed">
                                    {children}
                                </div>
                            </div>
                        </article>
                    </main>
                </div>
            </div>
        </div>
    )
}
