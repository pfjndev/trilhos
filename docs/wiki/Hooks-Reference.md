# Hooks Reference

Custom React hooks for state management, side effects, and GPS tracking functionality.

---

## Overview

Trilhos uses custom hooks to encapsulate complex logic and provide clean interfaces for components. All hooks follow the `use` prefix naming convention and are located in the `/hooks` directory.

---

## GPS Tracking Hooks

### useGeolocation

**Location:** `hooks/use-geolocation.ts`

**Purpose:** Wraps the browser Geolocation API for high-accuracy position tracking.

**Return Type:**
```typescript
export interface UseGeolocationReturn {
  position: LocationPoint | null
  error: string | null
  isTracking: boolean
  startTracking: () => Promise<LocationPoint | null>
  stopTracking: () => void
}
```

**Usage:**
```typescript
const { position, error, isTracking, startTracking, stopTracking } = useGeolocation()
```

**Features:**
- High-accuracy GPS mode
- Continuous position watching
- Permission handling
- Error management (permission denied, timeout, etc.)
- Automatic cleanup on unmount

**Configuration:**
```typescript
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
}
```

---

### useRoutePersistence

**Location:** `hooks/use-route-persistence.ts`

**Purpose:** Manages route state and database operations (create, update, finalize).

**Return Type:**
```typescript
export interface UseRoutePersistenceReturn {
  routeId: number | null
  routeName: string
  isSaving: boolean
  createRoute: (startPoint: LocationPoint) => Promise<void>
  finalizeRoute: (points: LocationPoint[], stats: RouteStats) => Promise<boolean>
  discardRoute: () => Promise<void>
}
```

**Usage:**
```typescript
const { routeId, routeName, createRoute, finalizeRoute } = useRoutePersistence()
```

**Features:**
- Server Action integration
- Auto-generated route names (reverse geocoding)
- Optimistic updates
- Error handling

**Flow:**
1. `createRoute()` - Creates route in database with start point
2. User tracks GPS positions (client-side)
3. `finalizeRoute()` - Saves all points and marks as completed

---

### useRouteStats

**Location:** `hooks/use-route-stats.ts`

**Purpose:** Memoized calculation of route statistics (distance, duration, speed).

**Return Type:**
```typescript
export interface UseRouteStatsReturn {
  totalDistance: number  // meters
  duration: number       // milliseconds
  pointCount: number
  avgSpeed: number | null  // m/s
}
```

**Usage:**
```typescript
const stats = useRouteStats(route, startTime)
```

**Parameters:**
```typescript
function useRouteStats(
  points: LocationPoint[],
  startTime: number | null
): UseRouteStatsReturn
```

**Calculations:**
- **Distance:** Haversine formula between consecutive points
- **Duration:** Current time - start time (or last point - first point timestamp)
- **Average Speed:** Total distance / duration

**Performance:**
- Uses `useMemo` to recalculate only when points change
- Efficient for real-time tracking

---

### useTrackingOrchestrator

**Location:** `hooks/use-tracking-orchestrator.ts`

**Purpose:** Facade hook that combines all tracking hooks into a single interface.

**Return Type:**
```typescript
interface TrackingState {
  isTracking: boolean
  currentPosition: LocationPoint | null
  route: LocationPoint[]
  routeName: string
  error: string | null
  stats: { totalDistance: number; duration: number; pointCount: number }
  showSaveDialog: boolean
  isSaving: boolean
}

interface TrackingActions {
  startTracking: () => Promise<void>
  stopTracking: () => void
  discardRoute: () => Promise<void>
  saveRoute: (name: string) => Promise<boolean>
  closeSaveDialog: () => void
}

export interface UseTrackingOrchestratorReturn {
  state: TrackingState
  actions: TrackingActions
}
```

**Usage:**
```typescript
const { state, actions } = useTrackingOrchestrator()

// Access state
const { isTracking, currentPosition, route, stats, error } = state

// Call actions
<Button onClick={actions.startTracking}>Start</Button>
<Button onClick={actions.stopTracking}>Stop</Button>
```

