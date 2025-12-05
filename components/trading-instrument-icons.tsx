import type React from "react"

export const TradingMethodologyIcons = {
  // Smart Money Concepts - Institutional flow visualization
  smc: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="smc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      {/* Institutional building with flow arrows */}
      <rect x="8" y="12" width="16" height="16" rx="2" fill="url(#smc-gradient)" opacity="0.2" />
      <rect x="8" y="12" width="16" height="16" rx="2" stroke="url(#smc-gradient)" strokeWidth="2" fill="none" />
      <rect x="10" y="14" width="2" height="3" fill="url(#smc-gradient)" />
      <rect x="13" y="14" width="2" height="3" fill="url(#smc-gradient)" />
      <rect x="16" y="14" width="2" height="3" fill="url(#smc-gradient)" />
      <rect x="19" y="14" width="2" height="3" fill="url(#smc-gradient)" />
      {/* Liquidity flow arrows */}
      <path
        d="M4 8L8 12L4 16"
        stroke="url(#smc-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 8L24 12L28 16"
        stroke="url(#smc-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="6" r="2" fill="url(#smc-gradient)" />
    </svg>
  ),

  // ICT - Target with precision zones
  ict: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="ict-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      {/* Precision target circles */}
      <circle cx="16" cy="16" r="12" stroke="url(#ict-gradient)" strokeWidth="2" fill="none" />
      <circle cx="16" cy="16" r="8" stroke="url(#ict-gradient)" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="16" r="4" stroke="url(#ict-gradient)" strokeWidth="1" fill="none" />
      <circle cx="16" cy="16" r="2" fill="url(#ict-gradient)" />
      {/* Kill zone markers */}
      <rect x="15" y="2" width="2" height="4" fill="url(#ict-gradient)" />
      <rect x="15" y="26" width="2" height="4" fill="url(#ict-gradient)" />
      <rect x="2" y="15" width="4" height="2" fill="url(#ict-gradient)" />
      <rect x="26" y="15" width="4" height="2" fill="url(#ict-gradient)" />
    </svg>
  ),

  // Wyckoff - Price-Volume relationship
  wyckoff: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="wyckoff-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Price line with volume bars */}
      <path
        d="M4 24L8 20L12 22L16 16L20 18L24 12L28 14"
        stroke="url(#wyckoff-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Volume bars */}
      <rect x="6" y="26" width="2" height="4" fill="url(#wyckoff-gradient)" opacity="0.6" />
      <rect x="10" y="24" width="2" height="6" fill="url(#wyckoff-gradient)" opacity="0.6" />
      <rect x="14" y="22" width="2" height="8" fill="url(#wyckoff-gradient)" opacity="0.6" />
      <rect x="18" y="20" width="2" height="10" fill="url(#wyckoff-gradient)" opacity="0.6" />
      <rect x="22" y="25" width="2" height="5" fill="url(#wyckoff-gradient)" opacity="0.6" />
      <rect x="26" y="23" width="2" height="7" fill="url(#wyckoff-gradient)" opacity="0.6" />
    </svg>
  ),

  // Volume Profile - Volume distribution
  volume: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="volume-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      {/* Volume profile bars */}
      <rect x="4" y="6" width="8" height="2" fill="url(#volume-gradient)" opacity="0.4" />
      <rect x="4" y="9" width="12" height="2" fill="url(#volume-gradient)" opacity="0.6" />
      <rect x="4" y="12" width="20" height="2" fill="url(#volume-gradient)" />
      <rect x="4" y="15" width="24" height="2" fill="url(#volume-gradient)" />
      <rect x="4" y="18" width="16" height="2" fill="url(#volume-gradient)" opacity="0.8" />
      <rect x="4" y="21" width="10" height="2" fill="url(#volume-gradient)" opacity="0.5" />
      <rect x="4" y="24" width="6" height="2" fill="url(#volume-gradient)" opacity="0.3" />
      {/* POC line */}
      <line x1="28" y1="15" x2="28" y2="17" stroke="url(#volume-gradient)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),

  // Support & Resistance - Horizontal levels
  sr: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="sr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Price action with S&R levels */}
      <path
        d="M4 20L8 16L12 18L16 12L20 14L24 8L28 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Resistance level */}
      <line x1="4" y1="8" x2="28" y2="8" stroke="url(#sr-gradient)" strokeWidth="2" strokeDasharray="4 2" />
      <text x="30" y="10" fontSize="8" fill="url(#sr-gradient)">
        R
      </text>
      {/* Support level */}
      <line x1="4" y1="22" x2="28" y2="22" stroke="url(#sr-gradient)" strokeWidth="2" strokeDasharray="4 2" />
      <text x="30" y="24" fontSize="8" fill="url(#sr-gradient)">
        S
      </text>
    </svg>
  ),

  // Pure Price Action - Clean candlesticks
  price: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="price-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      {/* Candlestick pattern */}
      <line x1="6" y1="8" x2="6" y2="24" stroke="currentColor" strokeWidth="1" />
      <rect x="4" y="12" width="4" height="8" fill="#10B981" />

      <line x1="12" y1="6" x2="12" y2="26" stroke="currentColor" strokeWidth="1" />
      <rect x="10" y="10" width="4" height="6" fill="url(#price-gradient)" />

      <line x1="18" y1="4" x2="18" y2="20" stroke="currentColor" strokeWidth="1" />
      <rect x="16" y="8" width="4" height="8" fill="#10B981" />

      <line x1="24" y1="10" x2="24" y2="28" stroke="currentColor" strokeWidth="1" />
      <rect x="22" y="14" width="4" height="10" fill="url(#price-gradient)" />
    </svg>
  ),
}

