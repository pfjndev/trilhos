"use server"

import { db } from "@/lib/db"
import { routesTable } from "@/app/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { LocationPoint } from "@/types/location-point"
import { generateRouteName, calculateTotalDistance, calculateDuration } from "@/lib/geo-utils"
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
 * Get the current authenticated user's ID
 * Returns null if not authenticated (routes can still be created anonymously)
 */
async function getCurrentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

/**
 * Create a new route when tracking starts
 */
export async function createRoute(
  startPoint: LocationPoint
): Promise<CreateRouteResult> {
  try {
    const userId = await getCurrentUserId()
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
 * Update route points during tracking (periodic auto-save)
 */
export async function updateRoutePoints(
  routeId: number,
  points: LocationPoint[],
  totalDistance: number,
  duration: number
): Promise<UpdateRouteResult> {
  try {
    const userId = await getCurrentUserId()

    // Build where clause - if user is authenticated, verify ownership
    const whereClause = userId
      ? and(eq(routesTable.id, routeId), eq(routesTable.userId, userId))
      : eq(routesTable.id, routeId)

    await db
      .update(routesTable)
      .set({
        points,
        totalDistance,
        duration,
        updatedAt: new Date(),
      })
      .where(whereClause)

    return { success: true }
  } catch (error) {
    console.error("Failed to update route points:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update route points",
    }
  }
}

/**
 * Finalize a route when tracking stops
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

    const whereClause = userId
      ? and(eq(routesTable.id, routeId), eq(routesTable.userId, userId))
      : eq(routesTable.id, routeId)

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
      .where(whereClause)

    revalidatePath("/")

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
 * Abandon a route (e.g., when user chooses not to resume)
 */
export async function abandonRoute(routeId: number): Promise<UpdateRouteResult> {
  try {
    const userId = await getCurrentUserId()

    const whereClause = userId
      ? and(eq(routesTable.id, routeId), eq(routesTable.userId, userId))
      : eq(routesTable.id, routeId)

    await db
      .update(routesTable)
      .set({
        status: "abandoned",
        updatedAt: new Date(),
      })
      .where(whereClause)

    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Failed to abandon route:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to abandon route",
    }
  }
}

/**
 * Sync a pending route from localStorage to the database
 */
export async function syncPendingRoute(
  routeId: number | null,
  points: LocationPoint[],
  name: string,
  startedAt: number
): Promise<CreateRouteResult> {
  try {
    const userId = await getCurrentUserId()
    
    // Use shared utility functions instead of inline calculation
    const totalDistance = calculateTotalDistance(points)
    const duration = calculateDuration(points)

    if (routeId) {
      // Update existing route
      const whereClause = userId
        ? and(eq(routesTable.id, routeId), eq(routesTable.userId, userId))
        : eq(routesTable.id, routeId)

      await db
        .update(routesTable)
        .set({
          points,
          totalDistance,
          duration,
          updatedAt: new Date(),
        })
        .where(whereClause)

      revalidatePath("/")
      return { success: true, routeId }
    } else {
      // Create new route from pending data
      const result = await db
        .insert(routesTable)
        .values({
          userId,
          name,
          points,
          totalDistance,
          duration,
          status: "active",
          createdAt: new Date(startedAt),
        })
        .returning({ id: routesTable.id })

      revalidatePath("/")
      return { success: true, routeId: result[0].id }
    }
  } catch (error) {
    console.error("Failed to sync pending route:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to sync pending route",
    }
  }
}
