"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUserConfig } from "@/hooks/use-user-config"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle2, TrendingUp, BarChart3, Settings, Shield, 
  Bell, UserIcon, Eye, ChevronRight, ChevronLeft, Search, 
  List, Check, AlertCircle, Terminal, Zap, Globe, Cpu, 
  LayoutGrid, Loader2, CheckSquare, Square, Filter
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
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
    subtitle: "Asset Classes",
    description: "Initialize market data feeds for your active environments.",
    icon: Globe,
    color: "text-purple-500",
  },
  {
    id: 2,
    title: "Watchlist",
    subtitle: "Instruments",
    description: "Select specific tickers to track in your terminal.",
    icon: TrendingUp,
    color: "text-emerald-500",
  },
  {
    id: 3,
    title: "Operator",
    subtitle: "Identity",
    description: "Establish your professional trading profile.",
    icon: UserIcon,
    color: "text-cyan-500",
  },
  {
    id: 4,
    title: "Layout",
    subtitle: "Visibility",
    description: "Configure which instruments appear in your trade entry dropdowns.",
    icon: Eye,
    color: "text-indigo-500",
  },
  {
    id: 5,
    title: "Comms",
    subtitle: "Notifications",
    description: "Set protocols for system alerts and updates.",
    icon: Bell,
    color: "text-yellow-500",
  },
  {
    id: 6,
    title: "Protocol",
    subtitle: "Legal",
    description: "Review and accept compliance terms.",
    icon: Shield,
    color: "text-slate-500",
  },
  {
    id: 7,
    title: "Verify",
    subtitle: "Review",
    description: "Final system integrity check before deployment.",
    icon: List,
    color: "text-teal-500",
  },
  {
    id: 8,
    title: "Deploy",
    subtitle: "Launch",
    description: "Finalize setup and enter the terminal.",
    icon: Zap,
    color: "text-violet-500",
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
      isActive ? "bg-accent/50 border-l-2 border-primary pl-[10px]" : "hover:bg-accent/20 border-l-2 border-transparent"
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
      "flex flex-col items-center justify-center p-6 rounded-xl border cursor-pointer transition-all duration-200 bg-card hover:bg-accent/50",
      isSelected 
        ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
        : "border-border/60"
    )}
  >
    <div className={cn("mb-4 transition-all duration-300", isSelected ? "text-primary scale-110" : "text-muted-foreground grayscale")}>
      {category.icon}
    </div>
    <div className="font-bold text-sm text-center uppercase tracking-wide">{category.label}</div>
    <div className="text-[10px] text-muted-foreground text-center mt-1 font-mono">{category.description}</div>
  </div>
)

