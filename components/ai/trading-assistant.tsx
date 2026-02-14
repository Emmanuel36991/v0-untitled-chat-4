"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, Minimize2, Maximize2 } from "lucide-react"
import { NeuralSparkIcon } from "@/components/icons/system-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

interface TradingAssistantProps {
  initialContext?: string
}

export function TradingAssistant({ initialContext }: TradingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    // 1. Add User Message
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // 2. Prepare Assistant Message Placeholder
      const assistantMessageId = (Date.now() + 1).toString()
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
        },
      ])

      // 3. Fetch Stream
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          context: initialContext,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")
      if (!response.body) throw new Error("No response body")

      // 4. Read Stream - Fix stream parsing to handle SSE format
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let accumulatedContent = ""
      let buffer = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value, { stream: true })
        buffer += chunkValue

        const lines = buffer.split("\n")
        buffer = lines[lines.length - 1] // Keep incomplete line in buffer

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim()
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6) // Remove "data: " prefix
              if (jsonStr === "[DONE]") continue

              const json = JSON.parse(jsonStr)
              const content = json.choices?.[0]?.delta?.content || ""

              if (content) {
                accumulatedContent += content
                // Update the last message (assistant) with new content
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg)),
                )
              }
            } catch (e) {
              // Skip malformed JSON
              console.log("[v0] Skipped malformed JSON chunk")
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[0_0_40px_-10px_rgba(var(--primary-rgb,100,80,220),0.5)]",
          "bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-primary/20",
          "hover:scale-105 hover:border-primary/40 transition-all duration-300 z-50 p-0 overflow-hidden group"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 group-hover:opacity-100 transition-opacity" />
        <NeuralSparkIcon className="h-6 w-6 text-primary animate-pulse" />
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-500",
        // Glassmorphism matching AINeuralInsight
        "bg-card/80 dark:bg-card/60 backdrop-blur-2xl",
        "border border-border/50 dark:border-border/30",
        "shadow-2xl dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]",
        isExpanded ? "w-[90vw] h-[80vh] max-w-4xl rounded-2xl" : "w-[380px] h-[600px] rounded-2xl",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 dark:border-white/5 bg-white/5 dark:bg-black/5 backdrop-blur-md rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <NeuralSparkIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Trading Assistant</h3>
            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative bg-transparent">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
                <NeuralSparkIcon className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-foreground">How can I help?</h4>
                <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                  Ask me about market trends, chart patterns, or your trading performance.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4 pb-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted/80 text-foreground border border-border/50 rounded-bl-none",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted/50 rounded-2xl rounded-bl-none px-4 py-3 border border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-white/5 dark:bg-black/5 rounded-b-2xl backdrop-blur-md">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="bg-background/50 border-border/50 text-foreground focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
