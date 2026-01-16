import { notFound } from "next/navigation"
import { getRouteById } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Clock, Route as RouteIcon } from "lucide-react"
import { formatDistance, formatDuration } from "@/lib/geo-utils"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { RouteMap } from "@/components/route-map"
import { RouteActions } from "./route-actions"
import { RouteStatsGrid, type RouteStatItem } from "@/components/shared"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"

interface RouteDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const { id } = await params
  const routeId = parseInt(id, 10)

  if (isNaN(routeId)) {
    notFound()
  }

  const [route, session] = await Promise.all([
    getRouteById(routeId),
    auth(),
  ])

  if (!route) {
    notFound()
  }

  const createdAt = new Date(route.createdAt)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })

  // Check if current user owns this route
  const isOwner = session?.user?.id === route.userId

  // Calculate average speed
  const avgSpeed = route.duration > 0
    ? ((route.totalDistance / (route.duration / 1000)) * 3.6).toFixed(1)
    : "0"

  const stats: RouteStatItem[] = [
    { icon: RouteIcon, value: formatDistance(route.totalDistance), label: "Distance" },
    { icon: Clock, value: formatDuration(route.duration), label: "Duration" },
    { icon: MapPin, value: route.points.length, label: "Points" },
    { icon: RouteIcon, value: `${avgSpeed} km/h`, label: "Avg Speed" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Link href="/history">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
      </Link>

      {/* Route header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{route.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{timeAgo}</p>
        </div>
        {isOwner && (
          <RouteActions routeId={route.id} currentName={route.name} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Route Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RouteMap points={route.points} showEndpoints />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <RouteStatsGrid stats={stats} columns={2} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
