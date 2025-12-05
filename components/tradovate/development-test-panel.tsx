"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { MockTradovateAPI, TradovateTestUtils, type TradovateTestResult } from "@/lib/tradovate/test-utils"
import { testTradovateConnection, authenticateTradovateEnhanced } from "@/app/actions/enhanced-tradovate-actions"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Shield,
  Settings,
  Bug,
  TestTube,
  Network,
  Search,
} from "lucide-react"

interface TestReport {
  connectivity: TradovateTestResult[]
  authEndpoints: TradovateTestResult[]
  summary: {
    connectivitySuccess: number
    authEndpointsFound: number
    recommendedEndpoint?: string
  }
}

export function DevelopmentTestPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [testReport, setTestReport] = useState<TestReport | null>(null)
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    isDemo: true,
  })
  const { toast } = useToast()

  const addTestResult = (name: string, success: boolean, message: string, details?: any) => {
    const result = {
      id: Date.now(),
      name,
      success,
      message,
      details,
      timestamp: new Date().toISOString(),
    }
    setTestResults((prev) => [result, ...prev])
  }

  const runFullAPIDiscovery = async () => {
    setIsLoading(true)
    setTestReport(null)
    setTestResults([])

    try {
      addTestResult("API Discovery", true, "Starting comprehensive API endpoint discovery...")

      const report = await TradovateTestUtils.generateTestReport()
      setTestReport(report)

      addTestResult(
        "API Discovery Complete",
        true,
        `Found ${report.summary.authEndpointsFound} working auth endpoints out of ${report.authEndpoints.length} tested`,
        report.summary,
      )

      if (report.summary.recommendedEndpoint) {
        addTestResult("Recommended Endpoint", true, `Use endpoint: ${report.summary.recommendedEndpoint}`, {
          endpoint: report.summary.recommendedEndpoint,
        })
      }
    } catch (error: any) {
      addTestResult("API Discovery", false, error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const runMockAuthentication = async () => {
    setIsLoading(true)
    try {
      const mockAPI = new MockTradovateAPI()
      const session = await mockAPI.authenticate("demo_user", "demo_password")

      addTestResult("Mock Authentication", true, "Mock authentication successful", session)
    } catch (error: any) {
      addTestResult("Mock Authentication", false, error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const runRealAuthentication = async () => {
    if (!credentials.username || !credentials.password) {
      addTestResult("Real Authentication", false, "Username and password are required")
      return
    }

    setIsLoading(true)
    try {
      const result = await authenticateTradovateEnhanced(credentials.username, credentials.password, credentials.isDemo)

      addTestResult(
        "Real Authentication",
        result.success,
        result.success ? "Authentication successful" : result.error || "Authentication failed",
        result,
      )
    } catch (error: any) {
      addTestResult("Real Authentication", false, error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const runConnectionTest = async () => {
    setIsLoading(true)
    try {
      const result = await testTradovateConnection()

      addTestResult(
        "Connection Test",
        result.success,
        result.success ? "Connection successful" : "Connection failed",
        result.details,
      )
    } catch (error: any) {
      addTestResult("Connection Test", false, error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const testSpecificEndpoint = async (endpoint: string, method = "GET") => {
    setIsLoading(true)
    try {
      const demoResult = await TradovateTestUtils.testEndpoint("https://demo-api-d.tradovate.com/v1", endpoint, method)

      const liveResult = await TradovateTestUtils.testEndpoint("https://api.tradovate.com/v1", endpoint, method)

      addTestResult(
        `Test ${endpoint}`,
        demoResult.success || liveResult.success,
        `Demo: ${demoResult.details?.status || "ERROR"}, Live: ${liveResult.details?.status || "ERROR"}`,
        { demo: demoResult, live: liveResult },
      )
    } catch (error: any) {
      addTestResult(`Test ${endpoint}`, false, error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
    setTestReport(null)
  }

  const renderTestResult = (result: TradovateTestResult, index: number) => {
    const isSuccess = result.success || (result.details?.status && result.details.status !== 404)
    const statusColor = isSuccess ? "text-green-400" : "text-red-400"
    const bgColor = isSuccess ? "bg-green-500/10" : "bg-red-500/10"

    return (
      <div key={index} className={`p-3 rounded-lg border ${bgColor} border-opacity-30`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <code className="text-sm font-mono">{result.endpoint}</code>
          </div>
          <Badge variant={isSuccess ? "default" : "destructive"}>{result.details?.status || "ERROR"}</Badge>
        </div>

        {result.details && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Method: {result.method}</div>
            {result.details.baseUrl && <div>Base URL: {result.details.baseUrl}</div>}
            {result.details.statusText && <div>Status: {result.details.statusText}</div>}
            {result.error && <div className="text-red-400">Error: {result.error}</div>}
            {result.details.data && (
              <details className="mt-2">
                <summary className="cursor-pointer">Response Data</summary>
                <pre className="mt-1 p-2 bg-black/20 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(result.details.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-400" />
            Tradovate API Discovery & Test Panel
          </CardTitle>
          <CardDescription>Discover working Tradovate API endpoints and test authentication methods</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="discovery" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="discovery">Discovery</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="manual">Manual Test</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="discovery" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={runFullAPIDiscovery} disabled={isLoading} className="futuristic-button">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Discovering...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Discover API Endpoints
                    </>
                  )}
                </Button>

                <Button onClick={runConnectionTest} disabled={isLoading} variant="outline" className="bg-transparent">
                  <Network className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
              </div>

              <Alert className="border-blue-500/30 bg-blue-500/10">
                <AlertTriangle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  <strong>API Discovery:</strong> This will test multiple endpoints to find the correct Tradovate API
                  authentication method. It may take a few minutes to complete.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="auth" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={credentials.username}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="Your Tradovate username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Your Tradovate password"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={runMockAuthentication} disabled={isLoading} variant="outline">
                  <Bug className="mr-2 h-4 w-4" />
                  Test Mock Auth
                </Button>

                <Button onClick={runRealAuthentication} disabled={isLoading} className="futuristic-button">
                  <Shield className="mr-2 h-4 w-4" />
                  Test Real Auth
                </Button>
              </div>

              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  <strong>Real Authentication:</strong> This will attempt to authenticate with your actual Tradovate
                  credentials using multiple authentication methods.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => testSpecificEndpoint("/auth/request", "POST")}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  /auth/request
                </Button>
                <Button
                  onClick={() => testSpecificEndpoint("/auth/accesstokenrequest", "POST")}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  /auth/accesstokenrequest
                </Button>
                <Button
                  onClick={() => testSpecificEndpoint("/auth/login", "POST")}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  /auth/login
                </Button>
                <Button
                  onClick={() => testSpecificEndpoint("/oauth/token", "POST")}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  /oauth/token
                </Button>
                <Button
                  onClick={() => testSpecificEndpoint("/session/request", "POST")}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  /session/request
                </Button>
                <Button
                  onClick={() => testSpecificEndpoint("/user/syncrequest", "GET")}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  /user/syncrequest
                </Button>
              </div>

              <Alert className="border-purple-500/30 bg-purple-500/10">
                <Settings className="h-4 w-4 text-purple-400" />
                <AlertDescription className="text-purple-300">
                  <strong>Manual Testing:</strong> Test individual endpoints to see which ones exist. 404 = doesn't
                  exist, 401 = exists but needs auth, 200 = working.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Test Results</h3>
                <Button onClick={clearResults} variant="outline" size="sm">
                  Clear Results
                </Button>
              </div>

              {testResults.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No test results yet. Run some tests to see results here.
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {testResults.map((result) => (
                      <div
                        key={result.id}
                        className={`p-4 rounded-lg border ${
                          result.success ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-400" />
                              )}
                              <span className="font-medium">{result.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                            {result.details && (
                              <details className="mt-2">
                                <summary className="text-xs text-muted-foreground cursor-pointer">View Details</summary>
                                <pre className="mt-1 text-xs bg-black/20 p-2 rounded overflow-auto max-h-32">
                                  {JSON.stringify(result.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* API Discovery Results */}
      {testReport && (
        <Card className="glass-card border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-400" />
              API Discovery Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="auth-endpoints">Auth Endpoints</TabsTrigger>
                <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400">{testReport.summary.connectivitySuccess}</div>
                    <div className="text-sm text-muted-foreground">Successful Connections</div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400">{testReport.summary.authEndpointsFound}</div>
                    <div className="text-sm text-muted-foreground">Auth Endpoints Found</div>
                  </div>
                </div>

                {testReport.summary.recommendedEndpoint && (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300">
                      <strong>Recommended Auth Endpoint:</strong> <code>{testReport.summary.recommendedEndpoint}</code>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="auth-endpoints">
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {testReport.authEndpoints.map((result, index) => renderTestResult(result, index))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="connectivity">
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {testReport.connectivity.map((result, index) => renderTestResult(result, index))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
