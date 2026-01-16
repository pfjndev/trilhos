"use client"

import { useEffect, useRef } from "react"
import { useLeaflet } from "@/hooks/use-leaflet"
import { MAP_CONFIG } from "@/lib/constants"
import type { LocationPoint } from "@/types/location-point"
import { cn } from "@/lib/utils"

export interface RouteMapProps {
  /** Route points to display */
  points: LocationPoint[]
  /** Current position marker (for live tracking mode) */
  currentPosition?: LocationPoint | null
  /** Whether actively tracking (affects map behavior) */
  isTracking?: boolean
  /** Show start/end markers (for static display mode) */
  showEndpoints?: boolean
  /** Height class (Tailwind) */
  height?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Unified map component for both live tracking and static route display
 * Uses Leaflet with dynamic loading for SSR compatibility
 */
export function RouteMap({
  points,
  currentPosition,
  isTracking = false,
  showEndpoints = false,
  height = "h-96",
  className,
}: RouteMapProps) {
  const { L, isLoaded } = useLeaflet()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)
  const currentMarkerRef = useRef<L.CircleMarker | null>(null)
  const endpointMarkersRef = useRef<L.CircleMarker[]>([])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !L || !mapContainerRef.current || mapRef.current) return

    mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 2)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current)

    polylineRef.current = L.polyline([], {
      color: MAP_CONFIG.ROUTE_COLOR,
      weight: MAP_CONFIG.ROUTE_WEIGHT,
      opacity: 1,
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isLoaded, L])

  // Update route polyline and markers
  useEffect(() => {
    if (!mapRef.current || !polylineRef.current || !L) return

    const latLngs: [number, number][] = points.map((p) => [
      p.latitude,
      p.longitude,
    ])
    polylineRef.current.setLatLngs(latLngs)

    // Clear old endpoint markers
    endpointMarkersRef.current.forEach((marker) => marker.remove())
    endpointMarkersRef.current = []

    // Live tracking mode: show current position marker
    if (currentPosition) {
      const position: [number, number] = [
        currentPosition.latitude,
        currentPosition.longitude,
      ]

      if (!currentMarkerRef.current) {
        currentMarkerRef.current = L.circleMarker(position, {
          radius: MAP_CONFIG.MARKER_RADIUS,
          fillColor: MAP_CONFIG.MARKER_FILL_COLOR,
          color: MAP_CONFIG.MARKER_BORDER_COLOR,
          weight: MAP_CONFIG.MARKER_BORDER_WEIGHT,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(mapRef.current)
      } else {
        currentMarkerRef.current.setLatLng(position)
      }

      if (isTracking) {
        mapRef.current.setView(
          position,
          points.length === 1 ? MAP_CONFIG.DEFAULT_ZOOM : mapRef.current.getZoom()
        )
      } else if (latLngs.length > 1) {
        mapRef.current.fitBounds(L.latLngBounds(latLngs), {
          padding: MAP_CONFIG.FIT_BOUNDS_PADDING,
        })
      }
    }

    // Static mode: show start/end markers
    if (showEndpoints && latLngs.length > 0) {
      // Start marker (green)
      const startMarker = L.circleMarker(latLngs[0], {
        radius: 8,
        fillColor: "#22c55e",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 1,
      }).addTo(mapRef.current)
      endpointMarkersRef.current.push(startMarker)

      // End marker (red)
      if (latLngs.length > 1) {
        const endMarker = L.circleMarker(latLngs[latLngs.length - 1], {
          radius: 8,
          fillColor: "#ef4444",
          color: "#ffffff",
          weight: 2,
          fillOpacity: 1,
        }).addTo(mapRef.current)
        endpointMarkersRef.current.push(endMarker)
      }

      // Fit bounds for static view
      mapRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] })
    }
  }, [points, currentPosition, isTracking, showEndpoints, L])

  if (!isLoaded) {
    return (
      <div
        className={cn(
          height,
          "rounded-lg bg-muted flex items-center justify-center",
          className
        )}
      >
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapContainerRef}
      className={cn(
        height,
        "rounded-lg overflow-hidden border border-border",
        className
      )}
    />
  )
}
