# Component Reference

A catalog of all key React components in Trilhos, organized by feature and type.

---

## Core Tracking Components

### LocationTracker

**Location:** `components/location-tracker.tsx`

**Purpose:** Main GPS tracking UI orchestrator that combines map, data panel, and controls.

**Type:** Client Component (`"use client"`)

**Dependencies:**
- `useTrackingOrchestrator` hook
- `RouteMap`, `LocationDataPanel`, `TrackingControls`, `SaveRouteDialog`

**Key Features:**
- Coordinates all tracking functionality
- Manages tracking state (start/stop/save)
- Handles save dialog interactions
- Displays errors from GPS

---

### Route Map

**Location:** `components/route-map.tsx`

**Purpose:** Unified Leaflet map for both live tracking and static route display.

**Type:** Client Component

**Props:**
```typescript
interface RouteMapProps {
  points: LocationPoint[]
  currentPosition?: LocationPoint | null
  isLive?: boolean  // true for tracking, false for static display
  className?: string
}
```

**Key Features:**
- Dynamic Leaflet loading (SSR-safe)
- OpenStreetMap tile layer
- Polyline for route visualization
- Position marker for current location
- Auto-fit bounds to route

**Usage:**
```typescript
// Live tracking
<RouteMap 
  points={route} 
  currentPosition={position} 
  isLive={true} 
/>

// Static display
<RouteMap points={route.points} isLive={false} />
```

---

### LocationDataPanel

**Location:** `components/location-data-panel.tsx`

**Purpose:** Displays current GPS position data and live route statistics.

**Type:** Client Component

**Props:**
```typescript
interface LocationDataPanelProps {
  position: LocationPoint | null
  stats: {
    totalDistance: number
    duration: number
    pointCount: number
  }
  isTracking: boolean
}
```

**Displays:**
- Latitude, longitude, altitude
- Speed and heading
- Accuracy
- Total distance, duration
- Point count

---

### SaveRouteDialog

**Location:** `components/save-route-dialog.tsx`

**Purpose:** Modal dialog for naming and saving completed routes.

**Type:** Client Component

**Props:**
```typescript
interface SaveRouteDialogProps {
  open: boolean
  defaultName: string
  onSave: (name: string) => void
  onClose: () => void
  isSaving?: boolean
}
```

**Features:**
- Input validation (min 1 character)
- Loading state during save
- Keyboard shortcuts (Enter to save, Esc to close)

---

## Tracking Sub-Components

### TrackingControls

**Location:** `components/tracking/tracking-controls.tsx`

**Purpose:** Start/Stop/Discard action buttons.

**Props:**
```typescript
interface TrackingControlsProps {
  isTracking: boolean
  hasRoute: boolean
  onStart: () => void
  onStop: () => void
  onDiscard: () => void
  disabled?: boolean
}
```

**Button States:**
- **Start** - Only shown when not tracking
- **Stop** - Only shown when tracking
- **Discard** - Only shown when route exists and not tracking

---

### TrackingStatus

**Location:** `components/tracking/tracking-status.tsx`

**Purpose:** Live status indicator with animated pulsing dot.

**Props:**
```typescript
interface TrackingStatusProps {
  isTracking: boolean
  pointCount: number
}
```

**Display:**
- Green pulsing dot when tracking
- "Tracking..." or "Stopped" text
- Point count

---

### TrackingError

**Location:** `components/tracking/tracking-error.tsx`

**Purpose:** Error display for GPS/geolocation issues.

**Props:**
```typescript
interface TrackingErrorProps {
  error: string | null
}
```

---

## Layout Components

### Header

**Location:** `components/layout/header.tsx`

**Purpose:** App header with logo, user menu, and theme toggle.

**Type:** Can be Server or Client Component

**Features:**
- App logo and title
- User menu (if authenticated)
- Theme toggle
- Responsive design

---

### BottomNav

**Location:** `components/layout/bottom-nav.tsx`

**Purpose:** Mobile-first bottom navigation bar.

**Type:** Server Component

**Features:**
- 4 navigation items: Home, Activity, History, Profile
- Active state indicators
- Safe area padding for notched devices
- Icon + label layout

---

### UserMenu

**Location:** `components/layout/user-menu.tsx`

**Purpose:** Dropdown menu for user actions.

**Type:** Client Component

**Features:**
- User name and email display
- Navigation links (Profile, Settings)
- Logout button
- Uses Radix DropdownMenu

---

## Route Display Components

### RouteCard

**Location:** `components/route-card.tsx`

**Purpose:** List item component for displaying route preview.

