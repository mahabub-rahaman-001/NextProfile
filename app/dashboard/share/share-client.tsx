"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, Copy, Link2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/input"
import { Badge, Card, CardTitle } from "@/components/ui/card"
import { FieldWrapper } from "@/components/forms/field-wrapper"
import { createShareLink, deleteShareLink, revokeShareLink } from "@/app/actions/sharing"

type ShareRow = {
  id: string
  token: string
  label: string | null
  documentId: string | null
  documentName?: string | null
  expiresAt: string | null
  revokedAt: string | null
  views: number
  lastViewAt: string | null
}

export function ShareClient({
  links,
  documents,
  appUrl,
  username,
}: {
  links: ShareRow[]
  documents: { id: string; name: string }[]
  appUrl: string
  username: string | null
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [label, setLabel] = useState("")
  const [documentId, setDocumentId] = useState("")
  const [days, setDays] = useState(30)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(key)
        setTimeout(() => setCopied(null), 1800)
      },
      () => setError("Couldn't copy — select the text and copy it manually."),
    )
  }

  function create() {
    setError(null)
    start(async () => {
      const res = await createShareLink({ label, documentId: documentId || null, days })
      if (!res.ok) return setError(res.message)
      setLabel("")
      router.refresh()
    })
  }

  const embedSnippet = username
    ? `<iframe src="${appUrl}/embed/${username}" width="360" height="190" style="border:0" title="NextProfile card"></iframe>`
    : null

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <CardTitle>Create a private link</CardTitle>
        <p className="-mt-2 text-sm text-ink-soft">
          For sending your profile to one person without publishing it. The link expires, and you
          can turn it off at any time.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <FieldWrapper label="Who is it for?" help="Only you see this">
            {(p) => (
              <Input
                {...p}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Recruiter at Brac Bank"
              />
            )}
          </FieldWrapper>
          <FieldWrapper label="What to share">
            {(p) => (
              <Select {...p} value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
                <option value="">My whole profile</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            )}
          </FieldWrapper>
          <FieldWrapper label="Expires in">
            {(p) => (
              <Select {...p} value={days} onChange={(e) => setDays(Number(e.target.value))}>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
              </Select>
            )}
          </FieldWrapper>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-[--danger]">
            {error}
          </p>
        ) : null}

        <Button onClick={create} disabled={pending}>
          <Link2 size={16} aria-hidden /> Create link
        </Button>
      </Card>

      {links.length ? (
        <Card className="space-y-3">
          <CardTitle>Your links</CardTitle>
          <ul className="divide-y divide-[--line]">
            {links.map((l) => {
              const url = `${appUrl}/s/${l.token}`
              const expired = l.expiresAt && new Date(l.expiresAt) < new Date()
              const dead = Boolean(l.revokedAt) || expired
              return (
                <li key={l.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {l.label || "Untitled link"}{" "}
                      {l.documentName ? (
                        <span className="text-ink-soft">· {l.documentName}</span>
                      ) : (
                        <span className="text-ink-soft">· whole profile</span>
                      )}
                    </p>
                    <p className="mt-0.5 break-all text-sm text-ink-faint">{url}</p>
                    <p className="mt-1 text-xs text-ink-faint" data-tabular>
                      {l.views} view{l.views === 1 ? "" : "s"}
                      {l.lastViewAt
                        ? ` · last opened ${new Date(l.lastViewAt).toLocaleDateString()}`
                        : ""}
                      {l.expiresAt ? ` · expires ${new Date(l.expiresAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {dead ? (
                      <Badge>{l.revokedAt ? "Turned off" : "Expired"}</Badge>
                    ) : (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => copy(url, l.id)}>
                          {copied === l.id ? (
                            <>
                              <Check size={14} aria-hidden /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} aria-hidden /> Copy
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              await revokeShareLink(l.id)
                              router.refresh()
                            })
                          }
                        >
                          Turn off
                        </Button>
                      </>
                    )}
                    <button
                      type="button"
                      aria-label="Delete link"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          await deleteShareLink(l.id)
                          router.refresh()
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-faint hover:bg-[--surface-2] hover:text-[--danger]"
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : null}

      {embedSnippet ? (
        <Card className="space-y-3">
          <CardTitle>Embed your profile card</CardTitle>
          <p className="-mt-1 text-sm text-ink-soft">
            Drop this into a blog, a personal site or a GitHub README. It shows your name, headline
            and top skills, and links back to your profile.
          </p>
          <pre className="overflow-x-auto rounded-sm border border-[--line] bg-[--surface-2] p-3 text-xs">
            {embedSnippet}
          </pre>
          <Button variant="secondary" onClick={() => copy(embedSnippet, "embed")}>
            {copied === "embed" ? (
              <>
                <Check size={14} aria-hidden /> Copied
              </>
            ) : (
              <>
                <Copy size={14} aria-hidden /> Copy snippet
              </>
            )}
          </Button>
        </Card>
      ) : null}
    </div>
  )
}
