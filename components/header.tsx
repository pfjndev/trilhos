import { MapPin } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="w-full px-6 py-4 bg-card border-b shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Trilhos</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Real-time GPS tracking
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
