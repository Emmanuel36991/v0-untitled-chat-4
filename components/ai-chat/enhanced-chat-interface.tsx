"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ChatSuggestions } from "./chat-suggestions"
import { PerformanceWidget } from "./performance-widget"
import {
  Send,
  Bot,
  User,
  TrendingUp,
  Zap,
  RefreshCw,
  Minimize2,
  Maximize2,
  MessageSquare,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChat } from "@ai-sdk/react" // Fixed: Import useChat

interface EnhancedChatInterfaceProps {
  className?: string
  compact?: boolean
}

export function EnhancedChatInterface({ className, compact = false }: EnhancedChatInterfaceProps) {
  // Fixed: Use useChat hook instead of manual fetch
  const { messages, input, setInput, handleSubmit, isLoading, error, append } = useChat({
    api: "/api/ai-chat", // Fixed: Point to the correct API route
    initialMessages: [],
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isMinimized, setIsMinimized] = useState(compact)
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Auto-scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        requestAnimationFrame(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: "smooth",
          })
        })
      }
    }
  }, [messages, isLoading])

  const handleSuggestedPrompt = (prompt: string) => {
    // Fixed: Use append to immediately send the suggested prompt
    setShowSuggestions(false)
    append({
      role: "user",
      content: prompt,
    })
  }

  // Fixed: Wrapper to handle suggestion visibility on submit
  const onSubmitWrapper = (e: React.FormEvent<HTMLFormElement>) => {
    setShowSuggestions(false)
    handleSubmit(e)
  }

  if (isMinimized) {
    return (
      <Card
        className={cn(
          "w-80 h-16 fixed bottom-4 right-4 z-50 shadow-xl border-0 bg-gradient-to-r from-blue-500 to-purple-500",
          className,
        )}
      >
        <CardContent className="p-0 h-full">
          <button
            onClick={() => setIsMinimized(false)}
            className="w-full h-full flex items-center justify-between px-4 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5" />
              <span className="font-medium">TradeGPT Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {messages.length}
                </Badge>
              )}
              <Maximize2 className="h-4 w-4" />
            </div>
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("flex gap-6", className)}>
      {/* Main Chat Interface */}
      <Card className="flex-1 flex flex-col h-[700px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Bot className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3>TradeGPT Assistant</h3>
              <p className="text-sm text-white/80 font-normal">
                Powered by Groq • Llama 3.3 • Personalized trading insights
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Zap className="h-3 w-3 mr-1" />
                AI Coach
              </Badge>
              {compact && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(true)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Welcome to TradeGPT! 👋
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    I'm your AI trading coach, ready to analyze your performance and provide personalized
                    recommendations.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-4", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                    )}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">TradeGPT is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="text-sm text-red-700 dark:text-red-300">{error.message}</div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggestions */}
          {showSuggestions && messages.length === 0 && (
            <div className="px-6 pb-4">
              <ChatSuggestions onSuggestionClick={handleSuggestedPrompt} />
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <form onSubmit={onSubmitWrapper} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about your trading performance, strategies, or get personalized advice..."
                className="flex-1 h-12 border-2 focus:border-blue-500 bg-white dark:bg-slate-900"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
              TradeGPT analyzes your actual trading data to provide personalized insights
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar with Performance Widget */}
      <div className="w-80 space-y-6">
        <PerformanceWidget />

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSuggestedPrompt("Analyze my recent trading performance")}
              className="w-full justify-start text-left h-auto py-2"
            >
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              <div>
                <div className="font-medium">Performance Review</div>
                <div className="text-xs text-slate-500">Analyze recent trades</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSuggestedPrompt("What should I focus on to improve my trading?")}
              className="w-full justify-start text-left h-auto py-2"
            >
              <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
              <div>
                <div className="font-medium">Improvement Plan</div>
                <div className="text-xs text-slate-500">Get actionable advice</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