const TickerCard = ({ instrument, isSelected, onSelect }: any) => {
  return (
    <div
      onClick={() => onSelect(instrument.symbol)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 bg-card/40 backdrop-blur-sm",
        isSelected ? "border-primary/60 bg-primary/10" : "border-border/40"
      )}
    >
       <div className={cn(
         "w-8 h-8 rounded flex items-center justify-center font-mono text-[10px] font-bold border transition-colors", 
         isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-border/50 text-muted-foreground"
       )}>
          {instrument.symbol.substring(0,2)}
       </div>
       <div className="overflow-hidden">
         <div className="text-sm font-bold truncate">{instrument.symbol}</div>
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
      <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/20">
        
        {/* MISSION CONTROL SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 bg-card/10 backdrop-blur-xl h-full z-20">
          <div className="p-6 border-b border-border/40">
            <div className="flex items-center gap-3">
              <ConcentradeLogo size={28} variant="icon" />
              <div>
                <h1 className="font-bold text-sm tracking-tight uppercase">System Config</h1>
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
          <div className="p-6 border-t border-border/40 bg-background/30">
             <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground mb-2 tracking-wider">
                <span>Initialization</span>
                <span>{Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)}%</span>
             </div>
             <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${((currentStep - 1) / TOTAL_STEPS) * 100}%` }} />
             </div>
          </div>
        </aside>

        {/* MAIN TERMINAL AREA */}
        <main className="flex-1 flex flex-col h-full relative bg-background">
          {/* Technical Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          {/* Header Mobile */}
          <header className="h-14 border-b border-border/40 flex items-center justify-between px-6 lg:hidden bg-background/80 backdrop-blur-md sticky top-0 z-50">
             <div className="flex items-center gap-2 font-bold"><ConcentradeLogo size={24} variant="icon"/> Setup</div>
             <Badge variant="outline" className="bg-background/50">Step {currentStep}</Badge>
          </header>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
             <div className="max-w-4xl mx-auto px-6 py-12">
                
                {/* Step Header */}
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

                {/* Step Content */}
                <motion.div
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 }}
                   key={`content-${currentStep}`}
                   className="min-h-[400px]"
                >
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
                        <div className="relative flex gap-3">
                           <div className="relative flex-1">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                             <Input 
                                placeholder="Search tickers..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 bg-card/50 border-border/60 h-11"
                             />
                           </div>
                           <div className="flex border rounded-md overflow-hidden">
                              <Button variant={instrumentLayout === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setInstrumentLayout('grid')} className="rounded-none h-11 w-11"><LayoutGrid className="w-4 h-4"/></Button>
                              <Button variant={instrumentLayout === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setInstrumentLayout('list')} className="rounded-none h-11 w-11"><List className="w-4 h-4"/></Button>
                           </div>
                        </div>
                        {selectedPrimaryInstruments.length === 0 ? (
                           <div className="text-center py-16 border border-dashed border-border/50 rounded-xl bg-card/20">
                              <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold">Feed Offline</h3>
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
                   
                   {/* STEP 3: IDENTITY */}
                   {currentStep === 3 && (
                      <div className="max-w-xl bg-card/30 border rounded-xl p-6 backdrop-blur-sm">
                         <ProfileInfoStep userProfile={config.userProfile} onUpdate={updateUserProfile} />
                      </div>
                   )}
                   
                   {/* STEP 4: LAYOUT / VISIBILITY (Redesigned) */}
                   {currentStep === 4 && (
                      <div className="space-y-6">
                         {/* Control Bar */}
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/40">
                            {/* Tabs */}
                            <div className="flex flex-wrap gap-2">
                               {selectedPrimaryInstruments.length === 0 && <span className="text-sm text-muted-foreground">No markets configured.</span>}
                               {selectedPrimaryInstruments.map(catId => (
                                  <button
                                     key={catId}
                                     onClick={() => setActiveLayoutTab(catId)}
                                     className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
                                        activeLayoutTab === catId 
                                           ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/50" 
                                           : "bg-muted/30 text-muted-foreground border-transparent hover:border-border"
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
                                  className="h-8 text-xs border-indigo-500/20 hover:bg-indigo-500/10 hover:text-indigo-500"
                               >
                                  {isAllVisibleInTab ? <Square className="w-3 h-3 mr-2" /> : <CheckSquare className="w-3 h-3 mr-2" />}
                                  {isAllVisibleInTab ? "Disable All" : "Enable All"}
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
                                           "relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between",
                                           isVisible 
                                              ? "bg-indigo-500/5 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                                              : "bg-card/20 border-border/40 hover:bg-muted/20 opacity-60 hover:opacity-100"
                                        )}
                                     >
                                        <div>
                                           <div className={cn("font-bold text-sm", isVisible ? "text-indigo-400" : "text-foreground")}>{inst.symbol}</div>
                                           <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{inst.name}</div>
                                        </div>
                                        <div className={cn(
                                           "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                           isVisible ? "bg-indigo-500 border-indigo-500" : "border-border"
                                        )}>
                                           {isVisible && <Check className="w-3 h-3 text-white" />}
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
                   
                   {/* STEP 5: ALERTS */}
                   {currentStep === 5 && (
                      <div className="space-y-4">
                         <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={enableAllNotifications} className="gap-2">
                               <CheckSquare className="w-4 h-4"/> Activate All
                            </Button>
                         </div>
                         <div className="bg-card/30 border rounded-xl p-6 backdrop-blur-sm">
                            <NotificationsStep notificationPreferences={config.notificationPreferences} onUpdate={updateNotificationPreferences} />
                         </div>
                      </div>
                   )}
                   
                   {currentStep === 6 && (
                      <div className="bg-card/30 border rounded-xl p-6 backdrop-blur-sm">
                         <LegalPrivacyStep privacyPreferences={config.privacyPreferences} onUpdate={updatePrivacyPreferences} />
                      </div>
                   )}
                   
                   {currentStep === 7 && (
                      <div className="bg-card/30 border rounded-xl p-6 backdrop-blur-sm">
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
                         <h2 className="text-3xl font-bold mb-3 tracking-tight">System Initialized</h2>
                         <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                            Your environment is ready for deployment.
                         </p>
                      </div>
                   )}
                </motion.div>
             </div>
          </div>

          {/* Footer Controls */}
          <div className="h-24 border-t border-border/40 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-12 sticky bottom-0 z-20">
             <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={isTransitioning}
                className="text-muted-foreground hover:text-foreground"
             >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
             </Button>
             
             <div className="flex gap-4 items-center">
                <Button 
                   size="lg"
                   onClick={handleNext} 
                   disabled={isTransitioning} 
                   className="min-w-[160px] shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide"
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
