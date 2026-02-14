"use client"

import Link from "next/link"
import { ConcentradeLogo } from "@/components/concentrade-logo"

export function AppFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-border bg-muted/50 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-3">
                        <ConcentradeLogo size={32} />
                        <span className="text-lg font-semibold text-primary">
                            Concentrade
                        </span>
                    </div>

                    {/* Copyright */}
                    <p className="text-sm text-muted-foreground order-last md:order-none">
                        © {currentYear} Concentrade. All rights reserved.
                    </p>

                    {/* Legal Links */}
                    <nav className="flex flex-wrap items-center justify-center gap-6">
                        <Link
                            href="/privacy"
                            className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 decoration-primary/50 transition-all"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 decoration-primary/50 transition-all"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/support"
                            className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 decoration-primary/50 transition-all"
                        >
                            Support
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 decoration-primary/50 transition-all"
                        >
                            Contact
                        </Link>
                        <Link
                            href="/accessibility-statement"
                            className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 decoration-primary/50 transition-all"
                        >
                            Accessibility
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    )
}
