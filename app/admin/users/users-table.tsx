"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ExternalLink, Search, ShieldOff, ShieldCheck, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge, Card } from "@/components/ui/card"
import { setRole, suspendUser, unpublishProfile, unsuspendUser } from "@/app/actions/admin"

export type AdminUserRow = {
  id: string
  email: string
  username: string | null
  fullName: string
  profileType: string
  completeness: number
  published: boolean
  role: "USER" | "ADMIN"
  suspendedAt: string | null
  suspendedReason: string | null
  documents: number
  applications: number
  createdAt: string
}

export function UsersTable({ users, query }: { users: AdminUserRow[]; query: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [reason, setReason] = useState("")

  function run(fn: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null)
    start(async () => {
      const res = await fn()
      if (!res.ok) return setError(res.message ?? "That didn't work.")
      setConfirming(null)
      setReason("")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <form className="flex max-w-md gap-2" action="/admin/users">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Search by email, username or name"
          aria-label="Search users"
        />
        <Button type="submit" variant="secondary">
          <Search size={16} aria-hidden /> Search
        </Button>
      </form>

      {error ? (
        <p role="alert" className="rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]">
          {error}
        </p>
      ) : null}

      {users.length === 0 ? (
        <p className="text-sm text-ink-faint">No accounts match that.</p>
      ) : null}

      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id}>
            <Card className={u.suspendedAt ? "border-l-2 border-l-[--danger]" : undefined}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {u.fullName || "(no name yet)"}
                    {u.role === "ADMIN" ? <Badge tone="warning">Admin</Badge> : null}
                    {u.suspendedAt ? <Badge tone="danger">Suspended</Badge> : null}
                    {u.published ? <Badge tone="accent">Published</Badge> : null}
                  </p>
                  <p className="mt-0.5 break-all text-sm text-ink-soft">{u.email}</p>
                  <p className="mt-1 text-xs text-ink-faint" data-tabular>
                    {u.profileType.toLowerCase()} · {u.completeness}% complete · {u.documents} doc
                    {u.documents === 1 ? "" : "s"} · {u.applications} application
                    {u.applications === 1 ? "" : "s"} · joined{" "}
                    {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                  {u.suspendedReason ? (
                    <p className="mt-1 text-xs text-[--danger]">Reason: {u.suspendedReason}</p>
                  ) : null}
                  {u.username ? (
                    <Link
                      href={`/view/${u.username}`}
                      target="_blank"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-[--accent] hover:underline"
                    >
                      /view/{u.username} <ExternalLink size={12} aria-hidden />
                    </Link>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {u.published ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pending}
                      onClick={() => run(() => unpublishProfile(u.id))}
                    >
                      <EyeOff size={14} aria-hidden /> Unpublish
                    </Button>
                  ) : null}

                  {u.suspendedAt ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pending}
                      onClick={() => run(() => unsuspendUser(u.id))}
                    >
                      <ShieldCheck size={14} aria-hidden /> Restore
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => setConfirming(confirming === u.id ? null : u.id)}
                    >
                      <ShieldOff size={14} aria-hidden /> Suspend
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => run(() => setRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN"))}
                  >
                    {u.role === "ADMIN" ? "Remove admin" : "Make admin"}
                  </Button>
                </div>
              </div>

              {confirming === u.id ? (
                <div className="mt-3 space-y-2 rounded-sm border border-[--line] bg-[--surface-2] p-3">
                  <p className="text-sm">
                    Suspending signs them out everywhere and hides their public profile. Nothing is
                    deleted, and you can restore it at any time.
                  </p>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason (shown to them when they try to sign in)"
                    aria-label="Suspension reason"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={pending || reason.trim().length < 3}
                      onClick={() => run(() => suspendUser(u.id, reason))}
                    >
                      Suspend this account
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
