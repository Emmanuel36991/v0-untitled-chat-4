"use client"

import { useState, useEffect } from "react"
import { TutorialViewer } from "@/components/tutorial/tutorial-viewer"
import { TutorialProgressIndicator } from "@/components/tutorial/tutorial-progress-indicator"
import { useTutorialContext } from "@/components/tutorial/tutorial-provider"
import { TUTORIALS } from "@/types/tutorial"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, Sparkles, Play } from "lucide-react"
import Link from "next/link"

export default function TutorialsPage() {
  const { tutorialProgress, isLoading, startTutorial, getCompletionPercentage, currentTutorialId } =
    useTutorialContext()
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [selectedTutorialId, setSelectedTutorialId] = useState<string | null>(null)

  useEffect(() => {
    setCompletionPercentage(getCompletionPercentage())
  }, [tutorialProgress, getCompletionPercentage])

  useEffect(() => {
    if (currentTutorialId) {
      setSelectedTutorialId(currentTutorialId)
    }
  }, [currentTutorialId])

  const tutorials = Object.values(TUTORIALS)
  const categories = Array.from(new Set(tutorials.map((t) => t.category)))
  const completedTutorials = Object.values(tutorialProgress).filter((p) => p.status === "completed").length

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="inline-block animate-spin">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">Loading tutorials...</p>
          </div>
        </div>
      </div>
    )
  }

  if (selectedTutorialId) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => setSelectedTutorialId(null)} className="mb-4">
          Back to Tutorials
        </Button>
        <TutorialViewer tutorialId={selectedTutorialId} />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-primary font-semibold">
          <BookOpen className="h-4 w-4" />
          LEARNING CENTER
        </div>
        <h1 className="text-4xl font-bold">Interactive Tutorials</h1>
        <p className="text-lg text-muted-foreground">
          Master Concentrade with our guided tutorials. Each tutorial takes 3-5 minutes.
        </p>
      </div>

      {/* Progress Section */}
      <Card className="p-6">
        <TutorialProgressIndicator
          completionPercentage={completionPercentage}
          totalTutorials={tutorials.length}
          completedTutorials={completedTutorials}
        />
      </Card>

      {/* Tutorials by Category */}
      {categories.map((category) => {
        const categoryTutorials = tutorials.filter((t) => t.category === category)
        const categoryIcons: Record<string, string> = {
          dashboard: "📊",
          trading: "📈",
          analytics: "📉",
          psychology: "🧠",
          community: "👥",
        }

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{categoryIcons[category]}</span>
              <h2 className="text-2xl font-bold capitalize">
                {category.charAt(0).toUpperCase() + category.slice(1)} Tutorials
              </h2>
              <span className="text-sm text-muted-foreground ml-auto">
                {categoryTutorials.filter((t) => tutorialProgress[t.id]?.status === "completed").length}/
                {categoryTutorials.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTutorials.map((tutorial) => {
                const progress = tutorialProgress[tutorial.id]
                const isCompleted = progress?.status === "completed"

                return (
                  <Card
                    key={tutorial.id}
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      startTutorial(tutorial.id)
                      setSelectedTutorialId(tutorial.id)
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{tutorial.title}</h3>
                        {isCompleted && <span className="text-green-500 font-bold">✓</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{tutorial.steps.length} steps</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            startTutorial(tutorial.id)
                            setSelectedTutorialId(tutorial.id)
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* CTA Section */}
      {completionPercentage === 100 && (
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Congratulations!</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              You've completed all tutorials! You're now ready to use all of Concentrade's features. Check out our
              guides for deeper learning.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/guides">
                <Button variant="outline">Explore Guides</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Start Trading</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
