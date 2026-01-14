import { Suspense } from "react"
import { LocationTracker } from "@/components/location-tracker"
import { getActiveRoute } from "@/lib/queries"

// Force dynamic rendering since we need database access
export const dynamic = "force-dynamic"

export default function Home() {
  // Fetch active route as a promise (will be unwrapped by client component)
  const activeRoutePromise = getActiveRoute()

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LocationTrackerSkeleton />}>
        <LocationTracker activeRoutePromise={activeRoutePromise} />
      </Suspense>
    </main>
  )
}

function LocationTrackerSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-6">
          <div className="h-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-40 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}
