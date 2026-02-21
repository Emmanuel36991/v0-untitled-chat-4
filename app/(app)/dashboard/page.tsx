import { Suspense } from "react"
import { getTrades } from "@/app/actions/trade-actions"
import { getTradingAccounts } from "@/app/actions/account-actions"
import { getStrategies } from "@/app/actions/playbook-actions"
import DashboardClient from "./dashboard-client"

// Server Component (RSC)
export default async function DashboardPage() {
  // Use Promise.allSettled to prevent the whole page from crashing if one query fails
  const [tradesResult, accountsResult, strategiesResult] = await Promise.allSettled([
    getTrades({ limit: 500, order: "desc" }),
    getTradingAccounts(),
    getStrategies(),
  ])

  // Process the settled results safely
  const initialTrades = tradesResult.status === "fulfilled" && tradesResult.value ? tradesResult.value : []
  const hasAccounts = accountsResult.status === "fulfilled" && (accountsResult.value?.length ?? 0) > 0
  const hasStrategies = strategiesResult.status === "fulfilled" && (strategiesResult.value?.length ?? 0) > 0

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient
        initialTrades={initialTrades}
        hasAccounts={hasAccounts}
        hasStrategies={hasStrategies}
      />
    </Suspense>
  )
}

// Minimal static loading state matched to the dashboard frame
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center">
        {/* Logo — staggered building blocks rise into view */}
        <div className="relative mb-10" style={{ width: 80, height: 80 }}>
          <div
            className="absolute inset-0 -m-8 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
              animation: "glow-breathe 3s ease-in-out infinite",
            }}
          />
          <svg
            width={80}
            height={80}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative"
          >
            <defs>
              <linearGradient id="loadGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#6D28D9" />
              </linearGradient>
            </defs>
            <rect x="15" y="25" width="25" height="50" rx="2" fill="url(#loadGrad2)" opacity="0.7"
              style={{ animation: "block-rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both" }} />
            <rect x="30" y="15" width="25" height="60" rx="2" fill="url(#loadGrad2)" opacity="0.85"
              style={{ animation: "block-rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both" }} />
            <rect x="45" y="35" width="25" height="40" rx="2" fill="url(#loadGrad2)"
              style={{ animation: "block-rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both" }} />
            <rect x="60" y="20" width="20" height="35" rx="2" fill="url(#loadGrad2)" opacity="0.9"
              style={{ animation: "block-rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both" }} />
            <rect x="32" y="17" width="2" height="56" fill="white" opacity="0.25" rx="1"
              style={{ animation: "block-rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s both" }} />
            <rect x="47" y="37" width="2" height="36" fill="white" opacity="0.25" rx="1"
              style={{ animation: "block-rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s both" }} />
            <rect x="62" y="22" width="2" height="31" fill="white" opacity="0.25" rx="1"
              style={{ animation: "block-rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.45s both" }} />
          </svg>
        </div>

        {/* Wordmark */}
        <div
          className="flex flex-col items-center gap-1 mb-8"
          style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.6s both" }}
        >
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
            Concentrade
          </span>
          <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-muted-foreground/60">
            Trading Journal
          </span>
        </div>

        <p
          className="text-sm text-muted-foreground mb-6"
          style={{ animation: "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.8s both" }}
        >
          Syncing your trading data...
        </p>

        <div
          className="w-44 h-[3px] bg-muted/50 rounded-full overflow-hidden"
          style={{ animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.9s both" }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600/80 via-purple-500 to-purple-600/80"
            style={{ width: "30%", animation: "silk-slide 2s cubic-bezier(0.4,0,0.2,1) infinite" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes block-rise {
          from { opacity: 0; transform: translateY(20px) scaleY(0.6); }
          to { opacity: var(--target-opacity, 1); transform: translateY(0) scaleY(1); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes silk-slide {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(500%); }
        }
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}
