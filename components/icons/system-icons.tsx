"use client"

import { cn } from "@/lib/utils"
import { Brain, Megaphone } from "lucide-react"

interface IconProps extends React.SVGProps<SVGSVGElement> {
    className?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// SYSTEM ICONS — SLEEK & PREMIUM DESIGN SYSTEM
// Grid: 24×24 · Stroke: 1.5px · Corners: 2px · Broken-line depth · Open shapes
// Visual DNA: Linear / Vercel / Stripe aesthetic
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

/**
 * Dashboard — 2×2 grid of outlined squares with optional glow.
 * Perfectly aligned, stroke-only (outlined), modern digital style.
 */
export function DashboardIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* 2×2 grid: four equal outlined squares */}
            <rect x="2" y="2" width="9" height="9" rx="1.5" fill="none" strokeWidth="1.5" />
            <rect x="13" y="2" width="9" height="9" rx="1.5" fill="none" strokeWidth="1.5" />
            <rect x="2" y="13" width="9" height="9" rx="1.5" fill="none" strokeWidth="1.5" />
            <rect x="13" y="13" width="9" height="9" rx="1.5" fill="none" strokeWidth="1.5" />
        </SvgTemplate>
    )
}

/**
 * Trades / Trade Ledger
 * A meticulous hybrid of candlestick chart and horizontal ledger.
 * Minimal, geometric, and airy (Linear/Vercel styling).
 */
export function TradeLedgerIcon({ className, ...props }: IconProps) {
    return (
        <SvgTemplate className={className} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" {...props}>
            {/* Left side: Candlesticks (Wicks are 1px) */}
            {/* Gridline behind candles */}
            <path d="M3 10h9" stroke="currentColor" opacity="0.1" strokeDasharray="1 2" />
            <path d="M3 14h9" stroke="currentColor" opacity="0.1" strokeDasharray="1 2" />

            {/* Candle 1 (Bearish) */}
            <path d="M5 5v9" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <rect x="4" y="7" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />

            {/* Candle 2 (Bullish) */}
            <path d="M8.5 8v10" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <rect x="7.5" y="11" width="2" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />

            {/* Candle 3 (Bearish) */}
            <path d="M12 4v7" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <rect x="11" y="6" width="2" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />

            {/* Center Divider */}
            <path d="M15 4v16" stroke="currentColor" opacity="0.15" />

            {/* Right side: Ledger Row Items */}
            <path d="M17 6h4" stroke="currentColor" strokeLinecap="round" />
            <path d="M17 10h2" stroke="currentColor" strokeLinecap="round" opacity="0.6" />
            <path d="M17 14h3" stroke="currentColor" strokeLinecap="round" />
            <path d="M17 18h4" stroke="currentColor" strokeLinecap="round" opacity="0.4" />

            {/* Micro indicators on the ledger rows */}
            <circle cx="21" cy="6" r="0.5" fill="currentColor" stroke="none" opacity="0.5" />
            <circle cx="21" cy="14" r="0.5" fill="currentColor" stroke="none" opacity="0.5" />
        </SvgTemplate>
    )
}

/**
 * Analytics — Candlestick Chart Pattern
 * Three OHLC candlestick bars with wicks — the universal symbol
 * for market price action and technical analysis.
 */
export function AnalyticsIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* X-axis baseline */}
            <path d="M3 20h18" opacity="0.2" />
            {/* Candle 1 — bearish (tall) */}
            <line x1="6" y1="5" x2="6" y2="18" opacity="0.4" />
            <rect x="4.5" y="7" width="3" height="7" rx="0.5" fill="currentColor" opacity="0.15" />
            <rect x="4.5" y="7" width="3" height="7" rx="0.5" />
            {/* Candle 2 — bullish (short, higher) */}
            <line x1="12" y1="4" x2="12" y2="15" opacity="0.4" />
            <rect x="10.5" y="6" width="3" height="5" rx="0.5" fill="currentColor" opacity="0.08" />
            <rect x="10.5" y="6" width="3" height="5" rx="0.5" />
            {/* Candle 3 — bullish (medium, highest) */}
            <line x1="18" y1="3" x2="18" y2="13" opacity="0.4" />
            <rect x="16.5" y="5" width="3" height="4" rx="0.5" fill="currentColor" opacity="0.08" />
            <rect x="16.5" y="5" width="3" height="4" rx="0.5" />
        </SvgTemplate>
    )
}

/**
 * Playbook (Strategy Playbook)
 * Sleek, geometric, editorial style (Linear/Vercel aesthetic).
 * Layered card/page stack with a precision crosshair overlaid.
 */
