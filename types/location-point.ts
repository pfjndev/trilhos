export interface LocationPoint {
  latitude: number,
  longitude: number,
  altitude: number | null,
  accuracy: number,
  altitudeAccuracy: number | null,
  heading: number | null,
  speed: number | null,
  timestamp: number
}

export interface LocationDataPanelProps {
  currentPosition: LocationPoint | null
  route: LocationPoint[]
  isTracking: boolean
}