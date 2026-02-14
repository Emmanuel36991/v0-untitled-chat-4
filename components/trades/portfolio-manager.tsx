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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Trash2,
  Pencil,
  MoreVertical,
  Plus,
  BarChart3,
  AlertTriangle,
  X,
  Check,
  Briefcase,
  Target,
  Trophy,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- Types ---

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

// --- Helpers ---

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

const typeConfig: Record<AccountType, { label: string; icon: typeof Wallet; badgeClass: string }> = {
  funded: {
    label: "Funded",
    icon: Trophy,
    badgeClass: "badge-animated bg-success/15 text-success border border-success/20",
  },
  personal: {
    label: "Personal",
    icon: Wallet,
    badgeClass: "badge-animated bg-info/15 text-info border border-info/20",
  },
  challenge: {
    label: "Challenge",
    icon: Target,
    badgeClass: "badge-animated bg-warning/15 text-warning border border-warning/20",
  },
  demo: {
    label: "Demo",
    icon: Briefcase,
    badgeClass: "badge-animated border border-border text-muted-foreground bg-muted/50",
  },
}

// --- Component ---

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

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editBalance, setEditBalance] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<AccountType>("personal")
  const [newBalance, setNewBalance] = useState("10000")
  const [savingId, setSavingId] = useState<string | null>(null)

  const accountStats = useMemo(() => {
    const map = new Map<string, PortfolioStats>()
    for (const acc of accounts) {
      map.set(acc.id, calcStats(acc, trades))
    }
    return map
  }, [accounts, trades])

  // Aggregate stats
  const totals = useMemo(() => {
    let pnl = 0
    let tradeCount = 0
    for (const s of accountStats.values()) {
      pnl += s.totalPnl
      tradeCount += s.tradeCount
    }
    return { pnl, tradeCount }
  }, [accountStats])

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
        if (selectedAccountId === id) onSelectAccount("all")
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

  const resetCreate = () => {
    setIsCreating(false)
    setNewName("")
    setNewBalance("10000")
    setNewType("personal")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              Portfolio Manager
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              View performance, rename, or remove your trading portfolios.
            </DialogDescription>
          </DialogHeader>

          {/* Summary Bar */}
          {accounts.length > 0 && (
            <div className="mt-4 flex items-center gap-4 p-3 rounded-lg bg-muted/40 border border-border/40">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{accounts.length}</span>
                portfolio{accounts.length !== 1 ? "s" : ""}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{totals.tradeCount}</span>
                total trades
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2 text-xs">
                {totals.pnl >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <span className={cn("font-mono font-semibold", totals.pnl >= 0 ? "text-success" : "text-destructive")}>
                  {totals.pnl >= 0 ? "+" : "-"}${Math.abs(totals.pnl).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-muted-foreground">combined P&L</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Scrollable Card List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {accounts.map((account, index) => {
            const stats = accountStats.get(account.id)!
            const isActive = selectedAccountId === account.id
            const isEditing = editingId === account.id
            const isDeleting = deletingId === account.id
            const isBusy = savingId === account.id
            const config = typeConfig[account.type]

            // Delete Confirmation State
            if (isDeleting) {
              return (
                <div
                  key={account.id}
                  className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-4 animate-fade-in-up"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-destructive/15 rounded-lg shrink-0">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        Delete &ldquo;{account.name}&rdquo;?
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This will permanently delete this portfolio and{" "}
                        <span className="font-semibold text-destructive">
                          {stats.tradeCount} trade{stats.tradeCount !== 1 ? "s" : ""}
                        </span>{" "}
                        associated with it. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDeletingId(null)} disabled={isBusy}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => confirmDelete(account.id)} disabled={isBusy} className="gap-1.5">
                      {isBusy ? (
                        <>Deleting...</>
                      ) : (
                        <><Trash2 className="h-3.5 w-3.5" /> Delete Portfolio</>
                      )}
                    </Button>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={account.id}
                className={cn(
                  "group rounded-xl border p-4 transition-all duration-300",
                  isActive
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                    : "border-border/50 bg-card/50 hover:border-border hover:shadow-sm hover:-translate-y-0.5",
                  `animate-fade-in-up stagger-${Math.min(index + 1, 6)}`
                )}
              >
                {isEditing ? (
                  /* ─── Edit Mode ─── */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Pencil className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Editing Portfolio
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Portfolio Name</Label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-9 bg-background/50 border-border/60"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Starting Balance</Label>
                        <Input
                          type="number"
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          className="h-9 bg-background/50 border-border/60"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={isBusy} className="gap-1.5 text-muted-foreground">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveEdit(account.id)} disabled={isBusy || !editName.trim()} className="gap-1.5">
                        <Check className="h-3.5 w-3.5" /> {isBusy ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ─── Display Mode ─── */
                  <>
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("p-2 rounded-lg shrink-0", isActive ? "bg-primary/15" : "bg-muted/60")}>
                          <config.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onSelectAccount(account.id)
                                onOpenChange(false)
                              }}
                              className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors text-left"
                            >
                              {account.name}
                            </button>
                            {isActive && (
                              <Badge className="text-[10px] h-[18px] px-1.5 bg-primary/15 text-primary border border-primary/25 shrink-0">
                                Active
                              </Badge>
                            )}
                          </div>
                          <Badge className={cn("text-[10px] h-[18px] px-1.5 mt-1 capitalize", config.badgeClass)}>
                            {config.label}
                          </Badge>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => startEdit(account)} className="cursor-pointer gap-2">
                            <Pencil className="h-3.5 w-3.5" /> Rename / Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingId(account.id)}
                            className="text-destructive focus:text-destructive cursor-pointer gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete Portfolio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-3">
                      <StatCell
                        label="Balance"
                        value={`$${stats.currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                      />
                      <StatCell
                        label="Total P&L"
                        value={`${stats.totalPnl >= 0 ? "+" : "-"}$${Math.abs(stats.totalPnl).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                        icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
                        colorClass={stats.totalPnl >= 0 ? "text-success" : "text-destructive"}
                      />
                      <StatCell
                        label="Win Rate"
                        value={stats.tradeCount > 0 ? `${stats.winRate.toFixed(1)}%` : "--"}
                        colorClass={stats.tradeCount > 0 && stats.winRate >= 50 ? "text-success" : undefined}
                      />
                      <StatCell
                        label="Trades"
                        value={String(stats.tradeCount)}
                        icon={BarChart3}
                      />
                    </div>

                    {/* Win/Loss Mini Bar */}
                    {stats.tradeCount > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{stats.winCount}W / {stats.lossCount}L</span>
                          <span>{(stats.tradeCount - stats.winCount - stats.lossCount) > 0 ? `${stats.tradeCount - stats.winCount - stats.lossCount} BE` : ""}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden flex">
                          {stats.winCount > 0 && (
                            <div
                              className="h-full bg-success rounded-l-full transition-all duration-500"
                              style={{ width: `${(stats.winCount / stats.tradeCount) * 100}%` }}
                            />
                          )}
                          {stats.lossCount > 0 && (
                            <div
                              className="h-full bg-destructive transition-all duration-500"
                              style={{ width: `${(stats.lossCount / stats.tradeCount) * 100}%` }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}

          {/* ─── Create New Portfolio ─── */}
          {isCreating ? (
            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 space-y-4 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Plus className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  New Portfolio
                </p>
              </div>
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Portfolio Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Topstep 50k Combine"
                    className="h-9 bg-background/50 border-border/60"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Type</Label>
                    <Select value={newType} onValueChange={(v: AccountType) => setNewType(v)}>
                      <SelectTrigger className="h-9 bg-background/50 border-border/60">
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
                    <Label className="text-xs font-medium text-muted-foreground">Starting Balance</Label>
                    <Input
                      type="number"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="h-9 bg-background/50 border-border/60"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={resetCreate} disabled={savingId === "new"} className="gap-1.5 text-muted-foreground">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreate} disabled={savingId === "new" || !newName.trim()} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> {savingId === "new" ? "Creating..." : "Create Portfolio"}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className={cn(
                "w-full rounded-xl border border-dashed border-border/50 p-5",
                "flex items-center justify-center gap-2 text-sm text-muted-foreground",
                "hover:text-primary hover:border-primary/30 hover:bg-primary/5",
                "transition-all duration-300"
              )}
            >
              <Plus className="h-4 w-4" /> Add Portfolio
            </button>
          )}

          {/* Empty State */}
          {accounts.length === 0 && !isCreating && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in-up">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl ring-1 ring-primary/10 mb-4">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No portfolios yet</p>
              <p className="text-xs text-muted-foreground mb-4 max-w-[260px]">
                Create a trading portfolio to start tracking your performance.
              </p>
              <Button size="sm" onClick={() => setIsCreating(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Create Portfolio
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Sub-components ---

function StatCell({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string
  value: string
  icon?: typeof TrendingUp
  colorClass?: string
}) {
  return (
    <div className="space-y-1 p-2 rounded-lg bg-muted/30 border border-border/30">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-mono font-bold flex items-center gap-1 text-foreground", colorClass)}>
        {Icon && <Icon className="h-3 w-3" />}
        {value}
      </p>
    </div>
  )
}
