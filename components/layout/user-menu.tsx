"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutUser } from "@/app/actions/auth"

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logoutUser()
  }

  // Get initials for avatar
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? "U"

  return (
    <div className="flex items-center gap-2">
      {/* User avatar/initials */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
          {initials}
        </div>
        <span className="hidden sm:inline text-foreground font-medium">
          {user.name ?? user.email}
        </span>
      </div>

      {/* Logout button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </span>
      </Button>
    </div>
  )
}
