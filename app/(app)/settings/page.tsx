"use client"

import React, { useState, useEffect } from "react"
import { useUserConfig } from "@/hooks/use-user-config"
import { useSubscription } from "@/hooks/use-subscription"
import { useTheme } from "next-themes"
import {
  User, Activity, Palette, Bell, Loader2, Save,
  Plus, X, Search, BookOpen, Layers, Zap,
  Monitor, Moon, Sun, Check, Trash2, Sliders,
  Shield, Download, AlertTriangle, CreditCard,
  Mail, Lock, Key, ExternalLink, Eye, EyeOff,
  Calendar, ArrowUpRight, Clock
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { exportUserData, requestAccountDeletion, cancelAccountDeletion } from "@/app/actions/account-management-actions"
import { cancelUserSubscription } from "@/app/actions/rapyd-actions"

// --- TYPES ---

type Strategy = {
  id: string
  name: string
  description?: string
  confluences: string[]
  isPreset?: boolean
}

const PRESET_STRATEGIES: Strategy[] = [
  {
    id: "ict_concepts",
    name: "ICT Concepts",
    description: "Inner Circle Trader methodology focusing on institutional order flow.",
    confluences: ["Fair Value Gap (FVG)", "Order Block", "Market Structure Shift", "Liquidity Sweep", "Optimal Trade Entry"],
    isPreset: true
  },
  {
    id: "wyckoff",
    name: "Wyckoff Method",
    description: "Analysis of market phases: Accumulation, Markup, Distribution, Markdown.",
    confluences: ["Spring", "Upthrust", "Sign of Strength", "Sign of Weakness", "Trading Range"],
    isPreset: true
  },
  {
    id: "smc",
    name: "Smart Money Concepts",
    description: "Modern interpretation of institutional trading logic.",
    confluences: ["Change of Character (CHoCH)", "Break of Structure (BOS)", "Supply/Demand Zone", "Inducement"],
    isPreset: true
  },
  {
    id: "price_action",
    name: "Pure Price Action",
    description: "Trading based on naked chart patterns and candlesticks.",
    confluences: ["Pin Bar", "Engulfing Candle", "Support/Resistance Flip", "Trendline Break"],
    isPreset: true
  }
]

// --- COMPONENTS ---

function ThemeSelector() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-24 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />

  const activeTheme = theme === "system" ? "system" : resolvedTheme

  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { name: "light", label: "Light", icon: Sun },
        { name: "dark", label: "Dark", icon: Moon },
        { name: "system", label: "System", icon: Monitor },
      ].map((t) => {
        const Icon = t.icon
        const isActive = theme === t.name

        return (
          <button
            key={t.name}
            onClick={() => {
                setTheme(t.name)
                toast.success(`Theme set to ${t.label}`)
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
              isActive
                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-950"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            )}
          >
            <div className={cn("p-2 rounded-full", isActive ? "bg-indigo-100 dark:bg-indigo-900" : "bg-slate-100 dark:bg-slate-800")}>
               <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function StrategyManager({
  userStrategies,
  onUpdate
}: {
  userStrategies: any[],
  onUpdate: (strategies: any[]) => void
}) {
  const [activeTab, setActiveTab] = useState<"my_strategies" | "library">("my_strategies")
  const [searchQuery, setSearchQuery] = useState("")

  // Strategy Builder State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [newStratName, setNewStratName] = useState("")
  const [newStratDesc, setNewStratDesc] = useState("")
  const [newConfluences, setNewConfluences] = useState<string[]>([])
  const [confluenceInput, setConfluenceInput] = useState("")

  const handleAddConfluence = () => {
    if (confluenceInput.trim()) {
      setNewConfluences([...newConfluences, confluenceInput.trim()])
      setConfluenceInput("")
    }
  }

  const handleCreateStrategy = () => {
    if (!newStratName.trim()) {
      toast.error("Strategy name is required")
      return
    }

    const newStrategy: Strategy = {
      id: `custom_${Date.now()}`,
      name: newStratName,
      description: newStratDesc,
      confluences: newConfluences,
      isPreset: false
    }

    onUpdate([...userStrategies, newStrategy])
    setIsBuilderOpen(false)
    setNewStratName("")
    setNewStratDesc("")
    setNewConfluences([])
    toast.success("Custom strategy created!")
  }

  const handleInstallPreset = (preset: Strategy) => {
    const exists = userStrategies.find(s => s.name === preset.name)
    if (exists) {
      toast.error("Strategy already added")
      return
    }
    onUpdate([...userStrategies, { ...preset }])
    toast.success(`${preset.name} added to your arsenal`)
  }

  const handleRemoveStrategy = (id: string) => {
    onUpdate(userStrategies.filter(s => s.id !== id))
    toast.success("Strategy removed")
  }

  return (
    <div className="space-y-6">

      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("my_strategies")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === "my_strategies" ? "bg-white dark:bg-slate-950 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          My Strategies
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
            activeTab === "library" ? "bg-white dark:bg-slate-950 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          Browse Library
        </button>
      </div>

      {/* --- TAB 1: MY STRATEGIES --- */}
      {activeTab === "my_strategies" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">Active Playbooks ({userStrategies.length})</h3>
            <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Create Custom
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Strategy</DialogTitle>
                  <DialogDescription>Define a new trading system and its rules.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Strategy Name</Label>
                    <Input placeholder="e.g. Morning Breakout" value={newStratName} onChange={e => setNewStratName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Briefly describe the entry criteria..." value={newStratDesc} onChange={e => setNewStratDesc(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Confluences (Checklist)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add rule (e.g. RSI > 70)"
                        value={confluenceInput}
                        onChange={e => setConfluenceInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddConfluence()}
                      />
                      <Button onClick={handleAddConfluence} variant="secondary" size="icon"><Plus className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newConfluences.map((c, i) => (
                        <Badge key={i} variant="secondary" className="pl-2 pr-1 py-0.5">
                          {c} <button onClick={() => setNewConfluences(newConfluences.filter((_, idx) => idx !== i))} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateStrategy} className="bg-indigo-600 text-white">Create Strategy</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userStrategies.map((strat, idx) => (
              <div key={strat.id || idx} className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {strat.name}
                      {strat.isPreset && <Badge variant="secondary" className="text-[10px] h-5">Preset</Badge>}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{strat.description || "No description provided."}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    onClick={() => handleRemoveStrategy(strat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {strat.confluences && strat.confluences.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Confluences</p>
                    <div className="flex flex-wrap gap-1.5">
                      {strat.confluences.slice(0, 4).map((c: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                          {c}
                        </Badge>
                      ))}
                      {strat.confluences.length > 4 && (
                        <span className="text-[10px] text-slate-400 flex items-center">+{strat.confluences.length - 4} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {userStrategies.length === 0 && (
              <div className="col-span-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                <Layers className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No strategies defined yet.</p>
                <Button variant="link" className="text-indigo-600" onClick={() => setActiveTab("library")}>Browse Library</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: LIBRARY --- */}
      {activeTab === "library" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search strategies..."
              className="pl-9 bg-white dark:bg-slate-950"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {PRESET_STRATEGIES
              .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((preset) => {
                const isInstalled = userStrategies.some(s => s.name === preset.name)
                return (
                  <div key={preset.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="mb-4 sm:mb-0">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {preset.name}
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100">Verified</Badge>
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">{preset.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {preset.confluences.slice(0, 3).map((c, i) => (
                          <span key={i} className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleInstallPreset(preset)}
                      disabled={isInstalled}
                      variant={isInstalled ? "secondary" : "default"}
                      className={cn("sm:w-32", !isInstalled && "bg-indigo-600 hover:bg-indigo-700 text-white")}
                    >
                      {isInstalled ? <><Check className="w-4 h-4 mr-2" /> Installed</> : "Install"}
                    </Button>
                  </div>
                )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function InstrumentManager({ items = [], onUpdate }: { items: string[], onUpdate: (items: string[]) => void }) {
  const [input, setInput] = useState("")

  const add = () => {
    const val = input.toUpperCase().trim()
    if (val && !items.includes(val)) {
      onUpdate([...items, val])
      setInput("")
      toast.success(`Added ${val}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Symbol (e.g. ES, BTC, AAPL)"
          className="uppercase"
        />
        <Button onClick={add} variant="secondary">Add</Button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[60px] p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        {items.length === 0 && <span className="text-sm text-slate-400 italic">No instruments configured.</span>}
        {items.map(item => (
          <Badge key={item} variant="outline" className="h-8 px-3 text-sm bg-white dark:bg-slate-800 gap-2">
            {item}
            <button onClick={() => onUpdate(items.filter(i => i !== item))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
          </Badge>
        ))}
      </div>
    </div>
  )
}

// --- Toggle Row Helper ---
function ToggleRow({
  label, description, checked, onCheckedChange, disabled
}: {
  label: string; description: string; checked?: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5 max-w-md">
        <Label className="text-base">{label}</Label>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}

// --- MAIN PAGE ---

export default function SettingsPage() {
  const {
    config, isLoading, updateUserProfile, updateTradingPreferences,
    updatePrivacyPreferences, updateNotificationPreferences, updateConfig
  } = useUserConfig()
  const { subscription, tier, hasActiveSubscription, isLoading: subLoading } = useSubscription()
  const [isSaving, setIsSaving] = useState(false)

  // User auth state
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null)
  const [isOAuthUser, setIsOAuthUser] = useState(false)

  // Local Form States
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    experienceLevel: "beginner",
    tradingStyle: "day_trader"
  })

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Export state
  const [isExporting, setIsExporting] = useState(false)

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Cancel subscription state
  const [showCancelSubDialog, setShowCancelSubDialog] = useState(false)
  const [isCancelingSub, setIsCancelingSub] = useState(false)

  // Load auth user info
  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
        setUserCreatedAt(user.created_at || null)
        // Detect OAuth users — they have identities with a provider other than email
        const providers = user.app_metadata?.providers || []
        setIsOAuthUser(providers.includes("google") || providers.includes("github"))
      }
    }
    loadUser()
  }, [])

  // Sync with DB config on load
  useEffect(() => {
    if (config) {
      setFormData({
        fullName: config.userProfile.fullName || "",
        bio: config.userProfile.bio || "",
        experienceLevel: config.userProfile.experienceLevel || "beginner",
        tradingStyle: config.userProfile.tradingStyle || "day_trader"
      })
    }
  }, [config])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    await updateUserProfile(formData)
    setIsSaving(false)
    toast.success("Profile updated successfully")
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setIsChangingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Password updated successfully")
        setPasswordForm({ newPassword: "", confirmPassword: "" })
      }
    } catch {
      toast.error("Failed to update password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const result = await exportUserData()
      if (result.success && result.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `concentrade-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Data exported successfully")
      } else {
        toast.error(result.error || "Export failed")
      }
    } catch {
      toast.error("Failed to export data")
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return
    setIsDeleting(true)
    try {
      const result = await requestAccountDeletion()
      if (result.success) {
        toast.success("Account deletion scheduled. You have 30 days to cancel.")
        setShowDeleteDialog(false)
        setDeleteConfirmText("")
        // Refresh config to pick up deletionRequestedAt
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to request deletion")
      }
    } catch {
      toast.error("Failed to request account deletion")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDeletion = async () => {
    try {
      const result = await cancelAccountDeletion()
      if (result.success) {
        toast.success("Account deletion cancelled")
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to cancel deletion")
      }
    } catch {
      toast.error("Failed to cancel deletion")
    }
  }

  const handleCancelSubscription = async () => {
    setIsCancelingSub(true)
    try {
      await cancelUserSubscription(true)
      toast.success("Subscription will be cancelled at the end of the billing period")
      setShowCancelSubDialog(false)
    } catch {
      toast.error("Failed to cancel subscription")
    } finally {
      setIsCancelingSub(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const currentStrategies = (config.tradingPreferences.methodologies || []) as any[]
  const deletionRequested = config.privacyPreferences.deletionRequestedAt
  const deletionDate = deletionRequested
    ? new Date(new Date(deletionRequested).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null

  const tabTriggerClass = "h-10 rounded-lg gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400 font-medium text-xs sm:text-sm"

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B0D12] pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Deletion warning banner */}
        {deletionRequested && deletionDate && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <p className="font-bold text-red-900 dark:text-red-100 text-sm">Account scheduled for deletion</p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  Your account and all data will be permanently deleted on {deletionDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 shrink-0" onClick={handleCancelDeletion}>
              Cancel Deletion
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your trading DNA, preferences, and workspace.</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-8">

          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto sm:h-12 items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-1">
            <TabsTrigger value="general" className={tabTriggerClass}>
              <User className="h-4 w-4" /> <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className={tabTriggerClass}>
              <Activity className="h-4 w-4" /> <span className="hidden sm:inline">Trading DNA</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className={tabTriggerClass}>
              <Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className={tabTriggerClass}>
              <Palette className="h-4 w-4" /> <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className={tabTriggerClass}>
              <Shield className="h-4 w-4" /> <span className="hidden sm:inline">Privacy & Data</span>
            </TabsTrigger>
            <TabsTrigger value="account" className={tabTriggerClass}>
              <Key className="h-4 w-4" /> <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* --- TAB 1: GENERAL PROFILE --- */}
          <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Profile Identity</CardTitle>
                <CardDescription>This information helps the AI tailor its advice to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Select value={formData.experienceLevel} onValueChange={(v: any) => setFormData({...formData, experienceLevel: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-1 Years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (1-3 Years)</SelectItem>
                        <SelectItem value="advanced">Advanced (3-5 Years)</SelectItem>
                        <SelectItem value="pro">Pro (5+ Years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Trading Style</Label>
                    <Select value={formData.tradingStyle} onValueChange={(v: any) => setFormData({...formData, tradingStyle: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scalper">Scalper</SelectItem>
                        <SelectItem value="day_trader">Day Trader</SelectItem>
                        <SelectItem value="swing_trader">Swing Trader</SelectItem>
                        <SelectItem value="position_trader">Position Trader</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                   <Label>Bio / Goals</Label>
                   <Textarea
                     value={formData.bio}
                     onChange={e => setFormData({...formData, bio: e.target.value})}
                     placeholder="What are your main trading goals?"
                     className="h-24 resize-none"
                   />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end p-4 rounded-b-xl">
                 <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                 </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* --- TAB 2: TRADING DNA --- */}
          <TabsContent value="trading" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Col: Strategies */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600"><Layers className="w-5 h-5" /></div>
                      <div>
                        <CardTitle>Strategy Playbook</CardTitle>
                        <CardDescription>Define your edge. Strategies added here appear in your journal.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <StrategyManager
                      userStrategies={currentStrategies}
                      onUpdate={(newStrats) => updateTradingPreferences({ methodologies: newStrats })}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Col: Instruments */}
              <div className="space-y-6">
                <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600"><Activity className="w-5 h-5" /></div>
                       <div>
                         <CardTitle>Watchlist</CardTitle>
                         <CardDescription>Assets you trade.</CardDescription>
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <InstrumentManager
                      items={config.tradingPreferences.specificInstruments}
                      onUpdate={(items) => updateTradingPreferences({ specificInstruments: items })}
                    />
                  </CardContent>
                </Card>

                {/* Account Tip */}
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl text-white shadow-xl">
                   <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 mt-0.5 text-yellow-300 fill-yellow-300" />
                      <div>
                        <h4 className="font-bold text-sm">Pro Tip</h4>
                        <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                           Defining specific confluences for your strategies allows the AI to tell you exactly <i>why</i> a specific setup is failing.
                        </p>
                      </div>
                   </div>
                </div>
              </div>

            </div>
          </TabsContent>

          {/* --- TAB 3: NOTIFICATIONS --- */}
          <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600"><Bell className="w-5 h-5" /></div>
                  <div>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>Choose which emails you want to receive. Changes save automatically.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ToggleRow
                  label="Platform Updates"
                  description="New features, improvements, and product announcements."
                  checked={config.notificationPreferences?.emailNewFeatures}
                  onCheckedChange={(c) => updateNotificationPreferences({ emailNewFeatures: c })}
                />
                <Separator />
                <ToggleRow
                  label="Trade Milestones"
                  description="Celebrate streaks, personal bests, and achievement badges."
                  checked={config.notificationPreferences?.emailTradeMilestones}
                  onCheckedChange={(c) => updateNotificationPreferences({ emailTradeMilestones: c })}
                />
                <Separator />
                <ToggleRow
                  label="Weekly Digest"
                  description="Summary of your weekly trading activity and key metrics."
                  checked={config.notificationPreferences?.emailWeeklyDigest}
                  onCheckedChange={(c) => updateNotificationPreferences({ emailWeeklyDigest: c })}
                />
                <Separator />
                <ToggleRow
                  label="Community Insights"
                  description="Popular strategies and anonymized community trends."
                  checked={config.notificationPreferences?.emailCommunityInsights}
                  onCheckedChange={(c) => updateNotificationPreferences({ emailCommunityInsights: c })}
                />
                <Separator />
                <ToggleRow
                  label="Real-Time Trade Alerts"
                  description="Notifications when your open positions hit key levels."
                  checked={config.notificationPreferences?.tradeAlerts}
                  onCheckedChange={(c) => updateNotificationPreferences({ tradeAlerts: c })}
                />
                <Separator />
                <ToggleRow
                  label="Weekly AI Report"
                  description="AI-generated analysis of your trading psychology and performance patterns."
                  checked={config.notificationPreferences?.weeklyReport}
                  onCheckedChange={(c) => updateNotificationPreferences({ weeklyReport: c })}
                />
                <Separator />
                <ToggleRow
                  label="Marketing Emails"
                  description="Occasional promotions, educational content, and partner offers."
                  checked={config.privacyPreferences?.marketingEmailsOptIn}
                  onCheckedChange={(c) => updatePrivacyPreferences({ marketingEmailsOptIn: c })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB 4: APPEARANCE --- */}
          <TabsContent value="appearance" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
               <CardHeader>
                 <CardTitle>Interface Theme</CardTitle>
                 <CardDescription>Select a theme that fits your trading environment.</CardDescription>
               </CardHeader>
               <CardContent>
                  <ThemeSelector />
               </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB 5: PRIVACY & DATA --- */}
          <TabsContent value="privacy" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Visibility Controls */}
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
               <CardHeader>
                 <CardTitle>Visibility Controls</CardTitle>
                 <CardDescription>Control what other users can see about your account.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <ToggleRow
                   label="Public Profile"
                   description="Allow other community members to view your win-rate and badges (PnL is always hidden)."
                   checked={config.privacyPreferences.publicProfile}
                   onCheckedChange={(c) => updatePrivacyPreferences({ publicProfile: c })}
                 />
                 <Separator />
                 <ToggleRow
                   label="Hide PnL Values"
                   description="Blur dollar amounts on the dashboard. Useful for sharing screenshots."
                   checked={!config.privacyPreferences.showPnl}
                   onCheckedChange={(c) => updatePrivacyPreferences({ showPnl: !c })}
                 />
               </CardContent>
            </Card>

            {/* Data Consent */}
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Data Consent</CardTitle>
                <CardDescription>Manage how your data is used to improve the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ToggleRow
                  label="Anonymous Usage Analytics"
                  description="Help improve Concentrade by sharing anonymous usage patterns. No personal or trading data is included."
                  checked={config.privacyPreferences?.allowAnonymousUsageData}
                  onCheckedChange={(c) => updatePrivacyPreferences({ allowAnonymousUsageData: c })}
                />
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-md">
                    <Label className="text-base">Terms & Privacy Accepted</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">You accepted the Terms of Service and Privacy Policy during signup.</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                    <Check className="w-3 h-3 mr-1" /> Accepted
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Your Data — GDPR Rights */}
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><Download className="w-5 h-5" /></div>
                  <div>
                    <CardTitle>Your Data</CardTitle>
                    <CardDescription>You own all your data. Export it or request deletion at any time.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Export */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-md">
                    <Label className="text-base">Export My Data</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Download all your trading data, psychology journals, strategies, and account information as a JSON file.
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleExportData} disabled={isExporting} className="shrink-0">
                    {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Export JSON
                  </Button>
                </div>

                <Separator />

                {/* Delete Account */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-md">
                    <Label className="text-base text-red-700 dark:text-red-400">Delete Account</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Permanently delete your account and all associated data. A 30-day grace period applies during which you can cancel.
                    </p>
                  </div>
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30 shrink-0" disabled={!!deletionRequested}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletionRequested ? "Deletion Pending" : "Delete Account"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                          <AlertTriangle className="w-5 h-5" /> Delete Account
                        </DialogTitle>
                        <DialogDescription>
                          This action will schedule your account for permanent deletion. You have a 30-day grace period to cancel.
                          All trades, journals, strategies, and personal data will be permanently removed.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                            After 30 days, this action is irreversible. We recommend exporting your data first.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Type <span className="font-mono font-bold">DELETE</span> to confirm</Label>
                          <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="font-mono"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText("") }}>Cancel</Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== "DELETE" || isDeleting}
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                          Delete My Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB 6: ACCOUNT --- */}
          <TabsContent value="account" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            {/* Account Info */}
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"><User className="w-5 h-5" /></div>
                  <div>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your account details and authentication method.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Email Address</Label>
                    <div className="flex items-center gap-2 h-10 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{userEmail || "Loading..."}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Member Since</Label>
                    <div className="flex items-center gap-2 h-10 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {userCreatedAt ? new Date(userCreatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Loading..."}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Auth Method</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {isOAuthUser ? "OAuth (Google/GitHub)" : "Email & Password"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security — Password Change (only for email/password users) */}
            {!isOAuthUser && (
              <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600"><Lock className="w-5 h-5" /></div>
                    <div>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your account password. You'll stay logged in after the change.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="Minimum 6 characters"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>
                  {passwordForm.newPassword && passwordForm.newPassword.length < 6 && (
                    <p className="text-xs text-amber-600">Password must be at least 6 characters.</p>
                  )}
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match.</p>
                  )}
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end p-4 rounded-b-xl">
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || passwordForm.newPassword.length < 6 || passwordForm.newPassword !== passwordForm.confirmPassword}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Subscription */}
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600"><CreditCard className="w-5 h-5" /></div>
                  <div>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Manage your plan and billing.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {subLoading ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading subscription...
                  </div>
                ) : (
                  <>
                    {/* Current plan display */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                          tier === "free" ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" :
                          tier === "pro" ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" :
                          "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                        )}>
                          {tier === "free" ? "F" : tier === "pro" ? "P" : "E"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white capitalize">{tier} Plan</p>
                          <p className="text-xs text-slate-500">
                            {tier === "free"
                              ? "50 trades/month, basic analytics"
                              : tier === "pro"
                              ? "Unlimited trades, AI insights, advanced analytics"
                              : "Everything in Pro + social insights, priority support"
                            }
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          hasActiveSubscription
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}
                      >
                        {subscription?.status === "active" ? "Active" :
                         subscription?.status === "trialing" ? "Trial" :
                         subscription?.status === "canceled" ? "Cancelled" :
                         subscription?.status === "past_due" ? "Past Due" :
                         "Free"}
                      </Badge>
                    </div>

                    {/* Billing details for paid plans */}
                    {hasActiveSubscription && subscription && (
                      <div className="grid grid-cols-2 gap-4">
                        {subscription.current_period_end && (
                          <div className="space-y-1">
                            <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">
                              {subscription.cancel_at_period_end ? "Access Until" : "Next Renewal"}
                            </Label>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        )}
                        {subscription.cancel_at_period_end && (
                          <div className="col-span-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                              Your subscription is set to cancel at the end of the current billing period. You'll retain access until then.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {tier === "free" && (
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => window.location.href = "/get-started"}>
                          <ArrowUpRight className="w-4 h-4 mr-2" /> Upgrade to Pro
                        </Button>
                      )}
                      {hasActiveSubscription && !subscription?.cancel_at_period_end && (
                        <Dialog open={showCancelSubDialog} onOpenChange={setShowCancelSubDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30">
                              Cancel Subscription
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Cancel Subscription</DialogTitle>
                              <DialogDescription>
                                Your subscription will remain active until the end of the current billing period. After that, you'll be downgraded to the Free plan.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                                  You'll lose access to AI insights, advanced analytics, and unlimited trade logging when your current period ends.
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowCancelSubDialog(false)}>Keep Subscription</Button>
                              <Button
                                variant="destructive"
                                onClick={handleCancelSubscription}
                                disabled={isCancelingSub}
                              >
                                {isCancelingSub && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Confirm Cancellation
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="mailto:support@concentrade.com" className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    <Mail className="w-4 h-4" /> support@concentrade.com
                  </a>
                  <span className="hidden sm:block text-slate-300 dark:text-slate-700">|</span>
                  <a href="mailto:privacy@concentrade.com" className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    <Shield className="w-4 h-4" /> privacy@concentrade.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
