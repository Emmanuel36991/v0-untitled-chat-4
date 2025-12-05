"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { logoutTradovate, syncTradovateData } from "@/app/actions/tradovate-actions"
import type { TradovateSession } from "@/types/tradovate"
import {
  User,
  Building2,
  RefreshCw,
  LogOut,
  Shield,
  Activity,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Database,
  Zap,
} from "lucide-react"

interface TradovateDashboardProps {
  session: TradovateSession
  accountInfo: any
}

export function TradovateDashboard({ session, accountInfo }: TradovateDashboardProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncTradovateData()

      if (result.success) {
        toast({
          title: "Sync Complete!",
          description: `Successfully imported ${result.tradesImported || 0} trades from Tradovate`,
        })

        // Redirect to trades page to see imported data
        router.push("/trades")
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync data from Tradovate",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutTradovate()
      toast({
        title: "Logged Out",
        description: "Successfully disconnected from Tradovate",
      })
      router.push("/tradovate/login")
    } catch (error: any) {
      toast({
        title: "Logout Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 pointer-events-none"></div>

      <div className="relative z-10 container mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 rounded-3xl blur-xl"></div>
          <div className="relative glass-card rounded-3xl p-8 border-blue-500/30 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <TrendingUp className="h-12 w-12 text-blue-400" />
                    <div className="absolute inset-0 h-12 w-12 border-2 border-blue-400/30 rounded-full pulse-ring"></div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gradient">Tradovate Dashboard</h1>
                    <p className="text-muted-foreground text-lg">
                      Connected to {session.isDemo ? "Demo" : "Live"} Account
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge
                    variant="outline"
                    className={`${
                      session.isDemo
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-green-500/20 text-green-400 border-green-500/30"
                    }`}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {session.isDemo ? "Demo Account" : "Live Account"}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <User className="h-3 w-3 mr-1" />
                    {session.userName}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  disabled={isLoggingOut}
                  className="glass-card border-red-500/30 backdrop-blur-sm hover:bg-red-500/10"
                >
                  {isLoggingOut ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info */}
          <Card className="glass-card border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                Account Information
              </CardTitle>
              <CardDescription>Your Tradovate account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{session.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium">{session.userId}</p>
                </div>
              </div>

              {accountInfo?.user && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{accountInfo.user.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {accountInfo.user.status || "Active"}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trading Accounts */}
          <Card className="glass-card border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                Trading Accounts
              </CardTitle>
              <CardDescription>Connected trading accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {session.accounts.length > 0 ? (
                <div className="space-y-3">
                  {session.accounts.map((account) => (
                    <div key={account.id} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {account.accountType} • ID: {account.id}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            account.active
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {account.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No trading accounts found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="glass-card border-green-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Data Synchronization
            </CardTitle>
            <CardDescription>Import your trading data from Tradovate into the trading tracker</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Database className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Import Trade History</p>
                    <p className="text-sm text-muted-foreground">Sync your completed trades from Tradovate</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Calculate P&L</p>
                    <p className="text-sm text-muted-foreground">Automatic profit/loss calculation</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Trade Analysis</p>
                    <p className="text-sm text-muted-foreground">Detailed performance analytics</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="futuristic-button h-auto p-6 flex flex-col items-center space-y-2"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-8 w-8 animate-spin" />
                      <span className="font-semibold">Syncing Data...</span>
                      <span className="text-xs opacity-75">Please wait</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-8 w-8" />
                      <span className="font-semibold">Sync Trades Now</span>
                      <span className="text-xs opacity-75">Import from Tradovate</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Alert */}
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <CheckCircle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <strong>Connection Active:</strong> Your Tradovate account is successfully connected. You can now sync your
            trading data and analyze your performance.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
