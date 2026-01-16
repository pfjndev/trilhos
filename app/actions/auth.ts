"use server"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { usersTable } from "@/app/db/schema"
import { hashPassword } from "@/lib/password"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export interface AuthResult {
  success: boolean
  error?: string
}

/**
 * Register a new user with email and password
 */
export async function registerUser(
  data: RegisterInput
): Promise<AuthResult> {
  try {
    // Validate input
    const validatedData = registerSchema.safeParse(data)
    if (!validatedData.success) {
      const firstIssue = validatedData.error.issues[0]
      return {
        success: false,
        error: firstIssue?.message || "Invalid input",
      }
    }

    const { name, email, password } = validatedData.data

    // Check if user already exists
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email.toLowerCase()),
    })

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      }
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)

    await db.insert(usersTable).values({
      name,
      email: email.toLowerCase(),
      passwordHash,
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

/**
 * Sign in with email and password
 */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" }
        default:
          return { success: false, error: "An error occurred during sign in" }
      }
    }
    throw error
  }
}

/**
 * Sign out the current user (used by local UserMenu component)
 */
export async function logoutUser(): Promise<void> {
  await signOut({ redirectTo: "/login" })
}
