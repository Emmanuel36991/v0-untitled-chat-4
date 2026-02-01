"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUserConfig } from "@/hooks/use-user-config"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle2, TrendingUp, Shield, 
  Bell, UserIcon, Eye, ChevronRight, ChevronLeft, Search, 
  List, Check, AlertCircle, Terminal, Zap, Globe, 
  LayoutGrid, Loader2, CheckSquare, Square
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
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
    subtitle: "Assets",
    description: "Choose the markets you want to follow.",
    icon: Globe,
    color: "text-purple-400",
  },
  {
    id: 2,
    title: "Watchlist",
    subtitle: "Favorites",
    description: "Pick specific symbols to track on your dashboard.",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    id: 3,
    title: "Profile",
    subtitle: "Personal Info",
    description: "Set up your trader identity and details.",
    icon: UserIcon,
    color: "text-cyan-400",
  },
  {
    id: 4,
    title: "Display",
    subtitle: "Visibility",
    description: "Customize which assets appear in your menus.",
    icon: Eye,
    color: "text-indigo-400",
  },
  {
    id: 5,
    title: "Alerts",
    subtitle: "Notifications",
    description: "Choose how and when we should contact you.",
    icon: Bell,
    color: "text-yellow-400",
  },
  {
    id: 6,
    title: "Legal",
    subtitle: "Terms",
    description: "Review and accept the service agreements.",
    icon: Shield,
    color: "text-slate-400",
  },
  {
    id: 7,
    title: "Review",
    subtitle: "Summary",
    description: "Double-check your settings before finishing.",
    icon: List,
    color: "text-teal-400",
  },
  {
    id: 8,
    title: "Finish",
    subtitle: "Complete",
    description: "Finalize your setup and enter the platform.",
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
      "relative flex items-center group py-3 px-3 mb-1 rounded-md transition-all duration-300", 
      isActive ? "bg-card/80 border-l-2 border-primary pl-[10px]" : "hover:bg-muted/40 border-l-2 border-transparent"
    )}>
      <div className="flex items-center gap-3 w-full">
        <div
          className={cn(
            "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all duration-300",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : isPast
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground",
          )}
        >
          {isPast ? <Check className="w-3 h-3" /> : step.id}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider transition-colors", 
            isActive ? "text-foreground" : "text-muted-foreground"
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
      "flex flex-col items-center justify-center p-6 rounded-xl border cursor-pointer transition-all duration-200",
      isSelected 
        ? "border-primary bg-primary/20 shadow-lg shadow-primary/10" 
        : "border-border bg-card/40 hover:bg-muted/60 hover:border-border"
    )}
  >
    <div className={cn("mb-4 transition-all duration-300", isSelected ? "text-primary scale-110" : "text-muted-foreground grayscale")}>
      {category.icon}
    </div>
    <div className="font-bold text-sm text-center uppercase tracking-wide text-foreground">{category.label}</div>
    <div className="text-[10px] text-muted-foreground text-center mt-1 font-mono">{category.description}</div>
  </div>
)

