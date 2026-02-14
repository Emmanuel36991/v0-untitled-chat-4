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
