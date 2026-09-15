"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, Undo2, X, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Select, Textarea } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/card"
import { FieldWrapper, countWords } from "@/components/forms/field-wrapper"
import { SECTION_UI, type FieldDef } from "@/components/profile/section-fields"
import { createItem, deleteItem, moveItem, restoreItem, updateItem } from "@/app/actions/sections"
import { formatRange, toMonthInput } from "@/lib/utils"
import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>

/**
 * One list, twelve sections. Add / edit / delete / reorder / undo — built once
 * here so every record module is configuration rather than new code.
 */
export function SectionEditor({ slug, items }: { slug: string; items: Item[] }) {
  const ui = SECTION_UI[slug]
  const router = useRouter()
  const [pending, start] = useTransition()
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(items.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [deleted, setDeleted] = useState<{ id: string; label: string } | null>(null)

  if (!ui) return null

  const refresh = () => router.refresh()

  function submit(values: Item, id?: string) {
    setError(null)
    start(async () => {
      const res = id ? await updateItem(slug, id, values) : await createItem(slug, values)
      if (!res.ok) {
        setError(res.message)
        return
      }
      setEditing(null)
      setAdding(false)
      refresh()
    })
  }

  function remove(item: Item) {
    start(async () => {
      const res = await deleteItem(slug, item.id)
      if (!res.ok) {
        setError(res.message)
        return
      }
      setDeleted({ id: item.id, label: String(item[ui.summary.title] ?? ui.item) })
      refresh()
    })
  }

  function undo() {
    if (!deleted) return
    start(async () => {
      await restoreItem(slug, deleted.id)
      setDeleted(null)
      refresh()
    })
  }

  function move(id: string, direction: "up" | "down") {
    start(async () => {
      await moveItem(slug, id, direction)
      refresh()
    })
  }

  return (
    <div className="space-y-3">
      {deleted ? (
        <div className="flex items-center justify-between gap-3 rounded-sm border border-[--line] bg-[--surface-2] px-3 py-2 text-sm">
          <span className="truncate">Deleted “{deleted.label}”.</span>
          <button
            type="button"
            onClick={undo}
            className="inline-flex shrink-0 items-center gap-1 font-medium text-[--accent] hover:underline"
          >
            <Undo2 size={14} aria-hidden /> Undo
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]">
          {error}
        </p>
      ) : null}

      {items.length === 0 && !adding ? (
        <EmptyState
          title={`No ${ui.title.toLowerCase()} yet`}
          line={ui.blurb}
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus size={16} aria-hidden /> Add {ui.item}
            </Button>
          }
        />
      ) : null}

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={item.id} className="rounded-md border border-[--line] bg-[--surface]">
            {editing === item.id ? (
              <ItemForm
                ui={ui.fields}
                initial={item}
                busy={pending}
                onCancel={() => setEditing(null)}
                onSubmit={(v) => submit(v, item.id)}
              />
            ) : (
              <div className="flex items-start gap-2 p-3 sm:p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{String(item[ui.summary.title] ?? "Untitled")}</p>
                  <p className="truncate text-sm text-ink-soft">
                    {(ui.summary.subtitle ?? [])
                      .map((k) => item[k])
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-faint" data-tabular>
                    {ui.summary.range
                      ? formatRange(
                          item[ui.summary.range.start],
                          item[ui.summary.range.end],
                          ui.summary.range.current ? item[ui.summary.range.current] : false,
                        )
                      : null}
                    {ui.summary.meta && item[ui.summary.meta]
                      ? `${ui.summary.range ? " · " : ""}${String(item[ui.summary.meta]).slice(0, 80)}`
                      : null}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                  <IconButton
                    label="Move up"
                    disabled={i === 0 || pending}
                    onClick={() => move(item.id, "up")}
                  >
                    <ChevronUp size={16} aria-hidden />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    disabled={i === items.length - 1 || pending}
                    onClick={() => move(item.id, "down")}
                  >
                    <ChevronDown size={16} aria-hidden />
                  </IconButton>
                  <IconButton label="Edit" onClick={() => setEditing(item.id)} disabled={pending}>
                    <Pencil size={15} aria-hidden />
                  </IconButton>
                  <IconButton label="Delete" onClick={() => remove(item)} disabled={pending}>
                    <Trash2 size={15} aria-hidden />
                  </IconButton>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="rounded-md border border-[--accent] bg-[--surface]">
          <ItemForm
            ui={ui.fields}
            initial={{}}
            busy={pending}
            onCancel={() => setAdding(false)}
            onSubmit={(v) => submit(v)}
          />
        </div>
      ) : items.length > 0 ? (
        <Button variant="secondary" onClick={() => setAdding(true)} disabled={pending}>
          <Plus size={16} aria-hidden /> Add another {ui.item}
        </Button>
      ) : null}
    </div>
  )
}

