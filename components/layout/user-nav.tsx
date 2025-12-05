"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client" // Corrected import path
import type { User } from "@supabase/supabase-js"
import { useUserConfig } from "@/hooks/use-user-config"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, UserIcon, Loader2 } from "lucide-react" // Added Loader2

export function UserNav() {
  const router = useRouter()
  const supabase = createClient() // Use the aliased client
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { config, isLoaded: isUserConfigLoaded } = useUserConfig()

  useEffect(() => {
    const getSession = async () => {
      setAuthLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSupabaseUser(session?.user ?? null)
      setAuthLoading(false)
    }
    getSession()

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSupabaseUser(session?.user ?? null)
      setAuthLoading(false)
    })
    return () => {
      authListener?.unsubscribe()
    }
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/marketing") // Or your preferred logout destination
    router.refresh() // To ensure server components re-evaluate auth state
  }

  let displayFullName = "User"
  let displayEmail = "user@example.com"
  let avatarFallback = "U"

  if (authLoading || !isUserConfigLoaded) {
    displayFullName = "Loading..."
    displayEmail = "..."
    avatarFallback = "" // No fallback text while loading
  } else if (supabaseUser) {
    displayEmail = supabaseUser.email || displayEmail
    const userFullName = supabaseUser.user_metadata?.full_name || config.userProfile?.fullName
    displayFullName = userFullName || supabaseUser.email?.split("@")[0] || "User"
    avatarFallback = (displayFullName.charAt(0) || "U").toUpperCase()
    if (supabaseUser.user_metadata?.full_name && supabaseUser.user_metadata.full_name.includes(" ")) {
      const names = supabaseUser.user_metadata.full_name.split(" ")
      avatarFallback = `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    } else if (config.userProfile?.fullName && config.userProfile.fullName.includes(" ")) {
      const names = config.userProfile.fullName.split(" ")
      avatarFallback = `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    }
  } else if (config.userProfile) {
    // Fallback to userConfig if no Supabase user (e.g., initial setup phase)
    displayFullName = config.userProfile.fullName || "User"
    displayEmail = config.userProfile.email || "user@example.com"
    avatarFallback = (displayFullName.charAt(0) || "U").toUpperCase()
    if (config.userProfile.fullName && config.userProfile.fullName.includes(" ")) {
      const names = config.userProfile.fullName.split(" ")
      avatarFallback = `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    }
  }

  if (authLoading || !isUserConfigLoaded) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" disabled>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Button>
    )
  }

  // If not authenticated and config not loaded, or no user data at all, show login/signup
  if (!supabaseUser && !config.userProfile?.email) {
    return <Button onClick={() => router.push("/login")}>Login</Button>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            {/* Add AvatarImage if you store avatar URLs, e.g., supabaseUser.user_metadata?.avatar_url */}
            {/* <AvatarImage src={supabaseUser?.user_metadata?.avatar_url || "/placeholder.svg"} alt={displayFullName} /> */}
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{displayFullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
            {" "}
            {/* Assuming settings is part of dashboard or trades now */}
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          {/* The settings are now in the Trades page dialog, so this direct link might be redundant
              or could point to the trades page if desired. For now, I'll keep it generic or remove.
          <DropdownMenuItem onClick={() => router.push("/trades")} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 hover:!text-red-600 focus:!text-red-600 hover:!bg-red-500/10 focus:!bg-red-500/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
