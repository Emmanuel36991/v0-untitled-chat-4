"use client"

// Main Analytics Logo - Clean geometric design with data visualization elements
export const AnalyticsLogo = ({ className = "w-8 h-8", color = "#6366f1" }: { className?: string; color?: string }) => {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="analyticsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#analyticsGradient)" stroke="white" strokeWidth="2" />

      {/* Chart bars representing data */}
      <rect x="8" y="20" width="2.5" height="6" fill="white" rx="1" />
      <rect x="12" y="16" width="2.5" height="10" fill="white" rx="1" />
      <rect x="16" y="12" width="2.5" height="14" fill="white" rx="1" />
      <rect x="20" y="14" width="2.5" height="12" fill="white" rx="1" />

      {/* Trend line overlay */}
      <path
        d="M8 22 L12 18 L16 14 L20 16 L24 12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <circle cx="24" cy="12" r="2" fill="white" />
    </svg>
  )
}

// Performance Score Logo - Circular progress with modern styling
export const PerformanceScoreLogo = ({
  className = "w-8 h-8",
  color = "#10b981",
}: { className?: string; color?: string }) => {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="16" cy="16" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />

      {/* Progress arc (75% complete) */}
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="none"
        stroke="url(#performanceGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="65.97 87.96"
        transform="rotate(-90 16 16)"
      />

      {/* Center icon */}
      <circle cx="16" cy="16" r="8" fill="url(#performanceGradient)" />
      <path d="M12 16 L15 19 L20 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Metrics Dashboard Logo - Grid layout representing organized data
export const MetricsDashboardLogo = ({
  className = "w-8 h-8",
  color = "#3b82f6",
}: { className?: string; color?: string }) => {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="metricsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* Background rounded rectangle */}
      <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#metricsGradient)" />

      {/* Grid of metric cards */}
      <rect x="6" y="6" width="8" height="6" rx="2" fill="white" opacity="0.9" />
      <rect x="18" y="6" width="8" height="6" rx="2" fill="white" opacity="0.7" />
      <rect x="6" y="15" width="8" height="6" rx="2" fill="white" opacity="0.8" />
      <rect x="18" y="15" width="8" height="6" rx="2" fill="white" opacity="0.9" />
      <rect x="6" y="24" width="20" height="4" rx="2" fill="white" opacity="0.6" />

      {/* Small chart elements */}
      <rect x="7" y="8" width="1" height="2" fill={color} opacity="0.8" />
      <rect x="9" y="7" width="1" height="3" fill={color} opacity="0.8" />
      <rect x="11" y="9" width="1" height="1" fill={color} opacity="0.8" />
    </svg>
  )
}

// Insights Logo - Eye with data visualization elements
export const InsightsLogo = ({ className = "w-8 h-8", color = "#8b5cf6" }: { className?: string; color?: string }) => {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="insightsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Eye shape */}
      <ellipse cx="16" cy="16" rx="14" ry="8" fill="url(#insightsGradient)" />
      <ellipse cx="16" cy="16" rx="10" ry="6" fill="white" />

      {/* Pupil with data visualization */}
      <circle cx="16" cy="16" r="5" fill="url(#insightsGradient)" />

      {/* Data points in pupil */}
      <circle cx="14" cy="14" r="0.5" fill="white" opacity="0.8" />
      <circle cx="18" cy="14" r="0.5" fill="white" opacity="0.6" />
      <circle cx="16" cy="18" r="0.5" fill="white" opacity="0.9" />
      <circle cx="16" cy="16" r="1" fill="white" />

      {/* Reflection highlight */}
      <ellipse cx="14" cy="13" rx="1.5" ry="2" fill="white" opacity="0.3" />
    </svg>
  )
}

// Trends Logo - Arrow with trend line
export const TrendsLogo = ({ className = "w-8 h-8", color = "#059669" }: { className?: string; color?: string }) => {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="trendsGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="16" cy="16" r="15" fill="url(#trendsGradient)" stroke="white" strokeWidth="2" />

      {/* Trend line */}
      <path d="M6 24 L12 20 L18 16 L24 8" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Arrow head */}
      <path
        d="M20 8 L24 8 L24 12"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Data points */}
      <circle cx="6" cy="24" r="2" fill="white" />
      <circle cx="12" cy="20" r="2" fill="white" />
      <circle cx="18" cy="16" r="2" fill="white" />
      <circle cx="24" cy="8" r="2" fill="white" />
    </svg>
  )
}

