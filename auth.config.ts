import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"

/**
 * Edge-compatible Auth.js configuration.
 *
 * This file contains ONLY configuration that can run in Edge Runtime:
 * - OAuth providers (Google, GitHub)
 * - Pages configuration
 *
 * Node.js-specific features (adapter, Credentials provider, bcrypt)
 * are added in auth.ts which runs in Node.js runtime only.
 *
 * @see https://authjs.dev/guides/edge-compatibility
 */
export default {
  providers: [
    // OAuth providers are edge-compatible (use AUTH_GOOGLE_ID/SECRET and AUTH_GITHUB_ID/SECRET env vars)
    Google,
    GitHub,
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig
