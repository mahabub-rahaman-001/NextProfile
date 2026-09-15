"use client"

import { useActionState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardTitle } from "@/components/ui/card"
import { FieldWrapper } from "@/components/forms/field-wrapper"
import { changePasswordAction } from "@/app/actions/auth"

export function ChangePassword() {
  const [state, formAction, pending] = useActionState(changePasswordAction, null)
  const error = state && !state.ok ? state : null
  const done = state?.ok === true

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <CardTitle>Password</CardTitle>
        <p className="-mt-2 text-sm text-ink-soft">
          Changing it signs you out everywhere else, including any device you have lost.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <FieldWrapper
            label="Current password"
            required
            error={error?.field === "current" ? error.message : undefined}
          >
            {(p) => (
              <Input {...p} name="current" type="password" autoComplete="current-password" required />
            )}
          </FieldWrapper>
          <FieldWrapper
            label="New password"
            required
            help="At least 8 characters"
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
        </div>

        {error && !error.field ? (
          <p role="alert" className="text-sm text-[--danger]">
            {error.message}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Change password"}
          </Button>
          {done ? (
            <span className="inline-flex items-center gap-1 text-sm text-[--success]">
              <Check size={15} aria-hidden /> Changed
            </span>
          ) : null}
        </div>
      </form>
    </Card>
  )
}