// Reports Logo - Document with chart
export const ReportsLogo = ({ className = "w-8 h-8", color = "#dc2626" }: { className?: string; color?: string }) => {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reportsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>

      {/* Document background */}
      <rect x="6" y="4" width="20" height="26" rx="3" fill="white" stroke="url(#reportsGradient)" strokeWidth="2" />

      {/* Document fold */}
      <path d="M20 4 L20 10 L26 10" fill="none" stroke="url(#reportsGradient)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 4 L20 10 L26 10 Z" fill="#f3f4f6" />

      {/* Chart in document */}
      <rect x="9" y="14" width="2" height="6" fill="url(#reportsGradient)" rx="1" />
      <rect x="12" y="16" width="2" height="4" fill="url(#reportsGradient)" rx="1" />
      <rect x="15" y="12" width="2" height="8" fill="url(#reportsGradient)" rx="1" />
      <rect x="18" y="15" width="2" height="5" fill="url(#reportsGradient)" rx="1" />
      <rect x="21" y="13" width="2" height="7" fill="url(#reportsGradient)" rx="1" />

      {/* Title lines */}
      <rect x="9" y="8" width="8" height="1" fill="#d1d5db" rx="0.5" />
      <rect x="9" y="10" width="6" height="1" fill="#d1d5db" rx="0.5" />
    </svg>
  )
}

// Data Visualization Logo - Pie chart with segments
export const DataVisualizationLogo = ({
  className = "w-8 h-8",
  color = "#f59e0b",
}: { className?: string; color?: string }) => {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dataVizGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="dataVizGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="dataVizGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="16" cy="16" r="15" fill="white" stroke="#e5e7eb" strokeWidth="2" />

      {/* Pie chart segments */}
      <path d="M16 16 L16 1 A15 15 0 0 1 28.66 8 Z" fill="url(#dataVizGradient1)" />
      <path d="M16 16 L28.66 8 A15 15 0 0 1 28.66 24 Z" fill="url(#dataVizGradient2)" />
      <path d="M16 16 L28.66 24 A15 15 0 1 1 16 1 Z" fill="url(#dataVizGradient3)" />

      {/* Center circle */}
      <circle cx="16" cy="16" r="4" fill="white" stroke="#d1d5db" strokeWidth="1" />

      {/* Center dot */}
      <circle cx="16" cy="16" r="1.5" fill="#6b7280" />
    </svg>
  )
}

// Statistics Logo - Bar chart with trend
export const StatisticsLogo = ({
  className = "w-8 h-8",
  color = "#7c3aed",
}: { className?: string; color?: string }) => {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="statsGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#statsGradient)" />

      {/* Chart bars */}
      <rect x="6" y="22" width="3" height="6" fill="white" rx="1.5" opacity="0.9" />
      <rect x="11" y="18" width="3" height="10" fill="white" rx="1.5" opacity="0.9" />
      <rect x="16" y="14" width="3" height="14" fill="white" rx="1.5" opacity="0.9" />
      <rect x="21" y="16" width="3" height="12" fill="white" rx="1.5" opacity="0.9" />

      {/* Trend overlay */}
      <path
        d="M7.5 24 L12.5 20 L17.5 16 L22.5 18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Grid lines */}
      <line x1="5" y1="12" x2="27" y2="12" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="5" y1="18" x2="27" y2="18" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="5" y1="24" x2="27" y2="24" stroke="white" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

// Export all logos as a collection
export const AnalyticsLogos = {
  Analytics: AnalyticsLogo,
  PerformanceScore: PerformanceScoreLogo,
  MetricsDashboard: MetricsDashboardLogo,
  Insights: InsightsLogo,
  Trends: TrendsLogo,
  Reports: ReportsLogo,
  DataVisualization: DataVisualizationLogo,
  Statistics: StatisticsLogo,
}

// Logo selector component for easy usage
export const AnalyticsLogoSelector = ({
  type,
  className = "w-8 h-8",
  color,
}: {
  type: keyof typeof AnalyticsLogos
  className?: string
  color?: string
}) => {
  const LogoComponent = AnalyticsLogos[type]
  return <LogoComponent className={className} color={color} />
}
