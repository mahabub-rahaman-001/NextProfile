"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

/**
 * Label, helper line, error, length guidance and the AI slot in one place.
 * Rule 4 of the design rules: give examples for fields people hesitate on.
 */
export function FieldWrapper({
  label,
  help,
  error,
  required,
  words,
  targetWords,
  action,
  className,
  children,
}: {
  label: string
  help?: string
  error?: string
  required?: boolean
  words?: number
  targetWords?: [number, number]
  action?: React.ReactNode
  className?: string
  children: (props: { id: string; "aria-describedby": string | undefined }) => React.ReactNode
}) {
  const id = useId()
  const helpId = help || error || targetWords ? `${id}-desc` : undefined
  const inRange =
    targetWords && words !== undefined
      ? words >= targetWords[0] && words <= targetWords[1]
      : undefined

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required ? <span className="ml-1 text-[--danger]">*</span> : null}
        </label>
        {action}
      </div>

      {children({ id, "aria-describedby": helpId })}

      <div id={helpId} className="flex flex-wrap items-baseline justify-between gap-2">
        {error ? (
          // role="alert" so a screen reader announces a failed save. Without it
          // the message appears silently and the user is left waiting.
          <p role="alert" className="text-xs text-[--danger]">
            {error}
          </p>
        ) : help ? (
          <p className="text-xs text-ink-faint">{help}</p>
        ) : (
          <span />
        )}
        {targetWords ? (
          <p
            className={cn("text-xs tabular-nums", inRange ? "text-[--success]" : "text-ink-faint")}
            data-tabular
          >
            {words ?? 0} words · {targetWords[0]}–{targetWords[1]} reads best
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function countWords(s: string | undefined | null): number {
  return (s ?? "").trim().split(/\s+/).filter(Boolean).length
}