const TickerCard = ({ instrument, isSelected, onSelect }: any) => {
  return (
    <div
      onClick={() => onSelect(instrument.symbol)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all backdrop-blur-sm",
        isSelected 
          ? "border-primary/60 bg-primary/20" 
          : "border-border bg-card/40 hover:bg-muted/60"
      )}
    >
       <div className={cn(
         "w-8 h-8 rounded flex items-center justify-center font-mono text-[10px] font-bold border transition-colors", 
         isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground"
       )}>
          {instrument.symbol.substring(0,2)}
       </div>
       <div className="overflow-hidden">
         <div className="text-sm font-bold truncate text-foreground">{instrument.symbol}</div>
         <div className="text-[10px] text-muted-foreground truncate">{instrument.name}</div>
       </div>
       {isSelected && <CheckCircle2 className="w-4 h-4 text-primary ml-auto flex-shrink-0" />}
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

  // --- REAL-TIME ERROR CLEARING ---
  useEffect(() => {
    if (!saveError) return

    if (currentStep === 1) {
      if (config.tradingPreferences.primaryInstruments?.length > 0) setSaveError(null)
    }
    // FIX: Check for fullName instead of firstName
    if (currentStep === 3) {
      // @ts-ignore - Assuming fullName exists on userProfile based on user request
      if (config.userProfile?.fullName && config.userProfile.fullName.length > 2) setSaveError(null)
    }
    if (currentStep === 6) {
      const { termsAccepted, privacyPolicyAccepted, dataCollectionConsent } = config.privacyPreferences
      if (termsAccepted && privacyPolicyAccepted && dataCollectionConsent) setSaveError(null)
    }
  }, [config, currentStep, saveError])

  // --- STRICT VALIDATION LOGIC ---
  const validateStep = (step: number): boolean => {
    setSaveError(null)

    // Step 1: Markets (Must select at least one)
    if (step === 1) {
      if (!config.tradingPreferences.primaryInstruments || config.tradingPreferences.primaryInstruments.length === 0) {
        setSaveError("Please select at least one market to continue.")
        return false
      }
    }

    // Step 3: Identity (Must have a Full Name)
    if (step === 3) {
      // @ts-ignore - Check for fullName
      if (!config.userProfile?.fullName || config.userProfile.fullName.trim().length < 3) {
        setSaveError("Please enter your full name.")
        return false
      }
    }

    // Step 6: Legal (Must accept mandatory policies)
    if (step === 6) {
      const { termsAccepted, privacyPolicyAccepted, dataCollectionConsent } = config.privacyPreferences
      if (!termsAccepted || !privacyPolicyAccepted || !dataCollectionConsent) {
        setSaveError("You must accept all mandatory agreements to proceed.")
        return false
      }
    }

    return true
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) return

    setIsTransitioning(true)
    if (currentStep < TOTAL_STEPS) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      router.push(`/signup/profile-setup?step=${currentStep + 1}`)
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
      setIsTransitioning(false)
    } else {
      const success = await markSetupComplete()
      if (success) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        router.push("/dashboard")
      } else {
        setSaveError("Failed to save profile. Please try again.")
        setIsTransitioning(false)
      }
    }
  }

  const handleBack = () => {
    setSaveError(null)
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

  // --- STEP 4 LOGIC ---
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
      <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/20">
        
        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl h-full z-20">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <ConcentradeLogo size={28} variant="icon" />
              <div>
                <h1 className="font-bold text-sm tracking-tight uppercase text-foreground">System Config</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-3">
            {stepConfig.map((step) => (
              <SidebarStep key={step.id} step={step} currentStep={currentStep} />
            ))}
          </div>

          <div className="p-6 border-t border-border bg-card/80">
             <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground mb-2 tracking-wider">
                <span>Initialization</span>
                <span>{Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)}%</span>
             </div>
             <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px] shadow-primary/50" style={{ width: `${((currentStep - 1) / TOTAL_STEPS) * 100}%` }} />
             </div>
          </div>
        </aside>

        {/* MAIN TERMINAL AREA */}
        <main className="flex-1 flex flex-col h-full relative bg-background">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <header className="h-14 border-b border-border flex items-center justify-between px-6 lg:hidden bg-card/80 backdrop-blur-md sticky top-0 z-50">
             <div className="flex items-center gap-2 font-bold text-foreground"><ConcentradeLogo size={24} variant="icon"/> Setup</div>
             <Badge variant="outline">Step {currentStep}</Badge>
          </header>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
             <div className="max-w-4xl mx-auto px-6 py-12">
                
                <motion.div 
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   key={`header-${currentStep}`}
                   className="mb-10"
                >
                   <div className="flex items-center gap-2 text-primary mb-3">
                      <currentStepConfig.icon className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">{currentStepConfig.subtitle}</span>
                   </div>
                   <h1 className="text-4xl font-bold tracking-tight mb-3 text-foreground">{currentStepConfig.title}</h1>
                   <p className="text-muted-foreground text-lg max-w-2xl">{currentStepConfig.description}</p>
                </motion.div>

                <motion.div
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 }}
                   key={`content-${currentStep}`}
                   className="min-h-[400px]"
                >
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

                   {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="relative flex gap-3">
                           <div className="relative flex-1">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                             <Input 
                                placeholder="Search tickers..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 bg-muted/50 h-11 focus-visible:ring-primary/50"
                             />
                           </div>
                           <div className="flex border border-border rounded-md overflow-hidden bg-card">
                              <Button variant="ghost" size="icon" onClick={() => setInstrumentLayout('grid')} className={cn("rounded-none h-11 w-11 hover:bg-muted", instrumentLayout === 'grid' && "bg-muted")}><LayoutGrid className="w-4 h-4"/></Button>
                              <Button variant="ghost" size="icon" onClick={() => setInstrumentLayout('list')} className={cn("rounded-none h-11 w-11 hover:bg-muted", instrumentLayout === 'list' && "bg-muted")}><List className="w-4 h-4"/></Button>
                           </div>
                        </div>
                        {selectedPrimaryInstruments.length === 0 ? (
                           <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/20">
                              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-foreground">Feed Offline</h3>
                              <p className="text-muted-foreground mb-6">Select a market class to initialize the feed.</p>
                              <Button variant="outline" onClick={handleBack}>Return to Markets</Button>
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
                   
                   {currentStep === 3 && (
                      <div className="max-w-xl bg-card/50 border border-border rounded-xl p-6 backdrop-blur-sm shadow-sm">
                         <ProfileInfoStep userProfile={config.userProfile} onUpdate={updateUserProfile} />
                      </div>
                   )}
                   
                   {currentStep === 4 && (
                      <div className="space-y-6">
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
                            <div className="flex flex-wrap gap-2">
                               {selectedPrimaryInstruments.length === 0 && <span className="text-sm text-muted-foreground">No markets configured.</span>}
                               {selectedPrimaryInstruments.map(catId => (
                                  <button
                                     key={catId}
                                     onClick={() => setActiveLayoutTab(catId)}
                                     className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
                                        activeLayoutTab === catId 
                                           ? "bg-primary/10 text-primary border-primary/50" 
                                           : "bg-card/50 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                                     )}
                                  >
                                     {catId}
                                  </button>
                               ))}
                            </div>
                            
                            {activeLayoutTab && (
                               <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => toggleAllVisibility(activeLayoutTab, !isAllVisibleInTab)}
                                  className="h-8 text-xs"
                               >
                                  {isAllVisibleInTab ? <Square className="w-3 h-3 mr-2" /> : <CheckSquare className="w-3 h-3 mr-2" />}
                                  {isAllVisibleInTab ? "Disable All" : "Enable All"}
                               </Button>
                            )}
                         </div>

                         {activeLayoutTab ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                               {activeCategoryInstruments.map((inst) => {
                                  const isVisible = visibleInstruments.includes(inst.symbol)
                                  return (
                                     <div
                                        key={inst.symbol}
                                        onClick={() => toggleVisibility(inst.symbol)}
                                        className={cn(
                                           "relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between",
                                           isVisible 
                                              ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/10" 
                                              : "bg-card/40 border-border hover:bg-muted/50 hover:border-border opacity-70 hover:opacity-100"
                                        )}
                                     >
                                        <div>
                                           <div className={cn("font-bold text-sm", isVisible ? "text-primary" : "text-foreground")}>{inst.symbol}</div>
                                           <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{inst.name}</div>
                                        </div>
                                        <div className={cn(
                                           "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                           isVisible ? "bg-primary border-primary" : "border-border bg-muted"
                                        )}>
                                           {isVisible && <Check className="w-3 h-3 text-primary-foreground" />}
                                        </div>
                                     </div>
                                  )
                               })}
                            </div>
                         ) : (
                            <div className="py-20 text-center text-muted-foreground">Select a market category above to configure feeds.</div>
                         )}
                      </div>
                   )}
                   
                   {currentStep === 5 && (
                      <div className="space-y-4">
                         <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={enableAllNotifications} className="gap-2">
                               <CheckSquare className="w-4 h-4"/> Activate All
                            </Button>
                         </div>
                         <div className="bg-card/50 border border-border rounded-xl p-6 backdrop-blur-sm">
                            <NotificationsStep notificationPreferences={config.notificationPreferences} onUpdate={updateNotificationPreferences} />
                         </div>
                      </div>
                   )}
                   
                   {currentStep === 6 && (
                      <div className="bg-card/50 border border-border rounded-xl p-6 backdrop-blur-sm">
                         <LegalPrivacyStep privacyPreferences={config.privacyPreferences} onUpdate={updatePrivacyPreferences} />
                      </div>
                   )}
                   
                   {currentStep === 7 && (
                      <div className="bg-card/50 border border-border rounded-xl p-6 backdrop-blur-sm">
                         <ReviewConfirmationStep config={config} />
                      </div>
                   )}
                   
                   {currentStep === 8 && (
                      <div className="flex flex-col items-center justify-center py-24 text-center">
                         <div className="relative mb-8">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
                               <Terminal className="w-10 h-10" />
                            </div>
                            <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-[spin_8s_linear_infinite]" />
                            <div className="absolute inset-2 border border-primary/10 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
                         </div>
                         <h2 className="text-3xl font-bold mb-3 tracking-tight text-foreground">System Initialized</h2>
                         <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                            Your environment is ready for deployment.
                         </p>
                      </div>
                   )}
                </motion.div>
             </div>
          </div>

          <div className="h-24 border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-between px-6 lg:px-12 sticky bottom-0 z-20">
             <div className="flex items-center gap-4 flex-1">
               <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  disabled={isTransitioning}
               >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
               </Button>
               
               <AnimatePresence>
                 {saveError && (
                   <motion.div 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0 }}
                     className="hidden md:flex items-center gap-2 text-destructive text-sm font-medium bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-md"
                   >
                     <AlertCircle className="w-4 h-4" />
                     {saveError}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
             
             <div className="flex gap-4 items-center">
                {saveError && (
                   <div className="md:hidden absolute top-2 left-0 w-full px-6 flex justify-center">
                     <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-2 py-1 rounded">{saveError}</div>
                   </div>
                )}

                <Button 
                   size="lg"
                   onClick={handleNext} 
                   disabled={isTransitioning} 
                   className={cn(
                     "min-w-[160px] font-bold tracking-wide transition-all",
                     saveError ? "animate-shake bg-primary/90" : "shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
                   )}
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
