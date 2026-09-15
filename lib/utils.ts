import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "Jun 2024", or "Present" for a current role. */
export function formatMonth(d: Date | string | null | undefined): string {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

export function formatRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
  current?: boolean,
): string {
  const s = formatMonth(start)
  const e = current ? "Present" : formatMonth(end)
  if (!s && !e) return ""
  if (!s) return e
  if (!e) return s
  return `${s} — ${e}`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

/** Month input value ("2024-06") from a stored Date. */
export function toMonthInput(d: Date | string | null | undefined): string {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return ""
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
}
