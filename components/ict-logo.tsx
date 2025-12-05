interface ICTLogoProps {
  width?: number
  height?: number
  className?: string
}

export function ICTLogo({ width = 200, height = 200, className = "" }: ICTLogoProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer circle */}
      <circle cx="100" cy="100" r="98" fill="black" stroke="none" />

      {/* Main yin-yang style division */}
      <path d="M 100 2 A 98 98 0 0 1 100 198 A 49 49 0 0 1 100 100 A 49 49 0 0 0 100 2 Z" fill="white" />

      {/* Small circles for yin-yang dots */}
      <circle cx="100" cy="51" r="12" fill="black" />
      <circle cx="100" cy="149" r="12" fill="white" />

      {/* Central vertical figures/symbols */}
      {/* Top figure */}
      <g transform="translate(100, 45)">
        <path d="M -8 -15 Q 0 -20 8 -15 Q 8 -5 0 0 Q -8 -5 -8 -15 Z" fill="white" />
        <circle cx="0" cy="-10" r="3" fill="black" />
        <path d="M -4 -5 L 4 -5 M -6 0 L 6 0 M -4 5 L 4 5" stroke="black" strokeWidth="1" fill="none" />
      </g>

      {/* Second figure */}
      <g transform="translate(100, 75)">
        <path d="M -8 -15 Q 0 -20 8 -15 Q 8 -5 0 0 Q -8 -5 -8 -15 Z" fill="black" />
        <circle cx="0" cy="-10" r="3" fill="white" />
        <path d="M -4 -5 L 4 -5 M -6 0 L 6 0 M -4 5 L 4 5" stroke="white" strokeWidth="1" fill="none" />
      </g>

      {/* Third figure (center) */}
      <g transform="translate(100, 100)">
        <path d="M -10 -18 Q 0 -25 10 -18 Q 10 -5 0 2 Q -10 -5 -10 -18 Z" fill="white" />
        <circle cx="0" cy="-12" r="4" fill="black" />
        <path d="M -5 -6 L 5 -6 M -7 0 L 7 0 M -5 6 L 5 6" stroke="black" strokeWidth="1.5" fill="none" />
      </g>

      {/* Fourth figure */}
      <g transform="translate(100, 125)">
        <path d="M -8 -15 Q 0 -20 8 -15 Q 8 -5 0 0 Q -8 -5 -8 -15 Z" fill="black" />
        <circle cx="0" cy="-10" r="3" fill="white" />
        <path d="M -4 -5 L 4 -5 M -6 0 L 6 0 M -4 5 L 4 5" stroke="white" strokeWidth="1" fill="none" />
      </g>

      {/* Bottom figure */}
      <g transform="translate(100, 155)">
        <path d="M -8 -15 Q 0 -20 8 -15 Q 8 -5 0 0 Q -8 -5 -8 -15 Z" fill="white" />
        <circle cx="0" cy="-10" r="3" fill="black" />
        <path d="M -4 -5 L 4 -5 M -6 0 L 6 0 M -4 5 L 4 5" stroke="black" strokeWidth="1" fill="none" />
      </g>
    </svg>
  )
}
