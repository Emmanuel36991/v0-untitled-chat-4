"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User, Target, Briefcase, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserProfile } from "@/types/user-config"

interface ProfileInfoStepProps {
  userProfile: UserProfile
  onUpdate: (profile: Partial<UserProfile>) => void
  showValidation?: boolean
}

const NAME_MAX = 50

export function ProfileInfoStep({ userProfile, onUpdate, showValidation = false }: ProfileInfoStepProps) {
  const [nameTouched, setNameTouched] = useState(false)

  const nameValue = userProfile.fullName || ""
  const nameValid = nameValue.trim().length >= 3
  const showNameError = (nameTouched || showValidation) && !nameValid && nameValue.length > 0
  const showNameSuccess = nameValid
  const showNameRequired = (nameTouched || showValidation) && nameValue.trim().length === 0

  return (
    <div className="space-y-8">
      {/* Full Name — Required */}
      <div className="space-y-2">
        <label className="block">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal text-destructive border-destructive/30">Required</Badge>
          </span>
          <div className="relative mt-2">
            <Input
              type="text"
              placeholder="e.g., John Doe"
              value={nameValue}
              maxLength={NAME_MAX}
              onChange={(e) => onUpdate({ fullName: e.target.value })}
              onBlur={() => setNameTouched(true)}
              className={cn(
                "pr-10 transition-colors",
                showNameError || showNameRequired
                  ? "border-destructive focus-visible:ring-destructive/50"
                  : showNameSuccess
                    ? "border-emerald-500 focus-visible:ring-emerald-500/50"
                    : ""
              )}
            />
            {showNameSuccess && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            )}
            {(showNameError || showNameRequired) && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
            )}
          </div>
        </label>
        <div className="flex items-center justify-between">
          {showNameRequired ? (
            <p className="text-xs text-destructive">Please enter your name to continue.</p>
          ) : showNameError ? (
            <p className="text-xs text-destructive">Name must be at least 3 characters.</p>
          ) : (
            <p className="text-xs text-muted-foreground">How you'd like to be addressed in the app.</p>
          )}
          <span className={cn(
            "text-xs tabular-nums",
            nameValue.length > 0 ? (nameValid ? "text-emerald-500" : "text-muted-foreground") : "text-muted-foreground"
          )}>
            {nameValue.length}/{NAME_MAX}
          </span>
        </div>
      </div>

      {/* Experience Level — Optional */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Target className="w-4 h-4" />
            Trading Experience
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">Optional</Badge>
          </label>
          <p className="text-xs text-muted-foreground mt-1">Helps tailor analytics and AI suggestions to your level.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "beginner" as const, label: "Beginner", desc: "Less than 1 year of active trading" },
            { id: "intermediate" as const, label: "Intermediate", desc: "1-3 years of trading experience" },
            { id: "advanced" as const, label: "Advanced", desc: "3-5 years of experience" },
            { id: "expert" as const, label: "Expert", desc: "5+ years, consistently profitable" },
          ]).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onUpdate({ experienceLevel: opt.id })}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                userProfile.experienceLevel === opt.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <h4 className="font-semibold text-sm text-foreground">{opt.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Account Type — Optional */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Trading Style
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">Optional</Badge>
          </label>
          <p className="text-xs text-muted-foreground mt-1">Used to customize default chart timeframes and holding period metrics.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "day_trader" as const, label: "Day Trading", desc: "Trades close in same day" },
            { id: "swing_trader" as const, label: "Swing Trading", desc: "Trades held for days/weeks" },
            { id: "position_trader" as const, label: "Position Trading", desc: "Trades held for weeks/months" },
            { id: "institution" as const, label: "Institutional", desc: "Firm or algo trading" },
          ]).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onUpdate({ accountType: opt.id })}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                userProfile.accountType === opt.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <h4 className="font-semibold text-sm text-foreground">{opt.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Trading Goals — Optional */}
      <div className="space-y-2">
        <label className="block">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            Trading Goals
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">Optional</Badge>
          </span>
          <textarea
            placeholder="e.g., Achieve 5% monthly returns, build a mechanical trading system, master risk management..."
            value={userProfile.tradingGoals || ""}
            onChange={(e) => onUpdate({ tradingGoals: e.target.value })}
            className="w-full mt-2 px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
            rows={3}
          />
        </label>
        <p className="text-xs text-muted-foreground">Helps us personalize your trading journal experience.</p>
      </div>
    </div>
  )
}
