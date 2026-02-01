"use client"

import { useState, useEffect, useCallback } from "react"

export type AccessibilitySettings = {
  textSize: number
  highContrast: boolean
  grayscale: boolean
  invertColors: boolean
  readableFont: boolean
  highlightLinks: boolean
  stopAnimations: boolean
  showHeadings: boolean
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 100,
  highContrast: false,
  grayscale: false,
  invertColors: false,
  readableFont: false,
  highlightLinks: false,
  stopAnimations: false,
  showHeadings: false,
}

const STORAGE_KEY = "concentrade-accessibility"

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSettings(parsed)
        applySettings(parsed)
      } catch (e) {
        console.error("[v0] Failed to parse accessibility settings:", e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      applySettings(settings)
    }
  }, [settings, isLoaded])

  const applySettings = useCallback((newSettings: AccessibilitySettings) => {
    const root = document.documentElement

    // Text Size
    root.style.fontSize = `${newSettings.textSize}%`

    // High Contrast
    if (newSettings.highContrast) {
      root.classList.add("access-high-contrast")
    } else {
      root.classList.remove("access-high-contrast")
    }

    // Grayscale
    if (newSettings.grayscale) {
      root.classList.add("access-grayscale")
    } else {
      root.classList.remove("access-grayscale")
    }

    // Invert Colors
    if (newSettings.invertColors) {
      root.classList.add("access-invert")
    } else {
      root.classList.remove("access-invert")
    }

    // Readable Font
    if (newSettings.readableFont) {
      root.classList.add("access-readable-font")
    } else {
      root.classList.remove("access-readable-font")
    }

    // Highlight Links
    if (newSettings.highlightLinks) {
      root.classList.add("access-highlight-links")
    } else {
      root.classList.remove("access-highlight-links")
    }

    // Stop Animations
    if (newSettings.stopAnimations) {
      root.classList.add("access-stop-animations")
    } else {
      root.classList.remove("access-stop-animations")
    }

    // Show Headings
    if (newSettings.showHeadings) {
      root.classList.add("access-show-headings")
    } else {
      root.classList.remove("access-show-headings")
    }
  }, [])

  const increaseTextSize = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      textSize: Math.min(prev.textSize + 10, 200),
    }))
  }, [])

  const decreaseTextSize = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      textSize: Math.max(prev.textSize - 10, 80),
    }))
  }, [])

  const toggleSetting = useCallback((key: keyof Omit<AccessibilitySettings, "textSize">) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }, [])

  const resetAll = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    const root = document.documentElement
    root.style.fontSize = "100%"
    root.classList.remove(
      "access-high-contrast",
      "access-grayscale",
      "access-invert",
      "access-readable-font",
      "access-highlight-links",
      "access-stop-animations",
      "access-show-headings"
    )
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    settings,
    increaseTextSize,
    decreaseTextSize,
    toggleSetting,
    resetAll,
    isLoaded,
  }
}
