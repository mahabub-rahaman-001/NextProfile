"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ExternalLink, Plus, Sparkles, Trash2, X } from "lucide-react"
import type { ApplicationStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input, Select, Textarea } from "@/components/ui/input"
import { Badge, Card, CardTitle, EmptyState } from "@/components/ui/card"
import { FieldWrapper } from "@/components/forms/field-wrapper"
import { MatchPanel } from "@/components/applications/match-panel"
import {
  analyseJob,
  createApplication,
  createTailoredResume,
  deleteApplication,
  setApplicationStatus,
} from "@/app/actions/applications"
import type { MatchResult } from "@/lib/matching"

type AppRow = {
  id: string
  company: string
  role: string
  location: string | null
  jobUrl: string | null
  status: ApplicationStatus
  matchScore: number | null
  appliedAt: string | null
  nextStep: string | null
  documentId: string | null
  versionId: string | null
  createdAt: string
}

type Doc = { id: string; name: string; kind: string }

const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "SAVED", label: "Saved" },
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
]

export function ApplicationsClient({
  applications,
  documents,
}: {
  applications: AppRow[]
  documents: Doc[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [adding, setAdding] = useState(applications.length === 0)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    company: "",
    role: "",
    location: "",
    jobUrl: "",
    jobDescription: "",
    documentId: documents[0]?.id ?? "",
    status: "SAVED" as ApplicationStatus,
  })
  const [match, setMatch] = useState<MatchResult | null>(null)

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  function analyse() {
    setError(null)
    start(async () => {
      const res = await analyseJob(form.jobDescription)
      if (!res.ok) return setError(res.message)
      setMatch(res.data ?? null)
    })
  }

  function save() {
    setError(null)
    start(async () => {
      const res = await createApplication({
        ...form,
        documentId: form.documentId || null,
      })
      if (!res.ok) return setError(res.message)
      setForm({ ...form, company: "", role: "", jobUrl: "", jobDescription: "", location: "" })
      setMatch(null)
      setAdding(false)
      router.refresh()
    })
  }

  function tailor() {
    if (!form.documentId || !form.company || !form.role) return
    start(async () => {
      const res = await createTailoredResume(form.documentId, form.company, form.role)
      if (res.ok && res.data) router.push(`/dashboard/resume/${res.data.id}`)
    })
  }

  const grouped = STATUSES.map((s) => ({
    ...s,
    rows: applications.filter((a) => a.status === s.value),
  })).filter((g) => g.rows.length > 0)

  return (
    <div className="space-y-6">
      {error ? (
        <p role="alert" className="rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]">
          {error}
        </p>
      ) : null}

      {adding ? (
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <CardTitle>Track an application</CardTitle>
            {applications.length > 0 ? (
              <button
                type="button"
                onClick={() => setAdding(false)}
                aria-label="Close"
                className="text-ink-faint hover:text-ink"
              >
                <X size={18} aria-hidden />
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldWrapper label="Company" required>
              {(p) => (
                <Input
                  {...p}
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="e.g. Grameenphone"
                />
              )}
            </FieldWrapper>
            <FieldWrapper label="Role" required>
              {(p) => (
                <Input
                  {...p}
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  placeholder="e.g. Management Trainee"
                />
              )}
            </FieldWrapper>
            <FieldWrapper label="Location">
              {(p) => (
                <Input {...p} value={form.location} onChange={(e) => set("location", e.target.value)} />
              )}
            </FieldWrapper>
            <FieldWrapper label="Job link">
              {(p) => (
                <Input
                  {...p}
                  value={form.jobUrl}
                  onChange={(e) => set("jobUrl", e.target.value)}
                  placeholder="https://…"
                />
              )}
            </FieldWrapper>
          </div>

          <FieldWrapper
            label="Job description"
            help="Paste the ad. We compare its wording with your profile — no guessing, no model call, nothing sent anywhere."
          >
            {(p) => (
              <Textarea
                {...p}
                rows={7}
                value={form.jobDescription}
                onChange={(e) => set("jobDescription", e.target.value)}
                placeholder="Paste the full job posting here…"
              />
            )}
          </FieldWrapper>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={analyse}
              disabled={pending || form.jobDescription.trim().length < 40}
            >
              <Sparkles size={16} aria-hidden /> {pending ? "Comparing…" : "Compare with my profile"}
            </Button>
            {match && form.documentId ? (
              <Button variant="secondary" onClick={tailor} disabled={pending || !form.company || !form.role}>
                Create a tailored copy
              </Button>
            ) : null}
          </div>

          {match ? <MatchPanel result={match} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldWrapper
              label="Which resume did you send?"
              help="We freeze a copy, so you can always see exactly what they received."
            >
              {(p) => (
                <Select
                  {...p}
                  value={form.documentId}
                  onChange={(e) => set("documentId", e.target.value)}
                >
                  <option value="">Not decided yet</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              )}
            </FieldWrapper>
            <FieldWrapper label="Status">
              {(p) => (
                <Select
                  {...p}
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as ApplicationStatus)}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              )}
            </FieldWrapper>
          </div>

          <Button onClick={save} disabled={pending || !form.company || !form.role}>
            {pending ? "Saving…" : "Save application"}
          </Button>
        </Card>
      ) : (
        <Button onClick={() => setAdding(true)}>
          <Plus size={16} aria-hidden /> Track an application
        </Button>
      )}

      {applications.length === 0 && !adding ? (
        <EmptyState
          title="Nothing tracked yet"
          line="Keep every application in one place: which resume went where, what the job asked for, and what happened next."
          action={<Button onClick={() => setAdding(true)}>Track an application</Button>}
        />
      ) : null}

      {grouped.map((group) => (
        <section key={group.value}>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.09em] text-ink-faint">
            {group.label} · {group.rows.length}
          </h2>
          <ul className="space-y-2">
            {group.rows.map((a) => (
              <li key={a.id}>
                <Card className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {a.role} <span className="text-ink-soft">· {a.company}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-faint">
                      {[a.location, a.appliedAt ? `applied ${fmt(a.appliedAt)}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {a.nextStep ? (
                      <p className="mt-1 text-sm">
                        <span className="text-ink-faint">Next:</span> {a.nextStep}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {a.matchScore !== null ? (
                        <Badge tone={a.matchScore >= 60 ? "accent" : "neutral"}>
                          {a.matchScore}% overlap
                        </Badge>
                      ) : null}
                      {a.versionId ? (
                        <a
                          href={`/api/versions/${a.versionId}/pdf`}
                          className="text-sm text-[--accent] hover:underline"
                        >
                          The resume they got
                        </a>
                      ) : null}
                      {a.jobUrl ? (
                        <a
                          href={a.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[--accent] hover:underline"
                        >
                          Job ad <ExternalLink size={12} aria-hidden />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Select
                      aria-label={`Status for ${a.role} at ${a.company}`}
                      value={a.status}
                      disabled={pending}
                      onChange={(e) =>
                        start(async () => {
                          await setApplicationStatus(a.id, e.target.value as ApplicationStatus)
                          router.refresh()
                        })
                      }
                      className="min-h-[44px] w-auto py-1 text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                    <button
                      type="button"
                      aria-label="Delete"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          await deleteApplication(a.id)
                          router.refresh()
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-faint hover:bg-[--surface-2] hover:text-[--danger]"
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {documents.length === 0 ? (
        <p className="text-sm text-ink-faint">
          You have no resumes yet.{" "}
          <Link href="/dashboard/resume" className="text-[--accent] hover:underline">
            Create one
          </Link>{" "}
          and we can freeze a copy with each application.
        </p>
      ) : null}
    </div>
  )
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" })
}
