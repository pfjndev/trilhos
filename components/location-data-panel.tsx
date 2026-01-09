"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LocationPoint } from "@/components/location-tracker"
import { Navigation, Gauge, Mountain, Target, Clock, Route, Compass } from "lucide-react"

interface LocationDataPanelProps {
  currentPosition: LocationPoint | null
  route: LocationPoint[]
  isTracking: boolean
}

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

function calculateTotalDistance(route: LocationPoint[]): number {
  if (route.length < 2) return 0
  let total = 0
  for (let i = 1; i < route.length; i++) {
    total += haversineDistance(route[i - 1].latitude, route[i - 1].longitude, route[i].latitude, route[i].longitude)
  }
  return total
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export function LocationDataPanel({ currentPosition, route, isTracking }: LocationDataPanelProps) {
  const totalDistance = calculateTotalDistance(route)
  const duration = route.length > 1 ? route[route.length - 1].timestamp - route[0].timestamp : 0

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
      value: currentPosition ? new Date(currentPosition.timestamp).toLocaleTimeString("pt-PT") : "—",
    },
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
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{route.length}</p>
              <p className="text-sm text-muted-foreground">Points</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">
                {totalDistance < 1000 ? `${totalDistance.toFixed(0)}m` : `${(totalDistance / 1000).toFixed(2)}km`}
              </p>
              <p className="text-sm text-muted-foreground">Distance</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">
                {Math.floor(duration / 60000)}:{String(Math.floor((duration % 60000) / 1000)).padStart(2, "0")}
              </p>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
          </div>
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
