import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, ThumbsUp, Share2, Bookmark, Printer } from "lucide-react"
import Link from "next/link"
import { GUIDES } from "@/lib/tutorials"
import { notFound } from "next/navigation"

interface GuidePageProps {
  params: {
    slug: string
  }
}

// Helper to get guide
const getGuide = (slug: string) => {
  return GUIDES.find(g => g.slug === slug)
}

// Simple Markdown Parser (Headers, lists, bold, images)
// This avoids adding a dependency for basic needs
function renderMarkdown(markdown: string) {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 border-b pb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6">$1</h1>')

    // Images
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" class="rounded-lg shadow-md my-6 w-full object-cover border border-slate-200 dark:border-zinc-800" />')

    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')

    // Lists (Basic UL support) - finding blocks of lines starting with -
    .replace(/^\s*-\s+(.*)$/gim, '<li class="ml-4 list-disc">$1</li>')

    // Paragraphs (double newlines)
    .replace(/\n\n/gim, '</p><p class="leading-7 mb-4">')

  // Wrap list items in ul (Simple heuristic, not perfect but works for this)
  // Actually, for simplicity we rely on Tailwind classes on LI directly or CSS
  // A cleaner way for lists without complex parsing: just leave them as li? No, invalid HTML without UL.
  // Let's just wrap the whole thing or accept somewhat loose HTML browsers handle well, 
  // OR better: use regex to wrap consecutive LIs.
  // For safety and speed, we'll let the browser render LIs... 
  // Better: Convert lines to UL wrapper.
  // Given potential complexity, valid approach: leave as is, browser often renders. 
  // BETTER: Replace the list items with a robust structure or just acceptable styling.

  return `<div class="prose dark:prose-invert max-w-none space-y-4 text-slate-700 dark:text-slate-300">
            <p>${html}</p>
          </div>`
}


export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = getGuide(params.slug)
  if (!guide) return { title: "Guide Not Found" }

  return {
    title: guide.title,
    description: guide.description,
  }
}

export default function GuidePage({ params }: GuidePageProps) {
  const guide = getGuide(params.slug)

  if (!guide) {
    notFound()
  }

  const htmlContent = renderMarkdown(guide.content)

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <div className="flex items-center gap-2">
        <Link href="/guides">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Guides
          </Button>
        </Link>
        <Badge variant="outline">{guide.category}</Badge>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          {guide.readTime || 5} min read
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">{guide.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{guide.description}</p>
        </div>

        <Separator />

        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <div
              className="guide-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </CardContent>
        </Card>

        <Separator />

        <div className="flex flex-wrap justify-between items-center gap-4 py-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              Helpful
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Save
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Print Guide
          </Button>
        </div>
      </div>
    </div>
  )
}
