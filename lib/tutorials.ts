import { Tutorial } from "@/types/tutorial"

export const DASHBOARD_TUTORIAL: Tutorial = {
  id: "dashboard-onboarding",
  steps: [
    {
      id: "welcome",
      title: "Welcome to Concentrade",
      description: "Your professional trading journal and analytics platform. Let's take a quick tour of your new command center.",
      // No target = center screen modal
    },
    {
      id: "metrics",
      title: "Key Performance Indicators",
      description: "Get an instant pulse on your trading performance. Track your Win Rate, Profit Factor, and Net P&L in real-time.",
      targetSelector: '[data-tutorial="key-metrics"]',
      position: "bottom"
    },
    {
      id: "chart",
      title: "Equity Curve Analysis",
      description: "Visualize your account growth over time. Switch between Cumulative P&L and Daily performance views.",
      targetSelector: '[data-tutorial="performance-chart"]',
      position: "top"
    },
    {
      id: "recent",
      title: "Recent Activity",
      description: "Quickly review your latest executions. Click any trade to open the detailed analysis view.",
      targetSelector: '[data-tutorial="recent-trades"]',
      position: "left"
    },
    {
      id: "add-trade",
      title: "Log Your First Trade",
      description: "Ready to start tracking? Click here to log a new trade or import from your broker.",
      targetSelector: '[data-tutorial="add-trade-btn"]',
      position: "bottom"
    }
  ]
}
