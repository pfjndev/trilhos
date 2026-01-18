# Project Structure

This guide explains the directory layout and file organization in Trilhos.

---

## Overview

Trilhos follows the **Next.js App Router** convention with a clear separation of concerns:

```
trilhos/
├── app/           # Next.js App Router (routes, layouts, Server Actions)
├── components/    # React components (UI, features)
├── hooks/         # Custom React hooks
├── lib/           # Utilities, database, helpers
├── types/         # TypeScript type definitions
├── drizzle/       # Database migrations
├── caddy/         # Reverse proxy configuration
├── docs/          # Documentation and screenshots
└── public/        # Static assets
```

---

## `/app` Directory

Next.js App Router routes and server-side code.

### Root Files

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout with theme provider, header, navigation |
| `page.tsx` | Home page with GPS tracking interface |
| `error.tsx` | Global error boundary |
| `globals.css` | Global styles, Tailwind imports, CSS variables |

### `/app/db`

Database schema definitions.

| File | Purpose |
|------|---------|
| `schema.ts` | Drizzle ORM schema (users, routes, sessions, accounts) |

**Example:**
```typescript
export const routesTable = pgTable("routes", {
  id: serial("id").primaryKey(),
  userId: uuid("userId").references(() => usersTable.id),
  name: varchar("name", { length: 255 }).notNull(),
  // ...
})
```

### `/app/actions`

Server Actions for mutations and backend logic.

| File | Purpose |
|------|---------|
| `routes.ts` | Route CRUD operations (create, finalize, update, delete) |
| `auth.ts` | Authentication actions (register, login, logout) |

**Pattern:**
```typescript
"use server"

export async function createRoute(
  startPoint: LocationPoint
): Promise<CreateRouteResult> {
  // Auth check, DB operation, return result
}
```

### `/app/api/auth`

NextAuth.js API routes.

| File | Purpose |
|------|---------|
| `[...nextauth]/route.ts` | Auth API handler (GET/POST) |

### `/app/(auth)` Route Group

Authentication pages (login, register).

| File | Purpose |
|------|---------|
| `layout.tsx` | Centered auth layout, redirects if logged in |
| `login/page.tsx` | Login form page |
| `register/page.tsx` | Registration form page |

### `/app/activity`

Activity feed showing all users' routes.

| File | Purpose |
|------|---------|
| `page.tsx` | Activity feed page (Server Component) |

### `/app/history`

User's personal route history.

| File | Purpose |
|------|---------|
| `page.tsx` | Route history page (Server Component) |

### `/app/routes/[id]`

Dynamic route for individual route details.

| File | Purpose |
|------|---------|
| `page.tsx` | Route detail page with map and stats |
| `route-actions.tsx` | Rename/delete UI (owner only) |
| `error.tsx` | Route-specific error boundary |
| `not-found.tsx` | 404 page for missing routes |

---

## `/components` Directory

React components organized by feature and type.

### `/components/ui`

Base components from shadcn/ui (Radix primitives + Tailwind).

**Key components:**
- `button.tsx` - Button variants
- `input.tsx`, `label.tsx` - Form inputs
- `card.tsx` - Card container
- `alert-dialog.tsx` - Confirmation dialogs
- `dropdown-menu.tsx` - Dropdown menus

**Usage:**
```typescript
import { Button } from "@/components/ui/button"
```

### `/components/auth`

Authentication-related components.

| File | Purpose |
|------|---------|
| `login-form.tsx` | Login form with validation |
| `register-form.tsx` | Registration form |
| `social-buttons.tsx` | OAuth provider buttons |
| `index.ts` | Barrel export |

### `/components/layout`

Layout components (header, navigation).

| File | Purpose |
|------|---------|
| `header.tsx` | App header with logo, user menu, theme toggle |
| `bottom-nav.tsx` | Mobile bottom navigation bar |
| `user-menu.tsx` | User dropdown menu |
| `index.ts` | Barrel export |

### `/components/tracking`

GPS tracking UI components.

