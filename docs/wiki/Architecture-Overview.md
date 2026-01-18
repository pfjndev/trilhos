# Architecture Overview

This document explains the system design, data flow, and key architectural decisions in Trilhos.

---

## System Architecture

### High-Level Overview

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser    │────────▶│   Next.js    │────────▶│  PostgreSQL  │
│              │         │              │         │              │
│ • GPS API    │         │ • SSR/RSC    │         │ • Users      │
│ • Leaflet    │         │ • Server     │         │ • Routes     │
│ • React UI   │◀────────│   Actions    │◀────────│ • Sessions   │
│              │         │ • Middleware │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
     │                         │                         │
     │                         │                         │
     └─────────────────────────┴─────────────────────────┘
                   OAuth Providers (Google, GitHub)
```

### Data Flow: GPS Tracking

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Start Tracking"                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. useGeolocation hook requests browser location permission    │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Browser Geolocation API returns position                    │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Server Action creates route in database                     │
│    • Reverse geocode for auto-naming (Nominatim)               │
│    • Insert into routes table with status "active"             │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Route ID returned to client                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. GPS positions collected in client state                     │
│    • useGeolocation watchPosition()                            │
│    • Points stored in route array                              │
│    • Map updates with polyline                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. User clicks "Stop Tracking"                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Server Action finalizes route                               │
│    • Calculate statistics (distance, duration)                 │
│    • Save all points as JSON                                   │
│    • Update status to "completed"                              │
│    • Revalidate /history path                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

The application uses PostgreSQL with Drizzle ORM. The schema includes NextAuth.js tables plus a custom `routes` table.

### Entity Relationship Diagram

```
┌─────────────────────┐       ┌─────────────────────┐
│       users         │       │      accounts       │
│─────────────────────│       │─────────────────────│
│ id (PK, UUID)       │◀──────│ userId (FK)         │
│ name                │       │ type                │
│ email (UNIQUE)      │       │ provider            │
│ emailVerified       │       │ providerAccountId   │
│ image               │       │ (PK: provider +     │
│ passwordHash        │       │      providerAcctId)│
└──────────┬──────────┘       └─────────────────────┘
           │
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐       ┌─────────────────────┐
│      sessions       │       │       routes        │
│─────────────────────│       │─────────────────────│
│ sessionToken (PK)   │       │ id (PK, SERIAL)     │
│ userId (FK)         │       │ userId (FK, NULL)   │
│ expires             │       │ name                │
└─────────────────────┘       │ points (JSON)       │
                              │ totalDistance       │
                              │ duration            │
                              │ status              │
                              │ createdAt           │
                              │ updatedAt           │
                              └─────────────────────┘
```

### Table Definitions

#### `users`

User accounts table (NextAuth.js)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | User unique identifier |
| `name` | VARCHAR(255) | | Display name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| `emailVerified` | TIMESTAMP | | Email verification date |
| `image` | TEXT | | Profile image URL |
| `passwordHash` | VARCHAR(255) | | bcrypt hash (null for OAuth) |

**Indexes:**
- Primary key on `id`
- Unique index on `email`

---

#### `routes`

GPS routes table (custom)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Route unique identifier |
| `userId` | UUID | FK users(id) ON DELETE SET NULL | Route owner |
| `name` | VARCHAR(255) | NOT NULL | Route name |
| `points` | JSON | NOT NULL | Array of LocationPoint objects |
| `totalDistance` | REAL | NOT NULL DEFAULT 0 | Distance in meters |
| `duration` | INTEGER | NOT NULL DEFAULT 0 | Duration in milliseconds |
| `status` | VARCHAR(20) | NOT NULL DEFAULT 'active' | `active` or `completed` |
| `createdAt` | TIMESTAMP | NOT NULL DEFAULT NOW() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL DEFAULT NOW() | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `userId` for efficient user route queries
- Index on `createdAt` for sorting

**Constraints:**
- Foreign key to `users(id)` with `ON DELETE SET NULL` (preserve routes if user deleted)

**LocationPoint Schema (JSON):**
```typescript
interface LocationPoint {
  lat: number
  lng: number
  altitude: number | null
  accuracy: number
  speed: number | null
  heading: number | null
  timestamp: number  // Unix milliseconds
}
```

---

#### `accounts`

OAuth accounts table (NextAuth.js)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `userId` | UUID | FK users(id) ON DELETE CASCADE | User identifier |
| `type` | VARCHAR | NOT NULL | Account type (`oauth`) |
| `provider` | VARCHAR | NOT NULL | Provider name (`google`, `github`) |
| `providerAccountId` | VARCHAR | NOT NULL | Provider's user ID |
| `refresh_token` | TEXT | | OAuth refresh token |
| `access_token` | TEXT | | OAuth access token |
| `expires_at` | INTEGER | | Token expiration |
| `token_type` | VARCHAR | | Token type |
| `scope` | VARCHAR | | OAuth scopes |
| `id_token` | TEXT | | OAuth ID token |

**Primary Key:** Composite (`provider`, `providerAccountId`)

**Indexes:**
- Index on `userId` for user lookups

---

#### `sessions`

Active sessions table (NextAuth.js)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `sessionToken` | TEXT | PRIMARY KEY | Unique session token |
| `userId` | UUID | FK users(id) ON DELETE CASCADE | User identifier |
| `expires` | TIMESTAMP | NOT NULL | Session expiration |

**Indexes:**
- Primary key on `sessionToken`
- Index on `userId` for user session lookups

---

## Authentication

### Authentication Flow

#### Email/Password Registration

```
1. User submits registration form
   └─▶ Zod validates input (email, password, name)
        └─▶ Server Action: registerUser()
             ├─▶ Check if email exists
             ├─▶ Hash password with bcrypt (10 rounds)
             ├─▶ Insert into users table
             └─▶ Return success/error
