"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDistance, formatDuration } from "@/lib/geo-utils"

interface SaveRouteDialogProps {
  open: boolean
  defaultName: string
  pointCount: number
  totalDistance: number
  duration: number
  onSave: (name: string) => void
  onDiscard: () => void
  isSaving?: boolean
}

export function SaveRouteDialog({
  open,
  defaultName,
  pointCount,
  totalDistance,
  duration,
  onSave,
  onDiscard,
  isSaving = false,
}: SaveRouteDialogProps) {
  const [name, setName] = useState(defaultName)

  const handleSave = () => {
    const trimmedName = name.trim()
    if (trimmedName) {
      onSave(trimmedName)
    }
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save Route</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span className="block">
              Your tracking session has ended. Give your route a name to save it.
            </span>
            <span className="block rounded-lg bg-muted p-3 space-y-1 text-sm">
              <span className="block">
                <span className="text-muted-foreground">Points recorded:</span>{" "}
                <span className="font-medium text-foreground">{pointCount}</span>
              </span>
              <span className="block">
                <span className="text-muted-foreground">Total distance:</span>{" "}
                <span className="font-medium text-foreground">
                  {formatDistance(totalDistance)}
                </span>
              </span>
              <span className="block">
                <span className="text-muted-foreground">Duration:</span>{" "}
                <span className="font-medium text-foreground">
                  {formatDuration(duration)}
                </span>
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="route-name" className="sr-only">
            Route Name
          </Label>
          <Input
            id="route-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter route name"
            disabled={isSaving}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSaving) {
                handleSave()
              }
            }}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard} disabled={isSaving}>
            Discard
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? "Saving..." : "Save Route"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
