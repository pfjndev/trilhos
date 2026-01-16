"use client"

import { useState, useCallback } from "react"
import type { LocationPoint } from "@/types/location-point"
import { createRoute, finalizeRoute, deleteRoute } from "@/app/actions/routes"
import { calculateTotalDistance, calculateDuration } from "@/lib/geo-utils"

export interface UseRoutePersistenceReturn {
  /** Current route ID */
  routeId: number | null
  /** Current route name */
  routeName: string
  /** Route points */
  route: LocationPoint[]
  /** Create a new route */
  createNewRoute: (startPoint: LocationPoint) => Promise<boolean>
  /** Add a point to the route */
  addPoint: (point: LocationPoint) => void
  /** Finalize and complete the route */
  completeRoute: (name: string) => Promise<boolean>
  /** Discard the current route (deletes from database) */
  discardRoute: () => Promise<void>
  /** Reset state for new tracking session */
  reset: () => void
  /** Whether save is in progress */
  isSaving: boolean
}

/**
 * Hook for managing route persistence (database)
 */
export function useRoutePersistence(): UseRoutePersistenceReturn {
  const [routeId, setRouteId] = useState<number | null>(null)
  const [routeName, setRouteName] = useState("")
  const [route, setRoute] = useState<LocationPoint[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const createNewRoute = useCallback(
    async (startPoint: LocationPoint): Promise<boolean> => {
      const result = await createRoute(startPoint)

      if (result.success && result.routeId) {
        setRouteId(result.routeId)
        setRouteName(`Route - ${new Date().toLocaleString()}`)
        setRoute([startPoint])
        return true
      }

      return false
    },
    []
  )

  const addPoint = useCallback((point: LocationPoint) => {
    setRoute((prev) => [...prev, point])
  }, [])

  const completeRoute = useCallback(
    async (name: string): Promise<boolean> => {
      if (!routeId) {
        return false
      }

      setIsSaving(true)
      try {
        const distance = calculateTotalDistance(route)
        const duration = calculateDuration(route)

        const result = await finalizeRoute(routeId, name, route, distance, duration)
        return result.success
      } catch {
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [route, routeId]
  )

  const reset = useCallback(() => {
    setRouteId(null)
    setRouteName("")
    // Keep route for display after completion
  }, [])

  const discardRoute = useCallback(async () => {
    if (routeId) {
      await deleteRoute(routeId)
    }
    setRouteId(null)
    setRouteName("")
    setRoute([])
  }, [routeId])

  return {
    routeId,
    routeName,
    route,
    createNewRoute,
    addPoint,
    completeRoute,
    discardRoute,
    reset,
    isSaving,
  }
}