export function PlaybookIcon({ className, ...props }: IconProps) {
    return (
        <SvgTemplate className={className} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" {...props}>
            {/* Background Page Elements */}
            <path d="M7 6h11a2 2 0 0 1 2 2v10" stroke="currentColor" opacity="0.4" />
            <path d="M11 3h7" stroke="currentColor" opacity="0.15" />

            {/* Main Blueprint/Card */}
            <rect x="4" y="9" width="13" height="12" rx="2" stroke="currentColor" />

            {/* Crosshair/reticle element for 'tactical' feel */}
            <circle cx="10.5" cy="15" r="2.5" stroke="currentColor" />

            {/* Crosshair ticks */}
            <path d="M10.5 11v1.5 M10.5 17.5v1.5 M6.5 15h1.5 M13 15h1.5" stroke="currentColor" />

            {/* Center target node */}
            <circle cx="10.5" cy="15" r="1" fill="currentColor" opacity="0.25" stroke="none" />
        </SvgTemplate>
    )
}

/**
 * Psychology — Mind / Trading psychology
 * Brain icon using Lucide's optimized SVG.
 */
export function PsychologyIcon({ className, ...props }: IconProps) {
    return <Brain strokeWidth={1.5} className={cn("w-5 h-5", className)} {...props} />
}

/**
 * Updates — Megaphone / Announcements
 * Megaphone icon for system updates and announcements.
 */
export function UpdatesIcon({ className, ...props }: IconProps) {
    return <Megaphone strokeWidth={1.5} className={cn("w-5 h-5", className)} {...props} />
}

/**
 * Avg Return — Average profit per trade
 * Dollar sign with averaging tilde (~) — represents the mean P&L per execution.
 * Clear, financial, and instantly recognizable.
 */
export function AvgReturnIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Upward trending line — represents average return direction */}
            <path d="M4 16l6-6 4 4 6-6" strokeWidth="1.8" />
            {/* Arrow head */}
            <path d="M17 8l3-3" strokeWidth="1.8" />
            <path d="M20 5h-4" strokeWidth="1.8" />
            <path d="M20 5v4" strokeWidth="1.8" />
        </SvgTemplate>
    )
}

/**
 * Profit Factor — Ratio of gross profit to gross loss
 * Multiplication/ratio symbol with upward trend arrow.
 * Represents the profit multiplier concept (e.g., 2.5x means $2.50 profit per $1 loss).
 */
export function ProfitFactorIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Balance beam — center fulcrum */}
            <path d="M12 6v12" opacity="0.3" />
            <polygon points="12,18 10,20 14,20" fill="currentColor" opacity="0.3" />
            {/* Beam — tilted up-left to show profit outweighs loss */}
            <line x1="4" y1="9" x2="20" y2="11" strokeWidth="1.8" />
            {/* Left pan — heavier (profit), sits higher */}
            <path d="M4 9l2 5h-4z" fill="currentColor" opacity="0.25" />
            <line x1="2" y1="14" x2="6" y2="14" strokeWidth="1.5" />
            {/* Right pan — lighter (loss), sits lower */}
            <path d="M20 11l1.5 4h-3z" fill="currentColor" opacity="0.15" />
            <line x1="18.5" y1="15" x2="21.5" y2="15" strokeWidth="1.5" />
        </SvgTemplate>
    )
}

/**
 * Settings — Fine-Tuned Slider Controls
 * Three vertical tracks with slider thumbs at different positions.
 * Broken tracks at the thumb create the signature gap/depth effect.
 */
export function SettingsIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Track 1 — thumb at top */}
            <line x1="6" y1="4" x2="6" y2="7" />
            <line x1="6" y1="11" x2="6" y2="20" />
            <circle cx="6" cy="9" r="2" />
            {/* Track 2 — thumb at bottom */}
            <line x1="12" y1="4" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12" y2="20" />
            <circle cx="12" cy="15" r="2" />
            {/* Track 3 — thumb at middle */}
            <line x1="18" y1="4" x2="18" y2="9" />
            <line x1="18" y1="13" x2="18" y2="20" />
            <circle cx="18" cy="11" r="2" />
        </SvgTemplate>
    )
}

/**
 * Add Trade — Plus with precision crosshair feel
 */
export function AddTradeIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </SvgTemplate>
    )
}

/**
 * Backtest — Clock with rewind arrow
 */
export function BacktestIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l3 2" />
        </SvgTemplate>
    )
}

// ── STRATEGY & FINANCIAL ICONS ──────────────────────────────────────────────

/**
 * Breakout — Arrow piercing through resistance line
 * A horizontal resistance line with a bold arrow breaking upward through it.
 * The gap/break in the line where the arrow crosses is the signature detail.
 */
