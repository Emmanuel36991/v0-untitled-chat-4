import type React from "react"

interface LogoProps {
  className?: string
  size?: number
}

// Performance Analytics Logo - Upward trending chart with clean lines
export const PerformanceAnalyticsLogo: React.FC<LogoProps> = ({ className = "", size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M4 24L8 20L12 22L16 16L20 18L24 12L28 14"
      stroke="hsl(var(--primary))"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="8" cy="20" r="2" fill="hsl(var(--primary))" />
    <circle cx="12" cy="22" r="2" fill="hsl(var(--chart-1))" />
    <circle cx="16" cy="16" r="2" fill="hsl(var(--primary))" />
    <circle cx="20" cy="18" r="2" fill="hsl(var(--chart-2))" />
    <circle cx="24" cy="12" r="2" fill="hsl(var(--primary))" />
    <path d="M4 28H28" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// Risk Metrics Logo - Shield with bar chart elements
export const RiskMetricsLogo: React.FC<LogoProps> = ({ className = "", size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16 4L24 8V18C24 22 20 26 16 28C12 26 8 22 8 18V8L16 4Z"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="hsl(var(--primary) / 0.1)"
    />
    <rect x="12" y="14" width="2" height="8" fill="hsl(var(--chart-1))" rx="1" />
    <rect x="15" y="12" width="2" height="10" fill="hsl(var(--chart-2))" rx="1" />
    <rect x="18" y="16" width="2" height="6" fill="hsl(var(--chart-3))" rx="1" />
  </svg>
)

// Trade Insights Logo - Eye with data points
export const TradeInsightsLogo: React.FC<LogoProps> = ({ className = "", size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16 8C22 8 28 14 28 16C28 18 22 24 16 24C10 24 4 18 4 16C4 14 10 8 16 8Z"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="hsl(var(--primary) / 0.05)"
    />
    <circle cx="16" cy="16" r="4" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
    <circle cx="16" cy="16" r="1.5" fill="hsl(var(--primary))" />
    <circle cx="12" cy="12" r="1" fill="hsl(var(--chart-1))" />
    <circle cx="20" cy="12" r="1" fill="hsl(var(--chart-2))" />
    <circle cx="12" cy="20" r="1" fill="hsl(var(--chart-3))" />
    <circle cx="20" cy="20" r="1" fill="hsl(var(--chart-4))" />
  </svg>
)

// Portfolio Overview Logo - Pie chart with segments
export const PortfolioOverviewLogo: React.FC<LogoProps> = ({ className = "", size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="16" cy="16" r="10" stroke="hsl(var(--border))" strokeWidth="2" fill="none" />
    <path d="M16 6 A10 10 0 0 1 26 16 L16 16 Z" fill="hsl(var(--primary))" />
    <path d="M26 16 A10 10 0 0 1 16 26 L16 16 Z" fill="hsl(var(--chart-1))" />
    <path d="M16 26 A10 10 0 0 1 6 16 L16 16 Z" fill="hsl(var(--chart-2))" />
    <path d="M6 16 A10 10 0 0 1 16 6 L16 16 Z" fill="hsl(var(--chart-3))" />
    <circle cx="16" cy="16" r="3" fill="hsl(var(--background))" />
    <circle cx="16" cy="16" r="2" fill="hsl(var(--foreground))" />
  </svg>
)

// Market Analysis Logo - Candlestick chart pattern
export const MarketAnalysisLogo: React.FC<LogoProps> = ({ className = "", size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Candlestick 1 - Bullish */}
    <line x1="8" y1="8" x2="8" y2="24" stroke="hsl(var(--chart-2))" strokeWidth="1" />
    <rect x="6" y="12" width="4" height="8" fill="hsl(var(--chart-2))" rx="1" />

    {/* Candlestick 2 - Bearish */}
    <line x1="14" y1="6" x2="14" y2="22" stroke="hsl(var(--destructive))" strokeWidth="1" />
    <rect x="12" y="10" width="4" height="6" fill="hsl(var(--destructive))" rx="1" />

    {/* Candlestick 3 - Bullish */}
    <line x1="20" y1="10" x2="20" y2="26" stroke="hsl(var(--chart-2))" strokeWidth="1" />
    <rect x="18" y="14" width="4" height="8" fill="hsl(var(--chart-2))" rx="1" />

    {/* Candlestick 4 - Bullish */}
    <line x1="26" y1="12" x2="26" y2="28" stroke="hsl(var(--chart-2))" strokeWidth="1" />
    <rect x="24" y="16" width="4" height="6" fill="hsl(var(--chart-2))" rx="1" />

    {/* Base line */}
    <path d="M4 28H28" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// Analytics Dashboard Logo - Grid with data visualization elements
export const AnalyticsDashboardLogo: React.FC<LogoProps> = ({ className = "", size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Dashboard grid */}
    <rect
      x="4"
      y="4"
      width="24"
      height="24"
      stroke="hsl(var(--border))"
      strokeWidth="2"
      rx="4"
      fill="hsl(var(--card))"
    />

    {/* Grid lines */}
    <line x1="16" y1="4" x2="16" y2="28" stroke="hsl(var(--border))" strokeWidth="1" />
    <line x1="4" y1="16" x2="28" y2="16" stroke="hsl(var(--border))" strokeWidth="1" />

    {/* Chart elements in each quadrant */}
    {/* Top left - bar chart */}
    <rect x="6" y="10" width="1.5" height="4" fill="hsl(var(--primary))" rx="0.5" />
    <rect x="8.5" y="8" width="1.5" height="6" fill="hsl(var(--chart-1))" rx="0.5" />
    <rect x="11" y="12" width="1.5" height="2" fill="hsl(var(--chart-2))" rx="0.5" />

    {/* Top right - trend line */}
    <path
      d="M18 12L20 10L22 11L24 8L26 9"
      stroke="hsl(var(--primary))"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Bottom left - pie segment */}
    <path d="M10 22 A4 4 0 0 1 10 18 L10 20 Z" fill="hsl(var(--chart-1))" />
    <path d="M10 18 A4 4 0 0 1 14 22 L10 20 Z" fill="hsl(var(--chart-2))" />

    {/* Bottom right - data points */}
    <circle cx="20" cy="20" r="1" fill="hsl(var(--primary))" />
    <circle cx="22" cy="22" r="1" fill="hsl(var(--chart-1))" />
    <circle cx="24" cy="18" r="1" fill="hsl(var(--chart-2))" />
    <circle cx="26" cy="24" r="1" fill="hsl(var(--chart-3))" />
  </svg>
)

interface AnalyticsLogoSelectorProps {
  type:
    | keyof typeof AnalyticsLogos
    | "Analytics"
    | "DataVisualization"
    | "Statistics"
    | "PerformanceScore"
    | "Insights"
    | "Trends"
    | "MetricsDashboard"
  className?: string
  size?: number
  color?: string
}

export const AnalyticsLogoSelector: React.FC<AnalyticsLogoSelectorProps> = ({
  type,
  className = "",
  size = 32,
  color,
}) => {
  // Map additional types to existing logos
  const logoMap = {
    Analytics: AnalyticsLogos.AnalyticsDashboard,
    DataVisualization: AnalyticsLogos.PortfolioOverview,
    Statistics: AnalyticsLogos.RiskMetrics,
    PerformanceScore: AnalyticsLogos.PerformanceAnalytics,
    Insights: AnalyticsLogos.TradeInsights,
    Trends: AnalyticsLogos.PerformanceAnalytics,
    MetricsDashboard: AnalyticsLogos.AnalyticsDashboard,
    ...AnalyticsLogos,
  }

  const LogoComponent = logoMap[type] || AnalyticsLogos.AnalyticsDashboard

  return <LogoComponent className={className} size={size} />
}

// Export all logos as a collection
export const AnalyticsLogos = {
  PerformanceAnalytics: PerformanceAnalyticsLogo,
  RiskMetrics: RiskMetricsLogo,
  TradeInsights: TradeInsightsLogo,
  PortfolioOverview: PortfolioOverviewLogo,
  MarketAnalysis: MarketAnalysisLogo,
  AnalyticsDashboard: AnalyticsDashboardLogo,
}
