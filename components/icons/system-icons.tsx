"use client"

import { cn } from "@/lib/utils"
import { Brain, Megaphone } from "lucide-react"
import { useId } from "react"

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
export function TradeLedgerIcon({ className, filled, ...props }: IconProps & { filled?: boolean }) {
    return (
        <SvgTemplate className={className} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" {...props}>
            {/* Left side: Candlesticks (Wicks are 1px) */}
            {/* Gridline behind candles */}
            <path d="M3 10h9" stroke="currentColor" opacity="0.1" strokeDasharray="1 2" />
            <path d="M3 14h9" stroke="currentColor" opacity="0.1" strokeDasharray="1 2" />

            {/* Candle 1 (Bearish) */}
            <path d="M5 5v9" stroke="currentColor" strokeWidth="1" opacity={filled ? 0.8 : 0.5} />
            <rect x="4" y="7" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 1 : 0.2} />

            {/* Candle 2 (Bullish) */}
            <path d="M8.5 8v10" stroke="currentColor" strokeWidth="1" opacity={filled ? 0.8 : 0.5} />
            <rect x="7.5" y="11" width="2" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill={filled ? "currentColor" : "none"} />

            {/* Candle 3 (Bearish) */}
            <path d="M12 4v7" stroke="currentColor" strokeWidth="1" opacity={filled ? 0.8 : 0.5} />
            <rect x="11" y="6" width="2" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 1 : 0.2} />

            {/* Center Divider */}
            <path d="M15 4v16" stroke="currentColor" opacity="0.15" />

            {/* Right side: Ledger Row Items */}
            <path d="M17 6h4" stroke="currentColor" strokeLinecap="round" strokeWidth={filled ? 2.5 : 1.5} />
            <path d="M17 10h2" stroke="currentColor" strokeLinecap="round" opacity={filled ? 0.8 : 0.6} strokeWidth={filled ? 2.5 : 1.5} />
            <path d="M17 14h3" stroke="currentColor" strokeLinecap="round" strokeWidth={filled ? 2.5 : 1.5} />
            <path d="M17 18h4" stroke="currentColor" strokeLinecap="round" opacity={filled ? 0.6 : 0.4} strokeWidth={filled ? 2.5 : 1.5} />

            {/* Micro indicators on the ledger rows */}
            <circle cx="21" cy="6" r="0.5" fill="currentColor" stroke="none" opacity={filled ? 1 : 0.5} />
            <circle cx="21" cy="14" r="0.5" fill="currentColor" stroke="none" opacity={filled ? 1 : 0.5} />
        </SvgTemplate>
    )
}

/**
 * Trade Icon (Rich 3D)
 */
export function TradeIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `tr-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("folder")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6B7280" />
                    <stop offset="100%" stopColor="#374151" />
                </linearGradient>
                <linearGradient id={id("folderFront")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("paper")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F9FAFB" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>
            </defs>

            <g>

                {/* ===== BACK OF FOLDER ===== */}
                <rect x="6" y="22" width="52" height="38" rx="3" fill={`url(#${id("folder")})`} stroke="#1F2937" strokeWidth="0.8" />

                {/* ===== FOLDER TAB (top-left) ===== */}
                <path
                    d="M6,25 L6,20 Q6,17 9,17 L22,17 Q24,17 25,19 L27,22 L6,22 Z"
                    fill={`url(#${id("folder")})`}
                    stroke="#1F2937"
                    strokeWidth="0.8"
                />

                {/* ===== DOCUMENTS PEEKING OUT ===== */}

                {/* Doc 1 — left, tallest peek: rising trend line */}
                <rect x="11" y="8" width="14" height="30" rx="1.5" fill={`url(#${id("paper")})`} stroke="#D1D5DB" strokeWidth="0.5" />
                {/* Bold rising line chart */}
                <polyline
                    points="14,24 17,20 20,22 22,14"
                    fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                />
                {/* Dot at peak */}
                <circle cx="22" cy="14" r="2" fill="#374151" />
                {/* Small upward arrow at peak */}
                <path d="M22,11 L24,14 L20,14 Z" fill="#6B7280" />

                {/* Doc 2 — center, medium peek: candlesticks */}
                <rect x="26" y="11" width="14" height="27" rx="1.5" fill={`url(#${id("paper")})`} stroke="#D1D5DB" strokeWidth="0.5" />
                {/* Bold candlestick bars */}
                {/* Candle 1 - bearish */}
                <line x1="30" y1="15" x2="30" y2="27" stroke="#9CA3AF" strokeWidth="0.8" />
                <rect x="28.2" y="17" width="3.6" height="7" rx="0.8" fill="#374151" />
                {/* Candle 2 - bullish */}
                <line x1="35" y1="14" x2="35" y2="26" stroke="#9CA3AF" strokeWidth="0.8" />
                <rect x="33.2" y="16" width="3.6" height="6" rx="0.8" fill="#6B7280" />

                {/* Doc 3 — right, shortest peek: bar chart */}
                <rect x="41" y="14" width="14" height="24" rx="1.5" fill={`url(#${id("paper")})`} stroke="#D1D5DB" strokeWidth="0.5" />
                {/* Bold bar chart */}
                <rect x="43.5" y="22" width="3" height="8" rx="0.6" fill="#374151" />
                <rect x="47.5" y="18" width="3" height="12" rx="0.6" fill="#6B7280" />
                <rect x="51.5" y="20" width="3" height="10" rx="0.6" fill="#4B5563" />

                {/* ===== FRONT OF FOLDER ===== */}
                <rect x="6" y="34" width="52" height="26" rx="3" fill={`url(#${id("folderFront")})`} stroke="#1F2937" strokeWidth="0.8" />
                {/* Front folder highlight */}
                <rect x="8" y="36" width="48" height="1.5" rx="0.75" fill="white" fillOpacity="0.08" />

            </g>
        </svg>
    );
}

