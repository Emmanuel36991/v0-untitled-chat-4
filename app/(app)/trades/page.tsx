"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import type { FC, ReactNode } from "react"
import Papa from "papaparse"
import { parseCSV, convertTradesToInput, getSupportedBrokers, detectBrokerFormat } from "@/lib/csv-parsers"
import type { BrokerType, ParseResult } from "@/lib/csv-parsers/types"
import { getTrades, addMultipleTrades, deleteAllTrades } from "@/app/actions/trade-actions"
import { getTradingAccounts, createTradingAccount } from "@/app/actions/account-actions"
import { PortfolioManagerDialog } from "@/components/trades/portfolio-manager"
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
   Check,
   FolderOpen,
   PenLine,
   SlidersHorizontal,
} from "lucide-react"
import NextLink from "next/link"
import { useSearchParams } from "next/navigation"
import AdvancedTradeFilters, { type TradeFilters } from "@/components/trades/advanced-trade-filters"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/empty-state"
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
   const searchParams = useSearchParams()
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
   const [isPortfolioManagerOpen, setIsPortfolioManagerOpen] = useState(false)

   // New Account Form State
   const [newAccountName, setNewAccountName] = useState("")
   const [newAccountType, setNewAccountType] = useState<AccountType>("personal")
   const [newAccountBalance, setNewAccountBalance] = useState("10000")

   const { toast } = useToast()

   // CSV Import States
   const [selectedBroker, setSelectedBroker] = useState<BrokerType>("auto")
   const supportedBrokers = useMemo(() => getSupportedBrokers(), [])

   // 1. Data Fetching
   const fetchData = useCallback(async (showToast = false) => {
      setIsLoading(true)
      setError(null)
      try {
         // Fetch Accounts
         const fetchedAccounts = await getTradingAccounts()
         setAccounts(fetchedAccounts)

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
   }, [toast])

   useEffect(() => {
      fetchData(false)
   }, [fetchData])

   // Auto-open import dialog if query param handles it
   useEffect(() => {
      if (searchParams?.get("action") === "import") {
         setIsImportDialogOpen(true)
      }
   }, [searchParams])

   // 2. Account Creation Logic
   const handleCreateAccount = async () => {
      if (!newAccountName) return

      try {
         const res = await createTradingAccount({
            name: newAccountName,
            type: newAccountType,
            initial_balance: parseFloat(newAccountBalance)
         })

         if (res.success && res.account) {
            toast({ title: "Portfolio Created", description: `${newAccountName} is ready.` })
            setAccounts(prev => [...prev, res.account!])
            setSelectedAccountId(res.account!.id) // Auto-switch to new account
            setIsCreateAccountOpen(false)
            setNewAccountName("")
            setNewAccountBalance("10000")
            fetchData(true)
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

      // Account Filter
      if (selectedAccountId !== "all") {
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

   // 4. Statistics Calculation
   const stats = useMemo(() => {
      let initialBalance = 0;
      if (selectedAccountId === 'all') {
         initialBalance = accounts.reduce((acc, curr) => acc + Number(curr.initial_balance), 0);
      } else {
         const activeAccount = accounts.find(a => a.id === selectedAccountId);
         initialBalance = activeAccount ? Number(activeAccount.initial_balance) : 0;
      }

      const totalPnL = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0)

      return {
         currentBalance: initialBalance + totalPnL
      }
   }, [filteredTrades, accounts, selectedAccountId])

   // 5. File Handling for Import
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) setFile(e.target.files[0])
   }

   /**
    * Preprocesses CSV content to fix common malformed formats
    * Handles double-escaped quotes from Excel/Windows exports
    */
   const preprocessCSV = (rawText: string): string => {
      const lines = rawText.split(/\r\n|\n|\r/)

      // Check if this is a malformed format with outer quotes and double-escaped inner quotes
      const isMalformed = lines.some(line => {
         // Pattern: "field1,""field2"",""field3""..."
         return line.startsWith('"') && line.endsWith('"') && line.includes('""')
      })

      if (!isMalformed) {
         return rawText // Already clean
      }

      console.log('[CSV Preprocessor] Detected malformed double-escaped format, cleaning...')

      // Fix each line
      const cleaned = lines.map(line => {
         if (!line.trim()) return line

         // Remove outer quotes
         let cleaned = line
         if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1)
         }

         // Replace double-escaped quotes with single quotes
         cleaned = cleaned.replace(/""/g, '"')

         return cleaned
      }).join('\n')

      console.log('[CSV Preprocessor] Cleaned CSV preview:', cleaned.split('\n').slice(0, 3).join('\n'))
      return cleaned
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

         try {
            // Preprocess CSV to fix malformed formats
            const cleanedText = preprocessCSV(text)

            // Debug: Log first few lines and detected structure
            const lines = cleanedText.split(/\r\n|\n|\r/)
            const headerLine = lines[0]
            const detectedHeaders = headerLine.split(',').map(h => h.trim().replace(/"/g, ''))

            console.log('[CSV Import] File:', file.name)
            console.log('[CSV Import] Detected headers:', detectedHeaders)
            console.log('[CSV Import] Header count:', detectedHeaders.length)
            console.log('[CSV Import] Preview:', lines.slice(0, 3).join('\n'))

            // Use new parser system with auto-detection or selected broker
            const result = await parseCSV(cleanedText, {
               broker: selectedBroker,
               accountId: selectedAccountId !== 'all' ? selectedAccountId : undefined
            })

            console.log('[CSV Import] Parser used:', result.broker)
            console.log('[CSV Import] Trades parsed:', result.trades.length)
            console.log('[CSV Import] Normalized instruments:', [...new Set(result.trades.map(t => t.instrument))])
            console.log('[CSV Import] Errors:', result.errors)

            const errorCount = result.errors.filter(e => e.severity === "error").length

            if (errorCount > 0) {
               // Show detailed errors with debugging info
               const errorDetails = result.errors
                  .filter(e => e.severity === "error")
                  .slice(0, 3)
                  .map(e => `Row ${e.row}: ${e.message}`)
                  .join('; ')

               toast({
                  title: "Import Validation Failed",
                  description: `Found ${errorCount} error(s). ${errorDetails}`,
                  variant: "destructive"
               })
               console.error("CSV Import Errors (full):", result.errors)

               // Additional debug info in console
               if (detectedHeaders.length < 5) {
                  console.error('[CSV Import] Suspicious header count! Expected 8+, got', detectedHeaders.length)
                  console.error('[CSV Import] Headers found:', detectedHeaders)
               }
            } else {
               // Convert and import trades
               const tradeInputs = convertTradesToInput(
                  result,
                  selectedAccountId !== 'all' ? selectedAccountId : undefined
               )

               if (tradeInputs.length > 0) {
                  const insertResult = await addMultipleTrades(tradeInputs)
                  if ((insertResult as any)?.error) {
                     toast({
                        title: "Import Failed",
                        description: (insertResult as any).error,
                        variant: "destructive",
                        duration: 7000
                     })
                     console.error("[CSV Import] addMultipleTrades failed:", insertResult)
                     return
                  }

                  const brokerName = result.broker === "auto" ? "Generic" :
                     result.broker === "tradovate" ? "Tradovate" :
                        result.broker === "thinkorswim" ? "Thinkorswim" :
                           result.broker === "tradingview" ? "TradingView" : "Generic"

                  toast({
                     title: "Import Successful",
                     description: `Added ${(insertResult as any)?.successCount ?? tradeInputs.length} trades using ${brokerName} parser.`,
                     duration: 5000
                  })

                  fetchData(true)
                  setIsImportDialogOpen(false)
                  setFile(null)
                  setSelectedBroker("auto")
               } else {
                  toast({
                     title: "No Valid Trades",
                     description: `Parsed 0 trades from ${result.stats.totalRows} rows. Check console for details.`,
                     variant: "destructive"
                  })
                  console.error('[CSV Import] No trades extracted despite no errors. Result:', result)
               }
            }
         } catch (e: any) {
            console.error("CSV Import Error:", e)
            toast({
               title: "Import Failed",
               description: e.message || "An error occurred during import",
               variant: "destructive"
            })
         } finally {
            setIsProcessingImport(false)
         }
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

                  {/* ACCOUNT SELECTOR */}
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
                           {accounts.length > 0 && <Separator className="my-1" />}
                           <div className="p-1">
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 className="w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                                 onClick={(e) => {
                                    e.preventDefault();
                                    setIsPortfolioManagerOpen(true)
                                 }}
                              >
                                 <Settings2 className="mr-2 h-3 w-3" /> Manage Portfolios
                              </Button>
                           </div>
                        </SelectContent>
                     </Select>

                     {/* Balance Badge */}
                     <Badge variant="secondary" className="h-9 px-3 font-mono text-sm hidden lg:flex items-center gap-2 bg-muted/50 border border-border/40">
                        <Wallet className="h-3 w-3 text-muted-foreground" />
                        <span className={cn(stats.currentBalance < 0 && "text-rose-500")}>
                           ${stats.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                     </Badge>
                  </div>

                  {/* Right Toolbar */}
                  <div className="ml-auto flex items-center space-x-2">
                     <Button size="sm" className="gap-2 shadow-sm" asChild>
                        <NextLink href={`/add-trade?accountId=${selectedAccountId !== 'all' ? selectedAccountId : ''}`}>
                           <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Log Trade</span>
                        </NextLink>
                     </Button>

                     <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => setIsImportDialogOpen(true)}
                     >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Import CSV</span>
                     </Button>

                     <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => setIsConnectionDialogOpen(true)}
                     >
                        <Building2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Connect Broker</span>
                     </Button>

                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                              <Settings2 className="h-4 w-4 text-muted-foreground" />
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                           <DropdownMenuLabel>Journal Actions</DropdownMenuLabel>
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

               {/* Context Indicator */}
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
                     accounts.length === 0 ? (
                        <EmptyState
                           icon={FolderOpen}
                           title="No portfolio yet"
                           description="Create a trading portfolio to start logging your journey."
                           action={{ label: "Create Portfolio", onClick: () => setIsCreateAccountOpen(true) }}
                           className="flex-1"
                        />
                     ) : trades.length === 0 ? (
                        <EmptyState
                           icon={PenLine}
                           title="No trades logged"
                           description="Start recording executions to build your trade journal and track performance."
                           action={{ label: "Add Trade", href: "/add-trade" }}
                           className="flex-1"
                        />
                     ) : (
                        <EmptyState
                           icon={SlidersHorizontal}
                           title="No matching trades"
                           description="No entries match your current filters. Try broadening your search criteria."
                           action={{ label: "Clear filters", onClick: () => { setFilters({}); setSearchTerm("") }, variant: "outline" }}
                           className="flex-1"
                        />
                     )
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

                  <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                     <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 rounded-lg bg-background border shadow-sm">
                           <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-sm font-medium">Heads up: imports are execution-based</p>
                           <p className="text-xs text-muted-foreground leading-relaxed">
                              CSV imports can reconstruct entries/exits, size, duration, and P&amp;L — but they usually do <span className="font-medium">not</span> include
                              your strategy intent, psychology, screenshots, or discretionary context. Plan to review your imported trades and manually enrich them after import.
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="grid gap-2">
                     <Label>Broker format</Label>
                     <Select value={selectedBroker} onValueChange={(v: BrokerType) => setSelectedBroker(v)}>
                        <SelectTrigger className="h-9">
                           <SelectValue placeholder="Auto-detect" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="auto">Auto-detect (recommended)</SelectItem>
                           {supportedBrokers.map(b => (
                              <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     <p className="text-xs text-muted-foreground">
                        Auto-detect works for most files. If your broker changes columns, selecting the broker explicitly can help.{" "}
                        <NextLink href="/guides/import-and-connect" className="text-primary hover:underline font-medium">
                           See guide: Import & Connect
                        </NextLink>
                     </p>
                  </div>

                  <div className="flex items-center justify-center w-full my-4">
                     <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 border-muted-foreground/20 hover:border-primary/50 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                           <div className="p-3 bg-background rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform">
                              <Upload className="w-5 h-5 text-primary" />
                           </div>
                           <p className="text-sm font-medium text-muted-foreground">Click to browse file</p>
                           <p className="text-xs text-muted-foreground mt-1">CSV only. We never modify your original file.</p>
                        </div>
                        <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                     </label>
                  </div>
                  {file && (
                     <div className="p-3 bg-muted rounded text-sm text-center font-mono">
                        {file.name}
                     </div>
                  )}
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

            {/* Portfolio Manager Modal */}
            <PortfolioManagerDialog
               open={isPortfolioManagerOpen}
               onOpenChange={setIsPortfolioManagerOpen}
               accounts={accounts}
               trades={trades}
               selectedAccountId={selectedAccountId}
               onAccountsChange={() => fetchData(false)}
               onSelectAccount={setSelectedAccountId}
            />

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Danger Zone</DialogTitle>
                     <DialogDescription>
                        This will permanently delete ALL trades from the database. <br />
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
