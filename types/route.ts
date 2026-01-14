import type { LocationPoint } from "@/types/location-point"

// Re-export schema types for convenience
export type { Route, NewRoute, RouteStatus } from "@/app/db/schema"

// Component props types
export interface RouteMapProps {
  route: LocationPoint[]
  currentPosition: LocationPoint | null
  isTracking: boolean
}
