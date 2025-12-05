"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import type { FC, ReactNode } from "react"
import Papa from "papaparse"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from "recharts"
import { getTrades, addMultipleTrades, deleteAllTrades, deleteTrade } from "@/app/actions/trade-actions"
import { SimpleTradeTable } from "./SimpleTradeTable"
import type { Trade, NewTradeInput } from "@/types"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  RefreshCw,
  Upload,
  AlertTriangle,
  Grid3X3,
  List,
  PlusCircle,
  Building2,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  BarChart3,
  Database,
  Settings,
  Activity,
  Calendar,
  Clock,
  Filter,
  Trash2,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Search,
  SlidersHorizontal,
  Download,
  X,
  PanelRightOpen,
  ArrowRight,
  Sparkles,
  Zap,
  Flame,
  BrainCircuit
} from "lucide-react"
import NextLink from "next/link"
import AdvancedTradeFilters, { type TradeFilters } from "@/components/trades/advanced-trade-filters"
import { cn } from "@/lib/utils"
import { SimpleConnectionModal } from "@/components/connection/simple-connection-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

// --- Types & Interfaces ---

interface ParsedTradeRow {
  [key: string]: string
}

interface ProcessedOrder {
  [key: string]: any
  symbol: string
  side: "buy" | "sell"
  type: string
  qty: number
  fillPrice: number
  stopPrice?: number | null
  limitPrice?: number | null
  placingTime: Date
  orderId: string
  originalRow: ParsedTradeRow
  usedInPairing: boolean
  commission?: number | null
}

interface ClientOnlyProps {
  children: ReactNode
}

interface MetricProps {
  label: string
  value: string
  trend?: "up" | "down" | "neutral"
  subValue?: string
  color?: string
  icon?: React.ElementType
}

// --- Constants ---

const MOTIVATIONAL_QUOTES = [
  "The goal of a successful trader is to make the best trades. Money is secondary.",
  "Risk comes from not knowing what you are doing.",
  "Limit your size in any position so that fear does not become the prevailing instinct.",
  "It's not whether you're right or wrong that's important, but how much money you make when you're right.",
  "Trade what you see, not what you think.",
  "The market is a device for transferring money from the impatient to the patient.",
]

// --- Sub-Components ---

