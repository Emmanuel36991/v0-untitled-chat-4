"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Shield,
  Settings,
  Database,
  HelpCircle,
  BookOpen,
  Code,
} from "lucide-react"

export function TradovateSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<string | null>(null)

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepId)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const envVariables = [
    { key: "TRADOVATE_APP_ID", value: "TradingTracker", description: "Your app identifier" },
    { key: "TRADOVATE_APP_VERSION", value: "1.0.0", description: "App version" },
    { key: "TRADOVATE_CID", value: "1", description: "Client ID" },
    { key: "TRADOVATE_SEC", value: "MainAccount", description: "Security context" },
    { key: "TRADOVATE_TEST_USERNAME", value: "your_test_username", description: "Test credentials (optional)" },
    { key: "TRADOVATE_TEST_PASSWORD", value: "your_test_password", description: "Test credentials (optional)" },
  ]

  return (
    <div className="space-y-6">
      <Card className="glass-card border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            Tradovate Integration Setup Guide
          </CardTitle>
          <CardDescription>Complete guide to set up and configure your Tradovate API integration</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-4">
                <Alert className="border-blue-500/30 bg-blue-500/10">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    <strong>What is Tradovate?</strong> Tradovate is a futures trading platform that provides API access
                    for automated trading and data retrieval. This integration allows you to sync your trades
                    automatically.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        What You Get
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        <li>• Automatic trade synchronization</li>
                        <li>• Real-time P&L calculation</li>
                        <li>• Historical trade analysis</li>
                        <li>• Portfolio performance tracking</li>
                        <li>• Risk management insights</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/30 bg-purple-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4 text-purple-400" />
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        <li>• Active Tradovate account</li>
                        <li>• API access enabled</li>
                        <li>• Valid username/password</li>
                        <li>• Internet connection</li>
                        <li>• Environment variables configured</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Setup Process</h4>
                  <div className="space-y-2">
                    {[
                      "Configure environment variables",
                      "Test your Tradovate credentials",
                      "Validate API connection",
                      "Sync your first trades",
                      "Monitor and analyze performance",
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-400">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="environment" className="space-y-4">
              <div className="space-y-4">
                <Alert className="border-yellow-500/30 bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300">
                    <strong>Important:</strong> These environment variables must be set in your Vercel project settings
                    or local .env.local file for the integration to work properly.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">Required Environment Variables</h4>
                  {envVariables.map((env) => (
                    <Card key={env.key} className="border-gray-500/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-sm font-mono bg-black/20 px-2 py-1 rounded">{env.key}</code>
                              <Badge variant="outline" className="text-xs">
                                {env.key.includes("TEST") ? "Optional" : "Required"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{env.description}</p>
                            <code className="text-xs text-muted-foreground">{env.value}</code>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(`${env.key}=${env.value}`, env.key)}
                            variant="ghost"
                            size="sm"
                          >
                            {copiedStep === env.key ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Vercel Deployment Setup</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      To add environment variables to your Vercel project:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm ml-4">
                      <li>Go to your Vercel project dashboard</li>
                      <li>Navigate to Settings → Environment Variables</li>
                      <li>Add each variable with its corresponding value</li>
                      <li>Redeploy your application</li>
                    </ol>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Local Development Setup</h4>
                  <Card className="border-gray-500/30 bg-black/20">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Create a .env.local file in your project root:
                      </p>
                      <pre className="text-xs bg-black/40 p-3 rounded overflow-auto">
                        {envVariables.map((env) => `${env.key}=${env.value}`).join("\n")}
                      </pre>
                      <Button
                        onClick={() =>
                          copyToClipboard(envVariables.map((env) => `${env.key}=${env.value}`).join("\n"), "env-file")
                        }
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        {copiedStep === "env-file" ? (
                          <>
                            <CheckCircle className="mr-2 h-3 w-3 text-green-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-3 w-3" />
                            Copy All
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <div className="space-y-4">
                <Alert className="border-green-500/30 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    <strong>Demo Account Recommended:</strong> Always test with a demo account first to ensure
                    everything works correctly before connecting your live trading account.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-blue-500/30 bg-blue-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Code className="h-4 w-4 text-blue-400" />
                        Development Testing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        <li>• Use the development test panel</li>
                        <li>• Validate environment variables</li>
                        <li>• Test mock authentication</li>
                        <li>• Verify API connections</li>
                        <li>• Import sample data</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/30 bg-purple-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Database className="h-4 w-4 text-purple-400" />
                        Production Testing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        <li>• Start with demo account</li>
                        <li>• Test login functionality</li>
                        <li>• Sync a small date range</li>
                        <li>• Verify trade accuracy</li>
                        <li>• Monitor error handling</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Testing Checklist</h4>
                  <div className="space-y-2">
                    {[
                      "Environment variables are configured",
                      "Tradovate credentials are valid",
                      "API connection is successful",
                      "Demo account login works",
                      "Trade data syncs correctly",
                      "Error handling works properly",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="troubleshooting" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Common Issues & Solutions</h4>

                  <Card className="border-red-500/30 bg-red-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-red-400">Authentication Failed</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        <li>• Verify username and password are correct</li>
                        <li>• Check if account is active and not locked</li>
                        <li>• Ensure you're using the right account type (Demo/Live)</li>
                        <li>• Try logging into Tradovate's website directly</li>
                        <li>• Contact Tradovate support if account issues persist</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-500/30 bg-yellow-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-yellow-400">Connection Issues</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        <li>• Check your internet connection</li>
                        <li>• Verify environment variables are set correctly</li>
                        <li>• Test API connectivity using the health check</li>
                        <li>• Check if Tradovate API is experiencing downtime</li>
                        <li>• Try again after a few minutes (rate limiting)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-500/30 bg-blue-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-blue-400">Data Sync Problems</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        <li>• Ensure you have completed trades in your account</li>
                        <li>• Check the date range for trade synchronization</li>
                        <li>• Verify account permissions for API access</li>
                        <li>• Try syncing a smaller date range first</li>
                        <li>• Check application logs for detailed error messages</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Getting Help</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start bg-transparent" asChild>
                      <a href="https://tradovate.com/support" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Tradovate Support
                      </a>
                    </Button>
                    <Button variant="outline" className="justify-start bg-transparent" asChild>
                      <a href="https://api.tradovate.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        API Documentation
                      </a>
                    </Button>
                  </div>
                </div>

                <Alert className="border-blue-500/30 bg-blue-500/10">
                  <HelpCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    <strong>Still having issues?</strong> Use the development test panel to diagnose problems, check the
                    browser console for error messages, and ensure all environment variables are properly configured.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
