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
  Plus,
  Building2,
  TrendingUp,
  TrendingDown,
  Filter,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Calendar,
  Layers,
  Settings2,
  Target
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
import { format } from "date-fns"

// --- Types & Interfaces ---

interface ClientOnlyProps {
  children: ReactNode
}

// --- Sub-Components ---

// 1. Journal Stat Card (Clean, Reflective Style)
const JournalStat = ({ label, value, trend, subValue, icon: Icon }: { label: string, value: string, trend?: 'up' | 'down' | 'neutral', subValue?: string, icon: any }) => (
  <div className="flex flex-col p-4 rounded-xl border border-border/50 bg-card/50 shadow-sm hover:bg-card/80 transition-colors group">
     <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide group-hover:text-primary transition-colors">{label}</span>
        <div className="p-1.5 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors">
            <Icon className="w-4 h-4 text-muted-foreground/70 group-hover:text-primary" />
        </div>
     </div>
     <div className="flex items-baseline gap-2 mt-auto">
        <span className="text-2xl font-bold tracking-tight text-foreground font-mono">{value}</span>
     </div>
     {subValue && (
        <div className="flex items-center gap-1.5 mt-1.5">
           {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
           {trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-500" />}
           <span className={cn("text-xs font-medium", 
              trend === 'up' ? "text-emerald-600" : 
              trend === 'down' ? "text-rose-600" : "text-muted-foreground"
           )}>
              {subValue}
           </span>
        </div>
     )}
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
    if (!filteredTrades.length) return { totalTrades: 0, winRate: 0, totalPnL: 0, profitFactor: 0 }
    const count = filteredTrades.length
    const wins = filteredTrades.filter(t => t.outcome === "win")
    const losses = filteredTrades.filter(t => t.outcome === "loss")
    const totalPnL = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0)
    const grossProfit = wins.reduce((acc, t) => acc + (t.pnl || 0), 0)
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (t.pnl || 0), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit
    const winRate = count > 0 ? (wins.length / count) * 100 : 0

    return { 
      totalTrades: count, 
      winRate, 
      totalPnL, 
      profitFactor
    }
  }, [filteredTrades])

  // --- Handlers (Preserved CSV Logic) ---
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

      const lines = text.split(/\r\n|\n|\r/);
      let headerRowIndex = 0;
      const potentialHeaders = ['symbol', 'instrument', 'ticker', 'date', 'time', 'entry', 'price', 'profit', 'pnl', 'net pnl', 'realized'];
      
      for (let i = 0; i < Math.min(lines.length, 20); i++) {
        const lineLower = lines[i].toLowerCase();
        const matches = potentialHeaders.filter(h => lineLower.includes(h));
        if (matches.length >= 2) {
          headerRowIndex = i;
          break;
        }
      }

      const cleanCsvContent = lines.slice(headerRowIndex).join('\n');
    
      Papa.parse(cleanCsvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: async (results) => {
          try {
            const rawData = results.data as any[];
            if (!rawData || rawData.length === 0) {
               throw new Error("No trade data found after parsing.");
            }

            const processedTrades: NewTradeInput[] = rawData.map(row => {
               const findVal = (possibleKeys: string[]) => {
                 for (const key of possibleKeys) {
                   const found = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase())
                   if (found && row[found]) return row[found]
                 }
                 return null
               }

               const cleanNum = (val: any) => {
                 if (typeof val === 'number') return val;
                 if (!val) return 0;
                 if (typeof val === 'string') {
                     return parseFloat(val.replace(/[^0-9.-]/g, ''));
                 }
                 return 0;
               }

               const dateStr = findVal(['Date', 'Time', 'Entry Time', 'Trade Date', 'Open Time', 'Timestamp'])
               let finalDate = new Date().toISOString()
               if (dateStr) {
                 const parsed = new Date(dateStr)
                 if (!isNaN(parsed.getTime())) finalDate = parsed.toISOString()
               }

               const instrument = findVal(['Symbol', 'Instrument', 'Contract', 'Ticker']) || 'UNKNOWN'
               const sideVal = findVal(['Side', 'Direction', 'Type', 'Buy/Sell'])
               let direction: 'long' | 'short' = 'long'
               if (sideVal && (sideVal.toLowerCase().includes('sell') || sideVal.toLowerCase().includes('short'))) {
                 direction = 'short'
               }

               const size = Math.abs(cleanNum(findVal(['Qty', 'Quantity', 'Size', 'Volume', 'Amount']))) || 1
               const entryPrice = cleanNum(findVal(['Entry Price', 'Price', 'Open Price', 'Avg Price']))
               let exitPrice = cleanNum(findVal(['Exit Price', 'Close Price', 'Fill Price']))
               let pnl = cleanNum(findVal(['PnL', 'Profit', 'Loss', 'Realized PnL', 'Net PnL', 'P/L', 'Profit/Loss']))

               if (exitPrice === 0 && pnl !== 0 && entryPrice !== 0) {
                  exitPrice = entryPrice 
               }

               if (pnl === 0 && exitPrice !== 0 && entryPrice !== 0) {
                  if (direction === 'long') pnl = (exitPrice - entryPrice) * size
                  else pnl = (entryPrice - exitPrice) * size
               }

               let outcome: 'win' | 'loss' | 'breakeven' = 'breakeven'
               if (pnl > 0) outcome = 'win'
               if (pnl < 0) outcome = 'loss'

               return {
                 date: finalDate,
                 instrument,
                 direction,
                 entry_price: entryPrice,
                 exit_price: exitPrice || entryPrice, 
                 size,
                 pnl,
                 outcome,
                 notes: 'Imported via CSV'
               }
             }).filter(t => t.instrument !== 'UNKNOWN' && t.entry_price > 0)

             if(processedTrades.length > 0) {
               await addMultipleTrades(processedTrades)
               toast({ title: "Import Successful", description: `Added ${processedTrades.length} records.` })
               fetchTradesAndSetState(true)
               setIsImportDialogOpen(false)
               setFile(null)
             } else {
               toast({ title: "Import Warning", description: "No valid trade rows found.", variant: "destructive" })
             }
          } catch(e: any) { 
              toast({ title: "Import Failed", description: e.message, variant: "destructive" })
          } finally {
              setIsProcessingImport(false)
          }
        },
        error: (err) => {
            toast({ title: "File Read Error", description: err.message, variant: "destructive" });
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
      <div className="min-h-screen bg-background text-foreground font-sans">
        
        {/* --- JOURNAL HEADER (Clean, Spacious, Reflective) --- */}
        <div className="bg-background border-b border-border sticky top-0 z-30">
           <div className="container mx-auto px-4 py-6 max-w-7xl">
              
              {/* Top Row: Title & Primary Actions */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                 <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                       <BookOpen className="w-8 h-8 text-primary" />
                       Trade Journal
                    </h1>
                    <p className="text-muted-foreground text-sm pl-11">
                       Your historical execution record and performance ledger.
                    </p>
                 </div>

                 <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="gap-2 border-border/60">
                       <Upload className="w-4 h-4 text-muted-foreground" /> Import CSV
                    </Button>
                    <Button onClick={() => setIsConnectionDialogOpen(true)} variant="outline" className="gap-2 border-border/60">
                       <Building2 className="w-4 h-4 text-muted-foreground" /> Connect Broker
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2 px-6" asChild>
                       <NextLink href="/add-trade">
                          <Plus className="w-4 h-4" /> Log New Trade
                       </NextLink>
                    </Button>
                 </div>
              </div>

              {/* Middle Row: The "Journal Stats" Context Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <JournalStat 
                    label="Net Profit" 
                    value={`$${stats.totalPnL.toLocaleString('en-US', {minimumFractionDigits: 2})}`} 
                    trend={stats.totalPnL >= 0 ? 'up' : 'down'}
                    subValue={stats.totalPnL >= 0 ? "Profitable" : "In Drawdown"}
                    icon={ArrowUpRight}
                 />
                 <JournalStat 
                    label="Win Rate" 
                    value={`${stats.winRate.toFixed(1)}%`} 
                    trend={stats.winRate > 50 ? 'up' : 'neutral'}
                    subValue="Consistency"
                    icon={Target}
                 />
                 <JournalStat 
                    label="Profit Factor" 
                    value={stats.profitFactor.toFixed(2)} 
                    subValue="Efficiency"
                    icon={TrendingUp}
                 />
                 <JournalStat 
                    label="Total Logs" 
                    value={stats.totalTrades.toString()} 
                    subValue="Experience"
                    icon={Layers}
                 />
              </div>
           </div>
        </div>

        {/* --- MAIN CONTENT (Toolbar & Table) --- */}
        <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
          
          {/* Toolbar: Search, View, Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card/50 p-1 rounded-xl">
             
             {/* Search */}
             <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                   placeholder="Search by symbol, narrative, or notes..." 
                   className="pl-10 bg-background border-border/60 focus-visible:ring-primary h-10"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             {/* Right Controls */}
             <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex items-center bg-background border border-border/60 rounded-md p-1">
                   <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-sm transition-all", viewMode === 'list' ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      <List className="h-4 w-4" />
                   </button>
                   <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-sm transition-all", viewMode === 'grid' ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      <Grid3X3 className="h-4 w-4" />
                   </button>
                </div>
                
                <Sheet>
                   <SheetTrigger asChild>
                      <Button variant="outline" className={cn("gap-2 border-border/60 h-10", Object.keys(filters).length > 0 && "border-primary text-primary bg-primary/5")}>
                         <Filter className="h-4 w-4" /> Filters
                         {Object.keys(filters).length > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                               {Object.keys(filters).length}
                            </Badge>
                         )}
                      </Button>
                   </SheetTrigger>
                   <SheetContent side="right">
                      <SheetHeader>
                         <SheetTitle>Filter Journal</SheetTitle>
                         <SheetDescription>Narrow down your trade history.</SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                         <AdvancedTradeFilters setFilters={setFilters} initialFilters={filters} />
                      </div>
                   </SheetContent>
                </Sheet>
                
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                         <Settings2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Database Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                         <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
                      </DropdownMenuItem>
                   </DropdownMenuContent>
                </DropdownMenu>
             </div>
          </div>

          {/* Data Table Area */}
          <Card className="border border-border/60 shadow-sm bg-card rounded-xl overflow-hidden min-h-[500px] flex flex-col">
             {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
                   <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                   <p className="text-sm text-muted-foreground">Loading journal entries...</p>
                </div>
             ) : filteredTrades.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
                   <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                   </div>
                   <h3 className="text-lg font-semibold text-foreground">Your journal is empty</h3>
                   <p className="text-sm text-muted-foreground mt-2 mb-6">
                      No trades found matching your criteria. Start by logging a trade or importing data.
                   </p>
                   <div className="flex gap-4">
                      <Button variant="outline" onClick={() => { setSearchTerm(""); setFilters({}); }}>Clear Filters</Button>
                      <Button asChild><NextLink href="/add-trade">Log Trade</NextLink></Button>
                   </div>
                </div>
             ) : (
                <SimpleTradeTable trades={filteredTrades} onRefresh={() => fetchTradesAndSetState(true)} />
             )}
          </Card>

          <div className="flex justify-between items-center px-2 py-4 text-xs text-muted-foreground">
             <span>Viewing {filteredTrades.length} of {trades.length} entries</span>
             <span className="font-mono opacity-50">SYNCED</span>
          </div>
        </main>

        {/* Modals - (Kept unchanged) */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>CSV Import</DialogTitle>
              <DialogDescription>Upload your trade history from Broker or Excel.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center w-full my-4">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 border-muted-foreground/20 hover:border-primary/50 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-3 bg-background rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform">
                           <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Click to browse file</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Supports .csv, .xls</p>
                    </div>
                    <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                </label>
            </div>
            {file && <div className="p-3 bg-muted rounded text-sm text-center font-mono">{file.name}</div>}
            <DialogFooter>
              <Button onClick={handleImport} disabled={!file || isProcessingImport} className="w-full">
                {isProcessingImport && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />} 
                {isProcessingImport ? "Processing..." : "Start Import"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Connect Broker</DialogTitle></DialogHeader>
            <SimpleConnectionModal onClose={() => setIsConnectionDialogOpen(false)} onConnectionCreated={() => fetchTradesAndSetState(true)} />
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Delete All Data?</DialogTitle>
               <DialogDescription>This will permanently remove all trade entries from your journal. This action cannot be undone.</DialogDescription>
             </DialogHeader>
             <DialogFooter>
               <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
               <Button variant="destructive" onClick={handleDeleteAll}>Confirm Delete</Button>
             </DialogFooter>
           </DialogContent>
        </Dialog>

      </div>
    </ClientOnly>
  )
}
