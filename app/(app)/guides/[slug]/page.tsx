import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, BookOpen, Share2, Bookmark, Printer, ThumbsUp } from "lucide-react"
import Link from "next/link"

interface GuidePageProps {
  params: {
    slug: string
  }
}

// This would typically come from a database or CMS
const getGuideContent = (slug: string) => {
  // Mock guide content
  return {
    title: "Risk Management 101",
    description:
      "Learn the fundamentals of risk management to protect your trading capital and ensure long-term success in the markets.",
    category: "Risk Management",
    readTime: 15,
    author: "Trading Expert",
    publishDate: "May 15, 2023",
    content: `
      <h2>Introduction to Risk Management</h2>
      <p>Risk management is the foundation of successful trading. Without proper risk management, even the best trading strategy will eventually fail. This guide will teach you the essential principles of risk management that every trader should follow.</p>
      
      <h3>Why Risk Management Matters</h3>
      <p>The primary goal of risk management is not to maximize profits, but to preserve your trading capital. By managing risk effectively, you ensure that you can continue trading even after a series of losing trades.</p>
      
      <blockquote>Remember: Your first job as a trader is not to make money, but to protect what you have.</blockquote>
      
      <h2>The 1% Rule</h2>
      <p>One of the most widely followed risk management principles is the 1% rule. This rule states that you should never risk more than 1% of your trading capital on a single trade.</p>
      
      <p>For example, if you have a $10,000 trading account, you should not risk more than $100 on any single trade. This means that if your stop loss is hit, you will only lose $100 or 1% of your account.</p>
      
      <h3>Calculating Position Size</h3>
      <p>To determine the appropriate position size for a trade, you need to know:</p>
      <ul>
        <li>Your account size</li>
        <li>The percentage you're willing to risk (e.g., 1%)</li>
        <li>The distance between your entry point and stop loss in pips or points</li>
      </ul>
      
      <h2>Risk-to-Reward Ratio</h2>
      <p>The risk-to-reward ratio compares the potential profit of a trade to its potential loss. A good risk-to-reward ratio is at least 1:2, meaning that for every dollar you risk, you aim to make at least two dollars in profit.</p>
      
      <p>For example, if you risk $100 on a trade, your profit target should be at least $200. This allows you to be profitable even if you lose more trades than you win.</p>
      
      <h3>The Mathematics of Risk-to-Reward</h3>
      <p>With a 1:2 risk-to-reward ratio, you can be profitable even with a win rate of just 40%. Here's why:</p>
      <ul>
        <li>If you win 4 out of 10 trades, you make $800 (4 wins × $200)</li>
        <li>If you lose 6 out of 10 trades, you lose $600 (6 losses × $100)</li>
        <li>Your net profit is $200 ($800 - $600)</li>
      </ul>
      
      <h2>Diversification</h2>
      <p>Another important aspect of risk management is diversification. By trading different markets or assets that are not highly correlated, you can reduce your overall risk.</p>
      
      <p>However, be careful not to over-diversify, as this can lead to reduced focus and poorer trading decisions. It's better to be an expert in a few markets than a novice in many.</p>
      
      <h2>Conclusion</h2>
      <p>Risk management is not optional—it's essential for long-term trading success. By following the principles outlined in this guide, you can protect your trading capital and increase your chances of becoming a profitable trader.</p>
      
      <p>Remember that even the best traders have losing trades. The difference between successful traders and unsuccessful ones is not their win rate, but how they manage risk.</p>
    `,
  }
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = getGuideContent(params.slug)

  return {
    title: guide.title,
    description: guide.description,
  }
}

export default function GuidePage({ params }: GuidePageProps) {
  const guide = getGuideContent(params.slug)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/guides">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Guides
          </Button>
        </Link>
        <Badge>{guide.category}</Badge>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          {guide.readTime} min read
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">{guide.title}</h1>
            <p className="text-xl text-muted-foreground">{guide.description}</p>

            <div className="flex items-center mt-6 text-sm text-muted-foreground">
              <div>By {guide.author}</div>
              <div className="mx-2">•</div>
              <div>{guide.publishDate}</div>
            </div>
          </div>

          <Separator />

          <Card>
            <CardContent className="p-6">
              <div
                className="guide-content prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: guide.content }}
              />
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                Helpful
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Save
              </Button>
            </div>

            <Button variant="outline" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Guide
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Guides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Link href="/guides/position-sizing-strategies" className="block hover:underline">
                  Position Sizing Strategies
                </Link>
                <Link href="/guides/risk-reward-optimization" className="block hover:underline">
                  Risk-Reward Optimization
                </Link>
                <Link href="/guides/stop-loss-strategies" className="block hover:underline">
                  Stop Loss Strategies
                </Link>
              </div>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                View All Guides
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guide Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/guides?category=Risk Management">
                <Badge variant="outline" className="mr-2 mb-2">
                  Risk Management
                </Badge>
              </Link>
              <Link href="/guides?category=Technical Analysis">
                <Badge variant="outline" className="mr-2 mb-2">
                  Technical Analysis
                </Badge>
              </Link>
              <Link href="/guides?category=Psychology">
                <Badge variant="outline" className="mr-2 mb-2">
                  Psychology
                </Badge>
              </Link>
              <Link href="/guides?category=Market Analysis">
                <Badge variant="outline" className="mr-2 mb-2">
                  Market Analysis
                </Badge>
              </Link>
              <Link href="/guides?category=Strategy">
                <Badge variant="outline" className="mr-2 mb-2">
                  Strategy
                </Badge>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
