"use client"

import { useEffect } from "react"
import { ErrorCard } from "@/components/shared/error-card"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
      <ErrorCard
        title="Something went wrong"
        message={error.message}
        digest={error.digest}
        onReset={reset}
      />
    </div>
  )
}
