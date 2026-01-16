"use client"

import { useEffect, useState } from "react"

const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
const LEAFLET_CSS_INTEGRITY = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="

export interface UseLeafletReturn {
  L: typeof import("leaflet") | null
  isLoaded: boolean
}

/**
 * Hook for loading Leaflet CSS and module dynamically
 * Handles SSR safety and prevents duplicate CSS injection
 */
export function useLeaflet(): UseLeafletReturn {
  const [L, setL] = useState<typeof import("leaflet") | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Inject CSS if not already present
    let link = document.querySelector<HTMLLinkElement>(
      `link[href="${LEAFLET_CSS_URL}"]`
    )
    if (!link) {
      link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = LEAFLET_CSS_URL
      link.integrity = LEAFLET_CSS_INTEGRITY
      link.crossOrigin = ""
      document.head.appendChild(link)
    }

    // Dynamic import of Leaflet
    import("leaflet").then((module) => {
      setL(module.default)
      setIsLoaded(true)
    })
  }, [])

  return { L, isLoaded }
}
