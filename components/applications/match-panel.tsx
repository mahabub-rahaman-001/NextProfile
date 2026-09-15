"use client"

import { cn } from "@/lib/utils"
import type { MatchResult } from "@/lib/matching"

/**
 * The score is overlap with the posted text — nothing more. The disclaimer is
 * part of the component, not an afterthought a designer can remove.
 */
export function MatchPanel({ result }: { result: MatchResult }) {
  const tone =
    result.score >= 70 ? "text-[--success]" : result.score >= 40 ? "text-[--warning]" : "text-[--danger]"

  return (
    <div className="space-y-4 rounded-md border border-[--line] bg-[--surface] p-4">
      <div className="flex items-baseline gap-3">
        <span className={cn("text-3xl font-semibold tabular-nums", tone)} data-tabular>
          {result.score}%
        </span>
        <span className="text-sm text-ink-soft">
          of this ad&rsquo;s language is already in your profile
        </span>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[--surface-2]"
        role="progressbar"
        aria-valuenow={result.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Overlap with the job description"
      >
        <div className="h-full rounded-full bg-[--accent]" style={{ width: `${result.score}%` }} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-medium uppercase tracking-[0.09em] text-[--accent]">
            You already cover
          </h4>
          {result.matched.length === 0 ? (
            <p className="mt-1.5 text-sm text-ink-faint">Nothing yet.</p>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {result.matched.slice(0, 10).map((m) => (
                <li key={m.term} className="text-sm">
                  <span className="font-medium">{m.term}</span>
                  {m.where ? <span className="text-ink-faint"> — from {m.where}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-xs font-medium uppercase tracking-[0.09em] text-[--warning]">
            Not in your profile
          </h4>
          {result.missing.length === 0 ? (
            <p className="mt-1.5 text-sm text-ink-faint">Nothing missing.</p>
          ) : (
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {result.missing.map((m) => (
                <li
                  key={m.term}
                  className="rounded-sm border border-[--line] px-1.5 py-0.5 text-xs text-ink-soft"
                >
                  {m.term}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {result.suggestions.length ? (
        <ul className="space-y-1.5 border-t border-[--line] pt-3">
          {result.suggestions.map((s, i) => (
            <li key={i} className="text-sm text-ink-soft">
              · {s}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="border-t border-[--line] pt-3 text-xs text-ink-faint">{result.disclaimer}</p>
    </div>
  )
}
