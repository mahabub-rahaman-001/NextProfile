import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MODULE_TO_SLUG } from "@/lib/sections/registry"
import type { CompletenessResult } from "@/lib/completeness"
import type { ModuleKey } from "@/lib/types"

/**
 * "Add one project (+20%)" outperforms "Your profile is incomplete."
 * Always name the two highest-value missing items, and link straight to them.
 */
export function CompletenessCard({ result }: { result: CompletenessResult }) {
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">Your profile</h2>
        <span className="text-2xl font-semibold tabular-nums" data-tabular>
          {result.score}%
        </span>
      </div>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[--surface-2]"
        role="progressbar"
        aria-valuenow={result.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completeness"
      >
        <div className="h-full rounded-full bg-[--accent]" style={{ width: `${result.score}%` }} />
      </div>

      {result.missing.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">
          Everything that matters for your profile type is filled in. Nice.
        </p>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {result.missing.map((m) => (
            <li key={m.key}>
              <Link
                href={hrefFor(m.key)}
                className="group flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-[--surface-2]"
              >
                <span>
                  Add {article(m.label)} <span className="font-medium">{m.label.toLowerCase()}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 font-medium text-[--accent]" data-tabular>
                  +{m.gain}%
                  <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function hrefFor(key: ModuleKey) {
  if (key === "basics") return "/dashboard/profile/basics"
  return `/dashboard/profile/${MODULE_TO_SLUG[key]}`
}

function article(label: string) {
  return /^[aeiou]/i.test(label) ? "an" : "a"
}
