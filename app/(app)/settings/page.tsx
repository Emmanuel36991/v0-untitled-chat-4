"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useUserConfig } from "@/hooks/use-user-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Sun, Moon, Laptop, Settings2 } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { isLoaded: isUserConfigLoaded } = useUserConfig()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChangePreferences = () => {
    router.push("/signup/profile-setup?step=1")
  }

  if (!isUserConfigLoaded || !mounted) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>Loading your settings...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center min-h-[200px]">
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="max-w-xl mx-auto bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Settings</CardTitle>
          <CardDescription>Manage your application appearance and account preferences.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Appearance Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Appearance</h3>
            <div className="space-y-3">
              <Label className="text-lg font-medium text-foreground">Theme</Label>
              <p className="text-sm text-muted-foreground">Select how TradeTrack looks.</p>
              <RadioGroup
                value={theme || "system"}
                onValueChange={(value) => {
                  setTheme(value)
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
              >
                {[
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Laptop },
                ].map((item) => (
                  <Label
                    key={item.value}
                    htmlFor={`theme-${item.value}`}
                    className={`flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer
                    ${theme === item.value ? "border-primary bg-accent" : "border-muted"}`}
                  >
                    <RadioGroupItem value={item.value} id={`theme-${item.value}`} className="sr-only" />
                    <item.icon className="mb-2 h-6 w-6" />
                    {item.label}
                  </Label>
                ))}
              </RadioGroup>
              {mounted && <p className="text-xs text-muted-foreground">Current resolved theme: {resolvedTheme}</p>}
            </div>
          </section>

          <Separator />

          {/* Account Preferences Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Account Preferences</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Customize your trading methodologies, primary instruments, notification settings, and more to tailor
              TradeTrack to your needs.
            </p>
            <Button
              onClick={handleChangePreferences}
              className="w-full sm:w-auto"
              disabled={!isUserConfigLoaded}
              variant="outline"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Change My Preferences
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              You will be guided through a setup process to update your choices.
            </p>
          </section>
        </CardContent>
        <CardFooter className="pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Your preferences are saved automatically as you make changes in the preference setup.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
