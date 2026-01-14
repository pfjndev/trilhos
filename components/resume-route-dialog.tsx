"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDistance, formatDuration } from "@/lib/geo-utils"

interface ResumeRouteDialogProps {
  open: boolean
  routeName: string
  pointCount: number
  totalDistance: number
  duration: number
  onResume: () => void
  onAbandon: () => void
}

export function ResumeRouteDialog({
  open,
  routeName,
  pointCount,
  totalDistance,
  duration,
  onResume,
  onAbandon,
}: ResumeRouteDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resume Previous Route?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3" asChild>
            <div>
              <span className="block">
                You have an unfinished route that was interrupted. Would you
                like to continue tracking?
              </span>
              <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Route:</span>{" "}
                  <span className="font-medium text-foreground">
                    {routeName}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Points recorded:
                  </span>{" "}
                  <span className="font-medium text-foreground">
                    {pointCount}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Distance:</span>{" "}
                  <span className="font-medium text-foreground">
                    {formatDistance(totalDistance)}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Duration:</span>{" "}
                  <span className="font-medium text-foreground">
                    {formatDuration(duration)}
                  </span>
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onAbandon}>
            Discard Route
          </AlertDialogCancel>
          <AlertDialogAction onClick={onResume}>
            Resume Tracking
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
