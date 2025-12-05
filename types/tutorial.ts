export type TutorialStatus = "not_started" | "in_progress" | "completed" | "skipped"

export interface TutorialStep {
  id: string
  title: string
  description: string
  targetElement?: string // CSS selector to highlight
  position?: "top" | "bottom" | "left" | "right"
  action?: "click" | "scroll" | "none"
  highlightPadding?: number
}

export interface Tutorial {
  id: string
  title: string
  description: string
  category: "dashboard" | "trading" | "analytics" | "psychology" | "community"
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDuration: number // in minutes
  steps: TutorialStep[]
  relatedGuideId?: string
  completionReward?: string
}

export interface TutorialProgress {
  id: string
  userId: string
  tutorialId: string
  status: TutorialStatus
  progressPercentage: number
  startedAt?: string
  completedAt?: string
  lastAccessedAt: string
  timeSpentMinutes: number
  createdAt: string
  updatedAt: string
}

// Tutorial definitions
export const TUTORIALS: Record<string, Tutorial> = {
  "dashboard-welcome": {
    id: "dashboard-welcome",
    title: "Command Center Walkthrough",
    description: "Master your professional trading dashboard in 3 minutes.",
    category: "dashboard",
    difficulty: "beginner",
    estimatedDuration: 3,
    steps: [
      {
        id: "intro",
        title: "Welcome to Concentrade",
        description:
          "This isn't just a logger—it's your performance engine. We've designed this dashboard to highlight your edge and expose your leaks. Let's take a quick tour.",
        action: "none",
      },
      {
        id: "metrics",
        title: "Vital Statistics",
        description:
          "These 4 cards are your heartbeat. \n• **Net P&L:** Your bottom line.\n• **Win Rate:** Aim for stability (>40%).\n• **Profit Factor:** The ultimate measure of efficiency. >1.5 is the goal.\n• **Avg Return:** Are your winners paying for your losers?",
        targetElement: '[data-tutorial="key-metrics"]',
        position: "bottom",
        action: "scroll",
        highlightPadding: 16,
      },
      {
        id: "chart",
        title: "The Equity Curve",
        description:
          "This chart tells the story of your discipline.\n\n**What to look for:**\n1. **Steep Drops:** Indicate tilting or poor risk management.\n2. **Flat Periods:** Show patience and discipline.\n3. **Toggle Views:** Use the tabs on the top-right to switch between Cumulative Growth and Daily Bar views.",
        targetElement: '[data-tutorial="performance-chart"]',
        position: "top",
        action: "scroll",
        highlightPadding: 0,
      },
      {
        id: "add-trade",
        title: "Execution Log",
        description:
          "This is where the work happens. Click here to open the **Professional Logger**. You'll be able to track:\n- Entry/Exit precision\n- Psychological state\n- Setup tags (ICT, SMC, etc.)\n- Screenshots",
        targetElement: '[data-tutorial="add-trade-btn"]',
        position: "left",
        action: "click",
        highlightPadding: 8,
      },
      {
        id: "recent",
        title: "Trade Feed & Analysis",
        description:
          "Your latest executions appear here. \n\n**Pro Tip:** Click the '>' arrow on any trade to enter **Post-Game Analysis** mode, where you can review your decision-making process against the outcome.",
        targetElement: '[data-tutorial="recent-trades"]',
        position: "top",
        action: "scroll",
      },
    ],
    relatedGuideId: "trading-journal-optimization",
  },
  "first-trade-guide": {
    id: "first-trade-guide",
    title: "Log Your First Trade",
    description: "Step-by-step guidance for recording your first trade",
    category: "trading",
    difficulty: "beginner",
    estimatedDuration: 5,
    steps: [
      {
        id: "trade-intro",
        title: "Recording Your First Trade",
        description: "Let's walk through the process of logging a trade in Concentrade.",
        action: "none",
      },
      {
        id: "instrument-selection",
        title: "Select Your Instrument",
        description:
          "Choose what you traded (ES, EURUSD, AAPL, etc.). You can see your preferred instruments or add custom ones.",
        targetElement: '[data-tutorial="instrument-select"]',
        position: "bottom",
        action: "click",
      },
      {
        id: "direction-setup",
        title: "Direction: Long or Short",
        description:
          "Did you go long (expecting price up) or short (expecting price down)? This determines your profit/loss calculation.",
        targetElement: '[data-tutorial="direction-select"]',
        position: "bottom",
        action: "click",
      },
      {
        id: "entry-exit",
        title: "Entry and Exit Prices",
        description:
          "Enter the price you got in and the price you got out. Concentrade calculates your P&L automatically.",
        targetElement: '[data-tutorial="entry-exit-inputs"]',
        position: "bottom",
        action: "none",
      },
      {
        id: "risk-setup",
        title: "Set Your Risk Parameters",
        description: "Enter your stop loss and take profit levels. These help calculate your risk-reward ratio.",
        targetElement: '[data-tutorial="risk-inputs"]',
        position: "bottom",
        action: "none",
      },
      {
        id: "setup-name",
        title: "Name Your Setup",
        description:
          'Give this trade a setup name (e.g., "FVG Break", "Support Bounce"). This helps you track patterns.',
        targetElement: '[data-tutorial="setup-name-input"]',
        position: "bottom",
        action: "none",
      },
      {
        id: "psychology-entry",
        title: "How Did You Feel?",
        description:
          "Track your emotional state: confidence, stress, and focus levels. This helps identify emotional patterns.",
        targetElement: '[data-tutorial="psychology-inputs"]',
        position: "top",
        action: "none",
      },
      {
        id: "submit-trade",
        title: "Submit Your Trade",
        description: 'Click "Save Trade" to record it. Your analytics will update automatically.',
        targetElement: '[data-tutorial="submit-trade-button"]',
        position: "top",
        action: "click",
      },
    ],
    completionReward: "First Trade Logged",
  },
  "analytics-dashboard": {
    id: "analytics-dashboard",
    title: "Understanding Your Analytics",
    description: "Deep dive into your trading performance analytics",
    category: "analytics",
    difficulty: "beginner",
    estimatedDuration: 4,
    steps: [
      {
        id: "analytics-intro",
        title: "Your Trading Analytics",
        description: "Analytics show your performance over time and help identify your strengths and weaknesses.",
        action: "none",
      },
      {
        id: "win-rate",
        title: "Win Rate",
        description: "Percentage of winning trades. A 50% win rate with good risk management is solid.",
        targetElement: '[data-tutorial="win-rate"]',
        position: "bottom",
        action: "none",
      },
      {
        id: "profit-factor",
        title: "Profit Factor",
        description: "Ratio of gross profit to gross loss. Higher is better. A ratio above 1.5 is excellent.",
        targetElement: '[data-tutorial="profit-factor"]',
        position: "bottom",
        action: "none",
      },
      {
        id: "avg-win-loss",
        title: "Average Win vs Average Loss",
        description: "Your avg win should be larger than avg loss. This ratio is key to long-term profitability.",
        targetElement: '[data-tutorial="avg-win-loss"]',
        position: "bottom",
        action: "none",
      },
      {
        id: "growth-chart",
        title: "Equity Curve",
        description: "See your growth over time. Steady growth with minimal drawdowns is the goal.",
        targetElement: '[data-tutorial="growth-chart"]',
        position: "bottom",
        action: "none",
      },
    ],
    relatedGuideId: "advanced-candlestick-patterns",
  },
  "psychology-tracker": {
    id: "psychology-tracker",
    title: "Master Your Psychology",
    description: "Learn to track and improve your trading psychology",
    category: "psychology",
    difficulty: "beginner",
    estimatedDuration: 3,
    steps: [
      {
        id: "psychology-intro",
        title: "Trading Psychology Matters",
        description:
          "Your emotions affect your trading. Tracking them helps you spot patterns and improve discipline.",
        action: "none",
      },
      {
        id: "emotion-tracking",
        title: "Log Your Emotions",
        description: "After each trade, record how you felt. Were you confident? Anxious? Frustrated?",
        targetElement: '[data-tutorial="emotion-log"]',
        position: "bottom",
        action: "none",
      },
      {
        id: "confidence-rating",
        title: "Confidence Level",
        description: "Rate your confidence (1-10). Low confidence trades often perform worse. This is valuable data.",
        targetElement: '[data-tutorial="confidence-rating"]',
        position: "bottom",
        action: "none",
      },
      {
        id: "lessons-learned",
        title: "Lessons & Improvements",
        description: "What did you learn? What will you improve? Writing this creates accountability.",
        targetElement: '[data-tutorial="lessons-input"]',
        position: "top",
        action: "none",
      },
    ],
    relatedGuideId: "trading-psychology-mastery",
  },
}
