"use client"

import { cn } from "@/lib/utils"

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
 * Dashboard — Bento Grid Layout
 * Asymmetric bento-grid with broken intersections for depth.
 * The gap between cells creates visual breathing room.
 */
export function DashboardIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Top-left: wide cell */}
            <rect x="3" y="3" width="10" height="7" rx="2" />
            {/* Top-right: square cell */}
            <rect x="15" y="3" width="6" height="7" rx="2" />
            {/* Bottom-left: square cell */}
            <rect x="3" y="12" width="6" height="9" rx="2" />
            {/* Bottom-right: wide cell */}
            <rect x="11" y="12" width="10" height="9" rx="2" />
            {/* Subtle data dots inside bottom-right cell for depth */}
            <circle cx="15" cy="17" r="0.75" fill="currentColor" stroke="none" />
            <circle cx="17.5" cy="17" r="0.75" fill="currentColor" stroke="none" opacity="0.5" />
        </SvgTemplate>
    )
}

/**
 * Trades — Sleek Tabular Ledger
 * Horizontal ruled lines with left accent marks.
 * Broken lines at varying lengths create a data-table feel.
 */
export function TradeLedgerIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Vertical left rail — open at top */}
            <path d="M4 6v14" opacity="0.3" />
            {/* Row lines with varying lengths for realism */}
            <line x1="7" y1="7" x2="20" y2="7" />
            <line x1="7" y1="11" x2="17" y2="11" opacity="0.6" />
            <line x1="7" y1="15" x2="20" y2="15" />
            <line x1="7" y1="19" x2="15" y2="19" opacity="0.6" />
            {/* Left accent ticks — broken from the rail for depth */}
            <line x1="4" y1="7" x2="5.5" y2="7" />
            <line x1="4" y1="11" x2="5.5" y2="11" />
            <line x1="4" y1="15" x2="5.5" y2="15" />
            <line x1="4" y1="19" x2="5.5" y2="19" />
        </SvgTemplate>
    )
}

/**
 * Analytics — Smooth Ascending Curve
 * A gentle bezier curve ascending right with a vertical Y-axis.
 * Open at the end to suggest continuation.
 */
export function AnalyticsIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Y-axis — open at top (no cap) */}
            <path d="M3 20V5" />
            {/* X-axis — open at right */}
            <path d="M3 20h18" opacity="0.3" />
            {/* Smooth ascending bezier curve */}
            <path d="M4 17C6 17 8 16 10 14S13 9 16 7c1.5-1 3-1.5 5-1.5" />
            {/* Subtle area hint below curve */}
            <path d="M4 17C6 17 8 16 10 14S13 9 16 7c1.5-1 3-1.5 5-1.5V20H4z" fill="currentColor" opacity="0.04" stroke="none" />
        </SvgTemplate>
    )
}

/**
 * Playbook — Geometric Blueprint / Open Book
 * Two pages with precise schematic lines and a node-connection detail.
 */
export function PlaybookIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Spine */}
            <path d="M12 4v16" opacity="0.3" />
            {/* Left page — open at top for breathing */}
            <path d="M4 6c2-0.5 5-1 8-0.5" />
            <path d="M4 6v14c2-0.5 5-1 8-0.5" />
            <path d="M12 19.5V4" opacity="0" />
            {/* Right page */}
            <path d="M20 6c-2-0.5-5-1-8-0.5" />
            <path d="M20 6v14c-2-0.5-5-1-8-0.5" />
            {/* Left page: schematic lines */}
            <line x1="6.5" y1="10" x2="10" y2="10" opacity="0.4" />
            <line x1="6.5" y1="13" x2="9" y2="13" opacity="0.4" />
            {/* Right page: flow diagram dots */}
            <circle cx="15" cy="10" r="1" />
            <circle cx="18" cy="13" r="1" />
            <path d="M15.7 10.7L17.3 12.3" opacity="0.5" />
        </SvgTemplate>
    )
}

/**
 * Psychology — Neural Node Network
 * Abstract mind-as-network: central node with orbital connections.
 * Gaps at intersections create depth.
 */
export function PsychologyIcon(props: IconProps) {
    return (
        <SvgTemplate {...props}>
            {/* Central node */}
            <circle cx="12" cy="12" r="2.5" />
            {/* Orbital nodes */}
            <circle cx="5" cy="7" r="1.5" />
            <circle cx="19" cy="7" r="1.5" />
            <circle cx="5" cy="18" r="1.5" />
            <circle cx="19" cy="18" r="1.5" />
            {/* Connection lines — broken/gapped where they meet center node */}
            <path d="M6.3 8L9.8 10.3" opacity="0.5" />
            <path d="M17.7 8L14.2 10.3" opacity="0.5" />
            <path d="M6.3 17L9.8 13.7" opacity="0.5" />
            <path d="M17.7 17L14.2 13.7" opacity="0.5" />
            {/* Cross connections between outer nodes — subtle */}
            <path d="M6.5 7h11" opacity="0.15" />
            <path d="M6.5 18h11" opacity="0.15" />
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
