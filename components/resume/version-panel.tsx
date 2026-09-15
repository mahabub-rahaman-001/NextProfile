"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Download, History, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardTitle } from "@/components/ui/card"
import { deleteVersion, restoreVersion, saveVersion } from "@/app/actions/versions"

export type VersionRow = {
  id: string
  label: string | null
  templateId: string
  createdAt: string
}

/**
 * "Restore the one I sent to Grameenphone."
 * A version freezes the data as well as the layout, so the PDF it produces is
 * what the employer actually received — even after the profile moves on.
 */
export function VersionPanel({
  documentId,
  versions,
}: {
  documentId: string
  versions: VersionRow[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [label, setLabel] = useState("")
  const [error, setError] = useState<string | null>(null)

  function save() {
    setError(null)
    start(async () => {
      const res = await saveVersion(documentId, label)
      if (!res.ok) return setError(res.message)
      setLabel("")
      router.refresh()
    })
  }

  return (
    <Card className="space-y-3">
      <CardTitle>
        <span className="inline-flex items-center gap-2">
          <History size={16} aria-hidden /> Versions
        </span>
      </CardTitle>
      <p className="-mt-1 text-sm text-ink-soft">
        Save a snapshot before you send this somewhere. It keeps the layout <em>and</em> the content
        exactly as they are now.
      </p>

      <div className="flex gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Sent to Grameenphone"
          aria-label="Version label"
        />
        <Button variant="secondary" onClick={save} disabled={pending}>
          Save
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[--danger]">
          {error}
        </p>
      ) : null}

      {versions.length === 0 ? (
        <p className="text-sm text-ink-faint">No versions saved yet.</p>
      ) : (
        <ul className="divide-y divide-[--line]">
          {versions.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{v.label || "Untitled snapshot"}</p>
                <p className="text-xs text-ink-faint" data-tabular>
                  {new Date(v.createdAt).toLocaleString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {v.templateId}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <a
                  href={`/api/versions/${v.id}/pdf`}
                  aria-label="Download this version"
                  title="Download this version"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-faint hover:bg-[--surface-2] hover:text-ink"
                >
                  <Download size={15} aria-hidden />
                </a>
                <button
                  type="button"
                  aria-label="Restore this layout"
                  title="Restore this layout"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await restoreVersion(v.id)
                      router.refresh()
                    })
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-faint hover:bg-[--surface-2] hover:text-ink"
                >
                  <RotateCcw size={15} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Delete this version"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await deleteVersion(v.id)
                      router.refresh()
                    })
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-faint hover:bg-[--surface-2] hover:text-[--danger]"
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-ink-faint">
        Restoring brings back the template and section layout, not the old content — that would undo
        real edits to your profile. The saved PDF stays downloadable either way.
      </p>
    </Card>
  )
}
