import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlaybookLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56 loading-shimmer rounded-lg" />
        <Skeleton className="h-5 w-96 loading-shimmer rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-32 loading-shimmer rounded" />
              <Skeleton className="h-4 w-full loading-shimmer rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full loading-shimmer rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
