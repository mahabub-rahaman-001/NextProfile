import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export function PageHeader({
  title,
  blurb,
  back,
  action,
}: {
  title: string
  blurb?: string
  back?: { href: string; label: string }
  action?: React.ReactNode
}) {
  return (
    <header className="border-b border-[--line] px-5 py-6 sm:px-8">
      {back ? (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
        >
          <ChevronLeft size={15} aria-hidden /> {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {blurb ? <p className="mt-1 max-w-measure text-sm text-ink-soft">{blurb}</p> : null}
        </div>
        {action}
      </div>
    </header>
  )
}

export function Section({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-6 sm:px-8">{children}</div>
}
