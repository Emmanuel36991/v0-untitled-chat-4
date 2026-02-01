"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAccessibility } from "@/hooks/use-accessibility"
import {
  Accessibility,
  Type,
  Contrast,
  Palette,
  Eye,
  Link as LinkIcon,
  Square,
  RotateCcw,
  X,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, increaseTextSize, decreaseTextSize, toggleSetting, resetAll } = useAccessibility()

  const togglePanel = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Floating Trigger Button */}
      <Button
        onClick={togglePanel}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-[100]",
          "rounded-l-lg rounded-r-none",
          "h-16 w-14 p-0",
          "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
          "text-white",
          "shadow-2xl border-2 border-white dark:border-indigo-300",
          "transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 focus-visible:ring-offset-2",
          isOpen && "translate-x-0 opacity-0 pointer-events-none"
        )}
        aria-label="Open Accessibility Toolbar"
        aria-expanded={isOpen}
        title="Accessibility Tools (Press to open)"
      >
        <Accessibility className="h-7 w-7" aria-hidden="true" />
      </Button>

      {/* Slide-out Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full z-[99]",
          "w-80 bg-white dark:bg-slate-900",
          "border-l-4 border-indigo-600 shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Accessibility Settings Panel"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Accessibility</h2>
            </div>
            <Button
              onClick={togglePanel}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-indigo-200 dark:hover:bg-indigo-900"
              aria-label="Close Accessibility Toolbar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Customize your experience for better accessibility
          </p>
        </div>

          {/* Controls */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Text Size */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" aria-hidden="true" />
                  Text Size
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 text-sm"
                    onClick={decreaseTextSize}
                    disabled={settings.textSize <= 80}
                    aria-label="Decrease text size"
                  >
                    A−
                  </Button>
                  <div
                    className="flex-1 h-12 flex items-center justify-center border border-border rounded-md bg-muted/30 font-mono text-sm"
                    role="status"
                    aria-live="polite"
                  >
                    {settings.textSize}%
                  </div>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 text-sm"
                    onClick={increaseTextSize}
                    disabled={settings.textSize >= 200}
                    aria-label="Increase text size"
                  >
                    A+
                  </Button>
                </div>
              </section>

              <Separator />

              {/* Contrast Modes */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Contrast className="h-4 w-4 text-primary" aria-hidden="true" />
                  Contrast Modes
                </h3>
                <div className="space-y-2">
                  <ToggleButton
                    active={settings.highContrast}
                    onClick={() => toggleSetting("highContrast")}
                    icon={<Contrast className="h-4 w-4" />}
                    label="High Contrast"
                    description="Yellow text on black background"
                  />
                  <ToggleButton
                    active={settings.grayscale}
                    onClick={() => toggleSetting("grayscale")}
                    icon={<Palette className="h-4 w-4" />}
                    label="Grayscale"
                    description="Remove all colors"
                  />
                  <ToggleButton
                    active={settings.invertColors}
                    onClick={() => toggleSetting("invertColors")}
                    icon={<Eye className="h-4 w-4" />}
                    label="Invert Colors"
                    description="Negative color mode"
                  />
                </div>
              </section>

              <Separator />

              {/* Readability */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" aria-hidden="true" />
                  Readability
                </h3>
                <div className="space-y-2">
                  <ToggleButton
                    active={settings.readableFont}
                    onClick={() => toggleSetting("readableFont")}
                    icon={<Type className="h-4 w-4" />}
                    label="Readable Font"
                    description="Use system sans-serif font"
                  />
                  <ToggleButton
                    active={settings.highlightLinks}
                    onClick={() => toggleSetting("highlightLinks")}
                    icon={<LinkIcon className="h-4 w-4" />}
                    label="Highlight Links"
                    description="Underline and highlight all links"
                  />
                  <ToggleButton
                    active={settings.stopAnimations}
                    onClick={() => toggleSetting("stopAnimations")}
                    icon={<Square className="h-4 w-4" />}
                    label="Stop Animations"
                    description="Pause all animations and videos"
                  />
                </div>
              </section>

              <Separator />

              {/* Structure */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Square className="h-4 w-4 text-primary" aria-hidden="true" />
                  Structure
                </h3>
                <div className="space-y-2">
                  <ToggleButton
                    active={settings.showHeadings}
                    onClick={() => toggleSetting("showHeadings")}
                    icon={<Square className="h-4 w-4" />}
                    label="Show Headings"
                    description="Outline all heading elements"
                  />
                </div>
              </section>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border/60 space-y-3">
            <Button
              variant="destructive"
              className="w-full h-12 font-semibold"
              onClick={resetAll}
              aria-label="Reset all accessibility settings"
            >
              <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
              Reset All Settings
            </Button>
            <a
              href="/accessibility-statement"
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Accessibility Statement
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[98]"
          onClick={togglePanel}
          aria-hidden="true"
        />
      )}
    </>
  )
}

// Helper Component for Toggle Buttons
function ToggleButton({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  description: string
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      className={cn(
        "w-full h-auto p-3 flex items-start gap-3 text-left",
        "transition-all duration-200",
        active && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label}: ${active ? "enabled" : "disabled"}. ${description}`}
    >
      <div className="mt-0.5" aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs opacity-80 mt-0.5">{description}</div>
      </div>
    </Button>
  )
}
