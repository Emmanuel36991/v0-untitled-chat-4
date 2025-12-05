import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"
import Link from "next/link"

interface GuideCardProps {
  id: string
  title: string
  description: string
  category: string
  readTime: number
  difficulty: "beginner" | "intermediate" | "advanced"
  featured?: boolean
}

export default function GuideCard({
  id,
  title,
  description,
  category,
  readTime,
  difficulty,
  featured = false,
}: GuideCardProps) {
  const difficultyColor = {
    beginner: "bg-green-500 hover:bg-green-600 text-white",
    intermediate: "bg-warning hover:bg-warning/90 text-warning-foreground",
    advanced: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
  }

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${featured ? "border-primary/50 shadow-primary/20" : ""}`}
    >
      {featured && (
        <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 text-center">
          Featured Guide
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="mb-2">
            {category}
          </Badge>
          <Badge className={difficultyColor[difficulty]}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="flex items-center mt-2 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          {readTime} min read
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/guides/${id}`} className="w-full">
          <Button className="w-full group bg-transparent" variant="outline">
            <span className="mr-2">Read Guide</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
