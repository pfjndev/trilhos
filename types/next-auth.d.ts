import { DefaultSession } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extends the built-in session types to include user ID
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in JWT types to include user ID
   */
  interface JWT extends DefaultJWT {
    id?: string
  }
}
