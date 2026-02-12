"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Shield, Lock, FileText, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PrivacyPreferences } from "@/types/user-config"

interface LegalPrivacyStepProps {
  privacyPreferences: PrivacyPreferences
  onUpdate: (prefs: Partial<PrivacyPreferences>) => void
}

interface ConsentCardProps {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  checked: boolean
  onToggle: () => void
  href?: string
  details: string[]
  expanded: boolean
  onExpand: (id: string | null) => void
}

function ConsentCard({
  id,
  title,
  description,
  icon: Icon,
  checked,
  onToggle,
  href,
  details,
  expanded,
  onExpand,
}: ConsentCardProps) {
  return (
    <div className="border-2 border-border rounded-xl overflow-hidden transition-all">
      <div className="flex w-full">
        <button
          onClick={() => onExpand(expanded ? null : id)}
          className="flex-1 p-4 hover:bg-muted/50 transition-colors text-left flex items-start gap-4"
        >
          <div className="mt-1 flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{title}</h4>
              {href && (
                <a
                  href={href}
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:text-indigo-600 hover:underline flex items-center gap-0.5"
                >
                  (Read full document <span className="text-[10px] ml-0.5">↗</span>)
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border bg-muted/30 p-4">
          <ul className="space-y-2">
            {details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-1">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-4 py-3 bg-card border-t border-border flex items-center justify-between">
        <span className="text-sm font-medium">{checked ? "Accepted" : "Not accepted"}</span>
        <button
          onClick={onToggle}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            checked ? "bg-primary" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              checked ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>
    </div>
  )
}

export function LegalPrivacyStep({ privacyPreferences, onUpdate }: LegalPrivacyStepProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  if (!privacyPreferences) {
    return null
  }

  const allConsentsGiven =
    privacyPreferences.termsAccepted &&
    privacyPreferences.privacyPolicyAccepted &&
    privacyPreferences.dataCollectionConsent

  const toggleConsent = (key: keyof PrivacyPreferences) => {
    onUpdate({ [key]: !privacyPreferences[key] })
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Legal & Privacy Settings</h3>
        <p className="text-muted-foreground mb-6">
          We're committed to protecting your data. Please review our legal documents and privacy settings.
        </p>
      </div>

      <div className="space-y-4">
        {/* Terms of Service */}
        <ConsentCard
          id="terms"
          icon={FileText}
          title="Terms of Service"
          description="I agree to the Terms of Service and understand my rights and responsibilities."
          checked={privacyPreferences.termsAccepted || false}
          onToggle={() => toggleConsent("termsAccepted")}
          href="/terms"
          details={[
            "User account creation and management",
            "Prohibited activities and misuse prevention",
            "Limitation of liability and disclaimers",
            "Dispute resolution and jurisdiction",
            "Service modifications and discontinuation",
          ]}
          expanded={expandedSection === "terms"}
          onExpand={setExpandedSection}
        />

        {/* Privacy Policy */}
        <ConsentCard
          id="privacy"
          icon={Shield}
          title="Privacy Policy"
          description="I acknowledge that I have read and understand how my data is collected and used."
          checked={privacyPreferences.privacyPolicyAccepted || false}
          onToggle={() => toggleConsent("privacyPolicyAccepted")}
          href="/privacy"
          details={[
            "Personal data collection and processing",
            "Data storage and security measures",
            "Your rights and data access requests",
            "Third-party integrations and sharing",
            "Cookie usage and tracking technologies",
          ]}
          expanded={expandedSection === "privacy"}
          onExpand={setExpandedSection}
        />

        {/* Data Collection */}
        <ConsentCard
          id="data-collection"
          icon={Lock}
          title="Data Collection Consent"
          description="I consent to collection of essential data to improve my trading experience."
          checked={privacyPreferences.dataCollectionConsent || false}
          onToggle={() => toggleConsent("dataCollectionConsent")}
          details={[
            "Trading activity and performance metrics",
            "Platform usage patterns and preferences",
            "Error logs and technical diagnostics",
            "Aggregated analytics (no personal ID)",
            "Feature usage to improve functionality",
          ]}
          expanded={expandedSection === "data-collection"}
          onExpand={setExpandedSection}
        />

        {/* Marketing Emails */}
        <ConsentCard
          id="marketing"
          icon={Mail}
          title="Marketing Communications (Optional)"
          description="I'd like to receive email updates about new features and educational content."
          checked={privacyPreferences.marketingEmailsOptIn || false}
          onToggle={() => toggleConsent("marketingEmailsOptIn")}
          details={[
            "New feature announcements and updates",
            "Trading tips and educational content",
            "Special promotions and early access",
            "Community highlights and success stories",
            "You can unsubscribe anytime from emails",
          ]}
          expanded={expandedSection === "marketing"}
          onExpand={setExpandedSection}
        />
      </div>

      {/* Compliance Status */}
      <Card className="border-2 border-border bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("mt-1", allConsentsGiven ? "text-green-600" : "text-amber-600")}>
              {allConsentsGiven ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                {allConsentsGiven ? "All Required Consents Accepted" : "Required Consents Pending"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {allConsentsGiven
                  ? "You've accepted all required legal and privacy terms. You can now proceed with account setup."
                  : "Please accept the Terms of Service, Privacy Policy, and Data Collection Consent to continue."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
