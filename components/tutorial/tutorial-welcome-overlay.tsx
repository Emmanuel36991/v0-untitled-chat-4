"use client"

import { useState } from "react"
import { X, Sparkles, Zap, BookOpen, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTutorialContext } from "./tutorial-provider"

interface TutorialWelcomeOverlayProps {
  onClose: () => void
}

export function TutorialWelcomeOverlay({ onClose }: TutorialWelcomeOverlayProps) {
  const { startTutorial } = useTutorialContext()
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null)

  const tutorials = [
    {
      id: "dashboard-welcome",
      icon: Sparkles,
      title: "Dashboard Tour",
      description: "Get oriented with the dashboard",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "first-trade-guide",
      icon: Zap,
      title: "Log Your First Trade",
      description: "Step-by-step trading guide",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "analytics-dashboard",
      icon: BookOpen,
      title: "Understanding Analytics",
      description: "Deep dive into your stats",
      color: "from-pink-500 to-pink-600",
    },
    {
      id: "psychology-tracker",
      icon: Brain,
      title: "Trading Psychology",
      description: "Master your emotions",
      color: "from-emerald-500 to-emerald-600",
    },
  ]

  const handleStartTutorial = async (tutorialId: string) => {
    setSelectedTutorial(tutorialId)
    await startTutorial(tutorialId)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in-up">
      <Card className="max-w-2xl w-full bg-white dark:bg-slate-900 border-0 shadow-2xl overflow-hidden animate-scale-in">
        {/* Animated header background */}
        <div className="relative h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -top-48 -right-48 animate-pulse" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="absolute inset-0 flex items-center justify-start px-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                <Sparkles className="h-8 w-8 animate-bounce" />
                <span>Welcome to Concentrade!</span>
              </h2>
              <p className="text-white/80 text-sm">Choose a tutorial to get started</p>
            </div>
          </div>
        </div>

        {/* Tutorial cards */}
        <div className="p-6 space-y-4">
          {tutorials.map((tutorial, index) => {
            const Icon = tutorial.icon
            return (
              <button
                key={tutorial.id}
                onClick={() => handleStartTutorial(tutorial.id)}
                disabled={selectedTutorial !== null}
                className={cn(
                  "w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-transparent",
                  "transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-left",
                  "bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-slate-800 dark:hover:to-slate-800",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  `stagger-${index + 1}`,
                )}
                style={{
                  animation: `slideAndFade 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                  animationDelay: `${index * 100}ms`,
                  opacity: 0,
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn("p-3 rounded-lg shadow-lg bg-gradient-to-br", tutorial.color)}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">{tutorial.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{tutorial.description}</p>
                  </div>
                  <div className="text-2xl text-slate-300 dark:text-slate-600">→</div>
                </div>
              </button>
            )
          })}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={selectedTutorial !== null}
              className="w-full transition-all duration-200 bg-transparent"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
