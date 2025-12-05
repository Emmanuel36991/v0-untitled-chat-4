"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUserConfig } from "@/hooks/use-user-config"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import { INSTRUMENT_MAPPINGS, type TradingPreferences } from "@/types/user-config"
import {
  CheckCircle2,
  Brain,
  TrendingUp,
  BarChart3,
  Settings,
  Shield,
  Bell,
  UserIcon,
  Eye,
  ChevronRight,
  ChevronLeft,
  Search,
  LayoutGrid,
  List,
  Check,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { ConcentradeLogo } from "@/components/concentrade-logo"
import { LoadingScreen } from "@/components/loading-screen" // Import LoadingScreen
import { createClient } from "@/lib/supabase/client"

// Import existing setup steps
import { LegalPrivacyStep } from "@/components/profile-setup/legal-privacy-step"
import { NotificationsStep } from "@/components/profile-setup/notifications-step"
import { ProfileInfoStep } from "@/components/profile-setup/profile-info-step"
import { ReviewConfirmationStep } from "@/components/profile-setup/review-confirmation-step"
import { InstrumentVisibilityStep } from "@/components/profile-setup/instrument-visibility-step"

import {
  ESFuturesIcon,
  MESFuturesIcon,
  NQFuturesIcon,
  MNQFuturesIcon,
  RTYFuturesIcon,
  M2KFuturesIcon,
  YMFuturesIcon,
  MYMFuturesIcon,
  CLFuturesIcon,
  MCLFuturesIcon,
  NGFuturesIcon,
  GCFuturesIcon,
  MGCFuturesIcon,
  SIFuturesIcon,
  EURUSDIcon,
  GBPUSDIcon,
  USDJPYIcon,
  AAPLIcon,
  MSFTIcon,
  GOOGLIcon,
  AMZNIcon,
  NVDAIcon,
  TSLAIcon,
  JPMIcon,
  BACIcon,
  BTCUSDIcon,
  ETHUSDIcon,
  ADAUSDIcon,
  SOLUSDIcon,
  GOLDIcon,
  SILVERIcon,
  SPYIcon,
  QQQIcon,
} from "@/components/updated-trading-icons"

// ... [KEEP YOUR EXISTING ProfessionalIcons and CONFIG CONSTANTS HERE - NO CHANGES] ...

const ProfessionalIcons = {
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 170 180" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M0 0 C56.1 0 112.2 0 170 0 C170 59.4 170 118.8 170 180 C113.9 180 57.8 180 0 180 C0 120.6 0 61.2 0 0 Z "
        fill="currentColor"
        className="text-foreground dark:text-white"
        opacity="0.05"
        transform="translate(0,0)"
      />
      <path
        d="M0 0 C56.1 0 112.2 0 170 0 C170 21.12 170 42.24 170 64 C167.66 61.66 167.09 59.84 165.93 56.75 C156.58 33.9 139.28 18.81 117 9 C111.68 6.73 111.68 6.73 106 6 C106.67 6.32 107.35 6.65 108.05 6.99 C122.92 14.59 132.47 25.32 138.06 41.03 C139.13 44.41 139.8 47.45 140 51 C140.06 51.75 140.12 52.51 140.18 53.3 C140.87 67.83 135.85 82.01 126.75 93.25 C118.93 101.66 106.82 109.62 95.06 110.12 C94.38 110.08 93.7 110.04 93 110 C93.74 109.42 94.48 108.84 95.25 108.25 C100.51 103.93 104.44 100.28 105.35 93.22 C105.67 86.15 104.75 81.34 100 76 C97.37 73.56 97.37 73.56 95 72 C95.5 69.75 95.5 69.75 97 67 C98.93 65.79 100.91 64.89 102.98 63.94 C110.62 60.37 114.3 53.15 117.37 45.62 C119.16 35.24 118.46 25.62 112.45 16.71 C108.63 12.03 104.29 8.85 99 6 C99.59 6.7 100.19 7.4 100.81 8.12 C106.00 14.94 106.99 20.53 106 29 C104.27 34.92 101.05 38.59 96 42 C93.12 42.81 93.12 42.81 91 43 C91.16 42.4 91.33 41.81 91.5 41.2 C93.14 34.96 93.14 34.96 91 29 C91 29.99 91 30.98 91 32 C90.37 33.68 89.71 35.35 89 37 C87.51 36.01 87.51 36.01 86 35 C86 33.68 86 32.36 86 31 C85.34 31 84.68 31 84 31 C84.18 31.61 84.37 32.23 84.56 32.87 C85 35 85 35 84 37 C83.34 37 82.68 37 82 37 C81.01 34.03 81.01 34.03 80 31 C78.61 33.77 78.81 35.91 79 39 C79.89 41.3 79.89 41.3 81 43 C75.13 42.19 71.87 39.33 68 35 C64.86 29.88 63.94 23.87 65 18 C67.34 11.86 70.71 7.8 76 4 C58.35 5.19 40.97 13.05 28 25 C27.09 25.79 26.19 26.59 25.26 27.42 C14.54 37.42 8.27 49.24 3.19 62.85 C2 66 2 66 0 70 C0 46.9 0 23.8 0 0 Z"
        fill="currentColor"
        transform="translate(72,4)"
      />
      <path
        d="M0 0 C5.84 0.5 10.49 1.69 15.81 4.12 C16.5 4.43 17.2 4.75 17.92 5.07 C39.73 15.17 54.99 31.87 64 54 C64.34 54.78 64.69 55.56 65.05 56.36 C66.03 59.08 66.27 61.11 66.32 63.99 C66.34 64.96 66.36 65.93 66.38 66.93 C66.38 67.97 66.39 69.01 66.4 70.08 C66.41 71.16 66.42 72.25 66.44 73.37 C66.45 75.67 66.47 77.98 66.48 80.28 C66.49 83.76 66.56 87.23 66.62 90.7 C66.84 113.45 60.7 129.64 44.73 146.21 C43.38 147.59 43.38 147.59 42 149 C41.29 149.73 40.58 150.46 39.85 151.21 C28.98 161.69 15.32 167.11 1 171 C0.01 171.33 -0.98 171.66 -2 172 C-4.33 172.03 -6.66 172.04 -9 172 C-6.59 170.39 -4.32 169.16 -1.75 167.87 C5.63 163.75 10.5 157.81 13.33 149.83 C15.55 140.31 14.69 130.6 10 122 C5.4 115.22 -0.19 110.63 -8 108 C-9.32 108 -10.64 108 -12 108 C-11.67 107.01 -11.34 106.02 -11 105 C-8.62 104.22 -8.62 104.22 -5.56 103.62 C7.96 100.5 18.96 93.15 26.53 81.42 C27.02 80.62 27.5 79.82 28 79 C28.39 78.36 28.79 77.73 29.21 77.07 C34.43 67.89 35.83 56.39 35 46 C34.89 44.69 34.89 44.69 34.78 43.36 C33.14 30.83 26.38 19.32 17 11 C11.66 7.08 6.00 3.76 0 1 C0 0.67 0 0.34 0 0 Z"
        fill="currentColor"
        transform="translate(104,5)"
      />
    </svg>
  ),
  methodology: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="8" r="4" fill="hsl(var(--chart-1))" />
      <path
        d="M16 12c-6 0-10 4-10 8v8c0 1 1 2 2 2h16c1 0 2-1 2-2v-8c0-4-4-8-10-8z"
        fill="hsl(var(--chart-1))"
        opacity="0.8"
      />
      <path d="M12 18h8M12 22h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="8" r="2" fill="white" opacity="0.9" />
    </svg>
  ),
  markets: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 4v24h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M8 20L14 14L18 18L26 10"
        stroke="hsl(var(--chart-2))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  instruments: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M22 2L26 6L22 10"
        stroke="hsl(var(--chart-3))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  preferences: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M25.6 20a2 2 0 0 0 .4 2.2l.1.1a2.4 2.4 0 0 1 0 3.4 2.4 2.4 0 0 1-3.4 0l-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V28a2.4 2.4 0 0 1-2.4 2.4 2.4 2.4 0 0 1-2.4-2.4v-.1a2 2 0 0 0-1.2-1.8 2 2 0 0 0-2.2.4l-.1.1a2.4 2.4 0 0 1-3.4 0 2.4 2.4 0 0 1 0-3.4l.1-.1a2 2 0 0 0 .4-2.2V12a2 2 0 0 0 1.2 1.8H4a2.4 2.4 0 0 1-2.4-2.4A2.4 2.4 0 0 1 4 16h.1a2 2 0 0 0 1.8-1.2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  ),
  final: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M29 14.08V16a13 13 0 1 1-7.7-11.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 5L16 18.01l-4-4"
        stroke="hsl(var(--chart-5))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

