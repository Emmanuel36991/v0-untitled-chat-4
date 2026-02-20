"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/layout/user-nav"
import { ConcentradeLogo } from "@/components/concentrade-logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { WhatsNewDialog } from "@/components/whats-new-dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, BookOpen } from "lucide-react"
import {
  DashboardIcon,
  AnalyticsIcon,
  PlaybookIcon,
  PsychologyIcon,
  TradeLedgerIcon,
} from "@/components/icons/system-icons"

// Navigation Items Configuration
const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
    iconClassName: "drop-shadow-[0_0_6px_rgba(59,130,246,0.7)] dark:drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]",
  },
  {
    title: "Trades",
    href: "/trades",
    icon: TradeLedgerIcon,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: AnalyticsIcon,
  },
  {
    title: "Playbook",
    href: "/playbook",
    icon: PlaybookIcon,
  },
  {
    title: "Psychology",
    href: "/psychology",
    icon: PsychologyIcon,
  },
]


export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 w-full items-center justify-between px-6 lg:px-10">

        {/* --- LEFT SECTION: LOGO --- */}
        <div className="flex flex-1 items-center justify-start">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <ConcentradeLogo size={42} className="text-primary" variant="full" />
          </Link>
        </div>

        {/* --- CENTER SECTION: NAVIGATION --- */}
        <div className="hidden md:flex flex-initial items-center justify-center">
          <nav className="flex items-center gap-1 rounded-full bg-muted/30 p-1 px-2 backdrop-blur-sm border border-border">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-full px-5 py-2.5 text-base font-semibold transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Hover Background */}
                  <span className="absolute inset-0 -z-10 scale-90 rounded-full bg-muted/0 transition-all duration-300 group-hover:scale-100 group-hover:bg-muted/50" />

                  <Icon className={cn("h-6 w-6 transition-transform duration-300 group-hover:scale-110", isActive && "stroke-current", "iconClassName" in item ? (item as { iconClassName?: string }).iconClassName : null)} />
                  <span>{item.title}</span>

                  {/* Active State: Gradient Underline */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-[-0.75rem] left-4 right-4 h-[3px] rounded-t-full bg-gradient-to-r from-primary via-blue-500 to-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* --- RIGHT SECTION: ACTIONS --- */}
        <div className="flex flex-1 items-center justify-end gap-3 lg:gap-5">
          <div className="hidden md:block">
            <WhatsNewDialog />
          </div>

          <UserNav />

          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 pt-10">
                <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <ConcentradeLogo size={40} className="text-primary" variant="full" />
                </Link>
                <nav className="flex flex-col gap-2">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-4 rounded-xl px-4 py-3.5 text-lg font-semibold transition-all duration-200",
                          isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        {item.title}
                      </Link>
                    )
                  })}
                </nav>
                <div className="mt-auto flex flex-col gap-4">
                  <div className="flex items-center justify-between px-4">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="px-4">
                    <WhatsNewDialog />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

