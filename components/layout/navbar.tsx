"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu } from 'lucide-react'
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

  useEffect(() => {
    const lastSeen = localStorage.getItem("lastSeenUpdate")
    if (lastSeen !== LATEST_UPDATE_ID) {
      setShowUpdates(true)
      setHasUnreadUpdates(true)
    }
  }, [])

  const handleOpenUpdates = () => {
    setShowUpdates(true)
    setHasUnreadUpdates(false)
    localStorage.setItem("lastSeenUpdate", LATEST_UPDATE_ID)
  }

  return (
    <>
      <WhatsNewDialog open={showUpdates} onOpenChange={setShowUpdates} />

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40"
      >
        {/* Subtle gradient border at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

        <div className="relative mx-auto flex h-20 max-w-7xl items-center px-4 lg:px-6">
          {/* Logo — Left Section */}
          <Link href="/dashboard" className="relative flex items-center gap-3 font-bold group z-20">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <ConcentradeLogo size={42} variant="full" className="transition-colors" />
            </motion.div>
          </Link>

          {/* Desktop Navigation — Center Section (Absolutely Centered) */}
          <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2.5 px-4 py-2.5 text-base font-semibold transition-colors duration-200 rounded-lg group",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <motion.div
                    className="flex items-center gap-2.5"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <item.icon className={cn(
                      "h-6 w-6 transition-all duration-200",
                      isActive ? "text-primary" : "group-hover:scale-110 group-hover:text-primary/70"
                    )} />
                    <span>{item.name}</span>
                  </motion.div>

                  {/* Subtle hover glow background */}
                  {!isActive && (
                    <span className="absolute inset-0 rounded-lg bg-muted/0 group-hover:bg-muted/30 transition-colors duration-300 pointer-events-none" />
                  )}

                  {/* Gradient underline — animated between active items */}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-underline"
                      className="absolute bottom-[-1.25rem] left-1 right-1 h-[3px] rounded-full bg-gradient-to-r from-primary via-accent to-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Section — Actions & Profile */}
          <div className="ml-auto flex items-center gap-3 z-20">
            {/* Updates Pill */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenUpdates}
              className={cn(
                "hidden md:flex gap-2.5 items-center rounded-full h-12 px-5 text-sm font-semibold transition-all duration-300 border",
                hasUnreadUpdates
                  ? "border-primary/50 bg-primary/5 text-foreground shadow-[0_0_12px_-3px] shadow-primary/30 hover:shadow-primary/50 hover:bg-primary/10"
                  : "border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <UpdatesIcon className="h-5 w-5 fill-current" />
              <span className="uppercase tracking-wider text-2xs font-bold">Updates</span>

              {hasUnreadUpdates && (
                <span className="relative flex h-2.5 w-2.5 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
              )}
            </Button>

            {/* User Profile */}
            <UserNav />

            {/* Mobile Navigation Trigger */}
            <div className="lg:hidden relative">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 relative rounded-xl border-border bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <Menu className="h-6 w-6 text-muted-foreground" />
                    <span className="sr-only">Open Navigation Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex flex-col w-[85vw] max-w-[340px] p-0 bg-background/95 backdrop-blur-xl border-white/[0.06]"
                >
                  {/* Mobile menu header */}
                  <div className="flex h-[72px] items-center border-b border-white/[0.06] px-6">
                    <Link href="/dashboard" className="flex items-center gap-3 font-bold group">
                      <ConcentradeLogo size={40} variant="full" />
                    </Link>
                  </div>

                  {/* Mobile navigation content */}
                  <div className="flex-1 overflow-y-auto py-6">
                    <nav className="grid gap-1 px-4">
                      {mainNavItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary/10 text-foreground border border-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            )}
                          >
                            <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                            <span className="font-semibold">{item.name}</span>
                            {isActive && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </Link>
                        )
                      })}
                    </nav>

                    {/* Mobile secondary navigation */}
                    <div className="mt-8">
                      <h4 className="mb-3 px-6 text-2xs font-bold uppercase text-muted-foreground tracking-widest">
                        More
                      </h4>
                      <nav className="grid gap-1 px-4">
                        {moreNavItems.map((item) => {
                          const isActive = pathname === item.href
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200",
                                isActive
                                  ? "bg-primary/10 text-foreground border border-primary/20"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              )}
                            >
                              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                              <span className="font-semibold">{item.name}</span>
                            </Link>
                          )
                        })}
                      </nav>
                    </div>

                    {/* Mobile Updates Button */}
                    <div className="mt-6 px-4">
                      <Button
                        variant="outline"
                        onClick={handleOpenUpdates}
                        className={cn(
                          "w-full justify-start gap-4 py-7 rounded-xl font-semibold text-base transition-all duration-300",
                          hasUnreadUpdates
                            ? "border-primary/30 bg-primary/5 text-foreground"
                            : "border-border bg-muted/30 text-muted-foreground"
                        )}
                      >
                        <UpdatesIcon className="h-5 w-5 fill-current" />
                        <span className="font-bold">What&apos;s New</span>
                        {hasUnreadUpdates && (
                          <Badge className="ml-auto bg-primary text-primary-foreground border-0 text-xs py-0.5 px-2 rounded-full">New</Badge>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Mobile menu footer */}
                  <div className="border-t border-white/[0.06] p-4 bg-muted/20">
                    <div className="text-2xs text-center text-muted-foreground flex items-center justify-center gap-2 font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span>System Online</span>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  )
}
