import type React from "react"
import { cn } from "@/lib/utils"

// --- Helper Components for Consistent Styling ---

const IconBase = ({ 
  children, 
  className, 
  ...props 
}: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={cn("w-full h-full", className)}
    {...props}
  >
    {children}
  </svg>
)

// Professional Ticker Badge (Bloomberg Terminal Style)
const TickerBadge = ({ 
  symbol, 
  color = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  className
}: { 
  symbol: string, 
  color?: string,
  className?: string 
}) => (
  <div className={cn(
    "flex items-center justify-center w-full h-full rounded-lg font-sans font-bold tracking-tight select-none border border-black/5 dark:border-white/5",
    color,
    className
  )}>
    {symbol}
  </div>
)

// --- 1. TRADING METHODOLOGIES (Technical Schematics) ---

export const TradingMethodologyIcons = {
  // SMC: The "Break of Structure" Schematic
  smc: (props: any) => (
    <IconBase {...props}>
      <path d="M3 17L9 11L13 15L21 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 15H21" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-50"/>
      <circle cx="21" cy="5" r="2" fill="currentColor" className="text-blue-500"/>
      <rect x="7" y="9" width="4" height="10" fill="currentColor" className="text-blue-500/10"/>
    </IconBase>
  ),

  // ICT: The "Fair Value Gap" + Time
  ict: (props: any) => (
    <IconBase {...props}>
      {/* Candles */}
      <path d="M6 7V17" stroke="currentColor" strokeWidth="1.5" className="opacity-70"/>
      <path d="M18 5V15" stroke="currentColor" strokeWidth="1.5" className="opacity-70"/>
      {/* FVG Box */}
      <rect x="8" y="8" width="8" height="4" fill="currentColor" className="text-orange-500/20"/>
      <path d="M12 2V22" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3" className="text-orange-500"/>
    </IconBase>
  ),

  // Wyckoff: The "Accumulation" Schematic
  wyckoff: (props: any) => (
    <IconBase {...props}>
      <path d="M2 12C4 12 4 17 7 17C10 17 10 7 13 7C16 7 16 20 19 20C22 20 22 2 22 2" 
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="2" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-40"/>
      <line x1="2" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-40"/>
    </IconBase>
  ),

  // Volume: Profile Histogram
  volume: (props: any) => (
    <IconBase {...props}>
      <path d="M21 21V10" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-800"/>
      <path d="M16 21V6" stroke="currentColor" strokeWidth="3" className="text-purple-500"/>
      <path d="M11 21V12" stroke="currentColor" strokeWidth="3" className="text-slate-300 dark:text-slate-700"/>
      <path d="M6 21V15" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-800"/>
    </IconBase>
  ),

  // S/R: Clean Levels
  sr: (props: any) => (
    <IconBase {...props}>
      <line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="2" className="text-red-500/70"/>
      <line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="2" className="text-emerald-500/70"/>
      <path d="M4 14L8 18L12 10L16 18L20 12" stroke="currentColor" strokeWidth="1.5" className="opacity-60"/>
    </IconBase>
  ),

  // Price Action: Clean Candlesticks
  price: (props: any) => (
    <IconBase {...props}>
      <path d="M8 4V20" stroke="currentColor" strokeWidth="1.5" className="opacity-50"/>
      <rect x="6" y="8" width="4" height="8" fill="currentColor" className="text-emerald-500"/>
      <path d="M16 4V20" stroke="currentColor" strokeWidth="1.5" className="opacity-50"/>
      <rect x="14" y="10" width="4" height="6" fill="currentColor" className="text-red-500"/>
    </IconBase>
  ),
}

// --- 2. INSTRUMENT CATEGORIES (Abstract Symbols) ---

