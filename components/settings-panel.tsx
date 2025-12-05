"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sun, Moon, Laptop, Cog } from "lucide-react"
import { useUserConfig } from "@/hooks/use-user-config"

interface SettingsPanelProps {
  onDone?: () => void // Optional callback for when dialog might close
}

export function SettingsPanel({ onDone }: SettingsPanelProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { isLoaded: isUserConfigLoaded } = useUserConfig() // config object not directly used here

  const handleNavigateToPreferences = () => {
    router.push("/signup/profile-setup?step=1")
    if (onDone) {
      onDone() // Close dialog if callback provided
    }
  }

  return (
    <div className="space-y-8 py-4">
      <div>
        <h3 className="text-lg font-medium mb-4 text-foreground">Appearance</h3>
        <RadioGroup
          value={theme}
          onValueChange={(newTheme) => setTheme(newTheme)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem value="light" id="light" className="peer sr-only" />
            <Label
              htmlFor="light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
            >
              <Sun className="mb-2 h-6 w-6" />
              Light
            </Label>
          </div>
          <div>
            <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
            <Label
              htmlFor="dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
            >
              <Moon className="mb-2 h-6 w-6" />
              Dark
            </Label>
          </div>
          <div>
            <RadioGroupItem value="system" id="system" className="peer sr-only" />
            <Label
              htmlFor="system"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
            >
              <Laptop className="mb-2 h-6 w-6" />
              System
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-medium mb-3 text-foreground">Account Preferences</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Customize your trading profile, methodologies, and other application settings.
        </p>
        <Button
          onClick={handleNavigateToPreferences}
          disabled={!isUserConfigLoaded}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          type="button" // Explicitly set type for buttons not submitting forms
        >
          <Cog className="mr-2 h-4 w-4" />
          Change My Preferences
        </Button>
      </div>
    </div>
  )
}
