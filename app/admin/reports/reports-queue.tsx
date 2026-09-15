"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import type { ReportStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge, Card } from "@/components/ui/card"
import { resolveReport, suspendUser, unpublishProfile } from "@/app/actions/admin"

export type ReportRow = {
  id: string
  username: string
  reason: string
  detail: string | null
  status: ReportStatus
  adminNote: string | null
  reviewedBy: string | null
  createdAt: string
  userId: string | null
  fullName: string | null
  published: boolean
  suspended: boolean
}

const REASON_LABELS: Record<string, string> = {
  impersonation: "Pretending to be someone else",
  fake_credentials: "Qualifications are not real",
  offensive: "Offensive content",
  spam: "Spam or an advert",
  not_a_real_person: "Not a real person",
  other: "Something else",
}

const TONE: Record<ReportStatus, "neutral" | "accent" | "warning" | "danger"> = {
  OPEN: "danger",
  REVIEWED: "warning",
  ACTIONED: "accent",
  DISMISSED: "neutral",
}

export function ReportsQueue({ reports }: { reports: ReportRow[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  function run(fn: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null)
    start(async () => {
      const res = await fn()
      if (!res.ok) return setError(res.message ?? "That didn't work.")
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p role="alert" className="rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]">
          {error}
        </p>
      ) : null}

      {reports.map((r) => (
        <Card key={r.id} className={r.status === "OPEN" ? "border-l-2 border-l-[--danger]" : undefined}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-medium">
                {REASON_LABELS[r.reason] ?? r.reason}
                <Badge tone={TONE[r.status]}>{r.status.toLowerCase()}</Badge>
                {r.suspended ? <Badge tone="danger">account suspended</Badge> : null}
                {!r.published ? <Badge>not published</Badge> : null}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                About{" "}
                <Link
                  href={`/view/${r.username}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[--accent] hover:underline"
                >
                  /view/{r.username} <ExternalLink size={12} aria-hidden />
                </Link>
                {r.fullName ? ` · ${r.fullName}` : " · no matching account"}
              </p>
              {r.detail ? (
                <p className="mt-2 whitespace-pre-line rounded-sm bg-[--surface-2] p-2 text-sm">
                  {r.detail}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-ink-faint">
                {new Date(r.createdAt).toLocaleString()}
                {r.reviewedBy ? ` · reviewed by ${r.reviewedBy}` : ""}
              </p>
              {r.adminNote ? (
                <p className="mt-1 text-xs text-ink-soft">Note: {r.adminNote}</p>
              ) : null}
            </div>
          </div>

          {r.status === "OPEN" ? (
            <div className="mt-3 space-y-2 border-t border-[--line] pt-3">
              <Input
                value={notes[r.id] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                placeholder="What did you decide, and why? (kept on the record)"
                aria-label={`Note for report about ${r.username}`}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => resolveReport(r.id, "DISMISSED", notes[r.id]))}
                >
                  Nothing wrong — dismiss
                </Button>
                {r.userId && r.published ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      run(async () => {
                        const a = await unpublishProfile(r.userId!)
                        if (!a.ok) return a
                        return resolveReport(r.id, "ACTIONED", notes[r.id] || "Profile unpublished")
                      })
                    }
                  >
                    Unpublish the profile
                  </Button>
                ) : null}
                {r.userId && !r.suspended ? (
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={pending || (notes[r.id] ?? "").trim().length < 3}
                    onClick={() =>
                      run(async () => {
                        const a = await suspendUser(r.userId!, notes[r.id] ?? "")
                        if (!a.ok) return a
                        return resolveReport(r.id, "ACTIONED", notes[r.id])
                      })
                    }
                  >
                    Suspend the account
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => resolveReport(r.id, "REVIEWED", notes[r.id]))}
                >
                  Read it, deciding later
                </Button>
              </div>
              <p className="text-xs text-ink-faint">
                Suspending needs a reason — the person sees it when they try to sign in.
              </p>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  )
}
