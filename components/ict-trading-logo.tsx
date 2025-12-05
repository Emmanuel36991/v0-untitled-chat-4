interface ICTTradingLogoProps {
  size?: number
  className?: string
}

export function ICTTradingLogo({ size = 200, className = "" }: ICTTradingLogoProps) {
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#FFA500", stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#1a1a1a", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#000000", stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Outer circle */}
        <circle cx="100" cy="100" r="98" fill="url(#darkGradient)" stroke="url(#goldGradient)" strokeWidth="2" />

        {/* Main yin-yang inspired design */}
        <g transform="translate(100,100)">
          {/* Left half (dark) */}
          <path d="M 0,-80 A 80,80 0 0,1 0,80 A 40,40 0 0,1 0,0 A 40,40 0 0,0 0,-80 Z" fill="url(#darkGradient)" />

          {/* Right half (gold) */}
          <path d="M 0,-80 A 80,80 0 0,0 0,80 A 40,40 0 0,0 0,0 A 40,40 0 0,1 0,-80 Z" fill="url(#goldGradient)" />

          {/* Small circles */}
          <circle cx="0" cy="-40" r="12" fill="url(#goldGradient)" />
          <circle cx="0" cy="40" r="12" fill="url(#darkGradient)" />

          {/* Trading chart elements */}
          {/* Candlestick pattern in top circle */}
          <g transform="translate(0,-40)">
            <rect x="-2" y="-8" width="4" height="6" fill="#000" opacity="0.8" />
            <line x1="0" y1="-10" x2="0" y2="-8" stroke="#000" strokeWidth="1" opacity="0.8" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#000" strokeWidth="1" opacity="0.8" />
            <rect x="-2" y="-2" width="4" height="4" fill="none" stroke="#000" strokeWidth="1" opacity="0.8" />
          </g>

          {/* Trend line in bottom circle */}
          <g transform="translate(0,40)">
            <polyline
              points="-6,-3 -2,1 2,-2 6,2"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="2"
              opacity="0.9"
            />
            <circle cx="-6" cy="-3" r="1" fill="url(#goldGradient)" opacity="0.9" />
            <circle cx="6" cy="2" r="1" fill="url(#goldGradient)" opacity="0.9" />
          </g>
        </g>

        {/* ICT text curved along top */}
        <defs>
          <path id="topCurve" d="M 40,100 A 60,60 0 0,1 160,100" />
        </defs>
        <text
          fontFamily="Arial, sans-serif"
          fontSize="16"
          fontWeight="bold"
          fill="url(#goldGradient)"
          textAnchor="middle"
        >
          <textPath href="#topCurve" startOffset="50%">
            ICT TRADING
          </textPath>
        </text>

        {/* Strategy text curved along bottom */}
        <defs>
          <path id="bottomCurve" d="M 160,100 A 60,60 0 0,1 40,100" />
        </defs>
        <text
          fontFamily="Arial, sans-serif"
          fontSize="14"
          fontWeight="normal"
          fill="url(#goldGradient)"
          textAnchor="middle"
        >
          <textPath href="#bottomCurve" startOffset="50%">
            STRATEGY
          </textPath>
        </text>
      </svg>
    </div>
  )
}
