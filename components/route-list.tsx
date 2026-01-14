import { RouteCard } from "@/components/route-card"
import type { Route } from "@/app/db/schema"
import { MapPin } from "lucide-react"

interface RouteListProps {
  routes: Route[]
  emptyMessage?: string
}

export function RouteList({ routes, emptyMessage = "No routes yet" }: RouteListProps) {
  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-muted rounded-full mb-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start tracking to create your first route
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {routes.map((route) => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  )
}
