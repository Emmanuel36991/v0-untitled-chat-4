"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AlpacaConnectionFormProps {
  onBack: () => void
  onConnectionCreated?: () => void
  onClose?: () => void
}

type Step = "credentials" | "connected" | "syncing" | "done"

interface AccountInfo {
  accountNumber: string
  status: string
  buyingPower: string
  portfolioValue: string
  equity: string
  isPaper: boolean
}

export function AlpacaConnectionForm({
  onBack,
  onConnectionCreated,
  onClose,
}: AlpacaConnectionFormProps) {
  const [step, setStep] = useState<Step>("credentials")
  const [apiKey, setApiKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [isPaper, setIsPaper] = useState(true)
  const [showSecret, setShowSecret] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionId, setConnectionId] = useState<string | null>(null)
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [syncResult, setSyncResult] = useState<{
    tradesImported: number
    tradesSkipped: number
    message: string
  } | null>(null)

  const handleConnect = async () => {
    if (!apiKey.trim() || !secretKey.trim()) {
      setError("Both API Key and Secret Key are required")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const response = await fetch("/api/alpaca/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim(), secretKey: secretKey.trim(), isPaper }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Failed to connect to Alpaca")
        return
      }

      setConnectionId(data.connectionId)
      setAccountInfo({
        accountNumber: data.account.accountNumber,
        status: data.account.status,
        buyingPower: data.account.buyingPower,
        portfolioValue: data.account.portfolioValue,
        equity: data.account.equity,
        isPaper: data.account.isPaper,
      })
      setStep("connected")
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSync = async () => {
    if (!connectionId) return

    setIsSyncing(true)
    setError(null)
    setStep("syncing")

    try {
      const response = await fetch("/api/alpaca/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Failed to sync trades")
        setStep("connected")
        return
      }

      setSyncResult({
        tradesImported: data.tradesImported,
        tradesSkipped: data.tradesSkipped,
        message: data.message,
      })
      setStep("done")

      toast({
        title: "Trades Synced",
        description: data.message,
      })

      onConnectionCreated?.()
    } catch (err: any) {
      setError(err.message || "Network error during sync. Please try again.")
      setStep("connected")
    } finally {
      setIsSyncing(false)
    }
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num)
  }

  // Step 1: Credentials form
  if (step === "credentials") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Connect Alpaca</h3>
            <p className="text-sm text-muted-foreground">
              Enter your API credentials to connect your Alpaca account
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key ID</Label>
            <Input
              id="apiKey"
              type="text"
              placeholder="PK..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecret ? "text" : "password"}
                placeholder="Enter your secret key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                autoComplete="off"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="paper-trading" className="text-sm font-medium">
                Paper Trading
              </Label>
              <p className="text-xs text-muted-foreground">
                Use paper trading API (recommended for testing)
              </p>
            </div>
            <Switch
              id="paper-trading"
              checked={isPaper}
              onCheckedChange={setIsPaper}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert className="border-blue-500/30 bg-blue-500/10">
          <Shield className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300 text-xs">
            Your API credentials are securely stored and used only to fetch your trade history.
            We never place orders or modify your account.
          </AlertDescription>
        </Alert>

        <Button
          className="w-full"
          onClick={handleConnect}
          disabled={isConnecting || !apiKey.trim() || !secretKey.trim()}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying credentials...
            </>
          ) : (
            "Connect to Alpaca"
          )}
        </Button>
      </div>
    )
  }

  // Step 2: Connected -- show account info and sync button
  if (step === "connected") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setStep("credentials")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Alpaca Connected</h3>
            <p className="text-sm text-muted-foreground">
              Your account has been verified successfully
            </p>
          </div>
        </div>

        {accountInfo && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Account</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{accountInfo.accountNumber}</span>
                <Badge
                  variant="outline"
                  className={
                    accountInfo.isPaper
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-green-500/20 text-green-400 border-green-500/30"
                  }
                >
                  {accountInfo.isPaper ? "Paper" : "Live"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Equity</span>
              <span className="text-sm font-semibold">{formatCurrency(accountInfo.equity)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Buying Power</span>
              <span className="text-sm">{formatCurrency(accountInfo.buyingPower)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Portfolio Value</span>
              <span className="text-sm">{formatCurrency(accountInfo.portfolioValue)}</span>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button className="w-full" onClick={handleSync}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Trades Now
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          This will import all your filled orders from Alpaca into your trade journal.
        </p>
      </div>
    )
  }

  // Step 3: Syncing in progress
  if (step === "syncing") {
    return (
      <div className="space-y-6 text-center py-8">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-400" />
        <div>
          <h3 className="text-lg font-semibold">Syncing Trades</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Fetching your trade history from Alpaca...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This may take a moment depending on your trade volume.
          </p>
        </div>
      </div>
    )
  }

  // Step 4: Done
  return (
    <div className="space-y-6 text-center py-4">
      <CheckCircle className="h-12 w-12 mx-auto text-green-400" />
      <div>
        <h3 className="text-lg font-semibold">Sync Complete</h3>
        {syncResult && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">{syncResult.message}</p>
            <div className="flex justify-center gap-4 mt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{syncResult.tradesImported}</div>
                <div className="text-xs text-muted-foreground">Imported</div>
              </div>
              {syncResult.tradesSkipped > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{syncResult.tradesSkipped}</div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={handleSync}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Again
        </Button>
        <Button onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}
