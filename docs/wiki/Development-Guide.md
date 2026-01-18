# Development Guide

Guidelines and best practices for contributing to Trilhos.

---

## Code Style Guidelines

### Imports

Always use the `@/*` path alias (maps to project root):

```typescript
// ✅ Good - use path aliases
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import type { LocationPoint } from "@/types/location-point"

// ✅ Good - type-only imports
import type { Route } from "@/app/db/schema"

// ❌ Avoid - relative imports
import { Button } from "../../components/ui/button"
```

---

### Naming Conventions

| Category | Convention | Example |
|----------|------------|---------|
| Files (components) | kebab-case | `location-tracker.tsx` |
| Files (hooks) | `use-` prefix, kebab-case | `use-geolocation.ts` |
| Components | PascalCase | `LocationTracker` |
| Hooks | `use` prefix, camelCase | `useGeolocation` |
| Interfaces/Types | PascalCase | `LocationPoint`, `UseGeolocationReturn` |
| Constants | SCREAMING_SNAKE_CASE | `AUTO_SAVE_CONFIG`, `STORAGE_KEYS` |
| Server Actions | camelCase | `createRoute`, `updateRouteName` |
| Database tables | camelCase + `Table` suffix | `routesTable`, `usersTable` |

---

### TypeScript Patterns

#### Drizzle Inferred Types

```typescript
// Infer types from schema
export type Route = typeof routesTable.$inferSelect
export type NewRoute = typeof routesTable.$inferInsert

// Usage
const route: Route = await db.query.routesTable.findFirst(...)
const newRoute: NewRoute = { name: "...", userId: "..." }
```

---

#### Const Assertions for Union Types

```typescript
export const ROUTE_STATUSES = ["active", "completed", "abandoned"] as const
export type RouteStatus = (typeof ROUTE_STATUSES)[number]

// Type is: "active" | "completed" | "abandoned"
```

---

#### Component Props Interfaces

```typescript
interface SaveRouteDialogProps {
  open: boolean
  defaultName: string
  onSave: (name: string) => void
  isSaving?: boolean  // Optional props last
}

export function SaveRouteDialog({ 
  open, 
  defaultName, 
  onSave, 
  isSaving = false 
}: SaveRouteDialogProps) {
  // ...
}
```

---

### React Patterns

#### Server Components (Default)

```typescript
// No directive needed - Server Component by default
export default async function Page() {
  const routes = await db.query.routesTable.findMany()
  
  return <div>{/* ... */}</div>
}
```

---

#### Client Components

```typescript
// Require "use client" directive
"use client"

export function LocationTracker() {
  const [isTracking, setIsTracking] = useState(false)
  
  return <div>{/* ... */}</div>
}
```

**When to use:**
- Browser APIs (Geolocation, localStorage)
- Event handlers (onClick, onChange)
- React hooks (useState, useEffect, etc.)
- Client-only libraries (Leaflet)

---

#### Server Actions

```typescript
// Require "use server" directive
"use server"

export async function createRoute(
  startPoint: LocationPoint
): Promise<CreateRouteResult> {
  // ... implementation
}
```

---

## Adding Components

### Step 1: Create the File

Location: `components/` (or appropriate subdirectory)

Filename: kebab-case (e.g., `my-component.tsx`)

```typescript
// components/my-component.tsx
"use client"  // If interactive

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MyComponentProps {
  title: string
  count?: number
  className?: string
}

export function MyComponent({ 
  title, 
  count = 0, 
  className 
}: MyComponentProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {count > 0 && <span>({count})</span>}
      <Button>Action</Button>
    </div>
  )
}
```

### Step 2: Export from Index (Optional)

For subdirectories, use barrel exports:

```typescript
// components/my-feature/index.ts
export { MyComponent } from "./my-component"
export { MyOtherComponent } from "./my-other-component"
```

### Step 3: Use the Component

```typescript
import { MyComponent } from "@/components/my-component"

<MyComponent title="Hello" count={5} />
```

---

## Adding Server Actions

### Step 1: Create the Action File

Location: `app/actions/`

Filename: Descriptive, kebab-case

```typescript
// app/actions/my-action.ts
"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { myTable } from "@/app/db/schema"

interface MyActionResult {
  success: boolean
  data?: MyData
  error?: string
}

export async function myAction(
  input: MyInput
): Promise<MyActionResult> {
  // 1. Check authentication
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required" }
  }
  
  // 2. Validate input (optional - use Zod)
  // const validated = mySchema.safeParse(input)
  
  try {
    // 3. Perform database operation
    const result = await db.insert(myTable).values({
      userId: session.user.id,
      ...input
    }).returning()
    
    // 4. Revalidate affected paths
    revalidatePath("/my-page")
    
    // 5. Return success
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Action failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
```

