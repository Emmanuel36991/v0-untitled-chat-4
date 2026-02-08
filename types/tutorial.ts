export interface TutorialStep {
    id: string
    title: string
    description: string
    targetSelector?: string // CSS selector for the element to highlight
    position?: "top" | "bottom" | "left" | "right" | "center"
}

export interface Tutorial {
    id: string
    steps: TutorialStep[]
}
