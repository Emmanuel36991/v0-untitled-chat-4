"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { authenticateTradovateEnhanced, testTradovateConnection } from "@/app/actions/enhanced-tradovate-actions"
import {
  Shield,
  RefreshCw,
  TrendingUp,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  Wifi,
  WifiOff,
  CheckCircle,
} from "lucide-react"
import { PulseIcon } from "@/components/icons/system-icons"

interface ConnectionStatus {
  isOnline: boolean
  lastChecked: Date | null
  details?: any
}

export default function TradovateLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isDemo, setIsDemo] = useState(false) // Default to live
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: true,
    lastChecked: null,
  })
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const result = await testTradovateConnection()
      setConnectionStatus({
        isOnline: result.success,
        lastChecked: new Date(),
        details: result.details,
      })
    } catch (error) {
      setConnectionStatus({
        isOnline: false,
        lastChecked: new Date(),
      })
    }
  }

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required")
      return false
    }
    if (!password.trim()) {
      setError("Password is required")
      return false
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long")
      return false
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")


    try {
      const result = await authenticateTradovateEnhanced(username, password, isDemo)

      if (result.success) {
        toast({
          title: "Authentication Successful!",
          description: `Connected to Tradovate ${isDemo ? "Demo" : "Live"} account`,
        })
        router.push("/tradovate/dashboard")
      } else {
        console.error("Authentication failed:", result.error, result.errorCode)

        // Handle specific error codes
        switch (result.errorCode) {
          case "AUTH_ERROR":
            setError("Invalid username or password. Please check your credentials and try again.")
            setShowTroubleshooting(true)
            break
          case "RATE_LIMIT":
            setError("Too many login attempts. Please wait a few minutes before trying again.")
            break
          case "NETWORK_ERROR":
            setError("Network connection failed. The API endpoint may be unavailable. Please try again later.")
            setShowTroubleshooting(true)
            break
          case "VALIDATION_ERROR":
            setError(result.error || "Please check your input and try again.")
            break
          default:
            setError(result.error || "Authentication failed. Please try again.")
            setShowTroubleshooting(true)
        }
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again later.")
      setShowTroubleshooting(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    try {
      await checkConnectionStatus()
      toast({
        title: connectionStatus.isOnline ? "Connection Successful" : "Connection Failed",
        description: connectionStatus.isOnline ? "Tradovate API is accessible" : "Unable to reach Tradovate API",
        variant: connectionStatus.isOnline ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Unable to test connection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <TrendingUp className="h-10 w-10 text-blue-400" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-blue-400/30 pulse-ring"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Tradovate Login</h1>
              <p className="text-muted-foreground">Connect your Tradovate account to sync trades</p>
            </div>
          </div>

          {/* Connection Status */}
          <Card className="glass-card border-blue-500/30 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {connectionStatus.isOnline ? (
                    <Wifi className="h-4 w-4 text-green-400" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm">{connectionStatus.isOnline ? "API Connected" : "API Disconnected"}</span>
                  {connectionStatus.details && (
                    <span className="text-xs text-muted-foreground">
                      (Demo: {connectionStatus.details.demo?.success ? "✓" : "✗"}, Live:{" "}
                      {connectionStatus.details.live?.success ? "✓" : "✗"})
                    </span>
                  )}
                </div>
                <Button onClick={handleTestConnection} variant="ghost" size="sm" disabled={isLoading}>
                  {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Test"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Login Form */}
          <Card className="glass-card border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                Secure Authentication
              </CardTitle>
              <CardDescription>Enter your Tradovate credentials to connect your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="help">Help</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <Alert className="border-red-500/30 bg-red-500/10">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-300">{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Your Tradovate username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="futuristic-input"
                        disabled={isLoading}
                        required
                        autoComplete="username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Your Tradovate password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="futuristic-input pr-10"
                          disabled={isLoading}
                          required
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="demo"
                        checked={isDemo}
                        onCheckedChange={(checked) => setIsDemo(checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="demo" className="text-sm">
                        Use Demo Account (for testing only)
                      </Label>
                    </div>

                    {!isDemo && (
                      <Alert className="border-orange-500/30 bg-orange-500/10">
                        <AlertCircle className="h-4 w-4 text-orange-400" />
                        <AlertDescription className="text-orange-300">
                          <strong>Live Account:</strong> You are connecting to your live Tradovate account. Real trades
                          and data will be accessed.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full futuristic-button" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <PulseIcon className="mr-2 h-4 w-4" />
                          Connect to Tradovate {isDemo ? "Demo" : "Live"}
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="help" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Getting Started
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        <li>• Use your regular Tradovate username and password</li>
                        <li>• Live account connects to your real trading data</li>
                        <li>• Demo account is for testing only</li>
                        <li>• Ensure you have an active Tradovate account</li>
                        <li>• Check your internet connection</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Common Issues</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        <li>
                          • <strong>HTTP 404:</strong> API endpoint issue - we try multiple authentication methods
                        </li>
                        <li>
                          • <strong>Invalid credentials:</strong> Double-check username/password
                        </li>
                        <li>
                          • <strong>Account locked:</strong> Contact Tradovate support
                        </li>
                        <li>
                          • <strong>Network error:</strong> Check internet connection
                        </li>
                        <li>
                          • <strong>Rate limited:</strong> Wait a few minutes before retrying
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Security</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        <li>• Your credentials are encrypted in transit</li>
                        <li>• We never store your password</li>
                        <li>• Sessions expire automatically</li>
                        <li>• Live accounts access real trading data</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          {showTroubleshooting && (
            <Card className="glass-card border-yellow-500/30 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <AlertCircle className="h-5 w-5" />
                  Troubleshooting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Authentication Failed?</strong> Try these steps:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Verify your username and password are correct</li>
                    <li>Make sure your Tradovate account is active</li>
                    <li>Try logging into Tradovate's website directly</li>
                    <li>Check if you're using the correct account type (Demo/Live)</li>
                    <li>Wait a few minutes if you've made multiple attempts</li>
                    <li>The system tries multiple authentication methods automatically</li>
                    <li>Contact Tradovate support if issues persist</li>
                  </ol>
                </div>
                <Button onClick={() => setShowTroubleshooting(false)} variant="outline" size="sm" className="w-full">
                  Close
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <Shield className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              <strong>Secure Connection:</strong> Your credentials are encrypted and used only to authenticate with
              Tradovate's official API. We never store your password.
            </AlertDescription>
          </Alert>

          {/* Enhanced Authentication Notice */}
          <Alert className="border-green-500/30 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              <strong>Enhanced Authentication:</strong> Our system automatically tries multiple authentication methods
              to ensure the best compatibility with your Tradovate account.
            </AlertDescription>
          </Alert>

          {/* Live Account Warning */}
          {!isDemo && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                <strong>Live Account Warning:</strong> You are connecting to your live trading account. This will access
                your real trading data and account information.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
