interface ConcentradeLogoProps {
  size?: number
  className?: string
  variant?: "full" | "icon" | "text"
  theme?: "light" | "dark" | "auto"
  /** "indigo" = default app style; "purple" = dashboard loading / marketing (violet gradient) */
  gradient?: "indigo" | "purple"
}

const LOGO_GRADIENTS = {
  indigo: { id: "logoGradIndigo", colors: ["#6366f1", "#4f46e5", "#4338ca"] },
  purple: { id: "logoGradPurple", colors: ["#8B5CF6", "#7C3AED", "#6D28D9"] },
} as const

export function ConcentradeLogo({ size = 40, className = "", variant = "full", theme = "auto", gradient = "indigo" }: ConcentradeLogoProps) {
  const iconSize = variant === "text" ? size * 0.8 : size
  const textSize = variant === "icon" ? 0 : size * 0.6
  const grad = LOGO_GRADIENTS[gradient]
  const textClass = gradient === "purple"
    ? "font-bold tracking-tight bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent"
    : "font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent"

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {variant !== "text" && (
        <div className="relative" style={{ width: iconSize, height: iconSize }}>
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
          >
            <defs>
              <linearGradient id={grad.id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={grad.colors[0]} />
                <stop offset="50%" stopColor={grad.colors[1]} />
                <stop offset="100%" stopColor={grad.colors[2]} />
              </linearGradient>
            </defs>

            <rect x="15" y="25" width="25" height="50" fill={`url(#${grad.id})`} opacity="0.7" rx="2" />
            <rect x="30" y="15" width="25" height="60" fill={`url(#${grad.id})`} opacity="0.85" rx="2" />
            <rect x="45" y="25" width="25" height="50" fill={`url(#${grad.id})`} rx="2" />
            <rect x="60" y="20" width="20" height="55" fill={`url(#${grad.id})`} opacity="0.9" rx="2" />

            <rect x="32" y="17" width="2" height="56" fill="white" opacity="0.3" rx="1" />
            <rect x="47" y="27" width="2" height="46" fill="white" opacity="0.3" rx="1" />
            <rect x="62" y="22" width="2" height="51" fill="white" opacity="0.3" rx="1" />
          </svg>
        </div>
      )}

      {variant !== "icon" && textSize > 0 && (
        <div className="flex flex-col">
          <span
            className={textClass}
            style={{ fontSize: textSize, lineHeight: 1.1 }}
          >
            Concentrade
          </span>
          {size >= 60 && (
            <span
              className="font-medium tracking-wide text-white"
              style={{ fontSize: textSize * 0.35, lineHeight: 1 }}
            >
              TRADING JOURNAL
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function ConcentradeLogoMinimal({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="purpleGradientMini" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
        </defs>

        {/* Simplified building blocks */}
        <rect x="20" y="30" width="15" height="40" fill="url(#purpleGradientMini)" opacity="0.8" rx="1" />
        <rect x="35" y="20" width="15" height="50" fill="url(#purpleGradientMini)" rx="1" />
        <rect x="50" y="35" width="15" height="35" fill="url(#purpleGradientMini)" opacity="0.9" rx="1" />
        <rect x="65" y="25" width="15" height="45" fill="url(#purpleGradientMini)" opacity="0.85" rx="1" />
      </svg>
    </div>
  )
}

// Logo variants for different use cases
export const ConcentradeLogos = {
  Full: (props: ConcentradeLogoProps) => <ConcentradeLogo {...props} variant="full" />,
  Icon: (props: ConcentradeLogoProps) => <ConcentradeLogo {...props} variant="icon" />,
  Text: (props: ConcentradeLogoProps) => <ConcentradeLogo {...props} variant="text" />,
  Minimal: ConcentradeLogoMinimal,
}
