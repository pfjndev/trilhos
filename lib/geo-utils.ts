import type { LocationPoint } from "@/types/location-point"

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @returns Distance in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Calculate the total distance of a route
 * @returns Total distance in meters
 */
export function calculateTotalDistance(route: LocationPoint[]): number {
  if (route.length < 2) return 0
  let total = 0
  for (let i = 1; i < route.length; i++) {
    total += haversineDistance(
      route[i - 1].latitude,
      route[i - 1].longitude,
      route[i].latitude,
      route[i].longitude
    )
  }
  return total
}

/**
 * Calculate route duration in milliseconds
 */
export function calculateDuration(route: LocationPoint[]): number {
  if (route.length < 2) return 0
  return route[route.length - 1].timestamp - route[0].timestamp
}

/**
 * Generate a route name using reverse geocoding from OpenStreetMap Nominatim
 * Falls back to timestamp-based name if geocoding fails
 */
export async function generateRouteName(
  startPoint: LocationPoint
): Promise<string> {
  const timestamp = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${startPoint.latitude}&lon=${startPoint.longitude}&zoom=16`,
      {
        headers: {
          "User-Agent": "Trilhos GPS Tracker",
        },
      }
    )

    if (!response.ok) {
      return `Route - ${timestamp}`
    }

    const data = await response.json()

    // Try to get a meaningful location name
    const address = data.address
    const locationName =
      address?.road ||
      address?.neighbourhood ||
      address?.suburb ||
      address?.city_district ||
      address?.city ||
      address?.town ||
      address?.village

    if (locationName) {
      return `${locationName} - ${timestamp}`
    }

    return `Route - ${timestamp}`
  } catch {
    return `Route - ${timestamp}`
  }
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(0)}m`
  }
  return `${(meters / 1000).toFixed(2)}km`
}

/**
 * Format duration for display (mm:ss or hh:mm:ss)
 */
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}