| File | Purpose |
|------|---------|
| `tracking-controls.tsx` | Start/Stop/Discard buttons |
| `tracking-status.tsx` | Live status indicator with pulsing dot |
| `tracking-error.tsx` | Error display for GPS issues |
| `index.ts` | Barrel export |

### `/components/shared`

Shared/reusable components.

| File | Purpose |
|------|---------|
| `route-stats-grid.tsx` | Grid displaying route statistics |
| `error-card.tsx` | Error state display |
| `index.ts` | Barrel export |

### `/components/theme`

Theme management components.

| File | Purpose |
|------|---------|
| `theme-provider.tsx` | next-themes provider wrapper |
| `theme-toggle.tsx` | Dark/light mode toggle button |
| `index.ts` | Barrel export |

### Root Component Files

| File | Purpose |
|------|---------|
| `location-tracker.tsx` | Main tracking orchestrator |
| `route-map.tsx` | Leaflet map (live tracking + static display) |
| `location-data-panel.tsx` | Position data and statistics display |
| `save-route-dialog.tsx` | Modal for naming and saving routes |
| `route-card.tsx` | Route list item component |
| `route-list.tsx` | List of routes with empty states |
| `error-boundary.tsx` | Reusable error boundary component |

---

## `/hooks` Directory

Custom React hooks for state management and side effects.

| File | Purpose |
|------|---------|
| `use-geolocation.ts` | Browser Geolocation API wrapper |
| `use-route-persistence.ts` | Route CRUD operations and state |
| `use-route-stats.ts` | Memoized route statistics calculation |
| `use-tracking-orchestrator.ts` | Facade combining all tracking hooks |
| `use-leaflet.ts` | Dynamic Leaflet loading (SSR-safe) |

**Pattern:**
```typescript
export interface UseGeolocationReturn {
  position: LocationPoint | null
  error: string | null
  isTracking: boolean
  startTracking: () => Promise<LocationPoint | null>
  stopTracking: () => void
}

export function useGeolocation(): UseGeolocationReturn {
  // Implementation
}
```

---

## `/lib` Directory

Utilities, database connections, and helper functions.

| File | Purpose |
|------|---------|
| `db.ts` | Drizzle database connection instance |
| `queries.ts` | Cached database queries with `react.cache()` |
| `constants.ts` | Configuration constants (timeouts, thresholds) |
| `geo-utils.ts` | Geolocation utilities (Haversine distance, etc.) |
| `password.ts` | bcrypt utilities (hash, compare) |
| `utils.ts` | General utilities (`cn()` class merger) |

### `/lib/validations`

Zod validation schemas.

| File | Purpose |
|------|---------|
| `auth.ts` | Login, register, and auth input schemas |

**Example:**
```typescript
export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})
```

---

## `/types` Directory

TypeScript type definitions and interfaces.

| File | Purpose |
|------|---------|
| `location-point.ts` | `LocationPoint` interface for GPS data |
| `route.ts` | Route-related type re-exports |
| `next-auth.d.ts` | NextAuth.js module augmentation |

**Example:**
```typescript
// location-point.ts
export interface LocationPoint {
  lat: number
  lng: number
  altitude: number | null
  accuracy: number
  speed: number | null
  heading: number | null
  timestamp: number
}
```

---

## `/drizzle` Directory

Database migrations generated by Drizzle Kit.

| File | Purpose |
|------|---------|
| `*.sql` | Migration SQL files |
| `meta/_journal.json` | Migration history |
| `meta/*.snapshot.json` | Schema snapshots |

**Generated by:**
```bash
npx drizzle-kit generate
```

---

## `/caddy` Directory

Caddy reverse proxy configuration files.

