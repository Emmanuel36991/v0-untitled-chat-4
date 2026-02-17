export interface AppUpdate {
  id: string
  title: string
  date: string
  tag: "Feature" | "Fix" | "Announcement"
  description: string
  highlights?: string[]
}

export const APP_UPDATES: AppUpdate[] = [
  {
    id: "v2.3-import-guide-quick-trade-psychology",
    title: "Import Guide, Quick Trade & Psychology Fixes",
    date: "Feb 2026",
    tag: "Feature",
    description: "New guide for importing trades and connecting brokers, Quick Trade form fix, Psychology analytics visibility fixes, and Alpaca integration improvements.",
    highlights: [
      "Import & Connect guide: Step-by-step CSV import for Tradovate, Thinkorswim, TradingView, Interactive Brokers, Rithmic, NinjaTrader, and generic CSV; plus full Alpaca API connection instructions",
      "Quick Trade form: Optional stop loss so you can log trades from the quick entry without entering a stop; form now submits successfully",
      "Psychology page: Fixed journal date display (no more wrong-year bug); Psychometric Profile radar, Mood Trend line, State Distribution pie, and Top Triggers bars now clearly visible on dark theme",
      "Alpaca: Connect via API Key + Secret (Paper or Live), verify account, and sync trade history into Concentrade from the Connect Broker modal",
      "CSV import: Auto-detect broker format or pick Tradovate, Thinkorswim, TradingView, IBKR, Rithmic, NinjaTrader, or Generic; links to the new guide from Import and Connect Broker dialogs",
      "Guides: New 'Import & Connect' entry on the Guides page and linked from Trades (Import dialog and Connect Broker modal)"
    ]
  },
  {
    id: "v2.2-currency-conversion",
    title: "Multi-Currency Dashboard",
    date: "Feb 08, 2026",
    tag: "Feature",
    description: "View your P&L in 7 major currencies with intelligent display formats. Switch between Dollar, Percentage, Points, Pips, Ticks, R-Multiple, and Privacy mode.",
    highlights: [
      "7 Currencies: USD, EUR, GBP, JPY, CAD, AUD, CHF with live exchange rates",
      "Privacy Mode: Mask values when sharing screens or taking screenshots",
      "R-Multiple Display: See trades as risk-reward multiples",
      "Instrument-Aware: Correctly handles NQ, ES, forex, and all instruments",
      "Smart Formatting: Automatic tick/pip/point calculations per instrument"
    ]
  },
  {
    id: "v2.1-analytics-redesign",
    title: "Analytics Page Redesign",
    date: "Feb 08, 2026",
    tag: "Feature",
    description: "Complete visual overhaul of the Analytics page with modern OKLCH colors, spacious intelligence tab, and enhanced data visualization.",
    highlights: [
      "OKLCH Color System: Professional gradient backgrounds and modern palette",
      "Redesigned Intelligence Tab: Spacious layout with improved visual hierarchy",
      "Enhanced Metric Cards: Gradient backgrounds with smooth hover effects",
      "Improved Psychology Cards: Prominent display of good/bad trading habits",
      "Better Spacing: Generous breathing room throughout for improved readability"
    ]
  },
  {
    id: "v2.0-grand-strategy",
    title: "The Grand Strategy Update",
    date: "Dec 21, 2024",
    tag: "Feature",
    description: "A complete overhaul of how strategies are managed. The static concept lists are gone, replaced by a dynamic Playbook engine.",
    highlights: [
      "Unified Strategy Database: Default and Custom strategies now live together.",
      "Visual Logic Builder: Define Setup, Confirmation, and Execution rules visually.",
      "Rule-Based Analytics: Track win rates on a per-rule basis.",
      "New Dashboard UI: High-contrast, professional aesthetic."
    ]
  },
  {
    id: "v1.5-risk-calc",
    title: "Live Risk Calculator",
    date: "Dec 15, 2024",
    tag: "Feature",
    description: "Added a real-time risk/reward calculator directly into the trade entry form.",
    highlights: [
      "Dynamic Position Sizing",
      "R:R Visualization Meter",
      "Live PnL Estimation"
    ]
  }
]

export const LATEST_UPDATE_ID = APP_UPDATES[0].id
