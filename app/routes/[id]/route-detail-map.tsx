"use client"

import { useEffect, useRef, useState } from "react"
import type { LocationPoint } from "@/types/location-point"

interface RouteDetailMapProps {
  points: LocationPoint[]
}

export function RouteDetailMap({ points }: RouteDetailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<typeof import("leaflet") | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    let link = document.querySelector<HTMLLinkElement>(`link[rel="stylesheet"][href="${href}"]`)
    let addedLink = false

    if (!link) {
      link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      link.crossOrigin = ""
      document.head.appendChild(link)
      addedLink = true
    }

    import("leaflet").then((leafletModule) => {
      setL(leafletModule.default)
      setIsLoaded(true)
    })

    return () => {
      if (addedLink && link && document.head.contains(link)) {
        // Keep CSS loaded to avoid flicker on navigation
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !L || !mapContainerRef.current || mapRef.current) return

    mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 2)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    // Draw the route polyline
    if (points.length > 0) {
      const latLngs: [number, number][] = points.map((point) => [point.latitude, point.longitude])

      L.polyline(latLngs, {
        color: "#3b82f6",
        weight: 4,
        opacity: 1,
      }).addTo(mapRef.current)

      // Add start marker
      L.circleMarker(latLngs[0], {
        radius: 8,
        fillColor: "#22c55e",
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(mapRef.current)

      // Add end marker
      if (latLngs.length > 1) {
        L.circleMarker(latLngs[latLngs.length - 1], {
          radius: 8,
          fillColor: "#ef4444",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(mapRef.current)
      }

      // Fit bounds to show entire route
      const bounds = L.latLngBounds(latLngs)
      mapRef.current.fitBounds(bounds, { padding: [30, 30] })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isLoaded, L, points])

  if (!isLoaded) {
    return (
      <div className="h-64 rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapContainerRef} className="h-64 rounded-lg overflow-hidden border border-border" />
}
