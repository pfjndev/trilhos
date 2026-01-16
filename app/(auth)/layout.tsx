import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirect authenticated users away from auth pages
  const session = await auth()
  if (session?.user) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
