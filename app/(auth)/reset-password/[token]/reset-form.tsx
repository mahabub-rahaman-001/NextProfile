"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldWrapper } from "@/components/forms/field-wrapper"
import { resetPasswordAction } from "@/app/actions/auth"

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, null)
  const error = state && !state.ok ? state : null

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        NextProfile
      </Link>

      <h1 className="mt-8 text-2xl font-semibold">Choose a new password</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Signing in anywhere else will stop working, so nobody keeps access with the old one.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="token" value={token} />

        <FieldWrapper
          label="New password"
          required
          help="At least 8 characters."
          error={error?.field === "password" ? error.message : undefined}
        >
          {(p) => (
            <Input
              {...p}
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              autoFocus
            />
          )}
        </FieldWrapper>

        <FieldWrapper
          label="Type it again"
          required
          error={error?.field === "confirm" ? error.message : undefined}
        >
          {(p) => (
            <Input {...p} name="confirm" type="password" autoComplete="new-password" required />
          )}
        </FieldWrapper>

        {error && !error.field ? (
          <p role="alert" className="rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]">
            {error.message}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Saving…" : "Set new password"}
        </Button>
      </form>
    </main>
  )
}