function IconButton({
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-faint hover:bg-[--surface-2] hover:text-ink disabled:opacity-30"
      {...props}
    >
      {children}
    </button>
  )
}

function ItemForm({
  ui,
  initial,
  busy,
  onSubmit,
  onCancel,
}: {
  ui: FieldDef[]
  initial: Item
  busy: boolean
  onSubmit: (values: Item) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<Item>(() => hydrate(ui, initial))
  const set = (name: string, v: unknown) => setValues((p) => ({ ...p, [name]: v }))

  return (
    <form
      className="space-y-4 p-3 sm:p-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(serialise(ui, values))
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {ui.map((f) => (
          <div key={f.name} className={cn(f.half ? "sm:col-span-1" : "sm:col-span-2")}>
            {f.type === "checkbox" ? (
              <label className="flex min-h-[44px] items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(values[f.name])}
                  onChange={(e) => set(f.name, e.target.checked)}
                  className="h-4 w-4 accent-[--accent]"
                />
                {f.label}
              </label>
            ) : (
              <FieldWrapper
                label={f.label}
                help={f.help}
                required={f.required}
                targetWords={f.targetWords}
                words={f.targetWords ? countWords(values[f.name]) : undefined}
              >
                {(p) => renderControl(f, values[f.name], (v) => set(f.name, v), p)}
              </FieldWrapper>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
          <X size={16} aria-hidden /> Cancel
        </Button>
      </div>
    </form>
  )
}

function renderControl(
  f: FieldDef,
  value: unknown,
  onChange: (v: unknown) => void,
  props: { id: string; "aria-describedby": string | undefined },
) {
  const common = { ...props, placeholder: f.placeholder }
  switch (f.type) {
    case "textarea":
      return (
        <Textarea
          {...common}
          rows={f.rows ?? 4}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case "bullets":
      return (
        <Textarea
          {...common}
          rows={f.rows ?? 5}
          value={Array.isArray(value) ? value.join("\n") : ((value as string) ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"One point per line"}
        />
      )
    case "tags":
      return (
        <Input
          {...common}
          value={Array.isArray(value) ? value.join(", ") : ((value as string) ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case "month":
      return (
        <Input
          {...common}
          type="month"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case "number":
      return (
        <Input
          {...common}
          type="number"
          value={(value as string | number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      )
    case "select":
      return (
        <Select {...props} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          {(f.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      )
    case "images":
      return <ImageUploader value={(value as UploadedImage[]) ?? []} onChange={onChange} />
    default:
      return (
        <Input {...common} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )
  }
}

/** Database row → form values. */
function hydrate(fields: FieldDef[], row: Item): Item {
  const out: Item = {}
  for (const f of fields) {
    const v = row[f.name]
    if (f.type === "month") out[f.name] = toMonthInput(v)
    else if (f.type === "tags" || f.type === "bullets" || f.type === "images") out[f.name] = Array.isArray(v) ? v : []
    else if (f.type === "checkbox") out[f.name] = Boolean(v)
    else out[f.name] = v ?? ""
  }
  return out
}

/** Form values → API payload (Zod does the rest). */
function serialise(fields: FieldDef[], values: Item): Item {
  const out: Item = {}
  for (const f of fields) {
    const v = values[f.name]
    if (f.type === "tags") {
      out[f.name] = typeof v === "string" ? splitList(v) : Array.isArray(v) ? v : []
    } else if (f.type === "bullets") {
      out[f.name] =
        typeof v === "string"
          ? v.split("\n").map((s) => s.trim()).filter(Boolean)
          : Array.isArray(v)
            ? v
            : []
    } else if (f.type === "number") {
      out[f.name] = v === "" || v === null || v === undefined ? null : Number(v)
    } else {
      out[f.name] = v
    }
  }
  return out
}

function splitList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
}

/** Matches the `images` entries in projectSchema and caseStudySchema. */
type UploadedImage = { url: string; alt?: string; width?: number; height?: number }

function ImageUploader({
  value,
  onChange,
}: {
  value: UploadedImage[]
  onChange: (v: UploadedImage[]) => void
}) {
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok) {
        onChange([...value, { url: data.url, alt: file.name }])
      }
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  function removeImage(index: number) {
    const next = [...value]
    next.splice(index, 1)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((img, i) => (
            <div key={i} className="group relative aspect-video overflow-hidden rounded-md border border-[--line] bg-[--surface-2]">
              <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[--line] bg-[--surface-2] px-4 py-2 text-sm font-medium hover:bg-[--surface-3] hover:text-ink disabled:opacity-50">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading…" : "Add image"}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleUpload} />
        </label>
        <p className="text-xs text-ink-faint">Maximum 5MB per image.</p>
      </div>
    </div>
  )
}

