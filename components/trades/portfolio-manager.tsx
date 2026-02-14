"use client"

import React, { useState, useMemo } from "react"
import type { Trade } from "@/types"
import type { TradingAccount, AccountType } from "@/types/accounts"
import { updateTradingAccount, deleteTradingAccount, createTradingAccount } from "@/app/actions/account-actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit,
  MoreVertical,
  Plus,
  BarChart3,
  AlertTriangle,
  X,
  Check,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PortfolioStats {
  totalPnl: number
  winRate: number
  currentBalance: number
  tradeCount: number
  winCount: number
  lossCount: number
}

interface PortfolioManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: TradingAccount[]
  trades: Trade[]
  selectedAccountId: string | "all"
  onAccountsChange: () => void
  onSelectAccount: (id: string | "all") => void
}

function calcStats(account: TradingAccount, trades: Trade[]): PortfolioStats {
  const accountTrades = trades.filter((t) => (t as any).account_id === account.id)
  const totalPnl = accountTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winCount = accountTrades.filter((t) => t.outcome === "win").length
  const lossCount = accountTrades.filter((t) => t.outcome === "loss").length
  const winRate = accountTrades.length > 0 ? (winCount / accountTrades.length) * 100 : 0

  return {
    totalPnl,
    winRate,
    currentBalance: Number(account.initial_balance) + totalPnl,
    tradeCount: accountTrades.length,
    winCount,
    lossCount,
  }
}

const typeColors: Record<AccountType, string> = {
  funded: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  personal: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  challenge: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  demo: "border-zinc-500/40 text-zinc-400 bg-zinc-500/10",
}

export function PortfolioManagerDialog({
  open,
  onOpenChange,
  accounts,
  trades,
  selectedAccountId,
  onAccountsChange,
  onSelectAccount,
}: PortfolioManagerDialogProps) {
  const { toast } = useToast()

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editBalance, setEditBalance] = useState("")

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Create state
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<AccountType>("personal")
  const [newBalance, setNewBalance] = useState("10000")

  // Loading states
  const [savingId, setSavingId] = useState<string | null>(null)

  const accountStats = useMemo(() => {
    const map = new Map<string, PortfolioStats>()
    for (const acc of accounts) {
      map.set(acc.id, calcStats(acc, trades))
    }
    return map
  }, [accounts, trades])

  const startEdit = (account: TradingAccount) => {
    setEditingId(account.id)
    setEditName(account.name)
    setEditBalance(String(account.initial_balance))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditBalance("")
  }

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return
    setSavingId(id)
    try {
      const res = await updateTradingAccount(id, {
        name: editName.trim(),
        initial_balance: parseFloat(editBalance),
      })
      if (res.success) {
        toast({ title: "Portfolio Updated", description: `${editName} saved.` })
        onAccountsChange()
        cancelEdit()
      } else {
        toast({ title: "Error", description: res.error || "Failed to update", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setSavingId(null)
    }
  }

  const confirmDelete = async (id: string) => {
    setSavingId(id)
    try {
      const res = await deleteTradingAccount(id)
      if (res.success) {
        toast({ title: "Portfolio Deleted", description: "Account and its trades have been removed." })
        if (selectedAccountId === id) {
          onSelectAccount("all")
        }
        onAccountsChange()
        setDeletingId(null)
      } else {
        toast({ title: "Error", description: res.error || "Failed to delete", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setSavingId(null)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSavingId("new")
    try {
      const res = await createTradingAccount({
        name: newName.trim(),
        type: newType,
        initial_balance: parseFloat(newBalance),
      })
      if (res.success && res.account) {
        toast({ title: "Portfolio Created", description: `${newName} is ready.` })
        onAccountsChange()
        onSelectAccount(res.account.id)
        setIsCreating(false)
        setNewName("")
        setNewBalance("10000")
        setNewType("personal")
      } else {
        toast({ title: "Error", description: res.error || "Failed to create", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-primary" />
            Manage Portfolios
          </DialogTitle>
          <DialogDescription>
            View performance, rename, or remove your trading portfolios.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {/* Account Cards */}
          {accounts.map((account) => {
            const stats = accountStats.get(account.id)!
            const isActive = selectedAccountId === account.id
            const isEditing = editingId === account.id
            const isDeleting = deletingId === account.id
            const isBusy = savingId === account.id

            if (isDeleting) {
              return (
                <div
                  key={account.id}
                  className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Delete &ldquo;{account.name}&rdquo;?</p>
                      <p className="text-xs text-muted-foreground">
                        This will permanently delete this portfolio and{" "}
                        <span className="font-semibold text-destructive">{stats.tradeCount} trade{stats.tradeCount !== 1 ? "s" : ""}</span>{" "}
                        associated with it.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDeletingId(null)} disabled={isBusy}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => confirmDelete(account.id)} disabled={isBusy}>
                      {isBusy ? "Deleting..." : "Delete Portfolio"}
                    </Button>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={account.id}
                className={cn(
                  "rounded-xl border p-4 transition-all",
                  isActive
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/60 bg-card/50 hover:border-border"
                )}
              >
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Starting Balance</Label>
                        <Input
                          type="number"
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={isBusy}>
                        <X className="h-3.5 w-3.5 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveEdit(account.id)} disabled={isBusy || !editName.trim()}>
                        <Check className="h-3.5 w-3.5 mr-1" /> {isBusy ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => {
                            onSelectAccount(account.id)
                            onOpenChange(false)
                          }}
                          className="font-medium text-sm truncate hover:text-primary transition-colors text-left"
                        >
                          {account.name}
                        </button>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] h-4 px-1.5 capitalize shrink-0", typeColors[account.type])}
                        >
                          {account.type}
                        </Badge>
                        {isActive && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-primary/20 text-primary border-primary/30 shrink-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => startEdit(account)} className="cursor-pointer">
                            <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingId(account.id)}
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</p>
                        <p className="text-sm font-mono font-medium">
                          ${stats.currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total P&L</p>
                        <p
                          className={cn(
                            "text-sm font-mono font-medium flex items-center gap-1",
                            stats.totalPnl >= 0 ? "text-emerald-500" : "text-rose-500"
                          )}
                        >
                          {stats.totalPnl >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          ${Math.abs(stats.totalPnl).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Win Rate</p>
                        <p className="text-sm font-mono font-medium">
                          {stats.tradeCount > 0 ? `${stats.winRate.toFixed(1)}%` : "--"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Trades</p>
                        <p className="text-sm font-mono font-medium flex items-center gap-1">
                          <BarChart3 className="h-3 w-3 text-muted-foreground" />
                          {stats.tradeCount}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {/* Create New Card */}
          {isCreating ? (
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
              <p className="text-sm font-medium">New Portfolio</p>
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Topstep 50k Combine"
                    className="h-8 text-sm"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Type</Label>
                    <Select value={newType} onValueChange={(v: AccountType) => setNewType(v)}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                        <SelectItem value="challenge">Challenge</SelectItem>
                        <SelectItem value="demo">Demo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Starting Balance</Label>
                    <Input
                      type="number"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false)
                    setNewName("")
                    setNewBalance("10000")
                  }}
                  disabled={savingId === "new"}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreate} disabled={savingId === "new" || !newName.trim()}>
                  {savingId === "new" ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full rounded-xl border border-dashed border-border/60 p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <Plus className="h-4 w-4" /> Add Portfolio
            </button>
          )}

          {accounts.length === 0 && !isCreating && (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No portfolios yet. Create one to get started.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