/**
 * Analytics — Candlestick Chart Pattern
 * Three OHLC candlestick bars with wicks — the universal symbol
 * for market price action and technical analysis.
 */
export function AnalyticsIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
    return (
        <SvgTemplate {...props}>
            {/* X-axis baseline */}
            <path d="M3 20h18" opacity="0.2" strokeWidth={filled ? 2 : 1.5} />
            {/* Candle 1 — bearish (tall) */}
            <line x1="6" y1="5" x2="6" y2="18" opacity={filled ? 0.8 : 0.4} strokeWidth={filled ? 2 : 1.5} />
            <rect x="4.5" y="7" width="3" height="7" rx="0.5" fill="currentColor" opacity={filled ? 1 : 0.15} />
            <rect x="4.5" y="7" width="3" height="7" rx="0.5" strokeWidth={filled ? 2 : 1.5} />
            {/* Candle 2 — bullish (short, higher) */}
            <line x1="12" y1="4" x2="12" y2="15" opacity={filled ? 0.8 : 0.4} strokeWidth={filled ? 2 : 1.5} />
            <rect x="10.5" y="6" width="3" height="5" rx="0.5" fill="currentColor" opacity={filled ? 1 : 0.08} />
            <rect x="10.5" y="6" width="3" height="5" rx="0.5" strokeWidth={filled ? 2 : 1.5} />
            {/* Candle 3 — bullish (medium, highest) */}
            <line x1="18" y1="3" x2="18" y2="13" opacity={filled ? 0.8 : 0.4} strokeWidth={filled ? 2 : 1.5} />
            <rect x="16.5" y="5" width="3" height="4" rx="0.5" fill="currentColor" opacity={filled ? 1 : 0.08} />
            <rect x="16.5" y="5" width="3" height="4" rx="0.5" strokeWidth={filled ? 2 : 1.5} />
        </SvgTemplate>
    )
}

export function PlaybookOutlineIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `pbo-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("ring")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E5E7EB" />
                    <stop offset="40%" stopColor="#9CA3AF" />
                    <stop offset="80%" stopColor="#D1D5DB" />
                    <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>
                <linearGradient id={id("coverFill")} x1="16" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4B5563" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#1F2937" stopOpacity="0.18" />
                </linearGradient>
                <linearGradient id={id("labelFill")} x1="25" y1="16" x2="51" y2="34" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F9FAFB" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#D1D5DB" stopOpacity="0.1" />
                </linearGradient>
            </defs>

            {/* ===== WIRE RINGS — back half (behind the cover) ===== */}
            {[11, 19, 27, 35, 43, 51].map((cy) => (
                <path
                    key={`rb-${cy}`}
                    d={`M18 ${cy - 3} 
              C18 ${cy - 3} 8 ${cy - 3} 8 ${cy} 
              C8 ${cy + 3} 18 ${cy + 3} 18 ${cy + 3}`}
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                />
            ))}

            {/* ===== MAIN COVER ===== */}
            {/* Subtle fill for visibility */}
            <rect
                x="16" y="4" width="40" height="56" rx="4"
                fill={`url(#${id("coverFill")})`}
            />
            {/* Bold stroke outline */}
            <rect
                x="16" y="4" width="40" height="56" rx="4"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="2.4"
            />

            {/* Spine line — thick */}
            <line
                x1="22" y1="6" x2="22" y2="58"
                stroke="#9CA3AF"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            {/* ===== LABEL PLATE ===== */}
            {/* Subtle fill */}
            <rect
                x="25" y="16" width="26" height="18" rx="3"
                fill={`url(#${id("labelFill")})`}
            />
            {/* Bold stroke */}
            <rect
                x="25" y="16" width="26" height="18" rx="3"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="1.8"
            />

            {/* ===== "PLAYBOOK" TEXT ===== */}
            <text
                x="38"
                y="24"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Georgia', 'Times New Roman', serif"
                fontSize="5.2"
                fontWeight="bold"
                letterSpacing="1.2"
                fill="#111827"
                stroke="#111827"
                strokeWidth="0.3"
            >
                PLAY
            </text>
            <text
                x="38"
                y="29.5"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Georgia', 'Times New Roman', serif"
                fontSize="5.2"
                fontWeight="bold"
                letterSpacing="1.2"
                fill="#111827"
                stroke="#111827"
                strokeWidth="0.3"
            >
                BOOK
            </text>

            {/* Decorative lines in label */}
            <line x1="28" y1="20.5" x2="48" y2="20.5" stroke="#9CA3AF" strokeWidth="0.8" />
            <line x1="28" y1="32.5" x2="48" y2="32.5" stroke="#9CA3AF" strokeWidth="0.8" />

            {/* ===== WIRE RINGS — front half (over the cover) ===== */}
            {[11, 19, 27, 35, 43, 51].map((cy) => (
                <path
                    key={`rf-${cy}`}
                    d={`M18 ${cy - 3}
              C18 ${cy - 5.5} 13 ${cy - 5.5} 13 ${cy}
              C13 ${cy + 5.5} 18 ${cy + 5.5} 18 ${cy + 3}`}
                    fill="none"
                    stroke={`url(#${id("ring")})`}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                />
            ))}

            {/* ===== RING HOLES — filled dots for visibility ===== */}
            {[11, 19, 27, 35, 43, 51].map((cy) => (
                <g key={`hole-${cy}`}>
                    <circle cx="18" cy={cy - 3} r="1.4" fill="#6B7280" stroke="#9CA3AF" strokeWidth="0.6" />
                    <circle cx="18" cy={cy + 3} r="1.4" fill="#6B7280" stroke="#9CA3AF" strokeWidth="0.6" />
                </g>
            ))}
        </svg>
    );
}

