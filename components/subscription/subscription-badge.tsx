'use client'

import { Crown, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SubscriptionBadgeProps {
  plan: string
  isLoading?: boolean
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

export function SubscriptionBadge({ 
  plan, 
  isLoading = false, 
  size = 'sm',
  showTooltip = true,
  className 
}: SubscriptionBadgeProps) {
  const isPro = plan.startsWith('pro')

  if (isLoading) {
    return <Skeleton className={cn(
      "rounded-full",
      size === 'sm' && "h-5 w-12",
      size === 'md' && "h-6 w-16",
      size === 'lg' && "h-7 w-20",
    )} />
  }

  if (!isPro) {
    return null
  }

  const badge = (
    <Badge 
      className={cn(
        "gap-1 font-medium",
        "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
        "hover:from-primary/90 hover:to-primary/70",
        "border-0 shadow-sm",
        size === 'sm' && "text-xs px-2 py-0.5",
        size === 'md' && "text-sm px-2.5 py-1",
        size === 'lg' && "text-base px-3 py-1.5",
        className
      )}
    >
      <Crown className={cn(
        size === 'sm' && "h-3 w-3",
        size === 'md' && "h-3.5 w-3.5",
        size === 'lg' && "h-4 w-4",
      )} />
      PRO
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">You have access to all Pro features</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ProFeatureGateProps {
  isPro: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProFeatureGate({ isPro, children, fallback }: ProFeatureGateProps) {
  if (isPro) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none select-none">
        {children}
      </div>
      {fallback || (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-4">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Pro Feature</p>
            <p className="text-xs text-muted-foreground">Upgrade to unlock</p>
          </div>
        </div>
      )}
    </div>
  )
}
