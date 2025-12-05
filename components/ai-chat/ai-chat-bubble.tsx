"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Sparkles,
  TrendingUp,
  BarChart3,
  Navigation,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  type?: "text" | "suggestion"
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  prompt: string
  category: "navigation" | "trading" | "analytics"
}

const quickActions: QuickAction[] = [
  {
    id: "nav-trades",
    label: "View My Trades",
    icon: <TrendingUp className="h-4 w-4" />,
    prompt: "Show me my recent trades and performance",
    category: "navigation",
  },
  {
    id: "nav-analytics",
    label: "Analytics Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    prompt: "Take me to my analytics dashboard",
    category: "navigation",
  },
  {
    id: "trading-advice",
    label: "Trading Advice",
    icon: <Sparkles className="h-4 w-4" />,
    prompt: "Give me personalized trading advice based on my performance",
    category: "trading",
  },
  {
    id: "site-help",
    label: "Site Navigation",
    icon: <Navigation className="h-4 w-4" />,
    prompt: "Help me navigate the site and find features",
    category: "navigation",
  },
]

export function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your trading assistant. I can help you navigate the site, analyze your trades, and provide personalized insights. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  // --- RETRY LOGIC WRAPPER ---
  const fetchWithRetry = async (url: string, options: any, retries = 3, backoff = 1000) => {
    try {
      const res = await fetch(url, options)
      // If rate limited (429), throw error to trigger catch block retry
      if (res.status === 429) throw new Error("Rate limited")
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
      return res
    } catch (err) {
      if (retries > 1) {
        console.warn(`Fetch failed, retrying in ${backoff}ms...`, err)
        await new Promise((resolve) => setTimeout(resolve, backoff))
        return fetchWithRetry(url, options, retries - 1, backoff * 2)
      }
      throw err
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetchWithRetry("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages.slice(-4), { content, role: "user" }],
        }),
      })

      console.log("[v0] Streaming response received")

      // Handle text stream manually if using raw fetch on client
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ""

      if (reader) {
        // Create placeholder message
        const messageId = (Date.now() + 1).toString()
        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            content: "",
            role: "assistant",
            timestamp: new Date(),
          },
        ])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          console.log("[v0] Stream chunk:", chunk.slice(0, 50))

          // AI SDK data stream format: 0:"content"\n
          // Parse data tokens properly
          const dataMatches = chunk.match(/0:"([^"\\]|\\.)*"/g) || []
          for (const match of dataMatches) {
            const content = match.slice(3, -1).replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\")
            aiResponse += content
          }

          // Update the last message in place
          setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content: aiResponse } : msg)))
        }
      } else {
        // Fallback for non-stream response
        const data = await response.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: typeof data === "string" ? data : JSON.stringify(data),
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error instanceof Error ? error.message : "Connection failed"}. Make sure the chatbot is properly configured.`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt)
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
            "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
            "border-2 border-white/20 backdrop-blur-sm",
            "hover:scale-110",
          )}
        >
          <MessageCircle className="h-6 w-6 text-white" />
          <span className="sr-only">Open AI Chat</span>
        </Button>

        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse">
          <span className="sr-only">New messages</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        className={cn(
          "w-96 shadow-2xl border-0 overflow-hidden transition-all duration-300",
          "bg-white/95 backdrop-blur-xl",
          isMinimized ? "h-16" : "h-[600px]",
        )}
      >
        {/* Header */}
        <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-white/30">
                  <AvatarFallback className="bg-white/20 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Trading Assistant</h3>
                <p className="text-xs text-white/80">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[536px]">
            {/* Quick Actions */}
            <div className="p-4 border-b bg-gray-50/50">
              <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="h-8 text-xs hover:bg-blue-50 hover:border-blue-200"
                  >
                    {action.icon}
                    <span className="ml-1">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto"
                          : "bg-gray-100 text-gray-900",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-1 opacity-70",
                          message.role === "user" ? "text-white/70" : "text-gray-500",
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-gray-600 text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.3s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.6s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about trading or navigation..."
                  disabled={isLoading}
                  className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI responses may not always be accurate. Verify important information.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
