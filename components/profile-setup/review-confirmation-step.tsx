"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Rocket, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserConfiguration } from "@/types/user-config"

interface ReviewConfirmationStepProps {
  config: UserConfiguration
  onLaunch?: () => void
  isLaunching?: boolean
}

export function ReviewConfirmationStep({ config, onLaunch, isLaunching = false }: ReviewConfirmationStepProps) {
  const allRequiredFieldsComplete =
    config.privacyPreferences.termsAccepted &&
    config.privacyPreferences.privacyPolicyAccepted &&
    config.privacyPreferences.dataCollectionConsent &&
    (config.tradingPreferences.primaryInstruments?.length ?? 0) > 0 &&
    (config.userProfile.fullName?.trim().length ?? 0) >= 3

  const ReviewSection = ({
    title,
    items,
    icon: Icon,
  }: {
    title: string
    items: Array<{ label: string; value: string | number | boolean }>
    icon: React.ComponentType<{ className?: string }>
  }) => (
    <Card className="border border-border">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm text-foreground">{title}</h4>
        </div>
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-4">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium text-foreground text-right">
                {typeof item.value === "boolean" ? (
                  item.value ? (
                    <span className="text-emerald-600">Accepted</span>
                  ) : (
                    <span className="text-muted-foreground">Not Set</span>
                  )
                ) : (
                  item.value || <span className="text-muted-foreground">Not Set</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReviewSection
          icon={CheckCircle2}
          title="Trading Configuration"
          items={[
            { label: "Markets", value: config.tradingPreferences.primaryInstruments?.length ?? 0 },
            { label: "Instruments", value: config.tradingPreferences.specificInstruments?.length ?? 0 },
            { label: "Visible in forms", value: config.tradingPreferences.visibleInstruments?.length ?? 0 },
          ]}
        />

        <ReviewSection
          icon={CheckCircle2}
          title="Personal Information"
          items={[
            { label: "Full Name", value: config.userProfile.fullName || "Not Provided" },
            { label: "Experience", value: config.userProfile.experienceLevel || "Not Selected" },
            { label: "Style", value: config.userProfile.accountType?.replace("_", " ") || "Not Selected" },
          ]}
        />

        <ReviewSection
          icon={CheckCircle2}
          title="Notifications"
          items={[
            { label: "New Features", value: config.notificationPreferences.emailNewFeatures ?? false },
            { label: "Trade Milestones", value: config.notificationPreferences.emailTradeMilestones ?? false },
            { label: "Weekly Digest", value: config.notificationPreferences.emailWeeklyDigest ?? false },
          ]}
        />

        <ReviewSection
          icon={CheckCircle2}
          title="Legal & Privacy"
          items={[
            { label: "Terms Accepted", value: config.privacyPreferences.termsAccepted ?? false },
            { label: "Privacy Accepted", value: config.privacyPreferences.privacyPolicyAccepted ?? false },
            { label: "Data Consent", value: config.privacyPreferences.dataCollectionConsent ?? false },
          ]}
        />
      </div>

      {/* Completion Status */}
      <Card
        className={cn(
          "border",
          allRequiredFieldsComplete ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={allRequiredFieldsComplete ? "text-emerald-600" : "text-amber-600"}>
              {allRequiredFieldsComplete ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                {allRequiredFieldsComplete ? "Ready to launch" : "Incomplete Setup"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {allRequiredFieldsComplete
                  ? "Everything looks good. Launch your dashboard to start journaling."
                  : "Please go back and ensure all required fields are completed."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Launch Button */}
      {onLaunch && (
        <Button
          size="lg"
          onClick={onLaunch}
          disabled={!allRequiredFieldsComplete || isLaunching}
          className="w-full h-14 text-base font-bold gap-3 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all"
        >
          {isLaunching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Setting up your workspace...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              Launch Dashboard
            </>
          )}
        </Button>
      )}
    </div>
  )
}
