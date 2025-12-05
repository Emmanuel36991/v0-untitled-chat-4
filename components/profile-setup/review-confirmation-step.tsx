"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertCircle } from "lucide-react"
import type { UserConfiguration } from "@/types/user-config"

interface ReviewConfirmationStepProps {
  config: UserConfiguration
}

export function ReviewConfirmationStep({ config }: ReviewConfirmationStepProps) {
  const allRequiredFieldsComplete =
    config.privacyPreferences.termsAccepted &&
    config.privacyPreferences.privacyPolicyAccepted &&
    config.privacyPreferences.dataCollectionConsent &&
    (config.tradingPreferences.methodologies?.length ?? 0) > 0 &&
    (config.tradingPreferences.primaryInstruments?.length ?? 0) > 0

  const ReviewSection = ({
    title,
    items,
    icon: Icon,
  }: {
    title: string
    items: Array<{ label: string; value: string | number | boolean }>
    icon: React.ComponentType<{ className?: string }>
  }) => (
    <Card className="border-2 border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium text-foreground">
                {typeof item.value === "boolean" ? (item.value ? "Accepted" : "Not Set") : item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Review Your Profile Setup</h3>
        <p className="text-muted-foreground mb-6">
          Please review all your settings before completing the setup process.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReviewSection
          icon={CheckCircle2}
          title="Trading Configuration"
          items={[
            { label: "Methodologies", value: config.tradingPreferences.methodologies?.length ?? 0 },
            { label: "Markets", value: config.tradingPreferences.primaryInstruments?.length ?? 0 },
            { label: "Instruments", value: config.tradingPreferences.specificInstruments?.length ?? 0 },
            {
              label: "24-Hour Format",
              value: config.tradingPreferences.use24HourFormat ? "Enabled" : "Disabled",
            },
          ]}
        />

        <ReviewSection
          icon={CheckCircle2}
          title="Personal Information"
          items={[
            { label: "Full Name", value: config.userProfile.fullName || "Not Provided" },
            { label: "Experience Level", value: config.userProfile.experienceLevel || "Not Selected" },
            { label: "Account Type", value: config.userProfile.accountType || "Not Selected" },
          ]}
        />

        <ReviewSection
          icon={CheckCircle2}
          title="Notifications"
          items={[
            { label: "New Features", value: config.notificationPreferences.emailNewFeatures ?? false },
            { label: "Trade Milestones", value: config.notificationPreferences.emailTradeMilestones ?? false },
            { label: "Weekly Digest", value: config.notificationPreferences.emailWeeklyDigest ?? false },
            { label: "Community Insights", value: config.notificationPreferences.emailCommunityInsights ?? false },
          ]}
        />

        <ReviewSection
          icon={CheckCircle2}
          title="Legal & Privacy"
          items={[
            { label: "Terms Accepted", value: config.privacyPreferences.termsAccepted ?? false },
            { label: "Privacy Accepted", value: config.privacyPreferences.privacyPolicyAccepted ?? false },
            { label: "Data Consent", value: config.privacyPreferences.dataCollectionConsent ?? false },
            { label: "Marketing Emails", value: config.privacyPreferences.marketingEmailsOptIn ?? false },
          ]}
        />
      </div>

      {/* Completion Status */}
      <Card
        className={`border-2 ${
          allRequiredFieldsComplete ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={allRequiredFieldsComplete ? "text-green-600" : "text-amber-600"}>
              {allRequiredFieldsComplete ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                {allRequiredFieldsComplete ? "Ready to Complete Setup" : "Incomplete Setup"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {allRequiredFieldsComplete
                  ? "All required fields are complete. Click 'Complete Setup' to finalize your profile."
                  : "Please ensure all required fields are completed before proceeding."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
