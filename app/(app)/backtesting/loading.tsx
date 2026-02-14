import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function BacktestingLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-52 loading-shimmer rounded-lg" />
        <Skeleton className="h-5 w-80 loading-shimmer rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-40 loading-shimmer rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full loading-shimmer rounded-xl" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-36 loading-shimmer rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full loading-shimmer rounded" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
