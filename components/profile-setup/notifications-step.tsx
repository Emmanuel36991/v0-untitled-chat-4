"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, TrendingUp, Users, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationPreferences } from "@/types/user-config"

interface NotificationsStepProps {
  notificationPreferences: NotificationPreferences
  onUpdate: (prefs: Partial<NotificationPreferences>) => void
}

interface NotificationOptionProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  value: boolean | undefined
  onChange: () => void
  badge?: string
}

function NotificationOption({
  title,
  description,
  icon: Icon,
  value,
  onChange,
  badge,
}: NotificationOptionProps) {
  return (
    <div className="flex items-start justify-between p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-1 text-primary flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground">{title}</h4>
            {badge && <Badge variant="outline">{badge}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full flex-shrink-0 transition-colors ml-4",
          value ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            value ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  )
}

export function NotificationsStep({ notificationPreferences, onUpdate }: NotificationsStepProps) {
  if (!notificationPreferences) {
    return null
  }

  const toggleNotification = (key: keyof NotificationPreferences) => {
    onUpdate({ [key]: !notificationPreferences[key] })
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Notification Preferences</h3>
        <p className="text-muted-foreground mb-6">
          Choose how you'd like to stay updated about your trading activity and platform updates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <NotificationOption
          icon={Zap}
          title="Platform Updates"
          description="Get notified about new features, improvements, and service updates"
          value={notificationPreferences.emailNewFeatures}
          onChange={() => toggleNotification("emailNewFeatures")}
          badge="Recommended"
        />

        <NotificationOption
          icon={TrendingUp}
          title="Trade Milestones"
          description="Celebrate achievements like 10 winning trades or reaching profit goals"
          value={notificationPreferences.emailTradeMilestones}
          onChange={() => toggleNotification("emailTradeMilestones")}
        />

        <NotificationOption
          icon={Bell}
          title="Weekly Digest"
          description="Get a summary of your trading activity, insights, and performance metrics"
          value={notificationPreferences.emailWeeklyDigest}
          onChange={() => toggleNotification("emailWeeklyDigest")}
        />

        <NotificationOption
          icon={Users}
          title="Community Insights"
          description="Learn from other traders' experiences and community highlights"
          value={notificationPreferences.emailCommunityInsights}
          onChange={() => toggleNotification("emailCommunityInsights")}
        />

        <NotificationOption
          icon={Bell}
          title="Real-Time Trade Alerts"
          description="Receive notifications when important trade events occur"
          value={notificationPreferences.tradeAlerts}
          onChange={() => toggleNotification("tradeAlerts")}
          badge="Pro Feature"
        />
      </div>

      <Card className="border-2 border-border bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            You can change these preferences anytime in your account settings. We'll never send unwanted emails and
            always respect your choices.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
