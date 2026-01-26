"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUserConfig } from "@/hooks/use-user-config"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2, TrendingUp, UserIcon, Eye, ChevronRight, ChevronLeft, Search,
  List, Check, AlertCircle, Terminal, Zap, Globe, Shield, Bell,
  LayoutGrid, Loader2, CheckSquare, Square, FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { INSTRUMENT_MAPPINGS, type TradingPreferences, type PrivacyPreferences } from "@/types/user-config"
import { cn } from "@/lib/utils"

import { ConcentradeLogo } from "@/components/concentrade-logo"
import { LoadingScreen } from "@/components/loading-screen"
import { createClient } from "@/lib/supabase/client"

// Import logic components
import { LegalPrivacyStep } from "@/components/profile-setup/legal-privacy-step"
import { NotificationsStep } from "@/components/profile-setup/notifications-step"
import { ProfileInfoStep } from "@/components/profile-setup/profile-info-step"
import { ReviewConfirmationStep } from "@/components/profile-setup/review-confirmation-step"

// Import Icons
import {
  ESFuturesIcon, BTCUSDIcon, EURUSDIcon, AAPLIcon,
  GOLDIcon, SPYIcon,
} from "@/components/updated-trading-icons"

// --- CONFIGURATION ---
const TOTAL_STEPS = 8

const stepConfig = [
  {
    id: 1,
    title: "Markets",
    subtitle: "What do you trade?",
    description: "Let's start by picking the markets you're interested in.",
    icon: Globe,
    color: "text-indigo-400",
  },
  {
    id: 2,
    title: "Watchlist",
    subtitle: "Your Favorites",
    description: "Choose the specific assets you want to see on your dashboard.",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    id: 3,
    title: "Profile",
    subtitle: "About You",
    description: "Tell us a bit about yourself so we can personalize your experience.",
    icon: UserIcon,
    color: "text-blue-400",
  },
  {
    id: 4,
    title: "Layout",
    subtitle: "Customize View",
    description: "Which instruments should appear in your quick-trade menus?",
    icon: Eye,
    color: "text-violet-400",
  },
  {
    id: 5,
    title: "Alerts",
    subtitle: "Stay Updated",
    description: "How should we notify you about trade setups and system updates?",
    icon: Bell,
    color: "text-amber-400",
  },
  {
    id: 6,
    title: "Legal",
    subtitle: "Terms of Service",
    description: "Please review and accept our terms to continue.",
    icon: Shield,
    color: "text-slate-300",
  },
  {
    id: 7,
    title: "Review",
    subtitle: "Final Check",
    description: "Double-check your settings before we finish up.",
    icon: List,
    color: "text-teal-400",
  },
  {
    id: 8,
    title: "Complete",
    subtitle: "Ready to Start",
    description: "You're all set! Let's launch your terminal.",
    icon: Zap,
    color: "text-purple-400",
  },
]

const premiumInstrumentCategories = [
  { id: "stocks", label: "Equities", description: "Stocks & ETFs", icon: <AAPLIcon className="w-8 h-8" /> },
  { id: "crypto", label: "Crypto", description: "Digital Assets", icon: <BTCUSDIcon className="w-8 h-8" /> },
  { id: "forex", label: "Forex", description: "Currency Pairs", icon: <EURUSDIcon className="w-8 h-8" /> },
  { id: "futures", label: "Futures", description: "Index & Energy", icon: <ESFuturesIcon className="w-8 h-8" /> },
  { id: "commodities", label: "Metals", description: "Gold, Silver, etc.", icon: <GOLDIcon className="w-8 h-8" /> },
  { id: "options", label: "Options", description: "Derivatives", icon: <SPYIcon className="w-8 h-8" /> },
]

// --- UI COMPONENTS (Enhanced for Visibility) ---

