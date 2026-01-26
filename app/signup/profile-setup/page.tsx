"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUserConfig } from "@/hooks/use-user-config"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2, TrendingUp, UserIcon, Eye, ChevronRight, ChevronLeft, Search,
  List, Check, AlertCircle, Terminal, Zap, Globe, Shield, Bell,
  LayoutGrid, Loader2, CheckSquare, Square
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { INSTRUMENT_MAPPINGS, type TradingPreferences } from "@/types/user-config"
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
    subtitle: "Asset Classes",
    description: "Initialize market data feeds for your active environments.",
    icon: Globe,
    color: "text-purple-400",
  },
  {
    id: 2,
    title: "Watchlist",
    subtitle: "Instruments",
    description: "Select specific tickers to track in your terminal.",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    id: 3,
    title: "Operator",
    subtitle: "Identity",
    description: "Establish your professional trading profile.",
    icon: UserIcon,
    color: "text-cyan-400",
  },
  {
    id: 4,
    title: "Layout",
    subtitle: "Visibility",
    description: "Configure which instruments appear in your trade entry dropdowns.",
    icon: Eye,
    color: "text-indigo-400",
  },
  {
    id: 5,
    title: "Comms",
    subtitle: "Notifications",
    description: "Set protocols for system alerts and updates.",
    icon: Bell,
    color: "text-amber-400",
  },
  {
    id: 6,
    title: "Protocol",
    subtitle: "Legal",
    description: "Review and accept compliance terms.",
    icon: Shield,
    color: "text-slate-400",
  },
  {
    id: 7,
    title: "Verify",
    subtitle: "Review",
    description: "Final system integrity check before deployment.",
    icon: List,
    color: "text-teal-400",
  },
  {
    id: 8,
    title: "Deploy",
    subtitle: "Launch",
    description: "Finalize setup and enter the terminal.",
    icon: Zap,
    color: "text-violet-400",
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

// --- UI COMPONENTS ---

const SidebarStep = ({ step, currentStep }: { step: any; currentStep: number }) => {
  const isActive = step.id === currentStep
  const isPast = step.id < currentStep

  return (
    <div className={cn(
      "relative flex items-center group py-3 px-3 mb-1.5 rounded-lg transition-all duration-300",
      isActive ? "bg-white/10 border-l-2 border-indigo-400 pl-[10px] shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "hover:bg-white/5 border-l-2 border-transparent"
    )}>
      <div className="flex items-center gap-3 w-full">
        <div
          className={cn(
            "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all duration-300",
            isActive
              ? "bg-indigo-500 text-white shadow-sm"
              : isPast
                ? "bg-indigo-500/20 text-indigo-300"
                : "bg-white/5 text-slate-500",
          )}
        >
          {isPast ? <Check className="w-3 h-3" /> : step.id}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider transition-colors",
            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"
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
      "relative overflow-hidden group flex flex-col items-center justify-center p-6 rounded-2xl border cursor-pointer transition-all duration-300",
      isSelected
        ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]"
        : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
    )}
  >
    {isSelected && (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent" />
    )}
    <div className={cn("mb-4 transition-all duration-300 z-10", isSelected ? "text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "text-slate-400 grayscale group-hover:grayscale-0 group-hover:text-slate-300")}>
      {category.icon}
    </div>
    <div className={cn("font-bold text-sm text-center uppercase tracking-wider z-10 transition-colors", isSelected ? "text-white" : "text-slate-300")}>{category.label}</div>
    <div className="text-[10px] text-slate-500 text-center mt-1 font-mono z-10">{category.description}</div>
  </div>
)

const TickerCard = ({ instrument, isSelected, onSelect }: any) => {
  return (
    <div
      onClick={() => onSelect(instrument.symbol)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
        isSelected
          ? "border-indigo-500/40 bg-indigo-500/10 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]"
          : "border-white/5 bg-white/5 hover:bg-white/10"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border transition-colors",
        isSelected ? "bg-indigo-600 text-white border-indigo-500" : "bg-black/40 border-white/10 text-slate-400"
      )}>
        {instrument.symbol.substring(0, 2)}
      </div>
      <div className="overflow-hidden">
        <div className={cn("text-sm font-bold truncate tracking-tight", isSelected ? "text-white" : "text-slate-200")}>{instrument.symbol}</div>
        <div className="text-[10px] text-slate-500 truncate">{instrument.name}</div>
      </div>
      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 ml-auto flex-shrink-0 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]" />}
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

  // New State for Step 4 Redesign
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

  // Set initial active tab for Step 4
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
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
      setIsTransitioning(false)
    } else {
      const success = await markSetupComplete()
      if (success) {
        await new Promise((resolve) => setTimeout(resolve, 500))
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

  // Step 2 Filters
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

  if (isAuthenticated === null || !isLoaded) return <LoadingScreen />
  if (!isAuthenticated) return null

  return (
    <TooltipProvider>
      {/* Updated Main Container: 
        Using a rich radial gradient from deep indigo to slate-950 for that "modish" dark look.
      */}
      <div className="flex h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#0f172a] to-[#020617] text-slate-200 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">

        {/* MISSION CONTROL SIDEBAR */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl h-full z-20 shadow-[5px_0_30px_rgba(0,0,0,0.3)]">
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <ConcentradeLogo size={24} variant="icon" />
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-widest text-white uppercase">System Config</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]" />
                  <span className="text-[10px] text-emerald-500/80 font-mono uppercase tracking-wider">Secure Connection</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-8 px-4 space-y-1">
            {stepConfig.map((step) => (
              <SidebarStep key={step.id} step={step} currentStep={currentStep} />
            ))}
          </div>

          <div className="p-8 border-t border-white/5 bg-black/20">
            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">
              <span>Initialization Sequence</span>
              <span className="text-indigo-400 font-mono">{Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep - 1) / TOTAL_STEPS) * 100}%` }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>
          </div>
        </aside>

        {/* MAIN TERMINAL AREA */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden">
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

          {/* Mobile Header */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 lg:hidden bg-black/20 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-2 font-bold text-white"><ConcentradeLogo size={24} variant="icon" /> Setup</div>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">Step {currentStep}</Badge>
          </header>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
            <div className="max-w-5xl mx-auto px-6 py-16 lg:py-20">

              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-wrapper-${currentStep}`}
                  initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(5px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Step Header */}
                  <div className="mb-12">
                    <div className={cn("flex items-center gap-2 mb-4", currentStepConfig.color)}>
                      <currentStepConfig.icon className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">{currentStepConfig.subtitle}</span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">{currentStepConfig.title}</h1>
                    <p className="text-slate-400 text-lg max-w-2xl font-light leading-relaxed">{currentStepConfig.description}</p>
                  </div>

                  {/* Step Content Area */}
                  <div className="min-h-[400px]">
                    {/* STEP 1: MARKETS */}
                    {currentStep === 1 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                      <div className="space-y-8">
                        <div className="relative flex gap-4">
                          <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <Input
                              placeholder="Search tickers (e.g., BTC, AAPL)..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="pl-11 bg-white/5 border-white/5 h-12 rounded-xl focus:border-indigo-500/50 focus:bg-white/10 focus:ring-indigo-500/20 text-white placeholder:text-slate-600 transition-all"
                            />
                          </div>
                          <div className="flex border border-white/5 rounded-xl overflow-hidden bg-white/5 p-1">
                            <Button variant={instrumentLayout === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setInstrumentLayout('grid')} className={cn("rounded-lg w-10 h-10 transition-all", instrumentLayout === 'grid' ? "bg-indigo-600 text-white hover:bg-indigo-500" : "text-slate-400 hover:text-white")}><LayoutGrid className="w-4 h-4" /></Button>
                            <Button variant={instrumentLayout === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setInstrumentLayout('list')} className={cn("rounded-lg w-10 h-10 transition-all", instrumentLayout === 'list' ? "bg-indigo-600 text-white hover:bg-indigo-500" : "text-slate-400 hover:text-white")}><List className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        {selectedPrimaryInstruments.length === 0 ? (
                          <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/5">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                              <AlertCircle className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">Feed Offline</h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Market data streams are currently inactive. Please select an asset class to initialize the feed.</p>
                            <Button variant="outline" onClick={handleBack} className="border-white/10 text-white hover:bg-white/5">Return to Markets</Button>
                          </div>
                        ) : (
                          <div className={cn("grid gap-4", instrumentLayout === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
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
                      <div className="max-w-2xl bg-black/20 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
                        <ProfileInfoStep userProfile={config.userProfile} onUpdate={updateUserProfile} />
                      </div>
                    )}

                    {/* STEP 4: LAYOUT / VISIBILITY */}
                    {currentStep === 4 && (
                      <div className="space-y-8">
                        {/* Control Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/5">
                          {/* Tabs */}
                          <div className="flex flex-wrap gap-2">
                            {selectedPrimaryInstruments.length === 0 && <span className="text-sm text-slate-500 italic">No markets configured.</span>}
                            {selectedPrimaryInstruments.map(catId => (
                              <button
                                key={catId}
                                onClick={() => setActiveLayoutTab(catId)}
                                className={cn(
                                  "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300",
                                  activeLayoutTab === catId
                                    ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)]"
                                    : "bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:border-white/10 hover:text-slate-200"
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
                              className="h-9 text-xs border-white/10 bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30 text-slate-300 transition-all"
                            >
                              {isAllVisibleInTab ? <Square className="w-3.5 h-3.5 mr-2" /> : <CheckSquare className="w-3.5 h-3.5 mr-2" />}
                              {isAllVisibleInTab ? "Disable All" : "Enable All"}
                            </Button>
                          )}
                        </div>

                        {/* Instrument Grid */}
                        {activeLayoutTab ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeCategoryInstruments.map((inst) => {
                              const isVisible = visibleInstruments.includes(inst.symbol)
                              return (
                                <motion.div
                                  layout
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  key={inst.symbol}
                                  onClick={() => toggleVisibility(inst.symbol)}
                                  className={cn(
                                    "relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between group",
                                    isVisible
                                      ? "bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_15px_-5px_rgba(99,102,241,0.2)]"
                                      : "bg-white/5 border-white/5 hover:bg-white/10 opacity-70 hover:opacity-100"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn("w-1.5 h-8 rounded-full transition-colors", isVisible ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-slate-700")} />
                                    <div>
                                      <div className={cn("font-bold text-sm tracking-tight", isVisible ? "text-white" : "text-slate-300")}>{inst.symbol}</div>
                                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{inst.name}</div>
                                    </div>
                                  </div>
                                  <div className={cn(
                                    "w-5 h-5 rounded border flex items-center justify-center transition-all duration-300",
                                    isVisible ? "bg-indigo-500 border-indigo-500 scale-110" : "border-slate-700 group-hover:border-slate-500"
                                  )}>
                                    {isVisible && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="py-24 text-center text-slate-500 font-light text-lg">Select a market category above to configure visibility.</div>
                        )}
                      </div>
                    )}

                    {/* STEP 5: ALERTS */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" onClick={enableAllNotifications} className="gap-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                            <CheckSquare className="w-4 h-4" /> Activate All Protocols
                          </Button>
                        </div>
                        <div className="bg-black/20 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                          <NotificationsStep notificationPreferences={config.notificationPreferences} onUpdate={updateNotificationPreferences} />
                        </div>
                      </div>
                    )}

                    {/* STEP 6: LEGAL */}
                    {currentStep === 6 && (
                      <div className="bg-black/20 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        <LegalPrivacyStep privacyPreferences={config.privacyPreferences} onUpdate={updatePrivacyPreferences} />
                      </div>
                    )}

                    {/* STEP 7: REVIEW */}
                    {currentStep === 7 && (
                      <div className="bg-black/20 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        <ReviewConfirmationStep config={config} />
                      </div>
                    )}

                    {/* STEP 8: DEPLOY */}
                    {currentStep === 8 && (
                      <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="relative mb-10 group cursor-default">
                          <div className="w-32 h-32 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 transition-all duration-700 group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
                            <Terminal className="w-12 h-12" />
                          </div>
                          <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                          <div className="absolute inset-3 border border-indigo-400/20 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
                          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[40px] animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 tracking-tight text-white">System Initialized</h2>
                        <p className="text-slate-400 max-w-md mb-10 leading-relaxed text-lg font-light">
                          Your environment has been successfully configured.
                          <br />Prepare for deployment.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="h-24 border-t border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12 sticky bottom-0 z-20">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isTransitioning}
              className="text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <div className="flex gap-4 items-center">
              <Button
                size="lg"
                onClick={handleNext}
                disabled={isTransitioning}
                className="min-w-[180px] h-12 rounded-lg shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide uppercase text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isTransitioning ? <Loader2 className="w-5 h-5 animate-spin" /> : currentStep === TOTAL_STEPS ? "Enter Terminal" : "Continue"}
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
