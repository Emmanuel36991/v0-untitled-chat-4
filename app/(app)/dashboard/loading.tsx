"use client"

import { ConcentradeLogo } from "@/components/concentrade-logo"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Logo with pulse ring */}
        <div className="relative">
          {/* Outer pulse ring */}
          <div className="absolute inset-0 -m-4 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute inset-0 -m-2 rounded-full border border-primary/10" />

          <div className="relative p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
            <ConcentradeLogo size={40} variant="icon" />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Loading Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Syncing your trading data...
          </p>
        </div>

        {/* Animated progress bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full animate-loading-bar"
            style={{
              width: "40%",
              animation: "loading-slide 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Inline keyframes */}
        <style>{`
          @keyframes loading-slide {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(200%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    </div>
  )
}
