import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres"
import { usersTable, routesTable } from "@/app/db/schema"
import type { LocationPoint } from "@/types/location-point"
import { calculateTotalDistance, calculateDuration } from "@/lib/geo-utils"

const db = drizzle(process.env.DATABASE_URL!)

async function main() {
  // Clear existing data
  console.log("Executing Cleanup...\n")
  console.log("Clearing all data from tables...\n")
  await db.delete(routesTable)
  await db.delete(usersTable)
  console.log("Tables cleared successfully!\n")

  console.log("Seeding Database...\n")

  // Seed 4 users
  const userNames = ["Alice", "Bob", "Charlie", "Diana"]
  const providers = ["gmail", "icloud", "yahoo", "outlook"]

  const users: (typeof usersTable.$inferInsert)[] = userNames.map((uName) => ({
    name: uName,
    email: `${uName.toLowerCase()}@${providers[Math.floor(Math.random() * providers.length)]}.com`,
    passwordHash: uName.toLowerCase() + "hashExample123",
  }))

  const insertedUsers = await db.insert(usersTable).values(users).returning()

  console.log("Inserted Users:\n")
  insertedUsers.forEach((user) => {
    console.log(
      `User ID#${user.id}: ${user.name} (${user.email})\n` +
      "-".repeat(70)
    )
  })

  // Seed 16 routes, 4 for each user
  // Each route is 1 to 5 km long
  const userRoutes: (typeof routesTable.$inferInsert)[] = insertedUsers.flatMap(
    (user) => {
      const routes: (typeof routesTable.$inferInsert)[] = []
      for (let routeIndex = 1; routeIndex < 5; routeIndex++) {
        const routeLength = Math.floor(Math.random() * 5000) + 1000
        const points: LocationPoint[] = []
        let lat = 37.7749 + (Math.random() - 0.5) * 0.1
        let lon = -122.4194 + (Math.random() - 0.5) * 0.1
        let alt = 10.3
        const heading = Math.floor(Math.random() * 360)
        const speed = 1.2 + Math.random() * 2
        let timestamp = Date.now() - routeLength * 1000

        for (let i = 0; i < routeLength; i++) {
          points.push({
            latitude: lat,
            longitude: lon,
            altitude: alt,
            accuracy: 5,
            altitudeAccuracy: 10,
            heading: heading,
            speed: speed,
            timestamp: timestamp,
          })
          // Simulate movement with slight randomness
          lat += (Math.random() - 0.3) * 0.00002
          lon += (Math.random() - 0.3) * 0.00002
          alt += (Math.random() - 0.5) * 0.5
          timestamp += 1000
        }

        // Use shared utility functions
        const totalDistance = calculateTotalDistance(points)
        const duration = calculateDuration(points)

        routes.push({
          name: `${user.name}'s Route #${routeIndex}`,
          userId: user.id,
          points: points,
          totalDistance: totalDistance,
          duration: duration,
          status: "completed",
        })
      }
      return routes
    }
  )

  const insertedRoutes = await db
    .insert(routesTable)
    .values(userRoutes)
    .returning()

  console.log("\nInserted Routes:\n")
  insertedRoutes.forEach((route) => {
    const points = route.points as LocationPoint[]
    console.log(
      `User ID#${route.userId}: Route ID#${route.id}: ${route.name}\n` +
      `Points Count: ${points.length}\n` +
      `Distance: ${route.totalDistance.toFixed(0)}m\n` +
      `Duration: ${Math.floor(route.duration / 1000)}s\n` +
      "-".repeat(70)
    )
  })

  console.log("\nSeeding complete!")
}

main()
  .catch(console.error)
  .finally(() => process.exit())
