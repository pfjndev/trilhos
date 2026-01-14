"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import type { LocationPoint } from "@/types/location-point"
import { GEOLOCATION_CONFIG } from "@/lib/constants"

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export interface UseGeolocationReturn {
  position: LocationPoint | null
  error: string | null
  isTracking: boolean
  startTracking: () => Promise<LocationPoint | null>
  stopTracking: () => void
}

/**
 * Hook for managing geolocation tracking
 * Handles starting/stopping position watch and provides current position
 */
export function useGeolocation(
  onPosition?: (point: LocationPoint) => void,
  options?: UseGeolocationOptions
): UseGeolocationReturn {
  const [position, setPosition] = useState<LocationPoint | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  const config = useMemo(() => ({
    enableHighAccuracy: options?.enableHighAccuracy ?? GEOLOCATION_CONFIG.HIGH_ACCURACY,
    timeout: options?.timeout ?? GEOLOCATION_CONFIG.WATCH_TIMEOUT_MS,
    maximumAge: options?.maximumAge ?? GEOLOCATION_CONFIG.MAXIMUM_AGE_MS,
  }), [options?.enableHighAccuracy, options?.timeout, options?.maximumAge])

  const createLocationPoint = useCallback((pos: GeolocationPosition): LocationPoint => {
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      altitude: pos.coords.altitude,
      accuracy: pos.coords.accuracy,
      altitudeAccuracy: pos.coords.altitudeAccuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
      timestamp: pos.timestamp,
    }
  }, [])

  const startTracking = useCallback(async (): Promise<LocationPoint | null> => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return null
    }

    setError(null)

    try {
      // Get initial position first
      const initialPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: config.enableHighAccuracy,
          timeout: GEOLOCATION_CONFIG.INITIAL_TIMEOUT_MS,
        })
      })

      const startPoint = createLocationPoint(initialPosition)
      setPosition(startPoint)
      onPosition?.(startPoint)
      setIsTracking(true)

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const point = createLocationPoint(pos)
          setPosition(point)
          onPosition?.(point)
        },
        (err) => {
          setError(`Error: ${err.message}`)
          setIsTracking(false)
        },
        config
      )

      return startPoint
    } catch (err) {
      const geoError = err as GeolocationPositionError
      setError(`Error getting position: ${geoError.message}`)
      return null
    }
  }, [config, createLocationPoint, onPosition])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return {
    position,
    error,
    isTracking,
    startTracking,
    stopTracking,
  }
}
