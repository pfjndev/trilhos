# Server Actions Reference

Server Actions in Trilhos provide type-safe, server-side mutations without API routes. All actions follow consistent patterns for authentication, error handling, and cache revalidation.

---

## Overview

**Location:** `app/actions/`

**Pattern:**
- Defined in `"use server"` files
- Return result objects (never throw)
- Check authentication before mutations
- Revalidate Next.js cache after changes

---

## Route Actions

**File:** `app/actions/routes.ts`

### createRoute

Creates a new route with auto-generated name using reverse geocoding.

**Signature:**
```typescript
export async function createRoute(
  startPoint: LocationPoint
): Promise<CreateRouteResult>
```

**Parameters:**
- `startPoint` - Initial GPS location point

**Returns:**
```typescript
interface CreateRouteResult {
  success: boolean
  routeId?: number
  routeName?: string
  error?: string
}
```

**Authorization:** Requires authentication

**Flow:**
1. Check user session
2. Reverse geocode start point (Nominatim API)
3. Generate route name from address
4. Insert route into database with status "active"
5. Return route ID and name

**Example:**
```typescript
const result = await createRoute({
  lat: 40.7128,
  lng: -74.0060,
  timestamp: Date.now(),
  accuracy: 10,
  altitude: null,
  speed: null,
  heading: null
})

if (result.success) {
  console.log(`Created route ${result.routeId}: ${result.routeName}`)
}
```

---

### finalizeRoute

Marks a route as completed and saves all GPS points.

**Signature:**
```typescript
export async function finalizeRoute(
  routeId: number,
  name: string,
  points: LocationPoint[],
  totalDistance: number,
  duration: number
): Promise<FinalizeRouteResult>
```

**Parameters:**
- `routeId` - Route database ID
- `name` - Custom route name (user-provided)
- `points` - Array of all GPS location points
- `totalDistance` - Total distance in meters
- `duration` - Total duration in milliseconds

**Returns:**
```typescript
interface FinalizeRouteResult {
  success: boolean
  error?: string
}
```

**Authorization:** Owner only (user must own the route)

**Flow:**
1. Check authentication
2. Verify route ownership
3. Update route:
   - Set name
   - Save points as JSON
   - Set totalDistance, duration
   - Change status to "completed"
   - Update timestamp
4. Revalidate `/history` and `/activity` paths
5. Return success

**Example:**
```typescript
const result = await finalizeRoute(
  routeId,
  "Morning Run in Central Park",
  gpsPoints,
  5420,  // 5.42 km
  1800000  // 30 minutes
)
```

---

### updateRouteName

Renames an existing route.

**Signature:**
```typescript
export async function updateRouteName(
  routeId: number,
  name: string
): Promise<UpdateRouteResult>
```

**Parameters:**
- `routeId` - Route database ID
- `name` - New route name

**Returns:**
```typescript
interface UpdateRouteResult {
  success: boolean
  error?: string
}
```

**Authorization:** Owner only

**Flow:**
1. Check authentication
2. Verify route ownership
3. Update route name
4. Revalidate route detail path
5. Return success

**Example:**
```typescript
const result = await updateRouteName(42, "Evening Bike Ride")
```

---

### deleteRoute

Permanently deletes a route.

**Signature:**
```typescript
export async function deleteRoute(
  routeId: number
): Promise<DeleteRouteResult>
```

**Parameters:**
- `routeId` - Route database ID

**Returns:**
```typescript
interface DeleteRouteResult {
  success: boolean
  error?: string
}
```

**Authorization:** Owner only

**Flow:**
1. Check authentication
2. Verify route ownership
3. Delete route from database
4. Revalidate `/history` path
5. Return success

**Example:**
```typescript
const result = await deleteRoute(42)
if (result.success) {
  router.push("/history")
}
```

---

## Authentication Actions

**File:** `app/actions/auth.ts`

### registerUser

Creates a new user account with email/password.

**Signature:**
```typescript
export async function registerUser(
  input: RegisterInput
): Promise<RegisterResult>
```

**Parameters:**
```typescript
interface RegisterInput {
  name: string
  email: string
  password: string
}
```

**Returns:**
```typescript
interface RegisterResult {
  success: boolean
  error?: string
}
```

**Validation:**
- Name: min 1 character
- Email: valid email format
- Password: min 8 characters

