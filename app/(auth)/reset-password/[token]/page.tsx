import type { Metadata } from "next"
import Link from "next/link"
import { findValidResetToken } from "@/lib/auth"
import { ResetPasswordForm } from "./reset-form"

export const metadata: Metadata = { title: "Choose a new password" }

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const valid = await findValidResetToken(token)

  // Check before showing the form, so an expired link says so immediately
  // rather than after the person has typed a new password twice.
  if (!valid) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          NextProfile
        </Link>
        <h1 className="mt-8 text-2xl font-semibold">This link has expired</h1>
        <p className="mt-2 text-ink-soft">
          Reset links last one hour and work once. Ask for a new one and it will arrive in a moment.
        </p>
        <Link href="/forgot-password" className="mt-6 font-medium text-[--accent] hover:underline">
          Send me a new link
        </Link>
      </main>
    )
  }

  return <ResetPasswordForm token={token} />
}
