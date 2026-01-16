"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationDataPanel } from "@/components/location-data-panel"
import { RouteMap } from "@/components/route-map"
import { SaveRouteDialog } from "@/components/save-route-dialog"
import { TrackingStatus, TrackingControls, TrackingError } from "@/components/tracking"
import { useTrackingOrchestrator } from "@/hooks/use-tracking-orchestrator"

export function LocationTracker() {
  const {
    isTracking,
    currentPosition,
    route,
    routeName,
    error,
    stats,
    showSaveDialog,
    isSaving,
    startTracking,
    stopTracking,
    discardRoute,
    saveRoute,
  } = useTrackingOrchestrator()

  return (
    <>
      <SaveRouteDialog
        open={showSaveDialog}
        defaultName={routeName}
        pointCount={stats.pointCount}
        totalDistance={stats.totalDistance}
        duration={stats.duration}
        onSave={saveRoute}
        onDiscard={discardRoute}
        isSaving={isSaving}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
        <TrackingError error={error} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-baseline justify-between gap-2">
                <TrackingStatus
                  isTracking={isTracking}
                  hasPoints={route.length > 0}
                />
                <TrackingControls
                  isTracking={isTracking}
                  onStart={startTracking}
                  onStop={stopTracking}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RouteMap
                points={route}
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