**Flow:**
1. Validate input with Zod schema
2. Check if email already exists
3. Hash password (bcrypt, 10 rounds)
4. Insert user into database
5. Return success

**Example:**
```typescript
const result = await registerUser({
  name: "John Doe",
  email: "john@example.com",
  password: "securePass123"
})
```

---

### loginWithCredentials

Signs in user with email and password (called by NextAuth).

**Signature:**
```typescript
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<User | null>
```

**Returns:** User object or null

**Flow:**
1. Query user by email
2. Compare password hash
3. Return user if valid, null otherwise

**Note:** This is called internally by NextAuth.js credentials provider. Not typically called directly from components.

---

### logoutUser

Signs out the current user.

**Signature:**
```typescript
export async function logoutUser(): Promise<void>
```

**Flow:**
1. Call NextAuth `signOut()`
2. Redirect to login page

**Example:**
```typescript
<Button onClick={() => logoutUser()}>
  Sign Out
</Button>
```

---

## Action Patterns

### Result Object Pattern

All actions return result objects instead of throwing errors:

```typescript
// ✅ Good - return result
export async function myAction(): Promise<ActionResult> {
  try {
    // ... operation
    return { success: true }
  } catch (error) {
    console.error("Action failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

// ❌ Avoid - throwing errors
export async function myAction() {
  // ... operation
  throw new Error("Something failed")  // Don't do this
}
```

**Benefits:**
- Predictable error handling in UI
- No try/catch needed in components
- Type-safe error messages

---

### Authentication Check

```typescript
import { auth } from "@/auth"

export async function myAction(): Promise<ActionResult> {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required" }
  }
  
  const userId = session.user.id
  // ... continue with authenticated operation
}
```

---

### Authorization Check

```typescript
export async function updateRoute(routeId: number): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required" }
  }
  
  // Verify ownership
  const route = await db.query.routesTable.findFirst({
    where: eq(routesTable.id, routeId)
  })
  
  if (!route) {
    return { success: false, error: "Route not found" }
  }
  
  if (route.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" }
  }
  
  // ... perform update
}
```

---

### Cache Revalidation

After mutations, revalidate affected paths:

```typescript
import { revalidatePath } from "next/cache"

export async function deleteRoute(routeId: number): Promise<ActionResult> {
  // ... delete operation
  
  // Revalidate list pages
  revalidatePath("/history")
  revalidatePath("/activity")
  
  return { success: true }
}
```

**When to revalidate:**
- After CREATE → revalidate list pages
- After UPDATE → revalidate detail + list pages
- After DELETE → revalidate list pages

---

## Calling from Components

### Client Components

```typescript
"use client"

import { createRoute } from "@/app/actions/routes"
import { useState } from "react"

export function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleCreate = async () => {
    setIsLoading(true)
    setError(null)
    
    const result = await createRoute(startPoint)
    
    setIsLoading(false)
    
    if (result.success) {
      // Success handling
    } else {
      setError(result.error || "Unknown error")
    }
  }
  
  return (
    <div>
      <Button onClick={handleCreate} disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Route"}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
```

---

### Form Actions

```typescript
"use client"

import { registerUser } from "@/app/actions/auth"

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  
  async function handleSubmit(formData: FormData) {
    const result = await registerUser({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    })
    
    if (!result.success) {
      setError(result.error || "Registration failed")
    }
  }
  
  return (
    <form action={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

---

## Testing Server Actions

```typescript
import { createRoute } from "./routes"
import { auth } from "@/auth"

jest.mock("@/auth")

test("createRoute requires authentication", async () => {
  (auth as jest.Mock).mockResolvedValue(null)
  
  const result = await createRoute(mockStartPoint)
  
  expect(result.success).toBe(false)
  expect(result.error).toBe("Authentication required")
})
```

---

## Next Steps

- 🧩 **[Component Reference](Component-Reference.md)** - UI components that call actions
- 🪝 **[Hooks Reference](Hooks-Reference.md)** - Hooks that wrap action calls
- 🛠️ **[Development Guide](Development-Guide.md)** - Creating new actions
- 🏗️ **[Architecture Overview](Architecture-Overview.md)** - Server Actions in the system

---

**Questions?** Check the [Development Guide](Development-Guide.md) for action creation patterns or join [GitHub Discussions](https://github.com/your-username/trilhos/discussions).
