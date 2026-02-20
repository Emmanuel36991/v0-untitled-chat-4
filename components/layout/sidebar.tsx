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
  TradeIcon,
  AnalyticsIcon,
  PlaybookIcon,
  NeuralSparkIcon,
  PatternEyeIcon,
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
    icon: TradeIcon,
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
    badgeColor: "bg-primary text-primary-foreground",
  },
]

const secondaryNavigation: NavItem[] = [
  {
    name: "AI Insights",
    href: "/insights",
    icon: PatternEyeIcon,
    description: "Setup patterns, psychology & risk analysis",
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
        "flex flex-col border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <PulseIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight text-foreground">Concentrade</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 hover:bg-muted"
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
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted",
                      isActive
                        ? "bg-muted text-foreground font-semibold border-l-[3px] border-l-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "px-2 py-0.5 text-xs font-medium rounded-full",
                              item.badgeColor || "bg-primary text-primary-foreground",
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
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tools & Analysis
                </h3>
              </div>
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted",
                        isActive
                          ? "bg-muted text-foreground font-semibold border-l-[3px] border-l-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground",
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
                        "group flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : "text-muted-foreground",
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
      <div className="border-t border-border p-3 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted",
                  isActive
                    ? "bg-muted text-foreground font-semibold border-l-[3px] border-l-primary"
                    : "text-muted-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          item.badgeColor || "bg-primary text-primary-foreground",
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
        <div className="border-t border-border p-3">
          <Link href="/ai-coach">
            <div className="group flex items-center justify-center rounded-lg px-3 py-2 bg-primary hover:bg-primary/90 transition-all duration-200 text-primary-foreground card-enhanced">
              <NeuralSparkIcon className="h-5 w-5" />
            </div>
          </Link>
        </div>
      )}

      {/* AI Coach Promotion (when expanded) */}
      {!isCollapsed && pathname !== "/ai-coach" && (
        <div className="border-t border-border p-3">
          <Link href="/ai-coach">
            <div className="group rounded-lg p-4 bg-primary hover:bg-primary/90 transition-all duration-200 text-primary-foreground card-enhanced">
              <div className="flex items-center gap-3 mb-2">
                <NeuralSparkIcon className="h-5 w-5" />
                <span className="font-semibold">Try AI Coach</span>
                <PulseIcon className="h-4 w-4 ml-auto" />
              </div>
              <p className="text-xs text-primary-foreground/80">Get personalized trading insights powered by AI</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
