"use client"

import { cn } from "@/lib/utils"

interface IconProps {
  className?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// ABSTRACT TECH STYLE — BOLD VARIANT
// 1.8px strokes, stronger fills, higher contrast
// ══════════════════════════════════════════════════════════════════════════════

// ── Dashboard: Pulse Grid ─────────────────────────────────────────────────────
export function PulseGridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" strokeDasharray="4 2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" strokeDasharray="4 2" />
      <polyline points="14.5,18 16,18 17,15.5 18.5,19.5 19.5,17 20.5,18" strokeWidth="1.8" />
      <circle cx="13" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── Add Trade: Entry Marker ───────────────────────────────────────────────────
export function EntryMarkerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="6" width="4" height="9" rx="0.5" />
      <line x1="12" y1="3" x2="12" y2="6" strokeDasharray="2 1.5" />
      <line x1="12" y1="15" x2="12" y2="21" strokeDasharray="2 1.5" />
      <line x1="3.5" y1="11" x2="8.5" y2="11" strokeWidth="1.8" />
      <polyline points="6.5,8.5 9,11 6.5,13.5" strokeWidth="1.8" />
      <circle cx="18" cy="11" r="1" fill="currentColor" stroke="none" />
      <line x1="15.5" y1="11" x2="20.5" y2="11" strokeDasharray="1.5 2" opacity="0.5" />
    </svg>
  )
}

// ── All Trades: Trade Ledger ──────────────────────────────────────────────────
export function TradeLedgerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="20" y2="6" />
      <line x1="8" y1="10.5" x2="18" y2="10.5" strokeDasharray="3 2" />
      <line x1="8" y1="15" x2="20" y2="15" />
      <line x1="8" y1="19.5" x2="16" y2="19.5" strokeDasharray="3 2" />
      <circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="10.5" r="1.3" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="4.5" cy="15" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="19.5" r="1.3" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  )
}

// ── Analytics: Signal Wave ────────────────────────────────────────────────────
export function SignalWaveIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,14 5,14 7,10 9,16 11,5 13,19 15,9 17,13 19,11 22,14" strokeWidth="1.8" />
      <line x1="2" y1="20" x2="22" y2="20" opacity="0.3" strokeDasharray="2 2" />
      <circle cx="11" cy="5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="0.8" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  )
}

// ── AI Coach: Neural Spark ────────────────────────────────────────────────────
export function NeuralSparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12,4 C8,4 5,6.5 5,10 C5,12.5 6,14 7.5,15 C7.5,17 8.5,19 12,20 C15.5,19 16.5,17 16.5,15 C18,14 19,12.5 19,10 C19,6.5 16,4 12,4Z" strokeDasharray="4 2" />
      <path d="M12,6 L12,18" opacity="0.4" strokeDasharray="2 3" />
      <circle cx="3" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <line x1="5" y1="8.5" x2="3.5" y2="7.5" opacity="0.5" />
      <circle cx="21" cy="8" r="1.1" fill="currentColor" stroke="none" />
      <line x1="19" y1="9.5" x2="20.5" y2="8.5" opacity="0.5" />
      <circle cx="4" cy="17" r="0.9" fill="currentColor" stroke="none" opacity="0.7" />
      <line x1="6.5" y1="15.5" x2="4.5" y2="16.8" opacity="0.4" />
      <circle cx="20" cy="16" r="0.9" fill="currentColor" stroke="none" opacity="0.7" />
      <line x1="17" y1="15" x2="19.5" y2="15.8" opacity="0.4" />
    </svg>
  )
}

// ── Backtesting: Time Rewind ──────────────────────────────────────────────────
export function TimeRewindIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="14" y1="7" x2="14" y2="18" opacity="0.4" />
      <rect x="12.5" y="9" width="3" height="5" rx="0.5" />
      <line x1="19" y1="8" x2="19" y2="17" opacity="0.4" />
      <rect x="17.5" y="10" width="3" height="4" rx="0.5" strokeDasharray="3 2" />
      <path d="M9,8 A6,6 0 1,0 9,16" strokeWidth="1.8" />
      <polyline points="9,4.5 9,8 5.5,8" strokeWidth="1.8" />
      <circle cx="9" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── AI Insights: Pattern Eye ──────────────────────────────────────────────────
export function PatternEyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2,12 C2,12 6,5 12,5 C18,5 22,12 22,12 C22,12 18,19 12,19 C6,19 2,12 2,12Z" strokeDasharray="5 2" />
      <circle cx="12" cy="12" r="3.5" strokeWidth="1.5" />
      <polyline points="9.5,13 10.5,11 11.5,13 12.5,10.5 14.5,13" strokeWidth="1.8" />
      <circle cx="10.5" cy="10.5" r="0.8" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  )
}

// ── Social: Trading Circle ────────────────────────────────────────────────────
export function TradingCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="6" strokeDasharray="4 2" />
      <circle cx="15" cy="12" r="6" strokeDasharray="4 2" />
      <polyline points="5.5,14.5 8,12 10.5,9.5" strokeWidth="1.8" />
      <polyline points="13.5,9.5 16,12 18.5,14.5" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── Psychology: Mind Mirror ───────────────────────────────────────────────────
