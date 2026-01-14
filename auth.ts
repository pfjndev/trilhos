import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  usersTable,
  accountsTable,
  sessionsTable,
  verificationTokensTable,
  authenticatorsTable,
} from "@/app/db/schema"
import { verifyPassword } from "@/lib/password"
import { loginSchema } from "@/lib/validations/auth"
import authConfig from "./auth.config"

/**
 * Full Auth.js configuration with Node.js-specific features.
 *
 * This file extends the edge-compatible auth.config.ts with:
 * - DrizzleAdapter for database sessions
 * - Credentials provider (uses bcrypt for password verification)
 * - Database session strategy
 *
 * This configuration is used by API routes and Server Actions (Node.js runtime).
 * The middleware uses auth.config.ts directly for Edge Runtime compatibility.
 *
 * @see https://authjs.dev/guides/edge-compatibility
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable,
    accountsTable,
    sessionsTable,
    verificationTokensTable,
    authenticatorsTable,
  }),
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      // Add user ID to session for easy access
      session.user.id = user.id
      return session
    },
  },
  providers: [
    // Include OAuth providers from edge-compatible config
    ...authConfig.providers,
    // Credentials provider requires Node.js runtime (bcrypt)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials format
        const validated = loginSchema.safeParse(credentials)
        if (!validated.success) {
          return null
        }

        const { email, password } = validated.data

        // Find user by email
        const user = await db.query.usersTable.findFirst({
          where: eq(usersTable.email, email.toLowerCase()),
        })

        // User not found or no password (OAuth-only user)
        if (!user || !user.passwordHash) {
          return null
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash)
        if (!isValid) {
          return null
        }

        // Return user object (id must be string for Auth.js)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
})
