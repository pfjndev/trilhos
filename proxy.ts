import { NextResponse } from "next/server"
import { auth } from "@/auth"

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Protects routes by requiring authentication
 *
 * Public routes: /login, /register
 * All other routes require authentication
 */

// Routes that don't require authentication
const publicRoutes = ["/login", "/register"]

// Auth API routes prefix (must be accessible for auth flow)
const authApiPrefix = "/api/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthApi = nextUrl.pathname.startsWith(authApiPrefix)

  // Always allow auth API routes (required for login/logout flow)
  if (isAuthApi) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth pages to home
  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  // Redirect unauthenticated users to login page
  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl)
    // Optionally store the original URL to redirect back after login
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

// Configure which routes the proxy runs on
// Excludes static files, images, and other assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes, except /api/auth which is handled above)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)",
  ],
}
