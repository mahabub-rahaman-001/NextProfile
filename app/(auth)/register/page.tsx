import type { Metadata } from "next"
import { AuthForm } from "../auth-form"
import { registerAction } from "@/app/actions/auth"

export const metadata: Metadata = { title: "Create your account" }

export default function RegisterPage() {
  return <AuthForm mode="register" action={registerAction} />
}
