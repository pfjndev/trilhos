import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RouteStatItem {
  icon: LucideIcon
  value: string | number
  label: string
}

export interface RouteStatsGridProps {
  stats: RouteStatItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function RouteStatsGrid({
  stats,
  columns = 3,
  className,
}: RouteStatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
        >
          <stat.icon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
