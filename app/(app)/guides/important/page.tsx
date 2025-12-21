import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Clock, Star, Download } from "lucide-react"
import Link from "next/link"

// Ensure this page is treated as dynamic to match the layout's requirements
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Important Trading Guides",
  description: "Essential guides and resources for successful trading",
}

// Mock data for important guides
const importantGuides = [
  {
    id: "risk-management-essentials",
    title: "Risk Management Essentials",
    description:
      "Master the fundamental principles of risk management to protect your capital and ensure long-term trading success.",
    category: "Risk Management",
    readTime: 20,
    downloadable: true,
  },
  {
    id: "trading-psychology-framework",
    title: "Trading Psychology Framework",
    description:
      "A comprehensive framework for developing the mental discipline and emotional control needed for consistent trading.",
    category: "Psychology",
    readTime: 25,
    downloadable: true,
  },
  {
    id: "trade-journaling-system",
    title: "Complete Trade Journaling System",
    description:
      "Learn how to create and maintain an effective trading journal that helps you identify patterns and improve your performance.",
    category: "Journal",
    readTime: 15,
    downloadable: true,
  },
  {
    id: "market-analysis-methodology",
    title: "Market Analysis Methodology",
    description:
      "A step-by-step approach to analyzing markets, identifying opportunities, and making high-probability trading decisions.",
    category: "Analysis",
    readTime: 30,
    downloadable: false,
  },
  {
    id: "position-sizing-calculator",
    title: "Position Sizing Calculator Guide",
    description:
      "Learn how to properly size your positions to manage risk and optimize returns across different market conditions.",
    category: "Risk Management",
    readTime: 18,
    downloadable: true,
  },
]

export default function ImportantGuidesPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/guides">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Guides
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Important Trading Guides</h1>
          <p className="text-muted-foreground">Essential resources every trader should master for consistent success</p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-8">
        {importantGuides.map((guide) => (
          <Card key={guide.id} className="overflow-hidden transition-all hover:shadow-lg border-l-4 border-l-primary">
            <div className="grid md:grid-cols-[3fr_1fr] gap-6">
              <div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{guide.category}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {guide.readTime} min read
                    </div>
                  </div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {guide.title}
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </CardTitle>
                  <CardDescription className="text-base mt-2">{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/guides/${guide.id}`}>
                      <Button className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Read Guide
                      </Button>
                    </Link>
                    {guide.downloadable && (
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
              <div className="relative hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10" />
                <div
                  className="h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('/placeholder.svg?height=300&width=400')`,
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
