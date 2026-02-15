import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, AlertCircle } from "lucide-react"
import { BreakoutIcon } from "@/components/icons/system-icons"
import { cn } from "@/lib/utils"

export interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ElementType
  iconColor: string
  trendData?: any[]
  subtitle?: string
  tooltipInfo?: string
  onClick?: () => void
}

export const MetricCard = React.memo<MetricCardProps>(
  ({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor,
    subtitle,
    tooltipInfo,
    onClick,
  }) => (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/60 shadow-sm transition-all duration-200 group cursor-pointer",
        "bg-card backdrop-blur-xl",
        "hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div
            className={cn(
              "p-2.5 rounded-xl transition-transform duration-200 group-hover:scale-110",
              iconColor,
              "bg-opacity-10 dark:bg-opacity-20"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {change && (
            <Badge
              variant="secondary"
              className={cn(
                "font-mono text-xs px-2 py-0.5 border-0",
                changeType === "positive" &&
                "text-profit bg-profit/10",
                changeType === "negative" &&
                "text-loss bg-loss/10",
                changeType === "neutral" &&
                "text-muted-foreground bg-muted"
              )}
            >
              {changeType === "positive" ? (
                <BreakoutIcon className="h-3 w-3 mr-1 inline" />
              ) : changeType === "negative" ? (
                <BreakoutIcon className="h-3 w-3 mr-1 inline rotate-180" />
              ) : (
                <MoreHorizontal className="h-3 w-3 mr-1 inline" />
              )}
              {change}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            {title}
            {tooltipInfo && (
              <AlertCircle className="h-3 w-3 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {value}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground/80 font-medium pt-1">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
)

MetricCard.displayName = "MetricCard"
