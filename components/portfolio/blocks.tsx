import { formatMonth, formatRange } from "@/lib/utils"
import { publicContact, linksOf, type ProfileData } from "@/lib/profile/load"

/**
 * Shared content blocks. Themes decide layout and typography; these decide
 * what a project, a job or a publication actually says.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

export function ProjectItems({ items, variant }: { items: Any[]; variant: "row" | "card" | "block" }) {
  if (variant === "card") {
    return (
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((p) => (
          <li key={p.id} className="rounded-md border border-[--line] bg-[--surface] p-4">
            <h3 className="font-medium">{p.title}</h3>
            {p.summary ? <p className="mt-1 text-sm text-ink-soft">{p.summary}</p> : null}
            {p.tags?.length ? <Tags tags={p.tags} /> : null}
            <ProjectLinks links={p.links} />
          </li>
        ))}
      </ul>
    )
  }

  if (variant === "block") {
    return (
      <ul className="space-y-10">
        {items.map((p) => (
          <li key={p.id}>
            <h3 className="text-xl font-semibold">{p.title}</h3>
            {p.summary ? <p className="mt-1 text-lg text-ink-soft">{p.summary}</p> : null}
            {p.description ? (
              <p className="mt-3 max-w-measure leading-relaxed">{p.description}</p>
            ) : null}
            {p.outcome ? (
              <p className="mt-2 text-sm font-medium text-[--accent]">{p.outcome}</p>
            ) : null}
            {p.tags?.length ? <Tags tags={p.tags} /> : null}
            <ProjectLinks links={p.links} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="divide-y divide-[--line]">
      {items.map((p) => (
        <li key={p.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="font-medium">{p.title}</h3>
            <span className="text-sm text-ink-faint" data-tabular>
              {formatRange(p.startDate, p.endDate)}
            </span>
          </div>
          {p.summary ? <p className="mt-1 text-ink-soft">{p.summary}</p> : null}
          {p.tags?.length ? <Tags tags={p.tags} /> : null}
          <ProjectLinks links={p.links} />
        </li>
      ))}
    </ul>
  )
}

export function ExperienceItems({ items }: { items: Any[] }) {
  return (
    <ul className="space-y-5">
      {items.map((x) => (
        <li key={x.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="font-medium">{x.role}</h3>
            <span className="text-sm text-ink-faint" data-tabular>
              {formatRange(x.startDate, x.endDate, x.current)}
            </span>
          </div>
          <p className="text-ink-soft">
            {[x.company, x.employment, x.location].filter(Boolean).join(" · ")}
          </p>
          {x.summary ? <p className="mt-1.5">{x.summary}</p> : null}
          {x.bullets?.length ? (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-ink-soft">
              {x.bullets.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function EducationItems({ items }: { items: Any[] }) {
  return (
    <ul className="space-y-4">
      {items.map((e) => (
        <li key={e.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="font-medium">{e.institution}</h3>
            <span className="text-sm text-ink-faint" data-tabular>
              {formatRange(e.startDate, e.endDate, e.current)}
            </span>
          </div>
          <p className="text-ink-soft">
            {[e.degree, e.field].filter(Boolean).join(", ")}
            {e.grade ? ` · ${e.grade}` : ""}
          </p>
          {e.details ? <p className="mt-1 text-sm text-ink-soft">{e.details}</p> : null}
        </li>
      ))}
    </ul>
  )
}

export function SkillItems({ items }: { items: Any[] }) {
  const groups = new Map<string, string[]>()
  for (const s of items) {
    const k = s.category?.trim() || "Skills"
    groups.set(k, [...(groups.get(k) ?? []), s.name])
  }
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {[...groups.entries()].map(([group, names]) => (
        <div key={group}>
          <dt className="text-xs font-medium uppercase tracking-[0.09em] text-ink-faint">{group}</dt>
          <dd className="mt-1">{names.join(" · ")}</dd>
        </div>
      ))}
    </dl>
  )
}

export function PublicationItems({ items }: { items: Any[] }) {
  return (
    <ol className="space-y-3">
      {items.map((p) => (
        <li key={p.id} className="leading-relaxed">
          {p.citation ? (
            p.citation
          ) : (
            <>
              {p.authors?.length ? `${p.authors.join(", ")}. ` : null}
              <span className="font-medium">{p.title}</span>
              {p.venue ? `. ${p.venue}` : null}
              {p.year ? `, ${p.year}` : null}
            </>
          )}
          {p.url || p.doi ? (
            <a
              href={p.url ?? `https://doi.org/${p.doi}`}
              className="ml-1 text-[--accent] hover:underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              link
            </a>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

export function ServiceItems({ items }: { items: Any[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((s) => (
        <li key={s.id} className="rounded-md border border-[--line] bg-[--surface] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-medium">{s.title}</h3>
            {s.priceNote ? <span className="text-sm text-ink-faint">{s.priceNote}</span> : null}
          </div>
          {s.description ? <p className="mt-1.5 text-ink-soft">{s.description}</p> : null}
          {s.deliverable ? (
            <p className="mt-2 text-sm text-ink-faint">You get: {s.deliverable}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function CaseStudyItems({ items }: { items: Any[] }) {
  return (
    <ul className="space-y-8">
      {items.map((c) => (
        <li key={c.id}>
          <h3 className="text-lg font-semibold">{c.title}</h3>
          {c.client ? <p className="text-sm text-ink-faint">{c.client}</p> : null}
          <dl className="mt-3 space-y-2">
            {[
              ["The problem", c.problem],
              ["What I did", c.approach],
              ["What changed", c.outcome],
            ]
              .filter(([, v]) => Boolean(v))
              .map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-xs font-medium uppercase tracking-[0.09em] text-ink-faint">
                    {label}
                  </dt>
                  <dd className="max-w-measure leading-relaxed">{value as string}</dd>
                </div>
              ))}
          </dl>
        </li>
      ))}
    </ul>
  )
}

export function TestimonialItems({ items }: { items: Any[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((t) => (
        <li key={t.id} className="rounded-md border border-[--line] bg-[--surface] p-4">
          <blockquote className="leading-relaxed">“{t.quote}”</blockquote>
          <p className="mt-2 text-sm text-ink-faint">
            — {[t.author, t.role, t.company].filter(Boolean).join(", ")}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function SimpleItems({ sectionKey, items }: { sectionKey: string; items: Any[] }) {
  return (
    <ul className="space-y-3">
      {items.map((raw) => {
        const { title, subtitle, date, note } = shape(sectionKey, raw)
        return (
          <li key={raw.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="font-medium">{title}</h3>
              {date ? (
                <span className="text-sm text-ink-faint" data-tabular>
                  {formatMonth(date)}
                </span>
              ) : null}
            </div>
            {subtitle ? <p className="text-ink-soft">{subtitle}</p> : null}
            {note ? <p className="mt-1 text-sm text-ink-soft">{note}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}

function shape(key: string, item: Any) {
  switch (key) {
    case "certifications":
      return { title: item.name, subtitle: item.issuer, date: item.issueDate, note: null }
    case "achievements":
      return { title: item.title, subtitle: item.issuer, date: item.date, note: item.description }
    case "research":
      return {
        title: item.title,
        subtitle: [item.institution, item.status].filter(Boolean).join(" · "),
        date: item.endDate ?? item.startDate,
        note: item.abstract,
      }
    case "conferences":
      return {
        title: item.title,
        subtitle: [item.event, item.role, item.location].filter(Boolean).join(" · "),
        date: item.date,
        note: null,
      }
    default:
      return { title: item.title ?? item.name, subtitle: null, date: null, note: null }
  }
}

/**
 * The profile photo. It was stored and counted towards completeness from the
 * start but never displayed anywhere — a user could be told to add a photo
 * they would then never see. Themes that suit one show it here.
 */
