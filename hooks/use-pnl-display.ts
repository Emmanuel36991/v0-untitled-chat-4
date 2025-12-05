"use client"

import { useState, useEffect } from "react"
import type { PnLDisplayFormat } from "@/types/instrument-calculations"

export function usePnLDisplay() {
  const [displayFormat, setDisplayFormat] = useState<PnLDisplayFormat>("dollars")

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pnl-display-format")
    if (saved && ["dollars", "points", "pips", "percentage"].includes(saved)) {
      setDisplayFormat(saved as PnLDisplayFormat)
    }
  }, [])

  // Save preference to localStorage
  const updateDisplayFormat = (format: PnLDisplayFormat) => {
    setDisplayFormat(format)
    localStorage.setItem("pnl-display-format", format)
  }

  return {
    displayFormat,
    setDisplayFormat: updateDisplayFormat,
  }
}