### Step 2: Call from Component

```typescript
"use client"

import { myAction } from "@/app/actions/my-action"
import { useState } from "react"

export function MyForm() {
  const [isLoading, setIsLoading] = useState(false)
  
  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const result = await myAction({ /* input */ })
    setIsLoading(false)
    
    if (result.success) {
      // Handle success
    } else {
      // Handle error
      console.error(result.error)
    }
  }
  
  return <form action={handleSubmit}>{/* ... */}</form>
}
```

---

## Adding Custom Hooks

### Step 1: Create the Hook File

Location: `hooks/`

Filename: `use-` prefix, kebab-case

```typescript
// hooks/use-my-hook.ts
import { useState, useEffect } from "react"

export interface UseMyHookReturn {
  data: DataType | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useMyHook(param: string): UseMyHookReturn {
  const [data, setData] = useState<DataType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await fetch(`/api/${param}`)
      setData(await result.json())
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [param])
  
  return { data, isLoading, error, refetch: fetchData }
}
```

### Step 2: Use the Hook

```typescript
"use client"

import { useMyHook } from "@/hooks/use-my-hook"

export function MyComponent() {
  const { data, isLoading, error, refetch } = useMyHook("param")
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{/* Render data */}</div>
}
```

---

## Error Handling Patterns

### Server Actions

Always return result objects (never throw):

```typescript
export async function createRoute(
  startPoint: LocationPoint
): Promise<CreateRouteResult> {
  try {
    // ... operation
    return { success: true, routeId: result[0].id }
  } catch (error) {
    console.error("Failed to create route:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create route",
    }
  }
}
```

---

### Error Boundaries

Use Next.js conventions:

**Global Error:** `app/error.tsx`

```typescript
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Route-Specific:** `app/[route]/error.tsx`

**Not Found:** `app/[route]/not-found.tsx`

```typescript
export default function NotFound() {
  return <div>404 - Route not found</div>
}
```

---

## Styling with Tailwind

### Using the `cn()` Utility

```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "flex items-center gap-2",  // Base styles
  isActive && "bg-primary",    // Conditional
  className                    // Passed prop
)} />
```

### Component Variants

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  // ... other props
}
```

---

## Database Queries

### Using Drizzle

```typescript
import { db } from "@/lib/db"
import { routesTable } from "@/app/db/schema"
import { eq, desc } from "drizzle-orm"

// Select all
const routes = await db.select().from(routesTable)

// With condition
const userRoutes = await db
  .select()
  .from(routesTable)
  .where(eq(routesTable.userId, userId))
  .orderBy(desc(routesTable.createdAt))

// Query builder
const routes = await db.query.routesTable.findMany({
  where: eq(routesTable.userId, userId),
  orderBy: desc(routesTable.createdAt),
  limit: 10
})
```

### Cached Queries

For Server Components, use `react.cache()`:

```typescript
import { cache } from "react"
import { db } from "@/lib/db"

export const getUserRoutes = cache(async (userId: string) => {
  return await db.query.routesTable.findMany({
    where: eq(routesTable.userId, userId)
  })
})
```

---

## Testing

### Unit Tests (Future)

```typescript
import { render, screen } from "@testing-library/react"
import { MyComponent } from "./my-component"

test("renders component", () => {
  render(<MyComponent title="Test" />)
  expect(screen.getByText("Test")).toBeInTheDocument()
})
```

### E2E Tests (Future - Playwright)

```typescript
import { test, expect } from "@playwright/test"

test("creates a route", async ({ page }) => {
  await page.goto("/")
  await page.click("text=Start Tracking")
  // ... assertions
})
```

---

## Git Workflow

### Branch Naming

```
feature/add-route-export
fix/geolocation-error-handling
docs/update-readme
chore/update-dependencies
```

### Commit Messages

```
feat: add route export functionality
fix: handle geolocation permission denied
docs: update installation instructions
chore: upgrade Next.js to 16.1
```

---

## Next Steps

- 🧩 **[Component Reference](Component-Reference.md)** - Component catalog
- 🪝 **[Hooks Reference](Hooks-Reference.md)** - Custom hooks
- ⚡ **[Server Actions Reference](Server-Actions-Reference.md)** - Backend actions
- 🏗️ **[Architecture Overview](Architecture-Overview.md)** - System design

---

**Questions?** Join [GitHub Discussions](https://github.com/your-username/trilhos/discussions) or check the [Project Structure](Project-Structure.md).
