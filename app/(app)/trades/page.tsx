"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import type { FC, ReactNode } from "react"
import Papa from "papaparse"
import { getTrades, addMultipleTrades, deleteAllTrades } from "@/app/actions/trade-actions"
import { getTradingAccounts, createTradingAccount } from "@/app/actions/account-actions"
import { SimpleTradeTable } from "./SimpleTradeTable"
import type { Trade, NewTradeInput } from "@/types"
import type { TradingAccount, AccountType } from "@/types/accounts"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import {
  RefreshCw,
  Upload,
  AlertTriangle,
  Plus,
  Building2,
  Filter,
  Trash2,
  Search,
  Settings2,
  BookOpen,
  Wallet,
  Briefcase,
  Layers,
  Check
} from "lucide-react"
import NextLink from "next/link"
import AdvancedTradeFilters, { type TradeFilters } from "@/components/trades/advanced-trade-filters"
import { cn } from "@/lib/utils"
import { SimpleConnectionModal } from "@/components/connection/simple-connection-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

// --- Types & Interfaces ---

interface ClientOnlyProps {
  children: ReactNode
}

const ClientOnly: FC<ClientOnlyProps> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => { setHasMounted(true) }, [])
  if (!hasMounted) return null
  return <>{children}</>
}

// --- Main Page Component ---

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string | "all">("all")
  
  const [filters, setFilters] = useState<TradeFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchTerm, setSearchTerm] = useState("")

  // Dialog States
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessingImport, setIsProcessingImport] = useState(false)
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false)

  // New Account Form State
  const [newAccountName, setNewAccountName] = useState("")
  const [newAccountType, setNewAccountType] = useState<AccountType>("personal")
  const [newAccountBalance, setNewAccountBalance] = useState("10000")
  
  const { toast } = useToast()

  // 1. Data Fetching
  const fetchData = useCallback(async (showToast = false) => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch Accounts
      const fetchedAccounts = await getTradingAccounts()
      setAccounts(fetchedAccounts)
      
      // Auto-select logic if "all" is active but empty
      if (fetchedAccounts.length > 0 && selectedAccountId === "all") {
         // Keep "all" as default to show the "See All" view first, 
         // but if you prefer to default to the first account, uncomment below:
         // const defaultAcc = fetchedAccounts.find(a => a.is_default) || fetchedAccounts[0]
         // setSelectedAccountId(defaultAcc.id)
      }

      // Fetch Trades
      const fetchedTrades = await getTrades()
      const sorted = fetchedTrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setTrades(sorted)

      if (showToast) toast({ title: "Updated", description: "Data synchronized." })
    } catch (err: any) {
      console.error(err)
      setError(err.message)
      setTrades([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedAccountId, toast])

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  // 2. Account Creation Logic
  const handleCreateAccount = async () => {
    if(!newAccountName) return

    try {
        const res = await createTradingAccount({
            name: newAccountName,
            type: newAccountType,
            initial_balance: parseFloat(newAccountBalance)
        })
        
        if(res.success && res.account) {
            toast({ title: "Portfolio Created", description: `${newAccountName} is ready.` })
            setAccounts(prev => [...prev, res.account!])
            setSelectedAccountId(res.account!.id)
            setIsCreateAccountOpen(false)
            setNewAccountName("")
            setNewAccountBalance("10000")
        } else {
            toast({ title: "Error", description: res.error || "Failed to create account", variant: "destructive" })
        }
    } catch (e) {
        toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    }
  }

  // 3. Filtering Logic
  const filteredTrades = useMemo(() => {
    let result = trades

    // Account Filter - The "See All" Feature
    if (selectedAccountId !== "all") {
        // Ensuring compatibility even if DB field is missing locally
        result = result.filter(t => (t as any).account_id === selectedAccountId)
    }

    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(t => 
        t.instrument.toLowerCase().includes(lower) || 
        (t.setup_name && t.setup_name.toLowerCase().includes(lower)) ||
        (t.notes && t.notes.toLowerCase().includes(lower))
      )
    }

    // Advanced Filters
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
  }, [trades, filters, searchTerm, selectedAccountId])

  // 4. Statistics Calculation (Used for Header Balance)
  const stats = useMemo(() => {
    // If "All" is selected, we sum the initial balance of ALL accounts
    let initialBalance = 0;
    if (selectedAccountId === 'all') {
        initialBalance = accounts.reduce((acc, curr) => acc + Number(curr.initial_balance), 0);
    } else {
        const activeAccount = accounts.find(a => a.id === selectedAccountId);
        initialBalance = activeAccount ? Number(activeAccount.initial_balance) : 0;
    }
    
    // We only calculate total PnL from trades that belong to the selected view
    // Note: We use 'filteredTrades' here, but strictly speaking for "Balance" 
    // we should use *all* trades for the account, ignoring search/date filters.
    // However, to keep it simple and reactive, we'll sum the currently matching trades 
    // OR ideally re-filter just by account. Let's do the latter for accuracy.
    
    const relevantTrades = selectedAccountId === 'all' 
       ? trades 
       : trades.filter(t => (t as any).account_id === selectedAccountId)

    const totalPnL = relevantTrades.reduce((acc, t) => acc + (t.pnl || 0), 0)
    
    return { 
      currentBalance: initialBalance + totalPnL
    }
  }, [trades, accounts, selectedAccountId]) // Depend on 'trades' not 'filteredTrades' for balance accuracy

  // 5. File Handling for Import
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
            if (!rawData || rawData.length === 0) throw new Error("No trade data found.");

            const processedTrades: NewTradeInput[] = rawData.map(row => {
               const findVal = (possibleKeys: string[]) => {
                 for (const key of possibleKeys) {
                   const found = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase())
                   if (found && row[found]) return row[found]
                 }
                 return null
               }
               
               const dateStr = findVal(['Date', 'Time', 'Entry Time']) || new Date().toISOString()
               const instrument = findVal(['Symbol', 'Instrument', 'Ticker']) || 'UNKNOWN'
               const cleanCurrency = (val: string) => parseFloat(val?.replace(/[^0-9.-]/g, '') || '0')
               
               const pnl = cleanCurrency(findVal(['PnL', 'Profit', 'Loss']) || '0')
               const entryPrice = cleanCurrency(findVal(['Entry Price', 'Price']) || '0')
               
               let outcome: 'win' | 'loss' | 'breakeven' = 'breakeven'
               if (pnl > 0) outcome = 'win'
               else if (pnl < 0) outcome = 'loss'

               return {
                 date: new Date(dateStr).toISOString(),
                 instrument,
                 direction: 'long', 
                 entry_price: entryPrice,
                 exit_price: entryPrice, 
                 size: 1,
                 pnl,
                 outcome,
                 notes: 'Imported via CSV',
                 // If we are in a specific account view, assign it. If "All", we can't guess.
                 // Ideally prompt user, but for now strict assignment only if active account.
                 // account_id: selectedAccountId !== 'all' ? selectedAccountId : undefined 
               } as NewTradeInput
             }).filter(t => t.instrument !== 'UNKNOWN')

             if(processedTrades.length > 0) {
               await addMultipleTrades(processedTrades)
               toast({ title: "Import Successful", description: `Added ${processedTrades.length} records.` })
               fetchData(true)
               setIsImportDialogOpen(false)
               setFile(null)
             }
          } catch(e: any) { 
              toast({ title: "Import Failed", description: e.message, variant: "destructive" })
          } finally {
              setIsProcessingImport(false)
          }
        }
      })
    };
    reader.readAsText(file);
  }

  const handleDeleteAll = async () => {
    setIsDeleteDialogOpen(false)
    await deleteAllTrades()
    fetchData(true)
  }

  return (
    <ClientOnly>
      <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
        
        {/* --- HEADER --- */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
           <div className="flex h-16 items-center px-4 md:px-8 max-w-[1600px] mx-auto w-full">
              {/* Logo / Title */}
              <div className="flex items-center gap-2 font-semibold min-w-fit mr-4">
                <div className="p-1.5 bg-primary/10 rounded-md">
                   <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg hidden sm:inline tracking-tight">Trade Journal</span>
              </div>
              
              <Separator orientation="vertical" className="mx-4 h-6 hidden md:block" />

              {/* ACCOUNT SELECTOR (The "New Feature") */}
              <div className="flex items-center gap-3">
                 <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="w-[220px] h-9 border-border/60 bg-background/50 focus:ring-primary/20">
                       <div className="flex items-center gap-2 truncate">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                          <SelectValue placeholder="Select Portfolio" />
                       </div>
                    </SelectTrigger>
                    <SelectContent>
                       <div className="p-1">
                          <Button 
                             variant="ghost" 
                             size="sm" 
                             className="w-full justify-start text-xs mb-1 text-primary hover:text-primary hover:bg-primary/10" 
                             onClick={(e) => { 
                                e.preventDefault(); 
                                setIsCreateAccountOpen(true) 
                             }}
                          >
                             <Plus className="mr-2 h-3 w-3" /> Add Portfolio
                          </Button>
                       </div>
                       <Separator className="my-1" />
                       {/* The "See All" View */}
                       <SelectItem value="all" className="cursor-pointer font-medium">
                          <span className="flex items-center gap-2">
                             <Layers className="w-3.5 h-3.5" /> All Portfolios
                          </span>
                       </SelectItem>
                       
                       {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id} className="cursor-pointer">
                             <div className="flex items-center justify-between w-full gap-4">
                                <span>{acc.name}</span>
                                <Badge variant="outline" className="text-[10px] h-4 px-1 border-muted-foreground/30 text-muted-foreground capitalize">{acc.type}</Badge>
                             </div>
                          </SelectItem>
                       ))}
                    </SelectContent>
                 </Select>

                 {/* Balance Badge (Context Aware) */}
                 <Badge variant="secondary" className="h-9 px-3 font-mono text-sm hidden lg:flex items-center gap-2 bg-muted/50 border border-border/40">
                    <Wallet className="h-3 w-3 text-muted-foreground" />
                    <span className={cn(stats.currentBalance < 0 && "text-rose-500")}>
                       ${stats.currentBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </span>
                 </Badge>
              </div>

              {/* Right Toolbar */}
              <div className="ml-auto flex items-center space-x-2">
                 <Button size="sm" className="gap-2 shadow-sm" asChild>
                    {/* Pass accountId via query param so the Add Trade page knows which account to pre-select */}
                    <NextLink href={`/add-trade?accountId=${selectedAccountId !== 'all' ? selectedAccountId : ''}`}>
                       <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Log Trade</span>
                    </NextLink>
                 </Button>
                 
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                          <Settings2 className="h-4 w-4 text-muted-foreground" />
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                       <DropdownMenuLabel>Journal Actions</DropdownMenuLabel>
                       <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)} className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" /> Import CSV
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setIsConnectionDialogOpen(true)} className="cursor-pointer">
                          <Building2 className="mr-2 h-4 w-4" /> Connect Broker
                       </DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>
           </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-[1600px] mx-auto w-full">
          
           {/* Context Indicator (Visual feedback for what is being viewed) */}
           <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Viewing:</span>
                  <span className="font-medium text-foreground">
                      {selectedAccountId === "all" ? "All Portfolios" : accounts.find(a => a.id === selectedAccountId)?.name}
                  </span>
              </div>
           </div>

           {/* Controls Bar */}
           <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-xl border shadow-sm">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search symbols, notes..." 
                    className="pl-10 bg-background/50 border-border/60"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                 {/* View Switcher */}
                 <div className="flex items-center rounded-lg border bg-background/50 p-1">
                    <button onClick={() => setViewMode('list')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === 'list' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                       List
                    </button>
                    <button onClick={() => setViewMode('grid')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === 'grid' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                       Grid
                    </button>
                 </div>

                 <Sheet>
                    <SheetTrigger asChild>
                       <Button variant="outline" size="sm" className="gap-2 h-9 border-dashed border-border/80">
                          <Filter className="h-4 w-4" /> Filters
                          {Object.keys(filters).length > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1">{Object.keys(filters).length}</Badge>}
                       </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                       <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                       <div className="mt-6"><AdvancedTradeFilters setFilters={setFilters} initialFilters={filters} /></div>
                    </SheetContent>
                 </Sheet>
              </div>
           </div>

           {/* Trade Table */}
           <Card className="border-none shadow-md overflow-hidden min-h-[500px] flex flex-col">
              {isLoading ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading journal entries...</p>
                 </div>
              ) : filteredTrades.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                       <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No trades found</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                       {accounts.length === 0 
                          ? "Create a portfolio to start logging your journey." 
                          : "No entries match your current filters."}
                    </p>
                    {accounts.length === 0 && (
                        <Button className="mt-6 gap-2" onClick={() => setIsCreateAccountOpen(true)}>
                            <Plus className="w-4 h-4" /> Create Portfolio
                        </Button>
                    )}
                 </div>
              ) : (
                 <SimpleTradeTable trades={filteredTrades} onRefresh={() => fetchData(true)} />
              )}
           </Card>
        </div>

        {/* --- DIALOGS --- */}
        
        {/* Create Account Modal */}
        <Dialog open={isCreateAccountOpen} onOpenChange={setIsCreateAccountOpen}>
           <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                 <DialogTitle>Create Portfolio</DialogTitle>
                 <DialogDescription>Setup a new bucket for your trades (e.g., Funded Account, Challenge).</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="grid gap-2">
                    <Label htmlFor="name">Portfolio Name</Label>
                    <Input id="name" placeholder="e.g., Topstep 50k Combine" value={newAccountName} onChange={e => setNewAccountName(e.target.value)} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                       <Label>Type</Label>
                       <Select value={newAccountType} onValueChange={(v: AccountType) => setNewAccountType(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="personal">Personal</SelectItem>
                             <SelectItem value="funded">Funded</SelectItem>
                             <SelectItem value="challenge">Challenge</SelectItem>
                             <SelectItem value="demo">Demo</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="grid gap-2">
                       <Label>Starting Balance</Label>
                       <Input type="number" value={newAccountBalance} onChange={e => setNewAccountBalance(e.target.value)} />
                    </div>
                 </div>
              </div>
              <DialogFooter>
                 <Button variant="outline" onClick={() => setIsCreateAccountOpen(false)}>Cancel</Button>
                 <Button onClick={handleCreateAccount} disabled={!newAccountName || !newAccountBalance}>Create Portfolio</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

        {/* Import CSV Modal */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Trades</DialogTitle>
              <DialogDescription>Upload a CSV from your broker.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center w-full my-4">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 border-muted-foreground/20 hover:border-primary/50 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-3 bg-background rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform">
                           <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Click to browse file</p>
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
        
        {/* Connect Broker Modal */}
        <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Connect Broker</DialogTitle></DialogHeader>
            <SimpleConnectionModal onClose={() => setIsConnectionDialogOpen(false)} onConnectionCreated={() => fetchData(true)} />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Danger Zone</DialogTitle>
               <DialogDescription>
                  This will permanently delete ALL trades from the database. <br/>
                  If you only want to clear a specific portfolio, please delete the portfolio instead.
               </DialogDescription>
             </DialogHeader>
             <DialogFooter>
               <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
               <Button variant="destructive" onClick={handleDeleteAll}>Confirm Delete All</Button>
             </DialogFooter>
           </DialogContent>
        </Dialog>

      </div>
    </ClientOnly>
  )
}
