"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { BookOpen, BookMarked, TrendingUp, BarChart2, Lightbulb, GraduationCap } from "lucide-react"
import Link from "next/link"
import GuideCard from "@/components/guides/guide-card"
import FeaturedGuide from "@/components/guides/featured-guide"
import GuideSearch from "@/components/guides/guide-search"
import { GUIDES } from "@/lib/tutorials"
import { GuideCategory } from "@/types/tutorial"

export default function GuidesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Featured guide (Logic: First featured one found)
  const featuredGuide = GUIDES.find((guide) => guide.featured)

  // Filter guides logic
  const filteredGuides = GUIDES.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group by Category
  const groupedGuides: Record<string, typeof GUIDES> = {
    "Getting Started": [],
    "The Psychology Engine": [],
    "Advanced Features": [],
    "Other": []
  }

  filteredGuides.forEach(guide => {
    if (groupedGuides[guide.category]) {
      groupedGuides[guide.category].push(guide)
    } else {
      groupedGuides["Other"].push(guide)
    }
  })

  // Helper to render a section
  const renderSection = (title: string, guides: typeof GUIDES, icon: any) => {
    if (guides.length === 0) return null
    return (
      <div className="space-y-4 mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            {icon}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <GuideCard
              key={guide.id}
              id={guide.id}
              title={guide.title}
              description={guide.description || ""}
              category={guide.category}
              readTime={guide.readTime || 5}
              difficulty={guide.difficulty || "beginner"}
              featured={guide.featured}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-500" />
            User Manual & Guides
          </h1>
          <p className="text-muted-foreground text-lg">
            Master the platform, understand your psychology, and optimize your workflow.
          </p>
        </div>
      </div>

      <Separator />

      {featuredGuide && !searchTerm && (
        <FeaturedGuide
          id={featuredGuide.id}
          title={featuredGuide.title}
          description={featuredGuide.description || ""}
          category={featuredGuide.category}
          readTime={featuredGuide.readTime || 5}
          difficulty={featuredGuide.difficulty || "beginner"}
        />
      )}

      {/* Simplified Search - Just filters the list below */}
      <div className="relative">
        <GuideSearch onSearch={setSearchTerm} onFilterChange={() => { }} categories={[]} />
      </div>

      <div className="mt-8">
        {renderSection("Getting Started", groupedGuides["Getting Started"], <Lightbulb className="h-6 w-6" />)}
        {renderSection("The Psychology Engine", groupedGuides["The Psychology Engine"], <TrendingUp className="h-6 w-6" />)}
        {renderSection("Advanced Features", groupedGuides["Advanced Features"], <BarChart2 className="h-6 w-6" />)}

        {/* Render 'Other' if any fall through (shouldn't with current data but good for safety) */}
        {renderSection("Other Resources", groupedGuides["Other"], <BookOpen className="h-6 w-6" />)}

        {filteredGuides.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No guides found matching "{searchTerm}"</h3>
            <Button variant="outline" onClick={() => setSearchTerm("")}>Clear Search</Button>
          </div>
        )}
      </div>
    </div>
  )
}