export function PlaybookIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `pb-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                {/* Cover gradient */}
                <linearGradient id={id("cover")} x1="16" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>

                {/* Spine darkening */}
                <linearGradient id={id("spine")} x1="16" y1="32" x2="24" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#111827" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#111827" stopOpacity="0" />
                </linearGradient>

                {/* Cover sheen */}
                <radialGradient id={id("sheen")} cx="0.35" cy="0.3" r="0.65" fx="0.3" fy="0.25">
                    <stop offset="0%" stopColor="white" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>

                {/* Label gradient */}
                <linearGradient id={id("label")} x1="26" y1="18" x2="52" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F9FAFB" />
                    <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>

                {/* Ring gradient */}
                <linearGradient id={id("ring")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D1D5DB" />
                    <stop offset="35%" stopColor="#9CA3AF" />
                    <stop offset="70%" stopColor="#E5E7EB" />
                    <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>

                {/* Clip for spine darkening */}
                <clipPath id={id("coverClip")}>
                    <rect x="16" y="4" width="40" height="56" rx="4" />
                </clipPath>
            </defs>

            <g>

                {/* ===== WIRE RINGS — back half (behind the cover) ===== */}
                {[11, 19, 27, 35, 43, 51].map((cy) => (
                    <path
                        key={`rb-${cy}`}
                        d={`M18 ${cy - 3} 
                C18 ${cy - 3} 8 ${cy - 3} 8 ${cy} 
                C8 ${cy + 3} 18 ${cy + 3} 18 ${cy + 3}`}
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                ))}

                {/* ===== MAIN COVER (single unified shape) ===== */}
                <rect x="16" y="4" width="40" height="56" rx="4" fill={`url(#${id("cover")})`} />

                {/* Cover outline */}
                <rect x="16" y="4" width="40" height="56" rx="4" fill="none" stroke="#111827" strokeWidth="1" />

                {/* Spine darkening overlay */}
                <rect x="16" y="4" width="8" height="56" fill={`url(#${id("spine")})`} clipPath={`url(#${id("coverClip")})`} />

                {/* Spine edge line */}
                <line x1="22" y1="6" x2="22" y2="58" stroke="white" strokeWidth="0.4" strokeOpacity="0.08" />

                {/* ===== COVER SHEEN ===== */}
                <rect x="16" y="4" width="40" height="56" rx="4" fill={`url(#${id("sheen")})`} />

                {/* Left edge curved highlight */}
                <path
                    d="M20 58 C17 45 17 20 20 6"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.8"
                    strokeOpacity="0.07"
                />

                {/* ===== LABEL PLATE ===== */}
                <rect x="25" y="16" width="26" height="18" rx="3" fill={`url(#${id("label")})`} />
                <rect x="25" y="16" width="26" height="18" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="0.5" />
                {/* Label inner highlight */}
                <rect x="27" y="17.5" width="22" height="1.5" rx="0.75" fill="white" fillOpacity="0.6" />

                {/* ===== "PLAYBOOK" TEXT ===== */}
                {/* Shadow/deboss layer */}
                <text
                    x="38"
                    y="24.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'Georgia', 'Times New Roman', serif"
                    fontSize="5.2"
                    fontWeight="bold"
                    letterSpacing="1.2"
                    fill="#6B7280"
                    fillOpacity="0.5"
                >
                    PLAY
                </text>
                <text
                    x="38"
                    y="30"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'Georgia', 'Times New Roman', serif"
                    fontSize="5.2"
                    fontWeight="bold"
                    letterSpacing="1.2"
                    fill="#6B7280"
                    fillOpacity="0.5"
                >
                    BOOK
                </text>
                {/* Main text layer */}
                <text
                    x="38"
                    y="24"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'Georgia', 'Times New Roman', serif"
                    fontSize="5.2"
                    fontWeight="bold"
                    letterSpacing="1.2"
                    fill="#374151"
                >
                    PLAY
                </text>
                <text
                    x="38"
                    y="29.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'Georgia', 'Times New Roman', serif"
                    fontSize="5.2"
                    fontWeight="bold"
                    letterSpacing="1.2"
                    fill="#374151"
                >
                    BOOK
                </text>
                {/* Subtle decorative lines around text */}
                <line x1="28" y1="20.5" x2="48" y2="20.5" stroke="#9CA3AF" strokeWidth="0.4" strokeOpacity="0.5" />
                <line x1="28" y1="32.5" x2="48" y2="32.5" stroke="#9CA3AF" strokeWidth="0.4" strokeOpacity="0.5" />

                {/* ===== WIRE RINGS — front half (over the cover) ===== */}
                {[11, 19, 27, 35, 43, 51].map((cy) => (
                    <g key={`rf-${cy}`}>
                        {/* Ring front arc — comes out from cover holes */}
                        <path
                            d={`M18 ${cy - 3}
                  C18 ${cy - 5.5} 13 ${cy - 5.5} 13 ${cy}
                  C13 ${cy + 5.5} 18 ${cy + 5.5} 18 ${cy + 3}`}
                            fill="none"
                            stroke={`url(#${id("ring")})`}
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        {/* Ring highlight */}
                        <path
                            d={`M17.5 ${cy - 2.5}
                  C17.5 ${cy - 4.5} 14 ${cy - 4.5} 14 ${cy - 1}`}
                            fill="none"
                            stroke="white"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            strokeOpacity="0.55"
                        />
                    </g>
                ))}

                {/* ===== RING HOLES IN COVER ===== */}
                {[11, 19, 27, 35, 43, 51].map((cy) => (
                    <g key={`hole-${cy}`}>
                        <circle cx="18" cy={cy - 3} r="1.2" fill="#111827" fillOpacity="0.4" />
                        <circle cx="18" cy={cy + 3} r="1.2" fill="#111827" fillOpacity="0.4" />
                    </g>
                ))}

            </g>
        </svg>
    );
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
 * Win Rate — Bullseye / Target
 */
