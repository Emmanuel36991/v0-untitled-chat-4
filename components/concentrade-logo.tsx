"use client"

import { cn } from "@/lib/utils"

interface ConcentradeLogoProps {
  size?: number
  className?: string
  variant?: "full" | "icon" | "text"
}

/**
 * Concentrade Logo Component
 * 
 * Design Concept: "Precision Focus"
 * - A stylized 'C' formed by geometric trading bars.
 * - A central "focus point" representing the 'Concentrate' aspect.
 * - Upward momentum vectors representing the 'Trade' aspect.
 */
export function ConcentradeLogo({ 
  size = 40, 
  className = "", 
  variant = "full" 
}: ConcentradeLogoProps) {
  const iconSize = variant === "text" ? 0 : size
  const textSize = variant === "icon" ? 0 : size * 0.6

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {variant !== "text" && (
        <div className="relative flex items-center justify-center" style={{ width: iconSize, height: iconSize }}>
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
          >
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="color-mix(in oklch, var(--primary) 70%, black)" />
              </linearGradient>
              
              {/* Glow filter for the focus point */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer 'C' Structure - Geometric Trading Bars */}
            {/* Top Bar */}
            <rect x="20" y="20" width="50" height="12" rx="4" fill="url(#logoGradient)" />
            {/* Left Vertical Bar */}
            <rect x="20" y="20" width="12" height="60" rx="4" fill="url(#logoGradient)" />
            {/* Bottom Bar */}
            <rect x="20" y="68" width="50" height="12" rx="4" fill="url(#logoGradient)" />
            
            {/* Trading Momentum Vector (Upward) */}
            <path 
              d="M45 55 L65 35 L85 55" 
              stroke="url(#logoGradient)" 
              strokeWidth="10" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              opacity="0.8"
            />
            <path 
              d="M65 35 L65 65" 
              stroke="url(#logoGradient)" 
              strokeWidth="10" 
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* The "Concentrate" Focus Point */}
            <circle 
              cx="65" 
              cy="50" 
              r="6" 
              fill="var(--primary)" 
              filter="url(#glow)"
              className="animate-pulse"
            />
            
            {/* Crosshair/Aperture Lines (Subtle) */}
            <line x1="65" y1="38" x2="65" y2="42" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <line x1="65" y1="58" x2="65" y2="62" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <line x1="53" y1="50" x2="57" y2="50" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <line x1="73" y1="50" x2="77" y2="50" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {variant !== "icon" && (
        <div className="flex flex-col justify-center">
          <span
            className="font-bold tracking-tighter text-foreground"
            style={{ fontSize: textSize, lineHeight: 1 }}
          >
            CONCEN<span className="text-primary">TRADE</span>
          </span>
          {size >= 50 && (
            <span
              className="font-medium tracking-[0.2em] text-muted-foreground uppercase mt-1"
              style={{ fontSize: textSize * 0.3, lineHeight: 1 }}
            >
              Precision Journal
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function ConcentradeLogoMinimal({ size = 32, className = "" }: { size?: number; className?: string }) {
  return <ConcentradeLogo size={size} className={className} variant="icon" />
}

export const ConcentradeLogos = {
  Full: (props: ConcentradeLogoProps) => <ConcentradeLogo {...props} variant="full" />,
  Icon: (props: ConcentradeLogoProps) => <ConcentradeLogo {...props} variant="icon" />,
  Text: (props: ConcentradeLogoProps) => <ConcentradeLogo {...props} variant="text" />,
  Minimal: ConcentradeLogoMinimal,
}
