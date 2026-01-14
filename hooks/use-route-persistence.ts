"use client"

import { useState, useCallback, useEffect } from "react"
import type { LocationPoint } from "@/types/location-point"
import type { Route } from "@/app/db/schema"
import {
  createRoute,
  updateRoutePoints,
  finalizeRoute,
  abandonRoute,
  syncPendingRoute,
} from "@/app/actions/routes"
import {
  savePendingRoute,
  getPendingRoute,
  clearPendingRoute,
  updatePendingRoutePoints,
} from "@/lib/storage"
import { calculateTotalDistance, calculateDuration } from "@/lib/geo-utils"

export interface UseRoutePersistenceOptions {
  /** Active route from server (if any) */
  activeRoute: Route | null
}

export interface UseRoutePersistenceReturn {
  /** Current route ID */
  routeId: number | null
  /** Current route name */
  routeName: string
  /** Route points */
  route: LocationPoint[]
  /** Whether there's a route to resume */
  hasRouteToResume: boolean
  /** Create a new route */
  createNewRoute: (startPoint: LocationPoint) => Promise<boolean>
  /** Add a point to the route */
  addPoint: (point: LocationPoint) => void
  /** Save current route to database */
  saveRoute: () => Promise<boolean>
  /** Finalize and complete the route */
  completeRoute: (name: string) => Promise<boolean>
  /** Resume an interrupted route */
  resumeRoute: () => void
  /** Abandon the current route */
  discardRoute: () => Promise<void>
  /** Reset state for new tracking session */
  reset: () => void
  /** Whether save is in progress */
  isSaving: boolean
}

/**
 * Hook for managing route persistence (database + localStorage fallback)
 */
export function useRoutePersistence({
  activeRoute,
}: UseRoutePersistenceOptions): UseRoutePersistenceReturn {
  const [routeId, setRouteId] = useState<number | null>(null)
  const [routeName, setRouteName] = useState("")
  const [route, setRoute] = useState<LocationPoint[]>([])
  const [hasRouteToResume, setHasRouteToResume] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Check for active route on mount
  useEffect(() => {
    if (activeRoute) {
      setRouteId(activeRoute.id)
      setRouteName(activeRoute.name)
      setRoute(activeRoute.points)
      setHasRouteToResume(true)
    } else {
      // Check for pending route in localStorage
      const pending = getPendingRoute()
      if (pending && pending.needsSync && pending.points.length > 0) {
        syncPendingRoute(
          pending.routeId,
          pending.points,
          pending.name,
          pending.startedAt
        )
          .then((result) => {
            if (result.success && result.routeId) {
              setRouteId(result.routeId)
              setRouteName(pending.name)
              setRoute(pending.points)
              setHasRouteToResume(true)
              clearPendingRoute()
            }
          })
          .catch(() => {
            // Keep pending route for retry
          })
      }
    }
  }, [activeRoute])

  const createNewRoute = useCallback(
    async (startPoint: LocationPoint): Promise<boolean> => {
      const result = await createRoute(startPoint)

      if (result.success && result.routeId) {
        setRouteId(result.routeId)
        setRouteName(`Route - ${new Date().toLocaleString()}`)
        setRoute([startPoint])
        return true
      } else {
        // Fallback to localStorage
        const pendingRoute = {
          routeId: null,
          points: [startPoint],
          name: `Route - ${new Date().toLocaleString()}`,
          startedAt: Date.now(),
          needsSync: true,
        }
        savePendingRoute(pendingRoute)
        setRoute([startPoint])
        setRouteName(pendingRoute.name)
        return true
      }
    },
    []
  )

  const addPoint = useCallback((point: LocationPoint) => {
    setRoute((prev) => [...prev, point])
  }, [])

  const saveRoute = useCallback(async (): Promise<boolean> => {
    if (!routeId || route.length === 0) return false

    setIsSaving(true)
    try {
      const distance = calculateTotalDistance(route)
      const duration = calculateDuration(route)

      const result = await updateRoutePoints(routeId, route, distance, duration)

      if (!result.success) {
        // Fallback to localStorage
        updatePendingRoutePoints(route)
        return false
      }

      return true
    } catch {
      updatePendingRoutePoints(route)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [routeId, route])

  const completeRoute = useCallback(
    async (name: string): Promise<boolean> => {
      setIsSaving(true)
      try {
        const distance = calculateTotalDistance(route)
        const duration = calculateDuration(route)

        if (routeId) {
          const result = await finalizeRoute(routeId, name, route, distance, duration)
          if (!result.success) {
            return false
          }
        } else {
          // No routeId - try to sync pending route
          const pending = getPendingRoute()
          if (pending) {
            const syncResult = await syncPendingRoute(
              null,
              route,
              name,
              pending.startedAt
            )
            if (syncResult.success && syncResult.routeId) {
              await finalizeRoute(syncResult.routeId, name, route, distance, duration)
            }
          }
        }

        clearPendingRoute()
        return true
      } catch {
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [route, routeId]
  )

  const resumeRoute = useCallback(() => {
    setHasRouteToResume(false)
  }, [])

  const discardRoute = useCallback(async () => {
    if (routeId) {
      await abandonRoute(routeId)
    }

    clearPendingRoute()
    setRouteId(null)
    setRouteName("")
    setRoute([])
    setHasRouteToResume(false)
  }, [routeId])

  const reset = useCallback(() => {
    setRouteId(null)
    setRouteName("")
    // Keep route for display after completion
  }, [])

  return {
    routeId,
    routeName,
    route,
    hasRouteToResume,
    createNewRoute,
    addPoint,
    saveRoute,
    completeRoute,
    resumeRoute,
    discardRoute,
    reset,
    isSaving,
  }
}
