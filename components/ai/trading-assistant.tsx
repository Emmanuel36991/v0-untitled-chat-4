"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, Minimize2, Maximize2, User } from "lucide-react"
import { SparkIcon } from "@/components/icons/system-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

// Helper to format message content with basic markdown (bold, lists)
const formatMessageContent = (content: string) => {
  return content.split("\n").map((line, i) => {
    const isList = line.trim().match(/^[-*]\s/)
    const cleanLine = isList ? line.trim().replace(/^[-*]\s/, "") : line

    // Parse Bold: **text**
    const parts = cleanLine.split(/(\*\*.*?\*\*)/g)
    const formattedLine = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold text-indigo-300">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })

    if (isList) {
      return (
        <div key={i} className="flex gap-2 ml-1 my-0.5">
          <span className="text-indigo-400/70 select-none mt-0.5">•</span>
          <span className="flex-1">{formattedLine}</span>
        </div>
      )
    }

    return (
      <div key={i} className={cn("min-h-[1.2em]", line.trim() === "" ? "h-3" : "")}>
        {formattedLine}
      </div>
    )
  })
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-slate-900 border border-slate-700/50 hover:scale-105 hover:bg-slate-800 transition-all duration-300 z-50 p-0 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 group-hover:opacity-100 transition-opacity" />
        <SparkIcon className="h-6 w-6 text-indigo-400" />
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col bg-slate-950 border border-slate-800/60 shadow-2xl transition-all duration-300",
        isExpanded ? "w-[90vw] h-[80vh] max-w-4xl rounded-xl" : "w-[420px] h-[640px] rounded-2xl",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50 bg-slate-950 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <SparkIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight">Concentrade AI</h3>
            <p className="text-2xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative bg-slate-950">
        <ScrollArea className="h-full px-5 py-4" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/15 mb-2">
                <SparkIcon className="w-7 h-7 text-indigo-400/80" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-medium text-slate-200 text-base">What are we working on?</h4>
                <p className="text-sm text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                  Ask about your performance, risk management, or market setups.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6 pb-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex w-full gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                {/* AI Avatar */}
                {m.role === "assistant" && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <SparkIcon className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-3 text-[0.8125rem] leading-relaxed",
                    m.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900/50 text-slate-200 border border-slate-800/60 rounded-2xl rounded-tl-sm",
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="space-y-0.5 text-left">{formatMessageContent(m.content)}</div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>

                {/* User Avatar */}
                {m.role === "user" && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-indigo-300" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <SparkIcon className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-800/60">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="px-5 py-4 border-t border-slate-800/50 bg-slate-950 rounded-b-2xl">
        <form onSubmit={handleSend} className="flex gap-2.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your trading..."
            className="bg-slate-900/60 border-slate-800/60 text-slate-200 text-sm focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder:text-slate-600 rounded-xl h-10"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-10 w-10 p-0 transition-colors disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