export function WinRateIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `wr-${name}-${uid}`;

    const cx = 31;
    const cy = 32;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("card")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("face")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("ring")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#D1D5DB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
                <linearGradient id={id("dart")} x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E5E7EB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
                <filter id={id("sh")} x="-8%" y="-4%" width="120%" height="116%">
                    <feDropShadow dx="0.6" dy="1.2" stdDeviation="1" floodColor="#000" floodOpacity="0.35" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                {/* 3D bottom edge */}
                <rect x="6" y="5" width="52" height="56" rx="5" fill="#111827" />
                {/* Main card */}
                <rect x="5" y="3" width="52" height="56" rx="5" fill={`url(#${id("card")})`} stroke="#111827" strokeWidth="0.8" />
                {/* Inner face */}
                <rect x="9" y="7" width="44" height="48" rx="3" fill={`url(#${id("face")})`} />

                {/* Sheen */}
                <path d="M10 3 L52 3 Q57 3 57 8 L57 10 Q40 14 10 8 Z" fill="white" fillOpacity="0.06" />

                {/* Outer ring */}
                <circle cx={cx} cy={cy} r="17" stroke="#4B5563" strokeWidth="2.5" fill="none" />
                {/* Middle ring */}
                <circle cx={cx} cy={cy} r="11" stroke={`url(#${id("ring")})`} strokeWidth="2.5" fill="none" />
                {/* Inner ring */}
                <circle cx={cx} cy={cy} r="5" stroke="#9CA3AF" strokeWidth="2.5" fill="none" />

                {/* Bullseye center dot */}
                <circle cx={cx} cy={cy} r="2" fill="#D1D5DB" />

                {/* === DART — much bolder === */}
                {/* Dart shaft — thick and clear */}
                <line x1={cx + 1} y1={cy - 1} x2="46" y2="14" stroke={`url(#${id("dart")})`} strokeWidth="2.8" strokeLinecap="round" />

                {/* Dart tip — bright triangle pointing into center */}
                <polygon points={`${cx},${cy} ${cx + 4},${cy - 5} ${cx + 5},${cy - 3}`} fill="#F3F4F6" />

                {/* Dart flights — two big bold fins at the tail */}
                {/* Top-left fin */}
                <polygon points="44,16 49,10 46,12" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.4" />
                {/* Bottom-right fin */}
                <polygon points="44,16 51,15 47,12" fill="#9CA3AF" stroke="#6B7280" strokeWidth="0.4" />
                {/* Third fin for volume */}
                <polygon points="45,15 50,11 50,15" fill="#B0B7C0" stroke="#9CA3AF" strokeWidth="0.3" />

                {/* Bright impact dot at bullseye */}
                <circle cx={cx} cy={cy} r="1.3" fill="#F9FAFB" />
            </g>
        </svg>
    );
}

/**
 * Avg Return — Average profit per trade
 */
export function AvgReturnIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `ar-${name}-${uid}`;

    // Geometry — circular arrow wraps clockwise around the coin
    const cx = 31, cy = 31, r = 19;
    const toRad = (d: number) => (d * Math.PI) / 180;

    // Arc: starts at ~2 o'clock (−55°), ends at ~10 o'clock (−135°)
    // Sweeps clockwise the long way (~280°)
    const startAng = -55;
    const endAng = -135;

    const sx = cx + r * Math.cos(toRad(startAng));
    const sy = cy + r * Math.sin(toRad(startAng));
    const ex = cx + r * Math.cos(toRad(endAng));
    const ey = cy + r * Math.sin(toRad(endAng));

    // Clockwise tangent at angle θ: (−sin θ, cos θ)
    const ea = toRad(endAng);
    const tdx = -Math.sin(ea);
    const tdy = Math.cos(ea);

    // Arrowhead dimensions
    const tipLen = 7;
    const wingBack = 5;
    const wingSpread = 5;
    const notchBack = 2;

    // Tip — ahead in tangent direction
    const tipX = ex + tdx * tipLen;
    const tipY = ey + tdy * tipLen;

    // Wing base center — behind endpoint
    const bx = ex - tdx * wingBack;
    const by = ey - tdy * wingBack;

    // Perpendicular: rotate tangent 90° CW → (tdy, −tdx)
    const w1x = bx + tdy * wingSpread;
    const w1y = by - tdx * wingSpread;
    const w2x = bx - tdy * wingSpread;
    const w2y = by + tdx * wingSpread;

    // Notch (chevron indent)
    const nx = ex - tdx * notchBack;
    const ny = ey - tdy * notchBack;

    const f = (n: number) => n.toFixed(1);

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("card")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("face")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("coin")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D1D5DB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
                <linearGradient id={id("arrow")} x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>
            </defs>

            <g>
                {/* 3D bottom edge */}
                <rect x="6" y="5" width="52" height="56" rx="5" fill="#111827" />
                {/* Main card */}
                <rect x="5" y="3" width="52" height="56" rx="5" fill={`url(#${id("card")})`} stroke="#111827" strokeWidth="0.8" />
                {/* Inner face */}
                <rect x="9" y="7" width="44" height="48" rx="3" fill={`url(#${id("face")})`} />
                {/* Sheen */}
                <path d="M10 3 L52 3 Q57 3 57 8 L57 10 Q40 14 10 8 Z" fill="white" fillOpacity="0.06" />

                {/* === COIN === */}
                <ellipse cx="31" cy="33" rx="10" ry="10" fill="#4B5563" />
                <ellipse cx="31" cy="31" rx="10" ry="10" fill={`url(#${id("coin")})`} />
                <ellipse cx="31" cy="31" rx="7.5" ry="7.5" fill="none" stroke="#6B7280" strokeWidth="1.2" />
                <text
                    x="31" y="35.5"
                    textAnchor="middle"
                    fontFamily="Georgia, serif"
                    fontSize="13"
                    fill="#4B5563"
                >
                    $
                </text>

                {/* === CIRCULAR RETURN ARROW === */}

                {/* Bold arc — ~280° clockwise sweep, gap at upper-left */}
                <path
                    d={`M${f(sx)},${f(sy)} A${r},${r} 0 1,1 ${f(ex)},${f(ey)}`}
                    fill="none"
                    stroke={`url(#${id("arrow")})`}
                    strokeWidth="5"
                    strokeLinecap="round"
                />

                {/* Arrowhead — large chevron, tangent to arc end */}
                <polygon
                    points={`${f(tipX)},${f(tipY)} ${f(w1x)},${f(w1y)} ${f(nx)},${f(ny)} ${f(w2x)},${f(w2y)}`}
                    fill="#E5E7EB"
                    stroke="#D1D5DB"
                    strokeWidth="0.5"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
}

