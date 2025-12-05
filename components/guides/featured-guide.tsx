import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, BookOpen } from "lucide-react"
import Link from "next/link"

interface FeaturedGuideProps {
  id: string
  title: string
  description: string
  category: string
  readTime: number
  difficulty: "beginner" | "intermediate" | "advanced"
  image?: string
}

export default function FeaturedGuide({
  id,
  title,
  description,
  category,
  readTime,
  difficulty,
  image,
}: FeaturedGuideProps) {
  const difficultyColor = {
    beginner: "bg-green-500 hover:bg-green-600 text-white",
    intermediate: "bg-warning hover:bg-warning/90 text-warning-foreground",
    advanced: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
  }

  return (
    <Card className="overflow-hidden border-primary/50 shadow-lg shadow-primary/20">
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-background/90 z-10" />
        <div
          className="w-full h-48 bg-cover bg-center"
          style={{
            backgroundImage: image ? `url(${image})` : `url('/placeholder.svg?height=300&width=800')`,
          }}
        />
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-primary text-primary-foreground">Featured Guide</Badge>
        </div>
        <div className="absolute bottom-4 right-4 z-20">
          <Badge className={difficultyColor[difficulty]}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{category}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {readTime} min read
          </div>
        </div>
        <CardTitle className="text-2xl mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/guides/${id}`} className="w-full">
          <Button className="w-full group" variant="default">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Read Featured Guide</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
