"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { AccessibilityToolbar } from "@/components/layout/accessibility-toolbar"

export function Providers({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always render the provider structure to avoid conditional hook calls
  // but control visibility of theme-dependent components
  return (
    <NextThemesProvider {...props}>
      {children}
      {mounted && (
        <>
          <Toaster />
          <AccessibilityToolbar />
        </>
      )}
    </NextThemesProvider>
  )
}