const enhancedMethodologyOptions = [
  {
    id: "smc",
    label: "Smart Money Concepts",
    description: "Institutional order flow, market structure, and liquidity analysis for professional trading.",
    icon: <ESFuturesIcon className="w-8 h-8" />,
    color: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20",
    accent: "border-blue-500/50",
    bg: "bg-blue-500/5",
  },
  {
    id: "ict",
    label: "ICT Methodology",
    description: "Advanced Inner Circle Trader concepts including kill zones and market maker models.",
    icon: <NQFuturesIcon className="w-8 h-8" />,
    color: "from-orange-500 to-orange-600",
    shadow: "shadow-orange-500/20",
    accent: "border-orange-500/50",
    bg: "bg-orange-500/5",
  },
  {
    id: "wyckoff",
    label: "Wyckoff Method",
    description: "Comprehensive price-volume analysis and market phase identification.",
    icon: <RTYFuturesIcon className="w-8 h-8" />,
    color: "from-green-500 to-green-600",
    shadow: "shadow-green-500/20",
    accent: "border-green-500/50",
    bg: "bg-green-500/5",
  },
  {
    id: "volume",
    label: "Volume Profile Analysis",
    description: "Advanced volume analysis including clusters, flow, and institutional footprints.",
    icon: <GCFuturesIcon className="w-8 h-8" />,
    color: "from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/20",
    accent: "border-purple-500/50",
    bg: "bg-purple-500/5",
  },
  {
    id: "sr",
    label: "Support & Resistance",
    description: "Dynamic S&R levels, supply/demand zones, and institutional key levels.",
    icon: <YMFuturesIcon className="w-8 h-8" />,
    color: "from-amber-500 to-amber-600",
    shadow: "shadow-amber-500/20",
    accent: "border-amber-500/50",
    bg: "bg-amber-500/5",
  },
  {
    id: "price",
    label: "Pure Price Action",
    description: "Clean chart analysis focusing on candlestick patterns and market structure.",
    icon: <CLFuturesIcon className="w-8 h-8" />,
    color: "from-red-500 to-red-600",
    shadow: "shadow-red-500/20",
    accent: "border-red-500/50",
    bg: "bg-red-500/5",
  },
]

