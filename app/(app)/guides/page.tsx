"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { BookOpen, BookMarked, TrendingUp, BarChart2, Lightbulb, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import GuideCard from "@/components/guides/guide-card"
import FeaturedGuide from "@/components/guides/featured-guide"
import GuideSearch from "@/components/guides/guide-search"

// Mock data for guides
const mockGuides = [
  {
    id: "risk-management-101",
    title: "Risk Management 101",
    description:
      "Learn the fundamentals of risk management to protect your trading capital and ensure long-term success in the markets.",
    category: "Risk Management",
    readTime: 15,
    difficulty: "beginner" as const,
    featured: true,
  },
  {
    id: "technical-analysis-basics",
    title: "Technical Analysis Basics",
    description:
      "Understand how to read charts, identify patterns, and use technical indicators to make better trading decisions.",
    category: "Technical Analysis",
    readTime: 20,
    difficulty: "beginner" as const,
  },
  {
    id: "trading-psychology-mastery",
    title: "Trading Psychology Mastery",
    description:
      "Discover how to control your emotions, develop discipline, and maintain a winning mindset while trading.",
    category: "Psychology",
    readTime: 25,
    difficulty: "intermediate" as const,
  },
  {
    id: "advanced-candlestick-patterns",
    title: "Advanced Candlestick Patterns",
    description:
      "Master complex candlestick patterns to identify high-probability trading opportunities in any market condition.",
    category: "Technical Analysis",
    readTime: 30,
    difficulty: "advanced" as const,
  },
  {
    id: "position-sizing-strategies",
    title: "Position Sizing Strategies",
    description:
      "Learn different position sizing methods to optimize your risk-reward ratio and maximize your trading performance.",
    category: "Risk Management",
    readTime: 18,
    difficulty: "intermediate" as const,
  },
  {
    id: "market-structure-analysis",
    title: "Market Structure Analysis",
    description:
      "Understand how to identify market structure, support and resistance levels, and market phases for better entries and exits.",
    category: "Market Analysis",
    readTime: 22,
    difficulty: "intermediate" as const,
  },
  {
    id: "trading-journal-optimization",
    title: "Trading Journal Optimization",
    description:
      "Learn how to create and maintain an effective trading journal to track your progress and identify areas for improvement.",
    category: "Psychology",
    readTime: 12,
    difficulty: "beginner" as const,
  },
  {
    id: "fibonacci-retracement-mastery",
    title: "Fibonacci Retracement Mastery",
    description:
      "Master the art of using Fibonacci retracement levels to identify potential reversal zones and price targets.",
    category: "Technical Analysis",
    readTime: 28,
    difficulty: "advanced" as const,
  },
]

// Extract unique categories
const categories = Array.from(new Set(mockGuides.map((guide) => guide.category)))

export default function GuidesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [filteredGuides, setFilteredGuides] = useState(mockGuides)

  // Featured guide
  const featuredGuide = mockGuides.find((guide) => guide.featured)

  // Filter guides based on search term, categories, and active tab
  useEffect(() => {
    let filtered = mockGuides

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (guide) =>
          guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guide.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((guide) => selectedCategories.includes(guide.category))
    }

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((guide) => guide.difficulty === activeTab)
    }

    setFilteredGuides(filtered)
  }, [searchTerm, selectedCategories, activeTab])

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trading Guides</h1>
          <p className="text-muted-foreground">
            Comprehensive resources to help you improve your trading skills and knowledge
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/guides/important">
            <Button variant="outline" className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              Important Guides
            </Button>
          </Link>
          <Link href="/guides/import-and-connect">
            <Button variant="outline" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Import & Connect
            </Button>
          </Link>
        </div>
      </div>

      <Separator />

      {featuredGuide && (
        <FeaturedGuide
          id={featuredGuide.id}
          title={featuredGuide.title}
          description={featuredGuide.description}
          category={featuredGuide.category}
          readTime={featuredGuide.readTime}
          difficulty={featuredGuide.difficulty}
        />
      )}

      <GuideSearch onSearch={setSearchTerm} onFilterChange={setSelectedCategories} categories={categories} />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">All Guides</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="beginner" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Beginner</span>
            <span className="sm:hidden">Begin</span>
          </TabsTrigger>
          <TabsTrigger value="intermediate" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Intermediate</span>
            <span className="sm:hidden">Inter</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced</span>
            <span className="sm:hidden">Adv</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  id={guide.id}
                  title={guide.title}
                  description={guide.description}
                  category={guide.category}
                  readTime={guide.readTime}
                  difficulty={guide.difficulty}
                  featured={guide.featured}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No guides found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategories([])
                  setActiveTab("all")
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="beginner" className="mt-0">
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  id={guide.id}
                  title={guide.title}
                  description={guide.description}
                  category={guide.category}
                  readTime={guide.readTime}
                  difficulty={guide.difficulty}
                  featured={guide.featured}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No beginner guides found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategories([])
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="intermediate" className="mt-0">
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  id={guide.id}
                  title={guide.title}
                  description={guide.description}
                  category={guide.category}
                  readTime={guide.readTime}
                  difficulty={guide.difficulty}
                  featured={guide.featured}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No intermediate guides found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategories([])
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="mt-0">
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  id={guide.id}
                  title={guide.title}
                  description={guide.description}
                  category={guide.category}
                  readTime={guide.readTime}
                  difficulty={guide.difficulty}
                  featured={guide.featured}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No advanced guides found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategories([])
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