/**
 * Profit Factor — Ratio of gross profit to gross loss
 */
export function ProfitFactorIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `pf-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("card")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("face")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("pan")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D1D5DB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
                <filter id={id("sh")} x="-8%" y="-4%" width="120%" height="116%">
                    <feDropShadow dx="0.6" dy="1.2" stdDeviation="1" floodColor="#000" floodOpacity="0.35" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>


                {/* === SCALE === */}

                {/* Center post */}
                <rect x="29" y="16" width="4" height="32" rx="1.2" fill="#6B7280" />

                {/* Base platform */}
                <path d="M22,48 L40,48 L38,46 L24,46 Z" fill="#9CA3AF" />
                <rect x="24" y="46" width="14" height="2.5" rx="1" fill="#6B7280" />

                {/* Pivot triangle at top */}
                <polygon points="31,14 27.5,19 34.5,19" fill="#D1D5DB" />

                {/* Beam — tilted: left side (profit) lower = heavier */}
                <line x1="12" y1="24" x2="50" y2="18" stroke="#D1D5DB" strokeWidth="2.8" strokeLinecap="round" />

                {/* === LEFT PAN (heavier — profit) === */}
                {/* Left chains */}
                <line x1="14" y1="24.5" x2="14" y2="32" stroke="#9CA3AF" strokeWidth="1.5" />
                <line x1="24" y1="22.5" x2="24" y2="30" stroke="#9CA3AF" strokeWidth="1.5" />

                {/* Left pan bowl */}
                <path d="M10,32 C10,32 11,38 19,38 C27,38 28,32 28,32 Z" fill={`url(#${id("pan")})`} stroke="#9CA3AF" strokeWidth="0.6" />
                {/* Left pan rim */}
                <ellipse cx="19" cy="32" rx="9" ry="1.8" fill="#D1D5DB" />

                {/* Coins stacked in left pan */}
                <ellipse cx="19" cy="31" rx="5" ry="1.5" fill="#9CA3AF" />
                <ellipse cx="19" cy="29.5" rx="5" ry="1.5" fill="#B0B7C0" />
                <ellipse cx="19" cy="28" rx="5" ry="1.5" fill="#D1D5DB" />

                {/* === RIGHT PAN (lighter — loss) === */}
                {/* Right chains */}
                <line x1="38" y1="17" x2="38" y2="24" stroke="#9CA3AF" strokeWidth="1.5" />
                <line x1="48" y1="18.5" x2="48" y2="26" stroke="#9CA3AF" strokeWidth="1.5" />

                {/* Right pan bowl */}
                <path d="M34,26 C34,26 35,31 43,31 C51,31 52,26 52,26 Z" fill="#4B5563" stroke="#6B7280" strokeWidth="0.6" />
                {/* Right pan rim */}
                <ellipse cx="43" cy="26" rx="9" ry="1.8" fill="#6B7280" />

                {/* Single small coin in right pan */}
                <ellipse cx="43" cy="25" rx="3.5" ry="1.2" fill="#4B5563" stroke="#6B7280" strokeWidth="0.5" />
            </g>
        </svg>
    );
}



export function EquityCurveIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `ec-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("card")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("face")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("line")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>
                <linearGradient id={id("fill")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.02" />
                </linearGradient>
                <filter id={id("sh")} x="-8%" y="-4%" width="120%" height="116%">
                    <feDropShadow dx="0.6" dy="1.2" stdDeviation="1" floodColor="#000" floodOpacity="0.35" />
                </filter>
                <filter id={id("glow")}>
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>


                {/* === CHART AREA === */}

                {/* Subtle grid lines */}
                <line x1="14" y1="18" x2="48" y2="18" stroke="#4B5563" strokeWidth="0.5" strokeOpacity="0.5" />
                <line x1="14" y1="27" x2="48" y2="27" stroke="#4B5563" strokeWidth="0.5" strokeOpacity="0.5" />
                <line x1="14" y1="36" x2="48" y2="36" stroke="#4B5563" strokeWidth="0.5" strokeOpacity="0.5" />
                <line x1="14" y1="45" x2="48" y2="45" stroke="#4B5563" strokeWidth="0.5" strokeOpacity="0.5" />

                {/* Y axis */}
                <line x1="14" y1="12" x2="14" y2="48" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" />
                {/* X axis */}
                <line x1="14" y1="48" x2="50" y2="48" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" />

                {/* Area fill under the equity curve */}
                <path
                    d="M14,43 C17,42 19,40 21,38 C23,36 24,37 26,35 C28,33 29,30 31,28 C33,26 34,27 36,24 C38,21 39,22 41,19 C43,16 45,15 48,13 L48,48 L14,48 Z"
                    fill={`url(#${id("fill")})`}
                />

                {/* Equity curve line — smooth upward trend with realistic dips */}
                <path
                    d="M14,43 C17,42 19,40 21,38 C23,36 24,37 26,35 C28,33 29,30 31,28 C33,26 34,27 36,24 C38,21 39,22 41,19 C43,16 45,15 48,13"
                    stroke={`url(#${id("line")})`}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    filter={`url(#${id("glow")})`}
                />

                {/* End dot — current equity point */}
                <circle cx="48" cy="13" r="2.2" fill="#D1D5DB" />
                <circle cx="48" cy="13" r="1" fill="#F9FAFB" />
            </g>
        </svg>
    );
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

