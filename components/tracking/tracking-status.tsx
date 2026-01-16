import { cn } from "@/lib/utils"

export interface TrackingStatusProps {
  isTracking: boolean
  hasPoints: boolean
  className?: string
}

export function TrackingStatus({
  isTracking,
  hasPoints,
  className,
}: TrackingStatusProps) {
  const statusText = isTracking
    ? "Live Tracking"
    : hasPoints
      ? "Route Overview"
      : "Waiting to Start"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "h-3 w-3 rounded-full",
          isTracking ? "bg-green-500 animate-pulse" : "bg-muted"
        )}
      />
      <span className="text-lg font-medium">{statusText}</span>
    </div>
  )
}
