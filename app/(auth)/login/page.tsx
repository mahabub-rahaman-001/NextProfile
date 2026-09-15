import type { Metadata } from "next"
import { AuthForm } from "../auth-form"
import { loginAction } from "@/app/actions/auth"

export const metadata: Metadata = { title: "Sign in" }

export default function LoginPage() {
  return <AuthForm mode="login" action={loginAction} />
}
