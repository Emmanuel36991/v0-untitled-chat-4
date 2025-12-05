"use client"

import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { CheckCircle2, Award } from "lucide-react"

interface TutorialBadgeProps {
  title: string
  description: string
  isCompleted: boolean
  completionReward?: string
}

export function TutorialBadge({ title, description, isCompleted, completionReward }: TutorialBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="cursor-help">
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative w-10 h-10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full animate-pulse" />
                <div className="absolute inset-1 bg-card rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </motion.div>
            ) : (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{title}</p>
            <p className="text-xs">{description}</p>
            {isCompleted && completionReward && (
              <p className="text-xs text-yellow-400 font-semibold">Unlocked: {completionReward}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
