import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export interface TrackingErrorProps {
  error: string | null
}

export function TrackingError({ error }: TrackingErrorProps) {
  if (!error) return null

  return (
    <Card className="mb-6 border-destructive bg-destructive/10">
      <CardContent className="flex items-center gap-3 py-4">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-destructive">{error}</p>
      </CardContent>
    </Card>
  )
}
