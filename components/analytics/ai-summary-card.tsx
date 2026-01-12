"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, RefreshCw } from "lucide-react"
import { getPeriodStatistics } from "@/app/actions/analytics-actions"
import { motion, AnimatePresence } from "framer-motion"

// --- Lightweight Markdown Parser ---
// This component converts raw AI text into styled HTML elements
const SimpleMarkdown = ({ content }: { content: string }) => {
  if (!content) return null;

  // Split content by newlines to process block by block
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: React.ReactNode[] = [];
  let inList = false;

  const flushList = () => {
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1 mb-4">
          {currentList}
        </ul>
      );
      currentList = [];
      inList = false;
    }
  };

  const parseInline = (text: string) => {
    // Split by **bold** markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return; // Skip empty lines but flush lists
    }

    // Headers (## Title)
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={i} className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-2">
          {trimmed.replace(/^##\s+/, '')}
        </h3>
      );
    } 
    // Sub-headers (### Title)
    else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={i} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">
          {trimmed.replace(/^###\s+/, '')}
        </h4>
      );
    }
    // Bullet Lists (- Item or * Item)
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      currentList.push(
        <li key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {parseInline(trimmed.replace(/^[-*]\s+/, ''))}
        </li>
      );
    }
    // Numbered Lists (1. Item)
    else if (/^\d+\.\s/.test(trimmed)) {
        flushList();
        elements.push(
            <div key={i} className="flex gap-2 mb-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-bold min-w-[20px] text-indigo-600 dark:text-indigo-400">{trimmed.match(/^\d+\./)?.[0]}</span>
                <span>{parseInline(trimmed.replace(/^\d+\.\s/, ''))}</span>
            </div>
        )
    }
    // Regular Paragraphs
    else {
      flushList();
      elements.push(
        <p key={i} className="mb-2 text-slate-700 dark:text-slate-300 leading-relaxed">
          {parseInline(trimmed)}
        </p>
      );
    }
  });

  flushList(); // Final flush

  return <div className="text-sm">{elements}</div>;
};

export function AiSummaryCard() {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState("")

  const generateAnalysis = async () => {
    setLoading(true)
    setAnalysis("")
    try {
      const stats = await getPeriodStatistics()
      
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summary",
          data: stats
        })
      })

      if (!response.ok) throw new Error("Analysis failed")
      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed === "data: [DONE]") continue
            
            if (trimmed.startsWith("data: ")) {
                try {
                    const jsonStr = trimmed.substring(6)
                    const json = JSON.parse(jsonStr)
                    const content = json.choices?.[0]?.delta?.content || ""
                    setAnalysis(prev => prev + content)
                } catch (e) {
                    console.error("Error parsing SSE JSON", e)
                }
            }
        }
      }
    } catch (error) {
      console.error(error)
      setAnalysis("Failed to generate analysis. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mb-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Performance Report
            </CardTitle>
            <CardDescription>
              Generate a comprehensive analysis of your Daily, Weekly, Monthly, and Yearly trading performance.
            </CardDescription>
          </div>
          <Button onClick={generateAnalysis} disabled={loading} className="shrink-0 gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {analysis ? "Update Report" : "Generate Report"}
          </Button>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {(analysis || loading) && (
            <CardContent>
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-background/50 p-6 rounded-lg border shadow-sm"
            >
                {loading && !analysis ? (
                    <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing market data...
                    </div>
                ) : (
                    <SimpleMarkdown content={analysis} />
                )}
            </motion.div>
            </CardContent>
        )}
      </AnimatePresence>
    </Card>
  )
}