export const InstrumentCategoryIcons = {
  // Futures - Contract document with chart
  futures: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="futures-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <rect x="6" y="4" width="20" height="24" rx="2" stroke="url(#futures-gradient)" strokeWidth="2" fill="none" />
      <rect x="6" y="4" width="20" height="24" rx="2" fill="url(#futures-gradient)" opacity="0.1" />
      {/* Contract lines */}
      <line x1="10" y1="8" x2="22" y2="8" stroke="url(#futures-gradient)" strokeWidth="1" />
      <line x1="10" y1="11" x2="18" y2="11" stroke="url(#futures-gradient)" strokeWidth="1" />
      {/* Mini chart */}
      <path
        d="M10 16L13 14L16 18L19 15L22 13"
        stroke="url(#futures-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Expiry indicator */}
      <circle cx="20" cy="24" r="2" fill="url(#futures-gradient)" />
      <text x="19" y="25" fontSize="6" fill="white">
        F
      </text>
    </svg>
  ),

  // Forex - Currency exchange arrows
  forex: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="forex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Currency symbols */}
      <circle cx="10" cy="12" r="6" stroke="url(#forex-gradient)" strokeWidth="2" fill="none" />
      <text x="8" y="15" fontSize="8" fill="url(#forex-gradient)" fontWeight="bold">
        $
      </text>

      <circle cx="22" cy="20" r="6" stroke="url(#forex-gradient)" strokeWidth="2" fill="none" />
      <text x="20" y="23" fontSize="8" fill="url(#forex-gradient)" fontWeight="bold">
        €
      </text>

      {/* Exchange arrows */}
      <path d="M14 10L18 14" stroke="url(#forex-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16 12L18 14L16 16"
        stroke="url(#forex-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path d="M18 18L14 22" stroke="url(#forex-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16 20L14 22L16 24"
        stroke="url(#forex-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // Stocks - Rising bar chart
  stocks: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="stocks-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      {/* Stock chart bars */}
      <rect x="4" y="20" width="3" height="8" fill="url(#stocks-gradient)" />
      <rect x="8" y="16" width="3" height="12" fill="url(#stocks-gradient)" />
      <rect x="12" y="12" width="3" height="16" fill="url(#stocks-gradient)" />
      <rect x="16" y="8" width="3" height="20" fill="url(#stocks-gradient)" />
      <rect x="20" y="6" width="3" height="22" fill="url(#stocks-gradient)" />
      <rect x="24" y="4" width="3" height="24" fill="url(#stocks-gradient)" />
      {/* Trend arrow */}
      <path d="M6 22L26 6" stroke="url(#stocks-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M22 4L26 6L24 10"
        stroke="url(#stocks-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // Crypto - Blockchain blocks
  crypto: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="crypto-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      {/* Blockchain blocks */}
      <rect x="4" y="12" width="6" height="6" rx="1" fill="url(#crypto-gradient)" />
      <rect x="13" y="12" width="6" height="6" rx="1" fill="url(#crypto-gradient)" />
      <rect x="22" y="12" width="6" height="6" rx="1" fill="url(#crypto-gradient)" />

      {/* Connection lines */}
      <line x1="10" y1="15" x2="13" y2="15" stroke="url(#crypto-gradient)" strokeWidth="2" />
      <line x1="19" y1="15" x2="22" y2="15" stroke="url(#crypto-gradient)" strokeWidth="2" />

      {/* Bitcoin symbol */}
      <circle cx="16" cy="6" r="4" stroke="url(#crypto-gradient)" strokeWidth="2" fill="none" />
      <text x="14" y="8" fontSize="6" fill="url(#crypto-gradient)" fontWeight="bold">
        ₿
      </text>

      {/* Digital waves */}
      <path
        d="M4 24L8 22L12 24L16 22L20 24L24 22L28 24"
        stroke="url(#crypto-gradient)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  ),

  // Commodities - Gold bars and oil barrel
  commodities: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="commodities-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Gold bars */}
      <rect x="4" y="16" width="8" height="4" rx="1" fill="url(#commodities-gradient)" />
      <rect x="6" y="12" width="8" height="4" rx="1" fill="url(#commodities-gradient)" />
      <rect x="8" y="8" width="8" height="4" rx="1" fill="url(#commodities-gradient)" />

      {/* Oil barrel */}
      <ellipse cx="22" cy="20" rx="4" ry="6" fill="url(#commodities-gradient)" opacity="0.8" />
      <ellipse cx="22" cy="14" rx="4" ry="1" fill="url(#commodities-gradient)" />
      <ellipse cx="22" cy="26" rx="4" ry="1" fill="url(#commodities-gradient)" />
      <line x1="18" y1="18" x2="26" y2="18" stroke="url(#commodities-gradient)" strokeWidth="1" />
      <line x1="18" y1="22" x2="26" y2="22" stroke="url(#commodities-gradient)" strokeWidth="1" />
    </svg>
  ),

  // Options - Curved payoff diagram
  options: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="options-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      {/* Axes */}
      <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="1" />
      <line x1="4" y1="28" x2="4" y2="4" stroke="currentColor" strokeWidth="1" />

      {/* Option payoff curve */}
      <path
        d="M4 28L12 28L16 20L20 12L24 8L28 6"
        stroke="url(#options-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Strike price line */}
      <line x1="16" y1="4" x2="16" y2="28" stroke="url(#options-gradient)" strokeWidth="1" strokeDasharray="2 2" />

      {/* Greeks indicators */}
      <circle cx="20" cy="12" r="2" fill="url(#options-gradient)" opacity="0.6" />
      <circle cx="24" cy="8" r="1.5" fill="url(#options-gradient)" opacity="0.8" />
    </svg>
  ),
}

