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
        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md",
        pathname === href &&
        "text-gray-900 dark:text-white bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 shadow-md",
        className,
      )}
    >
      {children}
    </Link>
  )

  const NavContent = () => (
    <div className="relative flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">

      {/* Mount the Dialog Component */}
      <WhatsNewDialog open={showUpdates} onOpenChange={setShowUpdates} />

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 via-white/50 to-gray-50/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-900/50 pointer-events-none"></div>

      {/* Logo with modern styling */}
      <Link href="/dashboard" className="relative flex items-center gap-3 font-bold group mr-8 z-10">
        <ConcentradeLogo size={40} variant="full" className="group-hover:scale-105 transition-transform duration-300" />
      </Link>

      {/* Desktop Navigation with modern styling */}
      <nav className="hidden lg:flex items-center space-x-2 flex-grow">
        {visibleMainNavItems.map((item) => (
          <div key={item.name} className="relative group">
            <NavLink
              href={item.href}
              className="relative text-sm px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 transition-all duration-300" />
                <span className="font-medium">{item.name}</span>
              </div>
              {pathname === item.href && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              )}
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
          className="hidden md:flex gap-2 items-center border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 relative shadow-sm"
        >
          <PulseIcon className="h-4 w-4 fill-current" />
          <span className="font-medium text-xs uppercase tracking-wide">Updates</span>

          {/* Notification Dot */}
          {hasUnreadUpdates && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-gray-900 shadow-sm" />
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
                className="h-10 w-10 relative border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="sr-only">Open Navigation Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex flex-col w-full sm:w-[320px] p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            >
              {/* Mobile menu header */}
              <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-6 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
                <Link href="/dashboard" className="flex items-center gap-3 font-bold group">
                  <ConcentradeLogo size={32} variant="full" />
                </Link>
              </div>

              {/* Mobile navigation content */}
              <div className="flex-1 overflow-y-auto py-6">
                <nav className="grid gap-2 px-4">
                  {visibleMainNavItems.map((item) => (
                    <NavLink
                      key={item.name}
                      href={item.href}
                      className="text-base py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </NavLink>
                  ))}
                </nav>

                {/* Mobile secondary navigation */}
                <div className="mt-8">
                  <h4 className="mb-4 px-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                    More
                  </h4>
                  <nav className="grid gap-2 px-4">
                    {moreNavItems.map((item) => (
                      <NavLink
                        key={item.name}
                        href={item.href}
                        className="text-base py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
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
                    className="w-full justify-start gap-3 text-base py-6 rounded-xl border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300"
                  >
                    <PulseIcon className="h-5 w-5 fill-current" />
                    <span className="font-medium">What's New</span>
                    {hasUnreadUpdates && (
                      <Badge className="ml-auto bg-red-500 text-white border-0">New</Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Mobile menu footer */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">System Online</span>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent pointer-events-none"></div>
    </div>
  )

  return <NavContent />
}
