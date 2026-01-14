import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import {
  usersTable,
  accountsTable,
  sessionsTable,
  verificationTokensTable,
  authenticatorsTable,
} from "@/app/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
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
  pages: {
    signIn: "/login",
    // signUp: "/register", // Auth.js doesn't have signUp page config
    error: "/login", // Redirect auth errors to login page
  },
  callbacks: {
    session({ session, user }) {
      // Add user ID to session for easy access
      session.user.id = user.id
      return session
    },
  },
  providers: [
    // Providers will be added in subsequent issues:
    // - #45: Credentials provider (email/password)
    // - #48: Google and GitHub OAuth providers
  ],
})
