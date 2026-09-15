import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md border border-[--line] bg-[--surface] p-4 sm:p-5", className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold", className)} {...props} />
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-sm font-medium text-ink", className)} {...props} />
}

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-xs font-medium uppercase tracking-[0.09em] text-[--ink-faint]",
        className,
      )}
      {...props}
    />
  )
}

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "accent" | "warning" | "danger" }) {
  const tones = {
    neutral: "border-[--line] text-[--ink-soft] bg-[--surface]",
    accent: "border-[--accent] text-[--accent] bg-[--accent-soft]",
    warning: "border-[--warning] text-[--warning]",
    danger: "border-[--danger] text-[--danger]",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

export function EmptyState({
  title,
  line,
  action,
}: {
  title: string
  line: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-dashed border-[--line] p-6 text-center">
      <p className="text-base font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-measure text-sm text-ink-soft">{line}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