export function WinIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `win-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("card")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("face")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>

                {/* Arrow green gradient */}
                <linearGradient id={id("arrow")} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#86EFAC" />
                </linearGradient>
                <linearGradient id={id("arrowEdge")} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#15803D" />
                    <stop offset="100%" stopColor="#16A34A" />
                </linearGradient>
            </defs>

            <g>
                {/* 3D bottom edge */}
                <rect x="6" y="5" width="52" height="56" rx="5" fill="#111827" />
                {/* Main card */}
                <rect x="5" y="3" width="52" height="56" rx="5" fill={`url(#${id("card")})`} stroke="#111827" strokeWidth="0.8" />
                {/* Inner face */}
                <rect x="9" y="7" width="44" height="48" rx="3" fill={`url(#${id("face")})`} />
                {/* Sheen */}
                <path d="M10 3 L52 3 Q57 3 57 8 L57 10 Q40 14 10 8 Z" fill="white" fillOpacity="0.06" />

                {/* ============ BOLD UPWARD ARROW ============ */}

                {/* 3D depth edge */}
                <polygon
                    points="31,11 44,29 37,29 37,50 27,50 27,29 20,29"
                    fill={`url(#${id("arrowEdge")})`}
                    transform="translate(1.2, 1.5)"
                />

                {/* Main arrow */}
                <polygon
                    points="31,11 44,29 37,29 37,50 25,50 25,29 18,29"
                    fill={`url(#${id("arrow")})`}
                />

                {/* Top highlight sheen */}
                <polygon
                    points="31,13 40,27 35,27 31,13 27,27 22,27"
                    fill="white"
                    fillOpacity="0.2"
                />

                {/* "W" label */}
                <text
                    x="31"
                    y="45"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#0A3D2A"
                    fontFamily="system-ui, sans-serif"
                    opacity="0.6"
                >
                    W
                </text>
            </g>
        </svg>
    );
}

