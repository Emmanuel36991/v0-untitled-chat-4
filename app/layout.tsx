import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AccessibilityToolbar } from "@/components/layout/accessibility-toolbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Concentrade - Advanced Trading Journal",
  description: "Professional trading journal with advanced analytics, AI-powered insights, and comprehensive trade tracking for better trading decisions.",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 1. Block Google Translate (common crash cause)
    <html lang="en" className="notranslate" translate="no" suppressHydrationWarning>
      
      {/* 2. Suppress warnings on body */}
      <body className={inter.className} suppressHydrationWarning>
        
        {/* 3. THE MAGIC FIX: The Buffer Div */}
        {/* React manages THIS div, not the body. Extensions can mess up body all they want. */}
        <div id="app-root"> 
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            {children}
            <Toaster />
            <AccessibilityToolbar />
          </ThemeProvider>
        </div>
        
      </body>
    </html>
  )
}
