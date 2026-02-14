"use client"

import { cn } from "@/lib/utils"

interface IconProps {
  className?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// ABSTRACT TECH STYLE
// Thin 1px strokes, broken lines, dots at intersections
// ══════════════════════════════════════════════════════════════════════════════

// ── Dashboard: Pulse Grid ─────────────────────────────────────────────────────
// 4 small squares with a pulse line through the bottom-right
export function PulseGridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Top-left square */}
      <rect x="3" y="3" width="7" height="7" rx="1.5" strokeDasharray="4 2" />
      {/* Top-right square */}
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      {/* Bottom-left square */}
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      {/* Bottom-right square with pulse */}
      <rect x="14" y="14" width="7" height="7" rx="1.5" strokeDasharray="4 2" />
      {/* Pulse line cutting through */}
      <polyline points="14.5,18 16,18 17,15.5 18.5,19.5 19.5,17 20.5,18" strokeWidth="1.3" strokeDasharray="0" />
      {/* Intersection dots */}
      <circle cx="13" cy="13" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="11" cy="11" r="0.6" fill="currentColor" stroke="none" opacity="0.4" />
    </svg>
  )
}

// ── Add Trade: Entry Marker ───────────────────────────────────────────────────
// Candlestick with entry arrow
export function EntryMarkerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Candle body */}
      <rect x="10" y="7" width="4" height="8" rx="0.5" />
      {/* Wicks */}
      <line x1="12" y1="3" x2="12" y2="7" strokeDasharray="2 1.5" />
      <line x1="12" y1="15" x2="12" y2="20" strokeDasharray="2 1.5" />
      {/* Entry arrow pointing at candle body */}
      <polyline points="4,11 8.5,11" strokeWidth="1.3" />
      <polyline points="7,9 9,11 7,13" strokeWidth="1.3" />
      {/* Level dot */}
      <circle cx="18" cy="11" r="0.7" fill="currentColor" stroke="none" />
      <line x1="16" y1="11" x2="20" y2="11" strokeDasharray="1 2" opacity="0.4" />
    </svg>
  )
}

// ── All Trades: Trade Ledger ──────────────────────────────────────────────────
// Minimal horizontal lines with dots — a log, not a chart
export function TradeLedgerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Ledger lines */}
      <line x1="7" y1="6" x2="20" y2="6" />
      <line x1="7" y1="10.5" x2="18" y2="10.5" strokeDasharray="3 2" />
      <line x1="7" y1="15" x2="20" y2="15" />
      <line x1="7" y1="19.5" x2="16" y2="19.5" strokeDasharray="3 2" />
      {/* Left-side dots (entry markers) */}
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="10.5" r="1" fill="currentColor" stroke="none" opacity="0.5" />
      <circle cx="4" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="19.5" r="1" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  )
}

// ── Analytics: Signal Wave ────────────────────────────────────────────────────
// Abstracted EKG/waveform with varied peaks
export function SignalWaveIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Main waveform */}
      <polyline points="2,14 5,14 7,10 9,16 11,6 13,18 15,9 17,13 19,11 22,14" strokeWidth="1.3" />
      {/* Baseline */}
      <line x1="2" y1="20" x2="22" y2="20" opacity="0.2" strokeDasharray="2 2" />
      {/* Peak dots */}
      <circle cx="11" cy="6" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="0.6" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  )
}

// ── AI Coach: Neural Spark ────────────────────────────────────────────────────
// Brain outline with synapse dots radiating outward
export function NeuralSparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Simplified brain hemisphere */}
      <path d="M12,4 C8,4 5,6.5 5,10 C5,12.5 6,14 7.5,15 C7.5,17 8.5,19 12,20 C15.5,19 16.5,17 16.5,15 C18,14 19,12.5 19,10 C19,6.5 16,4 12,4Z" strokeDasharray="4 2" />
      {/* Center fold */}
      <path d="M12,6 L12,18" opacity="0.3" strokeDasharray="2 3" />
      {/* Synapse dots radiating */}
      <circle cx="3" cy="7" r="0.8" fill="currentColor" stroke="none" />
      <line x1="5" y1="8" x2="3.5" y2="7.3" opacity="0.4" strokeDasharray="1 1" />
      <circle cx="21" cy="8" r="0.8" fill="currentColor" stroke="none" />
      <line x1="19" y1="9" x2="20.5" y2="8.3" opacity="0.4" strokeDasharray="1 1" />
      <circle cx="4" cy="17" r="0.6" fill="currentColor" stroke="none" opacity="0.6" />
      <line x1="6.5" y1="15.5" x2="4.5" y2="16.8" opacity="0.3" strokeDasharray="1 1" />
      <circle cx="20" cy="16" r="0.6" fill="currentColor" stroke="none" opacity="0.6" />
      <line x1="17" y1="15" x2="19.5" y2="15.8" opacity="0.3" strokeDasharray="1 1" />
    </svg>
  )
}

