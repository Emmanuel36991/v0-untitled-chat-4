import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 loading-shimmer rounded-lg" />
        <Skeleton className="h-5 w-96 loading-shimmer rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border card-enhanced">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20 loading-shimmer rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28 loading-shimmer rounded" />
              <Skeleton className="h-3 w-16 mt-2 loading-shimmer rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <Skeleton className="h-[280px] w-full loading-shimmer rounded-xl" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-40 loading-shimmer rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full loading-shimmer rounded" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-36 loading-shimmer rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full loading-shimmer rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
