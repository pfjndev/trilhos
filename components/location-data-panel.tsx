"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteStatsGrid, type RouteStatItem } from "@/components/shared"
import type { LocationDataPanelProps } from "@/types/location-point"
import { Navigation, Gauge, Mountain, Target, Clock, Route, Compass, MapPin } from "lucide-react"
import { calculateTotalDistance, calculateDuration, formatDistance, formatDuration } from "@/lib/geo-utils"

function formatCoordinate(value: number, type: "lat" | "lng"): string {
  const direction = type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W"
  return `${Math.abs(value).toFixed(6)}° ${direction}`
}

function formatValue(value: number | null, unit: string, decimals = 2): string {
  if (value === null) return "N/A"
  return `${value.toFixed(decimals)} ${unit}`
}

function formatHeading(heading: number | null): string {
  if (heading === null) return "N/A"
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  const index = Math.round(heading / 45) % 8
  return `${heading.toFixed(1)}° (${directions[index]})`
}

export function LocationDataPanel({ currentPosition, route, isTracking }: LocationDataPanelProps) {
  const totalDistance = calculateTotalDistance(route)
  const duration = calculateDuration(route)

  const dataItems = [
    {
      icon: Navigation,
      label: "Latitude",
      value: currentPosition ? formatCoordinate(currentPosition.latitude, "lat") : "—",
    },
    {
      icon: Navigation,
      label: "Longitude",
      value: currentPosition ? formatCoordinate(currentPosition.longitude, "lng") : "—",
    },
    {
      icon: Mountain,
      label: "Altitude",
      value: currentPosition ? formatValue(currentPosition.altitude, "m") : "—",
    },
    {
      icon: Target,
      label: "Accuracy",
      value: currentPosition ? formatValue(currentPosition.accuracy, "m") : "—",
    },
    {
      icon: Target,
      label: "Altitude Accuracy",
      value: currentPosition ? formatValue(currentPosition.altitudeAccuracy, "m") : "—",
    },
    {
      icon: Compass,
      label: "Heading",
      value: currentPosition ? formatHeading(currentPosition.heading) : "—",
    },
    {
      icon: Gauge,
      label: "Speed",
      value: currentPosition
        ? formatValue(currentPosition.speed !== null ? currentPosition.speed * 3.6 : null, "km/h")
        : "—",
    },
    {
      icon: Clock,
      label: "Last Update",
      value: currentPosition ? new Date(currentPosition.timestamp).toLocaleTimeString() : "—",
    },
  ]

  const routeStats: RouteStatItem[] = [
    { icon: MapPin, value: route.length, label: "Points" },
    { icon: Route, value: formatDistance(totalDistance), label: "Distance" },
    { icon: Clock, value: formatDuration(duration), label: "Duration" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Location Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {dataItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <item.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Route Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RouteStatsGrid stats={routeStats} columns={3} />
          {!isTracking && route.length > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Route tracking stopped. Map shows complete route overview.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
