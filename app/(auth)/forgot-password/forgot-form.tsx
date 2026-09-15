"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldWrapper } from "@/components/forms/field-wrapper"
import { requestPasswordResetAction } from "@/app/actions/auth"

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, null)
  const error = state && !state.ok ? state : null
  const sent = state?.ok === true

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        NextProfile
      </Link>

      <h1 className="mt-8 text-2xl font-semibold">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Enter the email you signed up with and we&rsquo;ll send you a link to set a new password.
      </p>

      {sent ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-sm border border-[--line] bg-[--surface] p-4">
            <p className="font-medium">Check your email</p>
            <p className="mt-1 text-sm text-ink-soft">
              If that address has an account, a reset link is on its way. It expires in an hour and
              can only be used once.
            </p>
          </div>

          {state?.data?.devLink ? (
            <div className="rounded-sm border-l-2 border-[--warning] bg-[--surface-2] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.09em] text-[--warning]">
                Development only
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                No email provider is configured yet, so here is the link directly:
              </p>
              <a
                href={state.data.devLink}
                className="mt-2 block break-all text-sm font-medium text-[--accent] hover:underline"
              >
                {state.data.devLink}
              </a>
            </div>
          ) : null}

          <Link href="/login" className="inline-block text-sm text-[--accent] hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <form action={formAction} className="mt-8 space-y-4">
            <FieldWrapper label="Email" required error={error?.message}>
              {(p) => (
                <Input
                  {...p}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              )}
            </FieldWrapper>

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "One moment…" : "Send me a reset link"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-ink-soft">
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-[--accent] hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </main>
  )
}
