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
import { Menu } from "lucide-react"
import {
  DashboardIcon,
  PlaybookIcon,
  AnalyticsIcon,
  JournalIcon,
  SettingsIcon,
} from "@/components/icons/hand-crafted-icons"

// Navigation Items Configuration
const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
  },
  {
    title: "Journal",
    href: "/trades",
    icon: JournalIcon,
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
    icon: React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        ref={ref}
        {...props}
      >
        <path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z" />
        <path d="M12 14a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0v-2a5 5 0 0 0-5-5Z" />
      </svg>
    )),
  },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-8">

        {/* --- LEFT SECTION: LOGO --- */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <ConcentradeLogo className="h-10 w-10 text-primary" variant="icon" />
            <span className="hidden text-xl font-bold tracking-tight md:block">
              Concentrade
            </span>
          </Link>
        </div>

        {/* --- CENTER SECTION: NAVIGATION (Absolute Positioned) --- */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform md:block">
          <nav className="flex items-center gap-1 rounded-full bg-background/50 p-1 px-2 backdrop-blur-sm">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-full px-5 py-2.5 text-base font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {/* Hover Background */}
                  <span className="absolute inset-0 -z-10 scale-90 rounded-full bg-accent/0 transition-all duration-300 group-hover:scale-100 group-hover:bg-accent/50" />

                  <Icon className={cn("h-6 w-6 transition-transform duration-300 group-hover:scale-110", isActive && "stroke-current")} />
                  <span>{item.title}</span>

                  {/* Active State: Gradient Underline */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-0 left-4 right-4 h-[3px] rounded-t-full bg-gradient-to-r from-primary via-blue-500 to-primary"
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
        <div className="flex items-center gap-4">
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
                  <ConcentradeLogo className="h-8 w-8 text-primary" variant="icon" />
                  <span className="text-lg font-bold">Concentrade</span>
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
                          "flex items-center gap-4 rounded-md px-4 py-3 text-lg font-medium transition-colors hover:bg-accent",
                          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
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
