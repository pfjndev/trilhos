import { integer, json, pgTable, real, timestamp, varchar } from "drizzle-orm/pg-core"
import type { LocationPoint } from "@/types/location-point"

// Route status constants
export const ROUTE_STATUSES = ["active", "completed", "abandoned"] as const
export type RouteStatus = (typeof ROUTE_STATUSES)[number]

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
})

export const routesTable = pgTable("routes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => usersTable.id),
  name: varchar({ length: 255 }).notNull(),
  points: json().$type<LocationPoint[]>().notNull().default([]),
  totalDistance: real().notNull().default(0),
  duration: integer().notNull().default(0),
  status: varchar({ length: 20 }).$type<RouteStatus>().notNull().default("active"),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
})

// Inferred types for consistent usage across the app
export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
export type Route = typeof routesTable.$inferSelect
export type NewRoute = typeof routesTable.$inferInsert
