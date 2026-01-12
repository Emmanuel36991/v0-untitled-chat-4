export type EventImpact = "high" | "medium" | "low"
export type EventCategory =
  | "interest-rate"
  | "inflation"
  | "employment"
  | "gdp"
  | "manufacturing"
  | "retail"
  | "housing"
  | "other"

export interface EconomicEvent {
  id: string
  title: string
  date: Date
  time: string
  country: string
  countryCode: string
  category: EventCategory
  impact: EventImpact
  description: string
  previous?: string
  forecast?: string
  actual?: string
  currency: string
}

export interface EconomicCalendarFilters {
  impact?: EventImpact[]
  dateFrom?: string
  dateTo?: string
  category?: EventCategory[]
  country?: string[]
}
