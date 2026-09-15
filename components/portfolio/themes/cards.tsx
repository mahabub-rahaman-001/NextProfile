import { Avatar, SectionContent } from "../blocks"
import { PoweredBy, type ThemeProps } from "./types"

/**
 * CARDS — every section is a panel on a tinted ground.
 *
 * Dense and scannable rather than narrative: good for a profile with many
 * short sections, where a single long column would read as a wall.
 */
export function CardsTheme({ data, sections, accent }: ThemeProps) {
  const p = data.profile!

  // Sections that stay narrow read better beside a wider neighbour.
  const NARROW = new Set(["skills", "certifications", "contact", "achievements", "conferences"])

  return (
    <main className="bg-[--surface-2]" style={{ ["--accent" as string]: accent }}>
      <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <header className="rounded-md border border-[--line] bg-[--surface] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar profile={p} size={88} rounded="md" />
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight">{p.fullName}</h1>
              {p.headline ? <p className="mt-1 text-lg text-ink-soft">{p.headline}</p> : null}
              {p.location ? <p className="mt-1 text-sm text-ink-faint">{p.location}</p> : null}
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {sections.map((s) => (
            <section
              key={s.key}
              id={s.key}
              className={`rounded-md border border-[--line] bg-[--surface] p-5 sm:p-6 ${
                NARROW.has(s.key) ? "" : "md:col-span-2"
              }`}
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em]">
                <span className="h-3 w-1 rounded-full" style={{ background: accent }} aria-hidden />
                {s.title}
              </h2>
              <SectionContent
                sectionKey={s.key}
                items={s.items as never[]}
                data={data}
                projectVariant="row"
              />
            </section>
          ))}
        </div>

        <PoweredBy />
      </div>
    </main>
  )
}
