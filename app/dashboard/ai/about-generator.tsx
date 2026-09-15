"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { acceptAbout, discardSuggestion, generate } from "@/app/actions/ai"
import type { AIResult } from "@/lib/ai"

/**
 * Review before save. The original stays on screen next to the suggestion, and
 * nothing is written until the user chooses.
 */
export function AboutGenerator({ current, enabled }: { current: string; enabled: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [result, setResult] = useState<AIResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function run() {
    setError(null)
    setResult(null)
    start(async () => {
      const res = await generate("about_me")
      if (!res.ok) return setError(res.message)
      setResult(res.data ?? null)
    })
  }

  function accept() {
    if (!result) return
    start(async () => {
      const res = await acceptAbout(result.suggestion)
      if (!res.ok) return setError(res.message)
      setResult(null)
      router.refresh()
    })
  }

  function discard() {
    start(async () => {
      await discardSuggestion("about_me")
      setResult(null)
    })
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>About Me</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">
            Written from your education, skills, experience and projects. Nothing else.
          </p>
        </div>
        <Button onClick={run} disabled={pending || !enabled}>
          <Sparkles size={16} aria-hidden />
          {pending ? "Writing…" : current ? "Rewrite" : "Write for me"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.09em] text-ink-faint">
            Yours now
          </p>
          <p className="whitespace-pre-line rounded-sm border border-[--line] bg-[--surface-2] p-3 text-sm leading-relaxed">
            {current || <span className="text-ink-faint">Nothing written yet.</span>}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.09em] text-[--accent]">
            Suggestion
          </p>
          <p className="whitespace-pre-line rounded-sm border border-[--accent] bg-[--accent-soft] p-3 text-sm leading-relaxed">
            {result?.suggestion ?? (
              <span className="text-ink-faint">
                Nothing yet — generate one and it will appear here for you to accept or discard.
              </span>
            )}
          </p>
        </div>
      </div>

      {result?.warnings?.length ? (
        <ul className="space-y-1 text-sm text-ink-soft">
          {result.warnings.map((w, i) => (
            <li key={i}>· {w}</li>
          ))}
        </ul>
      ) : null}

      {result ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={accept} disabled={pending}>
            Use this
          </Button>
          <Button variant="ghost" onClick={discard} disabled={pending}>
            Discard
          </Button>
          {result.notes?.length ? (
            <span className="text-xs text-ink-faint">{result.notes.join(" · ")}</span>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
