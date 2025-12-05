import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PerformanceAnalyticsLogo,
  RiskMetricsLogo,
  TradeInsightsLogo,
  PortfolioOverviewLogo,
  MarketAnalysisLogo,
  AnalyticsDashboardLogo,
} from "./analytics-logos"

export default function AnalyticsLogoShowcase() {
  const logos = [
    {
      name: "Performance Analytics",
      description: "Track trading performance with trend analysis",
      component: PerformanceAnalyticsLogo,
    },
    {
      name: "Risk Metrics",
      description: "Monitor and analyze trading risk factors",
      component: RiskMetricsLogo,
    },
    {
      name: "Trade Insights",
      description: "Deep analysis and pattern recognition",
      component: TradeInsightsLogo,
    },
    {
      name: "Portfolio Overview",
      description: "Comprehensive portfolio distribution view",
      component: PortfolioOverviewLogo,
    },
    {
      name: "Market Analysis",
      description: "Real-time market data and candlestick patterns",
      component: MarketAnalysisLogo,
    },
    {
      name: "Analytics Dashboard",
      description: "Unified view of all analytics components",
      component: AnalyticsDashboardLogo,
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Logos</h1>
        <p className="text-muted-foreground">
          Professional logos designed for the analytics sections of your trading application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logos.map((logo) => {
          const LogoComponent = logo.component
          return (
            <Card key={logo.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <LogoComponent size={64} />
                </div>
                <CardTitle className="text-lg">{logo.name}</CardTitle>
                <CardDescription>{logo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <LogoComponent size={32} />
                    <p className="text-xs text-muted-foreground mt-1">32px</p>
                  </div>
                  <div className="text-center">
                    <LogoComponent size={24} />
                    <p className="text-xs text-muted-foreground mt-1">24px</p>
                  </div>
                  <div className="text-center">
                    <LogoComponent size={16} />
                    <p className="text-xs text-muted-foreground mt-1">16px</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
            <CardDescription>How to use these logos in your analytics components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm">
                {`import { PerformanceAnalyticsLogo } from '@/components/analytics-logos'

// Use in your component
<PerformanceAnalyticsLogo size={32} className="text-primary" />`}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