export function BreakoutIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Resistance line — broken where arrow pierces */}
            <line x1="3" y1="13" x2="9.5" y2="13" opacity="0.5" />
            <line x1="14.5" y1="13" x2="21" y2="13" opacity="0.5" />
            {/* Price action approaching from below */}
            <path d="M5 19l4-3 3 1.5" opacity="0.4" />
            {/* Breakout arrow — piercing through */}
            <path d="M12 16V5" />
            <path d="M8.5 8.5L12 5l3.5 3.5" />
        </SvgTemplate>
    )
}

/**
 * Scalp — Precision execution mark
 * A crosshair with a sharp price tick through center — represents
 * the surgical precision of a scalp trade. Distinctly NOT a lightning bolt.
 */
export function ScalpIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Crosshair horizontal */}
            <line x1="3" y1="12" x2="9" y2="12" opacity="0.35" />
            <line x1="15" y1="12" x2="21" y2="12" opacity="0.35" />
            {/* Crosshair vertical */}
            <line x1="12" y1="3" x2="12" y2="9" opacity="0.35" />
            <line x1="12" y1="15" x2="12" y2="21" opacity="0.35" />
            {/* Sharp price tick through center — the execution */}
            <path d="M8 15l2-3 2 1 2-5 2 4" />
            {/* Center dot — point of execution */}
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </SvgTemplate>
    )
}

/**
 * Profit Chart — Stepped Ascent
 * Clean rising steps with an upward trajectory.
 * Open at top-right to suggest continued growth.
 */
export function ProfitChartIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Baseline */}
            <path d="M3 20h18" opacity="0.25" />
            {/* Stepped ascent — each step higher */}
            <path d="M4 16h3v-3h3v-3h3v-3h3V4h4" />
            {/* Subtle filled area below steps */}
            <path d="M4 16h3v-3h3v-3h3v-3h3V4h4v16H4z" fill="currentColor" opacity="0.04" stroke="none" />
        </SvgTemplate>
    )
}

/**
 * Momentum Flow — Accelerating wave with forward thrust
 * A smooth accelerating curve that widens as it moves right,
 * with a leading arrowhead suggesting forward momentum.
 */
export function MomentumFlowIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Primary momentum wave — accelerating rightward */}
            <path d="M3 12C5 12 7 8 10 8s4 4 6 4 3-4 5-4" />
            {/* Secondary echo wave — offset below, fading */}
            <path d="M5 16C7 16 8 13 10.5 13s3 3 5 3 2.5-3 4.5-3" opacity="0.3" />
            {/* Leading arrowhead — forward thrust */}
            <path d="M18 8l3 0" />
            <path d="M19 6l2 2-2 2" />
            {/* Trailing velocity marks at left */}
            <line x1="2" y1="10" x2="4" y2="10" opacity="0.2" />
            <line x1="2" y1="14" x2="3.5" y2="14" opacity="0.15" />
        </SvgTemplate>
    )
}

/**
 * Mean Reversion — Crosshair target with return arrows
 * Central crosshair with small arrows converging inward.
 * Gaps at crosshair intersections for the broken-line depth effect.
 */
export function MeanReversionIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Outer ring */}
            <circle cx="12" cy="12" r="8" opacity="0.3" />
            {/* Inner ring */}
            <circle cx="12" cy="12" r="3" />
            {/* Crosshair lines — broken at inner circle */}
            <line x1="12" y1="4" x2="12" y2="9" />
            <line x1="12" y1="15" x2="12" y2="20" />
            <line x1="4" y1="12" x2="9" y2="12" />
            <line x1="15" y1="12" x2="20" y2="12" />
            {/* Return arrows converging to center */}
            <path d="M6 6l2.5 2.5" opacity="0.5" />
            <path d="M18 6l-2.5 2.5" opacity="0.5" />
            <path d="M6 18l2.5-2.5" opacity="0.5" />
            <path d="M18 18l-2.5-2.5" opacity="0.5" />
            {/* Center dot */}
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </SvgTemplate>
    )
}

// ── AI & ADVANCED FEATURES ────────────────────────────────────────────────────

/**
 * Neural Spark — AI / Neural network abstraction
 * Central hub with radiating connection nodes.
 */
export function NeuralSparkIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Central hub */}
            <circle cx="12" cy="12" r="2.5" />
            {/* Orbital nodes */}
            <circle cx="12" cy="4" r="1.5" />
            <circle cx="19" cy="8" r="1.5" />
            <circle cx="19" cy="16" r="1.5" />
            <circle cx="12" cy="20" r="1.5" />
            <circle cx="5" cy="16" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            {/* Connections — broken at node boundaries */}
            <path d="M12 5.5V9.5" opacity="0.4" />
            <path d="M17.7 8.8L14.2 10.6" opacity="0.4" />
            <path d="M17.7 15.2L14.2 13.4" opacity="0.4" />
            <path d="M12 18.5V14.5" opacity="0.4" />
            <path d="M6.3 15.2L9.8 13.4" opacity="0.4" />
            <path d="M6.3 8.8L9.8 10.6" opacity="0.4" />
        </SvgTemplate>
    )
}

