import { cache } from "react"
import { db } from "@/lib/db"
import { routesTable, type Route } from "@/app/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { auth } from "@/auth"

/**
 * Get a route by ID
 * This is public - anyone can view any completed route
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
 * Get all completed routes for the authenticated user (for route history)
 * Returns empty array if not authenticated
 */
export const getCompletedRoutes = cache(async (): Promise<Route[]> => {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  return db
    .select()
    .from(routesTable)
    .where(
      and(
        eq(routesTable.status, "completed"),
        eq(routesTable.userId, session.user.id)
      )
    )
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