// 1. Animated Title (Restored from Iteration 1)
const AnimatedTitle = React.memo<{ children: React.ReactNode; className?: string; delay?: number }>(
  ({ children, className, delay = 0 }) => (
    <h1
      className={cn(
        "text-4xl md:text-5xl font-extrabold tracking-tight",
        "animate-fade-in-up drop-shadow-sm",
        "bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-slate-700 to-gray-900 dark:from-white dark:via-slate-200 dark:to-white",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </h1>
  ),
)

// 2. Glassmorphism Header (Restored & Improved)
const GlassHeader = React.memo<{ count: number; quote: string }>(({ count, quote }) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <div className="relative mb-8 group">
      {/* Dynamic Background Blur Effects */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative bg-white dark:bg-slate-900 ring-1 ring-slate-900/5 rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <div className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400">
               <span className="flex items-center px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                 <Flame className="w-3.5 h-3.5 mr-1" /> {getGreeting()}, Trader
               </span>
               <span className="text-slate-400">•</span>
               <span className="text-slate-500 dark:text-slate-400">{format(new Date(), "MMMM dd, yyyy")}</span>
             </div>
             
             <div>
               <AnimatedTitle className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                 Trade Database
               </AnimatedTitle>
               <p className="mt-2 text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-light">
                 Your central command for trade logging, execution analysis, and performance tracking.
               </p>
             </div>

             <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 italic">
               <BrainCircuit className="w-4 h-4 text-purple-500" />
               <span>"{quote}"</span>
             </div>
          </div>

          <div className="flex flex-col items-end justify-end gap-3">
             <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1.5 h-auto text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <Database className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  {count} Records
                </Badge>
                <Badge variant="outline" className="px-3 py-1.5 h-auto text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                  <Zap className="w-3.5 h-3.5 mr-2" />
                  System Active
                </Badge>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// 3. Compact Metric Item (Refined for new style)
const CompactMetric = ({ label, value, trend, subValue, color = "text-slate-900", icon: Icon }: MetricProps) => (
  <div className="flex flex-col p-4 relative group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-default">
    <div className="flex items-center justify-between mb-2">
       <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</span>
       {Icon && <Icon className="w-3 h-3 text-slate-300 group-hover:text-slate-400 transition-colors" />}
    </div>
    <div className="flex items-baseline gap-2 mt-auto">
      <span className={cn("text-2xl font-bold font-mono tracking-tight", color)}>{value}</span>
      {trend && (
        <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full", 
          trend === "up" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : 
          trend === "down" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : 
          "bg-slate-100 text-slate-600"
        )}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "−"}
        </span>
      )}
    </div>
    {subValue && <span className="text-xs text-slate-400 mt-1">{subValue}</span>}
    
    {/* Right Border separator */}
    <div className="absolute right-0 top-3 bottom-3 w-[1px] bg-slate-100 dark:bg-slate-800 last:hidden" />
  </div>
)

// 4. Analytics Sheet Content
const AnalyticsSheetContent = ({ 
  chartData, 
  stats,
  heatmapData 
}: { 
  chartData: any[], 
  stats: any, 
  heatmapData: any[] 
}) => {
  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-8 pb-10">
        <div className="space-y-1 pt-6">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Performance Analytics</h3>
           <p className="text-sm text-slate-500">Real-time breakdown of your trading edge.</p>
        </div>

        {/* Equity Curve */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
               <Activity className="h-4 w-4 text-blue-500" /> Equity Curve
             </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] p-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sheetColorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#sheetColorPnl)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Key Ratios */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 transition-colors">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Target className="h-6 w-6 text-emerald-500 mb-2" />
              <div className="text-xs font-semibold text-slate-500 uppercase">Win Rate</div>
              <div className={cn("text-3xl font-bold mt-1", stats.winRate >= 50 ? "text-emerald-600" : "text-amber-600")}>
                {stats.winRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 transition-colors">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Scale className="h-6 w-6 text-blue-500 mb-2" />
              <div className="text-xs font-semibold text-slate-500 uppercase">Profit Factor</div>
              <div className="text-3xl font-bold mt-1 text-slate-700 dark:text-slate-300">
                {stats.profitFactor.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap Mini */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Consistency Map
          </h3>
          <div className="flex flex-wrap gap-1.5 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
             {heatmapData.length > 0 ? heatmapData.slice(-60).map((d, i) => (
               <RechartsTooltip 
                  key={i}
                  trigger="hover"
                  content={<div className="bg-slate-900 text-white p-2 rounded text-xs">{d.date}: ${d.pnl}</div>}
               >
                 <div 
                   className={cn(
                     "w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-pointer",
                     d.count === 0 ? "bg-slate-200 dark:bg-slate-800" :
                     d.pnl > 0 ? "bg-emerald-500 shadow-sm shadow-emerald-200" : "bg-rose-500 shadow-sm shadow-rose-200"
                   )} 
                 />
               </RechartsTooltip>
             )) : <p className="text-xs text-slate-400 w-full text-center py-4">No trading data available</p>}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

// Icon for Profit Factor
const Scale = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/>
    <path d="M12 3v18"/>
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
)

const ClientOnly: FC<ClientOnlyProps> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => { setHasMounted(true) }, [])
  if (!hasMounted) return null
  return <>{children}</>
}

// --- Main Page Component ---

export default function TradesPage() {
  // State: Data
  const [trades, setTrades] = useState<Trade[]>([])
  const [filters, setFilters] = useState<TradeFilters>({})
  
  // State: UI Layout & Interaction
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [quoteIndex, setQuoteIndex] = useState(0)

  // State: Dialogs
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessingImport, setIsProcessingImport] = useState(false)
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const { toast } = useToast()

  // --------------------------------------------------------------------------------
  // Data Logic
  // --------------------------------------------------------------------------------

  // Rotation for quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchTradesAndSetState = useCallback(async (showToast = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const fetched = await getTrades()
      const sorted = fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setTrades(sorted)
      if (showToast) toast({ title: "Updated", description: "Database synchronized." })
    } catch (err: any) {
      console.error(err)
      setError(err.message)
      setTrades([])
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTradesAndSetState(false)
  }, [fetchTradesAndSetState])

  // Filter Logic
  const filteredTrades = useMemo(() => {
    let result = trades
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(t => 
        t.instrument.toLowerCase().includes(lower) || 
        (t.setup_name && t.setup_name.toLowerCase().includes(lower)) ||
        (t.notes && t.notes.toLowerCase().includes(lower))
      )
    }
    if (Object.keys(filters).length > 0) {
      result = result.filter((trade) => {
        let passes = true
        if (filters.instrument && !(trade.instrument || "").toLowerCase().includes(filters.instrument.toLowerCase())) passes = false
        if (filters.outcome && filters.outcome !== "any" && trade.outcome !== filters.outcome) passes = false
        if (filters.setupName && !(trade.setup_name || "").toLowerCase().includes(filters.setupName.toLowerCase())) passes = false
        if (filters.dateRange?.from) {
          const tradeDate = new Date(trade.date)
          if (tradeDate < filters.dateRange.from) passes = false
          if (filters.dateRange.to && tradeDate > new Date(new Date(filters.dateRange.to).setHours(23, 59, 59, 999))) passes = false
        }
        if (filters.minPnl !== undefined && trade.pnl < filters.minPnl) passes = false
        if (filters.maxPnl !== undefined && trade.pnl > filters.maxPnl) passes = false
        return passes
      })
    }
    return result
  }, [trades, filters, searchTerm])

  // Stats Logic
  const stats = useMemo(() => {
    if (!filteredTrades.length) return { 
      totalTrades: 0, winRate: 0, totalPnL: 0, avgPnL: 0, profitFactor: 0, bestTrade: 0, worstTrade: 0, volume: 0
    }
    const count = filteredTrades.length
    const wins = filteredTrades.filter(t => t.outcome === "win")
    const losses = filteredTrades.filter(t => t.outcome === "loss")
    const winRate = count > 0 ? (wins.length / count) * 100 : 0
    const totalPnL = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0)
    const avgPnL = count > 0 ? totalPnL / count : 0
    const grossProfit = wins.reduce((acc, t) => acc + (t.pnl || 0), 0)
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (t.pnl || 0), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit

    return { 
      totalTrades: count, 
      winRate, 
      totalPnL, 
      avgPnL, 
      profitFactor,
      bestTrade: Math.max(...filteredTrades.map(t => t.pnl)),
      worstTrade: Math.min(...filteredTrades.map(t => t.pnl)),
      volume: filteredTrades.reduce((acc, t) => acc + (t.size || 0), 0)
    }
  }, [filteredTrades])

  // Chart Logic
  const chartData = useMemo(() => {
    const sorted = [...filteredTrades].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let acc = 0
    return sorted.map(t => {
      acc += t.pnl
      return { date: t.date, pnl: t.pnl, cumulative: acc }
    })
  }, [filteredTrades])

  const heatmapData = useMemo(() => {
    const map = new Map<string, { date: string, pnl: number, count: number }>()
    filteredTrades.forEach(t => {
      const d = new Date(t.date).toISOString().split('T')[0]
      const curr = map.get(d) || { date: d, pnl: 0, count: 0 }
      curr.pnl += t.pnl
      curr.count += 1
      map.set(d, curr)
    })
    return Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date))
  }, [filteredTrades])

  // --------------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleImport = async () => {
    if (!file) return
    setIsProcessingImport(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rawData = results.data as ParsedTradeRow[]
        try {
           const processedTrades: NewTradeInput[] = rawData.map(row => ({
             date: new Date().toISOString(),
             instrument: row['Symbol'] || row['symbol'] || 'UNKNOWN',
             direction: (row['Side'] || row['side'])?.toLowerCase() === 'buy' ? 'long' : 'short',
             entry_price: parseFloat(row['Price'] || row['price'] || '0'),
             exit_price: parseFloat(row['Price'] || row['price'] || '0') + 10,
             size: parseFloat(row['Qty'] || row['qty'] || '0'),
             pnl: 0,
             outcome: 'breakeven',
             notes: 'Quick Import'
           })).filter(t => t.size > 0 && t.instrument !== 'UNKNOWN')

           if(processedTrades.length > 0) {
             await addMultipleTrades(processedTrades)
             toast({ title: "Import Successful", description: `Added ${processedTrades.length} records.` })
             fetchTradesAndSetState(true)
             setIsImportDialogOpen(false)
           } else {
             toast({ title: "Import Error", description: "No valid trades found.", variant: "destructive" })
           }
        } catch(e) { console.error(e) }
        setIsProcessingImport(false)
      }
    })
  }

  const handleDeleteAll = async () => {
    setIsDeleteDialogOpen(false)
    await deleteAllTrades()
    fetchTradesAndSetState(true)
  }

  // --------------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------------

  return (
    <ClientOnly>
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#09090b] text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
        
        {/* Simple Top Navigation */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Database className="h-4 w-4 text-white" />
               </div>
               <span className="font-bold text-lg hidden sm:inline-block tracking-tight">TradeVault</span>
            </div>

            <div className="flex items-center gap-2">
               <Sheet>
                 <SheetTrigger asChild>
                   <Button variant="outline" size="sm" className="h-9 hidden md:flex border-slate-200 dark:border-slate-700">
                     <Activity className="mr-2 h-4 w-4 text-blue-500" />
                     Analytics
                   </Button>
                 </SheetTrigger>
                 <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                   <AnalyticsSheetContent chartData={chartData} stats={stats} heatmapData={heatmapData} />
                 </SheetContent>
               </Sheet>

               <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20" asChild>
                 <NextLink href="/add-trade">
                   <PlusCircle className="mr-2 h-4 w-4" />
                   Log Trade
                 </NextLink>
               </Button>
               
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-9 w-9">
                     <Settings className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   <DropdownMenuLabel>Database Actions</DropdownMenuLabel>
                   <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                     <Upload className="mr-2 h-4 w-4" /> Import CSV
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setIsConnectionDialogOpen(true)}>
                     <Building2 className="mr-2 h-4 w-4" /> Connect Broker
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600 focus:text-red-600">
                     <Trash2 className="mr-2 h-4 w-4" /> Clear Database
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-[1920px]">
          
          {/* 1. Restored Premium Header */}
          <GlassHeader count={trades.length} quote={MOTIVATIONAL_QUOTES[quoteIndex]} />

          {/* 2. Collapsible HUD (Stats Strip) */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
             <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                   {filteredTrades.length !== trades.length ? "Filtered Metrics" : "Portfolio Metrics"}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-transparent"
                  onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                >
                  {isStatsCollapsed ? <Maximize2 className="h-3 w-3 mr-1" /> : <Minimize2 className="h-3 w-3 mr-1" />}
                  {isStatsCollapsed ? "Show Stats" : "Hide Stats"}
                </Button>
             </div>
             
             <div className={cn(
                "transition-all duration-500 ease-in-out overflow-hidden",
                isStatsCollapsed ? "max-h-0 opacity-0" : "max-h-[200px] opacity-100"
             )}>
               <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                 <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                    <CompactMetric 
                      label="Net P&L" 
                      value={`$${stats.totalPnL.toFixed(2)}`} 
                      color={stats.totalPnL >= 0 ? "text-emerald-600" : "text-rose-600"} 
                      trend={stats.totalPnL > 0 ? "up" : "down"}
                      subValue={`Avg: $${stats.avgPnL.toFixed(2)}`}
                      icon={DollarSign}
                    />
                    <CompactMetric 
                      label="Win Rate" 
                      value={`${stats.winRate.toFixed(1)}%`} 
                      color="text-blue-600 dark:text-blue-400"
                      subValue={`PF: ${stats.profitFactor.toFixed(2)}`}
                      icon={Target}
                    />
                    <CompactMetric 
                      label="Total Volume" 
                      value={stats.totalTrades.toString()} 
                      subValue="Executed Trades"
                      icon={BarChart3}
                    />
                    <CompactMetric 
                      label="Best Trade" 
                      value={`$${stats.bestTrade.toFixed(2)}`} 
                      color="text-emerald-600"
                      trend="up"
                      icon={TrendingUp}
                    />
                    <CompactMetric 
                      label="Max Drawdown" 
                      value={`$${Math.abs(stats.worstTrade).toFixed(2)}`} 
                      color="text-rose-600"
                      trend="down"
                      icon={TrendingDown}
                    />
                 </div>
               </Card>
             </div>
          </div>

          {/* 3. Main Database Toolbar & Table */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
             
             {/* Toolbar */}
             <div className="sticky top-16 z-30 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                
                {/* Search & View Toggles */}
                <div className="flex items-center flex-1 gap-2 w-full sm:w-auto">
                   <div className="relative w-full sm:w-72 group">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <Input 
                        placeholder="Search symbols, notes..." 
                        className="pl-9 h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                   
                   <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-950 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("h-7 px-2.5 rounded-md text-slate-500 hover:text-slate-900", viewMode === 'list' && "bg-white dark:bg-slate-800 shadow-sm text-blue-600 font-medium")}
                        onClick={() => setViewMode('list')}
                        title="List View"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("h-7 px-2.5 rounded-md text-slate-500 hover:text-slate-900", viewMode === 'grid' && "bg-white dark:bg-slate-800 shadow-sm text-blue-600 font-medium")}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                   </div>
                </div>

                {/* Filter Trigger */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                   {/* Mobile View Toggle */}
                   <div className="flex sm:hidden items-center bg-slate-100 dark:bg-slate-950 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                      <Button variant="ghost" size="sm" className={cn("h-7 w-7 p-0", viewMode === 'list' && "bg-white shadow-sm")} onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="sm" className={cn("h-7 w-7 p-0", viewMode === 'grid' && "bg-white shadow-sm")} onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4"/></Button>
                   </div>

                   <Sheet>
                    <SheetTrigger asChild>
                       <Button variant="outline" size="sm" className={cn(
                         "h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800",
                         Object.keys(filters).length > 0 && "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                       )}>
                         <Filter className="mr-2 h-3.5 w-3.5" />
                         Filters
                         {Object.keys(filters).length > 0 && (
                           <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                             {Object.keys(filters).length}
                           </Badge>
                         )}
                       </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>Advanced Filters</SheetTitle>
                        <SheetDescription>Refine your database view</SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                        <AdvancedTradeFilters setFilters={setFilters} initialFilters={filters} />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
             </div>

             {/* The Database (Table) */}
             <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 min-h-[600px] flex flex-col">
                {isLoading ? (
                   <div className="flex-1 flex flex-col items-center justify-center p-12">
                      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6" />
                      <p className="text-slate-500 font-medium">Synchronizing database...</p>
                   </div>
                ) : filteredTrades.length === 0 ? (
                   <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-1 ring-slate-100 dark:ring-slate-700">
                        <Search className="h-10 w-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No trades found</h3>
                      <p className="text-slate-500 max-w-sm mx-auto mb-8">
                        Your search or filters didn't return any results. Try adjusting your parameters.
                      </p>
                      <Button variant="outline" onClick={() => { setSearchTerm(""); setFilters({}); }} className="border-dashed">
                        Clear All Filters
                      </Button>
                   </div>
                ) : (
                   <SimpleTradeTable trades={filteredTrades} onRefresh={() => fetchTradesAndSetState(true)} />
                )}
             </Card>

             <div className="flex justify-between items-center text-xs text-slate-400 px-4 pb-8">
                <span>Showing {filteredTrades.length} of {trades.length} trades</span>
                <span>Database v2.5 • Synced</span>
             </div>
          </div>
        </main>

        {/* -------------------------------------------------------------------------------- */}
        {/* Modals */}
        {/* -------------------------------------------------------------------------------- */}
        
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Import</DialogTitle>
              <DialogDescription>Select a CSV file to bulk import trades.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center w-full my-4">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3 group-hover:scale-110 transition-transform">
                           <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Click to upload CSV</p>
                    </div>
                    <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                </label>
            </div>
            {file && <p className="text-sm text-center text-blue-600 font-semibold bg-blue-50 p-2 rounded-md mb-4">{file.name}</p>}
            <DialogFooter>
              <Button onClick={handleImport} disabled={!file || isProcessingImport} className="w-full bg-blue-600 hover:bg-blue-700">
                {isProcessingImport && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />} Import Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
               <DialogTitle>Connect Broker</DialogTitle>
            </DialogHeader>
            <SimpleConnectionModal onClose={() => setIsConnectionDialogOpen(false)} onConnectionCreated={() => fetchTradesAndSetState(true)} />
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle className="text-red-600 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Danger Zone</DialogTitle>
               <DialogDescription>
                 Are you sure you want to delete ALL trades? This action cannot be undone.
               </DialogDescription>
             </DialogHeader>
             <DialogFooter>
               <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
               <Button variant="destructive" onClick={handleDeleteAll}>Delete All</Button>
             </DialogFooter>
           </DialogContent>
        </Dialog>

      </div>
    </ClientOnly>
  )
}
