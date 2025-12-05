"use client"
import { Input } from "@/components/ui/input"
import { User, Target, Briefcase } from "lucide-react"
import type { UserProfile } from "@/types/user-config"

interface ProfileInfoStepProps {
  userProfile: UserProfile
  onUpdate: (profile: Partial<UserProfile>) => void
}

export function ProfileInfoStep({ userProfile, onUpdate }: ProfileInfoStepProps) {
  const ExperienceLevelOption = ({
    id,
    label,
    description,
  }: {
    id: "beginner" | "intermediate" | "advanced" | "expert"
    label: string
    description: string
  }) => (
    <div
      onClick={() => onUpdate({ experienceLevel: id })}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        userProfile.experienceLevel === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
    >
      <h4 className="font-semibold text-foreground">{label}</h4>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  )

  const AccountTypeOption = ({
    id,
    label,
    description,
  }: {
    id: "day_trader" | "swing_trader" | "position_trader" | "institution"
    label: string
    description: string
  }) => (
    <div
      onClick={() => onUpdate({ accountType: id })}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        userProfile.accountType === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
    >
      <h4 className="font-semibold text-foreground">{label}</h4>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Profile Information</h3>
        <p className="text-muted-foreground mb-6">
          Help us understand your trading profile to provide better insights.
        </p>
      </div>

      {/* Full Name (Optional) */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name (Optional)
          </span>
          <Input
            type="text"
            placeholder="John Doe"
            value={userProfile.fullName || ""}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
            className="mt-2"
          />
        </label>
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Target className="w-4 h-4" />
          Trading Experience Level
        </label>
        <div className="grid grid-cols-2 gap-3">
          <ExperienceLevelOption id="beginner" label="Beginner" description="Less than 1 year of active trading" />
          <ExperienceLevelOption id="intermediate" label="Intermediate" description="1-3 years of trading experience" />
          <ExperienceLevelOption id="advanced" label="Advanced" description="3-5 years of experience" />
          <ExperienceLevelOption id="expert" label="Expert" description="5+ years, consistently profitable" />
        </div>
      </div>

      {/* Account Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Trading Account Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <AccountTypeOption id="day_trader" label="Day Trading" description="Trades close in same day" />
          <AccountTypeOption id="swing_trader" label="Swing Trading" description="Trades held for days/weeks" />
          <AccountTypeOption id="position_trader" label="Position Trading" description="Trades held for weeks/months" />
          <AccountTypeOption id="institution" label="Institutional" description="Firm or algo trading" />
        </div>
      </div>

      {/* Trading Goals */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-foreground mb-2">Trading Goals (Optional)</span>
          <textarea
            placeholder="e.g., Achieve 5% monthly returns, build a mechanical trading system, master risk management..."
            value={userProfile.tradingGoals || ""}
            onChange={(e) => onUpdate({ tradingGoals: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={4}
          />
        </label>
        <p className="text-xs text-muted-foreground">Help us personalize your trading journey</p>
      </div>
    </div>
  )
}
