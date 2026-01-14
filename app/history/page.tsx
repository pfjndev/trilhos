import { Suspense } from "react"
import { getCompletedRoutes } from "@/lib/queries"
import { RouteList } from "@/components/route-list"
import { History } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HistoryPage() {
  const routes = await getCompletedRoutes()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Route History</h1>
          <p className="text-sm text-muted-foreground">
            Your completed routes
          </p>
        </div>
      </div>

      <Suspense fallback={<HistorySkeleton />}>
        <RouteList
          routes={routes}
          emptyMessage="No routes yet. Start tracking to build your history!"
        />
      </Suspense>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  )
}