export const InstrumentCategoryIcons = {
  // Futures: The Clock/Time Factor
  futures: (props: any) => (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3V5" stroke="currentColor" strokeWidth="1.5"/>
    </IconBase>
  ),

  // Forex: The Global Exchange
  forex: (props: any) => (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" className="opacity-20"/>
      <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" className="opacity-20"/>
      <path d="M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" stroke="currentColor" strokeWidth="1.5" className="opacity-20"/>
      <path d="M16 9L19 12L16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 15L5 12L8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </IconBase>
  ),

  // Stocks: The Trend
  stocks: (props: any) => (
    <IconBase {...props}>
      <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 15L9 9L13 13L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M21 3H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </IconBase>
  ),

  // Crypto: The Network
  crypto: (props: any) => (
    <IconBase {...props}>
      <circle cx="12" cy="5" r="2" fill="currentColor"/>
      <circle cx="5" cy="19" r="2" fill="currentColor"/>
      <circle cx="19" cy="19" r="2" fill="currentColor"/>
      <line x1="12" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="12" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="5" y1="19" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5"/>
    </IconBase>
  ),

  // Commodities: The Physical Resource
  commodities: (props: any) => (
    <IconBase {...props}>
       <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
       <path d="M12 3V21" stroke="currentColor" strokeWidth="1.5" className="opacity-50"/>
       <path d="M4 7L20 7" stroke="currentColor" strokeWidth="1.5" className="opacity-50"/>
       <path d="M4 17L20 17" stroke="currentColor" strokeWidth="1.5" className="opacity-50"/>
    </IconBase>
  ),

  // Options: The Greeks/Delta
  options: (props: any) => (
    <IconBase {...props}>
      <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 21C9 21 12 3 21 3" stroke="currentColor" strokeWidth="1.5"/>
    </IconBase>
  ),
}

// --- 3. SPECIFIC INSTRUMENTS (Monograms) ---

// This maps specific symbols to their "Badge" look
export const SpecificInstrumentIcons: Record<string, (props: any) => JSX.Element> = {
  // Indices
  ES: (props) => (
    <div {...props}>
      <TickerBadge symbol="ES" color="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" />
    </div>
  ),
  NQ: (props) => (
    <div {...props}>
      <TickerBadge symbol="NQ" color="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300" />
    </div>
  ),
  RTY: (props) => (
    <div {...props}>
      <TickerBadge symbol="RTY" color="bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300" />
    </div>
  ),
  YM: (props) => (
    <div {...props}>
      <TickerBadge symbol="YM" color="bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300" />
    </div>
  ),

  // Commodities
  GC: (props) => (
    <div {...props}>
      <TickerBadge symbol="GC" color="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" />
    </div>
  ),
  CL: (props) => (
    <div {...props}>
      <TickerBadge symbol="CL" color="bg-zinc-100 text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-300" />
    </div>
  ),
  SI: (props) => (
    <div {...props}>
      <TickerBadge symbol="SI" color="bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300" />
    </div>
  ),

  // Crypto
  BTCUSD: (props) => (
    <div {...props}>
      <TickerBadge symbol="BTC" color="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300" />
    </div>
  ),
  ETHUSD: (props) => (
    <div {...props}>
      <TickerBadge symbol="ETH" color="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" />
    </div>
  ),

  // Forex
  EURUSD: (props) => (
    <div {...props}>
      <TickerBadge symbol="EU" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" />
    </div>
  ),
  GBPUSD: (props) => (
    <div {...props}>
      <TickerBadge symbol="GU" color="bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300" />
    </div>
  ),
  USDJPY: (props) => (
    <div {...props}>
      <TickerBadge symbol="UJ" color="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" />
    </div>
  ),
}

// --- 4. SELECTOR COMPONENT ---

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
      // Check if we have a specific monogram defined
      const SpecificIcon = SpecificInstrumentIcons[name] || SpecificInstrumentIcons[name.toUpperCase()]
      
      if (SpecificIcon) {
        return <SpecificIcon {...iconProps} />
      }

      // Fallback: Generate a generic monogram on the fly
      const shortName = name.slice(0, 3).toUpperCase()
      return (
        <div className={className}>
          <TickerBadge symbol={shortName} />
        </div>
      )

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
