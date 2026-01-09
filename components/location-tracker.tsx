"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationDataPanel } from "@/components/location-data-panel"
import { RouteMap } from "@/components/route-map"
import { MapPin, Play, Square, AlertCircle } from "lucide-react"

export interface LocationPoint {
  latitude: number
  longitude: number
  altitude: number | null
  accuracy: number
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number
}

export function LocationTracker() {
  const [isTracking, setIsTracking] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<LocationPoint | null>(null)
  const [route, setRoute] = useState<LocationPoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setError(null)
    setIsTracking(true)
    setRoute([])

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 1000,
      maximumAge: 1500,
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: LocationPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        }
        setCurrentPosition(point)
        setRoute((prev) => [...prev, point])
      },
      (err) => {
        setError(`Error: ${err.message}`)
        setIsTracking(false)
      },
      options,
    )
  }, [])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }, [])

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary rounded-lg">
          <MapPin className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Location Tracker</h1>
          <p className="text-muted-foreground">Track your location in real-time with high accuracy</p>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 mb-6">
        <Button onClick={startTracking} disabled={isTracking} size="lg" className="gap-2">
          <Play className="h-4 w-4" />
          Start Tracking
        </Button>
        <Button onClick={stopTracking} disabled={!isTracking} variant="destructive" size="lg" className="gap-2">
          <Square className="h-4 w-4" />
          Stop Tracking
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isTracking ? "bg-green-500 animate-pulse" : "bg-muted"}`} />
              {isTracking ? "Live Tracking" : route.length > 0 ? "Route Overview" : "Waiting to Start"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RouteMap route={route} currentPosition={currentPosition} isTracking={isTracking} />
          </CardContent>
        </Card>

        <LocationDataPanel currentPosition={currentPosition} route={route} isTracking={isTracking} />
      </div>
    </div>
  )
}