**Type:** Server Component (can be)

**Props:**
```typescript
interface RouteCardProps {
  route: Route
  showUser?: boolean  // Show username for activity feed
}
```

**Displays:**
- Route name
- Creation date
- Distance, duration, point count
- User name (if showUser=true)
- Link to route detail page

---

### RouteList

**Location:** `components/route-list.tsx`

**Purpose:** List of routes with empty state handling.

**Type:** Client Component (for loading states)

**Props:**
```typescript
interface RouteListProps {
  routes: Route[]
  emptyMessage?: string
  showUser?: boolean
}
```

**Features:**
- Grid layout
- Empty state with custom message
- Loading skeleton (future)

---

## Shared/Utility Components

### RouteStatsGrid

**Location:** `components/shared/route-stats-grid.tsx`

**Purpose:** Grid display for route statistics.

**Type:** Server Component

**Props:**
```typescript
interface RouteStatsGridProps {
  distance: number
  duration: number
  pointCount: number
  avgSpeed?: number
}
```

**Display:**
- Distance (km)
- Duration (formatted)
- Point count
- Average speed (if provided)

---

### ErrorCard

**Location:** `components/shared/error-card.tsx`

**Purpose:** Consistent error state display.

**Type:** Server Component

**Props:**
```typescript
interface ErrorCardProps {
  title?: string
  message: string
  retry?: () => void
}
```

---

## Authentication Components

### LoginForm

**Location:** `components/auth/login-form.tsx`

**Purpose:** Login form with email/password validation.

**Type:** Client Component

**Features:**
- Zod validation
- Server Action integration
- Error display
- Loading states

---

### RegisterForm

**Location:** `components/auth/register-form.tsx`

**Purpose:** Registration form with validation.

**Type:** Client Component

**Fields:**
- Name
- Email
- Password (min 8 characters)

---

### SocialButtons

**Location:** `components/auth/social-buttons.tsx`

**Purpose:** OAuth provider sign-in buttons.

**Type:** Client Component

**Providers:**
- Google
- GitHub

---

## Theme Components

### ThemeProvider

**Location:** `components/theme/theme-provider.tsx`

**Purpose:** Wrapper for next-themes provider.

**Type:** Client Component

**Features:**
- System theme detection
- Persistent preference
- Dark/light modes

---

### ThemeToggle

**Location:** `components/theme/theme-toggle.tsx`

**Purpose:** Toggle button for switching themes.

**Type:** Client Component

**Display:**
- Sun icon (light mode)
- Moon icon (dark mode)
- Smooth transition

---

## UI Primitives (shadcn/ui)

Located in `components/ui/`, these are base components from shadcn/ui:

| Component | Purpose |
|-----------|---------|
| `button.tsx` | Button with variants (default, destructive, outline, ghost) |
| `input.tsx` | Text input field |
| `label.tsx` | Form label |
| `card.tsx` | Card container with header/content/footer |
| `alert-dialog.tsx` | Confirmation dialog |
| `dropdown-menu.tsx` | Dropdown menu (Radix primitive) |

**Usage:**
```typescript
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
```

---

## Component Patterns

### Server vs Client

**Use Server Components when:**
- No interactivity needed
- Fetching data from database
- No browser APIs required
- No React hooks (useState, useEffect)

**Use Client Components when:**
- Event handlers (onClick, onChange)
- Browser APIs (Geolocation, localStorage)
- React hooks
- Third-party client libraries (Leaflet)

### Props Best Practices

```typescript
// ✅ Good - explicit interface
interface MyComponentProps {
  title: string
  count: number
  onAction?: () => void  // Optional props last
  className?: string
}

export function MyComponent({ 
  title, 
  count, 
  onAction, 
  className 
}: MyComponentProps) {
  // ...
}
```

### Composition

Prefer composition over complex props:

```typescript
// ✅ Good
<Card>
  <CardHeader>
    <CardTitle>Route Name</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// ❌ Avoid
<Card title="Route Name" content={<div>...</div>} />
```

---

## Next Steps

- 🪝 **[Hooks Reference](Hooks-Reference.md)** - Custom React hooks
- ⚡ **[Server Actions Reference](Server-Actions-Reference.md)** - Backend actions
- 🛠️ **[Development Guide](Development-Guide.md)** - Component creation patterns
- 🏗️ **[Architecture Overview](Architecture-Overview.md)** - Component hierarchy

---

**Questions?** Check the [Project Structure](Project-Structure.md) or join [GitHub Discussions](https://github.com/your-username/trilhos/discussions).
