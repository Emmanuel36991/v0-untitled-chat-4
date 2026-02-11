import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Log In - Concentrade",
  description: "Log in to your Concentrade trading journal account.",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
