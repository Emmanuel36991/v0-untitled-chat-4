import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 loading-shimmer rounded-lg" />
        <Skeleton className="h-5 w-80 loading-shimmer rounded-lg" />
      </div>
      <div className="grid gap-6 max-w-2xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-32 loading-shimmer rounded" />
              <Skeleton className="h-4 w-64 loading-shimmer rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-24 loading-shimmer rounded" />
                  <Skeleton className="h-10 w-full loading-shimmer rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
