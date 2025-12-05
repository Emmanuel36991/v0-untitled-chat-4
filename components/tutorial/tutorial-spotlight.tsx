"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { TutorialStep } from "@/types/tutorial"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, ChevronRight, ChevronLeft, MousePointerClick, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface TutorialSpotlightProps {
  step: TutorialStep
  totalSteps: number
  currentStepNumber: number
  onNext: () => void
  onPrevious?: () => void
  onSkip: () => void
  onComplete: () => void
  isActive: boolean
}

export function TutorialSpotlight({
  step,
  totalSteps,
  currentStepNumber,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  isActive,
}: TutorialSpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [isReady, setIsReady] = useState(false)

  // 1. Handle Window Resize
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      // Re-calculate target rect on resize
      if (step.targetElement) {
        const element = document.querySelector(step.targetElement)
        if (element) setTargetRect(element.getBoundingClientRect())
      }
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [step.targetElement])

  // 2. Find Target & Scroll
  useEffect(() => {
    setIsReady(false)
    if (!step.targetElement) {
      // If no target (intro step), center the rect for visual consistency or null it
      setTargetRect(null)
      setIsReady(true)
      return
    }

    const timer = setTimeout(() => {
      const element = document.querySelector(step.targetElement!) as HTMLElement
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
        
        // Wait for scroll to finish mostly
        setTimeout(() => {
          setTargetRect(element.getBoundingClientRect())
          setIsReady(true)
        }, 500)
      } else {
        // Fallback if element not found
        console.warn(`Tutorial target not found: ${step.targetElement}`)
        setTargetRect(null)
        setIsReady(true)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [step, currentStepNumber])

  // 3. Calculate SVG Path for the "Hole"
  const spotlightPath = useMemo(() => {
    if (!targetRect || !windowSize.width) return ""
    
    const padding = step.highlightPadding || 16
    const { left, top, width, height } = targetRect
    
    // Outer rectangle (covers screen)
    const outer = `M0,0 H${windowSize.width} V${windowSize.height} H0 Z`
    
    // Inner rectangle (the hole) - drawn counter-clockwise to create cutout
    const x = left - padding
    const y = top - padding
    const w = width + padding * 2
    const h = height + padding * 2
    const inner = `M${x},${y} h${w} v${h} h-${w} Z`

    return `${outer} ${inner}`
  }, [targetRect, windowSize, step.highlightPadding])

  // 4. Calculate Tooltip Position
  const tooltipPosition = useMemo(() => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    
    const padding = 24
    const tooltipWidth = 380
    const tooltipHeight = 250 // approx
    
    // Default: Bottom Center
    let top = targetRect.bottom + padding
    let left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)
    
    // Flip to top if not enough space below
    if (top + tooltipHeight > windowSize.height) {
      top = targetRect.top - tooltipHeight - padding
    }
    
    // Clamp horizontally
    if (left < 20) left = 20
    if (left + tooltipWidth > windowSize.width - 20) left = windowSize.width - tooltipWidth - 20

    return { top, left }
  }, [targetRect, windowSize])

  if (!isActive) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* SVG Overlay with Hole */}
        <svg className="w-full h-full absolute inset-0">
          <motion.path
            d={spotlightPath}
            fill="rgba(0, 0, 0, 0.75)"
            fillRule="evenodd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, d: spotlightPath }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="pointer-events-auto" // Blocks clicks on the overlay
          />
        </svg>

        {/* Glowing Border around target */}
        {targetRect && (
          <motion.div
            className="absolute rounded-lg border-2 border-primary shadow-[0_0_30px_rgba(59,130,246,0.6)] pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              top: targetRect.top - (step.highlightPadding || 16),
              left: targetRect.left - (step.highlightPadding || 16),
              width: targetRect.width + (step.highlightPadding || 16) * 2,
              height: targetRect.height + (step.highlightPadding || 16) * 2,
            }}
            transition={{ duration: 0.4, ease: "backOut" }}
          />
        )}

        {/* The Card Tooltip */}
        {isReady && (
          <motion.div
            className="absolute pointer-events-auto"
            style={tooltipPosition}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            key={step.id} // Re-animate on step change
          >
            <Card className="w-[380px] bg-background/95 backdrop-blur-md border-primary/20 shadow-2xl overflow-hidden">
              {/* Progress Bar */}
              <div className="h-1 w-full bg-muted">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: `${((currentStepNumber - 1) / totalSteps) * 100}%` }}
                  animate={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
                />
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-primary tracking-wider uppercase">
                      Step {currentStepNumber} of {totalSteps}
                    </span>
                    <h3 className="text-xl font-bold mt-1 leading-tight">{step.title}</h3>
                  </div>
                  <button onClick={onSkip} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="prose prose-sm dark:prose-invert mb-6 text-muted-foreground leading-relaxed">
                  {step.description}
                </div>

                {/* Action Hint */}
                {step.action === "click" && (
                  <div className="flex items-center gap-2 text-sm text-blue-500 font-medium mb-6 bg-blue-500/10 p-2 rounded-md">
                    <MousePointerClick className="w-4 h-4" />
                    <span>Click the highlighted element to continue</span>
                  </div>
                )}
                {step.action === "scroll" && (
                  <div className="flex items-center gap-2 text-sm text-orange-500 font-medium mb-6 bg-orange-500/10 p-2 rounded-md">
                    <ArrowDown className="w-4 h-4" />
                    <span>Scroll down to see more</span>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onPrevious} 
                      disabled={!onPrevious}
                      className="text-xs"
                    >
                      <ChevronLeft className="w-3 h-3 mr-1" /> Back
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onSkip}
                      className="text-xs text-muted-foreground"
                    >
                      Skip
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={currentStepNumber === totalSteps ? onComplete : onNext}
                      className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                    >
                      {currentStepNumber === totalSteps ? "Finish" : "Next"}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}
