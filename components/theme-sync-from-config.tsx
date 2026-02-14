"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { fetchUserConfiguration } from "@/app/actions/user-config-actions"
import type { ThemePreference } from "@/types/user-config"

/**
 * When mounted inside the authenticated app, fetches user config and applies
 * saved theme so preference persists across devices and sessions.
 */
export function ThemeSyncFromUserConfig() {
  const { setTheme } = useTheme()
  const appliedRef = useRef(false)

  useEffect(() => {
    if (appliedRef.current) return

    const apply = async () => {
      const config = await fetchUserConfiguration()
      const preference = config?.theme as ThemePreference | undefined
      if (preference && ["light", "dark", "system"].includes(preference)) {
        setTheme(preference)
        appliedRef.current = true
      }
    }

    apply()
  }, [setTheme])

  return null
}