export function RRRatioIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `rr-${name}-${uid}`;

    // Two side-by-side bars: short risk (1R) and tall reward (2R)
    // Bottom-aligned on the card face

    // Bar geometry
    const barW = 13;        // width of each bar
    const gap = 8;          // gap between bars
    const totalW = barW * 2 + gap;  // 34px
    const faceX = 9;
    const faceW = 44;
    const startX = faceX + (faceW - totalW) / 2;  // centered = 14

    const riskX = startX;
    const rewardX = startX + barW + gap;

    const barBottom = 50;   // bottom edge of both bars
    const riskH = 13;       // risk bar height (1R)
    const rewardH = 26;     // reward bar height (2R — exactly 2× risk)

    const riskY = barBottom - riskH;     // 37
    const rewardY = barBottom - rewardH; // 24

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                {/* Card shell */}
                <linearGradient id={id("card")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("face")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>

                {/* Risk bar — muted red */}
                <linearGradient id={id("risk")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C87A7A" />
                    <stop offset="100%" stopColor="#8B4547" />
                </linearGradient>
                <linearGradient id={id("riskEdge")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A3335" />
                    <stop offset="100%" stopColor="#5C2425" />
                </linearGradient>

                {/* Reward bar — vibrant green */}
                <linearGradient id={id("reward")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6EE7B7" />
                    <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
                <linearGradient id={id("rewardEdge")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#27A87A" />
                    <stop offset="100%" stopColor="#1A7A56" />
                </linearGradient>
            </defs>

            <g>
                {/* 3D bottom edge */}
                <rect x="6" y="5" width="52" height="56" rx="5" fill="#111827" />
                {/* Main card */}
                <rect x="5" y="3" width="52" height="56" rx="5" fill={`url(#${id("card")})`} stroke="#111827" strokeWidth="0.8" />
                {/* Inner face */}
                <rect x="9" y="7" width="44" height="48" rx="3" fill={`url(#${id("face")})`} />
                {/* Sheen */}
                <path d="M10 3 L52 3 Q57 3 57 8 L57 10 Q40 14 10 8 Z" fill="white" fillOpacity="0.06" />

                {/* ============ RISK BAR (short, muted red) ============ */}

                {/* 3D right/bottom edge */}
                <rect
                    x={riskX + 1.5} y={riskY + 1.5}
                    width={barW} height={riskH}
                    rx="2" fill={`url(#${id("riskEdge")})`}
                />
                {/* Main face */}
                <rect
                    x={riskX} y={riskY}
                    width={barW} height={riskH}
                    rx="2" fill={`url(#${id("risk")})`}
                />
                {/* Top highlight */}
                <rect
                    x={riskX + 1.5} y={riskY + 1}
                    width={barW - 3} height="2.5"
                    rx="1" fill="white" fillOpacity="0.18"
                />

                {/* ============ REWARD BAR (tall, vibrant green) ============ */}

                {/* 3D right/bottom edge */}
                <rect
                    x={rewardX + 1.5} y={rewardY + 1.5}
                    width={barW} height={rewardH}
                    rx="2" fill={`url(#${id("rewardEdge")})`}
                />
                {/* Main face */}
                <rect
                    x={rewardX} y={rewardY}
                    width={barW} height={rewardH}
                    rx="2" fill={`url(#${id("reward")})`}
                />
                {/* Top highlight */}
                <rect
                    x={rewardX + 1.5} y={rewardY + 1}
                    width={barW - 3} height="3"
                    rx="1" fill="white" fillOpacity="0.22"
                />

                {/* ============ LABELS ============ */}

                {/* "1R" on risk bar */}
                <text
                    x={riskX + barW / 2}
                    y={riskY + riskH / 2 + 3}
                    textAnchor="middle"
                    fontSize="6.5"
                    fill="#2D0E0F"
                    fontFamily="system-ui, sans-serif"
                    opacity="0.7"
                >
                    1
                </text>

                {/* "2R" on reward bar */}
                <text
                    x={rewardX + barW / 2}
                    y={rewardY + rewardH / 2 + 3}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#0A3D2A"
                    fontFamily="system-ui, sans-serif"
                    opacity="0.7"
                >
                    2
                </text>

                {/* Ratio label "R" below, centered */}
                <text
                    x={faceX + faceW / 2}
                    y={14}
                    textAnchor="middle"
                    fontSize="7"
                    fill="#9CA3AF"
                    fontFamily="system-ui, sans-serif"
                >
                    R:R
                </text>
            </g>
        </svg>
    );
}

export function PnLIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `pnl-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("card")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("face")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("up")} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
                <linearGradient id={id("down")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6B7280" />
                    <stop offset="100%" stopColor="#4B5563" />
                </linearGradient>
            </defs>

            <g>
                {/* 3D bottom edge */}
                <rect x="6" y="5" width="52" height="56" rx="5" fill="#111827" />
                {/* Main card */}
                <rect x="5" y="3" width="52" height="56" rx="5" fill={`url(#${id("card")})`} stroke="#111827" strokeWidth="0.8" />
                {/* Inner face */}
                <rect x="9" y="7" width="44" height="48" rx="3" fill={`url(#${id("face")})`} />

                {/* Sheen */}
                <path d="M10 3 L52 3 Q57 3 57 8 L57 10 Q40 14 10 8 Z" fill="white" fillOpacity="0.06" />

                {/* Baseline */}
                <line x1="13" y1="35" x2="49" y2="35" stroke="#6B7280" strokeWidth="0.8" />

                {/* Profit bars */}
                <rect x="15" y="19" width="7" height="16" rx="1.5" fill={`url(#${id("up")})`} />
                <rect x="25" y="25" width="7" height="10" rx="1.5" fill={`url(#${id("up")})`} />

                {/* Loss bars */}
                <rect x="35" y="35" width="7" height="7" rx="1.5" fill={`url(#${id("down")})`} />
                <rect x="45" y="35" width="7" height="12" rx="1.5" fill={`url(#${id("down")})`} />
            </g>
        </svg>
    );
}

export function LossIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `loss-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("card")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("face")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>

                {/* Arrow red gradient */}
                <linearGradient id={id("arrow")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FCA5A5" />
                    <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
                <linearGradient id={id("arrowEdge")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B91C1C" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                </linearGradient>
            </defs>

            <g>
                {/* 3D bottom edge */}
                <rect x="6" y="5" width="52" height="56" rx="5" fill="#111827" />
                {/* Main card */}
                <rect x="5" y="3" width="52" height="56" rx="5" fill={`url(#${id("card")})`} stroke="#111827" strokeWidth="0.8" />
                {/* Inner face */}
                <rect x="9" y="7" width="44" height="48" rx="3" fill={`url(#${id("face")})`} />
                {/* Sheen */}
                <path d="M10 3 L52 3 Q57 3 57 8 L57 10 Q40 14 10 8 Z" fill="white" fillOpacity="0.06" />

                {/* ============ BOLD DOWNWARD ARROW ============ */}

                {/* 3D depth edge */}
                <polygon
                    points="31,51 44,33 37,33 37,12 27,12 27,33 20,33"
                    fill={`url(#${id("arrowEdge")})`}
                    transform="translate(1.2, 1.5)"
                />

                {/* Main arrow — pointing down */}
                <polygon
                    points="31,51 44,33 37,33 37,12 25,12 25,33 18,33"
                    fill={`url(#${id("arrow")})`}
                />

                {/* Top highlight sheen on shaft */}
                <rect
                    x="26.5" y="13"
                    width="9" height="3"
                    rx="1" fill="white" fillOpacity="0.2"
                />

                {/* "L" label */}
                <text
                    x="31"
                    y="26"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#4C0519"
                    fontFamily="system-ui, sans-serif"
                    opacity="0.55"
                >
                    L
                </text>
            </g>
        </svg>
    );
}

export function BreakevenIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `be-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("card")} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>
                <linearGradient id={id("face")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>

                {/* Arrow neutral gray gradient */}
                <linearGradient id={id("arrow")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
                <linearGradient id={id("arrowEdge")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>
            </defs>

            <g>
                {/* 3D bottom edge */}
                <rect x="6" y="5" width="52" height="56" rx="5" fill="#111827" />
                {/* Main card */}
                <rect x="5" y="3" width="52" height="56" rx="5" fill={`url(#${id("card")})`} stroke="#111827" strokeWidth="0.8" />
                {/* Inner face */}
                <rect x="9" y="7" width="44" height="48" rx="3" fill={`url(#${id("face")})`} />
                {/* Sheen */}
                <path d="M10 3 L52 3 Q57 3 57 8 L57 10 Q40 14 10 8 Z" fill="white" fillOpacity="0.06" />

                {/* ============ BOLD HORIZONTAL RIGHT ARROW ============ */}

                {/* 3D depth edge */}
                <polygon
                    points="50,31 36,20 36,25 13,25 13,37 36,37 36,42"
                    fill={`url(#${id("arrowEdge")})`}
                    transform="translate(1.2, 1.5)"
                />

                {/* Main arrow — pointing right (flat / breakeven) */}
                <polygon
                    points="50,31 36,20 36,25 12,25 12,37 36,37 36,42"
                    fill={`url(#${id("arrow")})`}
                />

                {/* Top highlight sheen on shaft */}
                <rect
                    x="14" y="26"
                    width="20" height="2.5"
                    rx="1" fill="white" fillOpacity="0.18"
                />

                {/* Highlight on arrowhead */}
                <polygon
                    points="47,31 38,23 38,26.5 47,31"
                    fill="white"
                    fillOpacity="0.15"
                />

                {/* "BE" label */}
                <text
                    x="24"
                    y="34"
                    textAnchor="middle"
                    fontSize="6.5"
                    fill="#1F2937"
                    fontFamily="system-ui, sans-serif"
                    opacity="0.5"
                >
                    BE
                </text>
            </g>
        </svg>
    );
}