const premiumInstrumentCategories = [
  {
    id: "stocks",
    label: "Equities & ETFs",
    description: "Individual stocks, ETFs, and equity derivatives",
    icon: <AAPLIcon className="w-10 h-10" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "crypto",
    label: "Digital Assets",
    description: "Cryptocurrencies, DeFi tokens, and blockchain assets",
    icon: <BTCUSDIcon className="w-10 h-10" />,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "forex",
    label: "Foreign Exchange",
    description: "Major, minor, and exotic currency pairs",
    icon: <EURUSDIcon className="w-10 h-10" />,
    color: "from-green-500 to-green-600",
  },
  {
    id: "futures",
    label: "Futures Contracts",
    description: "Index futures, commodities, and energy contracts",
    icon: <ESFuturesIcon className="w-10 h-10" />,
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "commodities",
    label: "Commodities",
    description: "Precious metals, energy, and agricultural products",
    icon: <GOLDIcon className="w-10 h-10" />,
    color: "from-red-500 to-red-600",
  },
  {
    id: "options",
    label: "Options & Derivatives",
    description: "Options contracts and complex derivatives",
    icon: <SPYIcon className="w-10 h-10" />,
    color: "from-indigo-500 to-indigo-600",
  },
]

const TOTAL_STEPS = 9

