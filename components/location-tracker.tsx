"use client"

import { useState, useCallback, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationDataPanel } from "@/components/location-data-panel"
import { RouteMap } from "@/components/route-map"
import { ResumeRouteDialog } from "@/components/resume-route-dialog"
import { SaveRouteDialog } from "@/components/save-route-dialog"
import type { Route } from "@/app/db/schema"
import { Play, Square, AlertCircle } from "lucide-react"

import { useGeolocation } from "@/hooks/use-geolocation"
import { useRoutePersistence } from "@/hooks/use-route-persistence"
import { useRouteStats } from "@/hooks/use-route-stats"
import { useAutoSave } from "@/hooks/use-auto-save"

interface LocationTrackerProps {
  activeRoutePromise: Promise<Route | null>
}

export function LocationTracker({ activeRoutePromise }: LocationTrackerProps) {
  // Unwrap the promise using React's use() hook
  const activeRoute = use(activeRoutePromise)

  // Dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Route persistence hook
  const {
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
  } = useRoutePersistence({ activeRoute })

  // Route stats (memoized)
  const { totalDistance, duration } = useRouteStats(route)

  // Geolocation hook with position callback
  const handlePosition = useCallback(
    (point: typeof route[0]) => {
      addPoint(point)
    },
    [addPoint]
  )

  const {
    position: currentPosition,
    error,
    isTracking,
    startTracking: startGeoTracking,
    stopTracking: stopGeoTracking,
  } = useGeolocation(handlePosition)

  // Auto-save hook
  useAutoSave({
    data: { route, routeId, totalDistance, duration },
    enabled: isTracking && routeId !== null,
    onSave: async () => {
      return await saveRoute()
    },
  })

  // Start tracking handler
  const handleStartTracking = useCallback(async () => {
    const startPoint = await startGeoTracking()
    if (startPoint) {
      await createNewRoute(startPoint)
    }
  }, [startGeoTracking, createNewRoute])

  // Stop tracking handler
  const handleStopTracking = useCallback(() => {
    stopGeoTracking()
    if (route.length > 0) {
      setShowSaveDialog(true)
    }
  }, [stopGeoTracking, route.length])

  // Resume route handler
  const handleResume = useCallback(() => {
    resumeRoute()
    // Start tracking with existing route
    startGeoTracking()
  }, [resumeRoute, startGeoTracking])

  // Abandon route handler
  const handleAbandon = useCallback(async () => {
    await discardRoute()
  }, [discardRoute])

  // Save route handler
  const handleSave = useCallback(
    async (name: string) => {
      const success = await completeRoute(name)
      if (success) {
        setShowSaveDialog(false)
        reset()
      }
    },
    [completeRoute, reset]
  )

  // Discard route handler
  const handleDiscard = useCallback(async () => {
    setShowSaveDialog(false)
    await discardRoute()
  }, [discardRoute])

  return (
    <>
      <ResumeRouteDialog
        open={hasRouteToResume}
        routeName={routeName}
        pointCount={route.length}
        totalDistance={totalDistance}
        duration={duration}
        onResume={handleResume}
        onAbandon={handleAbandon}
      />

      <SaveRouteDialog
        open={showSaveDialog}
        defaultName={routeName}
        pointCount={route.length}
        totalDistance={totalDistance}
        duration={duration}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <div
                    className={`h-3 w-3 rounded-full ${isTracking ? "bg-green-500 animate-pulse" : "bg-muted"}`}
                  />
                  {isTracking
                    ? "Live Tracking"
                    : route.length > 0
                      ? "Route Overview"
                      : "Waiting to Start"}
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleStartTracking}
                    disabled={isTracking}
                    size="lg"
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                  <Button
                    onClick={handleStopTracking}
                    disabled={!isTracking}
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RouteMap
                route={route}
                currentPosition={currentPosition}
                isTracking={isTracking}
              />
            </CardContent>
          </Card>

          <LocationDataPanel
            currentPosition={currentPosition}
            route={route}
            isTracking={isTracking}
          />
        </div>
      </div>
    </>
  )
}
