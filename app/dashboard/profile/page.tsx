import Link from "next/link"
import { ChevronRight, Plus } from "lucide-react"
import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { getModules } from "@/lib/modules"
import { modulesWithData } from "@/lib/completeness/recompute"
import { MODULE_LABELS, type ModuleKey } from "@/lib/types"
import { MODULE_TO_SLUG } from "@/lib/sections/registry"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { Eyebrow } from "@/components/ui/card"

/**
 * Only the modules that match this profile type are shown. The rest sit under
 * "Add a section" — never removed, never forbidden.
 */
export default async function ProfilePage() {
  const user = await requirePage()
  const profile = await db.profile.findUnique({ where: { userId: user.id } })
  const filled = await modulesWithData(user.id)
  const modules = getModules(profile!.profileType, profile?.discipline, filled)

  const counts = await countAll(user.id)

  return (
    <>
      <PageHeader
        title="Your profile"
        blurb="Enter it once. Everything you publish is built from this."
      />

      <Section>
        <ul className="divide-y divide-[--line] rounded-md border border-[--line] bg-[--surface]">
          <li>
            <Row
              href="/dashboard/profile/basics"
              label="Basic information"
              hint="Name, headline, about, contact, links"
              count={null}
            />
          </li>
          {modules.visible
            .filter((m): m is Exclude<ModuleKey, "basics"> => m !== "basics")
            .map((m) => (
              <li key={m}>
                <Row
                  href={`/dashboard/profile/${MODULE_TO_SLUG[m]}`}
                  label={MODULE_LABELS[m]}
                  count={counts[m] ?? 0}
                />
              </li>
            ))}
        </ul>

        {modules.available.length ? (
          <div className="mt-8">
            <Eyebrow>Add a section</Eyebrow>
            <p className="mt-1 max-w-measure text-sm text-ink-soft">
              Not shown by default for your profile type, but yours if you want them.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {modules.available
                .filter((m): m is Exclude<ModuleKey, "basics"> => m !== "basics")
                .map((m) => (
                  <li key={m}>
                    <Link
                      href={`/dashboard/profile/${MODULE_TO_SLUG[m]}`}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border border-[--line] bg-[--surface] px-3 text-sm hover:bg-[--surface-2]"
                    >
                      <Plus size={14} aria-hidden /> {MODULE_LABELS[m]}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {modules.hidden.length ? (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-ink-faint hover:text-ink">
              Show everything else ({modules.hidden.length})
            </summary>
            <ul className="mt-3 flex flex-wrap gap-2">
              {modules.hidden
                .filter((m): m is Exclude<ModuleKey, "basics"> => m !== "basics")
                .map((m) => (
                  <li key={m}>
                    <Link
                      href={`/dashboard/profile/${MODULE_TO_SLUG[m]}`}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border border-dashed border-[--line] px-3 text-sm text-ink-soft hover:bg-[--surface-2]"
                    >
                      <Plus size={14} aria-hidden /> {MODULE_LABELS[m]}
                    </Link>
                  </li>
                ))}
            </ul>
          </details>
        ) : null}
      </Section>
    </>
  )
}

function Row({
  href,
  label,
  hint,
  count,
}: {
  href: string
  label: string
  hint?: string
  count: number | null
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-3 hover:bg-[--surface-2]"
    >
      <span className="min-w-0">
        <span className="block font-medium">{label}</span>
        {hint ? <span className="block text-sm text-ink-faint">{hint}</span> : null}
      </span>
      <span className="flex shrink-0 items-center gap-2 text-sm text-ink-faint">
        {count !== null ? (
          <span data-tabular>{count === 0 ? "Empty" : count}</span>
        ) : null}
        <ChevronRight size={16} aria-hidden />
      </span>
    </Link>
  )
}

async function countAll(userId: string): Promise<Partial<Record<ModuleKey, number>>> {
  const w = { userId, deletedAt: null }
  const [
    education, experience, skills, projects, certifications, achievements,
    publications, research, conferences, services, caseStudies, testimonials,
  ] = await Promise.all([
    db.education.count({ where: w }),
    db.experience.count({ where: w }),
    db.skill.count({ where: w }),
    db.project.count({ where: w }),
    db.certification.count({ where: w }),
    db.achievement.count({ where: w }),
    db.publication.count({ where: w }),
    db.research.count({ where: w }),
    db.conference.count({ where: w }),
    db.service.count({ where: w }),
    db.caseStudy.count({ where: w }),
    db.testimonial.count({ where: w }),
  ])
  return {
    education, experience, skills, projects, certifications, achievements,
    publications, research, conferences, services, caseStudies, testimonials,
  }
}