const stepConfig = [
  {
    id: 1,
    title: "Methodology",
    subtitle: "Define Your Edge",
    description: "Select the foundational strategies that drive your trading decisions.",
    icon: Brain,
    iconComponent: <ProfessionalIcons.methodology className="w-6 h-6 text-white" />,
    color: "bg-blue-500",
    gradient: "from-blue-500 to-cyan-500",
    ring: "ring-blue-500/20",
  },
  {
    id: 2,
    title: "Markets",
    subtitle: "Select Environments",
    description: "Which financial landscapes do you navigate?",
    icon: BarChart3,
    iconComponent: <ProfessionalIcons.markets className="w-6 h-6 text-white" />,
    color: "bg-purple-500",
    gradient: "from-purple-500 to-pink-500",
    ring: "ring-purple-500/20",
  },
  {
    id: 3,
    title: "Instruments",
    subtitle: "Refine Selection",
    description: "Pinpoint the specific assets you trade most frequently.",
    icon: TrendingUp,
    iconComponent: <ProfessionalIcons.instruments className="w-6 h-6 text-white" />,
    color: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-500/20",
  },
  {
    id: 4,
    title: "Identity",
    subtitle: "Trader Profile",
    description: "Establish your professional trading identity.",
    icon: UserIcon,
    iconComponent: <ProfessionalIcons.preferences className="w-6 h-6 text-white" />,
    color: "bg-cyan-500",
    gradient: "from-cyan-500 to-blue-500",
    ring: "ring-cyan-500/20",
  },
  {
    id: 5,
    title: "Watchlist",
    subtitle: "Active Visibility",
    description: "Control what appears in your rapid-entry terminals.",
    icon: Eye,
    iconComponent: <ProfessionalIcons.instruments className="w-6 h-6 text-white" />,
    color: "bg-indigo-500",
    gradient: "from-indigo-500 to-violet-500",
    ring: "ring-indigo-500/20",
  },
  {
    id: 6,
    title: "Alerts",
    subtitle: "Notifications",
    description: "Configure how the system communicates with you.",
    icon: Bell,
    iconComponent: <ProfessionalIcons.preferences className="w-6 h-6 text-white" />,
    color: "bg-yellow-500",
    gradient: "from-yellow-500 to-amber-500",
    ring: "ring-yellow-500/20",
  },
  {
    id: 7,
    title: "Legal",
    subtitle: "Compliance",
    description: "Review terms of service and privacy protocols.",
    icon: Shield,
    iconComponent: <ProfessionalIcons.preferences className="w-6 h-6 text-white" />,
    color: "bg-slate-500",
    gradient: "from-slate-500 to-gray-500",
    ring: "ring-slate-500/20",
  },
  {
    id: 8,
    title: "Review",
    subtitle: "Confirmation",
    description: "Verify your configuration before deployment.",
    icon: CheckCircle2,
    iconComponent: <ProfessionalIcons.final className="w-6 h-6 text-white" />,
    color: "bg-teal-500",
    gradient: "from-teal-500 to-emerald-500",
    ring: "ring-teal-500/20",
  },
  {
    id: 9,
    title: "Launch",
    subtitle: "Finalization",
    description: "Deploy your personalized trading environment.",
    icon: Settings,
    iconComponent: <ProfessionalIcons.final className="w-6 h-6 text-white" />,
    color: "bg-violet-500",
    gradient: "from-violet-500 to-purple-500",
    ring: "ring-violet-500/20",
  },
]

