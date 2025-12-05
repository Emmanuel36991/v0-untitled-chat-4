"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import type { TutorialStep } from "@/types/tutorial"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft, Zap, Lightbulb } from "lucide-react"

interface InteractiveBubbleProps {
  step: TutorialStep
  totalSteps: number
  currentStepNumber: number
  onNext: () => void
  onPrevious?: () => void
  onSkip: () => void
  onComplete: () => void
  isSmartTip?: boolean
}

export function InteractiveBubble({
  step,
  totalSteps,
  currentStepNumber,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  isSmartTip = false,
}: InteractiveBubbleProps) {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)

  // Find and highlight target element
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!step.targetElement) {
        setHighlightRect(null)
        setIsVisible(true)
        return
      }

      const element = document.querySelector(step.targetElement)
      if (element) {
        const rect = element.getBoundingClientRect()
        setHighlightRect(rect)

        // Calculate tooltip position with smart offset
        const padding = 16
        const bubbleWidth = 340
        let top = rect.top + window.scrollY - 140
        let left = rect.left + rect.width / 2 - bubbleWidth / 2

        // Position variants
        if (step.position === "bottom") {
          top = rect.bottom + window.scrollY + padding
        } else if (step.position === "top") {
          top = rect.top + window.scrollY - 160
        } else if (step.position === "left") {
          left = rect.left - bubbleWidth - padding
          top = rect.top + window.scrollY + rect.height / 2 - 60
        } else if (step.position === "right") {
          left = rect.right + padding
          top = rect.top + window.scrollY + rect.height / 2 - 60
        }

        // Keep bubble in viewport
        left = Math.max(20, Math.min(left, window.innerWidth - bubbleWidth - 20))
        top = Math.max(20, top)

        setTooltipPosition({ top, left })
        setIsVisible(true)

        // Smooth scroll element into view
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 300)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [step])

  const isLastStep = currentStepNumber === totalSteps
  const isFirstStep = currentStepNumber === 1

  return (
    <AnimatePresence>
      {/* Highlight overlay with pulse effect */}
      {highlightRect && isVisible && (
        <>
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/35 backdrop-blur-sm z-40 pointer-events-none"
            style={{
              clipPath: highlightRect
                ? `polygon(
                  0% 0%,
                  0% 100%,
                  100% 100%,
                  100% 0%,
                  0% 0%,
                  ${highlightRect.left - 12}px ${highlightRect.top - 12}px,
                  ${highlightRect.left - 12}px ${highlightRect.top + highlightRect.height + 12}px,
                  ${highlightRect.left + highlightRect.width + 12}px ${highlightRect.top + highlightRect.height + 12}px,
                  ${highlightRect.left + highlightRect.width + 12}px ${highlightRect.top - 12}px,
                  ${highlightRect.left - 12}px ${highlightRect.top - 12}px
                )`
                : "none",
            }}
          />

          {/* Animated glow ring around highlighted element */}
          <motion.div
            className="fixed z-40 pointer-events-none"
            style={{
              top: highlightRect.top - 12 + window.scrollY,
              left: highlightRect.left - 12,
              width: highlightRect.width + 24,
              height: highlightRect.height + 24,
            }}
          >
            <motion.div
              className="absolute inset-0 border-2 border-blue-400 rounded-lg"
              animate={{
                boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 12px rgba(59, 130, 246, 0)"],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          </motion.div>
        </>
      )}

      {/* Interactive Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed z-50 pointer-events-auto"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          width: "340px",
        }}
      >
        <div className="relative">
          {/* Bubble container with gradient background */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-blue-200/50 dark:border-blue-900/30 shadow-2xl overflow-hidden">
            {/* Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-transparent" />

            <div className="p-5 space-y-4">
              {/* Header with icon */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className={`flex-shrink-0 p-2 rounded-lg ${
                      isSmartTip ? "bg-amber-100 dark:bg-amber-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                    }`}
                  >
                    {isSmartTip ? (
                      <Lightbulb
                        className={`h-5 w-5 ${
                          isSmartTip ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"
                        }`}
                      />
                    ) : (
                      <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                        isSmartTip ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {isSmartTip ? "💡 Smart Tip" : `Step ${currentStepNumber}/${totalSteps}`}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{step.title}</h3>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSkip}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Close tutorial"
                >
                  <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </motion.button>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{step.description}</p>

              {/* Progress bar */}
              {!isSmartTip && (
                <div className="pt-1">
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 text-right">
                    {currentStepNumber} of {totalSteps}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {!isFirstStep && onPrevious && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onPrevious}
                      className="flex items-center gap-1.5 text-xs h-8 bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button
                    onClick={isLastStep ? onComplete : onNext}
                    size="sm"
                    className="w-full flex items-center justify-center gap-1.5 text-xs h-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    {isLastStep ? "Complete" : "Next"}
                    {!isLastStep && <ChevronRight className="h-4 w-4" />}
                  </Button>
                </motion.div>
              </div>

              {/* Skip link */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={onSkip}
                className="w-full text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
              >
                Skip this tutorial
              </motion.button>
            </div>
          </div>

          {/* Decorative gradient orbs */}
          <motion.div
            className="absolute -top-20 -right-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-10 blur-2xl pointer-events-none"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