| File | Purpose |
|------|---------|
| `Caddyfile` | Production Caddy config (Let's Encrypt) |
| `Caddyfile.dev` | Development Caddy config (local TLS) |

**Used in:**
- Docker Compose for HTTPS development
- Mobile device testing

---

## `/docs` Directory

Documentation and assets.

| Subdirectory | Purpose |
|--------------|---------|
| `screenshots/` | App screenshots (light/dark modes) |
| `wiki/` | GitHub Wiki documentation files |

---

## `/public` Directory

Static assets served at the root path.

**Common files:**
- `favicon.ico` - Browser favicon
- `manifest.json` - PWA manifest (future)
- Images, fonts (if not using Next.js optimizations)

---

## Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and npm scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `drizzle.config.ts` | Drizzle Kit configuration |
| `auth.ts` | Full NextAuth.js configuration |
| `auth.config.ts` | Edge-compatible auth config |
| `proxy.ts` | Next.js middleware (route protection) |
| `postcss.config.mjs` | PostCSS configuration (Tailwind) |
| `components.json` | shadcn/ui configuration |
| `eslint.config.mjs` | ESLint configuration |
| `.env.local` | Environment variables (gitignored) |
| `.env.example` | Example environment variables |
| `docker-compose.yml` | Production Docker setup |
| `docker-compose.dev.yml` | Development Docker setup |
| `Dockerfile` | Production container image |
| `Dockerfile.dev` | Development container image |

---

## File Naming Conventions

### Components

| Type | Convention | Example |
|------|------------|---------|
| Component files | kebab-case | `location-tracker.tsx` |
| Component names | PascalCase | `LocationTracker` |

### Hooks

| Type | Convention | Example |
|------|------------|---------|
| Hook files | `use-` prefix + kebab-case | `use-geolocation.ts` |
| Hook names | `use` prefix + camelCase | `useGeolocation` |

### Server Actions

| Type | Convention | Example |
|------|------------|---------|
| Action files | kebab-case | `routes.ts` |
| Action names | camelCase | `createRoute` |

### Utilities

| Type | Convention | Example |
|------|------------|---------|
| Utility files | kebab-case | `geo-utils.ts` |
| Utility functions | camelCase | `calculateDistance` |

### Constants

| Type | Convention | Example |
|------|------------|---------|
| Constant names | SCREAMING_SNAKE_CASE | `AUTO_SAVE_INTERVAL` |

---

## Import Patterns

### Path Aliases

All imports use the `@/*` alias (maps to project root):

```typescript
// Correct ✅
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import type { LocationPoint } from "@/types/location-point"

// Avoid ❌
import { Button } from "../../components/ui/button"
```

### Type-Only Imports

```typescript
// Use type-only imports for types
import type { Route } from "@/app/db/schema"
import type { UseGeolocationReturn } from "@/hooks/use-geolocation"
```

### Barrel Exports

Some directories use `index.ts` for cleaner imports:

```typescript
// components/layout/index.ts
export { Header } from "./header"
export { BottomNav } from "./bottom-nav"
export { UserMenu } from "./user-menu"

// Usage
import { Header, BottomNav } from "@/components/layout"
```

---

## Module Boundaries

### Server-Only Code

Files that should **never** be imported in Client Components:

- `lib/db.ts` - Database connection
- `lib/queries.ts` - Database queries
- `lib/password.ts` - bcrypt operations
- `app/actions/*.ts` - Server Actions (can be called, not imported)

### Client-Only Code

Files that should **only** be imported in Client Components:

- `hooks/*.ts` - React hooks
- Browser API wrappers (Geolocation, localStorage)

### Universal Code

Can be used in both Server and Client Components:

- `types/*.ts` - TypeScript types
- `lib/utils.ts` - Pure utility functions
- `lib/geo-utils.ts` - Mathematical calculations

---

## Next Steps

- 🧩 **[Component Reference](Component-Reference.md)** - Explore UI components
- 🪝 **[Hooks Reference](Hooks-Reference.md)** - Custom hooks deep-dive
- ⚡ **[Server Actions Reference](Server-Actions-Reference.md)** - Backend actions
- 🛠️ **[Development Guide](Development-Guide.md)** - Code patterns and style

---

**Questions?** Check the [Architecture Overview](Architecture-Overview.md) or join [GitHub Discussions](https://github.com/your-username/trilhos/discussions).
