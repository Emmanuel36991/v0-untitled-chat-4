"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PulseIcon } from "@/components/icons/system-icons"
import {
  DashboardIcon,
  AddTradeIcon,
  TradeLedgerIcon,
  AnalyticsIcon,
  PlaybookIcon,
  NeuralSparkIcon,
  BacktestIcon,
  PatternEyeIcon,
  SocialIcon,
  PsychologyIcon,
  CompassIcon,
  SettingsIcon,
} from "@/components/icons/system-icons"

interface SidebarProps {
  className?: string
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  badge?: string
  badgeColor?: string
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
    description: "Overview and recent activity",
  },
  {
    name: "Add Trade",
    href: "/add-trade",
    icon: AddTradeIcon,
    description: "Log a new trade",
  },
  {
    name: "All Trades",
    href: "/trades",
    icon: TradeLedgerIcon,
    description: "View and manage trades",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: AnalyticsIcon,
    description: "Performance insights",
  },
  {
    name: "Playbook",
    href: "/playbook",
    icon: PlaybookIcon,
    description: "Strategy playbook",
  },
  {
    name: "AI Coach",
    href: "/ai-coach",
    icon: NeuralSparkIcon,
    description: "Personalized trading insights",
    badge: "NEW",
    badgeColor: "bg-gradient-to-r from-blue-500 to-purple-500",
  },
]

const secondaryNavigation: NavItem[] = [
  {
    name: "Backtesting",
    href: "/backtesting",
    icon: BacktestIcon,
    description: "Test strategies",
  },
  {
    name: "AI Insights",
    href: "/insights",
    icon: PatternEyeIcon,
    description: "Setup patterns, psychology & risk analysis",
  },
  {
    name: "Social Insights",
    href: "/social-insights",
    icon: SocialIcon,
    description: "Community features",
  },
  {
    name: "Psychology",
    href: "/psychology",
    icon: PsychologyIcon,
    description: "Mental game",
  },
  {
    name: "Guides",
    href: "/guides",
    icon: CompassIcon,
    description: "Learning resources",
  },
]

const bottomNavigation: NavItem[] = [
  {
    name: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    description: "Account preferences",
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <PulseIcon className="h-6 w-6 text-blue-500" />
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Concentrade</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {/* Primary Navigation */}
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                        : "text-slate-700 dark:text-slate-300",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400",
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "px-2 py-0.5 text-xs font-medium text-white rounded-full",
                              item.badgeColor || "bg-blue-500",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          <Separator className="my-4" />

          {/* Secondary Navigation */}
          {!isCollapsed && (
            <div className="space-y-1">
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tools & Analysis
                </h3>
              </div>
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                          : "text-slate-700 dark:text-slate-300",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400",
                        )}
                      />
                      <span className="flex-1">{item.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {isCollapsed && (
            <div className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "group flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400",
                        )}
                      />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                    : "text-slate-700 dark:text-slate-300",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400",
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium text-white rounded-full",
                          item.badgeColor || "bg-blue-500",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* AI Coach Promotion (when collapsed) */}
      {isCollapsed && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-3">
          <Link href="/ai-coach">
            <div className="group flex items-center justify-center rounded-lg px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
              <NeuralSparkIcon className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>
      )}

      {/* AI Coach Promotion (when expanded) */}
      {!isCollapsed && pathname !== "/ai-coach" && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-3">
          <Link href="/ai-coach">
            <div className="group rounded-lg p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-white">
              <div className="flex items-center gap-3 mb-2">
                <NeuralSparkIcon className="h-5 w-5" />
                <span className="font-semibold">Try AI Coach</span>
                <PulseIcon className="h-4 w-4 ml-auto" />
              </div>
              <p className="text-xs text-white/80">Get personalized trading insights powered by AI</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
