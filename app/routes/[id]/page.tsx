import { notFound } from "next/navigation"
import { getRouteById } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Clock, Route as RouteIcon, Lock } from "lucide-react"
import { formatDistance, formatDuration } from "@/lib/geo-utils"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { RouteDetailMap } from "./route-detail-map"

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

  const route = await getRouteById(routeId)

  if (!route) {
    notFound()
  }

  const createdAt = new Date(route.createdAt)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })

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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Sign in to edit</span>
        </div>
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
            <RouteDetailMap points={route.points} />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <RouteIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">
                      {formatDistance(route.totalDistance)}
                    </p>
                    <p className="text-sm text-muted-foreground">Distance</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">
                      {formatDuration(route.duration)}
                    </p>
                    <p className="text-sm text-muted-foreground">Duration</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{route.points.length}</p>
                    <p className="text-sm text-muted-foreground">Points</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <RouteIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">
                      {route.duration > 0
                        ? ((route.totalDistance / (route.duration / 1000)) * 3.6).toFixed(1)
                        : "0"}
                      <span className="text-sm font-normal"> km/h</span>
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Speed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info card about editing */}
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-3 py-4">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Want to edit or delete this route?</p>
                <p className="text-sm text-muted-foreground">
                  Sign in to manage your routes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
