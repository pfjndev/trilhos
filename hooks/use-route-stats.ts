"use client"

import { useMemo } from "react"
import type { LocationPoint } from "@/types/location-point"
import { calculateTotalDistance, calculateDuration } from "@/lib/geo-utils"

export interface RouteStats {
  /** Total distance in meters */
  totalDistance: number
  /** Duration in milliseconds */
  duration: number
  /** Number of points */
  pointCount: number
  /** Average speed in m/s */
  averageSpeed: number
  /** Start time (timestamp) */
  startTime: number | null
  /** End time (timestamp) */
  endTime: number | null
}

/**
 * Hook for calculating memoized route statistics
 */
export function useRouteStats(route: LocationPoint[]): RouteStats {
  return useMemo(() => {
    const totalDistance = calculateTotalDistance(route)
    const duration = calculateDuration(route)
    const pointCount = route.length

    // Calculate average speed (avoid division by zero)
    const durationSeconds = duration / 1000
    const averageSpeed = durationSeconds > 0 ? totalDistance / durationSeconds : 0

    // Get start and end times
    const startTime = route.length > 0 ? route[0].timestamp : null
    const endTime = route.length > 1 ? route[route.length - 1].timestamp : null

    return {
      totalDistance,
      duration,
      pointCount,
      averageSpeed,
      startTime,
      endTime,
    }
  }, [route])
}
