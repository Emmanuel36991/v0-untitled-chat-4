import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function InsightsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 loading-shimmer rounded-lg" />
        <Skeleton className="h-5 w-80 loading-shimmer rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-28 loading-shimmer rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full loading-shimmer rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <Skeleton className="h-[320px] w-full loading-shimmer rounded-xl" />
        </CardContent>
      </Card>
    </div>
  )
}