const SidebarStep = ({ step, currentStep, isCompleted }: { step: any; currentStep: number; isCompleted: boolean }) => {
  const isActive = step.id === currentStep
  const isPast = step.id < currentStep

  return (
    <div className="relative flex items-center group py-3">
      {step.id !== TOTAL_STEPS && (
        <div
          className={cn(
            "absolute left-[19px] top-10 bottom-[-14px] w-[2px] transition-colors duration-500",
            isPast ? "bg-primary/50" : "bg-border/30",
          )}
        />
      )}
      <div className="relative z-10 flex items-center gap-4 w-full">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
            isActive
              ? `border-primary bg-background scale-110 shadow-lg ${step.ring}`
              : isPast
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-muted bg-muted/20 text-muted-foreground",
          )}
        >
          {isPast ? (
            <Check className="w-5 h-5" />
          ) : isActive ? (
            <div className={cn("w-3 h-3 rounded-full bg-primary animate-pulse")} />
          ) : (
            <span className="text-xs font-semibold">{step.id}</span>
          )}
        </div>
        <div className="flex flex-col min-w-0 transition-opacity duration-300">
          <span
            className={cn(
              "text-sm font-bold tracking-wide truncate transition-colors",
              isActive ? "text-foreground" : isPast ? "text-foreground/80" : "text-muted-foreground",
            )}
          >
            {step.title}
          </span>
          <span className="text-xs text-muted-foreground truncate hidden lg:block max-w-[150px]">{step.subtitle}</span>
        </div>
        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
        )}
      </div>
    </div>
  )
}

const EnhancedInstrumentCard = ({ instrument, isSelected, onSelect, layout }: any) => {
  const getInstrumentIcon = (symbol: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      ES: ESFuturesIcon,
      MES: MESFuturesIcon,
      NQ: NQFuturesIcon,
      MNQ: MNQFuturesIcon,
      RTY: RTYFuturesIcon,
      M2K: M2KFuturesIcon,
      YM: YMFuturesIcon,
      MYM: MYMFuturesIcon,
      CL: CLFuturesIcon,
      MCL: MCLFuturesIcon,
      NG: NGFuturesIcon,
      GC: GCFuturesIcon,
      MGC: MGCFuturesIcon,
      SI: SIFuturesIcon,
      EURUSD: EURUSDIcon,
      GBPUSD: GBPUSDIcon,
      USDJPY: USDJPYIcon,
      AAPL: AAPLIcon,
      MSFT: MSFTIcon,
      GOOGL: GOOGLIcon,
      AMZN: AMZNIcon,
      NVDA: NVDAIcon,
      TSLA: TSLAIcon,
      JPM: JPMIcon,
      BAC: BACIcon,
      BTCUSD: BTCUSDIcon,
      ETHUSD: ETHUSDIcon,
      ADAUSDIcon: ADAUSDIcon,
      SOLUSDIcon: SOLUSDIcon,
      GOLD: GOLDIcon,
      SILVER: SILVERIcon,
      SPY: SPYIcon,
      QQQIcon: QQQIcon,
    }
    const IconComponent = iconMap[symbol] || ESFuturesIcon
    return <IconComponent className={cn("transition-colors", isSelected ? "text-white" : "text-primary")} />
  }

  return (
    <div
      onClick={() => onSelect(instrument.symbol)}
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer rounded-xl border",
        isSelected
          ? "border-primary bg-primary shadow-lg shadow-primary/25 scale-[1.02]"
          : "border-border/50 bg-card hover:border-primary/50 hover:bg-muted/50 hover:shadow-md",
        layout === "compact" ? "p-3" : "p-5",
        layout === "list" ? "flex items-center gap-4" : "flex flex-col gap-4",
      )}
    >
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 opacity-100 z-0" />
      )}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-10 pointer-events-none" />
      <div className="relative z-20 flex items-center justify-between w-full">
        <div className={cn("rounded-lg p-2 transition-colors", isSelected ? "bg-white/20" : "bg-primary/10")}>
          <div className={cn(layout === "compact" ? "w-6 h-6" : "w-8 h-8")}>{getInstrumentIcon(instrument.symbol)}</div>
        </div>
        {isSelected && <CheckCircle2 className="h-5 w-5 text-white animate-in zoom-in spin-in-90 duration-300" />}
      </div>
      <div className="relative z-20">
        <h4
          className={cn(
            "font-bold tracking-tight transition-colors",
            isSelected ? "text-white" : "text-foreground",
            layout === "compact" ? "text-sm" : "text-base",
          )}
        >
          {instrument.symbol}
        </h4>
        <p
          className={cn(
            "text-xs truncate transition-colors mt-0.5",
            isSelected ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {instrument.name}
        </p>
      </div>
    </div>
  )
}

function ProfileSetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const {
    config,
    updateTradingPreferences,
    updateUserProfile,
    updateNotificationPreferences,
    updatePrivacyPreferences,
    markSetupComplete,
    isLoaded,
  } = useUserConfig()

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [instrumentLayout, setInstrumentLayout] = useState<"grid" | "list" | "compact">("grid")

  const currentStep = Number.parseInt(searchParams.get("step") || "1", 10)
  const currentStepConfig = stepConfig.find((step) => step.id === currentStep) || stepConfig[0]

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("[v0] Profile setup: No authenticated user, redirecting to signup")
        router.push("/signup")
        return
      }

      console.log("[v0] Profile setup: User authenticated:", user.id)
      setIsAuthenticated(true)
    }

    checkAuth()
  }, [router])

  const handleNext = async () => {
    setSaveError(null)
    setIsTransitioning(true)

    if (currentStep < TOTAL_STEPS) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      router.push(`/signup/profile-setup?step=${currentStep + 1}`)
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
      }
      setIsTransitioning(false)
    } else {
      console.log("[v0] Completing profile setup, saving to database...")
      const success = await markSetupComplete()

      if (success) {
        console.log("[v0] Profile setup saved successfully, redirecting to dashboard")
        await new Promise((resolve) => setTimeout(resolve, 500))
        router.push("/dashboard")
      } else {
        console.log("[v0] Profile setup save failed")
        setSaveError("Failed to save your profile. Please check your connection and try again.")
        setIsTransitioning(false)
      }
    }
  }

  const handleBack = async () => {
    setIsTransitioning(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (currentStep > 1) {
      router.push(`/signup/profile-setup?step=${currentStep - 1}`)
    } else {
      router.push("/signup")
    }
    setIsTransitioning(false)
  }

  const handleMultiSelectChange = (field: keyof TradingPreferences, value: string) => {
    const currentValues = (config.tradingPreferences[field] as string[] | undefined) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value]
    updateTradingPreferences({ [field]: newValues })
  }

  const selectedMethodologies = config.tradingPreferences.methodologies || []
  const selectedPrimaryInstruments = config.tradingPreferences.primaryInstruments || []
  const selectedSpecificInstruments = config.tradingPreferences.specificInstruments || []

  const getAvailableSpecificInstruments = () => {
    if (selectedPrimaryInstruments.length === 0) return []
    const instruments: any[] = []
    selectedPrimaryInstruments.forEach((category) => {
      if (INSTRUMENT_MAPPINGS[category]) {
        instruments.push(...INSTRUMENT_MAPPINGS[category])
      }
    })
    return instruments
  }

  const getFilteredInstruments = (instruments: any[]) => {
    return instruments.filter((instrument) => {
      const matchesSearch =
        instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instrument.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instrument.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || instrument.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }

  const availableSpecificInstruments = getAvailableSpecificInstruments()
  const filteredInstruments = getFilteredInstruments(availableSpecificInstruments)

  if (isAuthenticated === null || !isLoaded) return <LoadingScreen />

  if (!isAuthenticated) return null

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
        <aside className="hidden lg:flex w-80 xl:w-96 flex-col border-r bg-card/50 backdrop-blur-xl h-full relative z-20 shadow-2xl">
          <div className="p-8 border-b border-border/50 bg-background/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <ConcentradeLogo size={40} variant="icon" />
              <div>
                <h1 className="font-bold text-lg tracking-tight">Concentrade</h1>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Setup Wizard</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
            <div className="space-y-1">
              {stepConfig.map((step) => (
                <SidebarStep key={step.id} step={step} currentStep={currentStep} isCompleted={currentStep > step.id} />
              ))}
            </div>
          </div>
          <div className="p-6 border-t border-border/50 bg-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Completion</span>
              <span className="font-mono">{Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${((currentStep - 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col h-full relative bg-dot-pattern">
          <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-6 justify-between lg:justify-end">
            <div className="lg:hidden flex items-center gap-2">
              <ConcentradeLogo size={32} variant="icon" />
              <span className="font-bold">Concentrade</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground hidden sm:block">
                Step <span className="text-foreground font-medium">{currentStep}</span> of {TOTAL_STEPS}
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </header>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 lg:py-12">
              <div
                className={cn(
                  "mb-10 transition-all duration-500 ease-out transform",
                  isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
                )}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "mb-4 px-3 py-1 text-sm border-2",
                    currentStepConfig.color.replace("bg-", "border-").replace("500", "500/50"),
                    currentStepConfig.color.replace("bg-", "text-").replace("500", "600"),
                  )}
                >
                  Step {currentStep} of {TOTAL_STEPS}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {currentStepConfig.title}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  {currentStepConfig.description}
                </p>
              </div>

              <div
                className={cn(
                  "transition-all duration-500 ease-out transform",
                  isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
                )}
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {enhancedMethodologyOptions.map((methodology) => (
                        <Card
                          key={methodology.id}
                          onClick={() => handleMultiSelectChange("methodologies", methodology.id)}
                          className={cn(
                            "cursor-pointer group transition-all duration-300 border-2 overflow-hidden",
                            selectedMethodologies.includes(methodology.id)
                              ? `${methodology.accent} ${methodology.shadow} shadow-xl scale-[1.02]`
                              : "border-border/50 hover:border-primary/30 hover:shadow-lg",
                          )}
                        >
                          <CardHeader className={cn("pb-4", methodology.bg)}>
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className={cn(
                                  "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg",
                                  `bg-gradient-to-br ${methodology.color}`,
                                )}
                              >
                                {methodology.icon}
                              </div>
                              {selectedMethodologies.includes(methodology.id) && (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <CardTitle className="text-xl mb-2">{methodology.label}</CardTitle>
                            <CardDescription className="text-sm leading-relaxed">
                              {methodology.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {premiumInstrumentCategories.map((category) => {
                        const isSelected = selectedPrimaryInstruments.includes(category.id)
                        return (
                          <Card
                            key={category.id}
                            onClick={() => handleMultiSelectChange("primaryInstruments", category.id)}
                            className={cn(
                              "cursor-pointer group transition-all duration-300 border-2 overflow-hidden hover:shadow-lg",
                              isSelected
                                ? "border-primary/50 shadow-xl shadow-primary/20 scale-[1.02] bg-primary/5"
                                : "border-border/50 hover:border-primary/30",
                            )}
                          >
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between mb-3">
                                <div
                                  className={cn(
                                    "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg",
                                    `bg-gradient-to-br ${category.color}`,
                                  )}
                                >
                                  {category.icon}
                                </div>
                                {isSelected && (
                                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                    <Check className="w-5 h-5 text-primary-foreground" />
                                  </div>
                                )}
                              </div>
                              <CardTitle className="text-lg mb-2">{category.label}</CardTitle>
                              <CardDescription className="text-sm leading-relaxed">
                                {category.description}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {selectedPrimaryInstruments.length === 0 ? (
                      <Card className="border-2 border-dashed border-border/50">
                        <CardContent className="pt-12 pb-12 text-center">
                          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">No Markets Selected</h3>
                          <p className="text-muted-foreground mb-6">
                            Please go back and select at least one market category to see available instruments.
                          </p>
                          <Button variant="outline" onClick={handleBack}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Markets
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                          <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              type="search"
                              placeholder="Search instruments..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 h-11 bg-background/50 backdrop-blur-sm border-2"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant={instrumentLayout === "grid" ? "default" : "outline"}
                              size="icon"
                              onClick={() => setInstrumentLayout("grid")}
                              className="h-11 w-11"
                            >
                              <LayoutGrid className="w-5 h-5" />
                            </Button>
                            <Button
                              variant={instrumentLayout === "list" ? "default" : "outline"}
                              size="icon"
                              onClick={() => setInstrumentLayout("list")}
                              className="h-11 w-11"
                            >
                              <List className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {filteredInstruments.length === 0 ? (
                            <Card className="border-2 border-dashed border-border/50">
                              <CardContent className="pt-12 pb-12 text-center">
                                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No Instruments Found</h3>
                                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                              </CardContent>
                            </Card>
                          ) : (
                            <div
                              className={cn(
                                "grid gap-3",
                                instrumentLayout === "grid" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                                instrumentLayout === "list" && "grid-cols-1",
                              )}
                            >
                              {filteredInstruments.map((instrument) => (
                                <EnhancedInstrumentCard
                                  key={instrument.symbol}
                                  instrument={instrument}
                                  isSelected={selectedSpecificInstruments.includes(instrument.symbol)}
                                  onSelect={(symbol: string) => handleMultiSelectChange("specificInstruments", symbol)}
                                  layout={instrumentLayout}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="bg-card rounded-2xl border-2 border-border/60 shadow-sm p-1">
                    <ProfileInfoStep userProfile={config.userProfile} onUpdate={updateUserProfile} />
                  </div>
                )}
                {currentStep === 5 && (
                  <div className="bg-card rounded-2xl border-2 border-border/60 shadow-sm p-1">
                    <InstrumentVisibilityStep
                      tradingPreferences={config.tradingPreferences}
                      onUpdate={updateTradingPreferences}
                    />
                  </div>
                )}
                {currentStep === 6 && (
                  <div className="bg-card rounded-2xl border-2 border-border/60 shadow-sm p-1">
                    <NotificationsStep
                      notificationPreferences={config.notificationPreferences}
                      onUpdate={updateNotificationPreferences}
                    />
                  </div>
                )}
                {currentStep === 7 && (
                  <div className="bg-card rounded-2xl border-2 border-border/60 shadow-sm p-1">
                    <LegalPrivacyStep
                      privacyPreferences={config.privacyPreferences}
                      onUpdate={updatePrivacyPreferences}
                    />
                  </div>
                )}
                {currentStep === 8 && (
                  <div className="bg-card rounded-2xl border-2 border-border/60 shadow-sm p-1">
                    <ReviewConfirmationStep config={config} />
                  </div>
                )}
                {currentStep === 9 && (
                  <Card className="border-2 border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-primary/20 pb-8">
                      <div className="flex items-center justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-12 h-12 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-center text-3xl mb-3">Ready to Launch</CardTitle>
                      <CardDescription className="text-center text-base max-w-md mx-auto">
                        Your Concentrade environment has been personalized. Click below to access your trading
                        dashboard.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 pb-8">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm">Profile configured</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm">Preferences saved</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm">System ready</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {saveError && (
                <div className="mt-6 p-4 bg-destructive/10 border-2 border-destructive/50 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-destructive mb-1">Setup Error</h4>
                    <p className="text-sm text-destructive/90">{saveError}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 mt-12 pt-8 border-t border-border/50">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  disabled={isTransitioning}
                  className="min-w-[120px] bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="hidden sm:inline">Progress:</span>
                  <span className="font-medium text-foreground">
                    {currentStep}/{TOTAL_STEPS}
                  </span>
                </div>

                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={isTransitioning}
                  className="min-w-[120px] shadow-lg shadow-primary/20"
                >
                  {currentStep === TOTAL_STEPS ? (
                    <>
                      Complete
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}

export default function ProfileSetupPage() {
  return (
    <React.Suspense fallback={<LoadingScreen />}>
      <ProfileSetupContent />
    </React.Suspense>
  )
}
