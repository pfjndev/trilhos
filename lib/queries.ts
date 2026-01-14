import { cache } from "react"
import { db } from "@/lib/db"
import { routesTable, type Route } from "@/app/db/schema"
import { eq, desc } from "drizzle-orm"

/**
 * Get the currently active route (if any)
 * This is cached per request to avoid duplicate queries
 */
export const getActiveRoute = cache(async (): Promise<Route | null> => {
  const routes = await db
    .select()
    .from(routesTable)
    .where(eq(routesTable.status, "active"))
    .orderBy(desc(routesTable.createdAt))
    .limit(1)

  return routes[0] ?? null
})

/**
 * Get a route by ID
 */
export const getRouteById = cache(async (id: number): Promise<Route | null> => {
  const routes = await db
    .select()
    .from(routesTable)
    .where(eq(routesTable.id, id))
    .limit(1)

  return routes[0] ?? null
})

/**
 * Get all completed routes for the user (for route history)
 * Currently shows all completed routes since there's no authentication
 */
export const getCompletedRoutes = cache(async (): Promise<Route[]> => {
  return db
    .select()
    .from(routesTable)
    .where(eq(routesTable.status, "completed"))
    .orderBy(desc(routesTable.createdAt))
})

/**
 * Get all routes (for activity feed)
 * Shows completed routes from all users, sorted by most recent
 */
export const getAllRoutes = cache(async (): Promise<Route[]> => {
  return db
    .select()
    .from(routesTable)
    .where(eq(routesTable.status, "completed"))
    .orderBy(desc(routesTable.createdAt))
})

/**
 * Type alias for backward compatibility
 * @deprecated Use Route from schema instead
 */
export type DbRoute = Route | null
