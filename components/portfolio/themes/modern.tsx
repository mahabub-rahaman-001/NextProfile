import { SectionContent } from "../blocks"
import { PoweredBy, type ThemeProps } from "./types"

/** MODERN — large hero, generous rhythm, projects as full blocks. */
export function ModernTheme({ data, sections, accent }: ThemeProps) {
  const p = data.profile!
  const about = sections.find((s) => s.key === "about")
  const rest = sections.filter((s) => s.key !== "about")

  return (
    <main style={{ ["--accent" as string]: accent }}>
      <header className="border-b border-[--line] px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="h-1 w-12 rounded-full" style={{ background: accent }} />
          <h1 className="mt-6 text-[clamp(2.25rem,7vw,4rem)] font-semibold leading-[1.03] tracking-tight">
            {p.fullName}
          </h1>
          {p.headline ? (
            <p className="mt-3 max-w-measure text-xl text-ink-soft">{p.headline}</p>
          ) : null}
          {about ? (
            <p className="mt-8 max-w-measure whitespace-pre-line text-lg leading-relaxed">
              {p.about}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-20 px-5 py-20">
        {rest.map((s) => (
          <section key={s.key} id={s.key}>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: accent }}>
              {s.title}
            </h2>
            <SectionContent
              sectionKey={s.key}
              items={s.items as never[]}
              data={data}
              projectVariant="block"
            />
          </section>
        ))}
        <PoweredBy />
      </div>
    </main>
  )
}