**Combines:**
- `useGeolocation` - GPS position tracking
- `useRoutePersistence` - Route database operations
- `useRouteStats` - Statistics calculation
- Local state for route points array

**Flow:**
1. `startTracking()` - Starts GPS, creates route in DB
2. GPS positions automatically added to route array
3. `stopTracking()` - Shows save dialog
4. `saveRoute(name)` - Finalizes route with custom name
5. `discardRoute()` - Deletes route without saving

---

## Map Hooks

### useLeaflet

**Location:** `hooks/use-leaflet.ts`

**Purpose:** Dynamically load Leaflet library and CSS (SSR-safe).

**Return Type:**
```typescript
export interface UseLeafletReturn {
  L: typeof import('leaflet') | null
  isLoading: boolean
  error: Error | null
}
```

**Usage:**
```typescript
const { L, isLoading, error } = useLeaflet()

if (isLoading) return <div>Loading map...</div>
if (error) return <div>Map error: {error.message}</div>
if (!L) return null

// Use Leaflet
const map = L.map(...)
```

**Features:**
- Dynamic import (client-side only)
- CSS injection into document head
- Loading and error states
- Cleanup on unmount

**Why needed:**
- Leaflet expects `window` object
- Next.js renders on server where `window` doesn't exist
- Dynamic import ensures client-side only loading

---

## Hook Composition Patterns

### Facade Pattern

`useTrackingOrchestrator` demonstrates the facade pattern:

```typescript
export function useTrackingOrchestrator() {
  // Compose multiple hooks
  const geo = useGeolocation()
  const persistence = useRoutePersistence()
  const [route, setRoute] = useState<LocationPoint[]>([])
  const stats = useRouteStats(route, startTime)
  
  // Combine into unified interface
  return {
    state: { ...geo, ...persistence, route, stats },
    actions: { startTracking, stopTracking, ... }
  }
}
```

**Benefits:**
- Single import for components
- Coordinated state updates
- Simplified testing

---

### Custom Hook Best Practices

#### 1. Return Type Interfaces

```typescript
// ✅ Good - explicit return type
export interface UseMyHookReturn {
  data: DataType
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useMyHook(): UseMyHookReturn {
  // ...
}
```

#### 2. Cleanup Effects

```typescript
export function useGeolocation() {
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(...)
    
    // Cleanup function
    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])
}
```

#### 3. Dependency Arrays

```typescript
// ✅ Explicit dependencies
useMemo(() => calculateStats(points), [points])

// ❌ Missing dependencies (ESLint will warn)
useMemo(() => calculateStats(points), [])
```

#### 4. Error Handling

```typescript
export function useGeolocation() {
  const [error, setError] = useState<string | null>(null)
  
  const handleError = (err: GeolocationPositionError) => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError("Location permission denied")
        break
      case err.POSITION_UNAVAILABLE:
        setError("Location unavailable")
        break
      case err.TIMEOUT:
        setError("Location request timed out")
        break
    }
  }
}
```

---

## Testing Hooks

### Unit Testing

```typescript
import { renderHook, act } from '@testing-library/react'
import { useGeolocation } from './use-geolocation'

test('starts and stops tracking', () => {
  const { result } = renderHook(() => useGeolocation())
  
  expect(result.current.isTracking).toBe(false)
  
  act(() => {
    result.current.startTracking()
  })
  
  expect(result.current.isTracking).toBe(true)
})
```

---

## Next Steps

- 🧩 **[Component Reference](Component-Reference.md)** - See how hooks are used in components
- ⚡ **[Server Actions Reference](Server-Actions-Reference.md)** - Server-side operations
- 🛠️ **[Development Guide](Development-Guide.md)** - Creating custom hooks
- 🏗️ **[Architecture Overview](Architecture-Overview.md)** - State management patterns

---

**Questions?** Check the [Project Structure](Project-Structure.md) or join [GitHub Discussions](https://github.com/your-username/trilhos/discussions).
