"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge" // <--- ADDED THIS IMPORT
import { Menu } from 'lucide-react'
import { PulseIcon } from "@/components/icons/system-icons"
import {
  DashboardIcon,
  TradeLedgerIcon,
  AnalyticsIcon,
  PlaybookIcon,
  PsychologyIcon,
  BacktestIcon,
  SocialIcon,
  CompassIcon,
  SettingsIcon,
  UpdatesIcon,
} from "@/components/icons/system-icons"
import { cn } from "@/lib/utils"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { WhatsNewDialog } from "@/components/whats-new-dialog"
import { LATEST_UPDATE_ID } from "@/lib/updates"
import { UserNav } from "@/components/layout/user-nav"

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "Trades", href: "/trades", icon: TradeLedgerIcon },
  { name: "Analytics", href: "/analytics", icon: AnalyticsIcon },
  { name: "Playbook", href: "/playbook", icon: PlaybookIcon },
  { name: "Psychology", href: "/psychology", icon: PsychologyIcon },
  { name: "Backtesting", href: "/backtesting", icon: BacktestIcon },
]

const moreNavItems = [
  { name: "Community", href: "/social-insights", icon: SocialIcon },
  { name: "Guides", href: "/guides", icon: CompassIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
]

export function Navbar() {
  const pathname = usePathname()

  // Updates State
  const [showUpdates, setShowUpdates] = useState(false)
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false)

  // Check for updates on mount
  useEffect(() => {
    const lastSeen = localStorage.getItem("lastSeenUpdate")
    if (lastSeen !== LATEST_UPDATE_ID) {
      // If they haven't seen this specific update ID, show popup and dot
      setShowUpdates(true)
      setHasUnreadUpdates(true)
    }
  }, [])

  const handleOpenUpdates = () => {
    setShowUpdates(true)
    setHasUnreadUpdates(false) // Clear the dot
    localStorage.setItem("lastSeenUpdate", LATEST_UPDATE_ID)
  }

  const visibleMainNavItems = mainNavItems

  const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-5 py-3 text-base font-bold text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-muted",
        pathname === href && "text-foreground font-bold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-8 after:rounded-full after:bg-primary",
        className,
      )}
    >
      {children}
    </Link>
  )

  const NavContent = () => (
    <div className="relative flex h-20 items-center border-b border-border px-4 lg:px-6 sticky top-0 z-50 bg-background/80 backdrop-blur-xl shadow-sm transition-all duration-300">

      {/* Mount the Dialog Component */}
      <WhatsNewDialog open={showUpdates} onOpenChange={setShowUpdates} />

      {/* Logo with modern styling */}
      <Link href="/dashboard" className="relative flex items-center gap-3 font-bold group mr-8 z-10">
        <ConcentradeLogo size={46} variant="full" className="group-hover:scale-105 transition-transform duration-300" />
      </Link>

      {/* Desktop Navigation with modern styling */}
      <nav className="hidden lg:flex items-center space-x-2 flex-grow">
        {visibleMainNavItems.map((item) => (
          <div key={item.name} className="relative group">
            <NavLink
              href={item.href}
              className="relative text-base px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-6 w-6 transition-all duration-300 stroke-[2.5]" />
                <span className="font-bold">{item.name}</span>
              </div>
            </NavLink>
          </div>
        ))}
      </nav>

      {/* Right side controls with modern styling */}
      <div className="ml-auto flex items-center gap-3 z-10">

        {/* NEW: Updates Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenUpdates}
          className="hidden md:flex gap-2 items-center border-border bg-muted/50 hover:bg-muted text-foreground relative shadow-sm h-10 px-4"
        >
          <UpdatesIcon className="h-5 w-5 fill-current" />
          <span className="font-bold text-sm uppercase tracking-wide">Updates</span>

          {/* Notification Dot */}
          {hasUnreadUpdates && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse border-2 border-background shadow-sm" />
          )}
        </Button>

        {/* User Profile Dropdown */}
        <UserNav />

        {/* Mobile Navigation Trigger with modern styling */}
        <div className="lg:hidden relative">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 relative border-border bg-card/50 hover:bg-muted transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Menu className="h-6 w-6 text-muted-foreground" />
                <span className="sr-only">Open Navigation Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex flex-col w-full sm:w-[320px] p-0 bg-card border-border"
            >
              {/* Mobile menu header */}
              <div className="flex h-20 items-center border-b border-border px-6 bg-muted/50">
                <Link href="/dashboard" className="flex items-center gap-3 font-bold group">
                  <ConcentradeLogo size={40} variant="full" />
                </Link>
              </div>

              {/* Mobile navigation content */}
              <div className="flex-1 overflow-y-auto py-6">
                <nav className="grid gap-2 px-4">
                  {visibleMainNavItems.map((item) => (
                    <NavLink
                      key={item.name}
                      href={item.href}
                      className="text-lg py-4 px-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className="h-6 w-6 stroke-[2.5]" />
                        <span className="font-bold">{item.name}</span>
                      </div>
                    </NavLink>
                  ))}
                </nav>

                {/* Mobile secondary navigation */}
                <div className="mt-8">
                  <h4 className="mb-4 px-4 text-sm font-bold uppercase text-muted-foreground tracking-wider">
                    More
                  </h4>
                  <nav className="grid gap-2 px-4">
                    {moreNavItems.map((item) => (
                      <NavLink
                        key={item.name}
                        href={item.href}
                        className="text-lg py-4 px-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-4">
                          <item.icon className="h-6 w-6 stroke-[2.5]" />
                          <span className="font-bold">{item.name}</span>
                        </div>
                      </NavLink>
                    ))}
                  </nav>
                </div>

                {/* Mobile Updates Button */}
                <div className="mt-6 px-4">
                  <Button
                    variant="outline"
                    onClick={handleOpenUpdates}
                    className="w-full justify-start gap-4 text-lg py-8 rounded-xl border-border bg-muted/50 text-foreground font-bold"
                  >
                    <UpdatesIcon className="h-6 w-6 fill-current" />
                    <span className="font-bold">What's New</span>
                    {hasUnreadUpdates && (
                      <Badge className="ml-auto bg-destructive text-destructive-foreground border-0 text-sm py-1 px-2">New</Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Mobile menu footer */}
              <div className="border-t border-border p-4 bg-muted/50">
                <div className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2 font-medium">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                  <span>System Online</span>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-border pointer-events-none"></div>
    </div>
  )

  return <NavContent />
}
