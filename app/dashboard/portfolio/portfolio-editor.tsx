"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, ChevronUp, ExternalLink, Eye, Globe, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge, Card, CardTitle } from "@/components/ui/card"
import { FieldWrapper } from "@/components/forms/field-wrapper"
import { PortfolioRenderer, THEMES, type ThemeId } from "@/components/portfolio/themes"
import { PORTFOLIO_SECTION_TITLES } from "@/components/portfolio/engine/sections"
import { publishPortfolio, updatePortfolio } from "@/app/actions/documents"
import { claimUsername } from "@/app/actions/profile"
import type { ProfileData } from "@/lib/profile/load"
import type { PortfolioConfig } from "@/lib/validation"
import { cn } from "@/lib/utils"

export function PortfolioEditor({
  data,
  initialThemeId,
  initialConfig,
  available,
  published,
  username,
  appUrl,
}: {
  data: ProfileData
  initialThemeId: string
  initialConfig: PortfolioConfig
  available: string[]
  published: boolean
  username: string | null
  appUrl: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [tab, setTab] = useState<"edit" | "preview">("edit")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [themeId, setThemeId] = useState<ThemeId>(
    (initialThemeId in THEMES ? initialThemeId : "minimal") as ThemeId,
  )
  const [config, setConfig] = useState<PortfolioConfig>({
    ...initialConfig,
    sections: initialConfig.sections?.length
      ? initialConfig.sections
      : available.map((id) => ({ id, visible: true })),
  })
  const [name, setName] = useState(username ?? "")

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaved(false)
    const t = setTimeout(() => {
      start(async () => {
        const res = await updatePortfolio({ themeId, config })
        if (res.ok) setSaved(true)
      })
    }, 600)
    return () => clearTimeout(t)
  }, [themeId, config])

  const sections = config.sections ?? []

  const preview = useMemo(
    () => <PortfolioRenderer data={data} themeId={themeId} config={config} />,
    [data, themeId, config],
  )

  function move(id: string, dir: -1 | 1) {
    const list = [...sections]
    const i = list.findIndex((s) => s.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    setConfig((c) => ({ ...c, sections: list }))
  }

  function toggle(id: string) {
    setConfig((c) => ({
      ...c,
      sections: (c.sections ?? []).map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
    }))
  }

  function claim() {
    setError(null)
    start(async () => {
      const res = await claimUsername(name)
      if (!res.ok) return setError(res.message)
      router.refresh()
    })
  }

  function setPublished(next: boolean) {
    setError(null)
    start(async () => {
      const res = await publishPortfolio(next)
      if (!res.ok) return setError(res.message)
      router.refresh()
    })
  }

  const profileType = String(data.profile?.profileType ?? "STUDENT")
  const publicUrl = username ? `${appUrl}/view/${username}` : null
  const contact = (data.profile?.contact ?? {}) as {
    showEmail?: boolean
    showPhone?: boolean
    showLocation?: boolean
  }

  return (
    <div className="lg:flex lg:h-[calc(100vh-1px)]">
      <div
        className={cn(
          "lg:w-[380px] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-[--line]",
          tab === "edit" ? "block" : "hidden lg:block",
        )}
      >
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <Badge tone={published ? "accent" : "neutral"}>
              {published ? "Published" : "Private"}
            </Badge>
            {saved ? (
              <span className="inline-flex items-center gap-1 text-xs text-[--success]">
                <Check size={13} aria-hidden /> Saved
              </span>
            ) : pending ? (
              <span className="text-xs text-ink-faint">Saving…</span>
            ) : null}
          </div>

          <Card className="space-y-3">
            <CardTitle>Your address</CardTitle>
            <FieldWrapper
              label={`${(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/^https?:\/\//, "")}/view/…`}
              help="Letters, numbers and hyphens. You can change it again after 30 days."
            >
              {(p) => (
                <div className="flex gap-2">
                  <Input
                    {...p}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="your-name"
                  />
                  <Button
                    variant="secondary"
                    onClick={claim}
                    disabled={pending || !name || name === username}
                  >
                    {username === name ? "Claimed" : "Claim"}
                  </Button>
                </div>
              )}
            </FieldWrapper>
            {publicUrl ? (
              <a
                href={`/view/${username}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[--accent] hover:underline"
              >
                {publicUrl} <ExternalLink size={13} aria-hidden />
              </a>
            ) : null}
          </Card>

          <Card className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <CardTitle>Theme</CardTitle>
              <span className="text-xs text-ink-faint">{Object.keys(THEMES).length} to choose from</span>
            </div>

            {/* Ten of these. A list would run off the panel, so: a grid of
                names, with the blurb shown for whichever is selected. */}
            <div className="grid grid-cols-2 gap-2">
              {Object.values(THEMES).map((t) => {
                const recommended = (t.suits as readonly string[]).includes(profileType)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeId(t.id as ThemeId)}
                    aria-pressed={themeId === t.id}
                    title={t.blurb}
                    className={cn(
                      "min-h-[44px] rounded-sm border px-3 py-2 text-left text-sm",
                      themeId === t.id
                        ? "border-[--accent] bg-[--accent-soft] font-medium"
                        : "border-[--line] hover:bg-[--surface-2]",
                    )}
                  >
                    {t.name}
                    {recommended && themeId !== t.id ? (
                      <span className="mt-0.5 block text-[10px] uppercase tracking-[0.08em] text-[--accent]">
                        suits you
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>

            <p className="text-sm text-ink-soft">{THEMES[themeId].blurb}</p>
            <FieldWrapper label="Accent colour">
              {(p) => (
                <input
                  {...p}
                  type="color"
                  value={config.accent}
                  onChange={(e) => setConfig((c) => ({ ...c, accent: e.target.value }))}
                  className="h-11 w-full cursor-pointer rounded-sm border border-[--line] bg-[--surface] p-1"
                />
              )}
            </FieldWrapper>
          </Card>

          <Card className="space-y-2">
            <CardTitle>Sections</CardTitle>
            <ul className="space-y-1">
              {sections
                .filter((s) => available.includes(s.id))
                .map((s, i, list) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-1 rounded-sm border border-[--line] bg-[--surface] px-2 py-1"
                  >
                    <label className="flex min-h-[44px] flex-1 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={s.visible}
                        onChange={() => toggle(s.id)}
                        className="h-4 w-4 accent-[--accent]"
                      />
                      <span className={cn(!s.visible && "text-ink-faint line-through")}>
                        {PORTFOLIO_SECTION_TITLES[s.id] ?? s.id}
                      </span>
                    </label>
                    <button
                      type="button"
                      aria-label={`Move ${PORTFOLIO_SECTION_TITLES[s.id] ?? s.id} up`}
                      disabled={i === 0}
                      onClick={() => move(s.id, -1)}
                      className="inline-flex h-11 w-9 items-center justify-center rounded-sm text-ink-faint hover:bg-[--surface-2] disabled:opacity-30"
                    >
                      <ChevronUp size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${PORTFOLIO_SECTION_TITLES[s.id] ?? s.id} down`}
                      disabled={i === list.length - 1}
                      onClick={() => move(s.id, 1)}
                      className="inline-flex h-11 w-9 items-center justify-center rounded-sm text-ink-faint hover:bg-[--surface-2] disabled:opacity-30"
                    >
                      <ChevronDown size={15} aria-hidden />
                    </button>
                  </li>
                ))}
            </ul>
          </Card>

          <Card className="space-y-3">
            <CardTitle>{published ? "Published" : "Publish"}</CardTitle>
            <p className="text-sm text-ink-soft">
              {published
                ? "Anyone with the link can see this page."
                : "Nothing is visible to anyone until you publish."}
            </p>
            <ul className="space-y-1 text-sm">
              <Visible on label="Your name, headline and everything you added" />
              <Visible on={contact.showEmail} label="Your email address" />
              <Visible on={contact.showPhone} label="Your phone number" />
              <Visible on={contact.showLocation !== false} label="Your location" />
            </ul>
            <p className="text-xs text-ink-faint">
              Change what&rsquo;s shown under Profile → Basic information.
            </p>

            {error ? (
              <p role="alert" className="rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]">
                {error}
              </p>
            ) : null}

            {published ? (
              <Button variant="secondary" onClick={() => setPublished(false)} disabled={pending}>
                Unpublish
              </Button>
            ) : (
              <Button onClick={() => setPublished(true)} disabled={pending || !username}>
                <Globe size={16} aria-hidden /> Publish my profile
              </Button>
            )}
          </Card>
        </div>
      </div>

      <div
        className={cn(
          "min-w-0 flex-1 bg-[--surface-2] lg:overflow-y-auto",
          tab === "preview" ? "block" : "hidden lg:block",
        )}
      >
        <div className="min-h-full bg-[--paper]">{preview}</div>
      </div>

      <div className="fixed inset-x-0 bottom-20 z-20 flex justify-center lg:hidden">
        <div className="flex gap-1 rounded-full border border-[--line] bg-[--surface] p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm",
              tab === "edit" && "bg-[--accent] text-[--accent-ink]",
            )}
          >
            <Settings2 size={15} aria-hidden /> Build
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm",
              tab === "preview" && "bg-[--accent] text-[--accent-ink]",
            )}
          >
            <Eye size={15} aria-hidden /> Preview
          </button>
        </div>
      </div>
    </div>
  )
}

function Visible({ on, label }: { on?: boolean; label: string }) {
  return (
    <li className={cn("flex items-start gap-2", on ? "text-ink" : "text-ink-faint line-through")}>
      <span aria-hidden className="mt-0.5">
        {on ? "✓" : "—"}
      </span>
      {label}
    </li>
  )
}