// ── Backtesting: Time Rewind ──────────────────────────────────────────────────
// Candlestick chart with a circular rewind arrow
export function TimeRewindIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Mini candlesticks */}
      <line x1="14" y1="7" x2="14" y2="18" opacity="0.3" />
      <rect x="12.5" y="9" width="3" height="5" rx="0.5" />
      <line x1="19" y1="8" x2="19" y2="17" opacity="0.3" />
      <rect x="17.5" y="10" width="3" height="4" rx="0.5" strokeDasharray="3 2" />
      {/* Rewind arrow (circular, going backwards) */}
      <path d="M9,8 A6,6 0 1,0 9,16" strokeWidth="1.2" />
      <polyline points="9,4.5 9,8 5.5,8" strokeWidth="1.2" />
      {/* Time dot */}
      <circle cx="9" cy="16" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── AI Insights: Pattern Eye ──────────────────────────────────────────────────
// Eye shape with chart pattern as iris
export function PatternEyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Eye outline */}
      <path d="M2,12 C2,12 6,5 12,5 C18,5 22,12 22,12 C22,12 18,19 12,19 C6,19 2,12 2,12Z" strokeDasharray="5 2" />
      {/* Iris circle */}
      <circle cx="12" cy="12" r="3.5" strokeWidth="1" />
      {/* Chart pattern inside iris (W pattern / double bottom) */}
      <polyline points="9.5,13 10.5,11 11.5,13 12.5,10.5 14.5,13" strokeWidth="1.2" strokeDasharray="0" />
      {/* Catch-light dot */}
      <circle cx="10.5" cy="10.5" r="0.6" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  )
}

// ── Social: Trading Circle ────────────────────────────────────────────────────
// Two overlapping chart fragments
export function TradingCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Left circle */}
      <circle cx="9" cy="12" r="6" strokeDasharray="4 2" />
      {/* Right circle */}
      <circle cx="15" cy="12" r="6" strokeDasharray="4 2" />
      {/* Bullish line in left */}
      <polyline points="6,14 8,12 10,10" strokeWidth="1.3" />
      {/* Bearish line in right */}
      <polyline points="14,10 16,12 18,14" strokeWidth="1.3" />
      {/* Intersection dot */}
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── Psychology: Mind Mirror ───────────────────────────────────────────────────
// Head silhouette with a wave/reflection inside
export function MindMirrorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Head outline */}
      <path d="M12,3 C7.5,3 5,6 5,9.5 C5,12 6,13.5 7,14.5 L7,17 C7,18.5 8,20 10,20.5 L14,20.5 C16,20 17,18.5 17,17 L17,14.5 C18,13.5 19,12 19,9.5 C19,6 16.5,3 12,3Z" strokeDasharray="5 2" />
      {/* Inner wave (introspection/emotion) */}
      <path d="M8.5,10 C9.5,8.5 10.5,11 12,9.5 C13.5,8 14.5,11 15.5,10" strokeWidth="1.3" />
      {/* Reflection dots */}
      <circle cx="10" cy="14" r="0.6" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="12" cy="15" r="0.6" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="14" cy="14" r="0.6" fill="currentColor" stroke="none" opacity="0.4" />
    </svg>
  )
}

