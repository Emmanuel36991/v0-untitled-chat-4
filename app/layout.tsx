import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Concentrade - Advanced Trading Journal",
  description: "Professional trading journal with advanced analytics.",
  generator: "v0.app",
  applicationName: "Concentrade",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    title: "Concentrade",
    capable: true,
    statusBarStyle: "default",
  },
  other: {
    "msapplication-TileColor": "#7C3AED",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="notranslate" translate="no" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Skip-to-content link for keyboard / screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        {/* The Buffer Div isolates the app from browser extensions */}
        <div id="app-root">
          <Providers
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange
            storageKey="concentrade-theme"
          >
            {children}
          </Providers>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
