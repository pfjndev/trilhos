"use server"

import { db } from "@/lib/db"
import { routesTable } from "@/app/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { LocationPoint } from "@/types/location-point"
import { generateRouteName } from "@/lib/geo-utils"
import { auth } from "@/auth"

export interface CreateRouteResult {
  success: boolean
  routeId?: number
  error?: string
}

export interface UpdateRouteResult {
  success: boolean
  error?: string
}

/**
 * Helper to get current authenticated user ID
 * Returns null if not authenticated
 */
async function getCurrentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

/**
 * Helper to verify route ownership
 * Returns true if the user owns the route
 */
async function verifyRouteOwnership(routeId: number, userId: string): Promise<boolean> {
  const route = await db.query.routesTable.findFirst({
    where: eq(routesTable.id, routeId),
    columns: { userId: true },
  })
  return route?.userId === userId
}

/**
 * Create a new route when tracking starts
 * Requires authentication - route is associated with current user
 */
export async function createRoute(
  startPoint: LocationPoint
): Promise<CreateRouteResult> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    const name = await generateRouteName(startPoint)

    const result = await db
      .insert(routesTable)
      .values({
        userId,
        name,
        points: [startPoint],
        totalDistance: 0,
        duration: 0,
        status: "active",
      })
      .returning({ id: routesTable.id })

    revalidatePath("/")

    return {
      success: true,
      routeId: result[0].id,
    }
  } catch (error) {
    console.error("Failed to create route:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create route",
    }
  }
}

/**
 * Finalize a route when tracking stops
 * Only the route owner can finalize
 */
export async function finalizeRoute(
  routeId: number,
  name: string,
  points: LocationPoint[],
  totalDistance: number,
  duration: number
): Promise<UpdateRouteResult> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify ownership
    const isOwner = await verifyRouteOwnership(routeId, userId)
    if (!isOwner) {
      return { success: false, error: "Not authorized to finalize this route" }
    }

    await db
      .update(routesTable)
      .set({
        name,
        points,
        totalDistance,
        duration,
        status: "completed",
        updatedAt: new Date(),
      })
      .where(and(eq(routesTable.id, routeId), eq(routesTable.userId, userId)))

    revalidatePath("/")
    revalidatePath("/history")
    revalidatePath("/activity")

    return { success: true }
  } catch (error) {
    console.error("Failed to finalize route:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to finalize route",
    }
  }
}

/**
 * Update route name (rename)
 * Only the route owner can rename
 */
export async function updateRouteName(
  routeId: number,
  name: string
): Promise<UpdateRouteResult> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Validate name
    const trimmedName = name.trim()
    if (!trimmedName) {
      return { success: false, error: "Route name cannot be empty" }
    }
    if (trimmedName.length > 255) {
      return { success: false, error: "Route name is too long" }
    }

    // Verify ownership
    const isOwner = await verifyRouteOwnership(routeId, userId)
    if (!isOwner) {
      return { success: false, error: "Not authorized to rename this route" }
    }

    await db
      .update(routesTable)
      .set({
        name: trimmedName,
        updatedAt: new Date(),
      })
      .where(and(eq(routesTable.id, routeId), eq(routesTable.userId, userId)))

    revalidatePath(`/routes/${routeId}`)
    revalidatePath("/history")
    revalidatePath("/activity")

    return { success: true }
  } catch (error) {
    console.error("Failed to rename route:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to rename route",
    }
  }
}

/**
 * Delete a route
 * Only the route owner can delete
 */
export async function deleteRoute(routeId: number): Promise<UpdateRouteResult> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify ownership
    const isOwner = await verifyRouteOwnership(routeId, userId)
    if (!isOwner) {
      return { success: false, error: "Not authorized to delete this route" }
    }

    await db
      .delete(routesTable)
      .where(and(eq(routesTable.id, routeId), eq(routesTable.userId, userId)))

    revalidatePath("/history")
    revalidatePath("/activity")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete route:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete route",
    }
  }
}
