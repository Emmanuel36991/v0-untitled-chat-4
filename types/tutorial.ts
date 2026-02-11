export type GuideCategory = "Getting Started" | "The Psychology Engine" | "Advanced Features" | "Other"

export interface Guide {
    id: string
    slug: string
    title: string
    content: string // Markdown content
    category: GuideCategory
    imageUrl?: string
    readTime?: number // Minutes
    difficulty?: "beginner" | "intermediate" | "advanced"
    featured?: boolean
    description?: string // Short summary for card
}

