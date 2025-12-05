"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

interface TutorialWelcomeModalProps {
  open: boolean
  onClose: () => void
  onStartDashboardTutorial: () => void
}

export function TutorialWelcomeModal({ open, onClose, onStartDashboardTutorial }: TutorialWelcomeModalProps) {
  const [step, setStep] = useState<"welcome" | "benefits">("welcome")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Welcome to Concentrade</DialogTitle>
          </motion.div>
          <DialogDescription>Let's get you started on the right path</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Your Trading Dashboard Awaits
                </h3>
                <p className="text-sm text-muted-foreground">
                  We've built Concentrade to help you track, analyze, and improve your trading performance. Our
                  interactive tutorials will guide you through everything.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-lg p-4 space-y-2 text-center"
                >
                  <span className="text-2xl">🎯</span>
                  <p className="text-xs font-semibold">Guided Tours</p>
                  <p className="text-xs text-muted-foreground">Step-by-step walkthroughs</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-lg p-4 space-y-2 text-center"
                >
                  <span className="text-2xl">⏱️</span>
                  <p className="text-xs font-semibold">Quick Setup</p>
                  <p className="text-xs text-muted-foreground">3-5 min per tutorial</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-lg p-4 space-y-2 text-center"
                >
                  <span className="text-2xl">📈</span>
                  <p className="text-xs font-semibold">Track Progress</p>
                  <p className="text-xs text-muted-foreground">See what you've learned</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-lg p-4 space-y-2 text-center"
                >
                  <span className="text-2xl">🎓</span>
                  <p className="text-xs font-semibold">Earn Badges</p>
                  <p className="text-xs text-muted-foreground">Unlock achievements</p>
                </motion.div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Skip for Now
                </Button>
                <Button onClick={() => setStep("benefits")} className="flex-1 gap-2">
                  Let's Go
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "benefits" && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Dashboard Overview</p>
                    <p className="text-xs text-muted-foreground">
                      Understand your key metrics, trading stats, and performance overview
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Log Your First Trade</p>
                    <p className="text-xs text-muted-foreground">
                      Learn to record trades with entry/exit, psychology metrics, and analysis
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Explore Advanced Features</p>
                    <p className="text-xs text-muted-foreground">
                      Discover analytics, psychology tracking, and community insights
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-900 dark:text-blue-200">
                  <strong>Tip:</strong> You can skip tutorials anytime and restart them from the settings menu.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Skip Intro
                </Button>
                <Button onClick={onStartDashboardTutorial} className="flex-1 gap-2">
                  Start Tutorial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
