"use client"

import { useEffect, useRef, useState } from "react"
import type { LocationPoint } from "@/components/location-tracker"

interface RouteMapProps {
  route: LocationPoint[]
  currentPosition: LocationPoint | null
  isTracking: boolean
}

export function RouteMap({ route, currentPosition, isTracking }: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
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
    // Dynamically import leaflet only on client side
    import("leaflet").then((leafletModule) => {
      setL(leafletModule.default)
      setIsLoaded(true)
    })
    return () => {
      if (addedLink && link && document.head.contains(link)) {
        document.head.removeChild(link)
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

    polylineRef.current = L.polyline([], {
      color: "#3b82f6",
      weight: 4,
      opacity: 1,
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isLoaded, L])

  useEffect(() => {
    if (!mapRef.current || !polylineRef.current || !L) return

    const latLngs: [number, number][] = route.map((point) => [point.latitude, point.longitude])
    polylineRef.current.setLatLngs(latLngs)

    if (currentPosition) {
      const position: [number, number] = [currentPosition.latitude, currentPosition.longitude]

      if (!markerRef.current) {
        markerRef.current = L.circleMarker(position, {
          radius: 10,
          fillColor: "#3b82f6",
          color: "#ffffff",
          weight: 3,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(mapRef.current)
      } else {
        markerRef.current.setLatLng(position)
      }

      if (isTracking) {
        mapRef.current.setView(position, route.length === 1 ? 17 : mapRef.current.getZoom())
      } else if (route.length > 1) {
        const bounds = L.latLngBounds(latLngs)
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [route, currentPosition, isTracking, L])

  if (!isLoaded) {
    return (
      <div className="h-100 rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapContainerRef} className="h-100 rounded-lg overflow-hidden border border-border" />
}