```

#### Email/Password Login

```
1. User submits login form
   └─▶ Credentials provider authenticates
        └─▶ Query user by email
             ├─▶ Compare password hash (bcrypt)
             ├─▶ Create session in database
             └─▶ Set session cookie
```

#### OAuth Login (Google/GitHub)

```
1. User clicks "Sign in with Google"
   └─▶ Redirect to Google OAuth
        └─▶ User authorizes
             └─▶ Callback to /api/auth/callback/google
                  ├─▶ Exchange code for tokens
                  ├─▶ Fetch user profile
                  ├─▶ Create/update user in database
                  ├─▶ Create account link in accounts table
                  ├─▶ Create session
                  └─▶ Redirect to app
```

### Route Protection

Middleware (`proxy.ts`) protects routes:

```typescript
// Public routes (no auth required)
const publicRoutes = ['/login', '/register', '/api/auth/*']

// All other routes require authentication
// Unauthenticated → redirect to /login?callbackUrl=<requested-path>
// Authenticated users on /login or /register → redirect to /
```

**Implementation:**
```typescript
export default auth((req) => {
  const { nextUrl } = req
  const isAuthenticated = !!req.auth
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)
  
  if (isAuthRoute && isAuthenticated) {
    return Response.redirect(new URL('/', nextUrl))
  }
  
  if (!isAuthRoute && !isAuthenticated) {
    return Response.redirect(
      new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
    )
  }
})
```

### Session Management

- **Database sessions** using Drizzle adapter
- **Cookie-based** session tokens
- **Secure & httpOnly** flags in production
- **30-day expiration** (default)
- **Sliding expiration** - extends on activity

---

## Component Architecture

### Server vs Client Components

```
app/
├── layout.tsx (Server)              # Root layout
│   ├── Header (Server)              # User data fetched server-side
│   │   ├── UserMenu (Client)        # Dropdown interaction
│   │   └── ThemeToggle (Client)     # Theme state
│   └── BottomNav (Server)           # Static navigation
│
├── page.tsx (Server)                # Home page
│   └── LocationTracker (Client)     # GPS requires browser API
│       ├── RouteMap (Client)        # Leaflet (browser-only)
│       ├── LocationDataPanel (Client) # Real-time updates
│       └── TrackingControls (Client)  # Button interactions
│
├── history/page.tsx (Server)        # Fetch routes server-side
│   └── RouteList (Client)           # List interactions
│       └── RouteCard (Server)       # Can be server component
│
└── routes/[id]/page.tsx (Server)    # Fetch route server-side
    ├── RouteDetailMap (Client)      # Leaflet map
    └── RouteActions (Client)        # Rename/delete buttons
```

**Guidelines:**
- **Default to Server** - Use Server Components unless you need:
  - Browser APIs (Geolocation, localStorage)
  - Event handlers (onClick, onChange)
  - React hooks (useState, useEffect)
  - Client-only libraries (Leaflet)
- **Pass data down** - Server → Client via props (serializable only)
- **Server Actions** - Client components call server functions

---

## State Management

### Client State

**Local State (useState):**
- Form inputs
- Dialog open/closed
- UI toggles

**Hooks for Complex State:**
- `useGeolocation` - GPS position tracking
- `useRoutePersistence` - Route CRUD operations
- `useRouteStats` - Memoized calculations
- `useTrackingOrchestrator` - Facade combining above

### Server State

**Database Queries:**
- React cache() for deduplication
- Server Components fetch directly
- No client-side cache needed

**Mutations:**
- Server Actions
- Optimistic UI (future enhancement)
- Revalidate paths after mutations

---

## Performance Optimizations

### Code Splitting

- **Automatic** - Next.js splits by route
- **Dynamic imports** - Leaflet loaded only when needed
- **React.lazy** - Component-level splitting

### Data Fetching

- **Server Components** - Zero waterfall fetching
- **Parallel queries** - Multiple DB calls in parallel
- **Cached queries** - React cache() deduplicates

### Image Optimization

- `next/image` component
- Automatic WebP conversion
- Lazy loading
- Responsive sizes

### Bundle Size

- **Tree shaking** - Unused code eliminated
- **Server Components** - Less client JavaScript
- **Route splitting** - Load only needed code

---

## Security

### Authentication

- **bcrypt** hashing (10 rounds)
- **Secure session cookies** (httpOnly, secure in prod)
- **CSRF protection** (NextAuth.js built-in)

### Authorization

- **Owner checks** - Users can only modify their routes
- **Server-side validation** - Never trust client input
- **SQL injection prevention** - Drizzle parameterized queries

### Data Privacy

- **User isolation** - Routes tied to users
- **Soft delete option** - Routes preserved if user deleted
- **No public PII** - Email/passwords never exposed

---

## Next Steps

Now that you understand the architecture:

- 📂 **[Project Structure](Project-Structure.md)** - Navigate the codebase
- 🧩 **[Component Reference](Component-Reference.md)** - Explore components
- 🪝 **[Hooks Reference](Hooks-Reference.md)** - Custom hooks deep-dive
- ⚡ **[Server Actions Reference](Server-Actions-Reference.md)** - Backend actions

---

**Questions?** Join the [GitHub Discussions](https://github.com/your-username/trilhos/discussions) or check the [Development Guide](Development-Guide.md).
