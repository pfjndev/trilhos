import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign In | Trilhos",
  description: "Sign in to your Trilhos account",
}

export default function LoginPage() {
  return <LoginForm />
}
