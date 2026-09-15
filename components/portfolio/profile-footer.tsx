"use client"

import { useState } from "react"

/**
 * Two small things that make a public profile trustworthy: when it was last
 * touched, and a way to report it if it is not what it claims to be.
 */
export function ProfileFooter({
  username,
  updatedAt,
}: {
  username: string
  updatedAt: string
}) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [reason, setReason] = useState("impersonation")
  const [detail, setDetail] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, reason, detail }),
    }).catch(() => {})
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 text-xs text-ink-faint">
      <p className="flex flex-wrap items-center justify-between gap-2 border-t border-[--line] pt-4">
        <span>
          Last updated{" "}
          {new Date(updatedAt).toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        {!open && !sent ? (
          <button type="button" onClick={() => setOpen(true)} className="underline hover:text-ink">
            Report this profile
          </button>
        ) : null}
      </p>

      {sent ? (
        <p className="mt-3 rounded-sm border border-[--line] bg-[--surface] p-3">
          Thank you — a person will read this. We do not act on reports automatically.
        </p>
      ) : open ? (
        <form
          onSubmit={submit}
          className="mt-3 space-y-2 rounded-sm border border-[--line] bg-[--surface] p-3"
        >
          <label className="block">
            <span className="mb-1 block">What is wrong with it?</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[40px] w-full rounded-sm border border-[--line] bg-[--surface] px-2 text-sm text-ink"
            >
              <option value="impersonation">It is pretending to be someone else</option>
              <option value="fake_credentials">The qualifications are not real</option>
              <option value="offensive">It contains offensive content</option>
              <option value="spam">It is spam or an advert</option>
              <option value="not_a_real_person">It is not a real person</option>
              <option value="other">Something else</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block">Anything you can tell us (optional)</span>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              className="w-full rounded-sm border border-[--line] bg-[--surface] p-2 text-sm text-ink"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="rounded-sm bg-[--accent] px-3 py-1.5 text-[--accent-ink]">
              Send report
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-2 py-1.5">
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
