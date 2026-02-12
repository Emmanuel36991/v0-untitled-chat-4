"use client"

import React, { useState } from "react"
import {
  Search,
  BookOpen,
  Filter,
  Check,
  Plus,
  Settings2,
  Upload,
  Building2,
  Trash2,
  Wallet,
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  Layers,
  LayoutGrid,
  List
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { DEMO_RECENT_TRADES } from "@/lib/mock-demo-data"

export default function DemoTradesPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const trades = DEMO_RECENT_TRADES

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* --- HEADER --- */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 w-full">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary hidden md:flex">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">Trade Journal <Badge variant="secondary" className="ml-2">Demo</Badge></h1>
                <p className="text-[11px] text-muted-foreground hidden md:block">Manage your trading activity.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" className="gap-2 shadow-sm pointer-events-none opacity-50">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Log Trade</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted pointer-events-none opacity-50">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-[1600px] mx-auto w-full">

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search symbols, notes..."
              className="pl-10 bg-background/50 border-border/60"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center rounded-lg border bg-background/50 p-1">
              <button onClick={() => setViewMode('list')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === 'list' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('grid')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === 'grid' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-9 border-dashed border-border/80">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Trade Table */}
        <Card className="border-none shadow-md overflow-hidden min-h-[500px] flex flex-col">
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
                  <TableRow key={trade.id} className="group">
                    <TableCell className="font-mono text-xs">{trade.date}</TableCell>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.side === "Long" ? "default" : "destructive"} className={cn("font-mono text-[10px] h-5", trade.side === "Long" ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20" : "bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 border-rose-500/20")}>
                        {trade.side}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-xs bg-muted/50 border-border">
                        {trade.setup}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-mono font-medium", trade.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {trade.pnl >= 0 ? "+" : ""}${Math.abs(trade.pnl).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 flex justify-center border-t border-border bg-muted/10">
            <Button variant="outline" size="sm" className="text-xs">
              Load More
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
