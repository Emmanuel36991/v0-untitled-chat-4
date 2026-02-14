"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, TrendingUp, CheckCircle, AlertCircle, ExternalLink, Shield, Clock } from "lucide-react"
import { PulseIcon } from "@/components/icons/system-icons"
import { createTradingViewConnection } from "@/app/actions/tradingview-actions"
import { toast } from "@/hooks/use-toast"

interface QuickConnectModalProps {
  onConnectionCreated?: () => void
  onClose?: () => void
}

export function QuickConnectModal({ onConnectionCreated, onClose }: QuickConnectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"setup" | "instructions" | "complete">("setup")
  const [newConnection, setNewConnection] = useState<any>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const connection = await createTradingViewConnection(formData)
      setNewConnection(connection)
      setStep("instructions")
      onConnectionCreated?.()
      toast({
        title: "Connection Created Successfully!",
        description: "Your TradingView webhook is ready to use.",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to create connection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const openTradingView = () => {
    window.open("https://www.tradingview.com/chart/", "_blank")
  }

  if (step === "instructions" && newConnection) {
    return (
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-sm text-green-400">Connection Created</span>
          </div>
          <div className="w-8 h-px bg-gradient-to-r from-green-400 to-blue-400"></div>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded-full border-2 border-blue-400 bg-blue-400/20 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
            </div>
            <span className="text-sm text-blue-400">Setup TradingView</span>
          </div>
          <div className="w-8 h-px bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded-full border-2 border-gray-600"></div>
            <span className="text-sm text-gray-500">Complete</span>
          </div>
        </div>

        <Card className="glass-card border-green-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              Webhook Created Successfully!
            </CardTitle>
            <CardDescription>Follow these steps to connect your TradingView alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Details */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-green-400">1. Webhook URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={newConnection.webhook_url}
                    readOnly
                    className="bg-green-500/10 border-green-500/30 text-green-300 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newConnection.webhook_url, "Webhook URL")}
                    className="border-green-500/30 hover:bg-green-500/20"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-green-400">2. Secret Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={newConnection.secret_key}
                    readOnly
                    className="bg-green-500/10 border-green-500/30 text-green-300 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newConnection.secret_key, "Secret Key")}
                    className="border-green-500/30 hover:bg-green-500/20"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* TradingView Setup Instructions */}
            <Alert className="border-blue-500/30 bg-blue-500/10">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong className="text-blue-400">TradingView Setup Instructions:</strong>
                <ol className="list-decimal list-inside mt-3 space-y-2 text-sm">
                  <li>Open TradingView and create a new alert on your chart</li>
                  <li>In the alert settings, enable "Webhook URL"</li>
                  <li>Paste the webhook URL from above</li>
                  <li className="space-y-2">
                    <div>In your alert message, paste this JSON template:</div>
                    <div className="bg-blue-900/30 p-3 rounded border border-blue-500/30 font-mono text-xs overflow-x-auto">
                      <code className="text-blue-200">
                        {`{
  "symbol": "{{ticker}}",
  "action": "buy",
  "price": {{close}},
                        "quantity": 1,
  "strategy": "My Strategy",
  "timeframe": "{{interval}}",
  "secret": "${newConnection.secret_key}"
}`}
                      </code>
                    </div>
                  </li>
                  <li>Customize the "action" field: use "buy", "sell", or "alert"</li>
                  <li>Save and activate your alert</li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={openTradingView} className="futuristic-button flex-1">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open TradingView
              </Button>
              <Button
                onClick={() => setStep("complete")}
                variant="outline"
                className="glass-card border-green-500/30 flex-1"
              >
                I've Set It Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "complete") {
    return (
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-green-400/30 pulse-ring"></div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gradient mb-2">Connection Complete!</h3>
          <p className="text-muted-foreground">
            Your TradingView alerts will now automatically log trades to your journal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="glass-card p-4 border-green-500/20">
            <PulseIcon className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-400">Instant Sync</p>
            <p className="text-xs text-muted-foreground">Real-time trade logging</p>
          </Card>
          <Card className="glass-card p-4 border-blue-500/20">
            <Shield className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-400">Secure</p>
            <p className="text-xs text-muted-foreground">Encrypted webhooks</p>
          </Card>
          <Card className="glass-card p-4 border-purple-500/20">
            <Clock className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-400">24/7 Active</p>
            <p className="text-xs text-muted-foreground">Always monitoring</p>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => window.open("/tradingview", "_blank")} className="futuristic-button flex-1">
            <TrendingUp className="mr-2 h-4 w-4" />
            Manage Connections
          </Button>
          <Button onClick={onClose} variant="outline" className="glass-card border-cyan-500/30 flex-1">
            Done
          </Button>
        </div>
      </div>
    )
  }

  // Setup Step
  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 rounded-full border-2 border-blue-400 bg-blue-400/20 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
          </div>
          <span className="text-sm text-blue-400">Create Connection</span>
        </div>
        <div className="w-8 h-px bg-gray-600"></div>
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 rounded-full border-2 border-gray-600"></div>
          <span className="text-sm text-gray-500">Setup TradingView</span>
        </div>
        <div className="w-8 h-px bg-gray-600"></div>
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 rounded-full border-2 border-gray-600"></div>
          <span className="text-sm text-gray-500">Complete</span>
        </div>
      </div>

      <Card className="glass-card border-orange-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <TrendingUp className="h-5 w-5" />
            Quick TradingView Setup
          </CardTitle>
          <CardDescription>Create a secure webhook connection for automatic trade logging</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., My Main Strategy"
                required
                className="mt-1 futuristic-input"
                defaultValue="TradingView Connection"
              />
              <p className="text-sm text-muted-foreground mt-1">Give your connection a memorable name</p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-400">Auto-Log Trades</p>
                  <p className="text-xs text-green-300/70">Instant trade journaling</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Shield className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-400">Secure Webhooks</p>
                  <p className="text-xs text-blue-300/70">Encrypted connections</p>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full futuristic-button">
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Creating Connection...
                </>
              ) : (
                <>
                  <PulseIcon className="mr-2 h-4 w-4" />
                  Create Webhook Connection
                </>
              )}
            </Button>
          </form>

          <Alert className="mt-4 border-cyan-500/30 bg-cyan-500/10">
            <AlertCircle className="h-4 w-4 text-cyan-400" />
            <AlertDescription className="text-cyan-300">
              This will create a secure webhook endpoint that TradingView can send alerts to. No API keys or passwords
              required!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
