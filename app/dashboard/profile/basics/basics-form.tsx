"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { Check, Upload, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { FieldWrapper, countWords } from "@/components/forms/field-wrapper"
import { Card, CardTitle } from "@/components/ui/card"
import { saveBasics } from "@/app/actions/profile"

type Values = {
  fullName: string
  headline: string
  photoUrl?: string
  about: string
  location: string
  languages: string
  contact: { email: string; phone: string; showEmail: boolean; showPhone: boolean; showLocation: boolean }
  links: Record<string, string>
}

const LINK_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "website", label: "Website", placeholder: "https://yoursite.com" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/you" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/you" },
  { key: "behance", label: "Behance", placeholder: "https://behance.net/you" },
  { key: "dribbble", label: "Dribbble", placeholder: "https://dribbble.com/you" },
  { key: "scholar", label: "Google Scholar", placeholder: "https://scholar.google.com/…" },
  { key: "orcid", label: "ORCID", placeholder: "https://orcid.org/…" },
]

export function BasicsForm({
  initial,
  suggestedLinks,
  aboutPlaceholder,
}: {
  initial: Values
  suggestedLinks: string[]
  aboutPlaceholder: string
}) {
  const router = useRouter()
  const [v, setV] = useState<Values>(initial)
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      
      set("photoUrl", data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Show the links this profile type actually uses, plus any already filled in.
  const links = LINK_FIELDS.filter(
    (l) => suggestedLinks.includes(l.key) || Boolean(v.links[l.key]),
  )
  const extraLinks = LINK_FIELDS.filter((l) => !links.includes(l))

  const set = <K extends keyof Values>(k: K, value: Values[K]) => {
    setV((p) => ({ ...p, [k]: value }))
    setSaved(false)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await saveBasics({
        fullName: v.fullName,
        headline: v.headline,
        photoUrl: v.photoUrl,
        about: v.about,
        location: v.location,
        languages: v.languages.split(",").map((s) => s.trim()).filter(Boolean),
        contact: v.contact,
        links: v.links,
      })
      if (!res.ok) return setError(res.message)
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <Card className="space-y-4">
        <CardTitle>About you</CardTitle>

        <div className="flex items-center gap-6 pb-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[--line] border border-[--line]">
            {v.photoUrl ? (
              <img src={v.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-faint">
                <ImageIcon size={24} />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                <Loader2 size={20} className="animate-spin" />
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleUpload}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload size={16} />
              Upload photo
            </Button>
            <p className="mt-2 text-xs text-ink-faint">Square image recommended, up to 5MB.</p>
          </div>
        </div>

        <FieldWrapper label="Full name" required>
          {(p) => (
            <Input {...p} value={v.fullName} onChange={(e) => set("fullName", e.target.value)} />
          )}
        </FieldWrapper>

        <FieldWrapper
          label="Headline"
          help="One line under your name, everywhere you publish."
        >
          {(p) => (
            <Input
              {...p}
              value={v.headline}
              onChange={(e) => set("headline", e.target.value)}
              placeholder="e.g. Final-year BBA student · Marketing and analytics"
            />
          )}
        </FieldWrapper>

        <FieldWrapper
          label="About"
          help="Written in your own words. The AI assistant can help you tighten it later."
          targetWords={[40, 80]}
          words={countWords(v.about)}
        >
          {(p) => (
            <Textarea
              {...p}
              rows={6}
              value={v.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder={aboutPlaceholder}
            />
          )}
        </FieldWrapper>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Location">
            {(p) => (
              <Input
                {...p}
                value={v.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Dhaka, Bangladesh"
              />
            )}
          </FieldWrapper>
          <FieldWrapper label="Languages" help="Comma separated">
            {(p) => (
              <Input
                {...p}
                value={v.languages}
                onChange={(e) => set("languages", e.target.value)}
                placeholder="Bangla, English"
              />
            )}
          </FieldWrapper>
        </div>
      </Card>

      <Card className="space-y-4">
        <CardTitle>Contact</CardTitle>
        <p className="-mt-2 text-sm text-ink-soft">
          Stored either way. Each one only becomes visible on your public profile if you switch it
          on here.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Email">
            {(p) => (
              <Input
                {...p}
                type="email"
                value={v.contact.email}
                onChange={(e) => set("contact", { ...v.contact, email: e.target.value })}
              />
            )}
          </FieldWrapper>
          <FieldWrapper label="Phone">
            {(p) => (
              <Input
                {...p}
                value={v.contact.phone}
                onChange={(e) => set("contact", { ...v.contact, phone: e.target.value })}
              />
            )}
          </FieldWrapper>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Show on my public profile</legend>
          <Toggle
            label="My email address"
            checked={v.contact.showEmail}
            onChange={(b) => set("contact", { ...v.contact, showEmail: b })}
          />
          <Toggle
            label="My phone number"
            checked={v.contact.showPhone}
            onChange={(b) => set("contact", { ...v.contact, showPhone: b })}
          />
          <Toggle
            label="My location"
            checked={v.contact.showLocation}
            onChange={(b) => set("contact", { ...v.contact, showLocation: b })}
          />
        </fieldset>
      </Card>

      <Card className="space-y-4">
        <CardTitle>Links</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {links.map((l) => (
            <FieldWrapper key={l.key} label={l.label}>
              {(p) => (
                <Input
                  {...p}
                  value={v.links[l.key] ?? ""}
                  onChange={(e) => set("links", { ...v.links, [l.key]: e.target.value })}
                  placeholder={l.placeholder}
                />
              )}
            </FieldWrapper>
          ))}
        </div>

        {extraLinks.length ? (
          <details>
            <summary className="cursor-pointer text-sm text-ink-faint hover:text-ink">
              Add another link
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {extraLinks.map((l) => (
                <FieldWrapper key={l.key} label={l.label}>
                  {(p) => (
                    <Input
                      {...p}
                      value={v.links[l.key] ?? ""}
                      onChange={(e) => set("links", { ...v.links, [l.key]: e.target.value })}
                      placeholder={l.placeholder}
                    />
                  )}
                </FieldWrapper>
              ))}
            </div>
          </details>
        ) : null}
      </Card>

      {error ? (
        <p role="alert" className="rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-20 flex items-center gap-3 lg:bottom-4">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Saving…" : "Save"}
        </Button>
        {saved ? (
          <span className="inline-flex items-center gap-1 text-sm text-[--success]">
            <Check size={15} aria-hidden /> Saved
          </span>
        ) : null}
      </div>
    </form>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (b: boolean) => void
}) {
  return (
    <label className="flex min-h-[44px] items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[--accent]"
      />
      {label}
    </label>
  )
}
