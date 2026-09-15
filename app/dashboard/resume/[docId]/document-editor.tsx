"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Check, Download, Eye, Printer, Settings2, Trash2 } from "lucide-react"
import type { DocKind } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/input"
import { Badge, Card, CardTitle } from "@/components/ui/card"
import { FieldWrapper } from "@/components/forms/field-wrapper"
import { DocumentRenderer, TEMPLATES, type TemplateId } from "@/components/resume/templates"
import { SECTION_TITLES } from "@/components/resume/engine/resolve"
import { VersionPanel, type VersionRow } from "@/components/resume/version-panel"
import { ScaledPreview } from "@/components/resume/scaled-preview"
import { deleteDocument, updateDocument } from "@/app/actions/documents"
import type { ProfileData } from "@/lib/profile/load"
import type { DocConfig } from "@/lib/validation"
import { cn } from "@/lib/utils"

/**
 * Editor left, real output right. The preview renders the SAME template
 * components the PDF does, so what the user approves is what gets printed.
 */
export function DocumentEditor({
  docId,
  kind,
  initialName,
  initialTemplateId,
  initialConfig,
  available,
  data,
  versions,
}: {
  docId: string
  kind: DocKind
  initialName: string
  initialTemplateId: string
  initialConfig: DocConfig
  available: string[]
  data: ProfileData
  versions: VersionRow[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [tab, setTab] = useState<"edit" | "preview">("edit")
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState(initialName)
  const [templateId, setTemplateId] = useState<TemplateId>(
    (initialTemplateId in TEMPLATES ? initialTemplateId : "minimal") as TemplateId,
  )
  const [config, setConfig] = useState<DocConfig>({
    ...initialConfig,
    sectionOrder: initialConfig.sectionOrder?.length ? initialConfig.sectionOrder : available,
  })

  const first = useRef(true)

  // Autosave — no save button on a document that previews live.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaved(false)
    const t = setTimeout(() => {
      start(async () => {
        const res = await updateDocument(docId, { name, templateId, config })
        if (res.ok) setSaved(true)
      })
    }, 600)
    return () => clearTimeout(t)
  }, [docId, name, templateId, config])

  const order = config.sectionOrder ?? available
  const hidden = new Set(config.hidden ?? [])
  const template = TEMPLATES[templateId]

  const preview = useMemo(
    () => <DocumentRenderer data={data} kind={kind} templateId={templateId} config={config} />,
    [data, kind, templateId, config],
  )

  function move(key: string, dir: -1 | 1) {
    const list = [...order]
    const i = list.indexOf(key)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    setConfig((c) => ({ ...c, sectionOrder: list }))
  }

  function toggle(key: string) {
    setConfig((c) => {
      const h = new Set(c.hidden ?? [])
      if (h.has(key)) h.delete(key)
      else h.add(key)
      return { ...c, hidden: [...h] }
    })
  }

  return (
    <div className="lg:flex lg:h-[calc(100vh-1px)]">
      {/* Editor */}
      <div
        className={cn(
          "lg:w-[380px] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-[--line]",
          tab === "edit" ? "block" : "hidden lg:block",
        )}
      >
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <Badge tone={template.atsSafe ? "accent" : "neutral"}>
              {template.atsSafe ? "ATS-safe" : "Styled"}
            </Badge>
            {saved ? (
              <span className="inline-flex items-center gap-1 text-xs text-[--success]">
                <Check size={13} aria-hidden /> Saved
              </span>
            ) : pending ? (
              <span className="text-xs text-ink-faint">Saving…</span>
            ) : null}
          </div>

          <FieldWrapper label="Document name">
            {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} />}
          </FieldWrapper>

          <Card className="space-y-3">
            <CardTitle>Template</CardTitle>
            <div className="space-y-2">
              {Object.values(TEMPLATES).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id as TemplateId)}
                  aria-pressed={templateId === t.id}
                  className={cn(
                    "w-full rounded-sm border p-3 text-left",
                    templateId === t.id
                      ? "border-[--accent] bg-[--accent-soft]"
                      : "border-[--line] hover:bg-[--surface-2]",
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-medium">{t.name}</span>
                    {t.atsSafe ? <Badge tone="accent">ATS-safe</Badge> : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-soft">{t.blurb}</span>
                </button>
              ))}
            </div>
            {!template.atsSafe ? (
              <p className="rounded-sm border-l-2 border-[--warning] bg-[--surface-2] px-3 py-2 text-sm text-ink-soft">
                Many employers screen applications automatically, and those systems read
                multi-column layouts badly. For an online application form, use Minimal.
              </p>
            ) : null}
          </Card>

          <Card className="space-y-3">
            <CardTitle>Layout</CardTitle>
            <div className="grid grid-cols-2 gap-3">
              <FieldWrapper label="Density">
                {(p) => (
                  <Select
                    {...p}
                    value={config.density}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, density: e.target.value as DocConfig["density"] }))
                    }
                  >
                    <option value="compact">Compact</option>
                    <option value="regular">Regular</option>
                    <option value="spacious">Spacious</option>
                  </Select>
                )}
              </FieldWrapper>
              <FieldWrapper label="Paper">
                {(p) => (
                  <Select
                    {...p}
                    value={config.paper}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, paper: e.target.value as DocConfig["paper"] }))
                    }
                  >
                    <option value="A4">A4</option>
                    <option value="LETTER">US Letter</option>
                  </Select>
                )}
              </FieldWrapper>
            </div>
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
            <p className="text-sm text-ink-soft">
              Hiding a section never deletes anything — it just leaves it off this document.
            </p>
            <ul className="mt-2 space-y-1">
              {order
                .filter((k) => available.includes(k))
                .map((key, i, list) => (
                  <li
                    key={key}
                    className="flex items-center gap-1 rounded-sm border border-[--line] bg-[--surface] px-2 py-1"
                  >
                    <label className="flex min-h-[44px] flex-1 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!hidden.has(key)}
                        onChange={() => toggle(key)}
                        className="h-4 w-4 accent-[--accent]"
                      />
                      <span className={cn(hidden.has(key) && "text-ink-faint line-through")}>
                        {SECTION_TITLES[key] ?? key}
                      </span>
                    </label>
                    <button
                      type="button"
                      aria-label={`Move ${SECTION_TITLES[key] ?? key} up`}
                      disabled={i === 0}
                      onClick={() => move(key, -1)}
                      className="inline-flex h-11 w-9 items-center justify-center rounded-sm text-ink-faint hover:bg-[--surface-2] disabled:opacity-30"
                    >
                      <ChevronUp size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${SECTION_TITLES[key] ?? key} down`}
                      disabled={i === list.length - 1}
                      onClick={() => move(key, 1)}
                      className="inline-flex h-11 w-9 items-center justify-center rounded-sm text-ink-faint hover:bg-[--surface-2] disabled:opacity-30"
                    >
                      <ChevronDown size={15} aria-hidden />
                    </button>
                  </li>
                ))}
            </ul>
          </Card>

          <VersionPanel documentId={docId} versions={versions} />

          <div className="flex flex-wrap gap-2">
            <a href={`/print/${docId}`} target="_blank" rel="noreferrer">
              <Button variant="secondary">
                <Printer size={16} aria-hidden /> Print view
              </Button>
            </a>
            <a href={`/api/documents/${docId}/pdf`}>
              <Button>
                <Download size={16} aria-hidden /> Download PDF
              </Button>
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!confirm("Delete this document? Your profile data is not affected.")) return
              start(async () => {
                const res = await deleteDocument(docId)
                if (res.ok) router.push("/dashboard/resume")
              })
            }}
            className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-[--danger]"
          >
            <Trash2 size={14} aria-hidden /> Delete this document
          </button>
        </div>
      </div>

      {/* Preview */}
      <div
        className={cn(
          "min-w-0 flex-1 bg-[--surface-2] lg:overflow-y-auto",
          tab === "preview" ? "block" : "hidden lg:block",
        )}
      >
        <div className="p-4 sm:p-8">
          <ScaledPreview paper={config.paper}>{preview}</ScaledPreview>
        </div>
      </div>

      {/* Mobile switch */}
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
