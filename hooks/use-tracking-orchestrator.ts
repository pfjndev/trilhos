"use client"

import { useState, useCallback } from "react"
import type { LocationPoint } from "@/types/location-point"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useRoutePersistence } from "@/hooks/use-route-persistence"
import { useRouteStats } from "@/hooks/use-route-stats"

export interface TrackingState {
  isTracking: boolean
  currentPosition: LocationPoint | null
  route: LocationPoint[]
  routeName: string
  error: string | null
  stats: {
    totalDistance: number
    duration: number
    pointCount: number
  }
  showSaveDialog: boolean
  isSaving: boolean
}

export interface TrackingActions {
  startTracking: () => Promise<void>
  stopTracking: () => void
  discardRoute: () => Promise<void>
  saveRoute: (name: string) => Promise<boolean>
  closeSaveDialog: () => void
}

/**
 * Facade hook that orchestrates all tracking-related state and actions
 * Combines useGeolocation, useRoutePersistence, and useRouteStats
 */
export function useTrackingOrchestrator(): TrackingState & TrackingActions {
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Route persistence
  const {
    routeName,
    route,
    createNewRoute,
    addPoint,
    completeRoute,
    discardRoute: discardPersistence,
    reset,
    isSaving,
  } = useRoutePersistence()

  // Route stats
  const { totalDistance, duration } = useRouteStats(route)

  // Geolocation
  const {
    position: currentPosition,
    error,
    isTracking,
    startTracking: startGeo,
    stopTracking: stopGeo,
  } = useGeolocation(addPoint)

  // Actions
  const startTracking = useCallback(async () => {
    const startPoint = await startGeo()
    if (startPoint) {
      await createNewRoute(startPoint)
    }
  }, [startGeo, createNewRoute])

  const stopTracking = useCallback(() => {
    stopGeo()
    if (route.length > 0) {
      setShowSaveDialog(true)
    }
  }, [stopGeo, route.length])

  const saveRoute = useCallback(
    async (name: string): Promise<boolean> => {
      const success = await completeRoute(name)
      if (success) {
        setShowSaveDialog(false)
        reset()
      }
      return success
    },
    [completeRoute, reset]
  )

  const closeSaveDialog = useCallback(() => {
    setShowSaveDialog(false)
  }, [])

  const discardRoute = useCallback(async () => {
    setShowSaveDialog(false)
    await discardPersistence()
  }, [discardPersistence])

  return {
    // State
    isTracking,
    currentPosition,
    route,
    routeName,
    error,
    stats: {
      totalDistance,
      duration,
      pointCount: route.length,
    },
    showSaveDialog,
    isSaving,
    // Actions
    startTracking,
    stopTracking,
    discardRoute,
    saveRoute,
    closeSaveDialog,
  }
}
