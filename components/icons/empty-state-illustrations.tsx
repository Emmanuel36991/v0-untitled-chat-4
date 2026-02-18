"use client"

import { cn } from "@/lib/utils"

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

/**
 * No Trades Illustration
 * A stylized trading chart with a magnifying glass searching for data.
 */
export function NoTradesIllustration({ className, ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
      {...props}
    >
      {/* Background Grid */}
      <rect x="20" y="20" width="160" height="100" rx="8" fill="currentColor" fillOpacity="0.03" />
      <path d="M20 45h160M20 70h160M20 95h160M60 20v100M100 20v100M140 20v100" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
      
      {/* Empty Chart Line (Dashed) */}
      <path d="M30 90c20-5 35-25 55-20s30 30 55 15 30-40 40-35" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Magnifying Glass */}
      <g className="animate-float" style={{ animationDuration: '4s' }}>
        <circle cx="110" cy="65" r="25" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
        <circle cx="110" cy="65" r="18" fill="var(--primary)" fillOpacity="0.05" />
        <line x1="128" y1="83" x2="150" y2="105" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
        
        {/* Sparkles inside glass */}
        <path d="M105 55l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill="var(--primary)" className="animate-pulse" />
        <circle cx="118" cy="72" r="1.5" fill="var(--primary)" opacity="0.6" />
      </g>
      
      {/* Floating Elements */}
      <rect x="40" y="130" width="40" height="8" rx="4" fill="currentColor" fillOpacity="0.1" />
      <rect x="90" y="130" width="60" height="8" rx="4" fill="currentColor" fillOpacity="0.05" />
    </svg>
  )
}

/**
 * No Portfolios Illustration
 * A safe/vault with an open door, waiting for accounts to be added.
 */
export function NoPortfoliosIllustration({ className, ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
      {...props}
    >
      {/* Vault Body */}
      <rect x="50" y="30" width="100" height="100" rx="12" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2" />
      
      {/* Vault Door (Open) */}
      <g transform="translate(100, 30) rotate(-15)">
        <rect x="0" y="0" width="60" height="100" rx="8" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
        <circle cx="30" cy="50" r="12" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 2" />
        <circle cx="30" cy="50" r="4" fill="var(--primary)" />
        <line x1="30" y1="30" x2="30" y2="38" stroke="var(--primary)" strokeWidth="2" />
        <line x1="30" y1="62" x2="30" y2="70" stroke="var(--primary)" strokeWidth="2" />
        <line x1="10" y1="50" x2="18" y2="50" stroke="var(--primary)" strokeWidth="2" />
        <line x1="42" y1="50" x2="50" y2="50" stroke="var(--primary)" strokeWidth="2" />
      </g>
      
      {/* Coins/Tokens floating out */}
      <g className="animate-float">
        <circle cx="75" cy="80" r="8" fill="var(--primary)" fillOpacity="0.1" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M75 76v8M72 80h6" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      
      <circle cx="140" cy="110" r="5" fill="var(--primary)" fillOpacity="0.2" className="animate-pulse" />
    </svg>
  )
}

/**
 * No Results Illustration
 * A file folder with a question mark, representing a failed search.
 */
export function NoResultsIllustration({ className, ...props }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-auto", className)}
      {...props}
    >
      {/* Folder Back */}
      <path d="M40 50h30l10-10h80v80H40V50z" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2" />
      
      {/* Folder Front (Open) */}
      <path d="M40 65h120v65H40V65z" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" rx="4" />
      
      {/* Question Mark Floating */}
      <g className="animate-bounce-in">
        <text
          x="100"
          y="105"
          fill="var(--primary)"
          fontSize="40"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          ?
        </text>
      </g>
      
      {/* Floating Particles */}
      <circle cx="60" cy="40" r="3" fill="var(--primary)" opacity="0.3" className="animate-float" />
      <circle cx="150" cy="55" r="2" fill="var(--primary)" opacity="0.2" />
      <rect x="160" y="90" width="10" height="2" rx="1" fill="var(--primary)" opacity="0.2" transform="rotate(45 160 90)" />
    </svg>
  )
}
