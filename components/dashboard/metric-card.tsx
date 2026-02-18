import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, AlertCircle, Flame } from "lucide-react"
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
  isHot?: boolean
  className?: string
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
    isHot = false,
    className,
  }) => (
    <Card
      className={cn(
        "relative overflow-hidden border shadow-sm transition-all duration-300 group cursor-pointer",
        "bg-card backdrop-blur-xl card-enhanced glass-card",
        "hover:shadow-md",
        isHot
          ? "border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.25)] hover:border-orange-500/60"
          : "border-border/60 hover:border-primary/20",
        className
      )}
      onClick={onClick}
    >
      {/* Hot ember glow — top edge accent */}
      {isHot && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
      )}

      {/* Animated radial glow behind the card */}
      {isHot && (
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, rgb(249,115,22) 0%, transparent 70%)",
            animation: "hot-pulse 3s ease-in-out infinite",
          }}
        />
      )}

      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div
            className={cn(
              "p-2.5 rounded-xl",
              "bg-opacity-10 dark:bg-opacity-20",
              isHot ? "text-orange-500" : iconColor
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
            {isHot && (
              <Flame className="h-3.5 w-3.5 text-orange-500" style={{ animation: "hot-flicker 1.5s ease-in-out infinite" }} />
            )}
            {tooltipInfo && (
              <AlertCircle className="h-3 w-3 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className={cn(
              "text-2xl font-bold tracking-tight font-mono",
              isHot ? "text-orange-400" : "text-foreground"
            )}>
              {value}
            </h3>
          </div>
          {subtitle && (
            <p className={cn(
              "text-xs font-medium pt-1",
              isHot ? "text-orange-500/60" : "text-muted-foreground/80"
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>

      {/* Keyframes for hot effects */}
      {isHot && (
        <style>{`
          @keyframes hot-pulse {
            0%, 100% { opacity: 0.05; transform: scale(1); }
            50% { opacity: 0.12; transform: scale(1.1); }
          }
          @keyframes hot-flicker {
            0%, 100% { opacity: 1; transform: translateY(0); }
            25% { opacity: 0.7; transform: translateY(-1px); }
            75% { opacity: 0.9; transform: translateY(0.5px); }
          }
        `}</style>
      )}
    </Card>
  )
)

MetricCard.displayName = "MetricCard"
