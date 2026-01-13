"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import type { FC, ReactNode } from "react"
import Papa from "papaparse"
import { getTrades, addMultipleTrades, deleteAllTrades } from "@/app/actions/trade-actions"
import { SimpleTradeTable } from "./SimpleTradeTable"
import type { Trade, NewTradeInput } from "@/types"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
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
  Filter,
  Trash2,
  Maximize2,
  Minimize2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase
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
} from "@/components/ui/dropdown-menu"

// --- Types & Interfaces ---

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

// --- Helper Functions for CSV Parsing ---

const CLEAN_PATTERNS = {
  currency: /[^0-9.-]/g,
  dateSeparators: /[./]/g,
}

// Synonyms for CSV Column Mapping
const COLUMN_ALIASES = {
  date: ['date', 'time', 'entry time', 'trade date', 'open time', 'timestamp', 'filled time', 'execution time', 'date/time'],
  timeOnly: ['time', 'execution time', 'fill time', 'timestamp'], // Used if Date is date-only
  instrument: ['symbol', 'instrument', 'contract', 'ticker', 'asset', 'market', 'product'],
  direction: ['side', 'direction', 'type', 'buy/sell', 'action', 'b/s'],
  size: ['qty', 'quantity', 'size', 'volume', 'amount', 'contracts', 'lots', 'shares'],
  entryPrice: ['entry price', 'price', 'open price', 'avg price', 'fill price', 'trade price', 'avg. price', 'entry'],
  exitPrice: ['exit price', 'close price', 'closing price', 'sold price', 'cover price', 'exit'],
  pnl: ['pnl', 'profit', 'loss', 'realized pnl', 'net pnl', 'p/l', 'profit/loss', 'realized', 'pl'],
  fee: ['fee', 'commission', 'comm', 'fees', 'brokerage'],
  notes: ['notes', 'comments', 'description', 'strategy', 'setup']
};

const cleanNum = (val: any) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = String(val).trim();
  // Handle accounting format (123.45) -> -123.45
  if (str.startsWith('(') && str.endsWith(')')) {
    str = '-' + str.slice(1, -1);
  }
  // Remove currency symbols and commas
  str = str.replace(/[^0-9.-]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

const findColumnHeader = (row: any, aliases: string[]): string | undefined => {
  const keys = Object.keys(row);
  // 1. Exact match (case insensitive)
  for (const alias of aliases) {
    const match = keys.find(k => k.trim().toLowerCase() === alias.toLowerCase());
    if (match) return match;
  }
  // 2. Partial match (e.g. "Net PnL" matches "pnl")
  for (const alias of aliases) {
    const match = keys.find(k => k.trim().toLowerCase().includes(alias.toLowerCase()));
    if (match) return match;
  }
  return undefined;
}

// --- Sub-Components ---

// 1. Clean Data Header
const ProfessionalHeader = React.memo<{ count: number; totalPnL: number; winRate: number }>(({ count, totalPnL, winRate }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Portfolio Overview</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track executions, P&L, and performance metrics.</p>
        </div>

        <div className="flex items-center gap-8">
           <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">Trades</p>
              <p className="text-xl font-mono font-medium text-slate-900 dark:text-white">{count}</p>
           </div>
           <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
           <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-0.5">Net P&L</p>
              <div className={cn("text-xl font-mono font-bold flex items-center justify-end gap-1.5", totalPnL >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500")}>
                 {totalPnL >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                 ${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
})

// 2. Compact Metric Item
const CompactMetric = ({ label, value, trend, subValue, color = "text-slate-900", icon: Icon }: MetricProps) => (
  <div className="flex flex-col p-4 relative group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-default border-r border-slate-100 dark:border-slate-800 last:border-r-0">
    <div className="flex items-center justify-between mb-3">
       <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</span>
       {Icon && <Icon className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />}
    </div>
    <div className="flex items-baseline gap-2 mt-auto">
      <span className={cn("text-xl font-bold font-mono tracking-tight", color)}>{value}</span>
      {trend && (
        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-sm", 
          trend === "up" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : 
          trend === "down" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : 
          "bg-slate-100 text-slate-600"
        )}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "−"}
        </span>
      )}
    </div>
    {subValue && <span className="text-xs text-slate-400 mt-1">{subValue}</span>}
  </div>
)

const ClientOnly: FC<ClientOnlyProps> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => { setHasMounted(true) }, [])
  if (!hasMounted) return null
  return <>{children}</>
}

