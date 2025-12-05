"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, TrendingUp, Target, Brain, Lightbulb, BarChart3, Shield, Zap, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChat } from "@ai-sdk/react"

interface ChatInterfaceProps {
  className?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const SUGGESTED_PROMPTS = [
  {
    icon: TrendingUp,
    text: "Analyze my recent trading performance",
    color: "text-green-600",
  },
  {
    icon: Target,
    text: "What's my best trading setup and why?",
    color: "text-blue-600",
  },
  {
    icon: Shield,
    text: "How can I improve my risk management?",
    color: "text-orange-600",
  },
  {
    icon: Brain,
    text: "What trading psychology tips do you have for me?",
    color: "text-purple-600",
  },
  {
    icon: BarChart3,
    text: "Suggest strategies to improve my win rate",
    color: "text-indigo-600",
  },
  {
    icon: Lightbulb,
    text: "What should I focus on next in my trading?",
    color: "text-yellow-600",
  },
]

export function ChatInterface({ className }: ChatInterfaceProps) {
  const { messages, input, setInput, handleSubmit, isLoading, error } = useChat({
    api: "/api/ai-chat",
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)

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
    setInput(prompt)
  }

  return (
    <Card
      className={cn(
        "flex flex-col h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl",
        className,
      )}
    >
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3>TradeGPT Assistant</h3>
            <p className="text-sm text-white/80 font-normal">Powered by Llama 3.3 • Personalized trading insights</p>
          </div>
          <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
            <Zap className="h-3 w-3 mr-1" />
            AI Coach
          </Badge>
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
                  I'm your AI trading coach, ready to analyze your performance and provide personalized recommendations.
                </p>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt.text)}
                      className="p-4 text-left rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <prompt.icon className={cn("h-5 w-5", prompt.color)} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          {prompt.text}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
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
                    <span className="text-xs text-slate-500 dark:text-slate-400">TradeGPT is thinking...</span>
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

        {/* Input Area */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-3">
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
  )
}
