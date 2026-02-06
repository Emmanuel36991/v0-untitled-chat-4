import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Concentrade - Safe Mode",
  description: "Trading Journal",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* The Buffer Div - Crucial for hydration stability */}
        <div id="app-root">
            {children}
        </div>
      </body>
    </html>
  )
}
