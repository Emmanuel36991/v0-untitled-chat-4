"use client"

import React, { useState, useEffect } from "react"
import { useUserConfig } from "@/hooks/use-user-config"
import { useTheme } from "next-themes"
import { 
  User, Activity, Palette, Bell, Loader2, Save, 
  Plus, X, Search, BookOpen, Layers, Zap, 
  Monitor, Moon, Sun, Check, Trash2, Sliders 
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
  userStrategies: any[], // In real app, typing this properly as Strategy[] is key
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
    // We modify ID to ensure uniqueness in user's list if needed, or keep preset ID
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

// --- MAIN PAGE ---

export default function SettingsPage() {
  const { config, isLoading, updateUserProfile, updateTradingPreferences, updatePrivacyPreferences } = useUserConfig()
  const [isSaving, setIsSaving] = useState(false)
  
  // Local Form States
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    experienceLevel: "beginner",
    tradingStyle: "day_trader"
  })

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  // NOTE: In a real implementation, 'methodologies' in Supabase would store JSONB. 
  // For now, we assume the hook handles the array of strategy objects or strings. 
  // We cast it to any[] to avoid strict type errors with the existing hook interface in this snippet.
  const currentStrategies = (config.tradingPreferences.methodologies || []) as any[]

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B0D12] pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your trading DNA, preferences, and workspace.</p>
          </div>
          <div className="flex gap-3">
             {/* Optional: Add global save button or status here */}
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-8">
          
          <TabsList className="grid w-full grid-cols-4 h-12 items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <TabsTrigger value="general" className="h-10 rounded-lg gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400 font-medium">
              <User className="h-4 w-4" /> General
            </TabsTrigger>
            <TabsTrigger value="trading" className="h-10 rounded-lg gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400 font-medium">
              <Activity className="h-4 w-4" /> Trading DNA
            </TabsTrigger>
            <TabsTrigger value="appearance" className="h-10 rounded-lg gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400 font-medium">
              <Palette className="h-4 w-4" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="privacy" className="h-10 rounded-lg gap-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400 font-medium">
              <Bell className="h-4 w-4" /> Privacy
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

          {/* --- TAB 3: APPEARANCE --- */}
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

          {/* --- TAB 4: PRIVACY --- */}
          <TabsContent value="privacy" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
               <CardHeader>
                 <CardTitle>Privacy Controls</CardTitle>
                 <CardDescription>Manage data visibility and notifications.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-base">Public Profile</Label>
                       <p className="text-sm text-slate-500 max-w-sm">Allow other community members to view your win-rate and badges (PnL is always hidden).</p>
                    </div>
                    <Switch 
                      checked={config.privacyPreferences.publicProfile}
                      onCheckedChange={(c) => updatePrivacyPreferences({ publicProfile: c })}
                    />
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-base">Hide PnL Values</Label>
                       <p className="text-sm text-slate-500 max-w-sm">Blur dollar amounts on the dashboard. Useful for sharing screenshots.</p>
                    </div>
                    <Switch 
                      checked={!config.privacyPreferences.showPnl}
                      onCheckedChange={(c) => updatePrivacyPreferences({ showPnl: !c })}
                    />
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-base">Weekly AI Report</Label>
                       <p className="text-sm text-slate-500 max-w-sm">Receive a weekly email summary of your trading performance and psychology.</p>
                    </div>
                    <Switch 
                       checked={config.notificationPreferences?.weeklyReport}
                       onCheckedChange={(c) => updateUserConfig({ notificationPreferences: { ...config.notificationPreferences, weeklyReport: c } })}
                    />
                 </div>

               </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