// ── Guides: Compass ───────────────────────────────────────────────────────────
// Abstract compass rose with single needle
export function CompassIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Outer ring */}
      <circle cx="12" cy="12" r="9" strokeDasharray="4 3" />
      {/* Cross hairs */}
      <line x1="12" y1="3" x2="12" y2="6" opacity="0.4" />
      <line x1="12" y1="18" x2="12" y2="21" opacity="0.4" />
      <line x1="3" y1="12" x2="6" y2="12" opacity="0.4" />
      <line x1="18" y1="12" x2="21" y2="12" opacity="0.4" />
      {/* Needle (north) */}
      <polygon points="12,5.5 10.5,12 12,11 13.5,12" fill="currentColor" stroke="none" opacity="0.7" />
      {/* Needle (south) */}
      <polygon points="12,18.5 10.5,12 12,13 13.5,12" fill="currentColor" stroke="none" opacity="0.25" />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── Settings: Tuning Forks ────────────────────────────────────────────────────
// Vertical sliders at different heights
export function TuningForksIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Track lines */}
      <line x1="6" y1="4" x2="6" y2="20" opacity="0.25" strokeDasharray="2 2" />
      <line x1="12" y1="4" x2="12" y2="20" opacity="0.25" strokeDasharray="2 2" />
      <line x1="18" y1="4" x2="18" y2="20" opacity="0.25" strokeDasharray="2 2" />
      {/* Slider handles */}
      <rect x="4" y="8" width="4" height="3" rx="1.5" fill="currentColor" stroke="none" opacity="0.8" />
      <rect x="10" y="13" width="4" height="3" rx="1.5" fill="currentColor" stroke="none" opacity="0.8" />
      <rect x="16" y="6" width="4" height="3" rx="1.5" fill="currentColor" stroke="none" opacity="0.8" />
      {/* Active dots */}
      <circle cx="6" cy="9.5" r="0.6" fill="white" stroke="none" />
      <circle cx="12" cy="14.5" r="0.6" fill="white" stroke="none" />
      <circle cx="18" cy="7.5" r="0.6" fill="white" stroke="none" />
    </svg>
  )
}

// ── Playbook: Strategy Blueprint ──────────────────────────────────────────────
// Open book with chart pattern on right page
export function StrategyBlueprintIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Book spine */}
      <path d="M12,4 L12,20" opacity="0.3" />
      {/* Left page */}
      <path d="M12,4 C10,4 4,4.5 3,5 L3,19 C4,18.5 10,18 12,18" />
      {/* Right page */}
      <path d="M12,4 C14,4 20,4.5 21,5 L21,19 C20,18.5 14,18 12,18" />
      {/* Text lines on left page */}
      <line x1="5.5" y1="8" x2="9.5" y2="8" opacity="0.3" strokeDasharray="2 1.5" />
      <line x1="5.5" y1="10.5" x2="9" y2="10.5" opacity="0.3" strokeDasharray="2 1.5" />
      <line x1="5.5" y1="13" x2="8.5" y2="13" opacity="0.3" strokeDasharray="2 1.5" />
      {/* Chart pattern on right page */}
      <polyline points="14,14 15.5,10 17,13 18.5,8 19.5,11" strokeWidth="1.3" />
      {/* Dot at peak */}
      <circle cx="18.5" cy="8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── Import/Sync: Sync Arrows ──────────────────────────────────────────────────
// Two circular arrows in a sync pattern
export function SyncArrowsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Top arc */}
      <path d="M16,6 A7,7 0 0,0 5,10" strokeDasharray="4 2" />
      <polyline points="16,3 16,6.5 12.5,6.5" strokeWidth="1.2" />
      {/* Bottom arc */}
      <path d="M8,18 A7,7 0 0,0 19,14" strokeDasharray="4 2" />
      <polyline points="8,21 8,17.5 11.5,17.5" strokeWidth="1.2" />
      {/* Center data dot */}
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  )
}

// ── Dashboard Layout Icon (for navbar) ────────────────────────────────────────
// Same as PulseGrid but exported separately for navbar usage
export { PulseGridIcon as DashboardIcon }

// ── Backtesting Alt for navbar ────────────────────────────────────────────────
export { TimeRewindIcon as BacktestIcon }

// ── Psychology Alt for navbar ─────────────────────────────────────────────────
export { MindMirrorIcon as PsychologyIcon }
