"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { updateRouteName, deleteRoute } from "@/app/actions/routes"

interface RouteActionsProps {
  routeId: number
  currentName: string
}

export function RouteActions({ routeId, currentName }: RouteActionsProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(currentName)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (name.trim() === currentName) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    setError(null)

    const result = await updateRouteName(routeId, name)

    setIsSaving(false)

    if (result.success) {
      setIsEditing(false)
    } else {
      setError(result.error ?? "Failed to rename route")
    }
  }

  const handleCancel = () => {
    setName(currentName)
    setIsEditing(false)
    setError(null)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteRoute(routeId)

    if (result.success) {
      router.push("/history")
    } else {
      setIsDeleting(false)
      setError(result.error ?? "Failed to delete route")
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") handleCancel()
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Rename
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete route?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &ldquo;{currentName}&rdquo;. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
