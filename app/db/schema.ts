import {
  boolean,
  integer,
  json,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"
import type { LocationPoint } from "@/types/location-point"

// ============================================================================
// Auth.js Tables (required for authentication)
// ============================================================================

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: timestamp({ mode: "date", withTimezone: true }),
  image: text(),
  // Custom field for credentials auth (nullable for OAuth-only users)
  passwordHash: varchar({ length: 255 }),
})

export const accountsTable = pgTable(
  "accounts",
  {
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: varchar({ length: 255 }).$type<AdapterAccountType>().notNull(),
    provider: varchar({ length: 255 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: varchar({ length: 255 }),
    scope: varchar({ length: 255 }),
    id_token: text(),
    session_state: varchar({ length: 255 }),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
)

export const sessionsTable = pgTable("sessions", {
  sessionToken: text().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
})

export const verificationTokensTable = pgTable(
  "verification_tokens",
  {
    identifier: varchar({ length: 255 }).notNull(),
    token: varchar({ length: 255 }).notNull(),
    expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
)

// Optional: Authenticators table for WebAuthn/Passkeys support (future)
export const authenticatorsTable = pgTable(
  "authenticators",
  {
    credentialID: text().notNull().unique(),
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    providerAccountId: varchar({ length: 255 }).notNull(),
    credentialPublicKey: text().notNull(),
    counter: integer().notNull(),
    credentialDeviceType: varchar({ length: 32 }).notNull(),
    credentialBackedUp: boolean().notNull(),
    transports: varchar({ length: 255 }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.credentialID] })]
)

// ============================================================================
// Application Tables
// ============================================================================

// Route status constants
export const ROUTE_STATUSES = ["active", "completed"] as const
export type RouteStatus = (typeof ROUTE_STATUSES)[number]

export const routesTable = pgTable("routes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid().references(() => usersTable.id, { onDelete: "set null" }),
  name: varchar({ length: 255 }).notNull(),
  points: json().$type<LocationPoint[]>().notNull().default([]),
  totalDistance: real().notNull().default(0),
  duration: integer().notNull().default(0),
  status: varchar({ length: 20 }).$type<RouteStatus>().notNull().default("active"),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

// ============================================================================
// Inferred Types
// ============================================================================

// Auth types
export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
export type Account = typeof accountsTable.$inferSelect
export type NewAccount = typeof accountsTable.$inferInsert
export type Session = typeof sessionsTable.$inferSelect
export type NewSession = typeof sessionsTable.$inferInsert

// Application types
export type Route = typeof routesTable.$inferSelect
export type NewRoute = typeof routesTable.$inferInsert
