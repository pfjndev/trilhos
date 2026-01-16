import { Button } from "@/components/ui/button"
import { Play, Square } from "lucide-react"

export interface TrackingControlsProps {
  isTracking: boolean
  onStart: () => void
  onStop: () => void
}

export function TrackingControls({
  isTracking,
  onStart,
  onStop,
}: TrackingControlsProps) {
  return (
    <div className="flex gap-4">
      <Button
        onClick={onStart}
        disabled={isTracking}
        size="lg"
        className="gap-2"
      >
        <Play className="h-4 w-4" />
        Start
      </Button>
      <Button
        onClick={onStop}
        disabled={!isTracking}
        variant="destructive"
        size="lg"
        className="gap-2"
      >
        <Square className="h-4 w-4" />
        Stop
      </Button>
    </div>
  )
}