const SidebarStep = ({ step, currentStep }: { step: any; currentStep: number }) => {
  const isActive = step.id === currentStep
  const isPast = step.id < currentStep

  return (
    <div className={cn(
      "relative flex items-center group py-3 px-3 mb-1.5 rounded-md transition-all duration-200 border",
      isActive 
        ? "bg-zinc-800/80 border-zinc-600 shadow-md" 
        : "border-transparent hover:bg-zinc-800/50"
    )}>
      <div className="flex items-center gap-3 w-full">
        <div
          className={cn(
            "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all duration-200 shadow-sm",
            isActive
              ? "bg-indigo-500 text-white ring-2 ring-indigo-500/20"
              : isPast
                ? "bg-emerald-900/60 text-emerald-400 border border-emerald-800/50"
                : "bg-zinc-800 text-zinc-500 border border-zinc-700",
          )}
        >
          {isPast ? <Check className="w-3.5 h-3.5" /> : step.id}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "text-xs font-semibold uppercase tracking-wider transition-colors",
            isActive ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-400"
          )}>
            {step.title}
          </span>
        </div>
      </div>
    </div>
  )
}

const MarketCard = ({ category, isSelected, onClick }: any) => (
  <div
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200",
      isSelected
        ? "bg-zinc-900 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
        : "bg-zinc-950/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900"
    )}
  >
    <div className={cn("mb-4 transition-all duration-200", isSelected ? "text-indigo-400 scale-110 drop-shadow-md" : "text-zinc-500 grayscale group-hover:grayscale-0 group-hover:text-zinc-300")}>
      {category.icon}
    </div>
    <div className={cn("font-bold text-sm text-center uppercase tracking-wide", isSelected ? "text-zinc-100" : "text-zinc-400")}>{category.label}</div>
    <div className={cn("text-[12px] text-center mt-1 font-medium", isSelected ? "text-indigo-200/70" : "text-zinc-600")}>{category.description}</div>
    
    {isSelected && (
      <div className="absolute top-3 right-3">
        <CheckCircle2 className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
      </div>
    )}
  </div>
)

const TickerCard = ({ instrument, isSelected, onSelect }: any) => {
  return (
    <div
      onClick={() => onSelect(instrument.symbol)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
        isSelected
          ? "bg-indigo-950/30 border-indigo-500/60 shadow-inner"
          : "bg-black/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded flex items-center justify-center font-mono text-[11px] font-bold border transition-colors",
        isSelected ? "bg-indigo-600 text-white border-indigo-500 shadow-md" : "bg-zinc-900 border-zinc-800 text-zinc-500"
      )}>
        {instrument.symbol.substring(0, 2)}
      </div>
      <div className="overflow-hidden">
        <div className={cn("text-sm font-bold truncate", isSelected ? "text-indigo-200" : "text-zinc-200")}>{instrument.symbol}</div>
        <div className={cn("text-[11px] truncate", isSelected ? "text-indigo-300/60" : "text-zinc-500")}>{instrument.name}</div>
      </div>
      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-500 ml-auto flex-shrink-0" />}
    </div>
  )
}

function ProfileSetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const {
    config,
    updateTradingPreferences,
    updateUserProfile,
    updateNotificationPreferences,
    updatePrivacyPreferences,
    markSetupComplete,
    isLoaded,
  } = useUserConfig()

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [instrumentLayout, setInstrumentLayout] = useState<"grid" | "list">("grid")
  const [activeLayoutTab, setActiveLayoutTab] = useState<string | null>(null)

  const currentStep = Number.parseInt(searchParams.get("step") || "1", 10)
  const currentStepConfig = stepConfig.find((step) => step.id === currentStep) || stepConfig[0]

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/signup"); return }
      setIsAuthenticated(true)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (currentStep === 4 && !activeLayoutTab && config.tradingPreferences.primaryInstruments?.length) {
      setActiveLayoutTab(config.tradingPreferences.primaryInstruments[0])
    }
  }, [currentStep, config.tradingPreferences.primaryInstruments, activeLayoutTab])

  const handleNext = async () => {
    setSaveError(null)
    setIsTransitioning(true)
    if (currentStep < TOTAL_STEPS) {
      router.push(`/signup/profile-setup?step=${currentStep + 1}`)
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" })
      setIsTransitioning(false)
    } else {
      const success = await markSetupComplete()
      if (success) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        router.push("/dashboard")
      } else {
        setSaveError("Failed to save profile.")
        setIsTransitioning(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) router.push(`/signup/profile-setup?step=${currentStep - 1}`)
    else router.push("/signup")
  }

  const handleMultiSelectChange = (field: keyof TradingPreferences, value: string) => {
    const currentValues = (config.tradingPreferences[field] as string[] | undefined) || []
    const newValues = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value]
    updateTradingPreferences({ [field]: newValues })
  }

  // --- FILTER LOGIC ---
  const selectedPrimaryInstruments = config.tradingPreferences.primaryInstruments || []
  const selectedSpecificInstruments = config.tradingPreferences.specificInstruments || []
  const visibleInstruments = config.tradingPreferences.visibleInstruments || []

  const getAvailableSpecificInstruments = () => {
    if (selectedPrimaryInstruments.length === 0) return []
    const instruments: any[] = []
    selectedPrimaryInstruments.forEach((category) => {
      if (INSTRUMENT_MAPPINGS[category]) {
        instruments.push(...INSTRUMENT_MAPPINGS[category])
      }
    })
    return instruments
  }

  const filteredInstruments = getAvailableSpecificInstruments().filter((instrument) => {
    return instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instrument.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // --- STEP 4 LOGIC (VISIBILITY) ---
  const toggleVisibility = (symbol: string) => {
    const newVisible = visibleInstruments.includes(symbol)
      ? visibleInstruments.filter((s) => s !== symbol)
      : [...visibleInstruments, symbol]
    updateTradingPreferences({ visibleInstruments: newVisible })
  }

  const toggleAllVisibility = (category: string, enable: boolean) => {
    const categorySymbols = INSTRUMENT_MAPPINGS[category]?.map(i => i.symbol) || []
    let newVisible = [...visibleInstruments]
    if (enable) {
      newVisible = [...new Set([...newVisible, ...categorySymbols])]
    } else {
      newVisible = newVisible.filter(s => !categorySymbols.includes(s))
    }
    updateTradingPreferences({ visibleInstruments: newVisible })
  }

  const activeCategoryInstruments = activeLayoutTab ? (INSTRUMENT_MAPPINGS[activeLayoutTab] || []) : []
  const visibleCountInTab = activeCategoryInstruments.filter(i => visibleInstruments.includes(i.symbol)).length
  const isAllVisibleInTab = activeCategoryInstruments.length > 0 && visibleCountInTab === activeCategoryInstruments.length

  const enableAllNotifications = () => {
    updateNotificationPreferences({
      emailNewFeatures: true, emailTradeMilestones: true, emailWeeklyDigest: true,
      emailCommunityInsights: true, tradeAlerts: true,
    })
  }

  // --- STEP 6 LOGIC (LEGAL) ---
  const acceptAllTerms = () => {
    const allAccepted: PrivacyPreferences = {
      termsAccepted: true,
      privacyPolicy: true,
      riskDisclosure: true,
      dataProcessing: true
    }
    updatePrivacyPreferences(allAccepted)
  }

  if (isAuthenticated === null || !isLoaded) return <LoadingScreen />
  if (!isAuthenticated) return null

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-[#09090b] text-zinc-200 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">

        {/* MISSION CONTROL SIDEBAR */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-zinc-800/80 bg-[#0c0c0e] h-full z-20 shadow-xl">
          <div className="p-8 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-700 shadow-sm">
                <ConcentradeLogo size={20} variant="icon" />
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-widest text-zinc-100 uppercase">System Config</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Connected</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
            {stepConfig.map((step) => (
              <SidebarStep key={step.id} step={step} currentStep={currentStep} />
            ))}
          </div>

          <div className="p-8 border-t border-zinc-800 bg-zinc-900/30">
            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400 mb-3 tracking-widest">
              <span>Progress</span>
              <span className="text-zinc-200 font-mono">{Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                style={{ width: `${((currentStep - 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* MAIN TERMINAL AREA */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#09090b]">
          {/* Subtle Grid - Sharper opacity for visibility */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-[0.15]" />
          
          {/* Mobile Header */}
          <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 lg:hidden bg-zinc-950 sticky top-0 z-50">
            <div className="flex items-center gap-2 font-bold text-white"><ConcentradeLogo size={20} variant="icon" /> Setup</div>
            <Badge variant="outline" className="bg-zinc-900 text-zinc-300 border-zinc-700">Step {currentStep}</Badge>
          </header>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative z-10">
            <div className="max-w-5xl mx-auto px-6 py-16 lg:py-20">

              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-wrapper-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Step Header */}
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={cn("p-1.5 rounded bg-zinc-900 border border-zinc-700 shadow-sm", currentStepConfig.color)}>
                        <currentStepConfig.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{currentStepConfig.subtitle}</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4 text-white drop-shadow-sm">{currentStepConfig.title}</h1>
                    <p className="text-zinc-400 text-lg max-w-2xl font-normal leading-relaxed">{currentStepConfig.description}</p>
                  </div>

                  {/* Step Content Area */}
                  <div className="min-h-[400px]">
                    {/* STEP 1: MARKETS */}
                    {currentStep === 1 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {premiumInstrumentCategories.map(cat => (
                          <MarketCard
                            key={cat.id}
                            category={cat}
                            isSelected={selectedPrimaryInstruments.includes(cat.id)}
                            onClick={() => handleMultiSelectChange("primaryInstruments", cat.id)}
                          />
                        ))}
                      </div>
                    )}

                    {/* STEP 2: WATCHLIST */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="relative flex gap-4">
                          <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                            <Input
                              placeholder="Search for symbols (e.g. BTC, ES, AAPL)..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="pl-10 bg-black/40 border-zinc-700 h-11 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-zinc-500 transition-all shadow-sm"
                            />
                          </div>
                          <div className="flex border border-zinc-700 rounded-md overflow-hidden bg-black/40">
                            <Button variant={instrumentLayout === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setInstrumentLayout('grid')} className={cn("rounded-none w-11 h-11", instrumentLayout === 'grid' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200")}><LayoutGrid className="w-4 h-4" /></Button>
                            <Button variant={instrumentLayout === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setInstrumentLayout('list')} className={cn("rounded-none w-11 h-11", instrumentLayout === 'list' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200")}><List className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        {selectedPrimaryInstruments.length === 0 ? (
                          <div className="text-center py-20 border-2 border-dashed border-zinc-800/80 rounded-lg bg-zinc-900/30">
                            <AlertCircle className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">No Markets Selected</h3>
                            <p className="text-zinc-400 mb-6 max-w-sm mx-auto">Please go back and select at least one market to see available instruments.</p>
                            <Button variant="outline" onClick={handleBack} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">Go Back to Markets</Button>
                          </div>
                        ) : (
                          <div className={cn("grid gap-3", instrumentLayout === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                            {filteredInstruments.map(inst => (
                              <TickerCard
                                key={inst.symbol}
                                instrument={inst}
                                isSelected={selectedSpecificInstruments.includes(inst.symbol)}
                                onSelect={(sym: string) => handleMultiSelectChange("specificInstruments", sym)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 3: IDENTITY */}
                    {currentStep === 3 && (
                      <div className="max-w-2xl bg-zinc-900/80 border border-zinc-800 rounded-lg p-8 shadow-sm backdrop-blur-sm">
                        <ProfileInfoStep userProfile={config.userProfile} onUpdate={updateUserProfile} />
                      </div>
                    )}

                    {/* STEP 4: LAYOUT / VISIBILITY */}
                    {currentStep === 4 && (
                      <div className="space-y-8">
                        {/* Control Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-zinc-800">
                          {/* Tabs */}
                          <div className="flex flex-wrap gap-2">
                            {selectedPrimaryInstruments.length === 0 && <span className="text-sm text-zinc-500 italic">No markets configured.</span>}
                            {selectedPrimaryInstruments.map(catId => (
                              <button
                                key={catId}
                                onClick={() => setActiveLayoutTab(catId)}
                                className={cn(
                                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200 shadow-sm",
                                  activeLayoutTab === catId
                                    ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20"
                                    : "bg-black/40 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200"
                                )}
                              >
                                {catId}
                              </button>
                            ))}
                          </div>

                          {/* Bulk Action */}
                          {activeLayoutTab && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleAllVisibility(activeLayoutTab, !isAllVisibleInTab)}
                              className="h-8 text-xs border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                            >
                              {isAllVisibleInTab ? <Square className="w-3.5 h-3.5 mr-2" /> : <CheckSquare className="w-3.5 h-3.5 mr-2" />}
                              {isAllVisibleInTab ? "Deselect All" : "Select All"}
                            </Button>
                          )}
                        </div>

                        {/* Instrument Grid */}
                        {activeLayoutTab ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {activeCategoryInstruments.map((inst) => {
                              const isVisible = visibleInstruments.includes(inst.symbol)
                              return (
                                <div
                                  key={inst.symbol}
                                  onClick={() => toggleVisibility(inst.symbol)}
                                  className={cn(
                                    "relative p-4 rounded-md border cursor-pointer transition-all duration-200 flex items-center justify-between group",
                                    isVisible
                                      ? "bg-indigo-950/20 border-indigo-500/50 shadow-inner"
                                      : "bg-black/30 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn("w-1 h-8 rounded-full transition-colors", isVisible ? "bg-indigo-500" : "bg-zinc-800")} />
                                    <div>
                                      <div className={cn("font-bold text-sm tracking-tight", isVisible ? "text-indigo-200" : "text-zinc-300")}>{inst.symbol}</div>
                                      <div className="text-[11px] text-zinc-500 truncate max-w-[120px] group-hover:text-zinc-400 transition-colors">{inst.name}</div>
                                    </div>
                                  </div>
                                  <div className={cn(
                                    "w-5 h-5 rounded border flex items-center justify-center transition-all duration-200",
                                    isVisible ? "bg-indigo-600 border-indigo-500" : "border-zinc-700 bg-black/50"
                                  )}>
                                    {isVisible && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="py-24 text-center text-zinc-500 font-normal text-sm border border-dashed border-zinc-800 rounded-lg">Select a market category above to configure what you see.</div>
                        )}
                      </div>
                    )}

                    {/* STEP 5: ALERTS */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" onClick={enableAllNotifications} className="gap-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20">
                            <CheckSquare className="w-4 h-4" /> Enable All Notifications
                          </Button>
                        </div>
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-8 backdrop-blur-sm">
                          <NotificationsStep notificationPreferences={config.notificationPreferences} onUpdate={updateNotificationPreferences} />
                        </div>
                      </div>
                    )}

                    {/* STEP 6: LEGAL - UPDATED WITH ACCEPT ALL */}
                    {currentStep === 6 && (
                      <div className="space-y-6">
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={acceptAllTerms} 
                            className="gap-2 border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 hover:border-indigo-500/60 transition-all"
                          >
                            <FileText className="w-4 h-4" /> Accept All Terms & Conditions
                          </Button>
                        </div>
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-8 backdrop-blur-sm">
                          <LegalPrivacyStep privacyPreferences={config.privacyPreferences} onUpdate={updatePrivacyPreferences} />
                        </div>
                      </div>
                    )}

                    {/* STEP 7: REVIEW */}
                    {currentStep === 7 && (
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-8 backdrop-blur-sm">
                        <ReviewConfirmationStep config={config} />
                      </div>
                    )}

                    {/* STEP 8: DEPLOY */}
                    {currentStep === 8 && (
                      <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="relative mb-10 group cursor-default">
                          <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center text-indigo-500 border border-zinc-800 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                            <Terminal className="w-10 h-10" />
                          </div>
                          <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 tracking-tight text-white">All Systems Go</h2>
                        <p className="text-zinc-400 max-w-md mb-10 leading-relaxed text-base">
                          Your trading environment is configured and ready.
                          <br />Click below to enter the terminal.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="h-20 border-t border-zinc-800/80 bg-zinc-900/95 backdrop-blur flex items-center justify-between px-6 lg:px-12 sticky bottom-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isTransitioning}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <div className="flex gap-4 items-center">
              <Button
                size="lg"
                onClick={handleNext}
                disabled={isTransitioning}
                className="min-w-[160px] h-11 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide uppercase text-xs transition-all shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_16px_rgba(79,70,229,0.5)]"
              >
                {isTransitioning ? <Loader2 className="w-4 h-4 animate-spin" /> : currentStep === TOTAL_STEPS ? "Enter Terminal" : "Continue"}
                {currentStep !== TOTAL_STEPS && !isTransitioning && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>

        </main>
      </div>
    </TooltipProvider>
  )
}

export default function ProfileSetupPage() {
  return (
    <React.Suspense fallback={<LoadingScreen />}>
      <ProfileSetupContent />
    </React.Suspense>
  )
}
