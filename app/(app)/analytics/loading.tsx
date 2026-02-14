import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-56 loading-shimmer rounded-lg" />
        <Skeleton className="h-5 w-80 loading-shimmer rounded-lg" />
      </div>

      {/* Metric cards row - 4-5 cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-card border-border rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded loading-shimmer" />
                <Skeleton className="h-4 w-20 loading-shimmer rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2 loading-shimmer rounded" />
              <Skeleton className="h-3 w-16 loading-shimmer rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main chart area skeleton */}
      <Card className="bg-card border-border rounded-xl overflow-hidden">
        <CardHeader>
          <Skeleton className="h-6 w-40 loading-shimmer rounded" />
          <Skeleton className="h-4 w-64 loading-shimmer rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[320px] w-full loading-shimmer rounded-xl" />
        </CardContent>
      </Card>

      {/* Secondary row - 2-3 smaller cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28 loading-shimmer rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full loading-shimmer rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
