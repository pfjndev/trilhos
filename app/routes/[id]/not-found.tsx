import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"

export default function RouteNotFound() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/history">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
      </Link>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            Route not found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The route you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link href="/history">
            <Button variant="outline">
              View all routes
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
