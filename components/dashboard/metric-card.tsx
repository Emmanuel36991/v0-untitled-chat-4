"use client"

import React, { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, AlertCircle, Flame } from "lucide-react"
import { BreakoutIcon } from "@/components/icons/system-icons"
import { cn } from "@/lib/utils"
// NEW: Framer Motion hooks for Holographic Tilt
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

export interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ElementType
  iconColor: string
  trendData?: any[]
  subtitle?: string
  tooltipInfo?: string
  onClick?: () => void
  isHot?: boolean
  className?: string
}

export const MetricCard = React.memo<MetricCardProps>(
  ({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor,
    subtitle,
    tooltipInfo,
    onClick,
    isHot = false,
    className,
  }) => {
    // --- 3D Holographic Tilt Effect State ---
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const x = useMotionValue(0) // Mouse X position relative to center
    const y = useMotionValue(0) // Mouse Y position relative to center

    // Smooth physics springs for the rotation 
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }
    const springX = useSpring(x, springConfig)
    const springY = useSpring(y, springConfig)

    // Map mouse position to rotation angles (-10 to 10 degrees)
    const rotateX = useTransform(springY, [-0.5, 0.5], ["10deg", "-10deg"])
    const rotateY = useTransform(springX, [-0.5, 0.5], ["-10deg", "10deg"])

    // Glare position based on mouse position
    const glareX = useTransform(springX, [-0.5, 0.5], ["0%", "100%"])
    const glareY = useTransform(springY, [-0.5, 0.5], ["0%", "100%"])

    // Scale effect
    const scale = useSpring(isHovered ? 1.05 : 1, springConfig)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      // Calculate normalized mouse position from -0.5 to 0.5
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5
      x.set(mouseX)
      y.set(mouseY)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      x.set(0)
      y.set(0)
    }

    return (
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          scale,
          perspective: 1000,
          transformStyle: "preserve-3d"
        }}
        className={cn("w-full h-full cursor-pointer relative z-10", className)}
      >
        <Card
          className={cn(
            "relative overflow-hidden border shadow-sm transition-all duration-300 group h-full",
            "bg-card/90 backdrop-blur-xl card-enhanced glass-card",
            isHot
              ? "border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_35px_rgba(249,115,22,0.3)] hover:border-orange-500/60"
              : "border-border/60 hover:border-primary/30 hover:shadow-xl dark:hover:shadow-primary/10"
          )}
        >
          {/* Holographic Glare Effect */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay"
              style={{
                background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.4) 0%, transparent 60%)`,
              }}
            />
          )}

          {/* Hot ember glow — top edge accent */}
          {isHot && (
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/80 to-transparent" />
          )}

          {/* Animated radial glow behind the card */}
          {isHot && (
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.08]"
              style={{
                background: "radial-gradient(circle, rgb(249,115,22) 0%, transparent 70%)",
                animation: "hot-pulse 3s ease-in-out infinite",
              }}
            />
          )}

          <CardContent
            className="p-6 relative z-10"
            style={{ transform: "translateZ(30px)" }} // Pop content forward slightly in 3D space
          >
            <div className="flex justify-between items-start mb-3">
              <div
                className={cn(
                  "transition-transform duration-300 group-hover:scale-110",
                  isHot ? "text-orange-500" : iconColor
                )}
              >
                <Icon className="h-10 w-10 drop-shadow-md" />
              </div>
              {change && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "font-mono text-xs px-2 py-0.5 border-0 shadow-sm backdrop-blur-md",
                    changeType === "positive" && "text-profit bg-profit/15",
                    changeType === "negative" && "text-loss bg-loss/15",
                    changeType === "neutral" && "text-muted-foreground bg-muted/50"
                  )}
                >
                  {changeType === "positive" ? (
                    <BreakoutIcon className="h-3 w-3 mr-1 inline" />
                  ) : changeType === "negative" ? (
                    <BreakoutIcon className="h-3 w-3 mr-1 inline rotate-180" />
                  ) : (
                    <MoreHorizontal className="h-3 w-3 mr-1 inline" />
                  )}
                  {change}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {title}
                {isHot && (
                  <Flame className="h-3.5 w-3.5 text-orange-500" style={{ animation: "hot-flicker 1.5s ease-in-out infinite" }} />
                )}
                {tooltipInfo && (
                  <AlertCircle className="h-3 w-3 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className={cn(
                  "text-2xl font-bold tracking-tight font-mono drop-shadow-sm",
                  isHot ? "text-orange-400" : "text-foreground"
                )}>
                  {value}
                </h3>
              </div>
              {subtitle && (
                <p className={cn(
                  "text-xs font-medium pt-1",
                  isHot ? "text-orange-500/70" : "text-muted-foreground/80 group-hover:text-muted-foreground"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </CardContent>

          {/* Keyframes for hot effects */}
          {isHot && (
            <style>{`
              @keyframes hot-pulse {
                0%, 100% { opacity: 0.05; transform: scale(1); }
                50% { opacity: 0.15; transform: scale(1.15); }
              }
              @keyframes hot-flicker {
                0%, 100% { opacity: 1; transform: translateY(0) scale(1); }
                25% { opacity: 0.7; transform: translateY(-1px) scale(0.95); }
                75% { opacity: 0.9; transform: translateY(0.5px) scale(1.05); }
              }
            `}</style>
          )}
        </Card>
      </motion.div>
    )
  }
)

MetricCard.displayName = "MetricCard"
