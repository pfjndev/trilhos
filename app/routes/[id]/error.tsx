"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ErrorCard } from "@/components/shared"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RouteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Route error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/history">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
      </Link>

      <ErrorCard
        title="Failed to load route"
        message={error.message || "An error occurred while loading this route."}
        digest={error.digest}
        onReset={reset}
      />
    </div>
  )
}
