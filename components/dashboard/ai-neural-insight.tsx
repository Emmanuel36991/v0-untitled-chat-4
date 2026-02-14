"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BrainCircuit, RotateCcw, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types"

// --- Neural network background nodes ---
function NeuralBackground({ active }: { active: boolean }) {
  const nodes = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    }))
  ).current

  const connections = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      from: Math.floor(Math.random() * 18),
      to: Math.floor(Math.random() * 18),
      delay: Math.random() * 2,
    }))
  ).current

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map((conn) => {
          const from = nodes[conn.from]
          const to = nodes[conn.to]
          return (
            <motion.line
              key={`conn-${conn.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="currentColor"
              className="text-primary/[0.06] dark:text-primary/[0.1]"
              strokeWidth="0.15"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                active
                  ? {
                      pathLength: [0, 1, 1, 0],
                      opacity: [0, 0.6, 0.6, 0],
                    }
                  : { pathLength: 1, opacity: 0.3 }
              }
              transition={
                active
                  ? {
                      duration: 2.5,
                      delay: conn.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : { duration: 1 }
              }
            />
          )
        })}
        {nodes.map((node) => (
          <motion.circle
            key={`node-${node.id}`}
            cx={node.x}
            cy={node.y}
            r={node.size}
            className="fill-primary/[0.08] dark:fill-primary/[0.15]"
            animate={
              active
                ? {
                    r: [node.size, node.size * 1.8, node.size],
                    opacity: [0.3, 0.8, 0.3],
                  }
                : {
                    r: node.size,
                    opacity: 0.4,
                  }
            }
            transition={{
              duration: node.duration,
              delay: node.delay,
              repeat: active ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

// --- Scanning line effect ---
function ScanLine({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <motion.div
      className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none z-10"
      initial={{ top: "0%" }}
      animate={{ top: ["0%", "100%", "0%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    />
  )
}

// --- Pulsing ring around the brain icon ---
function PulseRing({ active }: { active: boolean }) {
  return (
    <div className="relative">
      {active && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/30"
            animate={{ scale: [1, 1.8, 2.2], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/20"
            animate={{ scale: [1, 1.5, 1.9], opacity: [0.4, 0.15, 0] }}
            transition={{
              duration: 2,
              delay: 0.6,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </>
      )}
      <motion.div
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-full",
          "bg-gradient-to-br from-primary/20 to-primary/5",
          "border border-primary/20 dark:border-primary/30",
          "shadow-[0_0_15px_rgba(var(--primary-rgb,100,80,220),0.15)]"
        )}
        animate={active ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
      >
        <BrainCircuit
          className={cn(
            "w-5 h-5 text-primary",
            active && "animate-pulse"
          )}
        />
      </motion.div>
    </div>
  )
}

// --- Streaming text display ---
function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  return (
    <div className="relative">
      <p className="text-[15px] leading-relaxed text-foreground/90 font-medium tracking-[-0.01em]">
        {text}
        {isStreaming && (
          <motion.span
            className="inline-block w-[2px] h-[1.1em] bg-primary ml-0.5 align-text-bottom"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
      </p>
    </div>
  )
}

// --- State label chips ---
function StateChip({
  state,
}: {
  state: "idle" | "thinking" | "streaming" | "done" | "error"
}) {
  const config = {
    idle: { label: "Neural Link Ready", color: "text-muted-foreground" },
    thinking: { label: "Analyzing Patterns", color: "text-primary" },
    streaming: { label: "Transmitting", color: "text-primary" },
    done: { label: "Insight Locked", color: "text-emerald-500 dark:text-emerald-400" },
    error: { label: "Signal Lost", color: "text-destructive" },
  }
  const { label, color } = config[state]

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center justify-center w-1.5 h-1.5">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            state === "thinking" || state === "streaming"
              ? "bg-primary animate-pulse"
              : state === "done"
                ? "bg-emerald-500"
                : state === "error"
                  ? "bg-destructive"
                  : "bg-muted-foreground/40"
          )}
        />
      </div>
      <span className={cn("text-[10px] font-semibold uppercase tracking-[0.08em]", color)}>
        {label}
      </span>
    </div>
  )
}

// ==========================
// MAIN COMPONENT
// ==========================

interface AINeuralInsightProps {
  trades: Trade[]
}

export function AINeuralInsight({ trades }: AINeuralInsightProps) {
  const [state, setState] = useState<"idle" | "thinking" | "streaming" | "done" | "error">("idle")
  const [insightText, setInsightText] = useState("")
  const [hasFetched, setHasFetched] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const hasEnoughData = trades.length >= 3

  const fetchInsight = useCallback(async () => {
    if (!hasEnoughData) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState("thinking")
    setInsightText("")

    // brief pause so the "thinking" animation is visible
    await new Promise((r) => setTimeout(r, 1200))

    try {
      const recentTrades = trades.slice(0, 20).map((t) => ({
        date: t.date,
        instrument: t.instrument,
        direction: t.direction,
        entry_price: t.entry_price,
        exit_price: t.exit_price,
        stop_loss: t.stop_loss,
        pnl: t.pnl,
        outcome: t.outcome,
        duration_minutes: t.duration_minutes,
        setup_name: t.setup_name,
        psychology_factors: t.psychology_factors,
        good_habits: t.good_habits,
        notes: t.notes,
      }))

      const response = await fetch("/api/ai/dashboard-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trades: recentTrades }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error("Failed to fetch insight")
      }

      setState("streaming")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      const decoder = new TextDecoder()
      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        // Parse SSE-style Groq stream
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            if (data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                fullText += content
                setInsightText(fullText)
              }
            } catch {
              // skip unparseable chunks
            }
          }
        }
      }

      setState("done")
      setHasFetched(true)
    } catch (err: any) {
      if (err?.name === "AbortError") return
      console.error("Neural insight error:", err)
      setState("error")
      setInsightText("Neural link interrupted. Tap to reconnect.")
    }
  }, [trades, hasEnoughData])

  // Auto-fetch on mount if enough data
  useEffect(() => {
    if (hasEnoughData && !hasFetched && state === "idle") {
      fetchInsight()
    }
  }, [hasEnoughData, hasFetched, state, fetchInsight])

  // cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const isActive = state === "thinking" || state === "streaming"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="relative group"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl transition-all duration-500",
          // Glassmorphism base
          "bg-card/60 dark:bg-card/40 backdrop-blur-xl",
          // Border
          "border border-border/50 dark:border-border/30",
          // Shadow — glows when active
          isActive
            ? "shadow-[0_0_40px_-8px_rgba(var(--primary-rgb,100,80,220),0.2)] dark:shadow-[0_0_50px_-8px_rgba(var(--primary-rgb,100,80,220),0.3)]"
            : "shadow-lg dark:shadow-2xl",
          // Hover lift
          "hover:shadow-xl dark:hover:shadow-[0_0_30px_-6px_rgba(var(--primary-rgb,100,80,220),0.15)]",
          "hover:-translate-y-0.5 transition-transform duration-300"
        )}
      >
        {/* Neural background */}
        <NeuralBackground active={isActive} />

        {/* Scan line */}
        <ScanLine active={isActive} />

        {/* Top edge glow */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-[1px]",
            "bg-gradient-to-r from-transparent via-primary/30 to-transparent",
            isActive && "via-primary/60"
          )}
        />

        {/* Content */}
        <div className="relative z-20 p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <PulseRing active={isActive} />
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  Neural Insight
                </h3>
                <StateChip state={state} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(state === "done" || state === "error") && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setHasFetched(false)
                    setState("idle")
                    setInsightText("")
                    setTimeout(() => fetchInsight(), 100)
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold",
                    "bg-primary/10 hover:bg-primary/15 text-primary",
                    "border border-primary/20 hover:border-primary/30",
                    "transition-colors duration-200"
                  )}
                >
                  <RotateCcw className="w-3 h-3" />
                  Re-analyze
                </motion.button>
              )}
              <Sparkles
                className={cn(
                  "w-4 h-4",
                  isActive
                    ? "text-primary animate-pulse"
                    : "text-muted-foreground/30"
                )}
              />
            </div>
          </div>

          {/* Insight body */}
          <AnimatePresence mode="wait">
            {!hasEnoughData ? (
              <motion.div
                key="no-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-3"
              >
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Need at least 3 trades to activate the neural link.
                  Keep logging entries to unlock AI pattern detection.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 rounded-full flex-1 transition-colors duration-500",
                        i < trades.length
                          ? "bg-primary/60"
                          : "bg-muted-foreground/10"
                      )}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium">
                  {trades.length}/3 trades logged
                </p>
              </motion.div>
            ) : state === "thinking" ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary/60 rounded-full"
                        animate={{ height: [8, 20, 8] }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.12,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Scanning {Math.min(trades.length, 20)} trades for hidden patterns...
                  </p>
                </div>
              </motion.div>
            ) : (state === "streaming" || state === "done") && insightText ? (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-2"
              >
                <StreamingText
                  text={insightText}
                  isStreaming={state === "streaming"}
                />
              </motion.div>
            ) : state === "error" ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-3"
              >
                <p className="text-sm text-destructive/80 font-medium">
                  {insightText || "Connection lost. Tap re-analyze to try again."}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Bottom ambient bar */}
          <motion.div
            className="mt-3 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            animate={
              isActive
                ? { opacity: [0.3, 0.7, 0.3], scaleX: [0.8, 1, 0.8] }
                : { opacity: 0.2, scaleX: 1 }
            }
            transition={
              isActive
                ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.5 }
            }
          />
        </div>
      </div>
    </motion.div>
  )
}
