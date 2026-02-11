"use client"

import { useState, useEffect } from "react"
import { X, Brain, Copy, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdvisorPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  type: "trade" | "statistic"
  data: any
  context?: string
}

export function AdvisorPanel({ isOpen, onClose, title, type, data, context }: AdvisorPanelProps) {
  const [analysis, setAnalysis] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setAnalysis("")
      fetchAnalysis()
    }
  }, [isOpen, type, data])

  const fetchAnalysis = async () => {
    setLoading(true)
    setError(null)
    setAnalysis("")

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data, context }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ""
      let buffer = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const jsonStr = line.slice(6)
                const data = JSON.parse(jsonStr)
                if (data.choices?.[0]?.delta?.content) {
                  fullText += data.choices[0].delta.content
                  setAnalysis(fullText)
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unable to generate analysis"
      setError(errorMsg)
      console.error("[Advisor Error]", err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysis)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative ml-auto w-full max-w-2xl h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-l border-slate-700/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative z-10 px-6 py-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <p className="text-xs text-slate-400">Powered by Groq AI • Llama 3.3</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && !analysis ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-3">
                <div className="flex gap-2 justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
                <p className="text-sm text-slate-400">Groq is analyzing...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <p className="text-sm text-red-400">{error}</p>
                <Button size="sm" onClick={fetchAnalysis} className="bg-blue-600 hover:bg-blue-700">
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Analysis Content */}
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                {analysis.split("\n\n").map((section, idx) => (
                  <div key={idx}>
                    {section.startsWith("**") || section.match(/^\d+\./) ? (
                      <div>
                        <h3 className="font-bold text-white mb-2">{section.replace(/\*\*/g, "")}</h3>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{section}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Analysis
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={fetchAnalysis}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
