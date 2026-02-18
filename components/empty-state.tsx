"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface EmptyStateAction {
  label: string
  onClick?: () => void
  href?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
}

interface EmptyStateProps {
  icon?: LucideIcon | React.ElementType
  illustration?: React.ElementType
  title: string
  description: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  className?: string
  compact?: boolean
}

function ActionButton({ action, isPrimary }: { action: EmptyStateAction; isPrimary: boolean }) {
  const variant = action.variant ?? (isPrimary ? "default" : "outline")

  const button = (
    <Button variant={variant} size={isPrimary ? "default" : "sm"} onClick={action.onClick} className={cn("gap-2", isPrimary && "btn-enhanced")}>
      {action.label}
    </Button>
  )

  if (action.href) {
    return <Link href={action.href}>{button}</Link>
  }

  return button
}

export function EmptyState({
  icon: Icon,
  illustration: Illustration,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center animate-fade-in-up",
        compact ? "py-12 px-4" : "py-20 px-6",
        className
      )}
    >
      {/* Illustration or Icon container */}
      {Illustration ? (
        <div className="mb-6 flex items-center justify-center">
          <Illustration className={cn(compact ? "w-32" : "w-48")} />
        </div>
      ) : Icon ? (
        <div
          className={cn(
            "rounded-2xl flex items-center justify-center mb-5 animate-float",
            "bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/5",
            "ring-1 ring-primary/10 dark:ring-primary/20 shadow-lg shadow-primary/5",
            compact ? "p-3" : "p-4"
          )}
        >
          <Icon
            className={cn(
              "text-primary/60 dark:text-primary/70",
              compact ? "w-6 h-6" : "w-8 h-8"
            )}
          />
        </div>
      ) : null}

      {/* Title */}
      <h3
        className={cn(
          "font-semibold text-foreground",
          compact ? "text-base" : "text-lg"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          "text-muted-foreground mt-1.5 max-w-sm leading-relaxed",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6">
          {action && <ActionButton action={action} isPrimary />}
          {secondaryAction && <ActionButton action={secondaryAction} isPrimary={false} />}
        </div>
      )}
    </div>
  )
}