export function Avatar({
  profile,
  size = 96,
  rounded = "full",
}: {
  profile: { photoUrl: string | null; fullName: string } | null | undefined
  size?: number
  rounded?: "full" | "md" | "none"
}) {
  if (!profile) return null
  const radius = rounded === "full" ? "9999px" : rounded === "md" ? "8px" : "0"

  if (!profile.photoUrl) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size, borderRadius: radius, fontSize: size * 0.32 }}
        className="flex shrink-0 items-center justify-center bg-[--accent-soft] font-semibold text-[--accent]"
      >
        {initialsOf(profile.fullName)}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profile.photoUrl}
      alt={profile.fullName}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: radius }}
      className="shrink-0 object-cover"
    />
  )
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

export function ContactBlock({ data }: { data: ProfileData }) {
  const c = publicContact(data.profile)
  const links = linksOf(data.profile)
  const entries = Object.entries(links).filter(([, v]) => Boolean(v))

  return (
    <div className="space-y-3">
      {c.email ? (
        <p>
          <a href={`mailto:${c.email}`} className="text-[--accent] hover:underline">
            {c.email}
          </a>
        </p>
      ) : null}
      {c.phone ? <p>{c.phone}</p> : null}
      {c.showLocation && data.profile?.location ? (
        <p className="text-ink-soft">{data.profile.location}</p>
      ) : null}
      {entries.length ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {entries.map(([k, v]) => (
            <li key={k}>
              <a
                href={v}
                target="_blank"
                rel="noreferrer noopener me"
                className="text-[--accent] hover:underline"
              >
                {k}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function SectionContent({
  sectionKey,
  items,
  data,
  projectVariant = "row",
}: {
  sectionKey: string
  items: Any[]
  data: ProfileData
  projectVariant?: "row" | "card" | "block"
}) {
  switch (sectionKey) {
    case "about":
      return (
        <p className="max-w-measure whitespace-pre-line text-lg leading-relaxed">
          {data.profile?.about}
        </p>
      )
    case "projects":
      return <ProjectItems items={items} variant={projectVariant} />
    case "experience":
      return <ExperienceItems items={items} />
    case "education":
      return <EducationItems items={items} />
    case "skills":
      return <SkillItems items={items} />
    case "publications":
      return <PublicationItems items={items} />
    case "services":
      return <ServiceItems items={items} />
    case "caseStudies":
      return <CaseStudyItems items={items} />
    case "testimonials":
      return <TestimonialItems items={items} />
    case "contact":
      return <ContactBlock data={data} />
    default:
      return <SimpleItems sectionKey={sectionKey} items={items} />
  }
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <li
          key={t}
          className="rounded-sm border border-[--line] px-1.5 py-0.5 text-xs text-ink-soft"
        >
          {t}
        </li>
      ))}
    </ul>
  )
}

function ProjectLinks({ links }: { links?: Record<string, string> | null }) {
  const entries = Object.entries(links ?? {}).filter(([, v]) => Boolean(v))
  if (!entries.length) return null
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4">
      {entries.map(([k, v]) => (
        <li key={k}>
          <a
            href={v}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm text-[--accent] hover:underline"
          >
            {k === "repo" ? "Code" : k === "live" ? "Live" : k}
          </a>
        </li>
      ))}
    </ul>
  )
}