export const SpecificInstrumentIcons = {
  // Index Futures
  ES: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="es-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="url(#es-gradient)" strokeWidth="2" fill="none" />
      <text x="12" y="13" fontSize="8" fill="url(#es-gradient)" textAnchor="middle" fontWeight="bold">
        S&P
      </text>
      <path
        d="M4 16L8 12L12 14L16 10L20 12"
        stroke="url(#es-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  NQ: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="nq-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="url(#nq-gradient)" strokeWidth="2" fill="none" />
      <text x="12" y="13" fontSize="7" fill="url(#nq-gradient)" textAnchor="middle" fontWeight="bold">
        NASDAQ
      </text>
      <path
        d="M4 14L6 10L8 12L10 8L12 10L14 6L16 8L18 4L20 6"
        stroke="url(#nq-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // Forex Pairs
  EURUSD: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="eurusd-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="8" cy="12" r="6" stroke="url(#eurusd-gradient)" strokeWidth="2" fill="none" />
      <text x="6.5" y="14" fontSize="8" fill="url(#eurusd-gradient)" fontWeight="bold">
        €
      </text>
      <circle cx="16" cy="12" r="6" stroke="url(#eurusd-gradient)" strokeWidth="2" fill="none" />
      <text x="14.5" y="14" fontSize="8" fill="url(#eurusd-gradient)" fontWeight="bold">
        $
      </text>
      <path
        d="M12 8L14 12L12 16"
        stroke="url(#eurusd-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  GBPUSD: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="gbpusd-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <circle cx="8" cy="12" r="6" stroke="url(#gbpusd-gradient)" strokeWidth="2" fill="none" />
      <text x="6.5" y="14" fontSize="8" fill="url(#gbpusd-gradient)" fontWeight="bold">
        £
      </text>
      <circle cx="16" cy="12" r="6" stroke="url(#gbpusd-gradient)" strokeWidth="2" fill="none" />
      <text x="14.5" y="14" fontSize="8" fill="url(#gbpusd-gradient)" fontWeight="bold">
        $
      </text>
      <path
        d="M12 8L14 12L12 16"
        stroke="url(#gbpusd-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // Crypto
  BTCUSD: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="btc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7931A" />
          <stop offset="100%" stopColor="#E8831A" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#btc-gradient)" />
      <text x="12" y="16" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">
        ₿
      </text>
      <path d="M4 4L20 20M20 4L4 20" stroke="url(#btc-gradient)" strokeWidth="1" opacity="0.3" />
    </svg>
  ),

  ETHUSD: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="eth-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#627EEA" />
          <stop offset="100%" stopColor="#4F6BD5" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#eth-gradient)" />
      <path d="M12 4L8 12L12 14L16 12L12 4Z" fill="white" />
      <path d="M8 13L12 20L16 13L12 15L8 13Z" fill="white" opacity="0.8" />
    </svg>
  ),

  // Individual Stocks
  AAPL: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="aapl-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#007AFF" />
          <stop offset="100%" stopColor="#0056CC" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C8 2 6 5 8 8C6 8 4 10 4 13C4 18 8 22 12 22C16 22 20 18 20 13C20 10 18 8 16 8C18 5 16 2 12 2Z"
        fill="url(#aapl-gradient)"
      />
      <path d="M14 6C15 4 16 3 17 4" stroke="url(#aapl-gradient)" strokeWidth="1" fill="none" />
    </svg>
  ),

  TSLA: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="tsla-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E31E24" />
          <stop offset="100%" stopColor="#CC1B1F" />
        </linearGradient>
      </defs>
      <rect x="4" y="10" width="16" height="8" rx="4" fill="url(#tsla-gradient)" />
      <circle cx="7" cy="16" r="2" stroke="url(#tsla-gradient)" strokeWidth="2" fill="white" />
      <circle cx="17" cy="16" r="2" stroke="url(#tsla-gradient)" strokeWidth="2" fill="white" />
      <path
        d="M8 10L12 6L16 10"
        stroke="url(#tsla-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1" fill="white" />
    </svg>
  ),

  // Commodities
  GC: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="12" height="6" rx="1" fill="url(#gold-gradient)" />
      <rect x="8" y="6" width="8" height="4" rx="1" fill="url(#gold-gradient)" />
      <rect x="10" y="4" width="4" height="4" rx="1" fill="url(#gold-gradient)" />
      <text x="12" y="12" fontSize="6" fill="#8B4513" textAnchor="middle" fontWeight="bold">
        Au
      </text>
      <circle cx="12" cy="18" r="3" stroke="url(#gold-gradient)" strokeWidth="2" fill="none" />
    </svg>
  ),

  CL: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="oil-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D3748" />
          <stop offset="100%" stopColor="#1A202C" />
        </linearGradient>
      </defs>
      <ellipse cx="12" cy="14" rx="6" ry="8" fill="url(#oil-gradient)" />
      <ellipse cx="12" cy="6" rx="6" ry="1" fill="url(#oil-gradient)" />
      <ellipse cx="12" cy="22" rx="6" ry="1" fill="url(#oil-gradient)" />
      <line x1="6" y1="10" x2="18" y2="10" stroke="#4A5568" strokeWidth="1" />
      <line x1="6" y1="14" x2="18" y2="14" stroke="#4A5568" strokeWidth="1" />
      <line x1="6" y1="18" x2="18" y2="18" stroke="#4A5568" strokeWidth="1" />
      <text x="12" y="15" fontSize="6" fill="white" textAnchor="middle" fontWeight="bold">
        OIL
      </text>
    </svg>
  ),
}

// Selector component for dynamic icon rendering
export interface InstrumentIconSelectorProps {
  type: "methodology" | "category" | "specific"
  name: string
  className?: string
}

export const InstrumentIconSelector: React.FC<InstrumentIconSelectorProps> = ({ type, name, className }) => {
  const iconProps = { className }

  switch (type) {
    case "methodology":
      const MethodologyIcon = TradingMethodologyIcons[name as keyof typeof TradingMethodologyIcons]
      return MethodologyIcon ? <MethodologyIcon {...iconProps} /> : null

    case "category":
      const CategoryIcon = InstrumentCategoryIcons[name as keyof typeof InstrumentCategoryIcons]
      return CategoryIcon ? <CategoryIcon {...iconProps} /> : null

    case "specific":
      const SpecificIcon = SpecificInstrumentIcons[name as keyof typeof SpecificInstrumentIcons]
      return SpecificIcon ? <SpecificIcon {...iconProps} /> : null

    default:
      return null
  }
}

export default {
  TradingMethodologyIcons,
  InstrumentCategoryIcons,
  SpecificInstrumentIcons,
  InstrumentIconSelector,
}
