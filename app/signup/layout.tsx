import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Concentrade",
  description: "Create your free Concentrade trading journal account.",
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
