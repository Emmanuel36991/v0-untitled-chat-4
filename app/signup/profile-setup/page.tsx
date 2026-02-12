"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useUserConfig } from "@/hooks/use-user-config"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2, Shield, Bell, UserIcon, ChevronRight, ChevronLeft,
  Search, Check, AlertCircle, Globe, Loader2, CheckSquare, Square,
  Settings, LayoutGrid, List, Eye,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { INSTRUMENT_MAPPINGS, type TradingPreferences } from "@/types/user-config"
import { cn } from "@/lib/utils"

import { ConcentradeLogo } from "@/components/concentrade-logo"
import { LoadingScreen } from "@/components/loading-screen"
import { createClient } from "@/lib/supabase/client"

import { LegalPrivacyStep } from "@/components/profile-setup/legal-privacy-step"
import { NotificationsStep } from "@/components/profile-setup/notifications-step"
import { ProfileInfoStep } from "@/components/profile-setup/profile-info-step"
import { ReviewConfirmationStep } from "@/components/profile-setup/review-confirmation-step"

import {
  ESFuturesIcon, BTCUSDIcon, EURUSDIcon, AAPLIcon,
  GOLDIcon, SPYIcon,
} from "@/components/updated-trading-icons"

// ===================================
// CONFIGURATION
// ===================================

const TOTAL_STEPS = 5

const stepConfig = [
  {
    id: 1,
    title: "Your Profile",
    subtitle: "Tell us about yourself",
    icon: UserIcon,
  },
  {
    id: 2,
    title: "Markets",
    subtitle: "Choose your instruments",
    icon: Globe,
  },
  {
    id: 3,
    title: "Preferences",
    subtitle: "Customize your experience",
    icon: Settings,
    skippable: true,
  },
  {
    id: 4,
    title: "Legal",
    subtitle: "Accept agreements",
    icon: Shield,
  },
  {
    id: 5,
    title: "Review",
    subtitle: "Confirm & launch",
    icon: CheckCircle2,
  },
]

const marketCategories = [
  { id: "stocks", label: "Equities", description: "Stocks & ETFs", icon: <AAPLIcon className="w-8 h-8" /> },
  { id: "crypto", label: "Crypto", description: "Digital Assets", icon: <BTCUSDIcon className="w-8 h-8" /> },
  { id: "forex", label: "Forex", description: "Currency Pairs", icon: <EURUSDIcon className="w-8 h-8" /> },
  { id: "futures", label: "Futures", description: "Index & Energy", icon: <ESFuturesIcon className="w-8 h-8" /> },
  { id: "commodities", label: "Metals", description: "Gold, Silver, etc.", icon: <GOLDIcon className="w-8 h-8" /> },
  { id: "options", label: "Options", description: "Derivatives", icon: <SPYIcon className="w-8 h-8" /> },
]

// ===================================
// UI SUB-COMPONENTS
// ===================================

function SidebarStep({ step, currentStep }: { step: typeof stepConfig[number]; currentStep: number }) {
  const isActive = step.id === currentStep
  const isPast = step.id < currentStep
  const Icon = step.icon

  return (
    <div className={cn(
      "flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200",
      isActive ? "bg-primary/10" : "hover:bg-muted/40"
    )}>
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : isPast
            ? "bg-emerald-500/15 text-emerald-600"
            : "bg-muted text-muted-foreground"
      )}>
        {isPast ? <Check className="w-3.5 h-3.5" /> : step.id}
      </div>
      <div className="flex flex-col min-w-0">
        <span className={cn(
          "text-sm font-semibold transition-colors leading-tight",
          isActive ? "text-foreground" : isPast ? "text-emerald-600" : "text-muted-foreground"
        )}>
          {step.title}
        </span>
        <span className="text-[10px] text-muted-foreground truncate">
          {step.subtitle}
        </span>
      </div>
      {step.skippable && !isPast && !isActive && (
        <Badge variant="outline" className="ml-auto text-[9px] px-1 py-0 h-3.5 shrink-0">Skip</Badge>
      )}
    </div>
  )
}

function MobileStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {stepConfig.map((step) => {
        const isActive = step.id === currentStep
        const isPast = step.id < currentStep
        return (
          <div
            key={step.id}
            className={cn(
              "flex items-center justify-center rounded-full transition-all duration-300",
              isActive
                ? "w-8 h-8 bg-primary text-primary-foreground text-xs font-bold"
                : isPast
                  ? "w-6 h-6 bg-emerald-500/20 text-emerald-600"
                  : "w-6 h-6 bg-muted text-muted-foreground"
            )}
          >
            {isPast ? <Check className="w-3 h-3" /> : <span className="text-[10px] font-bold">{step.id}</span>}
          </div>
        )
      })}
    </div>
  )
}

function MarketCard({ category, isSelected, instrumentCount, onClick }: {
  category: typeof marketCategories[number]
  isSelected: boolean
  instrumentCount: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
          : "border-border bg-card/40 hover:bg-muted/60 hover:border-border"
      )}
    >
      {isSelected && instrumentCount > 0 && (
        <Badge className="absolute top-2 right-2 text-[10px] h-5 px-1.5 bg-primary/90">
          {instrumentCount}
        </Badge>
      )}
      <div className={cn("mb-3 transition-all duration-300", isSelected ? "text-primary scale-110" : "text-muted-foreground grayscale")}>
        {category.icon}
      </div>
      <div className="font-bold text-sm uppercase tracking-wide text-foreground">{category.label}</div>
      <div className="text-[10px] text-muted-foreground mt-1 font-mono">{category.description}</div>
    </button>
  )
}

function TickerCard({ instrument, isSelected, onSelect }: {
  instrument: { symbol: string; name: string }
  isSelected: boolean
  onSelect: (symbol: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(instrument.symbol)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all backdrop-blur-sm text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected
          ? "border-primary/60 bg-primary/10"
          : "border-border bg-card/40 hover:bg-muted/60"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded flex items-center justify-center font-mono text-[10px] font-bold border transition-colors shrink-0",
        isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground"
      )}>
        {instrument.symbol.substring(0, 2)}
      </div>
      <div className="overflow-hidden flex-1 min-w-0">
        <div className="text-sm font-bold truncate text-foreground">{instrument.symbol}</div>
        <div className="text-[10px] text-muted-foreground truncate">{instrument.name}</div>
      </div>
      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
    </button>
  )
}

// ===================================
// MAIN WIZARD
// ===================================

function ProfileSetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const { toast } = useToast()

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
  const [isLaunching, setIsLaunching] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  // Step 2 state
  const [searchQuery, setSearchQuery] = useState("")
  const [instrumentLayout, setInstrumentLayout] = useState<"grid" | "list">("grid")

  // Step 3 state
  const [activeVisibilityTab, setActiveVisibilityTab] = useState<string | null>(null)

  const currentStep = Math.min(
    Math.max(Number.parseInt(searchParams.get("step") || "1", 10), 1),
    TOTAL_STEPS
  )
  const currentStepConfig = stepConfig.find((s) => s.id === currentStep) || stepConfig[0]

  // --- Auth check ---
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/signup"); return }
      setIsAuthenticated(true)
    }
    checkAuth()
  }, [router])

  // Initialize visibility tab when entering step 3
  useEffect(() => {
    if (currentStep === 3 && !activeVisibilityTab && config.tradingPreferences.primaryInstruments?.length) {
      setActiveVisibilityTab(config.tradingPreferences.primaryInstruments[0])
    }
  }, [currentStep, config.tradingPreferences.primaryInstruments, activeVisibilityTab])

  // Reset showValidation when changing steps
  useEffect(() => {
    setShowValidation(false)
    setSaveError(null)
  }, [currentStep])

  // Real-time error clearing
  useEffect(() => {
    if (!saveError) return
    if (currentStep === 1 && config.userProfile?.fullName && config.userProfile.fullName.trim().length >= 3) {
      setSaveError(null)
    }
    if (currentStep === 2 && (config.tradingPreferences.primaryInstruments?.length ?? 0) > 0) {
      setSaveError(null)
    }
    if (currentStep === 4) {
      const { termsAccepted, privacyPolicyAccepted, dataCollectionConsent } = config.privacyPreferences
      if (termsAccepted && privacyPolicyAccepted && dataCollectionConsent) setSaveError(null)
    }
  }, [config, currentStep, saveError])

  // --- Derived data ---
  const selectedPrimaryInstruments = config.tradingPreferences.primaryInstruments || []
  const selectedSpecificInstruments = config.tradingPreferences.specificInstruments || []
  const visibleInstruments = config.tradingPreferences.visibleInstruments || []

  const availableInstruments = useMemo(() => {
    const instruments: Array<{ symbol: string; name: string; description: string; category: string; subcategory: string; tickSize: string; contractSize: string; tradingHours: string }> = []
    selectedPrimaryInstruments.forEach((category) => {
      if (INSTRUMENT_MAPPINGS[category]) {
        instruments.push(...INSTRUMENT_MAPPINGS[category])
      }
    })
    return instruments
  }, [selectedPrimaryInstruments])

  const filteredInstruments = useMemo(() => {
    if (!searchQuery) return availableInstruments
    const q = searchQuery.toLowerCase()
    return availableInstruments.filter((inst) =>
      inst.symbol.toLowerCase().includes(q) || inst.name.toLowerCase().includes(q)
    )
  }, [availableInstruments, searchQuery])

  // Instrument count per market category
  const instrumentCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    selectedPrimaryInstruments.forEach((cat) => {
      const catSymbols = INSTRUMENT_MAPPINGS[cat]?.map((i) => i.symbol) || []
      counts[cat] = catSymbols.filter((s) => selectedSpecificInstruments.includes(s)).length
    })
    return counts
  }, [selectedPrimaryInstruments, selectedSpecificInstruments])

  // Step 3 visibility tab data
  const activeCategoryInstruments = activeVisibilityTab ? (INSTRUMENT_MAPPINGS[activeVisibilityTab] || []) : []
  const visibleCountInTab = activeCategoryInstruments.filter((i) => visibleInstruments.includes(i.symbol)).length
  const isAllVisibleInTab = activeCategoryInstruments.length > 0 && visibleCountInTab === activeCategoryInstruments.length

  // --- Handlers ---

  const handleMultiSelectChange = (field: keyof TradingPreferences, value: string) => {
    const currentValues = (config.tradingPreferences[field] as string[] | undefined) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value]
    updateTradingPreferences({ [field]: newValues })
  }

  const toggleVisibility = (symbol: string) => {
    const newVisible = visibleInstruments.includes(symbol)
      ? visibleInstruments.filter((s) => s !== symbol)
      : [...visibleInstruments, symbol]
    updateTradingPreferences({ visibleInstruments: newVisible })
  }

  const toggleAllVisibility = (category: string, enable: boolean) => {
    const categorySymbols = INSTRUMENT_MAPPINGS[category]?.map((i) => i.symbol) || []
    let newVisible = [...visibleInstruments]
    if (enable) {
      newVisible = [...new Set([...newVisible, ...categorySymbols])]
    } else {
      newVisible = newVisible.filter((s) => !categorySymbols.includes(s))
    }
    updateTradingPreferences({ visibleInstruments: newVisible })
  }

  const enableAllNotifications = () => {
    updateNotificationPreferences({
      emailNewFeatures: true, emailTradeMilestones: true, emailWeeklyDigest: true,
      emailCommunityInsights: true, tradeAlerts: true,
    })
  }

  // --- Validation ---

  const validateStep = (step: number): boolean => {
    setSaveError(null)
    setShowValidation(true)

    if (step === 1) {
      if (!config.userProfile?.fullName || config.userProfile.fullName.trim().length < 3) {
        const msg = "Please enter your full name (at least 3 characters)."
        setSaveError(msg)
        toast({ title: "Name Required", description: msg, variant: "destructive" })
        return false
      }
    }

    if (step === 2) {
      if (!config.tradingPreferences.primaryInstruments || config.tradingPreferences.primaryInstruments.length === 0) {
        const msg = "Please select at least one market to continue."
        setSaveError(msg)
        toast({ title: "Market Required", description: msg, variant: "destructive" })
        return false
      }
    }

    // Step 3: no validation (optional)

    if (step === 4) {
      const { termsAccepted, privacyPolicyAccepted, dataCollectionConsent } = config.privacyPreferences
      if (!termsAccepted || !privacyPolicyAccepted || !dataCollectionConsent) {
        const msg = "You must accept all mandatory agreements to proceed."
        setSaveError(msg)
        toast({ title: "Agreements Required", description: msg, variant: "destructive" })
        return false
      }
    }

    return true
  }

  // --- Navigation ---

  const goToStep = (step: number) => {
    router.push(`/signup/profile-setup?step=${step}`)
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) return

    setIsTransitioning(true)
    await new Promise((resolve) => setTimeout(resolve, 250))
    goToStep(currentStep + 1)
    setIsTransitioning(false)
  }

  const handleBack = () => {
    setSaveError(null)
    setShowValidation(false)
    if (currentStep > 1) goToStep(currentStep - 1)
    else router.push("/signup")
  }

  const handleSkip = () => {
    setSaveError(null)
    setShowValidation(false)
    goToStep(currentStep + 1)
  }

  const handleLaunch = async () => {
    setIsLaunching(true)
    const success = await markSetupComplete()
    if (success) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      router.push("/dashboard")
    } else {
      setSaveError("Failed to save profile. Please try again.")
      setIsLaunching(false)
    }
  }

  // --- Guard ---
  if (isAuthenticated === null || !isLoaded) return <LoadingScreen />
  if (!isAuthenticated) return null

  const progressPercent = Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/20">

        {/* ==================== SIDEBAR (Desktop) ==================== */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl h-full z-20">
          {/* Logo */}
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <ConcentradeLogo size={28} variant="icon" />
              <div>
                <h1 className="font-bold text-sm tracking-tight text-foreground">Profile Setup</h1>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {currentStep - 1} of {TOTAL_STEPS} complete
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {stepConfig.map((step) => (
              <SidebarStep key={step.id} step={step} currentStep={currentStep} />
            ))}
          </nav>

          {/* Progress bar */}
          <div className="p-5 border-t border-border">
            <div className="flex justify-between text-[10px] font-semibold text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </aside>

        {/* ==================== MAIN AREA ==================== */}
        <main className="flex-1 flex flex-col h-full relative bg-background">

          {/* Mobile header */}
          <header className="lg:hidden border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 px-4 pt-3 pb-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ConcentradeLogo size={22} variant="icon" />
                <span className="font-bold text-sm text-foreground">Setup</span>
              </div>
              <span className="text-xs text-muted-foreground">{currentStep}/{TOTAL_STEPS}</span>
            </div>
            <MobileStepIndicator currentStep={currentStep} />
          </header>

          {/* Scrollable content */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

              {/* Step header */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`header-${currentStep}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <currentStepConfig.icon className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-[0.15em]">
                      Step {currentStep}
                    </span>
                    {currentStepConfig.skippable && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal ml-1">Optional</Badge>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {currentStepConfig.title}
                  </h1>
                  <p className="text-muted-foreground text-base mt-2 max-w-xl">
                    {currentStepConfig.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${currentStep}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                  className="min-h-[400px]"
                >
                  {/* ===== STEP 1: Your Profile ===== */}
                  {currentStep === 1 && (
                    <div className="bg-card/50 border border-border rounded-xl p-5 sm:p-6 shadow-sm">
                      <ProfileInfoStep
                        userProfile={config.userProfile}
                        onUpdate={updateUserProfile}
                        showValidation={showValidation}
                      />
                    </div>
                  )}

                  {/* ===== STEP 2: Markets & Instruments ===== */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      {/* Market categories */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">Select your markets</h3>
                        <p className="text-xs text-muted-foreground mb-4">Choose the asset classes you trade. This filters which instruments appear in your trade forms.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {marketCategories.map((cat) => (
                            <MarketCard
                              key={cat.id}
                              category={cat}
                              isSelected={selectedPrimaryInstruments.includes(cat.id)}
                              instrumentCount={instrumentCountByCategory[cat.id] || 0}
                              onClick={() => handleMultiSelectChange("primaryInstruments", cat.id)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Specific instruments (appears after markets selected) */}
                      <AnimatePresence>
                        {selectedPrimaryInstruments.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Separator className="mb-6" />
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-semibold text-foreground mb-1">
                                  Add to your watchlist
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal ml-2">Optional</Badge>
                                </h3>
                                <p className="text-xs text-muted-foreground">Pick specific symbols to track on your dashboard.</p>
                              </div>

                              <div className="flex gap-3">
                                <div className="relative flex-1">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search tickers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-muted/50 h-10"
                                  />
                                </div>
                                <div className="flex border border-border rounded-md overflow-hidden bg-card">
                                  <Button variant="ghost" size="icon" onClick={() => setInstrumentLayout("grid")} className={cn("rounded-none h-10 w-10 hover:bg-muted", instrumentLayout === "grid" && "bg-muted")}>
                                    <LayoutGrid className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => setInstrumentLayout("list")} className={cn("rounded-none h-10 w-10 hover:bg-muted", instrumentLayout === "list" && "bg-muted")}>
                                    <List className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className={cn(
                                "grid gap-2.5",
                                instrumentLayout === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                              )}>
                                {filteredInstruments.map((inst) => (
                                  <TickerCard
                                    key={inst.symbol}
                                    instrument={inst}
                                    isSelected={selectedSpecificInstruments.includes(inst.symbol)}
                                    onSelect={(sym) => handleMultiSelectChange("specificInstruments", sym)}
                                  />
                                ))}
                              </div>
                              {filteredInstruments.length === 0 && searchQuery && (
                                <p className="text-center text-sm text-muted-foreground py-8">No instruments match "{searchQuery}"</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* ===== STEP 3: Preferences (Visibility + Notifications) ===== */}
                  {currentStep === 3 && (
                    <div className="space-y-10">
                      {/* Section A: Instrument Visibility */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Eye className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Instrument Visibility</h3>
                          </div>
                          <p className="text-xs text-muted-foreground">Control which instruments appear in your trade entry forms.</p>
                        </div>

                        {selectedPrimaryInstruments.length === 0 ? (
                          <div className="border border-dashed border-border rounded-xl p-8 text-center">
                            <p className="text-sm text-muted-foreground">No markets selected yet. Go back to Step 2 to choose markets first.</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex flex-wrap gap-2">
                                {selectedPrimaryInstruments.map((catId) => (
                                  <button
                                    key={catId}
                                    type="button"
                                    onClick={() => setActiveVisibilityTab(catId)}
                                    className={cn(
                                      "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                      activeVisibilityTab === catId
                                        ? "bg-primary/10 text-primary border-primary/50"
                                        : "bg-card/50 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                                    )}
                                  >
                                    {catId}
                                  </button>
                                ))}
                              </div>
                              {activeVisibilityTab && (
                                <Button size="sm" variant="outline" onClick={() => toggleAllVisibility(activeVisibilityTab, !isAllVisibleInTab)} className="h-7 text-xs gap-1.5">
                                  {isAllVisibleInTab ? <Square className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
                                  {isAllVisibleInTab ? "Disable All" : "Enable All"}
                                </Button>
                              )}
                            </div>

                            {activeVisibilityTab ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {activeCategoryInstruments.map((inst) => {
                                  const isVisible = visibleInstruments.includes(inst.symbol)
                                  return (
                                    <button
                                      key={inst.symbol}
                                      type="button"
                                      onClick={() => toggleVisibility(inst.symbol)}
                                      className={cn(
                                        "relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between text-left",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        isVisible
                                          ? "bg-primary/10 border-primary/40 shadow-sm"
                                          : "bg-card/40 border-border hover:bg-muted/50 opacity-70 hover:opacity-100"
                                      )}
                                    >
                                      <div>
                                        <div className={cn("font-bold text-sm", isVisible ? "text-primary" : "text-foreground")}>{inst.symbol}</div>
                                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{inst.name}</div>
                                      </div>
                                      <div className={cn(
                                        "w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0",
                                        isVisible ? "bg-primary border-primary" : "border-border bg-muted"
                                      )}>
                                        {isVisible && <Check className="w-3 h-3 text-primary-foreground" />}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="py-12 text-center text-sm text-muted-foreground">Select a market category above.</div>
                            )}
                          </>
                        )}
                      </div>

                      <Separator />

                      {/* Section B: Notifications */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                          </div>
                          <Button variant="outline" size="sm" onClick={enableAllNotifications} className="h-7 text-xs gap-1.5">
                            <CheckSquare className="w-3 h-3" /> Enable All
                          </Button>
                        </div>
                        <div className="bg-card/50 border border-border rounded-xl p-5 shadow-sm">
                          <NotificationsStep
                            notificationPreferences={config.notificationPreferences}
                            onUpdate={updateNotificationPreferences}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===== STEP 4: Legal ===== */}
                  {currentStep === 4 && (
                    <div className="bg-card/50 border border-border rounded-xl p-5 sm:p-6 shadow-sm">
                      <LegalPrivacyStep
                        privacyPreferences={config.privacyPreferences}
                        onUpdate={updatePrivacyPreferences}
                      />
                    </div>
                  )}

                  {/* ===== STEP 5: Review & Launch ===== */}
                  {currentStep === 5 && (
                    <div className="bg-card/50 border border-border rounded-xl p-5 sm:p-6 shadow-sm">
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-foreground mb-2">Review Your Profile</h3>
                        <p className="text-muted-foreground text-sm">
                          Double-check your settings, then launch your trading dashboard.
                        </p>
                      </div>
                      <ReviewConfirmationStep
                        config={config}
                        onLaunch={handleLaunch}
                        isLaunching={isLaunching}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ==================== FOOTER ==================== */}
          {currentStep < TOTAL_STEPS && (
            <div className="border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 sticky bottom-0 z-20">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button variant="ghost" onClick={handleBack} disabled={isTransitioning}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>

                {currentStepConfig.skippable && (
                  <Button variant="link" onClick={handleSkip} disabled={isTransitioning} className="text-muted-foreground text-xs">
                    Skip for now
                  </Button>
                )}

                <AnimatePresence>
                  {saveError && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="hidden md:flex items-center gap-2 text-destructive text-xs font-medium bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-md truncate"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{saveError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                size="lg"
                onClick={handleNext}
                disabled={isTransitioning}
                className={cn(
                  "min-w-[140px] font-bold tracking-wide transition-all",
                  saveError ? "animate-shake" : "shadow-lg shadow-primary/20"
                )}
              >
                {isTransitioning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>

              {/* Mobile error */}
              {saveError && (
                <div className="md:hidden absolute -top-10 left-0 w-full px-4 flex justify-center">
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-md shadow-sm">
                    {saveError}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5 has its own footer via ReviewConfirmationStep's Launch button */}
          {currentStep === TOTAL_STEPS && (
            <div className="border-t border-border bg-background/95 backdrop-blur-md flex items-center px-4 sm:px-6 lg:px-10 py-4 sticky bottom-0 z-20">
              <Button variant="ghost" onClick={handleBack} disabled={isLaunching}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </div>
          )}
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
