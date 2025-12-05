import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css" // Import global styles
import "./marketing.css" // Import marketing-specific styles
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Concentrade Trading Journal - Turn Your Trading Chaos Into Consistent Profits",
  description:
    "The only trading journal that combines professional analytics with emotional intelligence to eliminate costly mistakes and build consistent trading strategies.",
}

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} marketing-layout`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
