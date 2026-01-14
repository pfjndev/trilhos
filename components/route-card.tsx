import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Route as RouteIcon } from "lucide-react"
import { formatDistance, formatDuration } from "@/lib/geo-utils"
import type { Route } from "@/app/db/schema"
import { formatDistanceToNow } from "date-fns"

interface RouteCardProps {
  route: Route
}

export function RouteCard({ route }: RouteCardProps) {
  const createdAt = new Date(route.createdAt)
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true })

  return (
    <Link href={`/routes/${route.id}`}>
      <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {route.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{timeAgo}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatDistance(route.totalDistance)}
                </p>
                <p className="text-xs text-muted-foreground">Distance</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatDuration(route.duration)}
                </p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{route.points.length}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
