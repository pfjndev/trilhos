import { Suspense } from "react"
import { getAllRoutes } from "@/lib/queries"
import { RouteList } from "@/components/route-list"
import { Activity } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ActivityPage() {
  const routes = await getAllRoutes()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Feed</h1>
          <p className="text-sm text-muted-foreground">
            All routes from the community
          </p>
        </div>
      </div>

      <Suspense fallback={<ActivitySkeleton />}>
        <RouteList
          routes={routes}
          emptyMessage="No activity yet. Be the first to track a route!"
        />
      </Suspense>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  )
}