/**
 * Pattern Eye — Market pattern recognition
 */
export function PatternEyeIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </SvgTemplate>
    )
}

/**
 * Compass — Navigation / Guides
 */
export function CompassIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <circle cx="12" cy="12" r="9" />
            {/* Cardinal ticks */}
            <line x1="12" y1="3" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="21" />
            <line x1="3" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="21" y2="12" />
            {/* Diamond needle */}
            <polygon points="12,6 14,12 12,18 10,12" fill="currentColor" stroke="none" opacity="0.15" />
            <path d="M12 6l2 6-2 6-2-6z" />
            <circle cx="12" cy="12" r="1.5" />
        </SvgTemplate>
    )
}

/**
 * Social — Trading community
 */
export function SocialIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            <circle cx="9" cy="7" r="3" />
            <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" />
            {/* Second person — offset, partial for depth */}
            <circle cx="17" cy="8" r="2.5" />
            <path d="M19 21v-1.5a4 4 0 0 0-2-3.5" opacity="0.5" />
        </SvgTemplate>
    )
}

/**
 * Pulse — Quick action / energy / updates indicator
 * A refined pulse/signal icon — replaces generic Lucide Zap across the app.
 * Circular radar pulse with a center dot.
 */
export function PulseIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Outer pulse ring */}
            <circle cx="12" cy="12" r="9" opacity="0.2" />
            {/* Middle pulse ring */}
            <circle cx="12" cy="12" r="5.5" opacity="0.4" />
            {/* Inner ring */}
            <circle cx="12" cy="12" r="2.5" />
            {/* Center dot */}
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
            {/* Emission rays — suggesting active signal */}
            <path d="M12 3v2" opacity="0.3" />
            <path d="M12 19v2" opacity="0.3" />
            <path d="M3 12h2" opacity="0.3" />
            <path d="M19 12h2" opacity="0.3" />
        </SvgTemplate>
    )
}

/**
 * Spark — AI/Intelligence sparkle
 * A refined 4-point star with radiating dots. Premium alternative to Lucide Sparkles.
 */
export function SparkIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Primary 4-point star */}
            <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
            {/* Small secondary star */}
            <path d="M18 3l0.5 1.5L20 5l-1.5 0.5L18 7l-0.5-1.5L16 5l1.5-0.5z" opacity="0.5" />
            {/* Tertiary dot */}
            <circle cx="6" cy="18" r="1" opacity="0.35" />
            <circle cx="18" cy="18" r="0.75" opacity="0.25" />
        </SvgTemplate>
    )
}

/**
 * Import — Data synchronization and upload
 * Animated glowing up-arrow piercing a cloud/data structure.
 */
export function ImportIcon({ className, ...props }: IconProps) {
    return (
        <SvgTemplate className={cn("group", className)} {...props}>
            {/* Cloud / Base structure */}
            <path
                d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9"
                className="opacity-40 transition-opacity duration-300 group-hover:opacity-60"
            />
            {/* Upload Arrow */}
            <path
                d="M12 12v9"
                className="transition-transform duration-300 group-hover:-translate-y-1"
            />
            <path
                d="M8 16l4-4 4 4"
                className="transition-transform duration-300 group-hover:-translate-y-1"
            />
            {/* Data flow dot moving up the line */}
            <circle
                cx="12" cy="20" r="1.5"
                className="fill-primary opacity-0 group-hover:opacity-100"
                stroke="none"
                style={{ animation: "upload-flow 1.5s ease-out infinite" }}
            />
            <style>{`
                @keyframes upload-flow {
                   0% { transform: translateY(0); opacity: 0; }
                   50% { opacity: 1; }
                   100% { transform: translateY(-8px); opacity: 0; }
                }
            `}</style>
        </SvgTemplate>
    )
}

/**
 * PieChart — Strategy Breakdown / Distribution
 * Premium layered pie chart replacing Lucide's generic outline.
 */
export function PieChartIcon({ className, ...props }: IconProps) {
    return (
        <SvgTemplate className={cn("group", className)} {...props}>
            {/* Base circle */}
            <circle
                cx="12" cy="12" r="9"
                className="opacity-30"
            />
            {/* Cutout slice — pops out on hover */}
            <path
                d="M12 3a9 9 0 0 1 9 9h-9V3z"
                className="fill-primary/20 stroke-primary transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
            {/* Center pin */}
            <circle cx="12" cy="12" r="1" className="fill-foreground stroke-none" />
        </SvgTemplate>
    )
}
