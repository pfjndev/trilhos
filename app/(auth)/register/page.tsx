import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Create Account | Trilhos",
  description: "Create a new Trilhos account",
}

export default function RegisterPage() {
  return <RegisterForm />
}
