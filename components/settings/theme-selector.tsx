"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeSelector() {
  const { setTheme, theme } = useTheme()

  const themes = [
    { name: "light", label: "Light", icon: Sun },
    { name: "dark", label: "Dark", icon: Moon },
    { name: "system", label: "System", icon: Monitor },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((t) => {
        const Icon = t.icon
        const isActive = theme === t.name
        return (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
              isActive 
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400" 
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400"
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-bold">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