// --- Main Page Component ---

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [filters, setFilters] = useState<TradeFilters>({})
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchTerm, setSearchTerm] = useState("")

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessingImport, setIsProcessingImport] = useState(false)
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const { toast } = useToast()

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
    // Filters logic
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

  const stats = useMemo(() => {
    if (!filteredTrades.length) return { 
      totalTrades: 0, winRate: 0, totalPnL: 0, avgPnL: 0, profitFactor: 0, bestTrade: 0, worstTrade: 0, volume: 0
    }
    const count = filteredTrades.length
    const wins = filteredTrades.filter(t => t.outcome === "win")
    const losses = filteredTrades.filter(t => t.outcome === "loss")
    const totalPnL = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0)
    const avgPnL = count > 0 ? totalPnL / count : 0
    const grossProfit = wins.reduce((acc, t) => acc + (t.pnl || 0), 0)
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (t.pnl || 0), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit
    const winRate = count > 0 ? (wins.length / count) * 100 : 0

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

  // --- CSV IMPORT LOGIC ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleImport = async () => {
    if (!file) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }
    
    setIsProcessingImport(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "Empty File", variant: "destructive" });
        setIsProcessingImport(false);
        return;
      }

      // 1. Pre-process text to find header line (often CSVs have garbage at the top)
      const lines = text.split(/\r\n|\n|\r/);
      let headerRowIndex = 0;
      let maxMatches = 0;
      
      // Look for a line that contains multiple key trading terms
      const keyTerms = [...COLUMN_ALIASES.date, ...COLUMN_ALIASES.instrument, ...COLUMN_ALIASES.pnl, ...COLUMN_ALIASES.entryPrice];
      
      for (let i = 0; i < Math.min(lines.length, 30); i++) {
        const lineLower = lines[i].toLowerCase();
        let matches = 0;
        keyTerms.forEach(term => { if (lineLower.includes(term)) matches++; });
        
        if (matches > maxMatches && matches >= 2) {
          maxMatches = matches;
          headerRowIndex = i;
        }
      }

      const cleanCsvContent = lines.slice(headerRowIndex).join('\n');
    
      Papa.parse(cleanCsvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // We handle types manually for better control
        complete: async (results) => {
          try {
            const rawData = results.data as any[];
            if (!rawData || rawData.length === 0) throw new Error("No data parsed");

            const processedTrades: NewTradeInput[] = rawData.map((row, index) => {
               // 1. Identify Columns
               const dateKey = findColumnHeader(row, COLUMN_ALIASES.date);
               const timeKey = findColumnHeader(row, COLUMN_ALIASES.timeOnly);
               const instrumentKey = findColumnHeader(row, COLUMN_ALIASES.instrument);
               const entryKey = findColumnHeader(row, COLUMN_ALIASES.entryPrice);
               const exitKey = findColumnHeader(row, COLUMN_ALIASES.exitPrice);
               const pnlKey = findColumnHeader(row, COLUMN_ALIASES.pnl);
               const sizeKey = findColumnHeader(row, COLUMN_ALIASES.size);
               const directionKey = findColumnHeader(row, COLUMN_ALIASES.direction);
               const feeKey = findColumnHeader(row, COLUMN_ALIASES.fee);
               const notesKey = findColumnHeader(row, COLUMN_ALIASES.notes);

               if (!dateKey || !instrumentKey) return null; // Skip invalid rows

               // 2. Parse Date & Time
               let finalDate = new Date().toISOString();
               try {
                 let dateStr = row[dateKey];
                 // If separate time column exists, append it
                 if (timeKey && row[timeKey]) {
                   const t = row[timeKey];
                   // Check if dateStr already includes time
                   if (!dateStr.includes(':')) {
                     dateStr = `${dateStr} ${t}`;
                   }
                 }
                 const parsed = new Date(dateStr);
                 if (!isNaN(parsed.getTime())) finalDate = parsed.toISOString();
               } catch (e) {
                 console.warn("Date parse fail", row[dateKey]);
               }

               // 3. Parse Numbers
               const size = Math.abs(cleanNum(row[sizeKey])) || 1;
               const entryPrice = cleanNum(row[entryKey]);
               let exitPrice = cleanNum(row[exitKey]);
               let pnl = cleanNum(row[pnlKey]);
               const fees = feeKey ? Math.abs(cleanNum(row[feeKey])) : 0;

               // 4. Parse Direction
               let direction: 'long' | 'short' = 'long';
               if (directionKey && row[directionKey]) {
                 const dirStr = String(row[directionKey]).toLowerCase();
                 if (dirStr.includes('sell') || dirStr.includes('short') || dirStr === 's') direction = 'short';
               } else if (sizeKey && cleanNum(row[sizeKey]) < 0) {
                  // Sometimes negative size implies short
                  direction = 'short';
               }

               // 5. Advanced Calculations (Auto-fill missing data)
               // Determine Net PnL if we only have Gross and Fees, or calculate from prices
               if (pnl === 0 && entryPrice > 0 && exitPrice > 0) {
                  const rawPnl = direction === 'long' 
                    ? (exitPrice - entryPrice) * size 
                    : (entryPrice - exitPrice) * size;
                  pnl = rawPnl - fees;
               }

               // If Exit Price missing but PnL exists, back-calculate it
               if (exitPrice === 0 && pnl !== 0 && entryPrice > 0) {
                 const effectivePnl = pnl + fees; // Add back fees to get gross price movement
                 if (direction === 'long') {
                   exitPrice = entryPrice + (effectivePnl / size);
                 } else {
                   exitPrice = entryPrice - (effectivePnl / size);
                 }
               }

               // 6. Determine Outcome
               let outcome: 'win' | 'loss' | 'breakeven' = 'breakeven';
               if (pnl > 0) outcome = 'win';
               if (pnl < 0) outcome = 'loss';

               // Skip total/summary rows which often have empty instruments or huge numbers
               if (String(row[instrumentKey]).toLowerCase().includes('total')) return null;

               return {
                 date: finalDate,
                 instrument: String(row[instrumentKey]).toUpperCase(),
                 direction,
                 entry_price: entryPrice,
                 exit_price: exitPrice || entryPrice, // Fallback to avoid 0
                 size,
                 pnl,
                 outcome,
                 notes: notesKey ? row[notesKey] : 'Imported trade',
               };
             }).filter((t): t is NewTradeInput => t !== null && t.entry_price > 0);

             if(processedTrades.length > 0) {
               const result = await addMultipleTrades(processedTrades);
               if(result.error) {
                  toast({ title: "Import Error", description: result.error, variant: "destructive" });
               } else {
                  toast({ title: "Import Successful", description: `Successfully added ${processedTrades.length} trades.` });
                  fetchTradesAndSetState(true);
                  setIsImportDialogOpen(false);
                  setFile(null);
               }
             } else {
               toast({ title: "Import Warning", description: "No valid trade rows found. Check your column headers.", variant: "destructive" })
             }
          } catch(e: any) { 
              toast({ title: "Import Failed", description: e.message, variant: "destructive" })
          } finally {
              setIsProcessingImport(false)
          }
        },
        error: (err) => {
            toast({ title: "CSV Error", description: err.message, variant: "destructive" });
            setIsProcessingImport(false);
        }
      })
    };
    reader.onerror = () => {
       toast({ title: "File Error", description: "Could not read the file.", variant: "destructive" });
       setIsProcessingImport(false);
    };
    reader.readAsText(file);
  }

  const handleDeleteAll = async () => {
    setIsDeleteDialogOpen(false)
    await deleteAllTrades()
    fetchTradesAndSetState(true)
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#09090b] text-slate-900 dark:text-slate-50 font-sans selection:bg-slate-200 dark:selection:bg-slate-800">
        
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Briefcase className="w-5 h-5 text-slate-900 dark:text-white" />
               <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">Trades</span>
            </div>

            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" onClick={() => setIsImportDialogOpen(true)} className="hidden sm:flex text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  <Upload className="mr-2 h-4 w-4" /> Import
               </Button>
               <Button variant="ghost" size="sm" onClick={() => setIsConnectionDialogOpen(true)} className="hidden sm:flex text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  <Building2 className="mr-2 h-4 w-4" /> Connect
               </Button>
               
               <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

               <Button size="sm" className="h-8 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm transition-all" asChild>
                 <NextLink href="/add-trade">
                   <PlusCircle className="mr-2 h-4 w-4" />
                   New Trade
                 </NextLink>
               </Button>
               
               {/* Mobile Menu */}
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden">
                     <Settings className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
          
          <ProfessionalHeader count={stats.totalTrades} totalPnL={stats.totalPnL} winRate={stats.winRate} />

          {/* Stats Strip */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-between mb-2 px-1">
                 <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Performance Snapshot
                 </h2>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-6 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-transparent"
                   onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                 >
                   {isStatsCollapsed ? <Maximize2 className="h-3 w-3 mr-1" /> : <Minimize2 className="h-3 w-3 mr-1" />}
                   {isStatsCollapsed ? "Expand" : "Collapse"}
                 </Button>
              </div>
              
              <div className={cn(
                "transition-all duration-500 ease-in-out overflow-hidden",
                isStatsCollapsed ? "max-h-0 opacity-0" : "max-h-[200px] opacity-100"
              )}>
                <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                  <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                     <CompactMetric 
                       label="Avg P&L" 
                       value={`$${stats.avgPnL.toFixed(2)}`} 
                       color={stats.avgPnL >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600"} 
                       subValue="Per Trade"
                       icon={DollarSign}
                     />
                     <CompactMetric 
                       label="Win Rate" 
                       value={`${stats.winRate.toFixed(1)}%`} 
                       color="text-slate-900 dark:text-white"
                       subValue={`${stats.totalTrades} Trades`}
                       icon={Target}
                     />
                     <CompactMetric 
                       label="Profit Factor" 
                       value={stats.profitFactor.toFixed(2)} 
                       subValue="Gross Win/Loss"
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

          {/* Database Toolbar & Table */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              
              {/* Toolbar */}
              <div className="sticky top-16 z-30 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                 
                 {/* Search & View Toggles */}
                 <div className="flex items-center flex-1 gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72 group">
                       <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                       <Input 
                         placeholder="Search symbols..." 
                         className="pl-9 h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-300 transition-all"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                    
                    <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-950 rounded-md p-1 border border-slate-200 dark:border-slate-800">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className={cn("h-7 px-2.5 rounded-sm text-slate-500 hover:text-slate-900", viewMode === 'list' && "bg-white dark:bg-slate-800 shadow-sm text-slate-900 font-medium")}
                         onClick={() => setViewMode('list')}
                         title="List View"
                       >
                         <List className="h-4 w-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className={cn("h-7 px-2.5 rounded-sm text-slate-500 hover:text-slate-900", viewMode === 'grid' && "bg-white dark:bg-slate-800 shadow-sm text-slate-900 font-medium")}
                         onClick={() => setViewMode('grid')}
                         title="Grid View"
                       >
                         <Grid3X3 className="h-4 w-4" />
                       </Button>
                    </div>
                 </div>

                 {/* Filter Trigger */}
                 <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="flex sm:hidden items-center bg-slate-100 dark:bg-slate-950 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                       <Button variant="ghost" size="sm" className={cn("h-7 w-7 p-0", viewMode === 'list' && "bg-white shadow-sm")} onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
                       <Button variant="ghost" size="sm" className={cn("h-7 w-7 p-0", viewMode === 'grid' && "bg-white shadow-sm")} onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4"/></Button>
                    </div>

                    <Sheet>
                     <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className={cn(
                          "h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800",
                          Object.keys(filters).length > 0 && "border-slate-900 text-slate-900 bg-slate-50 dark:bg-slate-900"
                        )}>
                          <Filter className="mr-2 h-3.5 w-3.5" />
                          Filters
                          {Object.keys(filters).length > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
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

              {/* The Database */}
              <Card className="border-0 shadow-md bg-white dark:bg-slate-900 rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 min-h-[600px] flex flex-col">
                 {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12">
                       <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-6" />
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

        {/* Import Modal */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Import</DialogTitle>
              <DialogDescription>
                  Supports CSV files from most brokers (NinjaTrader, Tradovate, MetaTrader, Excel).
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center w-full my-4">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                           <Upload className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Click to upload CSV</p>
                    </div>
                    <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                </label>
            </div>
            {file && <p className="text-sm text-center text-slate-900 font-semibold bg-slate-100 p-2 rounded-md mb-4">{file.name}</p>}
            <DialogFooter>
              <Button onClick={handleImport} disabled={!file || isProcessingImport} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                {isProcessingImport && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />} Import Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Connection Modal */}
        <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
               <DialogTitle>Connect Broker</DialogTitle>
            </DialogHeader>
            <SimpleConnectionModal onClose={() => setIsConnectionDialogOpen(false)} onConnectionCreated={() => fetchTradesAndSetState(true)} />
          </DialogContent>
        </Dialog>

        {/* Delete All Modal */}
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
