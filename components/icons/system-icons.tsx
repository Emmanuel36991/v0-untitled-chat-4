"use client"

import { cn } from "@/lib/utils"
// import { motion } from "framer-motion" // Optional for future animations

interface IconProps extends React.SVGProps<SVGSVGElement> {
    className?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// SYSTEM ICONS — BESPOKE FINANCIAL UI
// Visual DNA: 1.5px Stroke, Rounded Caps, Lucide-Compatible Sizing
// ══════════════════════════════════════════════════════════════════════════════

const SvgTemplate = ({ className, children, ...props }: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("w-5 h-5", className)}
        {...props}
    >
        {children}
    </svg>
)

// ── NAVIGATION ICONS ──────────────────────────────────────────────────────────

export function DashboardIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" strokeDasharray="4 2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
            <path d="M10 10 L14 14" opacity="0.5" />
        </SvgTemplate>
    )
}

export function TradeLedgerIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <path d="M22 6l-10 7L2 6" />
            <path d="M7 15h10" opacity="0.5" />
            <path d="M7 11h5" opacity="0.5" />
        </SvgTemplate>
    )
}

export function AnalyticsIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M3 17l6-6 4 4 8-8" />
            <path d="M14 7h7v7" />
            <path d="M3 21h18" opacity="0.2" />
        </SvgTemplate>
    )
}

export function PlaybookIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M12 8v8" opacity="0.5" />
            <path d="M9 12h6" opacity="0.5" />
        </SvgTemplate>
    )
}

export function PsychologyIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M12 5a7 7 0 0 1 7 7c0 2.5-1.5 5.5-3 6.5" />
            <path d="M12 5a7 7 0 0 0-7 7c0 2.5 1.5 5.5 3 6.5" />
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            <path d="M12 15v7" />
        </SvgTemplate>
    )
}

export function BacktestIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </SvgTemplate>
    )
}

export function SettingsIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M6 10V5" />
            <path d="M6 20v-6" />
            <path d="M12 10V5" />
            <path d="M12 20v-6" />
            <path d="M18 10V5" />
            <path d="M18 20v-6" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="18" cy="12" r="2" />
        </SvgTemplate>
    )
}

export function AddTradeIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </SvgTemplate>
    )
}

// ── STRATEGY & METAPHOR REPLACEMENTS (THE BESPOKE 5) ──────────────────────────

/**
 * REPLACES: Rocket (🚀)
 * METAPHOR: Price breaking through resistance
 */
export function BreakoutIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M3 15h18" strokeDasharray="4 2" opacity="0.6" />
            <path d="M7 15v4" opacity="0.4" />
            <path d="M12 11v8" opacity="0.4" />
            <path d="M17 15v-8" />
            <path d="M17 7l-3 3" />
            <path d="M17 7l3 3" />
        </SvgTemplate>
    )
}

/**
 * REPLACES: Zap (⚡) for Scalping
 * METAPHOR: High frequency, jagged price tick
 */
export function ScalpIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13" />
            <path d="M11 13L2 13" />
        </SvgTemplate>
    )
}

/**
 * REPLACES: Award/Trophy (🎖️) for Profit/Wins
 * METAPHOR: Rising stack / Ledger profit
 */
export function ProfitChartIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <rect x="3" y="13" width="6" height="8" rx="1" />
            <rect x="15" y="3" width="6" height="18" rx="1" />
            <path d="M9 13l6-6" opacity="0.5" strokeDasharray="2 2" />
        </SvgTemplate>
    )
}

/**
 * REPLACES: Flame (🔥) for Momentum
 * METAPHOR: Increasing velocity/acceleration arrows
 */
export function MomentumFlowIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </SvgTemplate>
    )
}

/**
 * REPLACES: Target (🎯) for Mean Reversion
 * METAPHOR: Price returning to center mean
 */
export function MeanReversionIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M3 12h18" opacity="0.3" />
            <path d="M3 7c2 0 3 5 5 5s3-5 5-5 3 5 5 5 3-5 5-5" />
            <path d="M12 12v3" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
        </SvgTemplate>
    )
}


// ── AI & ADVANCED FEATURES ────────────────────────────────────────────────────

/**
 * REPLACES: Sparkles/Generic Brain
 * METAPHOR: Neural network nodes connecting
 */
export function NeuralSparkIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <circle cx="12" cy="12" r="3" />
            <circle cx="6" cy="6" r="1.5" opacity="0.7" />
            <circle cx="18" cy="6" r="1.5" opacity="0.7" />
            <circle cx="6" cy="18" r="1.5" opacity="0.7" />
            <circle cx="18" cy="18" r="1.5" opacity="0.7" />
            <path d="M8.5 8.5l1.5 1.5" opacity="0.4" />
            <path d="M14 14l1.5 1.5" opacity="0.4" />
            <path d="M15.5 8.5l-1.5 1.5" opacity="0.4" />
            <path d="M8.5 15.5l1.5-1.5" opacity="0.4" />
        </SvgTemplate>
    )
}

export function PatternEyeIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
        </SvgTemplate>
    )
}

export function CompassIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </SvgTemplate>
    )
}

export function SocialIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </SvgTemplate>
    )
}
