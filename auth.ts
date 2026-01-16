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
 * - JWT session strategy (required for credentials provider)
 *
 * This configuration is used by API routes and Server Actions (Node.js runtime).
 * The proxy.ts uses this directly since Next.js 16 proxies run in Node.js context.
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
    // JWT strategy is required for credentials provider
    // The adapter still stores users in the database
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      // Persist user ID in the JWT token on sign-in
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      // Add user ID to session from JWT token
      session.user.id = token.id as string
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