export function MindMirrorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12,3 C7.5,3 5,6 5,9.5 C5,12 6,13.5 7,14.5 L7,17 C7,18.5 8,20 10,20.5 L14,20.5 C16,20 17,18.5 17,17 L17,14.5 C18,13.5 19,12 19,9.5 C19,6 16.5,3 12,3Z" />
      <path d="M8.5,10 C9.5,8 10.5,11.5 12,9.5 C13.5,7.5 14.5,11.5 15.5,10" strokeWidth="1.8" />
      <circle cx="10" cy="14.5" r="0.8" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="12" cy="15.5" r="0.8" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="14" cy="14.5" r="0.8" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  )
}

// ── Guides: Compass ───────────────────────────────────────────────────────────
export function CompassIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" strokeDasharray="4 3" />
      <line x1="12" y1="3" x2="12" y2="6" opacity="0.5" />
      <line x1="12" y1="18" x2="12" y2="21" opacity="0.5" />
      <line x1="3" y1="12" x2="6" y2="12" opacity="0.5" />
      <line x1="18" y1="12" x2="21" y2="12" opacity="0.5" />
      <polygon points="12,5 10,12 12,10.5 14,12" fill="currentColor" stroke="none" opacity="0.8" />
      <polygon points="12,19 10,12 12,13.5 14,12" fill="currentColor" stroke="none" opacity="0.3" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── Settings: Tuning Forks ────────────────────────────────────────────────────
export function TuningForksIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="4" x2="6" y2="20" opacity="0.35" strokeDasharray="2 2" />
      <line x1="12" y1="4" x2="12" y2="20" opacity="0.35" strokeDasharray="2 2" />
      <line x1="18" y1="4" x2="18" y2="20" opacity="0.35" strokeDasharray="2 2" />
      <rect x="3.5" y="7.5" width="5" height="4" rx="2" fill="currentColor" stroke="none" />
      <rect x="9.5" y="12.5" width="5" height="4" rx="2" fill="currentColor" stroke="none" />
      <rect x="15.5" y="5.5" width="5" height="4" rx="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── Playbook: Strategy Blueprint ──────────────────────────────────────────────
export function StrategyBlueprintIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12,4 L12,20" opacity="0.4" />
      <path d="M12,4 C10,4 4,4.5 3,5 L3,19 C4,18.5 10,18 12,18" />
      <path d="M12,4 C14,4 20,4.5 21,5 L21,19 C20,18.5 14,18 12,18" />
      <line x1="5.5" y1="8" x2="9.5" y2="8" opacity="0.4" strokeDasharray="2 1.5" />
      <line x1="5.5" y1="10.5" x2="9" y2="10.5" opacity="0.4" strokeDasharray="2 1.5" />
      <line x1="5.5" y1="13" x2="8.5" y2="13" opacity="0.4" strokeDasharray="2 1.5" />
      <polyline points="14,14 15.5,10 17,13 18.5,7.5 19.5,11" strokeWidth="1.8" />
      <circle cx="18.5" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ── Import/Sync: Sync Arrows ──────────────────────────────────────────────────
export function SyncArrowsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16,6 A7,7 0 0,0 5,10" strokeDasharray="4 2" />
      <polyline points="16,3 16,6.5 12.5,6.5" strokeWidth="1.8" />
      <path d="M8,18 A7,7 0 0,0 19,14" strokeDasharray="4 2" />
      <polyline points="8,21 8,17.5 11.5,17.5" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  )
}

// ── Avg Return: Mean Line ────────────────────────────────────────────────────
export function MeanLineIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)} strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* Horizontal mean/average line */}
      <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="4 2" opacity="0.5" />
      {/* Data points above the mean (wins) */}
      <circle cx="6" cy="7" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="13" cy="5.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="8" r="1.1" fill="currentColor" stroke="none" opacity="0.7" />
      {/* Data points below the mean (losses) */}
      <circle cx="9.5" cy="16" r="1.1" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="16" cy="17.5" r="1" fill="currentColor" stroke="none" opacity="0.5" />
      {/* Vertical ticks from points to mean line */}
      <line x1="6" y1="8.3" x2="6" y2="12" strokeWidth="1.2" opacity="0.4" />
      <line x1="13" y1="6.8" x2="13" y2="12" strokeWidth="1.2" opacity="0.4" />
      <line x1="9.5" y1="14.9" x2="9.5" y2="12" strokeWidth="1.2" opacity="0.4" />
      {/* µ symbol hint — small bar on the left */}
      <line x1="2" y1="10" x2="2" y2="14" strokeWidth="2" opacity="0.8" />
    </svg>
  )
}

// ── Aliases ───────────────────────────────────────────────────────────────────
export { PulseGridIcon as DashboardIcon }
export { TimeRewindIcon as BacktestIcon }
export { MindMirrorIcon as PsychologyIcon }
