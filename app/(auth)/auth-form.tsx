"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldWrapper } from "@/components/forms/field-wrapper"
import type { ActionResult } from "@/lib/errors"

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "register"
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>
}) {
  const [state, formAction, pending] = useActionState(action, null)
  const error = state && !state.ok ? state : null
  const router = useRouter()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const googleBtnRef = useRef<HTMLDivElement>(null)

  // Google sign-in is only offered when it is actually configured. Without the
  // client id the server route stays closed, so rendering the divider and an
  // empty button slot would promise something that cannot work.
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!googleClientId || !googleBtnRef.current) return

    const handleCredentialResponse = async (response: { credential?: string }) => {
      setGoogleError(null)
      setGoogleLoading(true)
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        })
        const data = await res.json()
        if (data.ok) {
          router.push(data.destination)
        } else {
          setGoogleError(data.error || "Google sign-in didn't work. Try again, or use your password.")
          setGoogleLoading(false)
        }
      } catch {
        setGoogleError("Couldn't reach Google just now. Try again, or use your password.")
        setGoogleLoading(false)
      }
    }

    // Load Google script dynamically
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      const win = window as unknown as {
        google?: {
          accounts: {
            id: {
              initialize: (o: { client_id: string; callback: (r: { credential?: string }) => void }) => void
              renderButton: (el: HTMLElement, o: Record<string, string>) => void
            }
          }
        }
      }
      if (win.google) {
        win.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        })
        win.google.accounts.id.renderButton(googleBtnRef.current!, {
          theme: "outline",
          size: "large",
          width: "100%",
        })
      }
    }
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [router, googleClientId])

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        NextProfile
      </Link>

      <h1 className="mt-8 text-2xl font-semibold">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {mode === "login"
          ? "Sign in to keep building your profile."
          : "One profile. Resume, CV, portfolio and a public link."}
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <FieldWrapper
          label="Email"
          required
          error={error?.field === "email" ? error.message : undefined}
        >
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

        <FieldWrapper
          label="Password"
          required
          help={mode === "register" ? "At least 8 characters." : undefined}
          error={error?.field === "password" ? error.message : undefined}
          action={
            mode === "login" ? (
              <Link
                href="/forgot-password"
                className="text-sm text-[--accent] hover:underline"
              >
                Forgot it?
              </Link>
            ) : undefined
          }
        >
          {(p) => (
            <Input
              {...p}
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={mode === "register" ? 8 : undefined}
            />
          )}
        </FieldWrapper>

        {error && !error.field ? (
          <p role="alert" className="rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]">
            {error.message}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={pending || googleLoading}>
          {pending ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      {/* Google Sign-In — rendered only when configured. */}
      {googleClientId ? (
      <div className="mt-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[--line]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-ink-soft">Or continue with</span>
          </div>
        </div>
        
        {googleLoading ? (
          <Button variant="secondary" size="lg" className="w-full" disabled>
            Signing in with Google...
          </Button>
        ) : (
          <div ref={googleBtnRef} className="w-full overflow-hidden rounded-md" />
        )}

        {googleError ? (
          <p
            role="alert"
            className="mt-3 rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]"
          >
            {googleError}
          </p>
        ) : null}
      </div>
      ) : null}

      <p className="mt-6 text-sm text-ink-soft">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="font-medium text-[--accent] hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[--accent] hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </main>
  )
}
