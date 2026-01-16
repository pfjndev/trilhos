"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

export interface ErrorCardProps {
  title: string
  message?: string
  digest?: string
  onReset: () => void
}

export function ErrorCard({ title, message, digest, onReset }: ErrorCardProps) {
  return (
    <Card className="max-w-md w-full border-destructive bg-destructive/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {message || "An unexpected error occurred."}
        </p>
        {digest && (
          <p className="text-xs text-muted-foreground font-mono">
            Error ID: {digest}
          </p>
        )}
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}