export function StorageIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
    const uid = useId();
    const id = (name: string) => `st-${name}-${uid}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={id("body")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="35%" stopColor="#6B7280" />
                    <stop offset="65%" stopColor="#6B7280" />
                    <stop offset="100%" stopColor="#374151" />
                </linearGradient>
                <linearGradient id={id("top")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>
                <linearGradient id={id("disc")} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#808993" />
                    <stop offset="100%" stopColor="#555e6b" />
                </linearGradient>
                <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="25%" stopColor="white" stopOpacity="0.14" />
                    <stop offset="45%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <filter id={id("sh")} x="-15%" y="-8%" width="135%" height="130%">
                    <feDropShadow dx="0.5" dy="1.2" stdDeviation="1" floodColor="#000" floodOpacity="0.35" />
                </filter>
            </defs>

            <g filter={`url(#${id("sh")})`}>
                {/* ===== 3D DROP SHADOW OFFSET ===== */}
                <path
                    d="M17,12 L17,51 A16,5.5 0 0,0 49,51 L49,12"
                    fill="#111827"
                />

                {/* ===== FULL CYLINDER BODY ===== */}
                <path
                    d="M16,12 L16,50 A16,5.5 0 0,0 48,50 L48,12"
                    fill={`url(#${id("body")})`}
                />

                {/* ===== BOTTOM ELLIPSE (visible base) ===== */}
                <ellipse cx="32" cy="50" rx="16" ry="5.5" fill="#374151" stroke="#1F2937" strokeWidth="0.5" />

                {/* ===== LOWER TIER DISC at y=38 ===== */}
                {/* Shadow below disc */}
                <ellipse cx="32" cy="39" rx="16" ry="4.5" fill="#1F2937" fillOpacity="0.25" />
                {/* Disc face */}
                <ellipse cx="32" cy="38" rx="16" ry="5" fill={`url(#${id("disc")})`} />
                <ellipse cx="32" cy="38" rx="16" ry="5" fill="none" stroke="#374151" strokeWidth="0.7" />
                {/* Subtle highlight */}
                <ellipse cx="32" cy="37.5" rx="10" ry="2.8" fill="none" stroke="#9CA3AF" strokeWidth="0.35" strokeOpacity="0.4" />

                {/* ===== UPPER TIER DISC at y=25 ===== */}
                {/* Shadow below disc */}
                <ellipse cx="32" cy="26" rx="16" ry="4.5" fill="#1F2937" fillOpacity="0.25" />
                {/* Disc face */}
                <ellipse cx="32" cy="25" rx="16" ry="5" fill={`url(#${id("disc")})`} />
                <ellipse cx="32" cy="25" rx="16" ry="5" fill="none" stroke="#374151" strokeWidth="0.7" />
                {/* Subtle highlight */}
                <ellipse cx="32" cy="24.5" rx="10" ry="2.8" fill="none" stroke="#9CA3AF" strokeWidth="0.35" strokeOpacity="0.4" />

                {/* ===== TOP LID DISC at y=12 ===== */}
                <ellipse cx="32" cy="12" rx="16" ry="5.5" fill={`url(#${id("top")})`} />
                <ellipse cx="32" cy="12" rx="16" ry="5.5" fill="none" stroke="#374151" strokeWidth="0.8" />
                {/* Inner rings */}
                <ellipse cx="32" cy="12" rx="10.5" ry="3.5" fill="none" stroke="#4B5563" strokeWidth="0.8" />
                <ellipse cx="32" cy="11.5" rx="5.5" ry="1.8" fill="none" stroke="#D1D5DB" strokeWidth="0.4" strokeOpacity="0.4" />

                {/* ===== SHEEN ===== */}
                <path
                    d="M17,12 L17,50 A16,5.5 0 0,0 24,54 L24,17 A16,5.5 0 0,1 17,12 Z"
                    fill={`url(#${id("sheen")})`}
                />

                {/* ===== OUTER STROKE ===== */}
                <path
                    d="M16,12 L16,50 A16,5.5 0 0,0 48,50 L48,12"
                    fill="none"
                    stroke="#1F2937"
                    strokeWidth="1.1"
                />
                <ellipse cx="32" cy="12" rx="16" ry="5.5" fill="none" stroke="#1F2937" strokeWidth="1" />
            </g>
        </svg>
    );
}
