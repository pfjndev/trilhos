/**
 * Route configuration for authentication
 */

// Routes that don't require authentication
export const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/verify",
]

// Routes used for authentication (redirect logged-in users away)
export const authRoutes = [
  "/login",
  "/register",
]

// API routes that should be accessible without authentication
export const publicApiRoutes = [
  "/api/auth",
]

// Default redirect after login
export const DEFAULT_LOGIN_REDIRECT = "/"
