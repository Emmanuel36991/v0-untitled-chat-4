import type React from "react"
import type { Metadata } from "next"
import "./marketing.css"

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
    <div className="marketing-layout dark">
      {children}
    </div>
  )
}
