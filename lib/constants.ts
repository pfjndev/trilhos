/**
 * Configuration constants for the location tracking application
 */

// Auto-save configuration
export const AUTO_SAVE_CONFIG = {
  /** Interval between auto-saves in milliseconds (30 seconds) */
  INTERVAL_MS: 30_000,
  /** Number of new points that trigger an auto-save */
  POINT_THRESHOLD: 10,
} as const

// Geolocation configuration
export const GEOLOCATION_CONFIG = {
  /** Use high accuracy GPS */
  HIGH_ACCURACY: true,
  /** Timeout for initial position request in milliseconds */
  INITIAL_TIMEOUT_MS: 10_000,
  /** Timeout for position watch updates in milliseconds */
  WATCH_TIMEOUT_MS: 5_000,
  /** Maximum age of cached position in milliseconds */
  MAXIMUM_AGE_MS: 1_500,
} as const

// Map display configuration
export const MAP_CONFIG = {
  /** Default zoom level when tracking starts */
  DEFAULT_ZOOM: 17,
  /** Route polyline color */
  ROUTE_COLOR: "#3b82f6",
  /** Route polyline weight/thickness */
  ROUTE_WEIGHT: 4,
  /** Current position marker radius */
  MARKER_RADIUS: 10,
  /** Marker fill color */
  MARKER_FILL_COLOR: "#3b82f6",
  /** Marker border color */
  MARKER_BORDER_COLOR: "#ffffff",
  /** Marker border weight */
  MARKER_BORDER_WEIGHT: 3,
  /** Padding for fitBounds when showing full route */
  FIT_BOUNDS_PADDING: [50, 50] as [number, number],
} as const

// Route status values
export const ROUTE_STATUSES = ["active", "completed", "abandoned"] as const
export type RouteStatus = (typeof ROUTE_STATUSES)[number]

// Local storage keys
export const STORAGE_KEYS = {
  PENDING_ROUTE: "trilhos_pending_route",
  DEVICE_ID: "trilhos_device_id",
} as const
