import Link from "next/link"
import { notFound } from "next/navigation"
import { AlertTriangle, ArrowRight, Check, Info } from "lucide-react"
import { requirePage } from "@/lib/auth"
import { loadFullProfile } from "@/lib/profile/load"
import { reviewProfile, type Severity } from "@/lib/review"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const TONE: Record<Severity, { label: string; className: string; Icon: typeof Info }> = {
  high: { label: "Fix this", className: "text-[--danger] border-l-[--danger]", Icon: AlertTriangle },
  medium: { label: "Worth fixing", className: "text-[--warning] border-l-[--warning]", Icon: Info },
  low: { label: "Minor", className: "text-ink-faint border-l-[--line]", Icon: Info },
}

export default async function ReviewPage() {
  const user = await requirePage()
  const data = await loadFullProfile(user.id)
  if (!data) notFound()

  const review = reviewProfile(data)

  return (
    <>
      <PageHeader
        title="Profile review"
        blurb="What someone reading a hundred applications would notice about yours, in the first ten seconds."
      />
      <Section>
        <div className="max-w-3xl space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-ink-soft">Review score</p>
              <p className="text-3xl font-semibold tabular-nums" data-tabular>
                {review.score}
                <span className="text-lg text-ink-faint">/100</span>
              </p>
            </div>
            <p className="max-w-sm text-sm text-ink-soft">
              {review.findings.length === 0
                ? "Nothing stands out as a problem. That is rarer than you would think."
                : `${review.findings.length} thing${review.findings.length > 1 ? "s" : ""} worth looking at. None of this is scored by an AI — every point below is a specific, checkable rule.`}
            </p>
          </Card>

          {review.findings.map((f) => {
            const tone = TONE[f.severity]
            return (
              <div
                key={f.id}
                className={cn("rounded-md border border-[--line] border-l-2 bg-[--surface] p-4", tone.className)}
              >
                <div className="flex items-start gap-2.5">
                  <tone.Icon size={16} className="mt-0.5 shrink-0" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{f.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{f.detail}</p>
                    <Link
                      href={f.href}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[--accent] hover:underline"
                    >
                      Fix it <ArrowRight size={13} aria-hidden />
                    </Link>
                  </div>
                  <span className="shrink-0 text-xs uppercase tracking-[0.08em]">{tone.label}</span>
                </div>
              </div>
            )
          })}

          {review.passed.length ? (
            <Card>
              <h2 className="text-base font-semibold">Already good</h2>
              <ul className="mt-2 space-y-1">
                {review.passed.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-ink-soft">
                    <Check size={14} className="text-[--success]" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </Section>
    </>
  )
}
