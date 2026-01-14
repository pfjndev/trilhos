import type { LocationPoint } from "@/types/location-point"
import { STORAGE_KEYS } from "@/lib/constants"

export interface PendingRoute {
  routeId: number | null
  points: LocationPoint[]
  name: string
  startedAt: number
  needsSync: boolean
}

/**
 * Save route data to localStorage as a fallback when DB is unavailable
 */
export function savePendingRoute(route: PendingRoute): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_ROUTE, JSON.stringify(route))
  } catch (error) {
    console.error("Failed to save pending route to localStorage:", error)
  }
}

/**
 * Get pending route data from localStorage
 */
export function getPendingRoute(): PendingRoute | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PENDING_ROUTE)
    if (!stored) return null
    return JSON.parse(stored) as PendingRoute
  } catch (error) {
    console.error("Failed to read pending route from localStorage:", error)
    return null
  }
}

/**
 * Clear pending route from localStorage
 */
export function clearPendingRoute(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_ROUTE)
  } catch (error) {
    console.error("Failed to clear pending route from localStorage:", error)
  }
}

/**
 * Update points in the pending route
 */
export function updatePendingRoutePoints(points: LocationPoint[]): void {
  const pending = getPendingRoute()
  if (!pending) return

  savePendingRoute({
    ...pending,
    points,
    needsSync: true,
  })
}

/**
 * Check if there's a pending route that needs to be synced
 */
export function hasPendingSync(): boolean {
  const pending = getPendingRoute()
  return pending?.needsSync ?? false
}
