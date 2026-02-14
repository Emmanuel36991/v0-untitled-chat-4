import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TradesLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 loading-shimmer rounded-lg" />
        <Skeleton className="h-5 w-96 loading-shimmer rounded-lg" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 loading-shimmer rounded-md" />
        ))}
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20 loading-shimmer rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 loading-shimmer rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton - column headers + rows */}
      <Card className="bg-card border-border rounded-xl overflow-hidden">
        <CardHeader>
          <Skeleton className="h-6 w-32 loading-shimmer rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Column header row */}
            <div className="flex gap-4 pb-2 border-b border-border">
              <Skeleton className="h-4 w-16 loading-shimmer rounded" />
              <Skeleton className="h-4 w-20 loading-shimmer rounded" />
              <Skeleton className="h-4 w-24 loading-shimmer rounded" />
              <Skeleton className="h-4 w-20 loading-shimmer rounded" />
              <Skeleton className="h-4 w-28 loading-shimmer rounded" />
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-2">
                <Skeleton className="h-4 w-[60%] max-w-[120px] loading-shimmer rounded" />
                <Skeleton className="h-4 w-[45%] max-w-[80px] loading-shimmer rounded" />
                <Skeleton className="h-4 w-[55%] max-w-[100px] loading-shimmer rounded" />
                <Skeleton className="h-4 w-[40%] max-w-[70px] loading-shimmer rounded" />
                <Skeleton className="h-4 w-[35%] max-w-[60px] loading-shimmer rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
