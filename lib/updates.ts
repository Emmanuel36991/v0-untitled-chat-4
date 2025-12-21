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
