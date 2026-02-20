"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ConcentradeLogo } from "@/components/concentrade-logo"

const LOADING_MESSAGES = [
  "Connecting to your workspace...",
  "Syncing trade data...",
  "Analyzing behavioral patterns...",
  "Preparing your dashboard...",
]

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-background overflow-hidden">
      {/* Dynamic ambient background */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.08)_0%,transparent_50%)]"
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
        >
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <ConcentradeLogo size={88} variant="icon" className="drop-shadow-2xl" />
          </motion.div>
        </motion.div>

        {/* Sleek Progress Bar Container */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 140, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          className="h-1.5 rounded-full overflow-hidden bg-muted/40 backdrop-blur-sm border border-white/5 relative"
        >
          {/* Moving gradient shimmer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/80 to-transparent"
          />
        </motion.div>

        <div className="flex flex-col items-center gap-2 min-h-[2.5rem] w-[300px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-sm tracking-tight text-muted-foreground font-medium text-center"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
